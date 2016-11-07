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
      // A function which is run each timestep.
      var chars = eAPI.getCharacters();

      var x = chars[this.charName].x;
      var y = chars[this.charName].y;

      for (var obj in chars) {
        if (obj !== this.charName) {
          var nx = chars[obj].x;
          var ny = chars[obj].y;
          if (Math.sqrt((nx-x)*(nx-x)+(ny-y)*(ny-y)) <= 2) {
            if (chars[obj].multiplier !== 0.0) {
              eAPI.setMultiplier(obj, 0.0, 2.0);
            }
          }
        }

      }
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
      eAPI.displayNotification("Negation field disabled.");
      eAPI.addEffect(this.charName, 'explosion');
      eAPI.setCharacterState(this.charName, 'sleep');
    }

  },
  'ExplodeFurniture' : {
    duration : 1, // Duration of event
    probability : 0.5, // enabled approximately every 5 minutes.
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
