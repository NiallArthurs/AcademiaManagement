var eventsMain = {
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
      eAPI.displayNotification('It looks like something is wrong with the ' + furniture + '.');
      eAPI.addEffect(furniture, 'explosion');
    },
    finish: function(eAPI) {
      // Run when the duration of the event is up.
    }

  }
};
