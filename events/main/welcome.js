/*
* A welcome event
*/

var start = {
  duration : 1,
  type: 'main',
  prequisites: function (eAPI) {
    return true;
  },
  update: function(eAPI) {
  },
  start: function(eAPI) {
    eAPI.displayNotification('Welcome to the Lab!');

    var email = ' Professor Strawb,<br><br>\
                Welcome to Towerblock Polytechnic!<br>\
                We hope you have a super productive time working here :)<br><br>\
                Dave From HR';
    eAPI.sendEmail('HR welcome', email, [], 'HR');
    //Set Event Variables that are required at startup here.
    eAPI.setEventVariable(this.name, 'starMediaStarted', false);
  },
  finish: function(eAPI) {
  }
};

EventManager.addEvent('WelcomeEvent', start);
