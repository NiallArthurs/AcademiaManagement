/*
 *Email Client
 */

Browser.websites['arpa.towerblock.ac/email'] = {
title : 'Towerblock Polytechnic Email',
stylesheet : 'websites/university/university.css',
onload : function onLoad() {EmailManager.populateBox('inbox');},
content : '\
<header id = "universityHeader">\
  <section class = "headerPadding">\
    Towerblock\
    <br>\
    Polytechnic\
  </section>\
  <section id = "headingContainer">\
    <h1 class = "pageHeading">\
      Email Portal\
    </h1>\
    <h2 class = "tagline">\
      Official University Email\
    </h2>\
  </section>\
  <section class = "headerPadding">\
  </section>\
</header>\
<nav id = "universityNavigation">\
</nav>\
<section id = "universityMainBody">\
  <section class = "navigationContainer">\
    <header class = "navigationHeader">\
    </header>\
    <section class = "navigationMain">\
      <a href="#" onclick=\'EmailManager.populateBox(\"inbox\")\'>\
        Inbox\
      </a>\
      <a href="#" onclick=\'EmailManager.populateBox(\"sent\")\'>\
        Sent\
      </a>\
      <a href="#" onclick=\'EmailManager.populateBox(\"archived\")\'>\
        Archived\
      </a>\
    </section>\
  </section>\
  <section id = "emailContainer">\
    <header id = "emailHeader">\
      \
    </header>\
    <section id = "emailMain">\
    </section>\
  </section>\
</section>\
'
}
