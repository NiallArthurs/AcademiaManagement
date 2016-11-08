// Character class
var Character = (function () {

  var Character = function(_map, _name) {
    this.map = _map;
    this.name = _name;
    this.level = 1;
    this.experiments = getRandomInt(1, 40)/(5*60);
    this.theory = getRandomInt(1, 40)/(5*60);
    this.computation = getRandomInt(1, 40)/(5*60);
    this.multiplier = 1;
    this.direction = 1; // 0 = up, 1 = down, 2 = left, 3 = right
    this.path = [];
    this.effects = [];
    this.dt = 0;
    this.type = 'character';
    this.speed = uiStyle.character.walkspeed; // Movement speed - pixels/second
    this.state = ['work', 'sleep', 'rest'];
    // Randomly assign state for now
    this.activeState = getRandomInt(0,2);
    this.sprite = new Sprite(char, 32, 42,32*3,42*4,  animations, 'walkdown', this.inputMouseDown.bind(this));
    var ranPos = this.randomPosition();
    this.sprite.x = ranPos[0];  // Current x tile
    this.sprite.y = ranPos[1]; // Current y tile
    this.z = 0;
    this.points = [0.0, 0.0, 0.0];
    // Parameters for notifications which float up from the character
    this.float = {position: 0,
      offset: getRandomInt(-5, 5),
      height: getRandomInt(10, 20),
      reset: function() {this.position=0; this.offset=getRandomInt(-5,5); this.height=getRandomInt(10, 20);}};

    this.researchPoints = [];
    // subscribe to dt
    this.dtFn = this.tick.bind(this);
    amplify.subscribe('dt', this.dtFn);
    };

    Character.prototype = {
      tick: function(dt) {
        this.dt = dt;
      },
      inputMouseDown: function (data) {
        var self = this;
        var menu = [['Text Notification', function characterMenu() {amplify.publish('popup-text', self.sprite.getX(), self.sprite.getY(), 'My name is '+self.name);}],
        ['Move', function characterSetMove() {if (self.path.length === 0) self.randomMove();}],
        ['Work', function characterSetWork() {if (self.state[self.activeState] !== 'work') self.activeState = 0;}],
        ['Sleep', function characterSetSleep() {if (self.state[self.activeState] !== 'sleep') self.activeState = 1;}],
        ['Explosion', function characterExplosion() {self.effects.push(new Explosion(self.sprite.getX()
          +self.sprite.spriteWidth/2, self.sprite.getY()+self.sprite.spriteHeight/2, 30));}],
        ['Field', function characterField() {self.effects.push(new Field(function x(){return self.sprite.getX()+self.sprite.spriteWidth/2;}, function y(){return self.sprite.getY()+self.sprite.spriteHeight/2} ));}]];

        amplify.publish('popup-menu', this.sprite.getX(), this.sprite.getY(), menu);
      },
      update: function () {
        // If the path isn't empty have the character follow it.
        if (this.path.length !== 0)
        {
          if (this.sprite.x === this.path[0][0] && this.sprite.y === this.path[0][1]) {
            this.path.shift();
          }

          if (this.path.length !== 0) {
            // Move the character position along the path
            if (this.sprite.x - this.path[0][0] > 0) {
              if (this.sprite.x - (this.speed*this.dt) < this.path[0][0]) {
                this.sprite.x = this.path[0][0];
              }
              else {
                this.sprite.x -= (this.speed*this.dt);
              }
              this.sprite.setState('walkleft');
              this.direction = 2;
            }
            else if (this.sprite.x - this.path[0][0] < 0) {
              if (this.sprite.x + (this.speed*this.dt) > this.path[0][0]) {
                this.sprite.x = this.path[0][0];
              }
              else {
                this.sprite.x += (this.speed*this.dt);
              }
              this.sprite.setState('walkright');
              this.direction = 3;
            }
            else if (this.sprite.y - this.path[0][1] > 0) {
              if (this.sprite.y - (this.speed*this.dt) < this.path[0][1]) {
                this.sprite.y = this.path[0][1];
              } else {
                this.sprite.y -= (this.speed*this.dt);
              }
              this.sprite.setState('walkup');
              this.direction = 0;
            }
            else if (this.sprite.y - this.path[0][1] < 0) {
              if (this.sprite.y + (this.speed*this.dt) > this.path[0][1]) {
                this.sprite.y = this.path[0][1];
              }
              else {
                this.sprite.y += (this.speed*this.dt);
              }
              this.sprite.setState('walkdown');
              this.direction = 1;
            }
          }
        } else {
          if (this.direction === 1) {
            this.sprite.setState('down');
          }
          else if (this.direction === 0) {
            this.sprite.setState('up');
          }
          else if (this.direction === 3) {
            this.sprite.setState('right');
          }
          else if (this.direction === 2) {
            this.sprite.setState('left');
          }
        }

        if (this.state[this.activeState] === 'sleep') {
          this.float.position += this.float.height*this.dt;
        }
        else if (this.state[this.activeState] === 'work') {
          // If we are working start to generate research points
          this.points[0] += this.dt*this.level*this.multiplier*this.experiments;
          this.points[1] += this.dt*this.level*this.multiplier*this.computation;
          this.points[2] += this.dt*this.level*this.multiplier*this.theory;

          for (var i=0; i < 3; i++) {
            if (this.points[i] >= 1.0) {
              GameState.addResearchPoint(i, Math.floor(this.points[i]));
              this.researchPoints.push([i, Math.floor(this.points[i])]);
              this.points[i] = 0.0;
            }
          }

          // Move the notification
          if (this.researchPoints.length)
            this.float.position += this.float.height*this.dt*(1/3);

          // Randomly walk aroud when working
          if (this.path.length === 0)
            this.randomMove();
        }

        for (var k = this.effects.length; k--;) {
          this.effects[k].update();
        }


        if (this.effects.length && this.effects[0].hide) {
          this.effects.shift();
        }

      },
      draw: function(ctx) {

        this.sprite.draw(ctx);

        // Draw state based animations
        if (this.state[this.activeState] === 'sleep' && !this.path.length)
          this.drawSleep(ctx);
        else if (this.state[this.activeState] === 'work')
          this.drawWork(ctx);

        for (var k = this.effects.length; k--;)
            this.effects[k].draw(ctx);
      },
      drawWork: function(ctx) {
        // Show generated research points (An E/C/T floats up from the character
        // slowly fading away). We work our way through the queue.
        if (this.researchPoints.length)
        {
          ctx.font = 'bold 20px Arial';
          var string;
          if (this.researchPoints[0][0] === 0) {
            string = this.researchPoints[0][1] === 1 ? 'E' : this.researchPoints[0][1]+'xE';
            ctx.fillStyle = 'rgba(255, 0, 0, ' + (1-(this.float.position/(this.float.height))) + ')';
          } else if (this.researchPoints[0][0] === 1) {
            string = this.researchPoints[0][1] === 1 ? 'C' : this.researchPoints[0][1]+'xC';
            ctx.fillStyle = 'rgba(0, 255, 0,' + (1-(this.float.position/(this.float.height))) + ')';
          } else if (this.researchPoints[0][0] === 2) {
            string = this.researchPoints[0][1] === 1 ? 'T' : this.researchPoints[0][1]+'xT';
            ctx.fillStyle = 'rgba(0, 0, 255, ' + (1-(this.float.position/(this.float.height))) + ')';
          }

          var sWidth = ctx.measureText(string).width;
          if (this.float.position < (this.float.height))
            ctx.fillText(string, this.sprite.getX()-sWidth/2+this.sprite.spriteWidth/2, this.sprite.getY()-this.float.position);
          else {
            this.researchPoints.shift();
            this.float.reset();
            this.float.height = 20;
          }
        }
      },
      drawSleep: function(ctx) {
        // Use a combination of the float parameters to get a random sleep patern
        ctx.font = this.float.height+'px Arial';
        ctx.fillStyle = 'rgba(0, 0, 0, ' + (1-(this.float.position/(this.float.height+this.float.offset))) + ')';
        var zWidth = ctx.measureText("z").width;

        if (this.float.position < (this.float.height+this.float.offset))
          ctx.fillText("z", this.sprite.getX()-zWidth/2+this.float.offset+this.sprite.spriteWidth/2, this.sprite.getY()-this.float.position);
        else
          this.float.reset();

      },
      randomPosition: function() {
        // Move to random position - testing
        var tx = 0, ty = 0;

        do{
          tx = getRandomInt(0,this.map.width-1);
          ty = getRandomInt(0,this.map.height-1);
        } while (this.map.collision(tx, ty));

        return [tx, ty];
      },
      randomMove: function() {
        var pos = this.randomPosition();
        this.move(pos[0], pos[1]);
      },
      move: function(xDest, yDest) {
        this.path = this.map.generatePath(this.sprite.x, this.sprite.y, xDest, yDest);
        this.map.occupied[this.name] = [xDest, yDest];
      },
      cleanup: function () {
        amplify.unsubscribe( 'dt', this.dtFn);
        delete this.map.occupied[this.name];
        this.sprite.cleanup();
      }
    };

    return Character;
  })();
