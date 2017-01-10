/*
 * An event which requires a number of RP to be generated before completion.
 */

var starMediaDocumentary = {
  duration : 1,
  probability : 1,
  type : 'random',
  prequisites: function (eAPI) {
    return eAPI.getEventVariable('WelcomeEvent', 'starMediaStarted');
  },
  update: function(eAPI) {
  },
  start: function(eAPI) {
    var email = 'Dear Professor Strawb,<br><br>\
                The ENN (European News Network) are currently looking for a\
                Scientist to take part in a documentary on funding in \'Science\'.<br>\
                The role is immediate and will require you to be shooting\
                interviews for the next three days.<br>\
                We need a response before tomorrow if you would like to take part.<br><br>\
                Thanks<br><br>\
                Jack Hollywood<br>Head of \'Expert\' recruitment';
    var responses = [{short: 'I would love to!',
                    long: 'Hi Jack,<br><br>I would love to take part in the documentary!<br><br>Regards<br><br>Prof. Strawb',
                    run: null},
                    {short: 'I can\'t spare the time.',
                    long: 'Hi Jack,<br><br>Sorry I can\'t spare the time for this right now.<br><br>Thanks<br><br>Prof. Strawb',
                    run: null}
    ];
    eAPI.sendEmail('Documentary Guest Role', email, responses, 'j.hollywood@starmediarecruitment.com', DEFAULT_ADDRESS, 1);
  },
  finish: function(eAPI) {
  }
};

EventManager.addEvent('StarMediaDocumentary', starMediaDocumentary);
