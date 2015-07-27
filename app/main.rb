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

  ##
  # Handles a request to create game with two players
  #
  # POST /v1/game/create
  #
  # params:
  #   player1 - Name of the first player
  #   player2 - Name of the second player
  #
  # = Examples
  #
  #   resp = conn.post("/v1/game/create", "player1" => "bob", "player2" => "frank")
  #
  #   resp.status
  #   => 200
  #
  #   resp.body
  #   => {"game":{"id":"9nt7pk9x","player":{"mark":"O","name":"frank"}}}
  #
  #   resp = conn.post("/v1/game/create", "player1" => "", "player2" => "")
  #
  #   resp.status
  #   => 422
  #
  #   resp.body
  #   => {"errors":[{"message":"You must specify your names before start the game"}]}
  #
  post '/v1/game/create', provides: :json do
    request_payload = JSON.parse request.body.read
    player1 = Player.new({mark: "X", name: request_payload["player1"]})
    player2 = Player.new({mark: "O", name: request_payload["player2"]})
    begin
      @game = Game.new([player1, player2])
      session[:"game_#{@game.id}"] = @game
      rabl :game
    rescue PlayersMustHaveNames => e
      render_error(e)
    end
  end

  ##
  # Handles a request to to set cell on board, switches players and
  # define the winner or the draw game
  #
  # PATCH /v1/game/:id/get-move
  #
  # params:
  #   id - alphanumeric game id
  #   postion - Position on board from 1 to 9
  #
  # = Examples
  #
  #   resp = conn.patch("/v1/game/9nt7pk9x/get-move", "position" => "3")
  #
  #   resp.status
  #   => 200
  patch '/v1/game/:id/get-move', provides: :json do
    request_payload = JSON.parse request.body.read
    game = session[:"game_#{params[:id]}"]
    board = set_position game, request_payload["position"]
    @state = board.game_over
    game.switch_players unless @state
    @player = game.current_player
    rabl :get_move
  end

  ##
  # DELETE /v1/game/:id
  #
  # params:
  #   id - alphanumeric game id
  #
  # = Examples
  #
  #   resp = conn.delete("/v1/game/9nt7pk9x")
  #
  #   resp.status
  #   => 204
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
    board.set_cell(x, y, current_player.mark)
    board
  end
end
