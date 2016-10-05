var TILE_SIZE = 32;
var CAMERA_SPEED = 0.25;
var SUPPORTED_RESOUTIONS = [[1280,720]];

var canvas = document.getElementById("gameArea");
var ctx = canvas.getContext("2d");
var tileSet = document.getElementById("tileset");
var mapTools = document.getElementById("mapTools");
var objectTiles = document.getElementById("objectMap");
var mapText = document.getElementById("map");
var x, y, keyPress;

var editorMode = 0;
var brushID = 0;

var i = 0;
while (window.innerHeight < SUPPORTED_RESOUTIONS[i][1]) {i++;}
canvas.width = SUPPORTED_RESOUTIONS[i][0];
canvas.height = SUPPORTED_RESOUTIONS[i][1];
mapText.width = canvas.width;

//Setup initial camera parameters
var cameraScreenPosition = [0.5 * (canvas.width - TILE_SIZE), 0.5 * (canvas.height - TILE_SIZE)];
var cameraMapPosition = [2.0, 2.0];

//Parameters for test map
var mapLayout = [[1,1,17,16,16,16,24,16,16,16,16,16,19],[1,1,15,30,0,0,14,33,0,0,0,0,15],[17,16,20,33,0,0,0,0,0,0,0,0,15],[15,30,0,0,0,0,12,32,0,0,0,0,15],[40,50,0,0,0,0,18,16,19,32,0,0,15],[15,30,0,0,0,0,0,0,15,30,0,0,15],[40,50,0,0,0,0,0,0,15,30,0,0,15],[15,30,0,0,0,0,0,0,15,30,0,0,15],[18,16,19,32,0,0,0,0,15,30,0,0,15],[1,1,15,30,0,0,0,0,15,30,0,0,15],[1,1,18,16,16,16,16,16,22,16,16,16,20]];
var mapWidth = mapLayout.length;
var mapHeight = mapLayout[0].length;
var objectMap = [[0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,10,20,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0],[0,30,40,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,11,21,0,0,0,0,0,0,0,0],[0,0,0,12,22,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0]];
var collisionMap = [[1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,0,0,1,1,0,0,0,0,1],[1,1,1,1,0,0,0,0,0,0,0,0,1],[1,1,0,0,0,0,1,1,0,0,0,0,1],[1,1,0,0,0,0,1,1,1,1,0,0,1],[1,1,0,0,0,0,0,0,1,1,0,0,1],[1,1,0,0,0,0,0,0,1,1,0,0,1],[1,1,0,0,0,0,0,0,1,1,0,0,1],[1,1,1,1,0,0,0,0,1,1,0,0,1],[1,1,1,1,0,0,0,0,1,1,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1]];

mapText.innerHTML = "<h3>Map Output</h3><textarea readonly rows='10' cols='85'>" + produceMapString() + "</textarea>";

//Setup the Event Listener for keyboard input
window.addEventListener('keydown', function (e) {
  keyPress = e.keyCode;
})
window.addEventListener('keyup', function (e) {
  keyPress = false;
})
window.addEventListener('click', function(e) {
  var tileX = Math.floor(cameraMapPosition[0] + (e.pageX - cameraScreenPosition[0]) / TILE_SIZE);
  var tileY = Math.floor(cameraMapPosition[1] + (e.pageY - cameraScreenPosition[1]) / TILE_SIZE);
  if (e.which == 1 && editorMode == 0) {
    if (1440 < e.pageX && e.pageX < 1760 && 100 < e.pageY && e.pageY < 420) {
      brushID = Math.floor((e.pageX - 1440)/TILE_SIZE) + Math.floor((e.pageY - 100)/TILE_SIZE)*10;
    }
    else {
      mapLayout[tileX][tileY] = brushID;
      mapText.innerHTML = "<h3>Map Output</h3><textarea readonly rows='10' cols='85'>" + produceMapString() + "</textarea>";
    }
  }
  if (e.which == 2 && editorMode == 0) {
    var tileID = prompt("Enter new tile ID for (" + tileX + ", " + tileY + "):", mapLayout[tileX][tileY]);
    mapLayout[tileX][tileY] = tileID;
    mapText.innerHTML = "<h3>Map Output</h3><textarea readonly rows='10' cols='85'>" + produceMapString() + "</textarea>";
  }
  if (e.which == 1 && editorMode == 1) {
    collisionMap[tileX][tileY] = 1;
    mapText.innerHTML = "<h3>Map Output</h3><textarea readonly rows='10' cols='85'>" + produceMapString() + "</textarea>";
  }
  if (e.which == 2 && editorMode == 1) {
    collisionMap[tileX][tileY] = 0;
    mapText.innerHTML = "<h3>Map Output</h3><textarea readonly rows='10' cols='85'>" + produceMapString() + "</textarea>";
  }
})

