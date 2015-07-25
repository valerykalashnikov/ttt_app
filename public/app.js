(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Game = require('./game');
var newGame = new Game();
document.querySelector('#container').appendChild(newGame.render().el)

},{"./game":3}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
var Board = require('./board');
var Game = AmpersandView.extend({
    template:'<form class="form-container">' +
        '<div class="form-title"></div>' +
        '<div class="form-title">Player 1</div>' +
        '<input class="form-field" type="text" name="player1" /><br />' +
        '<div class="form-title">Player 2</div>' +
        '<input class="form-field" type="text" name="player2" /><br />' +
        '<div class="submit-container">' +
        '<input class="submit-button" type="submit" data-hook="create" value="Submit" />' +
        '</div>' +
      '</form>',

    events: {
        "click [data-hook=create]": "submitPlayers"
    },

    submitPlayers: function submitPlayers (e) {
        e.preventDefault();
        var me = this;
        var form = $('form');
        var data = {};
        form.serializeArray().map(function(x){data[x.name] = x.value;});
        $.post( "/game/create", JSON.stringify(data), me._initBoard);
    },

    _initBoard: function _initBoard(response) {
        var board = new Board({
            game_id: response.game.id,
            player: response.game.player,
            el: document.getElementById('container')
        });
        board.render();
    }
});
module.exports = Game;

},{"./board":2}]},{},[1]);
