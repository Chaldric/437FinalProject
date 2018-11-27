var MAPWIDTH = 1600//800
var MAPHEIGHT = 1216//608
var TILEWIDTH = 16
var TILEHEIGHT = 16
class Scene1 extends Phaser.Scene {
  constructor() {
    super({key:"Scene1"});
  }

  preload(){
    this.load.image('Ship', 'assets/pShip.png')
    this.load.image('mario-tiles', 'assets/marioTilemap2B.png');
  }

  create(){
    this.image = this.add.image(400,300,'Ship').setDepth(2);

    this.level = createMap();

    var map = this.make.tilemap({ data: this.level, tileWidth: 16, tileHeight: 16 });
    var tiles = map.addTilesetImage("mario-tiles");
    //var layer = map.createStaticLayer(0, tiles, 0, 0);
    var layer = map.createDynamicLayer(0, tiles, 0, 0);

    this.input.keyboard.on('keyup_Q', function(event) {
      this.level = generateMap(this.level);
      var map = this.make.tilemap({ data: this.level, tileWidth: 16, tileHeight: 16 });
      var tiles = map.addTilesetImage("mario-tiles");
      //var layer = map.createStaticLayer(0, tiles, 0, 0);
      var layer = map.createDynamicLayer(0, tiles, 0, 0);
    },this);


    this.key_A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.key_D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.key_W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.key_S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    this.input.on('pointerdown', function(event) {
      this.image.x = event.x;
      this.image.y = event.y;
    },this);

    this.input.keyboard.on('keyup_P', function(event){
      var physicsImage = this.physics.add.image(this.image.x, this.image.y, 'Ship');
      physicsImage.setVelocity(Phaser.Math.RND.integerInRange(-100,100), -300);
    },this);

    this.input.keyboard.on('keyup', function(event){
      if(event.key == "2"){
        this.scene.start("Scene2");
      }

      if(event.key == "3"){
        this.scene.start("Scene3");
      }

    },this);


  }

  update(delta){
    checkKeys(this);
  }

}

function checkKeys(scene){
  if(scene.key_A.isDown)
    scene.image.x--;
  if(scene.key_D.isDown)
    scene.image.x++;
  if(scene.key_W.isDown)
    scene.image.y--;
  if(scene.key_S.isDown)
    scene.image.y++;
}

function createMap(){
  var sizeX = MAPWIDTH / TILEWIDTH;
  var sizeY = MAPHEIGHT / TILEHEIGHT;
  var level = new Array(sizeX);
  for (i = 0; i < sizeX; i++)
    level[i] = new Array(sizeY);

  for (x = 1; x < sizeX-1; x++){
    for (y = 1; y < sizeY-1; y++){
      if (Phaser.Math.RND.integerInRange(0,100) < 40)
        level[y][x] = 1;
      else
        level[y][x] = 0;
    }
  }

  for (x = 0; x < sizeX; x++)
    level[0][x] = level[sizeY-1][x] = 1;

  for (y = 0; y < sizeY; y++)
    level[y][0] = level[y][sizeX-1] = 1;

  for (g = 0; g < 6; g++)
    generateMap(level);
  //generateMap(level);

  //level[x][y] = Phaser.Math.RND.integerInRange(0,39)


   /*[
    [  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ],
    [  0,   1,   2,   3,   0,   0,   0,   1,   2,   3,   0 ],
    [  0,   5,   6,   7,   0,   0,   0,   5,   6,   7,   0 ],
    [  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ],
    [  0,   0,   0,  14,  13,  14,   0,   0,   0,   0,   0 ],
    [  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ],
    [  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ],
    [  0,   0,  14,  14,  14,  14,  14,   0,   0,   0,  15 ],
    [  0,   0,   0,   0,   0,   0,   0,   0,   0,  15,  15 ],
    [ 35,  36,  37,   0,   0,   0,   0,   0,  15,  15,  15 ],
    [ 39,  39,  39,  39,  39,  39,  39,  39,  39,  39,  39 ]
  ];*/

  return level;
}

function generateMap(tiles){

  var sizeX = MAPWIDTH / TILEWIDTH;
  var sizeY = MAPHEIGHT / TILEHEIGHT;

  for (x = 1; x < sizeX-1; x++){
    for (y = 1; y < sizeY-1; y++){
      tiles[y][x] = placeWall(x,y,tiles);
    }
  }

  return tiles;
}

function placeWall(row,column,tiles){
  let adjWalls = getNumAdj(row,column,tiles);
  if (tiles[column][row] == 1){
    if (adjWalls >= 4)
      return 1
    else if (adjWalls < 2)
      return 0
  }
  else {
    if (adjWalls >= 5)
      return 1;
  }
  return 0;
}

function getNumAdj(row,column,tiles){
  //return 0;
  let startX = row - 1;
  let startY = column - 1;
  let endX = row + 1;
  let endY = column + 1;

  let wallAdj = 0;
  let x = 0
  let y = 0

  for (x = startX; x <= endX; x++){
    for (y = startY; y <= endY; y++){
      if (!(x == row && y == column)){
        if (isWall(x,y,tiles)){
          wallAdj++;
        }
      }
    }
  }

  return wallAdj;
}

function isWall(x, y, tiles){

  if (checkBounds(x,y)){
    return true;
  }

  if (tiles[y][x] == 1){
    return true;
  }

  if (tiles[y][x] == 0){
    return false;
  }
  return false;
}

function checkBounds(x, y){

  var sizeX = MAPWIDTH / TILEWIDTH;
  var sizeY = MAPHEIGHT / TILEHEIGHT;

  if( x < 0 || y < 0 ){
    return true;
  }
  else if( x > sizeX-1 || y > sizeY-1 ){
    return true;
  }
  return false;
}
