DEFAULT_ADDRESS = 's.strawb@towerblock.ac';

var EmailManager = {
  'inbox' : [{ident:999,
              read:false,
              sender:'Dipesh',
              receiver:DEFAULT_ADDRESS,
              subject:'Your Email system sucks!',
              content:'Get the email done NOW!',
              responses:[{short:'OK',long:'Alright I\'ll get it done now.',run:function(){GameState.addResearchPoint(1,5)}},
                         {short:'In a minute',long:'Yeah I\'ll get round to it when I can be bothered',run:function(){GameState.addResearchPoint(0,5)}}],
              time:Time.getCurrent()}],
  'sent' : [],
  'idCounter' : 0,
  //Used to create new emails.
  createEmail : function(_subject, _content, _responses, _sender, _receiver) {
    if (_receiver == undefined) {
      this.inbox.push({ident : this.idCounter,
                       read : false,
                       sender : _sender,
                       receiver : DEFAULT_ADDRESS,
                       subject : _subject,
                       content : _content,
                       responses : _responses,
                       time : Time.getCurrent()
                     });
    } else {
      this.inbox.push({ident : this.idCounter,
                       read : false,
                       sender : _sender,
                       receiver : _receiver,
                       subject : _subject,
                       content : _content,
                       responses : _responses,
                       time : Time.getCurrent()
                     });
    }
    this.idCounter++;
  },
  createResponseLine : function(_email, _index) {
    var html = document.getElementById("emailMain").innerHTML;
    html += '<div class="responseLine"\
            onclick="EmailManager.sendResponse(' + _email.ident + ',\''
            + _index + '\')">' + _email.responses[_index].short + '</div>';
    document.getElementById('emailMain').innerHTML = html;
  },
  createSummary : function(_email, _box) {
    var html = document.getElementById("emailMain").innerHTML;
    if (_email.read) {
      html += '<div class="emailSummaryLine readEmailLine"';
    } else {
      html += '<div class="emailSummaryLine"';
    }
    html += ' onclick="EmailManager.openEmail(' + _email.ident + ',\'' + _box + '\')">\
            <span class="emailSummarySender">' + _email.sender + '</span>\
            <span class="emailSummarySubject">' + _email.subject + '</span>\
            <span class="emailSummaryTime">' + Time.createDateString(_email.time)
            + '</span></div>';
    document.getElementById('emailMain').innerHTML = html;
  },
  //Used to return an email by its position in the box.
  getEmail : function(_ident, _box) {
    var contents = this.getBox(_box);
    for (var i = contents.length; i--;) {
      if (contents[i].ident == _ident) {
        return contents[i];
      }
    }
  },
  getEmailPosition : function(_ident) {
    var contents = this.getBox('inbox');
    for (var i = contents.length; i--;) {
      if (contents[i].ident == _ident) {
        return i;
      }
    }
  },
  //Used to return an entire box.
  getBox : function(_box) {
    return this[_box];
  },
  openEmail : function(_ident, _box) {
    var email = this.getEmail(_ident, _box);
    document.getElementById('emailMain').innerHTML = '<section id="emailPadding"></section>';
    Browser.textRender(email.subject, document.getElementById('emailHeader'));
    Browser.textRender(email.content, document.getElementById('emailPadding'));
    if (email.responses != undefined) {
      for (var i = 0; i < email.responses.length; i++) {
        this.createResponseLine(email, i);
      }
    }
    email.read = true;
  },
  populateBox : function(_box) {
    document.getElementById("emailMain").innerHTML = '';
    document.getElementById("emailHeader").innerHTML = '';
    var contents = this.getBox(_box);
    for (var i = contents.length; i--;) {
      this.createSummary(contents[i], _box);
    }
  },
  //Used to generate and process an email response.
  sendResponse : function(_ident, _responseID) {
    var email = this.getEmail(_ident,'inbox');
    this.inbox.splice(this.getEmailPosition(_ident), 1);
    this.populateBox('inbox');
    this.sent.push({ident : this.idCounter,
                    read : false,
                    sender : email.receiver,
                    receiver : email.sender,
                    subject : 'Re:' + email.subject,
                    content : email.responses[_responseID].long,
                    time : Time.getCurrent()
                  });
    email.responses[_responseID].run();
    this.idCounter++;
  }
};