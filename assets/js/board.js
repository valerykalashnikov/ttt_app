/**
 *  Manages the Tic Tac Toe grid and sending to the API cell numbers.
 *  Checking if the game has ended with a win or a draw and propose to play again.
 *  @extends AmpersandView
 */

var Board = AmpersandView.extend({
    /**
     *  @param {Object} player - first player
     *  @param game_id - alphanumeric id of the game object
     *
     *     @example
     *     new Board({
     *          game_id: '9nt7pk9x',
     *          player: {"mark":"O","name":"frank"},
     *          el: document.getElementById('container')
     *      });
    */
    initialize: function (options) {
        this.player = options.player;
        this.game_id = options.game_id;
    },

    template:function (context) {
        var html = [
            '<div id="container" class="container">' +
                '<div class="message">' + this.player.name + ': '+ this.player.mark + ' </div>' +
                '<button class="play-again">Play Again</button>' +
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
        "click .square": "getMove",
        "click .play-again": "playAgain"
    },

    /**
     * Set X or O in the separate cell, checking if the game overed,
     * render winner or draw game.
    */
    getMove: function getMove(e) {
        var position;
        var target_el = $(e.target)
        e.preventDefault();
        target_el.html(this.player.mark);
        position = target_el.attr('id');
        $.patch('/v1/game/'+this.game_id +'/get-move',
            JSON.stringify({position: position}),
            this._renderNextStep.bind(this)
        );
    },

    /**
     * A method to destroy the game on server.
     * @param {Function} fn Callback function.
     */
    playAgain: function playAgain(e){
        this.destroyGame(function(){
            window.location.href = '/';
        })
    },

    /**
     * A method to destroy the game on server.
     * @param {Function} fn Callback function.
     */
    destroyGame: function destroyGame(callback) {
        $.delete('/v1/game/'+this.game_id, callback);
    },

    /**
     * Render next step and checks if the game has ended with the winner of draw.
     * Unbind click on cell if the game overed.
     * @private
     */
    _renderNextStep: function renderNextStep(response) {
        this.player = response.player;
        $('.message').html(this.player.name + ':' + this.player.mark);
        if (response.state !== "continue") {
            this.eventManager.unbind('click', 'getMove');
            this._gameOver(response.state);
            this._showWinPositions();
            $('.play-again').show();
        }
    },

    /**
     * Render game over message depends on winner or draw state.
     * @private
     */
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
    },

    /**
     * Function to find winning position.
     * It doesn't care about who wins, it just find and mark winning position
     * by 'winning-square' css class.
     * @private
     */
    _showWinPositions: function showWinPositions() {
        var winCombinations = [ [1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 4, 7],
                            [2, 5, 8], [3, 6, 9], [1, 5, 9], [3, 5, 7] ];
        var allEq = function(winIndexes){
            var winValues = [];
            $.each(winIndexes, function(index, winIndex){
                winValues.push($('#'+winIndex).text());
            });
            for(var i = 1; i < winValues.length; i++) {
                if(winValues[i] !== winValues[0]) {
                    return false;
                }
            }
            return true
        };
        $.each(winCombinations, function(index, winIndexes){
            if (!!allEq(winIndexes)) {
                $.each(winIndexes, function(index, winIndex) {
                    $('#'+winIndex).addClass('winning-square');
                });
            }
        });
    }

});
module.exports = Board;
