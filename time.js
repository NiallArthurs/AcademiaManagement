/* Object to store game time:
* 1 Min = 1 day
* 30 Mins = 1 month
* 2 Hours = 1 Year (=four months)
*/
var Time = {
  time: 0,
  tick: function (dt) {
    this.time += dt;
  },
  getTime: function() {
	return this.time/60;
  },
  getDay: function () {
    return Math.floor(this.time/60);
  },
  getMonth: function () {
    return Math.floor((this.time/60)/30);
  },
  getSeason: function() {
    var season = ['spring', 'summer', 'autumn', 'winter'];
    return season[this.getMonth()];
  },
  getYear: function () {
    return Math.floor(((this.time/60)/30)/4);
  },
  getCurrent: function () {
    var year = this.getYear();
    var month = this.getMonth() - (year * 4);
    var day = this.getDay() - (month * 30);
    return [year, month, day];
  }
};
