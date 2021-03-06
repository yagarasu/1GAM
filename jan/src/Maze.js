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