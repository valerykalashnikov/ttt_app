require 'ttt'

##
# Represents object of web TicTacToe game between two players.

class Game < TTT::Game
  # alphanumeric id of the game
  attr_reader :id

  ##
  # Creates a new game with array of two players,
  # generates alphanumeric id, validates if players objects has names.
  #
  # A PlayersMustHaveNames is raised if at least one of the players has no names.
  #
  # params:
  #   players - Array of two Player objects
  #
  # = Example
  #
  #   Game.new[player1, player2]

  def initialize arguments
    super
    @id = rand("zzzzzzzz".to_i(36)).to_s(36).rjust(8, "0")
    if @current_player.name.empty? || @other_player.name.empty?
      raise PlayersMustHaveNames
    end
  end
end

##
# Raised when at least one of TicTacToe players has no names
class PlayersMustHaveNames < StandardError
  
  def message #:nodoc: don't document this
    "You must specify your names before start the game"
  end
end
