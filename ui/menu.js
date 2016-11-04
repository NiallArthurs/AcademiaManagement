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

  MenuItem.prototype = Object.create(MouseEvent.prototype);
  MenuItem.prototype.constructor = MenuItem;

  MenuItem.prototype.inputMouseDownCallback = function () {
    this.hide = 1;
    if (typeof this.inputMouseDownCallback === 'function')
    {
      this.inputMouseDownFn();
    }
  };

  MenuItem.prototype.draw = function(ctx) {

    if (this.hover) {
      ctx.fillStyle = uiStyle.menu.hoverbgcolor;
      ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
      ctx.fillStyle = uiStyle.menu.hovertextcolor;
      ctx.fillText(this.text, this.xPos+this.offset, this.yPos+this.height/2);
    } else {
      ctx.fillStyle = uiStyle.menu.textcolor;
      ctx.fillText(this.text, this.xPos+this.offset, this.yPos+this.height/2);
    }
  };

  return MenuItem;
})();

// menu = [["Text1",functioncallBack], ["Text1",functioncallBack2],["Text3",functioncallBack3]]
// Menu class
var Menu = (function () {

  var Menu = function(_x, _y, _menu) {
    MouseEvent.call(this, _x, _y, 0, 0, false);
    this.dt = 0;
    this.visible = true;
    this.hide = 0;
    this.offset = uiStyle.menu.padding;
    this.alpha = 0;
    this.speed = uiStyle.menu.fadespeed;
    this.menuInfo = _menu;
    this.menu = [];
    this.xPos = _x;
    this.yPos = _y;
    this.cleanupTest = false;
    this.dtFn = this.tick.bind(this);
    amplify.subscribe('dt', this.dtFn);
    this.font = uiStyle.menu.fontsize + 'px ' + uiStyle.menu.font;

    for (var i = this.menuInfo.length; i--;)
    {
      if (getTextWidth(this.menuInfo[i][0], this.font) > this.width)
        this.width = getTextWidth(this.menuInfo[i][0], this.font);
    }

    this.width += 2*this.offset;

    for (var j = this.menuInfo.length; j--;)
      this.menu.push(new MenuItem(this.xPos, this.yPos+j*(uiStyle.menu.fontsize+2*this.offset),
      this.menuInfo[j][0], this.width, (uiStyle.menu.fontsize+2*this.offset),
      this.offset, this.menuInfo[j][1]));

    this.height = this.menu.length*(uiStyle.menu.fontsize + 2*this.offset);
  };

  Menu.prototype = Object.create(MouseEvent.prototype);
  Menu.prototype.constructor = Menu;

  Menu.prototype.tick = function(dt) {

    if (this.clickOut === true)
      this.hide = 1;

    this.dt = dt;
    // Menu fade in and out
    if ((this.alpha < 1.0) && (this.hide === 0))
      this.alpha = this.alpha + this.dt*this.speed;

    if (this.hide === 1)
      this.alpha = this.alpha - this.dt*this.speed;

    if (this.hide === 1 && !this.cleanupTest)
    {
      for (var i=this.menu.length; i--;) {
        this.menu[i].cleanup();
      }
      this.cleanupTest = true;
    }

    if (this.alpha < 0)
    {
      this.alpha = 0;
      this.visible = false;
      amplify.unsubscribe('dt', this.dtFn);
    }

  };

  Menu.prototype.draw = function(ctx) {

    ctx.font = this.font;
    ctx.globalAlpha = this.alpha;
    // Box centered above tile
    ctx.fillStyle = uiStyle.menu.bgcolor;
    ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
    ctx.strokeStyle = uiStyle.menu.border;
    ctx.strokeRect(this.xPos, this.yPos, this.width, this.height);
    ctx.fillStyle = uiStyle.menu.textcolor;
    ctx.globalAlpha = this.alpha;
    ctx.textBaseline = 'middle';

    for (var k = this.menu.length; k--;)
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
