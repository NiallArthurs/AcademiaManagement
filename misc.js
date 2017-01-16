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
}

function drawBubble(ctx, x, y, w, h, radius, px, py){
  var r = x + w;
  var b = y + h;
  if(py<y || py>y+h){
    var con1 = Math.min(Math.max(x+radius,px-10),r-radius-20);
    var con2 = Math.min(Math.max(x+radius+20,px+10),r-radius);
  }
  else{
    var con1 = Math.min(Math.max(y+radius,py-10),b-radius-20);
    var con2 = Math.min(Math.max(y+radius+20,py+10),b-radius);
  }
  var dir;
  if(py < y) dir = 2;
  if(py > y) dir = 3;
  if(px < x && py>=y && py<=b) dir = 0;
  if(px > x && py>=y && py<=b) dir = 1;
  if(px >= x && px <= r && py >= y && py <= b) dir = -1;
  ctx.clearRect(0,0,400,400);
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.fillStyle="white";
  ctx.lineWidth="2";
  ctx.moveTo(x+radius,y);
  if(dir==2){
    ctx.lineTo(con1,y);
    ctx.lineTo(px,py);
    ctx.lineTo(con2,y);
    ctx.lineTo(r-radius,y);
  }
  else ctx.lineTo(r-radius,y);
  ctx.quadraticCurveTo(r,y,r,y+radius);
  if(dir==1){
    ctx.lineTo(r,con1);
    ctx.lineTo(px,py);
    ctx.lineTo(r,con2);
    ctx.lineTo(r,b-radius);
  }
  else ctx.lineTo(r,b-radius);
  ctx.quadraticCurveTo(r, b, r-radius, b);
  if(dir==3){
    ctx.lineTo(con2,b);
    ctx.lineTo(px,py);
    ctx.lineTo(con1,b);
    ctx.lineTo(x+radius,b);
  }
  else ctx.lineTo(x+radius,b);
  ctx.quadraticCurveTo(x, b, x, b-radius);
  if(dir==0){
    ctx.lineTo(x,con2);
    ctx.lineTo(px,py);
    ctx.lineTo(x,con1);
    ctx.lineTo(x,y+radius);
  }
  else ctx.lineTo(x,y+radius);
  ctx.quadraticCurveTo(x, y, x+radius, y);
  ctx.stroke();
  ctx.fill();
}
