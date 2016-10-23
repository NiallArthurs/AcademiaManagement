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
    for (var i=0; i < 7; i++)
    {
      this.entities.push(new Character(this.map, names[i]));
    }

    for (var prop in this.map.objects)
    {
      if (this.map.objects[prop].zPos)
      {
        var objSprite = new ObjectSprite(this.map.atlas, this.map.objects[prop].width,
        this.map.objects[prop].height, this.map.objects[prop].xPos, this.map.objects[prop].yPos,
        this.map.objects[prop].xTile, this.map.objects[prop].yTile);

        // Popup notifications for foreground objects
        if (this.map.objects[prop].popupText !== undefined) {
          objSprite.notifyText = this.map.objects[prop].popupText;
          objSprite.inputCallback = function() {amplify.publish("popup-text",
            this.getX(), this.getY(), this.notifyText);};
        }
        this.entities.push(objSprite);
      }
    }

    this.ctx = _canvas.getContext("2d");
    this.width = _canvas.width;
    this.height = _canvas.height;
    this.bgcolor = "#54AB47";
    this.dt = 0;
    this.cameraSpeed = 6;
    var self = this;

    window.addEventListener('keydown', function (e) {
      self.key = e.keyCode;
      self.keyDown = true;
    })

    window.addEventListener('keyup', function (e) {
      self.keyDown = false;
    })

    amplify.subscribe("popup-text", function (x, y, text, fun) {
      self.createNotify(x, y, text, fun);
    });

    amplify.subscribe("dt", function (dt) {
      self.dt = dt;
    });

    amplify.subscribe("popup-menu", function (x, y, menu) {
      self.createMenu(x, y, menu);
    });
  };

  World.prototype = {

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
      if (val == true)
      {
        this.pause = true;
        amplify.publish( "pause", true);
      }
      else {
        this.pause = false;
        amplify.publish( "pause", false);
      }
    },
    update: function () {
      // Delete ui elements which are no longer visible
      var i = this.ui.length;
      while (i--)
      {
        if (!this.ui[i].visible)
        this.ui.splice(i, 1);
      }

      // Pause when ui elements active
      if (this.ui.length)
        this.pauseGame(true);
      else
        this.pauseGame(false);

      if (!this.pause)
      {
        for (var i=0; i < this.entities.length;  i++)
        {
          this.entities[i].update();
        }
      }
    },
    keyInput: function() {
      if (this.keyDown && this.key == 37 && cameraMapPosition[0] > 0) {cameraMapPosition[0] -= this.dt*this.cameraSpeed;}
      else if (this.keyDown && this.key == 38 && cameraMapPosition[1] > 0) {cameraMapPosition[1] -= this.dt*this.cameraSpeed;}
      else if (this.keyDown && this.key == 39 && cameraMapPosition[0] < this.map.width) {cameraMapPosition[0] += this.dt*this.cameraSpeed;}
      else if (this.keyDown && this.key == 40 && cameraMapPosition[1] < this.map.height) {cameraMapPosition[1] += this.dt*this.cameraSpeed;}
      else if (this.keyDown && this.key == 32) {this.centerCamera();}
    },
    draw: function (dt) {
      // Draw background
      this.ctx.fillStyle = this.bgcolor;
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Draw map
      this.map.draw(this.ctx);

      // Sort entities by y position
      var drawOrder = [];
      for (i=0; i < this.entities.length; i++)
      {
        if (this.entities[i].type === "object")
          drawOrder.push([i, this.entities[i].y]);
        else
          drawOrder.push([i, this.entities[i].sprite.y]);
      }

      drawOrder.sort(function(a, b){
        return a[1]-b[1];
      });

      // Draw entities
      for (j=0; j < this.entities.length; j++) {
        var i = drawOrder[j][0];
        this.entities[i].draw(this.ctx);
      }

      // Draw FPS
      this.ctx.fillStyle = "white";
      this.ctx.font = "25px Arial";
      var time = Time.getCurrent();
      var timeString = "Y: "+time[0]+" M: "+time[1]+ " D: "+time[2];
      var RPstring = ", RP E: "+GameState.experimentPoints+ " T: "+ GameState.theoryPoints + " C: "+ GameState.computationPoints;
      if (this.pause)
        this.ctx.fillText(timeString+" FPS: "+Math.floor(1/dt) + " (Paused)",10,30);
      else
        this.ctx.fillText(timeString+" FPS: "+Math.floor(1/dt)+ RPstring,10,30);

      // Draw any ui elements
      for (k=0; k < this.ui.length; k++)
        this.ui[k].draw(this.ctx);
    }
  }

  return World;
})();
