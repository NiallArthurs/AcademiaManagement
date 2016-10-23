// Notify class
// Text Notification
var Notify = (function () {

  var Notify = function(_x, _y, _text) {
    // Call MouseEvent constructor
    MouseEvent.call(this, _x, _y, 0, 0, false);
    this.text = _text;
    this.dt = 0;
    this.visible = true;
    this.hide = 0;
    this.textWidth = 0;
    this.textHeight = 0;
    this.offset = 5;
    this.alpha = 0;
    this.speed = 4;
    this.drawStartup = 1;
    this.dtFn = this.tick.bind(this);

    amplify.subscribe( "dt", this.dtFn);
  };

  Notify.prototype = Object.create(MouseEvent.prototype)
  Notify.prototype.constructor = Notify;

  Notify.prototype.tick = function(dt) {

      this.dt = dt;
      // Notifications fade in and out
      if ((this.alpha < 1.0) && (this.hide === 0))
        this.alpha = this.alpha + this.dt*this.speed;

      if (this.hide === 1)
      {
          this.alpha = this.alpha - this.dt*this.speed;
      }

      if (this.alpha < 0)
      {
        this.alpha = 0;
        this.visible = false;
        amplify.unsubscribe( "dt", this.dtFn);
      }
  };

  Notify.prototype.inputMouseDownCallback = function() {
      this.hide = 1;
      this.cleanup();
  };

  Notify.prototype.draw = function(ctx) {

      ctx.font = "20px Arial";
      ctx.strokeStyle = "green";

      // Assign the width and height for the notification (once when we are given the canvas context)
      if (this.drawStartup)
      {
        this.textWidth = ctx.measureText(this.text).width;
	      this.width = this.textWidth + 2*this.offset;
        this.height = 20 + 2* this.offset;
      	this.xPos = this.xPos-this.textWidth/2-this.offset+16;
	      this.yPos = this.yPos-this.offset;
	      this.drawStartup = 0;
      }

      ctx.globalAlpha = this.alpha;
      // Box centered above tile
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
      ctx.fillStyle = "rgba(0, 0, 0, " + this.alpha + ")";
      ctx.textBaseline = "middle";
      ctx.fillText(this.text, this.xPos+this.offset, this.yPos+this.height/2);
      ctx.strokeRect(this.xPos, this.yPos, this.width, this.height);

      // Reset alpha
      ctx.globalAlpha=1.0;
    };

  return Notify;
})();
