//var MAPWIDTH = 1600
//var MAPHEIGHT = 1216
//var MAPWIDTH = 800
//var MAPHEIGHT = 608
var TILEWIDTH = 16
var TILEHEIGHT = 16

var TILE_MAPPING = {
  FLOOR: 452,
  WALL: 341,
  GOLD: 393
}

var controls;
var map, gMap;
var gLayer, wLayer;
var player, seg;
var cursors;
var groundLayer, goldLayer;
var score = 0;
var text, playerVelX;


class Scene3 extends Phaser.Scene {
  constructor() {
    super({key:"Scene3"});
  }

  preload(){
    this.load.image('ship', 'assets/pShip.png');
    this.load.spritesheet('coin', 'assets/Coins/FullCoins.png', { frameWidth: 15, frameHeight: 16, spacing: 1 });
    this.load.image('tiles', 'assets/roguelikeDungeon_transparent.png');
    //this.load.image('tiles', 'assets/marioTilemap2B.png');
  }

  create(){
    createMap();

    map = this.make.tilemap({ data: gMap, tileWidth: 16, tileHeight: 16, insertNull: true });
    var worldTiles = map.addTilesetImage('tiles',null ,16,16,0,1,null,null);
    var stuffTiles = map.addTilesetImage('tiles',null ,16,16,0,1,null,null);

    groundLayer = map.createBlankDynamicLayer('Ground', worldTiles);
    goldLayer = map.createBlankDynamicLayer('Stuff', stuffTiles);

    groundLayer.putTilesAt(gMap, 0, 0);
    //groundLayer.fill(0);
    //groundLayer.putTileAt(1,0,0)
    groundLayer.setCollision(TILE_MAPPING.WALL);
    //goldLayer.putTileAt(TILE_MAPPING.GOLD,20,20)

    this.physics.world.bounds.width = MAPWIDTH//groundLayer.width;
    this.physics.world.bounds.height = MAPHEIGHT//groundLayer.height;

    player = this.physics.add.sprite(400,300,'coin').setDepth(2).setScale(2);
    player.setCollideWorldBounds(true);

    player.setVelocityX(3);

    console.log(player);

    seg = new Array(20);
    for (i = 0; i < 5; i++){
      seg[i] = this.physics.add.sprite(player.x + i*10,player.y,'coin').setDepth(2);//this.physics.add.image(player.x + 10,player.y,'ship');
    }

    this.physics.add.collider(groundLayer, player);

    //spawnGold(20,20);

    goldLayer.setTileIndexCallback(TILE_MAPPING.GOLD, collectCoin, this);

    this.physics.add.overlap(player, goldLayer);

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('coin',  {start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });
/*
    this.anims.create({
      key: 'idle',
      frames: [{key: 'player', frame: 'p1_stand'}],
      frameRate: 10,
    });
*/
    var cam = this.cameras.main;
    cam.setBounds(0, 0, MAPWIDTH, MAPHEIGHT);
    cam.startFollow(player, true);

    cursors = this.input.keyboard.createCursorKeys();

    text = this.add.text(20, 20, '0', {
       fontSize: '20px',
       fill: '#000000'
    });
    text.setScrollFactor(0);

    playerVelX = this.add.text(20, 40, '0', {
       fontSize: '20px',
       fill: '#000000'
    });
    playerVelX.setScrollFactor(0);

    var controlConfig = {
        camera: this.cameras.main,
        left: cursors.left,
        right: cursors.right,
        up: cursors.up,
        down: cursors.down,
        speed: 0.5
    };

    //controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);

    this.input.keyboard.on('keyup_Q', function(event) {

    },this);


    this.key_A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.key_D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.key_W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.key_S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    this.input.on('pointerdown', function(event) {
      player.x = event.x;
      player.y = event.y;
    },this);

    this.input.keyboard.on('keyup_P', function(event){
      var physicsImage = this.physics.add.image(player.x, player.y, 'Ship');
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

  update(time, delta){
    updateSeg();
    checkKeys(this);
    //updateSeg();
    //controls.update(delta);
    playerVelX.setText(player.body);
    //console.log(player);
  }

}

function checkKeys(scene){
  if(scene.key_A.isDown){
    player.setVelocityX(-300);
    player.anims.play('walk',true);
    player.flipX = true;
  }
  else if(scene.key_D.isDown){
    player.setVelocityX(300);
    player.anims.play('walk',true);
    player.flipX = false;
  }
  else {
    player.setVelocityX(0);
  }
  if(scene.key_W.isDown){
    player.setVelocityY(-300);
  }
  else if(scene.key_S.isDown){
    player.setVelocityY(300);
  }
  else {
    player.setVelocityY(0);
  }
}

function collectCoin(sprite, tile) {
  goldLayer.removeTileAt(tile.x, tile.y);
  score++;
  text.setText(score);
  spawnGold(25,25);
  return false;
}

function spawnGold(posX,posY){
  for (x = 1; x < sizeX-1; x++){
    for (y = 1; y < sizeY-1; y++){
      if (Phaser.Math.RND.integerInRange(0,100) < 40)
        gMap[y][x] = TILE_MAPPING.WALL;
      else
        gMap[y][x] = TILE_MAPPING.FLOOR;
    }
  }
  goldLayer.putTileAt(TILE_MAPPING.GOLD,Phaser.Math.RND.integerInRange(0,MAPWIDTH),Phaser.Math.RND.integerInRange(0,MAPHEIGHT))
}

function updateSeg(){
  seg[0].x = player.x + 10;
  seg[0].y = player.y;
  /*
  seg[1].x = seg[0].x + 10;
  seg[1].y = seg[0].y;
  seg[2].x = seg[1].x + 10;
  seg[2].y = seg[1].y;
  seg[3].x = seg[2].x + 10;
  seg[3].y = seg[2].y;
  seg[4].x = seg[3].x + 10;
  seg[4].y = seg[3].y;*/
  for(i = 1; i < 5; i++){
    seg[i].x = seg[i-1].x + 10;
    seg[i].y = seg[i-1].y;
  }

}

function createMap(){
  var sizeX = MAPWIDTH / TILEWIDTH;
  var sizeY = MAPHEIGHT / TILEHEIGHT;
  gMap = new Array(sizeX);
  for (i = 0; i < sizeX; i++)
    gMap[i] = new Array(sizeY);

  for (x = 1; x < sizeX-1; x++){
    for (y = 1; y < sizeY-1; y++){
      if (Phaser.Math.RND.integerInRange(0,100) < 40)
        gMap[y][x] = TILE_MAPPING.WALL;
      else
        gMap[y][x] = TILE_MAPPING.FLOOR;
    }
  }

  for (x = 0; x < sizeX; x++)
    gMap[0][x] = gMap[sizeY-1][x] = TILE_MAPPING.WALL;

  for (y = 0; y < sizeY; y++)
    gMap[y][0] = gMap[y][sizeX-1] = TILE_MAPPING.WALL;

  for (g = 0; g < 6; g++)
    generateMap(gMap);
/*
  gLayer = new Array(sizeX);
  for (i = 0; i < sizeX; i++)
    gLayer[i] = new Array(sizeY);

  wLayer = new Array(sizeX);
  for (i = 0; i < sizeX; i++)
    wLayer[i] = new Array(sizeY);

  for (x = 0; x < sizeX; x++){
    for (y = 0; y < sizeY; y++){
      if (gMap[y][x] == 1){
        gLayer[y][x] = 1;
        wLayer[y][x] = null;
      }
      else if (gMap[y][x] == 0) {
        wLayer[y][x] = 1;
        gLayer[y][x] = null;
      }
      else {

      }
    }
  }*/
  //gMap[x][y] = Phaser.Math.RND.integerInRange(0,39)
  return gMap;
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
  if (tiles[column][row] == TILE_MAPPING.WALL){
    if (adjWalls >= 4)
      return TILE_MAPPING.WALL
    else if (adjWalls < 2)
      return TILE_MAPPING.FLOOR
  }
  else {
    if (adjWalls >= 5)
      return TILE_MAPPING.WALL;
  }
  return TILE_MAPPING.FLOOR;
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

  if (tiles[y][x] == TILE_MAPPING.WALL){
    return true;
  }

  if (tiles[y][x] == TILE_MAPPING.FLOOR){
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
