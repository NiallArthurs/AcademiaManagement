var maleCharacter = {
  base : ['male-body'],
  hair : ['male-hair-messy',
          'male-hair-round',
          'male-hair-messy2'],
  top : ['male-top-black-tshirt',
	       'male-top-green-tshirt',
         'male-top-white-tshirt'],
  bottom : ['male-bottom-red-shorts',
            'male-bottom-blue-shorts']
};


var characterNames = [
  'Einstein',
  'Newton',
  'Euler',
  'Curie',
  'Feynman',
  'Galilei',
  'Darwin',
  'Pasteur',
  'Hawking',
  'Edison',
  'Faraday',
  'Tesla',
  'Turing',
  'de Vinci',
  'Kepler',
  'Planck',
  'Dirac',
  'Hooke',
  'Likhtman',
  'Wang',
  'Gauss',
  'Nobel',
  'Berners-Lee',
  'Descartes',
  'Amin',
  'Arthurs'
];

var CharacterManager = {
  entities : [],
  initialize: function(entities) {
    this.entities = entities;
  },
  getRandomCharacterName: function() {
    return characterNames[getRandomInt(0,characterNames.length-1)];
  },
  getRandomCharacterSprite : function() {
    var offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 32*3;
    offscreenCanvas.height = 42*4;
    var ctx = offscreenCanvas.getContext('2d');

    for (var obj in maleCharacter) {
      var num = getRandomInt(0, maleCharacter[obj].length-1);
      ctx.drawImage(loadQueue.getResult(maleCharacter[obj][num]), 0, 0);
    }
    return offscreenCanvas;
  },
  createCharacter : function(name, properties) {
    // Generate random Character
    if (properties === undefined) {
      this.entities.push(new Character(name, this.getRandomCharacterSprite()));
    }
    else {
      if (properties.sprite === undefined) {
        this.entities.push(new Character(name, this.getRandomCharacterSprite()));
      }

      if (properties.dummy === true) {
        this.entities[this.entities.length-1].dummy = true;
      }

      this.entities[this.entities.length-1].sprite.x = properties.x;
      this.entities[this.entities.length-1].sprite.y = properties.y;
    }
    return this.entities[this.entities.length-1];
  },
  removeCharacter : function(name) {
    //this.entities.find(ent => ent.name === name).cleanup();
    //this.entities = this.entities.filter(ent => ent.name !== name);

    for (var k = this.entities.length; k--;) {
      if (this.entities[k].name == name) {
        this.entities[k].cleanup();
        this.entities.splice(k, 1);
        return;
      }
    }
  }

};
