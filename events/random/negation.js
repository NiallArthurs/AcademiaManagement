/*
 * An event which creates a "negation field" around a character - all working
 * characters within two tiles will have a RP multiplier of 0.
 */

var negate = {
  duration : 5,
  probability : 0.2,
  type : 'random',
  charName : '',
  ntt: 0,
  prequisites: function (eAPI) {
    // Return true/false depending on whether the prequisites are met
    // Check we have atleast one chracter working
    var chars = eAPI.getCharacters();
    return chars.some(char => char.state === 'work');
  },
  update: function(eAPI) {
    // For efficiency we only check every 10 timesteps
    if (this.ntt % 10 === 0) {
      var chars = eAPI.getCharacters();

      var negChar = chars.find(char => char.name === this.charName);

      // Check whether characters are within two tiles of the chosen character
      // and set the multiplier to zero for two minutes
      chars.forEach((char) => {
        if (char.name !== negChar.name) {
          var nx = char.x;
          var ny = char.y;
          if (Math.sqrt((nx-negChar.x)*(nx-negChar.x)+(ny-negChar.y)*(ny-negChar.y)) <= 2) {
            if (char.multiplier !== 0.0) {
              eAPI.setCharacterProperty(char.name, 'multiplier', 0.0, 2.0);
            }
          }
        }
      });
    }

    this.ntt += 1;
  },
  start: function(eAPI) {
    // Run when an event starts
    var chars = eAPI.getCharacters();

    // Find the first character who is working
    this.charName = chars.find(char => char.state === 'work').name;
    //eAPI.displayNotification('Negation field active '+this.charName+'!');
    eAPI.addEffect(this.charName, 'field', this.duration);
  },
  finish: function(eAPI) {
    // Run when the duration of the event is up.
    // Should notify of win/failure.
    this.ntt = 0;
    //eAPI.displayNotification("Negation field disabled.");
    //eAPI.addEffect(this.charName, 'explosion');
    //eAPI.setCharacterProperty(this.charName, 'state', 'sleep');
  }

};

EventManager.addEvent('NegationField', negate);
