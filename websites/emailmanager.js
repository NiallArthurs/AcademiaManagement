DEFAULT_ADDRESS = 's.strawb@towerblock.ac';

var EmailManager = {
  'inbox' : [{sender:"Dipesh"},{sender:"Niall"}],
  'sent' : [],
  //Used to create new emails.
  createEmail : function(_subject, _content, _responses, _sender, _receiver) {
    if (_receiver == undefined) {
      this.inbox.push({sender : _sender,
                       receiver : DEFAULT_ADDRESS,
                       subject : _subject,
                       content : _content,
                       responses : _responses,
                       time : Time.getCurrent()
                     });
    } else {
      this.inbox.push({sender : _sender,
                       receiver : _receiver,
                       subject : _subject,
                       content : _content,
                       responses : _responses,
                       time : Time.getCurrent()
                     });
    }
  },
  createSummary : function(_email) {
    html = document.getElementById("emailMain").innerHTML;
    html += " " + _email.sender;
    document.getElementById("emailMain").innerHTML = html;
  },
  //Used to return an email by its position in the box.
  getEmail : function(_id, _box) {
    if (_box == undefined) {
      return this.inbox[_id];
    } else {
      return this._box[_id];
    }
  },
  //Used to return an entire box.
  getBox : function(_box) {
    return this[_box];
  },
  populateBox : function(_box) {
    contents = this.getBox(_box);
    contents.forEach(this.createSummary);
  },
  //Used to generate and process an email response.
  sendResponse : function(_id, _response) {
    var email = this.getEmail(_id);
    this.inbox.splice(_id, 1);
    this.sent.push({sender : email.receiver,
                    receiver : email.sender,
                    subject : email.responses._response.subject,
                    content : email.responses._response.content,
                    time : Time.getCurrent()
                  });
    email.responses._response.function();
  }
};
