(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var WALL_TOP = 1,
    WALL_RIGHT = 2,
    WALL_BOTTOM = 4,
    WALL_LEFT = 8;

var Maze = function (width, height) {
  this.width = width;
  this.height = height;
  this.cells = [];
  this.walls = {};
  for (var i = 0; i < (width*height); i++) {
    this.cells.push(0xF);
  }
  this.carve();
};

Maze.prototype.getIndex = function (x, y) {
  if (x < 0 || x >= this.width) return null;
  if (y < 0 || y >= this.height) return null;
  return (y * this.width) + x;
};

Maze.prototype.getXYFromIdx = function (idx) {
  var x = idx % this.width;
  var y = Math.floor(idx / this.width);
  return [x, y];
};

Maze.prototype.getCell = function (x, y) {
  var idx = this.getIndex(x, y);
  if (idx === null) return null;
  return this.cells[idx];
};

Maze.prototype.setCellWall = function (idx, wallFlags) {
  if (idx < 0 || idx >= this.cells.length) throw new Error('Undefined cell. Index overflow. ' + idx);
  this.cells[idx] = this.cells[idx] | wallFlags;
};

Maze.prototype.unsetCellWall = function (idx, wallFlags) {
  if (idx < 0 || idx >= this.cells.length) throw new Error('Undefined cell. Index overflow.' + idx);
  this.cells[idx] = this.cells[idx] & ~wallFlags;
};

Maze.prototype.getNeightbors = function (x, y) {
  var neighbors = { top: null, right: null, bottom: null, left: null };
  // Top
  if (y > 0) {
    neighbors.top = this.getIndex(x, y-1);
  }
  // Right
  if (x < this.width-1) {
    neighbors.right = this.getIndex(x+1, y);
  }
  // Bottom
  if (y < this.height-1) {
    neighbors.bottom = this.getIndex(x, y+1);
  }
  // Left
  if (x > 0) {
    neighbors.left = this.getIndex(x-1, y);
  }
  return neighbors;
};

Maze.prototype.carve = function () {
  var x = 0, y = 0, i = 0, visited = [0], stack = [];
  while (visited.length !== (this.cells.length-1)) {
    var neighbors = this.getNeightbors(x, y);
    var availableNeighbors = [];
    for (var k in neighbors) {
      if (neighbors[k] !== null && visited.indexOf(neighbors[k]) === -1) {
        availableNeighbors.push(k);
      }
    }
    if (availableNeighbors.length > 0) {
      stack.push(i);
      var rndNeighbor = availableNeighbors[Math.floor(Math.random() * availableNeighbors.length)];
      switch (rndNeighbor) {
        case 'top':
          this.unsetCellWall(i, WALL_TOP);
          this.unsetCellWall(neighbors[rndNeighbor], WALL_BOTTOM);
          break;
        case 'right':
          this.unsetCellWall(i, WALL_RIGHT);
          this.unsetCellWall(neighbors[rndNeighbor], WALL_LEFT);
          break;
        case 'bottom':
          this.unsetCellWall(i, WALL_BOTTOM);
          this.unsetCellWall(neighbors[rndNeighbor], WALL_TOP);
          break;
        case 'left':
          this.unsetCellWall(i, WALL_LEFT);
          this.unsetCellWall(neighbors[rndNeighbor], WALL_RIGHT);
          break;
      }
      var neighborPos = this.getXYFromIdx(neighbors[rndNeighbor]);
      x = neighborPos[0];
      y = neighborPos[1];
      i = neighbors[rndNeighbor];
      visited.push(i);
    } else if (stack.length > 0) {
      var prev = stack.pop();
      var prevPos = this.getXYFromIdx(prev);
      x = prevPos[0];
      y = prevPos[1];
      i = prev;
    }
  }
  // Remove redundant walls
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      var curCell = this.getCell(x, y),
          neighbors = this.getNeightbors(x, y);
      if (curCell & WALL_RIGHT && neighbors.right !== null && this.cells[neighbors.right] & WALL_LEFT) this.unsetCellWall(neighbors.right, WALL_LEFT);
      if (curCell & WALL_BOTTOM && neighbors.bottom !== null && this.cells[neighbors.bottom] & WALL_TOP) this.unsetCellWall(neighbors.bottom, WALL_TOP);
    }
  }
};

