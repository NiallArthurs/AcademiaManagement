var browser = {
  isFullscreen : true, //Boolean for screensize
  active : false, //Boolean for if browser is open
  key : 0, //Keycode of most recent keyboard input
  keyDown : false, //Boolean for if a key is down
  websites : {}, //Dictionary of the websites available
  changePage : function(url) { //Displays the page associated with the url
    addressBar.value = url;
    if (this.websites[url] != undefined) {
      pageTitle.innerHTML = this.websites[url].title;
      websiteStyle.href = this.websites[url].stylesheet;
      pageContainer.innerHTML = this.websites[url].content;

      if (typeof this.websites[url].onload === 'function') {
        this.websites[url].onload();
      }
    } else {
      pageTitle.innerHTML = this.websites["404"].title;
      websiteStyle.href = this.websites["404"].stylesheet;
      pageContainer.innerHTML = this.websites["404"].content;
    }
  },
  getAddressBarURL : function() { //Gets the url in the address bar
    var addressString = addressBar.value.toLowerCase();
    var firstFive = addressString.substr(0,5);
    if (firstFive != "arpa.") {
      addressString = "arpa." + addressString;
    }
    return addressString;
  },
  homeButton : function () { //Loads the home page
    this.changePage("arpa.towerblock.ac/staffportal");
  },
  initialize : function () { //Initialzes the browser at the beginning of the game
    this.websites = websiteDictionary;
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
      if (document.activeElement.id == "addressBar" && this.key == 13) {
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
  templateChangePage : function(url) { //Page change function for templating
    addressBar.value = url;
    if (this.websites[url] != undefined) {
      pageTitle.innerHTML = this.websites[url].title;
      websiteStyle.href = "../" + this.websites[url].stylesheet;
      pageContainer.innerHTML = this.websites[url].content;
    } else {
      pageTitle.innerHTML = this.websites["404"].title;
      websiteStyle.href = "../" + this.websites["404"].stylesheet;
      pageContainer.innerHTML = this.websites["404"].content;
    }
  },
  toggle : function (isOpen) { //Moves the browser infront/behind of the game canvas
    if (isOpen) {
      menuContainer.style.zIndex = "11";
      this.active = true;
    } else {
      menuContainer.style.zIndex = "1";
      this.active = false;
    }
  },
  toggleWindowMode : function() { //Toggles between fullscreen and windowed mode
    if (this.isFullscreen) {
      this.isFullscreen = false;
      menuContainer.style.top = "60px";
      menuContainer.style.left = "240px";
      menuContainer.style.width = "800px";
      menuContainer.style.height = "600px";
    } else {
      this.isFullscreen = true;
      menuContainer.style.top = "0px";
      menuContainer.style.left = "0px";
      menuContainer.style.width = "1280px";
      menuContainer.style.height = "720px";
    }
  },
  update : function() { //Runs updates needed each game loop
    this.keyInput();
  }
}

var testInfo = {
  name : "Supereme Leader",
  date : "1st January 2016"
}

var websiteDictionary = {
  "arpa.google.com" : {
    title : "Google.com",
    stylesheet : " ",
    content :
      "\
      <section style='text-align:center;font-size:18pt;margin-top:30px;'>\
        It's spelt googol!\
        <br>\
        10000000000000000000000000000000000000000000000000000000000000000000000\
        000000000000000000000000000000\
      </section>\
      "
  },
  "arpa.towerblock.ac/staffportal" : {
    title : "Towerblock Polytechnic Staff Portal",
    stylesheet : "websites/university.css",
    content :
      "\
      <header id = 'universityHeader'>\
        <section class = 'headerPadding'>\
          Towerblock\
          <br>\
          Polytechnic\
        </section>\
        <section id = 'headingContainer'>\
          <h1 class = 'pageHeading'>\
            Staff Portal\
          </h1>\
          <h2 class = 'tagline'>\
            Staff Resource Pages\
          </h2>\
        </section>\
        <section class = 'headerPadding'>\
        </section>\
      </header>\
      <nav id = 'universityNavigation'>\
      </nav>\
      <section id = 'universityMainBody'>\
        <section class = 'contentContainer'>\
          <header class = 'contentHeader'>\
            Wow Content!\
          </header>\
          <section class = 'contentMain'>\
      "
      + Mustache.render("Hello {{name}} the date is {{date}}", testInfo) +
      "\
          </section>\
        </section>\
        <section class = 'navigationContainer'>\
          <header class = 'navigationHeader'>\
            Quick Links\
          </header>\
          <section class = 'navigationMain'>\
            <a href = '#' onclick = 'browser.changePage(\"arpa.towerblock.ac/email\")'>Email</a>\
          </section>\
        </section>\
      </section>\
      "
  },
  "arpa.towerblock.ac/email" : {
    title : "Towerblock Polytechnic Email",
    stylesheet : "websites/university.css",
    onload : function onLoad() {EmailManager.populateBox('inbox');},
    content :
      "\
      <header id = 'universityHeader'>\
        <section class = 'headerPadding'>\
          Towerblock\
          <br>\
          Polytechnic\
        </section>\
        <section id = 'headingContainer'>\
          <h1 class = 'pageHeading'>\
            Staff Portal\
          </h1>\
          <h2 class = 'tagline'>\
            Staff Resource Pages\
          </h2>\
        </section>\
        <section class = 'headerPadding'>\
        </section>\
      </header>\
      <nav id = 'universityNavigation'>\
      </nav>\
      <section id = 'universityMainBody'>\
        <section class = 'navigationContainer'>\
          <header class = 'navigationHeader'>\
          </header>\
          <section class = 'navigationMain'>\
          </section>\
        </section>\
        <section class = 'contentContainer'>\
          <header class = 'contentHeader'>\
            Email Inbox\
          </header>\
          <section id = 'emailMain'>\
            .\
          </section>\
        </section>\
      </section>\
      "
  },
  "404" : {
    title : "404 Not Found",
    stylesheet : " ",
    content :
      "\
      <h1 style='font-size: 30pt; margin-top: 5px;'>\
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
      "
  }
}
