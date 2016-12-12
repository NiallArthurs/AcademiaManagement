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

    var email = ' Mr Doe, \
    Welcome to Towerblock Polytechnic! \
    We hope you have a super productive time working here :) \
    Dave From HR';
    eAPI.sendEmail('HR welcome', email, [], 'HR');
  },
  finish: function(eAPI) {
  }
};

EventManager.addEvent('WelcomeEvent', start);
