/* global Phaser  */

var Player = require('./Player');
var Zombie = require('./Zombie');

var gameState = {
  
  _updatables: [],
  registerUpdatable: function (cb, ctx, weight) {
    var w = (weight !== undefined) ? weight : 0
    ctx = ctx || this;
    this._updatables.push({callback: cb, context: ctx, weight: w})
    this._updatables.sort(function (a, b) { return b.weight - a.weight; });
  },
  
  player: null,
  zombies: null,
  
  preload: function () {
    
  },
  create: function () {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    this.player = new Player(game, game.world.randomX, game.world.randomY);
    this.registerUpdatable(this.player.tick, this.player);
    this.zombies = [];
    for (var i = 0; i < 20; i++) {
      var z = new Zombie(game, game.world.randomX, game.world.randomY);
      this.zombies.push(z);
      this.registerUpdatable(z.tick, z);
    }
  },
  update: function () {
    this._updatables.forEach(function (cb) {
      cb.callback.call(cb.context, this);
    }, this);
  },
  render: function () {
    
  }
};

var game = new Phaser.Game(720, 480, Phaser.AUTO, '#game', gameState);