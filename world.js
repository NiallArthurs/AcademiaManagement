// World class
var World = (function () {

  var World = function(_canvas) {
    //this.map = new Map2D(testMap);
    this.pause = false;
    this.entities = [];
    TileMap.initializeMap(testMap, this.entities);
    this.centerCamera();
    this.ui = [];
    this.keyDown = false;
    this.key = 0;
    this.ctx = _canvas.getContext('2d');
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;
    this.width = _canvas.width;
    this.height = _canvas.height;
    this.dt = 0;
    this.cameraSpeed = uiStyle.world.cameraspeed;
    this.mouseX = 0;
    this.mouseY = 0;
    this.move = '';

    // Initialise the character manager
    CharacterManager.initialize(this.entities);

    // Initialise the event manager
    EventManager.initialize(this.entities);

    // Test Charaacters
    for (var i=0; i < 3; i++) {
      var char = CharacterManager.createCharacter(names[i]);
    }

    this.keyDownFn = this.inputKeyDown.bind(this);
    this.keyUpFn = this.inputKeyUp.bind(this);
    this.mouseDownFn = this.inputMouseDown.bind(this);
    this.mouseMoveFn = this.inputMouseMove.bind(this);
    this.createNotifyFn = this.createNotify.bind(this);
    this.createMenuFn = this.createMenu.bind(this);
    this.moveEntityFn = this.moveEntity.bind(this);
    this.speechBubbleFn = this.createSpeechBubble.bind(this);

    window.addEventListener('keydown', this.keyDownFn);
    window.addEventListener('keyup', this.keyUpFn);
    amplify.subscribe('popup-text', this.createNotifyFn);
    amplify.subscribe('speechbubble', this.speechBubbleFn);
    amplify.subscribe('popup-menu', this.createMenuFn);
    amplify.subscribe('move-entity', this.moveEntityFn);
  };

  World.prototype = {
    inputKeyDown: function(e) {
      this.key = e.keyCode;
      this.keyDown = true;
    },
    inputKeyUp: function(e) {
      this.keyDown = false;
    },
    inputMouseDown: function(data) {
      this.mouseX = data.ev.pageX - data.offsetLeft;
      this.mouseY = data.ev.pageY - data.offsetTop;
      var ent = this.entities.find(ent => ent.name == this.move);
      if (ent !== undefined) {

        if (ent.type === 'character') {
          ent.pause = false;
        }
        amplify.unsubscribe('mousemove', this.mouseMoveFn);
        amplify.unsubscribe('mousedown', this.mouseDownFn);
        this.move = '';
        ent.clearPath();
        TileMap.collisionOverlay = false;
      }
    },
    inputMouseMove: function(data) {
      this.mouseX = data.ev.pageX - data.offsetLeft;
      this.mouseY = data.ev.pageY - data.offsetTop;
    },
    moveEntity: function(name) {
      var ent = this.entities.find(ent => ent.name == name);

      if (ent !== undefined) {
        if (ent.type === 'character') {
          ent.pause = true;
        }

        TileMap.collisionOverlay = true;
        amplify.subscribe('mousemove', this.mouseMoveFn);
        amplify.subscribe('mousedown', this.mouseDownFn);
        this.move = name;
      }
    },
    createSpeechBubble: function(name, text, duration) {
      var ent = this.entities.find(ent => ent.name == name && ent.type == 'character');

      if (ent !== undefined) {
        this.entities.push(new SpeechBubble(function() {return ent.sprite.getX();}, function() {return ent.sprite.getY();}, text, duration));
      }
    },
    createNotify: function (x, y, text, fun) {
      this.ui.push(new Notify(x, y, text, fun));
    },
    centerCamera: function() {
      // Center camera position
      cameraMapPosition = [Math.floor(TileMap.width/2), Math.floor(TileMap.height/2)];
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
      this.ui = this.ui.filter(el => el.visible);

      // Pause when ui elements active
      if (this.ui.length || Browser.active)
        this.pauseGame(true);
      else
        this.pauseGame(false);

      if (!this.pause) {
        // Move characters and objects (soon)
        if (this.move !== '') {
          var ent = this.entities.find(ent => ent.name == this.move);

          if (ent !== undefined && ent.type === 'character') {
              var x = Math.floor((this.mouseX - cameraScreenPosition[0])/TILE_SIZE + cameraMapPosition[0]);
              var y = Math.floor((this.mouseY - cameraScreenPosition[1])/TILE_SIZE + cameraMapPosition[1]);

              if (!TileMap.collision(x,y)) {
                ent.sprite.x = x;
                ent.sprite.y = y;
                TileMap.setCharacterOccupied(this.move, x, y);
              }
          }
        }

        // Run the update function for each entity
        this.entities.filter(ent => ent.type !== 'object').forEach(
          (ent) => {ent.update()});

        // Run the event manager update function
        EventManager.update();
      }
    },
    keyInput: function() {

      if (!this.keyDown)
        return;

      // If the game is paused a subset of keys are active
      if (!this.pause) {
        if (this.key === 37 && cameraMapPosition[0] > 0) {
          cameraMapPosition[0] -= this.dt*this.cameraSpeed;
        }
        else if (this.key === 38 && cameraMapPosition[1] > 0) {
          cameraMapPosition[1] -= this.dt*this.cameraSpeed;
        }
        else if (this.key === 39 && cameraMapPosition[0] < TileMap.width) {
          cameraMapPosition[0] += this.dt*this.cameraSpeed;
        }
        else if (this.key === 40 && cameraMapPosition[1] < TileMap.height) {
          cameraMapPosition[1] += this.dt*this.cameraSpeed;
        }
        else if (this.key === 32) {
          this.centerCamera();
        }
        else if (this.key === 77) {
          Browser.toggle(true);
        }
        else if (this.key === 69) {
          var eventName = prompt("Enter event name");
          if (eventName !== null && eventName !== '') {
            EventManager.randomEventTrigger(eventName);
          }
          this.keyDown = false;
        }
        else if (this.key === 67) {
          TileMap.collisionOverlay = !TileMap.collisionOverlay;
          this.keyDown = false;
        }
      }
      else {
        if (this.key === 13) {
          // If a ui element is a notification we call the click behaviour on enter key
          if (this.ui.length) {
            if (this.ui[0].type === 'notify')
            this.ui[0].inputMouseDownCallback();
          }
        }
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
      TileMap.draw(this.ctx);

      // Populate an array of entit for sorting
      var drawOrder = this.entities.map((entity, index) =>
        {return {pos: index, y: entity.getTileY(), z: entity.z}});

      // Order initially by y and then by z (allows for objects to be stacked)
      drawOrder.sort(orderByProperty('y','z'))

      // Draw entities using the above order
      for (var j=0; j < this.entities.length; j++) {
        this.entities[drawOrder[j].pos].draw(this.ctx);
      }

      EventManager.draw(this.ctx);

      // Draw FPS
      this.ctx.fillStyle = 'white';
      this.ctx.font = '20px Arial';
      this.ctx.textBaseline = 'middle';
      var time = Time.getCurrent();
      var timeString = 'Y: '+time[0]+' M: '+time[1]+ ' D: '+time[2];
      var RPstring = 'Research Points Exp: '+GameState.experimentPoints+ '. Theo: '+ GameState.theoryPoints + '. Comp: '+ GameState.computationPoints;
      var emailString = 'Unread Emails: ' + EmailManager.countUnreadEmail();

      if (this.pause) {
        this.ctx.fillText(timeString+' FPS: '+Math.floor(1/dt) + ' (Paused)',10,20);
      }
      else {
        this.ctx.fillText(timeString+' FPS: '+Math.floor(1/dt),10,20);
        this.ctx.fillText(RPstring,10,20+20);
      }
      this.ctx.fillText(emailString,10,60);

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
