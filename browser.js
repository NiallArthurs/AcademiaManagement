var browser = {
  isFullscreen : true,
  active : false,
  websites : {},
  changePage : function(url) {
    addressBar.value = url;
    if (this.websites[url] != undefined) {
      pageTitle.innerHTML = this.websites[url].title;
      websiteStyle.href = this.websites[url].stylesheet;
      pageContainer.innerHTML = this.websites[url].content;
    } else {
      pageTitle.innerHTML = this.websites["404"].title;
      websiteStyle.href = this.websites["404"].stylesheet;
      pageContainer.innerHTML = this.websites["404"].content;
    }
  },
  changeZPosition : function (isOpen) {
    if (isOpen) {
      menuContainer.style.zIndex = "11";
      this.active = true;
    } else {
      menuContainer.style.zIndex = "1";
      this.active = false;
    }
  },
  getAddressBarURL : function() {
    var addressString = addressBar.value.toLowerCase();
    var firstFive = addressString.substr(0,5);
    if (firstFive != "arpa.") {
      addressString = "arpa." + addressString;
    }
    return addressString;
  },
  homeButton : function () {
    this.changePage("arpa.towerblock.ac/staffportal");
  },
  initialize : function () {
    this.websites = websiteDictionary;
    this.homeButton();
  },
  templateChangePage : function(url) {
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
  toggleWindowMode : function() {
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
  }
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
      <nav>\
      </nav>\
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
