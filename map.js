// Maps class
// We need to make sure pathfinder.js is loaded before this class.
var Map2D = (function () {

  var Map2D = function(_mapobj) {
    this.occupied = {};
    this.layout = _mapobj.tiles; // Not final solution for map storage!
    this.name = _mapobj.name;
    this.width = this.layout.length;
    this.height = this.layout[0].length;
    this.tileset = _mapobj.tileset;
    this.objects = _mapobj.objects;
    this.atlas = _mapobj.atlas;
    this.objectSprites = [];
    this.startPosition = _mapobj.startPosition;
    this.gridOrig = new PF.Grid(this.width, this.height);
    // Create the grid for collisons for use by the path finder
    for (var i=0; i < this.width; i++) {
      for (var j=0; j < this.height; j++) {
        if (this.layout[i][j] === 0) {
          this.gridOrig.setWalkableAt(i, j, true);
        }
        else {
          this.gridOrig.setWalkableAt(i, j, false);
        }
      }
    }

    // Set any object collisions
    for (var prop in this.objects) {
      for (var k=0; k < this.objects[prop].collision.length; k++) {
        this.gridOrig.setWalkableAt(this.objects[prop].xTile+this.objects[prop].collision[k][0],
          this.objects[prop].yTile+this.objects[prop].collision[k][1], false);
      }
    }

    this.finder = new PF.AStarFinder();

    // Add background objects to map
    for (var prop in this.objects) {
      if (!this.objects[prop].zPos)
      {
        var objSprite = new ObjectSprite(this.atlas, this.objects[prop].width,
        this.objects[prop].height, this.objects[prop].xPos, this.objects[prop].yPos,
        this.objects[prop].xTile, this.objects[prop].yTile);

        if (this.objects[prop].popupText !== undefined) {
          objSprite.notifyText = this.objects[prop].popupText;
          objSprite.inputCallback = function() {amplify.publish("popup-text",
            this.getX(), this.getY(), this.notifyText);};
        }

        this.objectSprites.push(objSprite);
      }
    }

    // Render map and background objects to offscreen canvas
    this.offscreenRender = document.createElement('canvas');
    this.offscreenRender.width = TILE_SIZE*this.width;
    this.offscreenRender.height = TILE_SIZE*this.height;
    this.renderOffscreenMap();
  };

  Map2D.prototype = {
    collision: function (x, y) {
      // The grid contains collision information for the map and objects.
      if (!this.gridOrig.isWalkableAt(x, y))
        return true;

      // Check for collision with character positions
      for (var prop in this.occupied)
        if (x === this.occupied[prop][0] && y === this.occupied[prop][1])
          return true;

      return false;
    },
    renderOffscreenMap: function() {
      var ctx = this.offscreenRender.getContext('2d');
      for (var i = 0; i < this.width; i++) {
        for (var j = 0; j < this.height; j++) {
	        // No need to render transparent tile
	        if (this.layout[i][j] === 1)
	          continue;

          ctx.drawImage(this.tileset, (this.layout[i][j]%10)*TILE_SIZE,
            Math.floor(this.layout[i][j]/10.0)*TILE_SIZE, TILE_SIZE,
            TILE_SIZE, TILE_SIZE*i, TILE_SIZE*j, TILE_SIZE, TILE_SIZE);
        }
      }

      for (var k=0; k < this.objectSprites.length; k++)
      {
        this.objectSprites[k].drawBackground(ctx);
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
