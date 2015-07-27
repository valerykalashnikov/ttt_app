require_relative 'player'
require_relative 'game'

require 'sinatra/base'
require "sinatra/reloader"
require 'json'

require 'rabl'

class TicTacToe < Sinatra::Base
  use Rack::Session::Pool, expire_after: 64800, secret: '*&(^B234' unless test?

  configure :development do
    register Sinatra::Reloader
  end

  Rabl.register!

  set :root, File.dirname(__FILE__)
  set :public_dir, 'public'

  get '/' do
    send_file 'index.html'
  end

  # Handles a request to create game with two players,
  # saves new game to the session and respond by JSON
  # POST /game/create
  # @param player1
  # @param player2
  # format::
  #   A hash with two players. This should be request body
  #   looks like:
  #    {player1:"Bob", player2: "Frank"}
  #
  # == Returns:
  # A Rabl rendered JSON containing
  #   1.alpfanumeric game id and current player with status 200
  #   
  #   2.rendered error message with status 422

  post '/v1/game/create', provides: :json do
    request_payload = JSON.parse request.body.read
    player1 = Player.new({turn: "X", name: request_payload["player1"]})
    player2 = Player.new({turn: "O", name: request_payload["player2"]})
    begin
      @game = Game.new([player1, player2])
      session[:"game_#{@game.id}"] = @game
      rabl :game
    rescue PlayersMustHaveNames => e
      render_error(e)
    end
  end

  # Handles a request to set cell on board,
  # Switches players and send the "winner" and "draw" if game over.
  #  == Parameters:
  # format::
  #   A hash with two players. Thisshould be request body
  #   looks like {player1:"Bob", player2: "Frank"}
  #
  # == Returns:
  # A Rabl rendered JSON containing
  #   1.alpfanumeric game id and current player with status 200
  #    game:
  #      id:
  #      player:
  #        turn:
  #        name:
  #   2.rendered error message with status 422
  #     errors:
  #       
  patch '/v1/game/:id/get-move', provides: :json do
    request_payload = JSON.parse request.body.read
    game = session[:"game_#{params[:id]}"]
    board = set_position game, request_payload["position"]
    @state = board.game_over
    game.switch_players unless @state
    @player = game.current_player
    rabl :get_move
  end

  # Handles a request to delete game from session
  #  == Parameters:
  # format::
  #   params hash containing alpanumeric game id
  #
  # == Returns:
  # response with 204 status and no content
  delete '/v1/game/:id' do
    session.delete :"game_#{params[:id]}"
    status 204
  end

  private

  def render_error exception
    @message = exception.message
    status 422
    rabl :errors, :format => "json"
  end

  def set_position game, human_move
    current_player = game.current_player
    x,y = game.get_move(human_move)
    board = game.board
    board.set_cell(x, y, current_player.turn)
    board
  end
end
