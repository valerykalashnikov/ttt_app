require 'byebug'

require_relative 'player'
require_relative 'board'
require_relative 'game'

require 'sinatra/base'
require "sinatra/reloader"
require 'json'

require 'rabl'

class TicTacToe < Sinatra::Base
  use Rack::Session::Pool, expire_after: 64800, secret: '*&(^B234'

  configure :development do
    register Sinatra::Reloader
  end

  Rabl.register!


  set :root, File.dirname(__FILE__)
  set :public_dir, 'public'

  get '/' do
    send_file 'index.html'
  end

  post '/game/create', provides: :json do
    request_payload = JSON.parse request.body.read
    player1 = Player.new({turn: "X", name: request_payload["player1"]})
    player2 = Player.new({turn: "O", name: request_payload["player2"]})
    @game = Game.new([player1, player2])
    session[:"game_#{@game.id}"] = @game
    rabl :game
  end

  patch '/game/:id/get-move', provides: :json do
    request_payload = JSON.parse request.body.read
    game = session[:"game_#{params[:id]}"]
    board = set_position game, request_payload["position"]
    @state = board.game_over
    game.switch_players unless @state
    @player = game.current_player
    rabl :get_move
  end

  delete '/game/:id', provides: :json do
    session.delete :"game_#{params[:id]}"
  end

  private

  def set_position game, human_move
    current_player = game.current_player
    x,y = game.get_move(human_move)
    board = game.board
    board.set_cell(x, y, current_player.turn)
    board
  end
end
