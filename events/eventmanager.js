// Event Manager class
var EventManager = (function () {

  var EventManager = function(_entities, _map) {
    this.dt = 0;
    this.map = _map;
    this.entities = _entities;
    this.effects = [];
    this.events = eventsMain;
    this.last = -1;
    this.multipliers = {};
    this.queue = [];

    // Create the event API object exposing required functions.
    this.eventAPI = {};
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
  };

  EventManager.prototype = {
    addQueue: function(_duration, _callback) {
      this.queue.push({t0: Time.getTime(), duration: _duration, callback: _callback})
    },
    checkQueue: function() {
      // The queue is used to defer functions for an arbitrary duration
      for (var k = this.queue.length; k--;) {
        if (Time.getTime() - this.queue[k].t0 >= this.queue[k].duration) {
          this.queue[k].callback();
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
              if (this.events[obj].start !== undefined) {
                this.events[obj].start(this.eventAPI);
              }
              this.events[obj].t0 = time;

              var self = this;
              this.addQueue(this.events[obj].duration, function() {
                self.events[obj].active = false;
                if (self.events[obj].finish !== undefined) {
                  self.events[obj].finish(self.eventAPI);
                }
                self.events[obj].complete = true;
              });
            }
          }
        }
        else if (this.events[obj].type === 'random') {
          if (time - this.last > 0) {

          if (!this.events[obj].active) {
            if (Math.random() < this.events[obj].probability) {
              if (this.events[obj].prequisites(this.eventAPI)) {
                this.events[obj].active = true;
                if (this.events[obj].start !== undefined) {
                  this.events[obj].start(this.eventAPI);
                }
                this.events[obj].t0 = time;

                var self = this;
                this.addQueue(this.events[obj].duration, function() {
                  self.events[obj].active = false;
                  if (self.events[obj].finish !== undefined) {
                    self.events[obj].finish(self.eventAPI);
                  }
                });
              }
            }
          }
        }
        }
      }
      this.last = time;
    },
    attempt: function() {
      // Attempt to start events and close any events which are complete.
      var time = Time.getDay();
      if (time - this.last > 0) {
        for (var obj in this.events) {
          if (this.events[obj].active) {
            if ((time - this.events[obj].t0) >= this.events[obj].duration) {
              this.events[obj].active = false;
              this.events[obj].finish(this.eventAPI);
            }
          } else {
            if (this.events[obj].prequisites(this.eventAPI)) {
              if (Math.random() < this.events[obj].probability) {
                this.events[obj].active = true;
                this.events[obj].start(this.eventAPI);
                this.events[obj].t0 = time;
                // If we start an event today wait until tomorrow before starting
                // another event.
                this.last = time;
                return;
              }
            }
          }
        }
        this.last = time;
      }
    },
    update: function() {
      // Delete ui elements which are no longer visible
      var i = this.effects.length;

      while (i--) {
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
    setCharacterProperty(character, property, value, duration) {
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
    setCharacterSpeed(character, speed, duration) {
      var tmpChar = this.getEntityFromName(character);

      if (tmpChar === undefined)
        return;

      tmpChar[1].speed = speed;

      this.addQueue(duration, function(){
        // Reset character walkspeed to default
        if (tmpChar[1] === undefined)
          return;

        tmpChar[1].speed = uiStyle.character.walkspeed;
      });
    },
    setMultiplier: function(character, multiplier, duration) {
      var tmp = this.getEntityFromName(character);

      if (tmp === undefined)
        return;

      if (this.multipliers[character] === undefined) {
        this.multipliers[character] = [];
      }

      // Multipliers are stackable (so you can have multiple buffs at the same time).
      this.multipliers[character].push(multiplier);

      var self = this;
      var len = this.multipliers[character].len;
      this.addQueue(duration, function(){self.multipliers[character].splice(len-1, 1);});

      this.calcAndAssign(character);
    },
    calcAndAssign: function(character) {
      var tmp = this.getEntityFromName(character);

      if (tmp === undefined)
        return;

      var calc = this.multipliers[character].reduce(function(a,b){return a*b;}, 1.0);
      tmp[1].multiplier = calc;
    },
    setCharacterState: function(character, state) {
      var tmp = this.getEntityFromName(character);

      if (tmp === undefined)
        return;

      var states = ['work', 'sleep', 'rest'];

      if (states.includes(state) && tmp !== undefined) {
        tmp[1].activeState = states.indexOf(state);
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

      if (ent === undefined)
        return;

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
        if (this.entities[k].type === 'character')
          chars[this.entities[k].name] = {'x': this.entities[k].sprite.x,
          'y': this.entities[k].sprite.y, 'level': this.entities[k].level,
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

  return EventManager;
})();
