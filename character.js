// Character class
var Character = (function () {

  var Character = function(_map) {
    this.map = _map;
    this.charname = "";
    this.level = 0;
    this.efficiency = 0;
    this.experiments = 0;
    this.theory = 0;
    this.computational = 0;
    this.direction = 1; // 0 = up, 1 = down, 2 = left, 3 = right
    this.path = [];
    this.dt = 0;
    this.speed = 1; // Movement speed - pixels/second
    var self = this;
    this.sprite = new Sprite(char, 32, 42,32*3,42*4,  animations, "walkdown", function() {self.input()});
    var rpos = this.randomPosition();
    this.sprite.x = rpos[0]  // Current y tile
    this.sprite.y = rpos[1]; // Current y tile
    // subscribe to dt
    amplify.subscribe( "dt", function (data) {
      self.dt = data;
    });
  };

  Character.prototype = {
    input: function (data) {
      // Testing
      if (this.path.length == 0)
      this.randomMove();
    },
    update: function () {
      // If the path isn't empty have the character follow it.
      if (this.path.length != 0)
      {
        if (this.sprite.x == this.path[0][0] && this.sprite.y == this.path[0][1]) {
          this.path.shift();
        }

        if (this.path.length != 0) {
          // Move the character position along the path
          if (this.sprite.x - this.path[0][0] > 0) {
            if (this.sprite.x - (this.speed*this.dt) < this.path[0][0]) {
              this.sprite.x = this.path[0][0];
            }
            else {
              this.sprite.x -= (this.speed*this.dt);
            }
            this.sprite.setState("walkleft");
            this.direction = 2;
          }
          else if (this.sprite.x - this.path[0][0] < 0) {
            if (this.sprite.x + (this.speed*this.dt) > this.path[0][0]) {
              this.sprite.x = this.path[0][0];
            }
            else {
              this.sprite.x += (this.speed*this.dt);
            }
            this.sprite.setState("walkright");
            this.direction = 3;
          }
          else if (this.sprite.y - this.path[0][1] > 0) {
            if (this.sprite.y - (this.speed*this.dt) < this.path[0][1]) {
              this.sprite.y = this.path[0][1];
            } else {
              this.sprite.y -= (this.speed*this.dt);
            }
            this.sprite.setState("walkup");
            this.direction = 0;
          }
          else if (this.sprite.y - this.path[0][1] < 0) {
            if (this.sprite.y + (this.speed*this.dt) > this.path[0][1]) {
              this.sprite.y = this.path[0][1];
            }
            else {
              this.sprite.y += (this.speed*this.dt);
            }
            this.sprite.setState("walkdown");
            this.direction = 1;
          }
        }
      } else {
        if (this.direction == 1) {
          this.sprite.setState("down");
        }
        else if (this.direction == 0) {
          this.sprite.setState("up");
        }
        else if (this.direction == 3) {
          this.sprite.setState("right");
        }
        else if (this.direction == 2) {
          this.sprite.setState("left");
        }
      }

    },
    randomPosition: function() {
      // Move to random position - testing
      tx = 0;
      ty = 0;
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
    },
  }

  return Character;
})();
