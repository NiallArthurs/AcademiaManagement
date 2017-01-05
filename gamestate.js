// Object to store game state variables.
// Note all dates/durations are referenced in terms of days (see time.js).

var GameState = {
  experimentPoints: 0,
  computationPoints: 0,
  theoryPoints: 0,
  grantFundingTotal: 0,
  grants: [],
  publications: [],
  staff: [],
  eventVariables: {},
  // Calculate the total funding available
  determineTotalGrantFunding: function() {
    this.grantFundingTotal = 10;
    for (var k=0; k < this.grants.length; k++)
    {
      this.grantFundingTotal += this.grants[k].amount;
    }
    return this.grantFundingTotal;
  },
  update: function() {
	   this.cleanGrants();
	   this.determineTotalFunding();
  },
  // If grant duration has elapsed delete it
  cleanGrants: function() {
    var i = this.grants.length;
    while (i--) {
      if ((Time.getDay()-this.grants[i].start) > this.grants[i].duration)
        this.ui.splice(i, 1);
    }
  },
  checkEventExists: function (_eventName) {
    if (this.eventVariables._eventName != undefined) {
      return true;
    } else {
      return false;
    }
  },
  // Return the value of requested Event Variable
  getEventVariable: function (_eventName, _eventVariable) {
    return this.eventVariables._eventName._eventVariable;
  },
  //Set a new value for a given Event Variable
  setEventVariable: function (_eventName, _eventVariable, _value) {
    if (!this.checkEventExists(_eventName)) {
      this.eventVariables._eventName = {};
    }
    this.eventVariables._eventName._eventVariable = _value;
  },
  // Add a grant
  addGrant: function (_name, _amount, _start, _duration) {
    var tmp = {name: _name, amount: _amount, start: _start, duration: _duration};
    this.grants.push(tmp);
  },
  // Add research point
  addResearchPoint: function (type, number) {
    // 0 - experiment, 1 - computation, 2 - theory
    if (type === 0) {
      this.experimentPoints += number;
    }
    else if (type === 1) {
      this.computationPoints += number;
    }
    else if (type === 2) {
      this.theoryPoints += number;
    }
  },
  // Add publication
  addPublication: function (_name, _date, _journal) {
    var tmp = {name: _name, date: _date, journal: _journal};
    this.publications.push(tmp);
  }
};
