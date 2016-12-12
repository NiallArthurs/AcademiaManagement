/*
 * An academic comes to vist, he speaks to members of staff (level > 1) - producing a boost.
 */

var visit = {
  duration : 10, // Duration of event
  type: 'random',
  character: null,
  search: null,
  searchPosition: 0,
  probability : 1,
  academicName: '',
  prequisites: function (eAPI) {
    // We need to be a higher level
    // Maybe after a conference?
    var chars = eAPI.getCharacters();
    return chars.some(char => char.state === 'work');
  },
  update: function(eAPI) {
    // A function which is run each timestep.
    if (this.character !== null && this.searchPosition < this.search.length) {
      // Make the temporary character follow a character
      if (!this.character.path().length) {
        var chars = eAPI.getCharacters();
        // The character we are going to talk with.
        var poi =  chars.find(char => char.name === this.search[this.searchPosition]);

        // If we are in range
        if (Math.sqrt((poi.x-this.character.getX())*(poi.x-this.character.getX()) +
            (poi.y-this.character.getY())*(poi.y-this.character.getY())) <= 2) {

          // If they are asleep/resting get them working
          if (poi.state === 'sleep' || poi.state === 'rest') {
            eAPI.setCharacterProperty(poi.name, 'state', 'work');
          }

          // Add a 20% boost
          eAPI.setCharacterProperty(poi.name, 'multiplier', 1.2, 2.0);
          this.searchPosition++;
        }
        else {
          var pos = eAPI.findNearbyLocation(poi.x, poi.y);
          this.character.moveTo(pos[0], pos[1]);
        }
      }
    }

    // Remove character once he's visited everyone
    if (this.character !== null && this.searchPosition >= this.search.length)
      this.character.remove();
  },
  start: function(eAPI) {
    this.academicName = eAPI.getRandomCharacterName();
    // Add temporary character at random position
    var email = 'Dear Prof Strawb, <br> <br> \
                 I am interested in meeting your group for possibly discussing some future collaborations.\
                 I will be visiting your city in the next few weeks, so let me know if you are available? <br> <br>\
                 Kind Regards, <br>\
                 '+this.academicName;

    var option1Callback = function() {
      eAPI.addQueue(getRandomInt(1, 3), () => {
        var pos = eAPI.getRandomMapPosition();
        this.character = eAPI.createTemporaryCharacter(this.academicName, pos[0], pos[1]);
        this.search = shuffleArray(eAPI.getCharacters().map(char => char.name));
        eAPI.displayNotification('You have an academic visitor.');
      });
    };

    // Maybe the event should become more unlikely?
    var option2Callback = function() {
      // Reduce reputation
    };

    var responses = [{short:'I will be available.',long:'Sure I would love you opportunity to discuss future collaborations.', run: option1Callback.bind(this)},
                     {short:'I am busy.',long:'I am away for the next few weeks.', run: option2Callback.bind(this)}];

    eAPI.sendEmail('Academic visit', email, responses, this.academicName);
  },
  finish: function(eAPI) {
    // Run when the duration of the event is up.
    // Removes the character
    this.character.remove();

    var email = 'Dear Prof Strawb, <br> <br> \
                 Thanks for an intersting visit I have tonnes of ideas for future collaborations.\
                 I will let you know when I am next visiting. \
                 Kind Regards, <br>\
                 '+this.academicName;

    eAPI.sendEmail('Re: Recent academic visit', email, responses, this.academicName);

  }
};

EventManager.addEvent('AcademicVisitor', visit)
