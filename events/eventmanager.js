// Event Manager class
var EventManager = {
    effects : [],
    last : -1,
    events : eventsMain,
    multipliers : {},
    queue : [],
    entities : undefined,
    eventAPI : {},
    initialize: function(_entities) {
      // Set map and entities
      this.entities = _entities;

      // Populate the event API object exposing required functions.
      this.eventAPI.getCharacters = this.getCharacters.bind(this);
      this.eventAPI.getMapObjects = this.getMapObjects.bind(this);
      //this.eventAPI.changeSprite = this.changeSprite.bind(this);
      this.eventAPI.addEffect = this.addEffect.bind(this);
      this.eventAPI.displayNotification = this.displayNotification.bind(this);
      this.eventAPI.getResearchPoints = this.getResearchPoints.bind(this);
      this.eventAPI.getPublications = this.getPublications.bind(this);
      this.eventAPI.sendEmail = EmailManager.createEmail.bind(EmailManager);
      this.eventAPI.getGrantValue = GameState.determineTotalGrantFunding.bind(GameState);
      this.eventAPI.getCurrentTime = Time.getCurrent.bind(Time);
      this.eventAPI.getDay = Time.getDay.bind(Time);
      this.eventAPI.setCharacterProperty = this.setCharacterProperty.bind(this);
      this.eventAPI.getRandomMapPosition = TileMap.getRandomPosition.bind(TileMap);
      this.eventAPI.testCollision = TileMap.collision.bind(TileMap);
      this.eventAPI.createTemporaryCharacter = this.createDummyCharacter.bind(this);
      this.eventAPI.findNearbyLocation = this.findNearbyLocation.bind(this);
    },
    addQueue: function(_duration, _callback, _arg) {
      if (_arg === undefined) {
        this.queue.push({t0: Time.getTime(), duration: _duration, callback: _callback});
      }
      else {
        this.queue.push({t0: Time.getTime(), duration: _duration, callback: _callback, arg: _arg});
      }
    },
    checkQueue: function() {
      // The queue is used to defer functions for an arbitrary duration
      for (var k = this.queue.length; k--;) {
        if (Time.getTime() - this.queue[k].t0 >= this.queue[k].duration) {
          if (this.queue[k].arg === undefined) {
          this.queue[k].callback();
        }
        else {
          this.queue[k].callback(this.queue[k].arg);
        }
          this.queue.splice(k, 1);
        }
      }
    },
    eventUpdate: function () {
      var time = Time.getDay();
      for (var obj in this.events) {
        if (this.events[obj].type === 'main') {
          if (this.events[obj].complete === undefined && !this.events[obj].active) {
            if (this.events[obj].prequisites(this.eventAPI)) {

              this.events[obj].active = true;
              this.events[obj].start(this.eventAPI);

              var self = this;
              this.addQueue(this.events[obj].duration, function(ev) {
                self.events[ev].finish(self.eventAPI);
                self.events[ev].active = false;
                self.events[ev].complete = true;
              }, obj);
            }
          }
        }
        else if (this.events[obj].type === 'random') {
          if (!this.events[obj].active && time - this.last > 0) {
            if (Math.random() < this.events[obj].probability) {
              if (this.events[obj].prequisites(this.eventAPI)) {

                this.events[obj].active = true;
                this.events[obj].start(this.eventAPI);

                var self = this;
                this.addQueue(this.events[obj].duration, function(ev) {
                  self.events[ev].finish(self.eventAPI);
                  self.events[ev].active = false;
                }, obj);
                this.last = time;
              }
            }
          }
        }
      }

      if (time - this.last > 0) this.last = time;
    },
    update: function() {

      // Delete ui elements which are no longer visible
      for (var i = this.effects.length; i--;) {
        if (!this.effects[i].visible) {
          this.effects.splice(i, 1);
        }
      }

      this.eventUpdate();
      this.checkQueue();

      for (var obj in this.events) {
        if (this.events[obj].active && this.events[obj].update !== undefined) {
          this.events[obj].update(this.eventAPI);
        }
      }

      for (var k = this.effects.length; k--;) {
        this.effects[k].update();
      }

    },
    draw: function(ctx) {
      for (var k = this.effects.length; k--;) {
        this.effects[k].draw(ctx);
      }
    },
    findNearbyLocation: function(x,y) {
      if (!TileMap.collision(Math.floor(x), Math.floor(y)))
        return [Math.floor(x), Math.floor(y)];

      var points = [];

      // We make a list of surrounding non-collision tiles.
      var depth = 3;

      for (var offX = -depth; offX < depth + 1; offX++) {
        for (var offY = -depth; offY < depth + 1; offY++) {
          if (offX !== 0 && offY !== 0) {
            if (!TileMap.collision(Math.floor(x) + offX, Math.floor(y) + offY))
              points.push([Math.floor(x) + offX, Math.floor(y) +offY]);
          }
        }
      }

      if (!points.length)
        return undefined;

      // Sort the list by distance to destination and return nearest
      points.sort(function (a,b) {
          var d1 = (x-a[0])*(x-a[0])+(y-a[1])*(y-a[1]);
          var d2 = (x-b[0])*(x-b[0])+(y-b[1])*(y-b[1]);
	        return d1 == d2 ? 0: (d1 > d2 ? 1 : -1);
	      });

      return points[0];
    },
    createDummyCharacter: function(name, x, y) {
      var prop = {};
      prop.x = x;
      prop.y = y;
      prop.dummy = true;
      var character = CharacterManager.createCharacter(name, prop);

      // We return an object which lets the event control the dummy character.
      // The event must issue the remove command or the character will persist
      // once the event has finished.
      charAPI = {};
      charAPI.getX = character.getTileX.bind(character);
      charAPI.getY = character.getTileY.bind(character);
      charAPI.moveTo = character.move.bind(character);
      charAPI.path = character.getPath.bind(character);
      charAPI.remove = function() {
        CharacterManager.removeCharacter(name);
	// Remove all references to character functions (so the garbage collector deletes the object).
        this.moveTo = undefined;
        this.path = undefined;
	this.getX = undefined;
	this.getY = undefined;
      };
      return charAPI;
    },
    setCharacterProperty: function(character, property, value, duration) {
      switch (property) {
        case 'multiplier':
          this.setMultiplier(character, value, duration);
          break;
        case 'state':
          this.setCharacterState(character, value);
          break;
        case 'speed':
          this.setCharacterSpeed(character, value, duration);
          break;
        default:
          return;
      }
    },
    setCharacterSpeed: function(character, speed, duration) {
      amplify.publish('characterprop', character, 'speed', speed);

      // Reset character walkspeed to default
      this.addQueue(duration, function() {
        amplify.publish('characterprop', character, 'speed', uiStyle.character.walkspeed);
      });
    },
    setMultiplier: function(character, multiplier, duration) {
      var tmp = this.getEntityFromName(character);

      if (tmp === undefined) return;

      if (this.multipliers[character] === undefined) this.multipliers[character] = [];

      // Multipliers are stackable (so you can have multiple buffs at the same time).
      this.multipliers[character].push(multiplier);

      var self = this;
      var len = this.multipliers[character].len;
      this.addQueue(duration, function() {
        self.multipliers[character].splice(len-1, 1);
      });

      this.calcAndAssign(character);
    },
    calcAndAssign: function(character) {
      var calc = this.multipliers[character].reduce(function(a, b){return a*b;}, 1.0);
      amplify.publish('characterprop', character, 'multiplier', calc);
    },
    setCharacterState: function(character, state) {
      var states = ['work', 'sleep', 'rest'];

      if (states.includes(state)) {
        amplify.publish('characterprop', character, 'state', states.indexOf(state));
      }
    },
    getResearchPoints: function() {
      return [GameState.computationPoints, GameState.experimentPoints, GameState.theoryPoints];
    },
    displayNotification: function(text, fun) {
      amplify.publish('popup-text', canvas.width/2, canvas.height/2, text, fun);
    },
    getEntityFromName: function(character) {
      for (var k = this.entities.length; k--;) {
        if (this.entities[k].type === 'character') {
          if (this.entities[k].name === character) {
            return ['character', this.entities[k]];
          }
        } else if (this.entities[k].type === 'object') {
          if (this.entities[k].name === character) {
            return ['object', this.entities[k]];
          }
        }
      }
      return undefined;
    },
    addEffect: function(entity, type, duration) {
      var ent = this.getEntityFromName(entity);

      if (ent === undefined) return;

      var xPos, yPos;
      if (ent[0] === 'character') {
        xPos = function () {
          return ent[1].sprite.getX() + ent[1].sprite.spriteWidth/2;
        };

        yPos = function () {
          return ent[1].sprite.getY() + ent[1].sprite.spriteHeight/2;
        };
      }
      else if (ent[0] === 'object') {
        xPos = function () {
          return ent[1].getX() + ent[1].spriteWidth/2;
        };

        yPos = function () {
          return ent[1].getY() + ent[1].spriteHeight/2;
        };
      }

      if (type === 'explosion') {
        var effect = new Explosion(xPos(), yPos(), 30);
      } else if (type === 'field') {
        var effect = new Field(xPos, yPos);

        var self = this;
        var len = this.effects.length;
        // The position the effect will be added to is len not len-1
        this.addQueue(duration, function() {
          if (typeof self.effects[len].cleanup !== undefined) {
            self.effects[len].cleanup();
          }
          self.effects.splice(len, 1);
        });
      }

      this.effects.push(effect);
    },
    getPublications: function() {
      return GameState.publications;
    },
    getCharacters: function() {
      var chars = {};
      for (var k = this.entities.length; k--;) {
        if (this.entities[k].type === 'character' && this.entities[k].dummy === false)
          chars[this.entities[k].name] = {'x': Math.floor(this.entities[k].sprite.x),
            'y': Math.floor(this.entities[k].sprite.y), 'level': this.entities[k].level,
            'state': this.entities[k].state[this.entities[k].activeState],
            'multiplier': this.entities[k].multiplier,
            'walkspeed': this.entities[k].speed};
      }
      return chars;
    },
    getMapObjects: function() {
      var mapObjs = {};
      for (var k = this.entities.length; k--;) {
        if (this.entities[k].type === 'object')
          mapObjs[this.entities[k].name] = {'x': this.entities[k].x,
            'y': this.entities[k].y};
      }
      return mapObjs;
    },
    changeSprite: function(character, sprite) {
      character.oldSprite = character.sprite;
      character.sprite = sprite;
    }
};
