var addressBar = document.getElementById("addressBar");
var pageContainer = document.getElementById("pageContainer");
var pageTitle = document.getElementById("pageTitle");

var currentURL = "arpa.towerblock.ac/staffportal"

var websites = {
  "arpa.towerblock.ac/staffportal" : {title: "Towerblock Polytechnic Staff Portal",
                                      content: "Test"
                                     },
  "404" : {title: "404 Not Found",
           content: "<h1 style = 'font-size: 30pt; margin-top: 5px;'>Not Found</h1>The resource you are looking for might have been removed, had its name changed, or is temporarily unavailable.<hr>Please try the following:<ul><li>If you manually entered the address, make sure that it is spelled correctly.</li><li>Click the back button to try another link.</li></ul>"
          }
}

function getAddressBarURL() {
  return addressBar.value;
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
