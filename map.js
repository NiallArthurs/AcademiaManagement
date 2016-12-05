var TileMap = {
  name : '',
  occupied : {},
  offscreenRender : document.createElement('canvas'),
  initializeMap: function(_mapobj, entities) {
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
    for (var i = this.width; i--;) {
      for (var j = this.height; j--;) {
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

    // Initialise the A* finder library
    this.finder = new PF.AStarFinder();

    // Render Map offscreen
    this.offscreenRender.width = TILE_SIZE*this.width;
    this.offscreenRender.height = TILE_SIZE*this.height;
    this.renderOffscreenMap();
    // Add objects to the entity array
    this.populateObjects(entities);
  },
  collision: function(x, y) {
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
    ctx.fillRect(0, 0, this.width, this.height);

    for (var i = this.width; i--;) {
      for (var j = this.height; j--;) {
        // No need to render transparent tile
        if (this.layout[i][j] === 1)
          continue;

        ctx.drawImage(this.tileset, (this.layout[i][j]%10)*TILE_SIZE,
          Math.floor(this.layout[i][j]/10.0)*TILE_SIZE, TILE_SIZE,
          TILE_SIZE, TILE_SIZE*i, TILE_SIZE*j, TILE_SIZE, TILE_SIZE);
      }
    }
  },
  clearObjects: function(entities) {
    for (var k = entities.length; k--;)
    {
      if (entities[k].type === 'object') {
        entities.splice(i, k);
      }
    }
  },
  populateObjects: function(entities) {
    for (var prop in this.objects) {
      var objSprite = new ObjectSprite(prop, this.atlas, this.objects[prop].width,
        this.objects[prop].height, this.objects[prop].xPos, this.objects[prop].yPos,
        this.objects[prop].xTile, this.objects[prop].yTile, this.objects[prop].zPos);

      // Popup notifications for foreground objects
      if (this.objects[prop].popupText !== undefined) {
      objSprite.notifyText = this.objects[prop].popupText;
      objSprite.inputCallback = function() {amplify.publish('popup-text',
        this.getX(), this.getY(), this.notifyText);};
      }
      entities.push(objSprite);
    }
  },
  getRandomPosition: function() {
    // Return random map position
    var tx = 0, ty = 0;

    do {
        tx = getRandomInt(0, this.width-1);
        ty = getRandomInt(0, this.height-1);
    } while (this.collision(tx, ty));

    return [tx, ty];
  },
  generatePath: function(x0, y0, x, y) {
    var grid = this.gridOrig.clone();
    return this.finder.findPath(x0, y0, x, y, grid);
  },
  setCharacterOccupied: function (name, x, y) {
    this.occupied[name] = [x, y];
  },
  deleteCharacterOccupied: function(name) {
    delete this.occupied[name];
  },
  draw: function(ctx) {
    var x = Math.floor(cameraScreenPosition[0]-TILE_SIZE*cameraMapPosition[0]);
    var y = Math.floor(cameraScreenPosition[1]-TILE_SIZE*cameraMapPosition[1]);
    ctx.drawImage(this.offscreenRender, x, y, this.offscreenRender.width,
      this.offscreenRender.height);
  }
};
