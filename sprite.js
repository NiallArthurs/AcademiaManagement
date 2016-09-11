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
    this.cameraMapPosition = 0;
    this.cameraScreenPosition = 0;
    this.inputCallback = _inputCallback;
    var self = this;
    amplify.subscribe( "dt", function (data) {
      self.tick(data);
    });
    amplify.subscribe( "camera-pos", function (mPos, sPos) {
      self.cameraPosition(mPos, sPos);
    });
    amplify.subscribe( "mousedown", function(ev) {
      self.input(ev);
    });
  };

  Sprite.prototype = {
    input: function (data) {
      // Sprite should handle mouse events.
      if (typeof this.inputCallback  === "function") {
          var x = data["ev"].pageX - data["offsetLeft"];
          var y = data["ev"].pageY - data["offsetTop"];

          var xPos = this.getX();
          var yPos = this.getY();
          if (x >= xPos && x <= (xPos+this.spriteWidth) && y >= yPos  && y <= (yPos+this.spriteHeight))
            this.inputCallback(x, y);
        }
    },
    cameraPosition: function(mPos, sPos) {
      this.cameraMapPosition = mPos;
      this.cameraScreenPosition = sPos;
    },
    tick: function(dt) {
      this.time += dt;
      if (this.time >= this.animations[this.state]["speed"])
      {
          this.frame = (this.frame + 1) % this.animations[this.state]["frames"].length;
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
      return cameraScreenPosition[0] + TILE_SIZE*(this.x - cameraMapPosition[0]);
    },
    getY: function() {
      return cameraScreenPosition[1] + TILE_SIZE*(this.y - cameraMapPosition[1])-(this.spriteHeight-TILE_SIZE);
    },
    getSX: function() {
      return this.animations[this.state]["frames"][this.frame]*this.spriteWidth % this.width;
    },
    getSY: function() {
      return this.spriteHeight*Math.floor(this.animations[this.state]["frames"][this.frame]/(this.width/this.spriteWidth));
    }
  }

  return Sprite;
})();
