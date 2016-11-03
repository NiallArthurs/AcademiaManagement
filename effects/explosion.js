var Particle = (function () {

  var Particle = function(_x, _y, _vx, _vy, _scale, _scaleSpeed) {
    this.scale = _scale || 1.0 ;
    this.x = _x || 0;
    this.y = _y || 0;
    this.vx = _vx || 0;
    this.vy = _vy || 0;
    this.scaleSpeed = _scaleSpeed || -1;
    this.tickFn = this.tick.bind(this);
    this.dt = 0;
    this.hide = false;

    amplify.subscribe( "dt", this.tickFn);
  };

  Particle.prototype = {
    tick: function(dt) {
      this.dt = dt;
    },
    update: function() {

      if (this.scaleSpeed != -1)
      {
        this.scale -= this.scaleSpeed * this.dt;

        if (this.scale <= 0)
        {
          this.scale = 0;
          this.hide = true;
        }
      }

      this.x += this.velocityX * this.dt;
      this.y += this.velocityY * this.dt;
    },
    draw: function(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius*this.scale, 0, Math.PI*2, true);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
    },
    cleanup:function() {
      amplify.unsubscribe( "dt", this.tickFn);
    }
  };

  return Particle;
})();

var Explosion = (function () {

  var Explosion = function(_x, _y, _nParticles) {
    this.x = _x || 0;
    this.y = _y || 0;
    this.particles = [];
    this.hide = false;
    this.nParticles = _nParticles || 10;

    var colors = ['red', 'yellow', 'orange']
    for (var angle=0; angle < 360; angle += Math.round(360/this.nParticles))
    {
      var particle = new Particle(this.x, this.y);
		  particle.radius = randomFloat(10, 30);
      particle.scaleSpeed = randomFloat(1.0, 4.0);
      var speed = randomFloat(60.0, 200.0);
      particle.velocityX = speed * Math.cos(angle*Math.PI/180.0);
      particle.velocityY = speed * Math.sin(angle*Math.PI/180.0);
      particle.color = colors[getRandomInt(0, 2)];
      this.particles.push(particle);
    }

  };

  Explosion.prototype = {
    update: function() {

      if (this.hide)
        return;

      var count = 0;

      for (var i = this.particles.length; i--;)
      {
        this.particles[i].update();
        if (this.particles[i].hide)
          count++;
      }

      if (this.particles.length === count)
      {
        this.hide = true;
        for (var j = this.particles.length; j--;)
        {
          this.particles[j].cleanup();
        }
      }

    },
    draw: function(ctx) {
      for (var k = this.particles.length; k--;)
      {
        this.particles[k].draw(ctx)
      }
    }
  };

  return Explosion;
})();
