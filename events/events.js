/*
 *
 * Events usage:
 *
 * Two variables must be defined:
 *  'duration' - The duration in days (minutes) an event runs.
 *  'probability' - The probability an event will start per day.
 *
 * Each event should contain four functions:
 *  prequisites() - Returns true or false depending on whether the prequisites are met.
 *  start() - This function runs when an event is started.
 *  update() - This function runs every time-step.
 *  finish() -This function runs when the event is finished (duration is reached).
 *
 * Each of the above functions has an argument which is an API object with access to the
 * following functions:
 *
 * displayNotification(text) - Displays the provided text in a notification which is
 *                             aligned to the center of the canvas.
 *
 * getResearchPoints() - Returns an array containing the number of research points
 *                       in the format [computationPoints, experimentPoints, theoryPoints].
 *
 * getCharacters() - Returns an object with character information in the format:
 *
 *                  {
 *                    'CharNameA' :
 *                              {
 *                              x: Character tile X position,
 *                              y: Character tile Y position,
 *                              level: Character Level,
 *                              state: Character state,
 *                              multiplier: Character RP multiplier,
 *                              walkspeed: Character walkspeed,
 *                              },
 *				...
 *                  }
 *
 * getDay() - Retuns the total number of days + 1 since the game started.
 *
 * getCurrentTime() - Returns an array with [year, month, day].
 *
 * getMapObjects() - Returns an object with map information in the format:
 *
 *		    {
 *		      'MapObjectNameA' :
 *				    {
 *				    x: Map object tile X position,
 *				    y: Map object tile Y position,
 *				    },
 *				    ...
 *		    }
 *
 * setCharacterProperty(character, property, value, duration) - Assign a property for a given character (some properties need a duration)
 *			The properties which are supported: 'multiplier' (needs a duration), 'state', 'speed' (needs a duration)
 *
 * addEffect(entity, type, duration) - Applies an effect to an entity (map object or character) for some time.
 *				       The supported effects are 'field', 'explosion'. The first argument is the character name or
 *                                     map object name.
 *
 * getGrantValue() - Returns the total value of grants.
 *
 * getPublications() - Returns an object with details regarding publications.
 *
 */

var eventsMain = {
  'TheoryPro' : {
    duration : 10, // Duration of event
    probability : 0.2, // enabled approximately every 5 minutes.
    t0RP : [0, 0, 0],
    prequisites: function (eAPI) {
      // Return true/false depending on whether the prequisites are met
      return true;
    },
    update: function(eAPI) {
      // A function which is run each timestep.
    },
    start: function(eAPI) {
      // Run when an event starts
      this.t0RP = eAPI.getResearchPoints();
      eAPI.displayNotification('You have 10 days to prove your group has theoretical expertise.');
    },
    finish: function(eAPI) {
      // Run when the duration of the event is up.
      // Should notify of win/failure.

      var curRP = eAPI.getResearchPoints()
      if (curRP[2]-this.t0RP[2] > 30) {
          eAPI.displayNotification('Wow! Your group rock with theory.');
      } else {
          eAPI.displayNotification('Maybe some of your staff need to attend more courses?');
      }
    }

  },
  'NegationField' : {
    duration : 5, // Duration of event
    probability : 0.2, // enabled approximately every 5 minutes.
    charName : '', // event variable
    ntt: 0,
    prequisites: function (eAPI) {
      // Return true/false depending on whether the prequisites are met
      // Check we have atleast one chracter working
      var chars = eAPI.getCharacters();

      for (var obj in chars) {
        if(chars[obj].state === 'work') {
          return true;
        }
      }

      return false;
    },
    update: function(eAPI) {
      // For efficiency we only check every 10 timesteps
      if (this.ntt % 10 === 0)
      {
        var chars = eAPI.getCharacters();

        var x = chars[this.charName].x;
        var y = chars[this.charName].y;

        // Check whether characters are within two tiles of the chosen character
        // and set the multiplier to zero for two minutes
        for (var obj in chars) {
          if (obj !== this.charName) {
            var nx = chars[obj].x;
            var ny = chars[obj].y;
            if (Math.sqrt((nx-x)*(nx-x)+(ny-y)*(ny-y)) <= 2) {
              if (chars[obj].multiplier !== 0.0) {
                eAPI.setCharacterProperty(obj, 'multiplier', 0.0, 2.0);
                //eAPI.setCharacterProperty(obj, 'speed', 5.0, 1.0);
              }
            }
          }
        }
      }

      this.ntt += 1;
    },
    start: function(eAPI) {
      // Run when an event starts
      var chars = eAPI.getCharacters();

      // Find the first character who is working
      for (var obj in chars) {
        if(chars[obj].state === 'work') {
          this.charName = obj;
          break;
        }
      }

      eAPI.displayNotification('Negation field active '+this.charName+'!');
      eAPI.addEffect(this.charName, 'field', this.duration);
    },
    finish: function(eAPI) {
      // Run when the duration of the event is up.
      // Should notify of win/failure.
      this.ntt = 0;
      eAPI.displayNotification("Negation field disabled.");
      eAPI.addEffect(this.charName, 'explosion');
      eAPI.setCharacterProperty(this.charName, 'state', 'sleep');
    }

  },
  'ExplodeFurniture' : {
    duration : 1, // Duration of event
    probability : 0.2, // enabled approximately every 5 minutes.
    prequisites: function (eAPI) {
      // Return true/false depending on whether the prequisites are met
      // Check we have atleast one chracter working
      return true;
    },
    update: function(eAPI) {
      // A function which is run each timestep.
    },
    start: function(eAPI) {
      // Run when an event starts
      var mapObj = eAPI.getMapObjects();

      var furniture = Object.keys(mapObj)[0];
      eAPI.displayNotification('You need to contact the building manager.');
      eAPI.displayNotification('It looks like something is wrong with the ' + furniture + '.');
      eAPI.addEffect(furniture, 'explosion');
    },
    finish: function(eAPI) {
      // Run when the duration of the event is up.
    }

  }
};
