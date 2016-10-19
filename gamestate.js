// Object to store game state variables.
// Note all dates/durations are referenced in terms of days (see time.js).

var GameState = {
  experimentPoints: 0,
  computationPoints: 0,
  theoryPoints: 0,
  fundingTotal: 0,
  grants: [],
  publications: [],
  staff: [],
  // Calculate the total funding available
  determineTotalFunding: function() {
    this.fundingTotal = 0;
    for (var k=0; k < this.grants.length; k++)
    {
      this.fundingTotal += this.grants[k].amount;
    }
    return this.fundingTotal;
  },
  update: function() {
	this.cleanGrants();
	this.determineTotalFunding();
  }, 
  // If grant duration has elapsed delete it
  cleanGrants: function() {
    var i = this.grants.length;
    while (i--)
    {
      if ((Time.getDay()-this.grants[i].start) > this.grants[i].duration)
        this.ui.splice(i, 1);
    }
  },
  // Add a grant
  addGrant: function (_name, _amount, _start, _duration) {
    var tmp = {name: _name, amount: _amount, start: _start, duration: _duration};
    this.grants.push(tmp);
  },
  // Add research point
  addResearchPoint: function (type, number) {
    // 0 - experiment, 1 - computation, 2 - theory
    if (type === 0)
    {
      this.experimentPoints+=number;
    }
    else if (type === 1)
    {
      this.computationPoints+=number;
    }
    else if (type === 2)
    {
      this.theoryPoints+=number;
    }
  },
  // Add publication
  addPublication: function (_name, _date, _journal) {
    var tmp = {name: _name, date: _date, journal: _journal};
    this.publications.push(tmp);
  }
};
