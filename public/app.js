(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Game = require('./game');
var newGame = new Game({el: document.getElementById('container')});
newGame.render();

},{"./game":3}],2:[function(require,module,exports){
var Board = AmpersandView.extend({
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

    playAgain: function playAgain(e){
        this.destroyGame(function(){
            window.location.href = '/';
        })
    },

    _renderNextStep: function renderNextStep(response) {
        this.player = response.player;
        $('.message').html(this.player.name + ':' + this.player.mark);
        if (response.state !== "continue") {
            this.eventManager.unbind('click', 'getMove');
            this.off('.square');
            this._gameOver(response.state);
            this._showWinPositions();
            $('.play-again').show();
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
    },

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
    },

    destroyGame: function destroyGame(callback) {
        $.delete('/v1/game/'+this.game_id, callback);
    }

});
module.exports = Board;

},{}],3:[function(require,module,exports){
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

    submitPlayers: function submitPlayers (e) {
        e.preventDefault();
        var me = this;
        var form = $('form');
        var data = {};
        form.serializeArray().map(function(x){data[x.name] = x.value;});
        $.post( "/v1/game/create", JSON.stringify(data))
            .done(me._initBoard).fail(me._renderFail);
    },

    _initBoard: function _initBoard(response) {
        var board = new Board({
            game_id: response.game.id,
            player: response.game.player,
            el: document.getElementById('container')
        });
        board.render();
    },

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

},{"./board":2}]},{},[1]);
