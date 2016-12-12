/*
 * A character has discoverd a performance enhancing drug, this gives him a small temporary
 * boost, eventually he distributes it amongst colleagues (no boost seen).
 */

var perform = {
  duration : 10,
  probability : 0.2,
  type : 'random',
  charName : '',
  ntt: 0,
  spread: false,
  t0: 0,
  prequisites: function (eAPI) {
    var chars = eAPI.getCharacters();
    return chars.some(char => char.state === 'work');
  },
  start: function(eAPI) {
    this.t0 = eAPI.getDay();

    var chars = eAPI.getCharacters();
    // Find the first character who is working
    this.charName =  chars.find(char => char.state === 'work').name;

    eAPI.setCharacterProperty(this.charName, 'multiplier', 1.5, 3.0);
    eAPI.setCharacterProperty(this.charName, 'speed', 5.0, 10.0);
    eAPI.displayNotification('Whats wrong with ' + this.charName + '?');

    var email = ' Prof Strawb, <br> <br> \
                  I have been hearing rumours that one of our groups members has \
                  discoverd a performance enhancing drug. <br> What would you like us to do? <br><br> \
                  Kind Regards, <br>\
                  Barbara <br><br> "Science" Research Group Secretary';

    var option1Callback = () => {eAPI.addQueue(getRandomInt(1,2), () => {
      eAPI.displayNotification('It appears to be spreading.');
      this.spread = true;
    })};

    var responses = [{short:'Wait and see.',long:'Let\'s see how effective it is before we take action.', run: option1Callback.bind(this)},
    {short:'Send to counselling.',long:'Send the member of staff to counselling.', run: () => {eAPI.displayNotification('It looks like he should return to normal shortly.');}}];

    eAPI.sendEmail('Performance enhancing drugs', email, responses, 'Barbara');
  },
  update: function(eAPI) {
    if (this.spread === true || (eAPI.getDay() - this.t0) >= 5) {
      eAPI.setCharacterProperty(this.charName, 'multiplier', 0.0, 1.0);

      if (!this.spread) {
        eAPI.displayNotification('Something appears to be spreading amongst your staff.');
        this.spread = true;
      }

      // For efficiency we only check every 10 timesteps
      if (this.ntt % 10 === 0) {

        var chars = eAPI.getCharacters();
        var poi =  chars.find(char => char.name === this.charName);

        // Check whether characters are within two tiles of the chosen character
        // and set the multiplier to zero for two minutes
        chars.forEach(function (char) {
          if (char.name !== this.charName) {
            var nx = char.x;
            var ny = char.y;
            if (Math.sqrt((nx-poi.x)*(nx-poi.x)+(ny-poi.y)*(ny-poi.y)) <= 2) {
              if (char.walkspeed !== 5.0) {
                eAPI.setCharacterProperty(char.name, 'multiplier', 0.1, 2.0);
                eAPI.setCharacterProperty(char.name, 'speed', 5.0, 2.0);
              }
            }
          }
        });
      }
      this.ntt += 1;
    }
  },
  finish: function(eAPI) {
    this.ntt = 0;

    if (this.spread) {
      var email = ' Prof Strawb, <br> <br> \
      I am writing to inform you a number of your group members have\
      become addicted to a performance enhancing drug. As the source wasn\'t \
      initially dealt with we will have to send all effected members to a \
      rehabilitation center. The cost of their stay will be charged to your deparment.<br><br> \
      Kind Regards, <br>\
      Susan <br><br> Head of Student Services';

      eAPI.sendEmail('Student Services Notification', email, [], 'Susan');
    }
  }
};

EventManager.addEvent('PerformanceEnhance', perform);
