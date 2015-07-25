var Game = require('./game');
var newGame = new Game();
document.querySelector('#container').appendChild(newGame.render().el)
