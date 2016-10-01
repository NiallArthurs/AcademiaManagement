// Notify class
// Text Notification
var Notify = (function () {

  var Notify = function(_x, _y, _text, _callback) {
    this.text = _text;
    this.dt = 0;
    this.width = 0;
    this.height = 0;
    this.visible = 1;
    this.hide = 0;
    this.textWidth = 0;
    this.textHeight = 0;
    this.xPos = _x;
    this.yPos = _y;
    this.offset = 5;
    this.alpha = 0;
    this.inputCallback = _callback;
    var self = this;

    amplify.subscribe( "dt", function (data) {
      self.tick(data);
    });

    amplify.subscribe( "mousedown", function(ev) {
      self.input(ev);
    });
  };

  Notify.prototype = {
    input: function (data) {

      var x = data["ev"].pageX - data["offsetLeft"];
      var y = data["ev"].pageY - data["offsetTop"];

      if (x >= this.xPos-this.offset && x <= (this.xPos+this.width+2*this.offset) && y >= this.yPos-this.offset  && y <= (this.yPos+this.height+2*this.offset))
      {
        if (typeof this.inputCallback  === "function")
          this.inputCallback();
        else
          this.hide = 1;
      }
    },
    tick: function(dt) {
      this.dt = dt;
      // Notifications fade in and out
      if ((this.alpha < 1.0) && (this.hide == 0))
        this.alpha = this.alpha + this.dt*5;

      if (this.hide == 1)
          this.alpha = this.alpha - this.dt*5;

      if (this.alpha < 0)
      {
        this.alpha = 0;
        this.visible = 0;
      }
    },
    draw: function(ctx) {

      ctx.font = "20px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "green";
      this.textWidth = ctx.measureText(this.text).width;
      ctx.globalAlpha = this.alpha;
      this.width = this.textWidth;
      this.height = 20;
      // Box centered above tile
      ctx.fillRect(this.xPos-this.textWidth/2-this.offset+16, this.yPos-this.offset, this.width+2*this.offset, this.height+2*this.offset);
      ctx.fillStyle = "rgba(0, 0, 0, " + this.alpha + ")";
      ctx.textBaseline = "middle";
      ctx.fillText(this.text, this.xPos-this.textWidth/2+16, this.yPos+this.height/2);
      ctx.strokeRect(this.xPos-this.textWidth/2-this.offset+16, this.yPos-this.offset, this.width+2*this.offset, this.height+2*this.offset);

      // Reset alpha
      ctx.globalAlpha=1.0;

    }
  }

  return Notify;
})();
