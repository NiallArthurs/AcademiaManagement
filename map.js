// Maps class
// We need to make sure pathfinder.js is loaded before this class.
var Map2D = (function () {

  var Map2D = function(_layout, _name, _tileset) {
    this.occupied = [];
    this.layout = _layout; // Not final solution for map storage!
    this.name = _name;
    this.width = this.layout.length;
    this.height = this.layout[0].length;
    this.tileset = _tileset;
    this.gridOrig = new PF.Grid(this.width, this.height);
    // Create the grid for collisons for use by the path finder
    for (var i=0; i < this.width; i++) {
      for (var j=0; j < this.height; j++) {
        if (this.layout[i][j] == 0)
        {
          this.gridOrig.setWalkableAt(i, j, true);
        }
        else {
          this.gridOrig.setWalkableAt(i, j, false);
        }
      }
    }
    this.finder = new PF.AStarFinder();

    // Render map to offscreen canvas
    this.offscreenRender = document.createElement('canvas');
    this.offscreenRender.width = TILE_SIZE*this.width;
    this.offscreenRender.height = TILE_SIZE*this.height;
    this.renderOffscreenMap();
  };

  Map2D.prototype = {
    collision: function (x, y) {
      if (this.layout[x][y] != 0) {
        return true;
      }

      return false;
    },
    renderOffscreenMap: function() {
      var ctx = this.offscreenRender.getContext('2d');
      for (i = 0; i < this.width; i++) {
        for (j = 0; j < this.height; j++) {
          ctx.drawImage(this.tileset, (this.layout[i][j]%10)*TILE_SIZE,
            Math.floor(this.layout[i][j]/10.0)*TILE_SIZE, TILE_SIZE,
            TILE_SIZE, TILE_SIZE*i, TILE_SIZE*j, TILE_SIZE, TILE_SIZE);
        }
      }
    },
    generatePath: function(x0, y0, x, y) {
      var grid = this.gridOrig.clone();
      return this.finder.findPath(x0, y0, x, y, grid);
    },
    draw: function(ctx) {
      ctx.drawImage(this.offscreenRender, cameraScreenPosition[0]-TILE_SIZE*cameraMapPosition[0],
        cameraScreenPosition[1]-TILE_SIZE*cameraMapPosition[1],this.offscreenRender.width,
        this.offscreenRender.height);
    }
  }

  return Map2D;
})();
