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