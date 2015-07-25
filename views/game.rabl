object @game
attributes :id
child(:current_player) { attributes :turn, :name }
