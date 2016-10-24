// Base Mouse Event class
var MouseEvent = (function () {

  var MouseEvent = function(_x, _y, _width, _height, _hover) {
    this.width = _width;
    this.height = _height;
    this.xPos = _x;
    this.yPos = _y;
    this.mouseX = 0;
    this.mouseY = 0;
    this.hoverActive = _hover;
    this.hover = 0;
    this.hoverFn = this.inputMouseMove.bind(this);
    this.mousedownFn = this.inputMouseDown.bind(this);

    if (this.hoverActive) {
      amplify.subscribe( "mousemove", this.hoverFn);
    }

    amplify.subscribe( "mousedown", this.mousedownFn);
  };

  MouseEvent.prototype = {
    inputMouseMove: function(data) {

      var x = data.ev.pageX - data.offsetLeft;
      var y = data.ev.pageY - data.offsetTop;

      if (x >= this.xPos && x <= this.xPos+this.width && y >= this.yPos  && y <= this.yPos+this.height)
      {
        this.hover = 1;
      }
      else {
        this.hover = 0;
      }
    },
    inputMouseDown: function (data) {

      var x = data.ev.pageX - data.offsetLeft;
      var y = data.ev.pageY - data.offsetTop;

      if (x >= this.xPos && x <= this.xPos+this.width && y >= this.yPos  && y <= this.yPos+this.height)
      {
        if (typeof this.inputMouseDownCallback  === 'function')
        {
          this.inputMouseDownCallback();
        }
      }
    },
    cleanup: function() {
      // cleanup subscriptions
      if (this.hoverActive) {
        amplify.unsubscribe( 'mousemove', this.hoverFn);
      }

      amplify.unsubscribe( 'mousedown', this.mousedownFn);
    }
  };

  return MouseEvent;
})();
