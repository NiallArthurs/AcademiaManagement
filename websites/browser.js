var HOMEPAGE = 'arpa.towerblock.ac/staffportal';

var Browser = {
  isFullscreen : true, //Boolean for screensize
  active : false, //Boolean for if browser is open
  current : '',
  key : 0, //Keycode of most recent keyboard input
  keyDown : false, //Boolean for if a key is down
  websites : {}, //Dictionary of the websites available
  changePage : function(url) { //Displays the page associated with the url
    if (url == this.current) {
      return;
    }
    addressBar.value = url;
    if (this.websites[url] != undefined) {
      pageTitle.innerHTML = this.websites[url].title;
      websiteStyle.href = this.websites[url].stylesheet;
      this.textRender(this.websites[url].content);
      this.current = url;

      if (typeof this.websites[url].onload === 'function') {
        this.websites[url].onload();
      }
    } else {
      pageTitle.innerHTML = this.websites['404'].title;
      websiteStyle.href = this.websites['404'].stylesheet;
      this.textRender(this.websites['404'].content);
      this.current = '404';
    }
  },
  getAddressBarURL : function() { //Gets the url in the address bar
    var addressString = addressBar.value.toLowerCase();
    var firstFive = addressString.substr(0,5);
    if (firstFive != 'arpa.') {
      addressString = 'arpa.' + addressString;
    }
    return addressString;
  },
  homeButton : function () { //Loads the home page
    this.changePage(HOMEPAGE);
  },
  initialize : function () { //Initialzes the browser at the beginning of the game
    this.homeButton();
    window.addEventListener('keydown', this.keyDownFn.bind(this));
    window.addEventListener('keyup', this.keyUpFn.bind(this));
  },
  keyDownFn : function(e) { //Stores key information on a key press
    this.key = e.keyCode;
    this.keyDown = true;
  },
  keyInput : function() { //Checks and run corresponding functions for each keypress
    if (this.active && this.keyDown) {
      if (document.activeElement.id == 'addressBar' && this.key == 13) {
        this.changePage(this.getAddressBarURL());
      }
      if (this.key == 27) {
        this.toggle(false);
      }
    }
  },
  keyUpFn : function(e) { //Resets when a key is no longer pressed
    this.keyDown = false;
  },
  refresh : function() {
    page = this.current;
    this.changePage('blank');
    this.changePage(page);
  },
  textRender : function(_text, _location) {
    if (_location == undefined) {
      _location = document.getElementById('pageContainer');
    }
    _location.innerHTML = Mustache.render(_text, GameState);
  },
  toggle : function (isOpen) { //Moves the browser infront/behind of the game canvas
    if (isOpen) {
      this.homeButton();
      this.refresh();
      menuContainer.style.zIndex = '11';
      this.active = true;
    } else {
      menuContainer.style.zIndex = '1';
      this.active = false;
    }
  },
  toggleWindowMode : function() { //Toggles between fullscreen and windowed mode
    if (this.isFullscreen) {
      this.isFullscreen = false;
      menuContainer.style.top = '60px';
      menuContainer.style.left = '240px';
      menuContainer.style.width = '800px';
      menuContainer.style.height = '600px';
    } else {
      this.isFullscreen = true;
      menuContainer.style.top = '0px';
      menuContainer.style.left = '0px';
      menuContainer.style.width = '1280px';
      menuContainer.style.height = '720px';
    }
  },
  update : function() { //Runs updates needed each game loop
    this.keyInput()
  }
}

Browser.websites['404'] = {
title : '404 Not Found',
stylesheet : '',
content : '\
<h1 style="font-size: 30pt; margin-top: 5px;">\
  Not Found\
</h1>\
<p>\
  The resource you are looking for might have been removed, had its name \
  changed, or is temporarily unavailable.\
</p>\
<hr>\
<p>\
  Please try the following:\
</p>\
<ul>\
  <li>\
    If you manually entered the address, make sure that it is spelled cor\
    rectly.\
  </li>\
  <li>\
    Click the back button to try another link.\
  </li>\
</ul>\
'
}

Browser.websites['blank'] = {
title : '',
stylesheet : '',
content : ''
}

loadQueue.loadFile("websites/google/google.js");
loadQueue.loadFile("websites/university/staffportal.js");
loadQueue.loadFile("websites/university/email.js");
