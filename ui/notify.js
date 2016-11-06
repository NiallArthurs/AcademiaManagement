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
    this.offset = uiStyle.notify.padding;
    this.alpha = 0;
    this.speed = uiStyle.notify.fadespeed;
    this.dtFn = this.tick.bind(this);
    this.font = uiStyle.notify.fontsize+'px '+uiStyle.notify.font;
    this.textWidth = getTextWidth(this.text, this.font);
    this.width = this.textWidth + 2*this.offset;
    this.height = uiStyle.notify.fontsize + 2* this.offset;
    this.xPos = this.xPos-this.textWidth/2-this.offset+TILE_SIZE/2;
    this.yPos = this.yPos-this.offset;
    this.active = false;
    amplify.subscribe( 'dt', this.dtFn);
  };

  Notify.prototype = Object.create(MouseEvent.prototype);
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
        amplify.unsubscribe( 'dt', this.dtFn);
      }
  };

  Notify.prototype.inputMouseDownCallback = function() {
      if (!this.active)
        return;
        
      this.hide = 1;
      this.cleanup();
  };

  Notify.prototype.draw = function(ctx) {

      ctx.font = this.font;
      ctx.globalAlpha = this.alpha;
      // Box centered above tile
      ctx.fillStyle = uiStyle.notify.bgcolor;
      ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
      ctx.fillStyle = uiStyle.notify.textcolor;
      ctx.globalAlpha = this.alpha;
      ctx.textBaseline = 'middle';
      ctx.fillText(this.text, this.xPos+this.offset, this.yPos+this.height/2);
      ctx.strokeStyle = uiStyle.notify.border;
      ctx.strokeRect(this.xPos, this.yPos, this.width, this.height);

      // Reset alpha
      ctx.globalAlpha=1.0;
    };

  return Notify;
})();
