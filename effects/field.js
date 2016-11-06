var Field = (function () {

  var Field = function(_xfun, _yfun) {
    this.xFn = _xfun;
    this.yFn = _yfun;
    this.tickFn = this.tick.bind(this);
    this.dt = 0;
    this.visible = true;
    this.maxRadius = TILE_SIZE*2;
    this.radius = 0.0;
    this.speed = 20;
    this.fadeSpeed = 5;
    this.alpha = 1.0;

    amplify.subscribe('dt', this.tickFn);

  };

  Field.prototype = {
    tick: function(dt) {
      this.dt = dt;
    },
    update: function() {

      if (!this.visible)
      return;

      if (this.radius >= this.maxRadius) {
        this.alpha -= this.fadeSpeed*this.dt;

        if (this.alpha <= 0) {
          this.alpha = 1.0;
          this.radius = 0;
        }
      } else {
        this.radius += this.speed*this.dt;
      }
    },
    draw: function(ctx) {
      ctx.beginPath();
      ctx.globalAlpha = this.alpha;
      ctx.strokeStyle = 'red';
      ctx.arc(this.xFn(), this.yFn(), this.radius, 0, 2*Math.PI);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    },
    cleanup: function () {
      amplify.unsubscribe('dt', this.tickFn);
    }
  };

  return Field;
})();
