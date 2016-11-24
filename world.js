// World class
var World = (function () {

  var World = function(_canvas) {
    this.map = new Map2D(testMap);
    this.centerCamera();
    this.pause = false;
    this.entities = [];
    this.ui = [];
    this.keyDown = false;
    this.key = 0;
    for (var i=0; i < 7; i++) {
      this.entities.push(new Character(this.map, names[i]));
    }

    for (var prop in this.map.objects)
    {
      if (this.map.objects[prop].zPos)
      {
        var objSprite = new ObjectSprite(prop, this.map.atlas, this.map.objects[prop].width,
          this.map.objects[prop].height, this.map.objects[prop].xPos, this.map.objects[prop].yPos,
          this.map.objects[prop].xTile, this.map.objects[prop].yTile, this.map.objects[prop].zPos);

        // Popup notifications for foreground objects
        if (this.map.objects[prop].popupText !== undefined) {
          objSprite.notifyText = this.map.objects[prop].popupText;
          objSprite.inputCallback = function() {amplify.publish('popup-text',
            this.getX(), this.getY(), this.notifyText);};
        }
        this.entities.push(objSprite);
      }
    }

    this.ctx = _canvas.getContext('2d');
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;
    this.width = _canvas.width;
    this.height = _canvas.height;
    this.dt = 0;
    this.cameraSpeed = uiStyle.world.cameraspeed;

    this.keyDownFn = this.inputKeyDown.bind(this);
    this.keyUpFn = this.inputKeyUp.bind(this);
    this.createNotifyFn = this.createNotify.bind(this);
    this.createMenuFn = this.createMenu.bind(this);
    this.eventManager = new EventManager(this.entities, this.map);

    window.addEventListener('keydown', this.keyDownFn);
    window.addEventListener('keyup', this.keyUpFn);
    amplify.subscribe('popup-text', this.createNotifyFn);
    amplify.subscribe('popup-menu', this.createMenuFn);
  };

  World.prototype = {
    inputKeyDown: function(e) {
      this.key = e.keyCode;
      this.keyDown = true;
    },
    inputKeyUp: function(e) {
      this.keyDown = false;
    },
    createNotify: function (x, y, text, fun) {
      this.ui.push(new Notify(x, y, text, fun));
    },
    centerCamera: function() {
      // Center camera position
      cameraMapPosition = [Math.floor(this.map.width/2), Math.floor(this.map.height/2)];
    },
    createMenu: function (x, y, menu) {
      this.ui.push(new Menu(x, y, menu));
    },
    pauseGame: function(val) {
      if (val === true) {
        this.pause = true;
        amplify.publish('pause', true);
      }
      else {
        this.pause = false;
        amplify.publish('pause', false);
      }
    },
    update: function () {
      // Delete ui elements which are no longer visible
      var i = this.ui.length;
      while (i--) {
        if (!this.ui[i].visible)
        this.ui.splice(i, 1);
      }

      // Pause when ui elements active
      if (this.ui.length || Browser.active)
        this.pauseGame(true);
      else
        this.pauseGame(false);

      if (!this.pause) {
        for (var j=0; j < this.entities.length;  j++) {
          if (this.entities[j].type !== 'object')
            this.entities[j].update();
        }

        this.eventManager.update();
      }
    },
    keyInput: function() {

      if (this.pause || !this.keyDown)
        return;

      if (this.key == 37 && cameraMapPosition[0] > 0) {
        cameraMapPosition[0] -= this.dt*this.cameraSpeed;
      }
      else if (this.key == 38 && cameraMapPosition[1] > 0) {
        cameraMapPosition[1] -= this.dt*this.cameraSpeed;
      }
      else if (this.key == 39 && cameraMapPosition[0] < this.map.width) {
        cameraMapPosition[0] += this.dt*this.cameraSpeed;
      }
      else if (this.key == 40 && cameraMapPosition[1] < this.map.height) {
        cameraMapPosition[1] += this.dt*this.cameraSpeed;
      }
      else if (this.key == 32) {
        this.centerCamera();
      }
      else if (this.key == 77) {
        Browser.toggle(true);
      }

    },
    draw: function (dt) {

      this.dt = dt;

      // If the browser is active we don't need to redraw the world (wait until ui elements are removed)
      if (Browser.active && !this.ui.length)
	      return;

      // Draw background
      this.ctx.fillStyle = uiStyle.world.bgcolor;
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Draw map
      this.map.draw(this.ctx);

      // Sort entities
      var drawOrder = [];
      for (var k = this.entities.length; k--;) {
        if (this.entities[k].type === 'object')
          drawOrder.push({pos: k, y: this.entities[k].y, z: this.entities[k].z});
        else
          drawOrder.push({pos: k, y: this.entities[k].sprite.y, z: this.entities[k].z});
      }

      // Order initially by y and then by z (allows for objects to be stacked)
      drawOrder.sort(orderByProperty('y','z'))

      // Draw entities using the above order
      for (var j=0; j < this.entities.length; j++) {
        var i = drawOrder[j].pos;
        this.entities[i].draw(this.ctx);
      }

      this.eventManager.draw(this.ctx);

      // Draw FPS
      this.ctx.fillStyle = 'white';
      this.ctx.font = '20px Arial';
      this.ctx.textBaseline = 'middle';
      var time = Time.getCurrent();
      var timeString = 'Y: '+time[0]+' M: '+time[1]+ ' D: '+time[2];
      var RPstring = 'Research Points Exp: '+GameState.experimentPoints+ '. Theo: '+ GameState.theoryPoints + '. Comp: '+ GameState.computationPoints;

      if (this.pause)
        this.ctx.fillText(timeString+' FPS: '+Math.floor(1/dt) + ' (Paused)',10,20);
      else {
        this.ctx.fillText(timeString+' FPS: '+Math.floor(1/dt),10,20);
        this.ctx.fillText(RPstring,10,20+20);
      }

      // Draw any ui elements (one at a time)
      if (this.ui.length) {
        if (!this.ui[0].active)
          this.ui[0].active = true;
        this.ui[0].draw(this.ctx);
      }
    }
  }

  return World;
})();
