require 'ttt'

class Game < TTT::Game
  attr_reader :id

  def initialize arguments
    super
    @id = rand("zzzzzzzz".to_i(36)).to_s(36).rjust(8, "0")
    if @current_player.name.empty? || @other_player.name.empty?
      raise PlayersMustHaveNames
    end
  end
end

class PlayersMustHaveNames < StandardError

  def message
    "You must specify your names before start the game"
  end
end
