var config = {
  type:Phaser.AUTO,
  width:800,
  height:608,
  pixelArt: true,
  physics: {
    default:'arcade',
    arcade: {
      gravity: {y : 0},
      debug: false
    }
  },
  scene: [ Scene1, Scene2, Scene3 ]
};

var MAPWIDTH = 800
var MAPHEIGHT = 608
var TILEWIDTH = 16
var TILEHEIGHT = 16
var SIZEX = MAPWIDTH / TILEWIDTH;
var SIZEY = MAPHEIGHT / TILEHEIGHT;


var TILE_MAPPING = {
  FLOOR: 452,
  WALL: 341,
  GOLD: 393
}

var STOP = 0;
var UP = 1;
var DOWN = 2;
var LEFT = 3;
var RIGHT = 4;

var pSnake, food;
var eSnake, eSnakes;

var controls;
var map, gMap;
var groundLayer, goldLayer;

var cursors;

var text1, text2, text3, text4;

var game = new Phaser.Game(config);
