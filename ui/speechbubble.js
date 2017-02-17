// Speech bubble
// Text Notification

var SpeechBubble = function(xFn, yFn, text, duration) {
  this.xFn = xFn;
  this.yFn = yFn;
  this.xPos = this.xFn();
  this.yPos = this.yFn();
  this.z = 10;
  this.px = this.xFn();
  this.py = this.yFn();
  this.type = 'bubble';
  this.text = text;
  this.dt = 0;
  this.visible = true;
  this.hide = 0;
  this.duration = duration;
  this.offset = uiStyle.notify.padding + 5;
  this.alpha = 0;
  this.speed = uiStyle.notify.fadespeed;
  this.dtFn = this.tick.bind(this);
  this.font = uiStyle.notify.fontsize+'px '+uiStyle.notify.font;
  this.textWidth = getTextWidth(this.text, this.font);
  this.width = this.textWidth + 2*this.offset;
  this.height = uiStyle.notify.fontsize + 2* this.offset;
  this.xPos = this.xPos-this.textWidth/2-this.offset+TILE_SIZE/2;
  this.yPos = this.yPos-this.offset-30;
  amplify.subscribe('dt', this.dtFn);
};

SpeechBubble.prototype.tick = function(dt) {
  this.dt = dt;
};

SpeechBubble.prototype.updatePosition = function() {
  this.xPos = this.xFn();
  this.yPos = this.yFn();
  this.px = this.xFn();
  this.py = this.yFn();
  this.xPos = this.xPos-this.textWidth/2-this.offset+TILE_SIZE/2;
  this.yPos = this.yPos-this.offset-30;
}

SpeechBubble.prototype.drawBubble = function(ctx, x, y, w, h, radius)
{
  var r = x + w;
  var b = y + h;
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.fillStyle = "white";
  ctx.lineWidth="2";
  ctx.moveTo(x+radius, y);
  ctx.lineTo(r-radius, y);
  ctx.quadraticCurveTo(r, y, r, y+radius);
  ctx.lineTo(r, y+h-radius);
  ctx.quadraticCurveTo(r, b, r-radius, b);
  ctx.lineTo(r-radius/4, b+10);
  ctx.lineTo(r-radius*4, b);
  ctx.lineTo(x+radius, b);
  ctx.quadraticCurveTo(x, b, x, b-radius);
  ctx.lineTo(x, y+radius);
  ctx.quadraticCurveTo(x, y, x+radius, y);
  ctx.stroke();
  ctx.fill();
}

SpeechBubble.prototype.getTileY = function() {
  return TileMap.height;
};

SpeechBubble.prototype.update = function() {

  this.updatePosition();

  if (this.alpha >= 1.0 && this.duration > 0) {
    this.duration = this.duration - this.dt;
  }

  if (this.duration <=  0) {
      this.hide = 1;
  }

  // Notifications fade in and out
  if ((this.alpha < 1.0) && (this.hide === 0))
  this.alpha = this.alpha + this.dt*this.speed;

  if (this.hide === 1) {
    this.alpha = this.alpha - this.dt*this.speed;
  }

  if (this.alpha < 0) {
    this.alpha = 0;
    this.visible = false;
    amplify.unsubscribe('dt', this.dtFn);
  }
};

SpeechBubble.prototype.draw = function(ctx) {

  ctx.font = this.font;
  ctx.globalAlpha = this.alpha;
  // Box centered above tile
  ctx.fillStyle = uiStyle.notify.bgcolor;
  this.drawBubble(ctx, this.xPos-10, this.yPos, this.width, this.height, 5, this.xPos+(this.width/2.0), this.yPos+this.height+20);
  ctx.fillStyle = uiStyle.notify.textcolor;
  ctx.globalAlpha = this.alpha;
  ctx.textBaseline = 'middle';
  ctx.fillText(this.text, this.xPos+this.offset-10, this.yPos+this.height/2);

  // Reset alpha
  ctx.globalAlpha=1.0;
};
