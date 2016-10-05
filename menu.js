// Menu Item class
var MenuItem = (function () {

  var MenuItem = function(_x, _y, _text, _width, _height, _offset, _inputMouseDownCallback) {
    // Call MouseEvent constructor
    MouseEvent.call(this, _x, _y, 0, 0, true);
    this.text = _text;
    this.width = _width;
    this.offset = _offset;
    this.height = _height;
    this.xPos = _x;
    this.yPos = _y;
    this.hide = 0;
    this.inputMouseDownFn = _inputMouseDownCallback;
  };

  MenuItem.prototype = Object.create(MouseEvent.prototype)
  MenuItem.prototype.constructor = MenuItem;

  MenuItem.prototype.inputMouseDownCallback = function () {
    this.hide = 1;
    if (typeof this.inputMouseDownCallback === "function")
    {
      this.inputMouseDownFn();
    }
  }

  MenuItem.prototype.draw = function(ctx) {

    if (this.hover) {
      ctx.fillStyle = "green";
      ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
      ctx.fillStyle = "white";
      ctx.fillText(this.text, this.xPos+this.offset, this.yPos+this.height/2);
    } else {
      ctx.fillStyle = "black";
      ctx.fillText(this.text, this.xPos+this.offset, this.yPos+this.height/2);
    }
  };

  return MenuItem;
})();

// menu = [["Text1",functioncallBack], ["Text1",functioncallBack2],["Text3",functioncallBack3]]
// Menu class
var Menu = (function () {

  var Menu = function(_x, _y, _menu) {
    this.dt = 0;
    this.visible = true;
    this.hide = 0;
    this.offset = 5;
    this.alpha = 0;
    this.speed = 4;
    this.drawStartup = 1;
    this.width = 0;
    this.menuInfo = _menu;
    this.menu = [];
    this.xPos = _x;
    this.yPos = _y;
    this.cleanup = false;
    var self = this;

    amplify.subscribe( "dt", function (data) {
      self.tick(data);
    });
  };

  Menu.prototype.tick = function(dt) {

    this.dt = dt;
    // Menu fade in and out
    if ((this.alpha < 1.0) && (this.hide == 0))
      this.alpha = this.alpha + this.dt*this.speed;

    if (this.hide == 1)
      this.alpha = this.alpha - this.dt*this.speed;

    if (this.hide == 1 && !this.cleanup)
    {
      for (var i=0; i < this.menu.length; i++) {
        this.menu[i].cleanup();
      }
      this.cleanup = true;
    }
    if (this.alpha < 0)
    {
      this.alpha = 0;
      this.visible = false;
    }

  };

  Menu.prototype.draw = function(ctx) {

    ctx.font = "20px Arial";

    if (this.drawStartup)
    {
      for (var i = 0; i < this.menuInfo.length; i++)
      {
        if (ctx.measureText(this.menuInfo[i][0]).width > this.width)
          this.width = ctx.measureText(this.menuInfo[i][0]).width;
      }

      this.width += 2*this.offset;

      for (var j = 0; j < this.menuInfo.length; j++)
        this.menu.push(new MenuItem(this.xPos, this.yPos+j*(20+2*this.offset), this.menuInfo[j][0], this.width, (20+2*this.offset), this.offset, this.menuInfo[j][1]));

      this.height = this.menu.length*(20 + 2*this.offset);

      this.drawStartup = 0;
    }

    ctx.globalAlpha = this.alpha;
    // Box centered above tile
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
    ctx.strokeStyle = "green";
    ctx.strokeRect(this.xPos, this.yPos, this.width, this.height);
    ctx.fillStyle = "rgba(0, 0, 0, " + this.alpha + ")";
    ctx.textBaseline = "middle";

    for (var k = 0; k < this.menu.length; k++)
    {
      if (this.menu[k].hide === 1)
        this.hide = 1;

      this.menu[k].draw(ctx);
    }

    // Reset alpha
    ctx.globalAlpha = 1.0;
  };

  return Menu;
})();
