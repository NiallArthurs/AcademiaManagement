/* Object to store game time:
* 1 Min = 1 day
* 30 Mins = 1 month
* 2 Hours = 1 Year (=four months)
*/
var DAYS_IN_MONTH = 30;
var MONTHS_IN_YEAR = 4;
var STARTING_DAY = 1;
var STARTING_MONTH = 1;
var STARTING_YEAR = 2012;

var Time = {
  time: 0,
  tick: function (dt) {
    this.time += dt;
  },
  getTime: function() {
    return this.time/60;
  },
  getDay: function () {
    return Math.floor(this.time/60) + STARTING_DAY;
  },
  getMonth: function () {
    return Math.floor((this.getDay() - STARTING_DAY)/DAYS_IN_MONTH) + STARTING_MONTH;
  },
  getSeason: function() {
    var season = ['spring', 'summer', 'autumn', 'winter'];
    return season[this.getMonth()];
  },
  getYear: function () {
    return Math.floor((this.getMonth() - STARTING_MONTH)/MONTHS_IN_YEAR) + STARTING_YEAR;
  },
  getCurrent: function () {
    var year = this.getYear();
    var month = this.getMonth() - ((year - STARTING_YEAR) * MONTHS_IN_YEAR);
    var day = this.getDay() - (((year - STARTING_YEAR) * MONTHS_IN_YEAR + month - STARTING_MONTH) * DAYS_IN_MONTH);
    return [year, month, day];
  },
  createDateString: function(_array) {
    return _array[2] + '/' + _array[1] + '/' + _array[0];
  }
};
