// Character class
var Character = (function () {

  var Character = function(_name, _sprite) {
    this.name = _name;
    this.level = 1;
    this.experiments = getRandomInt(1, 40)/(5*60);
    this.theory = getRandomInt(1, 40)/(5*60);
    this.computation = getRandomInt(1, 40)/(5*60);
    this.multiplier = 1;
    this.direction = 1; // 0 = up, 1 = down, 2 = left, 3 = right
    this.path = [];
    this.dt = 0;
    this.type = 'character';
    this.dummy = false;
    this.speed = uiStyle.character.walkspeed; // Movement speed - pixels/second
    this.state = ['work', 'sleep', 'rest'];
    // Randomly assign state for now
    this.activeState = getRandomInt(0,2);
    this.sprite = new Sprite(_sprite, 32, 42,32*3,42*4,  animations, 'walkdown', this.inputMouseDown.bind(this));
    var ranPos = TileMap.getRandomPosition();
    this.sprite.x = ranPos[0];  // Current x tile
    this.sprite.y = ranPos[1]; // Current y tile
    this.z = 0;
    this.points = [0.0, 0.0, 0.0];
    // Parameters for notifications which float up from the character
    this.float = {
      position: 0,
      offset: getRandomInt(-5, 5),
      height: getRandomInt(10, 20),
      reset: function() {
        this.position = 0;
        this.offset = getRandomInt(-5,5);
        this.height = getRandomInt(10, 20);
      }
    };

    this.researchPoints = [];

    // subscribe to dt
    this.dtFn = this.tick.bind(this);
    this.characterPropertyFn = this.setCharacterProperty.bind(this);
    amplify.subscribe('characterprop', this.characterPropertyFn);
    amplify.subscribe('dt', this.dtFn);
  };

  Character.prototype = {
    getTileX: function() {
      return this.sprite.x;
    },
    getTileY: function() {
      return this.sprite.y;
    },
    setCharacterProperty: function(character, property, value) {

      if (character !== this.name) return;

      switch (property) {
        case 'multiplier':
          this.multiplier = value;
          break;
        case 'state':
          this.activeState = value;
          break;
        case 'speed':
          this.speed = value;
          break;
        default:
          return;
      }
    },
    tick: function(dt) {
      this.dt = dt;
    },
    inputMouseDown: function (data) {
      var self = this;
      var menu = [['Text Notification', function characterMenu() {amplify.publish('popup-text', self.sprite.getX(), self.sprite.getY(), 'My name is '+self.name);}],
      ['Move', function characterSetMove() {if (self.path.length === 0) self.randomMove();}],
      ['Work', function characterSetWork() {if (self.state[self.activeState] !== 'work') self.activeState = 0;}],
      ['Sleep', function characterSetSleep() {if (self.state[self.activeState] !== 'sleep') self.activeState = 1;}]];

      amplify.publish('popup-menu', this.sprite.getX(), this.sprite.getY(), menu);
    },
    followPath: function() {
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
    },
    update: function () {

      // Have character follow the path if it exists
      this.followPath();

      // If dummy character we skip main logic
      if (this.dummy)
        return;

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
    },
    draw: function(ctx) {
      this.sprite.draw(ctx);

      // If dummy character we only draw the sprite
      if (this.dummy)
      return;

      // Draw state based animations
      if (this.state[this.activeState] === 'sleep' && !this.path.length)
      	this.drawSleep(ctx);
      else if (this.state[this.activeState] === 'work')
      	this.drawWork(ctx);
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
        ctx.fillText('z', this.sprite.getX()-zWidth/2+this.float.offset+this.sprite.spriteWidth/2, this.sprite.getY()-this.float.position);
      else
        this.float.reset();
    },
    randomMove: function() {
      var pos = TileMap.getRandomPosition();
      this.move(pos[0], pos[1]);
    },
    move: function(xDest, yDest) {
      this.path = TileMap.generatePath(this.sprite.x, this.sprite.y, xDest, yDest);
      TileMap.setCharacterOccupied(name, xDest, yDest);
    },
    getPath: function() {
      return this.path;
    },
    cleanup: function () {
      amplify.unsubscribe('characterprop', this.characterPropertyFn);
      amplify.unsubscribe('dt', this.dtFn);
      TileMap.deleteCharacterOccupied(this.name);
      this.sprite.cleanup();
    }
  };

  return Character;
})();
