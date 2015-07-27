ENV['RACK_ENV'] = 'test'

require_relative '../app/main.rb'  # <-- your sinatra app
require 'rspec'
require 'rack/test'

describe 'The TicTacToe App' do
  include Rack::Test::Methods
  include RSpec::Mocks::ExampleMethods

  def app
    @app = TicTacToe
  end

  describe 'game' do
    context "create" do

      let (:session) { {} }
      subject { post '/v1/game/create', data.to_json, {'Content-Type' => 'application/json', 'rack.session' => session} }

      before do
        allow(Player).to receive(:new)
      end

      context "when params valid" do

        before do
          allow(Game).to receive(:new).and_return double("game", id: '123')
          subject
        end

        let(:data) { { "player1" => "bob", "player2" => "frank" } }

        it "creates first player" do
          expect(Player).to have_received(:new).with(turn: 'X', name: 'bob')
        end

        it "creates second player" do
          expect(Player).to have_received(:new).with(turn: 'O', name: 'frank')
        end

        it "creates the game" do
          expect(Game).to have_received(:new) do |arg|
            expect(arg).to be_an Array
            expect(arg.size).to be 2
          end
        end

        it "saves game to the session" do
          expect(session[:"game_123"].id).to eq '123'
        end
      end

      context "when params invalid" do
        let(:data) { { "player1" => "", "player2" => "" } }

        before do
          allow(Game).to receive(:new).and_raise PlayersMustHaveNames
          subject
        end

        it "returns Unprocessable_Entity" do
          expect(last_response.status).to be 422
        end

        it "return non nil response body" do
          expect(last_response.body).not_to be_empty
        end
      end
    end

    context "delete" do
      let(:session) { {:game_123 => double} }

      subject { delete '/v1/game/123', {}, {'Content-Type' => 'application/json', 'rack.session' => session} }
      before {subject}

      it "delete game from session" do
        expect(session[:game_123]).to be_nil
      end

      it "returns No content" do
        expect(last_response.status).to be 204
      end
    end

    context "get move" do
      let(:data) { { "position" => "1"} }
      let (:session) { {:"game_#{game.id}" => game} }
      let (:game) { double("game", id: '123') }

      before do
        allow(game).to receive(:switch_players)
        allow(game).to receive(:current_player)
        allow_any_instance_of(app).to receive(:set_position).and_return board
        subject
      end

      subject { patch "/v1/game/#{game.id}/get-move", data.to_json, {'Content-Type' => 'application/json', 'rack.session' => session} }

      context "when game not overed" do
        let (:board) { double("board", game_over: false)}

        it "change players" do
          expect(game).to have_received(:switch_players)
        end

      end

      context "when game overed" do
        let (:board) { double("board", game_over: :winner)}
        it "change not players(current player is winner)" do
          expect(game).not_to have_received(:switch_players)
        end
      end
    end
  end
end
