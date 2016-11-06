// Event Manager class
var EventManager = (function () {

  var EventManager = function(_entities, _map) {
    this.dt = 0;
    this.map = _map;
    this.entities = _entities;
    this.effects = [];
    this.events = eventsMain;
    this.last = -1;
  };

  EventManager.prototype = {
    attempt: function() {
      // Attempt to start events and close any events which are complete.
      var time = Time.getDay();
      if (time - this.last > 0) {
        for (var obj in this.events) {
          if (this.events[obj].active) {
            if ((time - this.events[obj].t0) >= this.events[obj].duration) {
              this.events[obj].active = false;
              this.events[obj].finish(this.getEventsAPI());
            }
          } else {
            if (this.events[obj].prequisites(this.getEventsAPI())) {
              if (Math.random() < this.events[obj].probability) {
                this.events[obj].active = true;
                this.events[obj].start(this.getEventsAPI());
                this.events[obj].t0 = time;
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
        var del = false;
        if (typeof this.effects[i].duration !== undefined) {
            if (Time.getDay() - this.effects[i].t0 >= this.effects[i].duration) {
              if (typeof this.effects[i].cleanup !== undefined) {
                this.effects[i].cleanup();
              }
              del = true;
            }
        }

        if (!this.effects[i].visible) {
          del = true;
        }
      }

      if (del) {
        this.effects.splice(i, 1);
      }

      this.attempt();

      for (var obj in this.events) {
        if (this.events[obj].active)
          this.events[obj].update();
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
    getEventsAPI: function() {
      // Here we create an API objects which exposes all functions which an event can carry out.
      var eventAPI = {};
      eventAPI.getCharacters = this.getCharacters.bind(this);
      eventAPI.getMapObjects = this.getMapObjects.bind(this);
      //eventAPI.changeSprite = this.changeSprite.bind(this);
      eventAPI.addEffect = this.addEffect.bind(this);
      eventAPI.displayNotification = this.displayNotification.bind(this);
      eventAPI.getResearchPoints = this.getResearchPoints.bind(this);
      eventAPI.setCharacterState = this.setCharacterState.bind(this);
      eventAPI.getPublications = this.getPublications.bind(this);
      eventAPI.getGrantValue = GameState.determineTotalGrantFunding.bind(GameState);
      eventAPI.getCurrentTime = Time.getCurrent.bind(Time)
      return eventAPI;
    },
    setCharacterState: function(character, state) {
      var char = this.getCharacterFromName(character);

      states = ['work', 'sleep', 'rest'];
      if (states.includes(state) && char !== undefined) {
        char.activeState = states.indexOf(state);
      }
    },
    getResearchPoints: function() {
      return [GameState.computationPoints, GameState.experimentPoints, GameState.theoryPoints];
    },
    displayNotification: function(text) {
      amplify.publish('popup-text', canvas.width/2, canvas.height/2, text);
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
        effect.duration = duration;
        effect.t0 = Time.getDay();
      }

      this.effects.push(effect);
    },
    getPublications: function() {
      return GameState.publications;
    },
    getCharacters: function() {
      var chars = {};
      for (var k = this.entities.length; k--;)
      {
          if (this.entities[k].type === 'character')
            chars[this.entities[k].name] = {'x': this.entities[k].sprite.x,
              'y': this.entities[k].sprite.y, 'level': this.entities[k].level,
              'state': this.entities[k].state[this.entities[k].activeState]};
      }
      return chars;
    },
    getMapObjects: function() {
      var mapObjs = {};
      for (var k = this.entities.length; k--;)
      {
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
