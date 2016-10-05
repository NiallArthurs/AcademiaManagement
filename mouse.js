// Base Mouse Event class
var MouseEvent = (function () {

  var MouseEvent = function(_x, _y, _width, _height) {
    this.width = _width;
    this.height = _height;
    this.xPos = _x;
    this.yPos = _y;
    var self = this;

    amplify.subscribe( "mousedown", function(ev) {
      self.inputMouseDown(ev);
    });
  };

  MouseEvent.prototype = {
    inputMouseDown: function (data) {

      var x = data["ev"].pageX - data["offsetLeft"];
      var y = data["ev"].pageY - data["offsetTop"];

      if (x >= this.xPos && x <= this.xPos+this.width && y >= this.yPos  && y <= this.yPos+this.height)
      {
        if (typeof this.inputMouseDownCallback  === "function")
	{
          this.inputMouseDownCallback();
	}
      }
    }
  };

  return MouseEvent;
})();
