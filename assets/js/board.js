var Board = AmpersandView.extend({
    initialize: function (options) {
        this.player = options.player;
        this.game_id = options.game_id;
    },

    template:function (context) {
        var html = [
            '<div id="container" class="container">' +
                '<div class="message">' + this.player.name + ': '+ this.player.turn + ' </div>' +
                '<div class="gameboard">' +
                    '<div id="1" class="square r-border b-border"></div>'+
                    '<div id="2" class="square r-border b-border"></div>'+
                    '<div id="3" class="square b-border"></div>'+
                    '<div id="4" class="square r-border b-border"></div>'+
                    '<div id="5" class="square r-border b-border"></div>'+
                    '<div id="6" class="square b-border"></div>'+
                    '<div id="7" class="square r-border"></div>'+
                    '<div id="8" class="square r-border"></div>'+
                    '<div id="9" class="square"></div>'+
                '</div>' +
            '</div>'
        ].join('\n');

        return html;
    },

    events: {
        "click .square": "getMove"
    },

    getMove: function getMove(e) {
        var position;
        var target_el = $(e.target)
        e.preventDefault();
        target_el.html(this.player.turn);
        position = target_el.attr('id');
        $.patch('/game/'+this.game_id +'/get-move',
            JSON.stringify({position: position}),
            this._renderNextStep.bind(this)
        );
    },

    _renderNextStep: function renderNextStep(response) {
        this.player = response.player;
        $('.message').html(this.player.name + ':' + this.player.turn);
        if (response.state !== "continue") {
            this._gameOver(response.state);
        }
    },

    _gameOver: function gameOver(state) {
        var renderEndMessage = function renderEndMessage(text) {
            $('.message').text(text).addClass('end-message');
        }
        switch (state) {
        case "winner":
            renderEndMessage(
                    "Game Over. Player " + this.player.name + " wins!"
                );
            break;
        case "draw":
            renderEndMessage(
                    "Game Over. Draw Game."
                );
            break;
        }
    }

});
module.exports = Board;