module.exports = Maze;
},{}],2:[function(require,module,exports){
/* global Phaser  */
var Maze = require('./Maze');

var WALL_TOP = 1,
    WALL_RIGHT = 2,
    WALL_BOTTOM = 4,
    WALL_LEFT = 8;
    
var margins = 15;
var speed = 50;

var gameState = {
  
  tileSize: 32,
  //tileSize: 20,
  
  mazeBmp: null,
  char: null,
  ctrls: null,
  
  drawCell: function (x, y) {
    var c = this.maze.getCell(x, y);
    if (c & WALL_TOP) {
      this.mazeBmp.lineStyle(1, 0xFFFFFF, 0.8);
      this.mazeBmp.moveTo(x*this.tileSize, y*this.tileSize);
      this.mazeBmp.lineTo((x*this.tileSize) + this.tileSize, y*this.tileSize);
    }
    if (c & WALL_RIGHT) {
      this.mazeBmp.lineStyle(1, 0xFFFFFF, 0.8);
      this.mazeBmp.moveTo((x*this.tileSize) + this.tileSize, y*this.tileSize);
      this.mazeBmp.lineTo((x*this.tileSize) + this.tileSize, (y*this.tileSize) + this.tileSize);
    }
    if (c & WALL_BOTTOM) {
      this.mazeBmp.lineStyle(1, 0xFFFFFF, 0.8);
      this.mazeBmp.moveTo(x*this.tileSize, (y*this.tileSize) + this.tileSize);
      this.mazeBmp.lineTo((x*this.tileSize) + this.tileSize, (y*this.tileSize) + this.tileSize);
    }
    if (c & WALL_LEFT) {
      this.mazeBmp.lineStyle(1, 0xFFFFFF, 0.8);
      this.mazeBmp.moveTo(x*this.tileSize, y*this.tileSize);
      this.mazeBmp.lineTo(x*this.tileSize, (y*this.tileSize) + this.tileSize);
    }
  },
  
  canWalkThrough: function (d) { return true; },
  
  canWalkThrough_: function (direction) {
    var tlX = Math.round((this.char.x - margins) / this.tileSize),
        tlY = Math.round((this.char.y - margins) / this.tileSize),
        brX = Math.round((this.char.x + this.char.width - margins) / this.tileSize),
        brY = Math.round((this.char.y + this.char.height - margins) / this.tileSize);
    var tlXp = this.char.x,
        tlYp = this.char.y,
        brXp = this.char.x + this.char.width,
        brYp = this.char.y + this.char.height,
        slt = new Phaser.Line(tlXp, tlYp, brXp, tlYp),
        slr = new Phaser.Line(brXp, tlYp, brXp, brYp),
        slb = new Phaser.Line(tlXp, brYp, brXp, brYp),
        sll = new Phaser.Line(tlXp, tlYp, tlXp, brYp);
        game.debug.geom(slt, '#f00');
        game.debug.geom(slr, '#f00');
        game.debug.geom(slb, '#f00');
        game.debug.geom(sll, '#f00');
    var tlC = this.maze.getIndex(tlX, tlY),
        trC = this.maze.getIndex(brX, tlY),
        blC = this.maze.getIndex(tlX, brY),
        brC = this.maze.getIndex(brX, brY);
        // if (tlC === null || trC === null || blC === null || brC === null) return false;
    var cells = [tlC];
    if (cells.indexOf(trC) === -1) cells.push(trC);
    if (cells.indexOf(blC) === -1) cells.push(blC);
    if (cells.indexOf(brC) === -1) cells.push(brC);
    game.debug.text( "Cells: " + cells.length, 1, 1 );
    for (var ci = 0; ci < cells.length; ci++) {
      var curCell = this.maze.cells[cells[ci]];
      var curCellPos = this.maze.getXYFromIdx(cells[ci]);
      if (direction === 'UP' && curCell & WALL_TOP) {
        var wallPosX1 = (curCellPos[0] * this.tileSize) + margins,
            wallPosY1 = (curCellPos[1] * this.tileSize) + margins,
            wallPosX2 = (curCellPos[0] * this.tileSize) + this.tileSize + margins,
            wallPosY2 = (curCellPos[1] * this.tileSize) + margins,
            wallObj = new Phaser.Line(wallPosX1, wallPosY1, wallPosX2, wallPosY2);
        game.debug.geom(wallObj, '#c00');
        if (wallObj.intersects(sll) !== null || wallObj.intersects(slr) !== null) return false;
      }
      if (direction === 'RIGHT' && curCell & WALL_RIGHT) {
        var wallPosX1 = (curCellPos[0] * this.tileSize) + this.tileSize + margins,
            wallPosX2 = (curCellPos[0] * this.tileSize) + this.tileSize + margins,
            wallPosY1 = (curCellPos[1] * this.tileSize) + margins,
            wallPosY2 = (curCellPos[1] * this.tileSize) + this.tileSize + margins,
            wallObj = new Phaser.Line(wallPosX1, wallPosY1, wallPosX2, wallPosY2);
        game.debug.geom(wallObj, '#c00');
        if (wallObj.intersects(slt) !== null || wallObj.intersects(slb) !== null) return false;
      }
      if (direction === 'DOWN' && curCell & WALL_BOTTOM) {
        var wallPosX1 = (curCellPos[0] * this.tileSize) + margins,
            wallPosX2 = (curCellPos[0] * this.tileSize) + this.tileSize + margins,
            wallPosY1 = (curCellPos[1] * this.tileSize) + this.tileSize + margins,
            wallPosY2 = (curCellPos[1] * this.tileSize) + this.tileSize + margins,
            wallObj = new Phaser.Line(wallPosX1, wallPosY1, wallPosX2, wallPosY2);
        game.debug.geom(wallObj, '#c00');
        if (wallObj.intersects(sll) !== null || wallObj.intersects(slr) !== null) return false;
      }
      if (direction === 'LEFT' && curCell & WALL_LEFT) {
        var wallPosX1 = (curCellPos[0] * this.tileSize) + margins,
            wallPosX2 = (curCellPos[0] * this.tileSize) + margins,
            wallPosY1 = (curCellPos[1] * this.tileSize) + margins,
            wallPosY2 = (curCellPos[1] * this.tileSize) + this.tileSize + margins,
            wallObj = new Phaser.Line(wallPosX1, wallPosY1, wallPosX2, wallPosY2);
        game.debug.geom(wallObj, '#c00');
        if (wallObj.intersects(slt) !== null || wallObj.intersects(slb) !== null) return false;
      }
    }
    return true;
  },
  
  preload: function () {
    game.load.spritesheet('char', './assets/char.png', 32, 48);
  },
  
  create: function () {
    //var w = 21, h = 14;
    var w = Math.floor((game.width-(margins*2)) / this.tileSize), h = Math.floor((game.height-(margins*2)) / this.tileSize);
    this.mazeBmp = game.add.graphics(margins, margins);
    this.maze = new Maze(w, h);
    for (var i = 0; i < h; i++) {
      for (var j = 0; j < w; j++) {
        this.drawCell(j, i);
      }
    }
    this.char = game.add.sprite(margins+1, margins+1, 'char');
    // this.char.scale.set(0.66);
    this.char.scale.set(0.5);
    this.char.animations.add('front', [0,1,2,3], 10, true);
    this.char.animations.add('left', [4,5,6,7], 10, true);
    this.char.animations.add('right', [8,9,10,11], 10, true);
    this.char.animations.add('back', [12,13,14,15], 10, true);
    
    game.physics.enable(this.char, Phaser.Physics.ARCADE);
    
    this.ctrls = game.input.keyboard.createCursorKeys();
  },
  update: function () {
    this.char.body.velocity.set(0);
    if (this.ctrls.up.isDown) {
      this.char.play('back');
      if (this.canWalkThrough('UP')) {
        this.char.body.velocity.y = speed * -1;
      }
    } else
    if (this.ctrls.right.isDown) {
      this.char.play('right');
      if (this.canWalkThrough('RIGHT')) {
        this.char.body.velocity.x = speed;
      }
    } else
    if (this.ctrls.down.isDown) {
      this.char.play('front');
      if (this.canWalkThrough('DOWN')) {
        this.char.body.velocity.y = speed;
      }
    } else
    if (this.ctrls.left.isDown) {
      this.char.play('left');
      if (this.canWalkThrough('LEFT')) {
        this.char.body.velocity.x = speed * -1;
      }
    } else {
      this.char.animations.stop();
    }
  },
  
  render: function () {
    
    game.debug.text('foo',0,0,'#fff');
  }
};

var game = new Phaser.Game(720, 480, Phaser.AUTO, '#game', gameState);
},{"./Maze":1}]},{},[2]);
