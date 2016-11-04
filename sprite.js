// Sprite class
var Sprite = (function () {

  var Sprite = function(_spritesheet, _swidth, _sheight, _width, _height, _animations, _state, _inputCallback) {
    this.spritesheet = _spritesheet;
    // Should get the below two from the image!
    this.width = _width;
    this.height = _height;
    this.x = 0; // Tile x
    this.y = 0; // Tile y
    this.spriteWidth = _swidth;
    this.spriteHeight = _sheight;
    this.animations = _animations;
    this.dt = 0;
    this.time = 0;
    this.state = _state;
    this.frame = 0; //move along the animation
    this.inputCallback = _inputCallback;
    this.pause = false;
    this.pauseFn = this.pauseSprite.bind(this);
    this.dtFn = this.tick.bind(this);
    this.mousedownFn = this.inputMouseDown.bind(this);
    amplify.subscribe('pause', this.pauseFn);
    amplify.subscribe('dt', this.dtFn);
    amplify.subscribe('mousedown', this.mousedownFn);
  };

  Sprite.prototype = {
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
    tick: function(dt) {
      if (this.pause)
        return;

      this.time += dt;
      if (this.time >= this.animations[this.state].speed)
      {
          this.frame = (this.frame + 1) % this.animations[this.state].frames.length;
          this.time = 0;
      }
    },
    setState: function(state) {
      if (state != this.state)
      {
        this.state = state;
        this.frame = 0;
        this.time = 0;
      }
    },
    getX: function() {
      return Math.floor(cameraScreenPosition[0] + TILE_SIZE*(this.x - cameraMapPosition[0]));
    },
    getY: function() {
      return Math.floor(cameraScreenPosition[1] + TILE_SIZE*(this.y - cameraMapPosition[1])-(this.spriteHeight-TILE_SIZE));
    },
    getSX: function() {
      return this.animations[this.state].frames[this.frame]*this.spriteWidth % this.width;
    },
    getSY: function() {
      return this.spriteHeight*Math.floor(this.animations[this.state].frames[this.frame]/(this.width/this.spriteWidth));
    },
    draw: function(ctx) {
      ctx.drawImage(this.spritesheet, this.getSX(), this.getSY(), this.spriteWidth, this.spriteHeight, this.getX(), this.getY(), this.spriteWidth, this.spriteHeight);
    },
    cleanup: function() {
      amplify.unsubscribe('pause', this.pauseFn);
      amplify.unsubscribe('dt', this.dtFn);
      amplify.unsubscribe('mousedown', this.mousedownFn);
    }
  }

  return Sprite;
})();
