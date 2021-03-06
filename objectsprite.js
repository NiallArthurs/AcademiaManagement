// Object Sprite class (for non-animated sprites taken from an atlas)
var ObjectSprite = (function () {

  var ObjectSprite = function(_name, _spritesheet, _swidth, _sheight, _sx, _sy, _x, _y, _zpos, _inputCallback) {
    this.spritesheet = _spritesheet;
    this.name = _name;
    this.type = 'object'
    this.sx = _sx;
    this.sy = _sy;
    this.x = _x; // Tile x
    this.y = _y; // Tile y
    this.spriteWidth = _swidth;
    this.spriteHeight = _sheight;
    this.z = _zpos;
    if (_inputCallback !== undefined)
      this.inputCallback = _inputCallback;
    this.pause = false;
    this.pauseFn = this.pauseSprite.bind(this);
    this.mousedownFn = this.inputMouseDown.bind(this);
    amplify.subscribe('pause', this.pauseFn);
    amplify.subscribe('mousedown', this.mousedownFn);
  };

  ObjectSprite.prototype = {
    pauseSprite: function (val) {
      if (val) {
        this.pause = true;
      } else if (!val) {
        this.pause = false;
      }
    },
    inputMouseDown: function (data) {
      if (this.pause)
        return;

      // Sprite should handle mouse events.
      if (typeof this.inputCallback  === 'function') {
          var x = data.ev.pageX - data.offsetLeft;
          var y = data.ev.pageY - data.offsetTop;

          var xPos = this.getX();
          var yPos = this.getY();
          if (x >= xPos && x <= (xPos+this.spriteWidth) && y >= yPos  && y <= (yPos+this.spriteHeight))
            this.inputCallback(x, y);
        }
    },
    getTileX: function() {
      return this.x;
    },
    getTileY: function() {
      return this.y;
    },
    getX: function() {
      return Math.floor(cameraScreenPosition[0] +TILE_SIZE*(this.x - cameraMapPosition[0]));
    },
    getY: function() {
      return Math.floor(cameraScreenPosition[1] + TILE_SIZE*(this.y - cameraMapPosition[1]));
    },
    draw: function(ctx) {
      ctx.drawImage(this.spritesheet, this.sx, this.sy, this.spriteWidth, this.spriteHeight, this.getX(), this.getY(), this.spriteWidth, this.spriteHeight);
    },
    cleanup: function() {
      amplify.unsubscribe('pause', this.pauseFn);
      amplify.unsubscribe('mousedown', this.mousedownFn);
    }
  }

  return ObjectSprite;
})();
