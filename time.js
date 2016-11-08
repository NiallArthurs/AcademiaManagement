/* Object to store game time:
* 1 Min = 1 day
* 30 Mins = 1 month
* 2 Hours = 1 Year (=four months)
*/
var DAYS_IN_MONTH = 30;
var MONTHS_IN_YEAR = 4;

var Time = {
  time: 0,
  tick: function (dt) {
    this.time += dt;
  },
  getTime: function() {
    return this.time/60;
  },
  getDay: function () {
    return Math.floor(this.time/60) + 1;
  },
  getMonth: function () {
    return Math.floor((this.getDay() - 1)/DAYS_IN_MONTH) + 1;
  },
  getSeason: function() {
    var season = ['spring', 'summer', 'autumn', 'winter'];
    return season[this.getMonth()];
  },
  getYear: function () {
    return Math.floor((this.getMonth() - 1)/MONTHS_IN_YEAR);
  },
  getCurrent: function () {
    var year = this.getYear();
    var month = this.getMonth() - (year * MONTHS_IN_YEAR);
    var day = this.getDay() - ((year * MONTHS_IN_YEAR + month - 1) * DAYS_IN_MONTH);
    return [year, month, day];
  }
};
