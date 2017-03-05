(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Message = function (to, from, type, data) {
  this.to = to;
  this.from = from;
  this.type = type;
  this.data = data;
};

module.exports = Message;
},{}],2:[function(require,module,exports){
var MessageQueue = function () {
  this._messages = [];
};

MessageQueue.prototype.send = function (message) {
  this._messages.push(message);
};

MessageQueue.prototype.dispatch = function () {
  while (this._messages.length > 0) {
    var m = this._messages.splice(0, 1);
    if (m.to) {
      var e = m.to;
      if (e.onMessage) {
        e.onMessage(m);
      }
    }
  }
};

module.exports = new MessageQueue();
},{}],3:[function(require,module,exports){
/* global Phaser  */

var MessageQueue = require('./MessageQueue');
var Message = require('./Message');

var Player = function (game, x, y) {
  this._game = game;
  this._kbd = game.input.keyboard;
  this._graphics = game.add.graphics(x, y);
  this.draw();
  game.physics.arcade.enable(this._graphics);
  this._graphics.body.drag.set(500);
  this._graphics.body.maxVelocity.set(75);
  this._graphics.body.collideWorldBounds = true;
};

Player.prototype.distance = function (x, y) {
  var px = this._graphics.body.x;
  var py = this._graphics.body.y;
  var deltax = Math.round(px - x);
  var deltay = Math.round(py - y);
  var d = Math.sqrt((deltax*deltax) + (deltay*deltay));
  // var _line = new Phaser.Line(px,py,x,y);
  // this._game.debug.geom(_line, 'rgba(255,0,0,0.2)');
  // this._game.debug.text(Math.round(d), x, y);
  return d;
}

Player.prototype.getPos = function () {
  return { x: this._graphics.body.x, y: this._graphics.body.y };
}

Player.prototype.draw = function () {
  this._graphics.beginFill(0x0000CC);
  //this._graphics.drawCircle(0, 0, 10);
  this._graphics.drawRect(-10,-10,10,10);
  this._graphics.endFill();
};

Player.prototype.tick = function () {
  this._game.debug.text(this._graphics.angle, this._graphics.body.x, this._graphics.body.y);
  
  if (this._kbd.isDown(Phaser.Keyboard.UP)) {
    this._game.physics.arcade.accelerationFromRotation(this._graphics.body.rotation, 50, this._graphics.body.acceleration);
  } else if (this._kbd.isDown(Phaser.Keyboard.DOWN)) {
    this._game.physics.arcade.accelerationFromRotation(this._graphics.body.rotation, -20, this._graphics.body.acceleration);
  } else {
    this._graphics.body.acceleration.set(0);
  }
  
  if (this._kbd.isDown(Phaser.Keyboard.LEFT)) {
    this._graphics.body.angularAcceleration = -5;
    //this._graphics.body.rotation -= 0.5;
  } else if (this._kbd.isDown(Phaser.Keyboard.RIGHT)) {
    this._graphics.body.angularAcceleration = 5;
    //this._graphics.body.rotation += 0.5;
  } else {
    this._graphics.body.angularVelocity = 0;
  }
};

Player.prototype.onMessage = function (msg) {
  
};

module.exports = Player;
},{"./Message":1,"./MessageQueue":2}],4:[function(require,module,exports){
/* global Phaser  */

var STATE_WANDERING = 0;
var STATE_PURSUE = 1;

var randDir = function () {
  var stop = !!Math.round(Math.random());
  if (stop) return 0;
  var isNeg = !!Math.round(Math.random());
  return (isNeg) ? -15 : 15;
};

var Zombie = function (game, x, y) {
  this._game = game;
  this._graphics = game.add.graphics(x, y);
  this._state = STATE_WANDERING;
  this.draw();
  game.physics.arcade.enable(this._graphics);
  
  this._graphics.body.collideWorldBounds = true;
  this._graphics.body.velocity.x = randDir();
  this._graphics.body.velocity.y = randDir();
};

Zombie.prototype.draw = function () {
  this._graphics.beginFill(0x00CC00);
  this._graphics.drawCircle(0, 0, 10);
  this._graphics.endFill();
};

Zombie.prototype.tick = function (gamestate) {
  switch (this._state) {
    case STATE_WANDERING:
      var d = gamestate.player.distance(this._graphics.body.x, this._graphics.body.y);
      if (d < 50) this._state = STATE_PURSUE;
      if (Math.random() <= 0.05) {
        this._graphics.body.velocity.x = randDir();
        this._graphics.body.velocity.y = randDir();
      }
      break;
    case STATE_PURSUE:
      var d = gamestate.player.distance(this._graphics.body.x, this._graphics.body.y);
      if (d > 75) this._state = STATE_WANDERING;
      // Calculate X velocity
      var ppos = gamestate.player.getPos();
      this._graphics.body.velocity.x = (ppos.x === this._graphics.body.x) ? 0
        : ((ppos.x > this._graphics.body.x) ? 15 : -15);
      this._graphics.body.velocity.y = (ppos.y === this._graphics.body.y) ? 0
        : ((ppos.y > this._graphics.body.y) ? 15 : -15); 
      break;
  }
};

Zombie.prototype.onMessage = function (msg) {
  
};

module.exports = Zombie;
},{}],5:[function(require,module,exports){
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
},{"./Player":3,"./Zombie":4}]},{},[5]);
