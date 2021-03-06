//Function to create 2D arrays filled with zeros
function zero2D(rows, cols) {
  var array = [], row = [];
  while (cols--) row.push(0);
  while (rows--) array.push(row.slice());
  return array;
}

// Return random int in range [min, max]
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat (min, max)
{
  return min + Math.random()*(max-min);
}

function orderByProperty(prop) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function (a, b) {
    var equality = a[prop] - b[prop];
    if (equality === 0 && arguments.length > 1) {
      return orderByProperty.apply(null, args)(a, b);
    }
    return equality;
  };
}

/**
* Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
*
* @param text The text to be rendered.
* @param {String} font The css font descriptor that text is to be rendered with (e.g. "14px verdana").
*
* @see http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
*/
function getTextWidth(text, font) {
  // if given, use cached canvas for better performance
  // else, create new canvas
  var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
  var context = canvas.getContext("2d");
  context.font = font;
  var metrics = context.measureText(text);
  return metrics.width;
};

// Returns a random property from an object
var getRandomProperty = function (obj) {
  var keys = Object.keys(obj)
  return obj[keys[ keys.length * Math.random() << 0]];
};

/**
* Randomize array element order in-place.
* Using Durstenfeld shuffle algorithm.
*/
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};