ctx.font = "20px Courier New";

function gameLoop() {
  ctx.fillStyle = "#54AB47";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  controller();

  for (i = 0; i < mapWidth; i++) {
    x = cameraScreenPosition[0] + TILE_SIZE*(i - cameraMapPosition[0]);
    for (j = 0; j < mapHeight; j++) {
      y = cameraScreenPosition[1] + TILE_SIZE*(j - cameraMapPosition[1]);
      ctx.drawImage(tileSet, (mapLayout[i][j]%10)*TILE_SIZE, Math.floor(mapLayout[i][j]/10.0)*TILE_SIZE, TILE_SIZE, TILE_SIZE, x, y, TILE_SIZE, TILE_SIZE);
    }
  }

  for (i = 0; i < mapWidth; i++) {
    x = cameraScreenPosition[0] + TILE_SIZE*(i - cameraMapPosition[0]);
    for (j = 0; j < mapHeight; j++) {
      y = cameraScreenPosition[1] + TILE_SIZE*(j - cameraMapPosition[1]);
      ctx.drawImage(objectTiles, (objectMap[i][j]%10)*TILE_SIZE, Math.floor(objectMap[i][j]/10.0)*TILE_SIZE, TILE_SIZE, TILE_SIZE, x, y, TILE_SIZE, TILE_SIZE);
    }
  }

  if (editorMode == 1) {
    for (i = 0; i < mapWidth; i++) {
      x = cameraScreenPosition[0] + TILE_SIZE*(i - cameraMapPosition[0]);
      for (j = 0; j < mapHeight; j++) {
        y = cameraScreenPosition[1] + TILE_SIZE*(j - cameraMapPosition[1]);
        ctx.drawImage(mapTools, (collisionMap[i][j]%10)*TILE_SIZE, Math.floor(collisionMap[i][j]/10.0)*TILE_SIZE, TILE_SIZE, TILE_SIZE, x, y, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  ctx.fillStyle = "#000000";
  if (editorMode == 0) {
    ctx.fillText("Mapping Mode",10,20);
    ctx.fillText("Brush ID:" + brushID,1140,20);
  }
  if (editorMode == 1) {
    ctx.fillText("Collision Mode",10,20);
  }

  requestAnimationFrame(gameLoop);
}

function controller() {
  if (keyPress && keyPress == 37 && cameraMapPosition[0] > 0) {cameraMapPosition[0] -= CAMERA_SPEED;}
  if (keyPress && keyPress == 38 && cameraMapPosition[1] > 0) {cameraMapPosition[1] -= CAMERA_SPEED;}
  if (keyPress && keyPress == 39 && cameraMapPosition[0] < mapWidth) {cameraMapPosition[0] += CAMERA_SPEED;}
  if (keyPress && keyPress == 40 && cameraMapPosition[1] < mapHeight) {cameraMapPosition[1] += CAMERA_SPEED;}
  if (keyPress && keyPress == 67 && editorMode == 0) {editorMode = 1;}
  if (keyPress && keyPress == 77 && editorMode == 1) {editorMode = 0;}
}

function produceMapString() {
  var mapString = "mapLayout = [";
  for (i = 0; i < mapWidth - 1; i++) {
    mapString += "[";
    for (j = 0; j < mapHeight - 1; j++) {
      mapString += mapLayout[i][j] + ",";
    }
    mapString += mapLayout[i][mapHeight - 1] + "],";
  }
  mapString += "[";
  for (j = 0; j < mapHeight - 1; j++) {
    mapString += mapLayout[mapWidth - 1][j] + ",";
  }
  mapString += mapLayout[mapWidth - 1][mapHeight - 1] + "]];\n";
  mapString += "collisionMap = [";
  for (i = 0; i < mapWidth - 1; i++) {
    mapString += "[";
    for (j = 0; j < mapHeight - 1; j++) {
      mapString += collisionMap[i][j] + ",";
    }
    mapString += collisionMap[i][mapHeight - 1] + "],";
  }
  mapString += "[";
  for (j = 0; j < mapHeight - 1; j++) {
    mapString += collisionMap[mapWidth - 1][j] + ",";
  }
  mapString += collisionMap[mapWidth - 1][mapHeight - 1] + "]];";
  return mapString;
}

function genBlankMap() {
  var newMapX = prompt("Enter width:");
  var newMapY = prompt("Enter height:");
  mapLayout = zero2D(newMapX, newMapY);
  mapWidth = mapLayout.length;
  mapHeight = mapLayout[0].length;
  collisionMap = zero2D(newMapX, newMapY);
}

function refreshTileSet() {
  tileSet.src = "assets/tileset.png?t=" + new Date().getTime();
}

requestAnimationFrame(gameLoop);
