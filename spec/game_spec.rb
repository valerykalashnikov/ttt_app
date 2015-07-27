require "spec_helper"

describe Game do
  let (:bob) { Player.new({mark: "X", name: "bob"}) }
  let (:frank) { Player.new({mark: "O", name: "frank"}) }

  context "#initialize" do

    it "has not nil id" do
      game = Game.new([bob, frank])
      expect(game.id).not_to be_empty
    end

    context "when of players has no name" do
      let (:frank) { Player.new({mark: "O", name: ""}) }
      subject { Game.new([bob, frank]) }
      it "should raise an error" do
        expect{ subject }.to raise_error(PlayersMustHaveNames)
      end
    end
  end
end
