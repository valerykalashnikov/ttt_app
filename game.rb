require 'ttt'

class Game < TTT::Game
  attr_reader :id

  def initialize arguments
    super
    @id = rand("zzzzzzzz".to_i(36)).to_s(36).rjust(8, "0")
  end
end
