object @game
attributes :id
child(:current_player) { attributes :mark, :name }
