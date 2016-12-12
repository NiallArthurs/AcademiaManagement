/*
 * An event which requires a number of RP to be generated before completion.
 */

var researchTarget = {
  duration : 5,
  probability : 0.2,
  type : 'random',
  t0RP : [0, 0, 0],
  researchType : 1,
  researchTarget : 30,
  prequisites: function (eAPI) {
    return true;
  },
  update: function(eAPI) {
  },
  start: function(eAPI) {
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
    var curRP = eAPI.getResearchPoints()
    if (curRP[this.researchType]-this.t0RP[this.researchType] > this.researchTarget) {
      eAPI.displayNotification('Wow! Your group rock.');
    } else {
      eAPI.displayNotification('Maybe some of your staff need to attend more courses?');
    }
  }
};

EventManager.addEvent('ResearchTarget', researchTarget);
