/*
 * An event which requires a number of RP to be generated before completion.
 */

var starMediaNewsGuest = {
  duration : 3,
  probability : 1,
  type : 'random',
  prequisites: function (eAPI) {
    return GameState.WelcomeEvent.starMediaStarted;
  },
  update: function(eAPI) {
  },
  start: function(eAPI) {
    var email = 'Dear Professor Strawb,<br><br>\
                '
  },
  finish: function(eAPI) {
  }
};

EventManager.addEvent('starMediaNewsGuest', starMediaNewsGuest);
