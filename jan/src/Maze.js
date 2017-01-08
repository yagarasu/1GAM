var WALL_TOP = 1,
    WALL_RIGHT = 2,
    WALL_BOTTOM = 4,
    WALL_LEFT = 8;

var Maze = function (width, height) {
  this.width = width;
  this.height = height;
  this.cells = [];
  for (var i = 0; i < (width*height); i++) {
    this.cells.push(0xF);
  }
  this.carve();
};

Maze.prototype.getIndex = function (x, y) {
  if (x < 0 || x >= this.width) throw new Error('Undefined cell. X overflows.');
  if (y < 0 || y >= this.height) throw new Error('Undefined cell. Y overflows.');
  return (y * this.width) + x;
};

Maze.prototype.getXYFromIdx = function (idx) {
  var x = idx % this.width;
  var y = Math.floor(idx / this.width);
  return [x, y];
};

Maze.prototype.getCell = function (x, y) {
  var idx = this.getIndex(x, y);
  return this.cells[idx];
};

Maze.prototype.setCellWall = function (idx, wallFlags) {
  if (idx < 0 || idx >= this.cells.length) throw new Error('Undefined cell. Index overflow.');
  this.cells[idx] = this.cells[idx] | wallFlags;
};

Maze.prototype.unsetCellWall = function (idx, wallFlags) {
  if (idx < 0 || idx >= this.cells.length) throw new Error('Undefined cell. Index overflow.');
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
  console.log('carve');
  var x = 0, y = 0, i = 0, visited = [0], stack = [];
  var maxIter = 200, cIter = 0;
  while (visited.length !== this.cells && cIter < maxIter) {
    var neighbors = this.getNeightbors(x, y);
    console.log(neighbors);
    var availableNeighbors = [];
    for (var k in neighbors) {
      if (neighbors[k] !== null && visited.indexOf(neighbors[k]) === -1) {
        availableNeighbors.push(k);
      }
    }
    if (availableNeighbors.length > 0) {
      stack.push(i);
      var rndNeighbor = availableNeighbors[Math.floor(Math.random() * availableNeighbors.length)];
      console.log('Choose random neigh', rndNeighbor);
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
    } else {
      console.log('Ended');
    }
    cIter++;
  }
};

module.exports = Maze;