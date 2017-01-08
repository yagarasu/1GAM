var Maze = require('./Maze');

var WALL_TOP = 1,
    WALL_RIGHT = 2,
    WALL_BOTTOM = 4,
    WALL_LEFT = 8;

var gameState = {
    
  tileSize: 32,
  
  mazeBmp: null,
  
  drawCell: function (x, y) {
    var c = this.maze.getCell(x, y);
    //this.mazeBmp.drawRect(x*this.tileSize, y*this.tileSize, this.tileSize-2, this.tileSize-2);
    if (c & WALL_TOP) {
      this.mazeBmp.moveTo(x*this.tileSize, y*this.tileSize);
      this.mazeBmp.lineTo((x*this.tileSize) + this.tileSize, y*this.tileSize);
    }
    if (c & WALL_RIGHT) {
      this.mazeBmp.moveTo((x*this.tileSize) + this.tileSize, y*this.tileSize);
      this.mazeBmp.lineTo((x*this.tileSize) + this.tileSize, (y*this.tileSize) + this.tileSize);
    }
    if (c & WALL_BOTTOM) {
      this.mazeBmp.moveTo(x*this.tileSize, (y*this.tileSize) + this.tileSize);
      this.mazeBmp.lineTo((x*this.tileSize) + this.tileSize, (y*this.tileSize) + this.tileSize);
    }
    if (c & WALL_LEFT) {
      this.mazeBmp.moveTo(x*this.tileSize, y*this.tileSize);
      this.mazeBmp.lineTo(x*this.tileSize, (y*this.tileSize) + this.tileSize);
    }
  },
  
  preload: function () {},
  
  create: function () {
    var w = 21, h = 14;
    this.mazeBmp = game.add.graphics(15, 15);
    this.mazeBmp.beginFill(0x666600);
    this.mazeBmp.lineStyle(1, 0xFFFFFF, 0.8);
    this.maze = new Maze(w, h);
    for (var i = 0; i < h; i++) {
      for (var j = 0; j < w; j++) {
        this.drawCell(j, i);
      }
    }
  },
  update: function () {
    
  }
};

var game = new Phaser.Game(720, 480, Phaser.AUTO, '#game', gameState);