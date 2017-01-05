/*
 *The main menu page and homepage for the webbrowser
 */

Browser.websites['arpa.towerblock.ac/staffportal'] = {
title : 'Towerblock Polytechnic Staff Portal',
stylesheet : 'websites/university/university.css',
content : '\
<header id = "universityHeader">\
  <section class = "headerPadding">\
    Towerblock\
    <br>\
    Polytechnic\
  </section>\
  <section id = "headingContainer">\
    <h1 class = "pageHeading">\
      Staff Portal\
    </h1>\
    <h2 class = "tagline">\
      Staff Resource Pages\
    </h2>\
  </section>\
  <section class = "headerPadding">\
  </section>\
</header>\
<nav id = "universityNavigation">\
</nav>\
<section id = "universityMainBody">\
  <section class = "contentContainer">\
    <header class = "contentHeader">\
      Wow Content!\
    </header>\
    <section class = "contentMain">\
      Experiment Points: {{experimentPoints}}. Theory Points:\
      {{theoryPoints}}. Computation Points: {{computationPoints}}.\
    </section>\
  </section>\
  <section class = "navigationContainer">\
    <header class = "navigationHeader">\
      Quick Links\
    </header>\
    <section class = "navigationMain">\
      <a href="#" onclick=\'Browser.changePage(\"arpa.towerblock.ac/email\")\'>\
        Email\
      </a>\
    </section>\
  </section>\
</section>\
'
}
