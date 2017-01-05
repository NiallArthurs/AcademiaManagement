// Event Manager class
var EventManager = {
    effects : [],
    last : 0,
    multipliers : {},
    queue : [],
    entities : undefined,
    eventAPI : {},
    eventsMain : [],
    eventsRandom : [],
    eventOrder : [],
    eventPos : 0,
    eventRandNext : 0,
    initialize: function(entities) {

      // Set entities and event time
      this.entities = entities;
      this.eventRandNext = getRandomInt(uiStyle.eventOptions.mintime, uiStyle.eventOptions.maxtime);

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
      this.eventAPI.getRandomCharacterName = CharacterManager.getRandomCharacterName.bind(CharacterManager);
      this.eventAPI.findNearbyLocation = this.findNearbyLocation.bind(this);
      this.eventAPI.addQueue = this.addQueue.bind(this);

      // Create the random event queue (We should add all events before initializing)
      this.last = Time.getDay();
    },
    addQueue: function(_duration, _callback) {
      this.queue.push({t0: Time.getTime(), duration: _duration, callback: _callback});
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
    updateMain: function() {
      this.eventsMain.filter(ev => !ev.complete && !ev.active && ev.prequisites(this.eventAPI)).forEach((ev, index) => {
        ev.active = true;
        ev.start(this.eventAPI);

        this.addQueue(ev.duration, () => {
            ev.finish(this.eventAPI);
            ev.active = false;
            ev.complete = true;
          });
      });
    },
    updateRandom: function() {
      var time = Time.getDay();

      if (time - this.last > this.eventRandNext) {

        // We shuffle the order events occur in
        if (this.eventPos === this.eventOrder.length || this.eventOrder.length !== this.eventsRandom.length) {
          this.eventOrder = [...Array(this.eventsRandom.length||0)].map((v,i) => i);
          this.eventOrder = shuffleArray(this.eventOrder);
          this.evetPos = 0;
        }

        // This could cause problems if we have no events without prequisites
        while (!this.eventsRandom[this.eventOrder[this.eventPos]].prequisites(this.eventAPI) ||
               this.eventsRandom[this.eventOrder[this.eventPos]].active) {
          this.eventPos = (this.eventPos + 1) % this.eventOrder.length;
        }

        this.eventsRandom[this.eventOrder[this.eventPos]].active = true;
        this.eventsRandom[this.eventOrder[this.eventPos]].start(this.eventAPI);

        var self = this;
        this.addQueue(this.eventsRandom[this.eventOrder[this.eventPos]].duration, function(ev) {
          return function () {
            self.eventsRandom[ev].finish(self.eventAPI);
            self.eventsRandom[ev].active = false;
          };
        }(this.eventOrder[this.eventPos]));

        this.eventRandNext = getRandomInt(uiStyle.eventOptions.mintime, uiStyle.eventOptions.maxtime);
        this.eventPos++;
        this.last = time;
      }
    },
    randomEventTrigger: function (name) {
      var ev = this.eventsRandom.find(ev => ev.name == name);

      if (ev !== undefined) {
        ev.active = true;
        ev.start(this.eventAPI);

        this.addQueue(ev.duration, () => {
            ev.finish(this.eventAPI);
            ev.active = false;
        });
      }
    },
    update: function() {
      // Delete ui elements which are no longer visible
      this.effects = this.effects.filter(effect => effect.visible);

      this.checkQueue();
      this.updateMain();
      this.updateRandom();

      // Run the update function for each active event
      this.eventsRandom.filter(ev => ev.active).forEach(ev => {ev.update(this.eventAPI);});
      this.eventsMain.filter(ev => ev.active).forEach(ev => {ev.update(this.eventAPI);});

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
        this.moveTo = null;
        this.path = null;
        this.getX = null;
        this.getY = null;
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

      var len = this.multipliers[character].len;
      this.addQueue(duration, () => {this.multipliers[character].splice(len-1, 1)});

      this.calcAndAssign(character);
    },
    calcAndAssign: function(character) {
      var calc = this.multipliers[character].reduce((a, b) => a*b, 1.0);
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
      var search = this.entities.find(ent => ent.name === character);

      if (search.type === 'character') {
        return ['character', search];
      }
      else if (search.type === 'object') {
        return ['object', search];
      }

      return undefined;
    },
    addEvent: function(name, ev) {
      if (ev.type === 'random') {
        ev.name = name;
        this.eventsRandom.push(ev);
      } else if (ev.type === 'main') {
        ev.name = name;
        this.eventsMain.push(ev);
      }
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
      var chars = this.entities.filter(ent => ent.type === 'character').map(
        ent => {return {'x': Math.floor(ent.getTileX()), 'y': Math.floor(ent.getTileY()),
        'level': ent.level, 'state': ent.state[ent.activeState], 'multiplier': ent.multiplier,
        'walkspeed': ent.speed, 'name': ent.name}});

      return chars;
    },
    getMapObjects: function() {
      var mapObjs = this.entities.filter(ent => ent.type === 'object').map(ent =>
        {return {'name': ent.name, 'x': ent.x, 'y': ent.y}});

      return mapObjs;
    },
    changeSprite: function(character, sprite) {
      character.oldSprite = character.sprite;
      character.sprite = sprite;
    }
};
