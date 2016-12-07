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
  'ResearchTarget' : {
    duration : 5, // Duration of event
    probability : 0.2, // enabled approximately every 5 minutes.
    type : 'random',
    t0RP : [0, 0, 0],
    researchType : 1,
    researchTarget : 30,
    prequisites: function (eAPI) {
      // Return true/false depending on whether the prequisites are met
      return true;
    },
    update: function(eAPI) {
      // A function which is run each timestep.
    },
    start: function(eAPI) {
      // Run when an event starts
      this.researchType = getRandomInt(1,3);
      this.t0RP = eAPI.getResearchPoints();
      var email = 'Prof. Strawb<br><br>\
                   As part of an up coming budget review we are asking all research groups to meet certain targets.<br>\
                   We ask that your group meets a target of '
                   + this.researchTarget + ' ';
      var subject = '';
      if (this.researchType == 1) {
        email += 'computational';
        subject += 'Computational';
        eAPI.displayNotification('You have ' + this.duration + ' days to prove your group has computational expertise.');
      } else if (this.researchType == 2) {
        email += 'experimental';
        subject += 'Experimental';
        eAPI.displayNotification('You have ' + this.duration + ' days to prove your group has experimental expertise.');
      } else {
        email += 'theoretical';
        subject += 'Theoretical';
        eAPI.displayNotification('You have ' + this.duration + ' days to prove your group has theoretical expertise.');
      }
      email += ' research points in the next ' + this.duration + ' days.<br><br>\
                Regards<br><br>\
                Prof. Busybody<br>\
                Head of the Faculty of "Science"\
               ';
      subject += ' Research Target'
      eAPI.sendEmail(subject, email, [], 'Prof. Busybody');
    },
    finish: function(eAPI) {
      // Run when the duration of the event is up.
      // Should notify of win/failure.

      var curRP = eAPI.getResearchPoints()
      if (curRP[this.researchType]-this.t0RP[this.researchType] > this.researchTarget) {
          eAPI.displayNotification('Wow! Your group rock.');
      } else {
          eAPI.displayNotification('Maybe some of your staff need to attend more courses?');
      }
    }

  },
  'NegationField' : {
    duration : 5, // Duration of event
    probability : 0.2, // enabled approximately every 5 minutes.
    type : 'random',
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
    type: 'random',
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

      var email = ' Doc Brown, \
                    There seems to have been a problem in the PhD office, \
                    What do you want us to do? \
                    Best, \
                    Dave';
      var responses = [{short:'They\'ll manage.',long:'The smoke could be good for them.', run: function(){eAPI.displayNotification('I smell smoke.',function() {eAPI.addEffect(furniture, 'explosion');});}},
                       {short:'Deal with it.',long:'We should get someone to take a look.', run: function(){eAPI.displayNotification('Looks like there was a problem with the table, all fixed now.');}}];

      eAPI.sendEmail('Problem in PhD office', email, responses, 'Dave');
    },
    finish: function(eAPI) {
      // Run when the duration of the event is up.
    }

  },
  'StartEvent' : {
    duration : 1, // Duration of event
    type: 'main',
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
      eAPI.displayNotification('Welcome to the Lab!');

      var email = ' Mr Doe, \
                    Welcome to Towerblock Polytechnic! \
                    We hope you have a super productive time working here :) \
                    Dave From HR';
      eAPI.sendEmail('HR Welcome', email, [], 'HR');
    },
    finish: function(eAPI) {
      // Run when the duration of the event is up.
    }
  },
  'CharacterExample' : {
    duration : 5, // Duration of event
    type: 'random',
    character: undefined,
    probability : 0.2,
    follow : '',
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
      if (this.character !== undefined)
      {
	      // Make the temporary character follow a character
        if (!this.character.path().length)
        {
          var chars = eAPI.getCharacters();
          var pos = eAPI.findNearbyLocation(chars[this.follow].x, chars[this.follow].y);
          this.character.moveTo(pos[0], pos[1]);
        }
      }
    },
    start: function(eAPI) {
      // Run when an event starts
      var chars = eAPI.getCharacters();
      for (var obj in chars) {
        if (chars[obj].state === 'work') {
	        this.follow = obj;
        }
      }

      // Add temporary character at random position
      var pos = eAPI.getRandomMapPosition();
      this.character = eAPI.createTemporaryCharacter('Student', pos[0], pos[1]);

      eAPI.displayNotification('Someone new seems to be wandering around the lab!?!!?');
    },
    finish: function(eAPI) {
      // Run when the duration of the event is up.
      // Removes the character
      this.character.remove();
    }
  },
  'PerformanceEnhancingDrug' : {
    duration : 10, // Duration of event
    probability : 0.2,
    type : 'random',
    charName : '',
    ntt: 0,
    spread: false,
    t0: 0,
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
    start: function(eAPI) {

      this.t0 = eAPI.getDay();
      // Run when an event starts
      var chars = eAPI.getCharacters();

      // Find the first character who is working
      for (var obj in chars) {
        if(chars[obj].state === 'work') {
          this.charName = obj;
          eAPI.setCharacterProperty(obj, 'multiplier', 1.5, 3.0);
          eAPI.setCharacterProperty(obj, 'speed', 5.0, 10.0);
          eAPI.displayNotification('Whats wrong with '+this.charName+'?');
          break;
        }
      }

      var email = ' Prof Strawb, <br> <br> \
                    I have been hearing rumours that one of our groups members has \
                    discoverd a performance enhancing drug. <br> What would you like us to do? <br><br> \
                    Kind Regards, <br>\
                    Barbara <br><br> "Science" Research Group Secretary';

      var self = this;
      var responses = [{short:'Wait and see.',long:'Let\'s see how effective it is before we take action.', run: function(){eAPI.displayNotification('It appears to be spreading.'); self.spread = true;}},
                       {short:'Send to counselling.',long:'Send the member of staff to counselling.', run: function(){eAPI.displayNotification('It looks like he should be return to normal shortly.');}}];

      eAPI.sendEmail('Performance Enhancing Drugs', email, responses, 'Barbara');
    },
    update: function(eAPI) {
      // For efficiency we only check every 10 timesteps
      if (this.spread === true || (eAPI.getDay() - this.t0) >= 5) {

        eAPI.setCharacterProperty(this.charName, 'multiplier', 0.0, 1.0);

        if (!this.spread) {
          eAPI.displayNotification('Something appears to be spreading amongst your staff.');
          this.spread = true;
        }

        if (this.ntt % 10 === 0) {

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
                if (chars[obj].walkspeed !== 5.0) {
                  eAPI.setCharacterProperty(obj, 'multiplier', 0.1, 2.0);
                  eAPI.setCharacterProperty(obj, 'speed', 5.0, 2.0);
                }
              }
            }
          }
        }
        this.ntt += 1;
      }
    },
    finish: function(eAPI) {
      this.ntt = 0;

      var chars = eAPI.getCharacters();

      var count = 0;
      for (var obj in chars) {
        if (chars[obj].walkspeed === 5) {
          count++;
        }
      }

      // A cost depending on the number of users will be applied/reported in the email.
      var cost = count * 5000;

      if (this.spread) {
        var email = ' Prof Strawb, <br> <br> \
                      I am writing to inform you a number of your group members have\
                      become addicted to a performance enhancing drug. As the source wasn\'t \
                      initially dealt with we will have to send all effected members to a \
                      rehabilitation center. The cost of their stay will be charged to your deparment.<br><br> \
                      Kind Regards, <br>\
                      Susan <br><br> Head of Student Services';

        var self = this;
        eAPI.sendEmail('Student Services Notification', email, [], 'Susan');
      }
    }
  }
};
