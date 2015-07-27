/**
 *  Manages the Tic Tac Toe game initialization.
 *  Only creates the new game and send request to game create to the API.
 *  @extends AmpersandView
 *
 *     @example
 *     new Game();
 */
var Board = require('./board');
var Game = AmpersandView.extend({
    template: '<div id="container" class="container">' +
        '<div class="message">Enter your names: </div>' +
        '<form class="form-container">' +
        '<div class="form-title"></div>' +
        '<div class="form-title">Player 1</div>' +
        '<input class="form-field" type="text" name="player1" /><br />' +
        '<div class="form-title">Player 2</div>' +
        '<input class="form-field" type="text" name="player2" /><br />' +
        '<div class="submit-container">' +
        '<input class="submit-button" type="submit" data-hook="create" value="Start" />' +
        '</div>' +
      '</form>' +
      '</div>'
      ,

    events: {
        "click [data-hook=create]": "submitPlayers"
    },

    /**
     * Send players names to the server and change if init the gameboard,
     * or render fail.
    */
    submitPlayers: function submitPlayers (e) {
        e.preventDefault();
        var me = this;
        var form = $('form');
        var data = {};
        form.serializeArray().map(function(x){data[x.name] = x.value;});
        $.post( "/v1/game/create", JSON.stringify(data))
            .done(me._initBoard).fail(me._renderFail);
    },

    /**
     * @private
     * A method to create gameboard
    */
    _initBoard: function _initBoard(response) {
        var board = new Board({
            game_id: response.game.id,
            player: response.game.player,
            el: document.getElementById('container')
        });
        board.render();
    },

    /**
     * @private
     * A method to render validation error if response status is 422
     * or render kind message if error unknow.
    */
    _renderFail: function(jqXHR) {
        if (jqXHR.status == 422) {
            alert(
                arr = $.map(jqXHR.responseJSON.errors, function(error){
                   return error.message;
                }).join('/n')
            );
        }
        else {
            alert('Sorry, something went wrong');
        }
    }
});
module.exports = Game;
