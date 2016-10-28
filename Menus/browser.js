var addressBar = document.getElementById("addressBar");
var menuContainer = document.getElementById("menuContainer");
var pageContainer = document.getElementById("pageContainer");
var pageTitle = document.getElementById("pageTitle");

var isFullscreen = true;

var websites = {
  "arpa.google.com" : {title : "Google.com",
                       content : "<section style='text-align:center;font-size:18pt;margin-top:30px;'>It's spelt googol!<br>10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000<\section>"
                      },
  "arpa.towerblock.ac/staffportal" : {title : "Towerblock Polytechnic Staff Portal",
                                      content : "Test"
                                     },
  "404" : {title : "404 Not Found",
           content : "<h1 style='font-size: 30pt; margin-top: 5px;'>Not Found</h1>The resource you are looking for might have been removed, had its name changed, or is temporarily unavailable.<hr>Please try the following:<ul><li>If you manually entered the address, make sure that it is spelled correctly.</li><li>Click the back button to try another link.</li></ul>"
          }
}

homeButton();


function changeZPosition(isOpen) {
  if (isOpen) {
    menuContainer.style.zIndex = "11";
    world.pauseGame(true);
  } else {
    menuContainer.style.zIndex = "1";
    world.pauseGame(false);
  }
}

function changePage(url) {
  addressBar.value = url;
  if (websites[url] != undefined) {
    pageTitle.innerHTML = websites[url].title;
    pageContainer.innerHTML = websites[url].content;
  } else {
    pageTitle.innerHTML = websites["404"].title;
    pageContainer.innerHTML = websites["404"].content;
  }
}

function getAddressBarURL() {
  var addressString = addressBar.value.toLowerCase();
  var firstFive = addressString.substr(0,5);
  if (firstFive != "arpa.") {
    addressString = "arpa." + addressString;
  }
  return addressString;
}

function homeButton() {
  changePage("arpa.towerblock.ac/staffportal");
}

function toggleWindowMode(isWindowed) {
  if (isFullscreen) {
    isFullscreen = false;
    menuContainer.style.top = "60px";
    menuContainer.style.left = "240px";
    menuContainer.style.width = "800px";
    menuContainer.style.height = "600px";
  } else {
    isFullscreen = true;
    menuContainer.style.top = "0px";
    menuContainer.style.left = "0px";
    menuContainer.style.width = "1280px";
    menuContainer.style.height = "720px";
  }

}
