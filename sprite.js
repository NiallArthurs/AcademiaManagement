// Sprite class
var Sprite = (function () {

  var Sprite = function(_spritesheet, _swidth, _sheight, _width, _height, _animations, _state) {
    this.spritesheet = _spritesheet;
    // Should get the below two from the image!
    this.width = _width;
    this.height = _height;
    this.spriteWidth = _swidth;
    this.spriteHeight = _sheight;
    this.animations = _animations;
    this.dt = 0;
    this.time = 0;
    this.state = _state;
    this.frame = 0; //move along the animation
    var self = this;
    amplify.subscribe( "dt", function (data) {
      self.tick(data);
    });
  };

  Sprite.prototype = {
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
      return this.animations[this.state]["frames"][this.frame]*this.spriteWidth % this.width;
    },
    getY: function() {
      return this.spriteHeight*Math.floor(this.animations[this.state]["frames"][this.frame]/(this.width/this.spriteWidth));
    }
  }

  return Sprite;
})();
