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