var config = {
  type:Phaser.AUTO,
  width:800,
  height:608,
  physics: {
    default:'arcade',
    arcade: {
      gravity: {y : 0},
      debug: false
    }
  },
  render:{
    pixelArt: true
  },
  audio: {
        disableWebAudio: true
  },
  scene: [ MenuScene, SmallMap, BigMap ]
};

var MAPWIDTH = 800;
var MAPHEIGHT = 608;
var TILEWIDTH = 16;
var TILEHEIGHT = 16;
var SIZEX = MAPWIDTH / TILEWIDTH;
var SIZEY = MAPHEIGHT / TILEHEIGHT;


var TILE_MAPPING = {
  FLOOR: [{ index: 364, weight: 4},
          { index: [366, 367, 368], weight: 2},
          { index: 365, weight: 4}],
  WALL: 341,
  GOLD: 361,
  DEBRIS: [{index: null, weight: 9.9},
          {index: [58,59,88], weight: 0.08},
        {index: [304,392], weight: 0.02}],
  BLANK: null
};

var STOP = 0;
var UP = 1;
var DOWN = 2;
var LEFT = 3;
var RIGHT = 4;

var worldSprites;
var pSnake, food;
var eSnake, eSnakes, newESnake;
var makeEnemy;
var gameSound, snakeHiss;

var player, seg, playerVelX, score;

var controls;
var map, gMap;
var floorLayer, debrisLayer, wallLayer, goldLayer;

var cursors;

var text, text1, text2, text3, text4;

var Food = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,
  initialize:
  function Food(scene, x, y){
    Phaser.GameObjects.Image.call(this, scene)

    this.setTexture('food');
    this.setPosition(x * 16, y * 16);
    this.setOrigin(0);
    this.setScale(0.5);

    this.total = 0;

    scene.children.add(this);
  }, // end Food function

  eat: function(){
    this.total++;
  } // end eat
}); // end Food Phaser Class

var Snake = new Phaser.Class({
  initialize:
  function Snake (scene, x, y, headImage, tailImage){
    this.headImage = headImage;
    this.tailImage = tailImage;
    this.curBody = 0;

    this.headPosition = new Phaser.Geom.Point(x, y);

    this.body = scene.physics.add.group();

    this.head = this.body.create(x * 16, y * 16, headImage);
    this.head.name = "Head";
    this.head.setOrigin(0);
    this.head.setScale(0.5);
    this.head.setCollideWorldBounds(true);

    this.alive = true;

    this.speed = 100;

    this.moveTime = 0;

    this.tail = new Phaser.Geom.Point(x, y);

    this.heading = STOP;
    this.direction = STOP;

    this.score = 0;
  }, // end Snake function

  update: function(time){
    if (time >= this.moveTime){
      return this.move(time);
    }
  }, // end update

  faceLeft: function(){
    if (!(this.direction == RIGHT)){
      this.heading = LEFT;
    }
  }, // end faceLeft

  faceRight: function(){
    if (!(this.direction == LEFT)){
      this.heading = RIGHT;
    }
  }, // end faceRight

  faceUp: function(){
    if (!(this.direction == DOWN)){
      this.heading = UP;
    }
  }, // end faceUp

  faceDown: function(){
    if (!(this.direction == UP)){
      this.heading = DOWN;
    }
  }, // end faceDown

  move: function(time){
    if (this.heading == LEFT){
      this.headPosition.x = this.headPosition.x - 1;
    } else if (this.heading == RIGHT){
      this.headPosition.x = this.headPosition.x + 1;
    } else if (this.heading == UP){
      this.headPosition.y = this.headPosition.y - 1;
    } else if (this.heading == DOWN){
      this.headPosition.y = this.headPosition.y + 1;
    }

    if(!(this.heading == STOP)){
      this.direction = this.heading;
      Phaser.Actions.ShiftPosition(this.body.getChildren(), this.headPosition.x * 16, this.headPosition.y * 16, 1, this.tail);

      return this.checkBodyCollision(time);
    }
  }, // end move

  checkBodyCollision: function(time){
      var hitBody = Phaser.Actions.GetFirst(this.body.getChildren(), { x: this.head.x, y: this.head.y }, 1);

      if (hitBody){
        if(this.body.getLength() <= 6){
          console.log('dead');
          this.alive = false;
          return false;
        } else {
          this.split(hitBody);
          this.moveTime = time + this.speed;
          return true;
        }
      } else {
        this.moveTime = time + this.speed;
        return true;
      }

  }, // end checkBodyCollision

  split: function(hit){
    let tempArr = this.body.getChildren();
    //console.log("Segment Hit: " + hit.name);
    let toBeDeleted = [];
    var ni;
    for(ni = 0; ni < (tempArr.length - hit.name); ni++){
      console.log("Segments Removed: " + (tempArr[hit.name + ni].name));
      toBeDeleted.push(tempArr[hit.name + ni]);
    }
    for (ni = (toBeDeleted.length - 1); ni >= 0; ni--){
      this.body.remove(toBeDeleted[ni],true,true);
      if(this.score)
        this.score--;
    }
  }, // end split

  grow: function(){
    var newPart = this.body.create(this.tail.x, this.tail.y, this.tailImage[this.curBody]);
    this.curBody++;
    if(this.curBody >= this.tailImage.length)
      this.curBody = 0;
    newPart.name = this.body.getLength() - 1;
    newPart.setOrigin(0);
    newPart.setScale(0.5);
  }, // end grow

  collideWithFood: function(food){
    var maxX = this.head.x + this.head.width * this.head.scaleX - 1;
    var maxY = this.head.y +  this.head.height * this.head.scaleY - 1;
    var rangeX = ((food.x >= this.head.x) && (food.x < maxX));
    var rangeY = ((food.y >= this.head.y) && (food.y < maxY));
    if (rangeX && rangeY){
      this.score++;
      this.grow();
      food.eat();
      snakeHiss.play();

      if ((this.speed > 20) && (food.total % 5 == 0)){
        this.speed -= 5;
      }
      return true;
    } else {
      return false;
    }
  }, // end collideWithFood

  updateGrid: function(grid){
    this.body.children.each(function (segment){
      var bx = segment.x / 16;
      var by = segment.y / 16;

      grid[by][bx] = false;
    });
    return grid;
  } // end updateGrid
}); // end Snake Phaser Class

class EnemySnake extends Snake{
  constructor(scene, x, y, headImage, tailImage) {
    super(scene, x, y, headImage, tailImage);
  } // end constructor

  chooseDir(time, food){
    if(this.checkFoodInRange(food)){
      //console.log("True");
    } else {
      //console.log("False");
    }
    if (time >= this.moveTime){
      var cX1 = food.x - this.head.x;
      var cY1 = food.y - this.head.y;
      if (Math.abs(cX1) > Math.abs(cY1)){
        if ((cX1 > 0) && !(this.heading == LEFT)){
          this.faceRight();
        } else if ((cX1 > 0) && (this.heading == LEFT)) {
          if(cY1 > 0)
            this.faceDown();
          else
            this.faceUp();
        }
        if ((cX1 < 0) && !(this.heading == RIGHT)){
          this.faceLeft();
        } else if ((cX1 < 0) && (this.heading == RIGHT)) {
          if(cY1 > 0)
            this.faceDown();
          else
            this.faceUp();
        }
      } // end if abs cX1 < cY1
      else if (Math.abs(cX1) < Math.abs(cY1)){
        if ((cY1 > 0) && !(this.heading == UP)){
          this.faceDown();
        } else if ((cY1 > 0) && (this.heading == UP)) {
          if(cX1 > 0)
            this.faceRight();
          else
            this.faceLeft();
        }
        if ((cY1 < 0) && !(this.heading == DOWN)){
          this.faceUp();
        } else if ((cY1 < 0) && (this.heading == DOWN)) {
          if(cX1 > 0)
            this.faceRight();
          else
            this.faceLeft();
        }
      } // end if abs cX1 < cY1
    } // end if moveTime
  } // end chooseDir

  // EnemySnake checkBodyCollision removes the split function.
  checkBodyCollision(time){
      var hitBody = Phaser.Actions.GetFirst(this.body.getChildren(), { x: this.head.x, y: this.head.y }, 1);

      if (hitBody){
        if(this.body.getLength() <= 10){
          console.log('dead');
          this.alive = false;
          return false;
        }
      } else {
        this.moveTime = time + this.speed;
        return true;
      }

  } // end checkBodyCollision

  // Future pathfinding function.
  checkFoodInRange(food){
    if(Phaser.Math.Distance.Between(this.head.x, this.head.y, food.x, food.y) < (MAPWIDTH/3) ){
      //console.log("Greater Than 1/3 MapWidth");
      return true;
    } else {
      //console.log("Greater than 1/3 MapWidth");
      return false;
    }
  } // end checkFoodInRange
} // end EnemySnake Class

/*
* Creates a proceduraly generated 2D array of tile map data for the game map.
* Following the methods discussed in the article "Cellular Automata Method for
* Generating Random Cave-Like Levels", the function sets up a 2D array on a
* global variable called gMap and returns the 2D array. It first starts off
* by setting up the 2D array, then randomly fills the array with either a
* wall or a blank spot for each index of the 2D array. A border of walls
* is placed around the edges of the map. Then the array is run through several
* iteration of comparing neighbors, making each index more like its neighbors.
*/
function createMap(){

  gMap = new Array(SIZEX);
  for (i = 0; i < SIZEX; i++)
    gMap[i] = new Array(SIZEY);

  for (x = 1; x < SIZEX-1; x++){
    for (y = 1; y < SIZEY-1; y++){
      if (Phaser.Math.RND.integerInRange(0,100) < 40)
        gMap[y][x] = TILE_MAPPING.WALL;
      else
        gMap[y][x] = TILE_MAPPING.BLANK;
    }
  }

  for (x = 0; x < SIZEX; x++)
    gMap[0][x] = gMap[SIZEY-1][x] = TILE_MAPPING.WALL;

  for (y = 0; y < SIZEY; y++)
    gMap[y][0] = gMap[y][SIZEX-1] = TILE_MAPPING.WALL;

  // Iterates the map 6 times. Could be changed to iterate more or less times.
  for (g = 0; g < 6; g++)
    generateMap(gMap);
  return gMap;
} // end createMap

/*
*
*/
function generateMap(tiles){

  for (x = 1; x < SIZEX-1; x++){
    for (y = 1; y < SIZEY-1; y++){
      tiles[y][x] = placeWall(x,y,tiles);
    }
  }

  return tiles;
} // end generateMap

function placeWall(row,column,tiles){
  let adjWalls = getNumAdj(row,column,tiles);
  if (tiles[column][row] == TILE_MAPPING.WALL){
    if (adjWalls >= 4)
      return TILE_MAPPING.WALL
    else if (adjWalls < 2)
      return TILE_MAPPING.BLANK
  } else {
    if (adjWalls >= 5)
      return TILE_MAPPING.WALL;
  }
  return TILE_MAPPING.BLANK;
} // end placeWall

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
} // end getNumAdj

function isWall(x, y, tiles){

  if (checkBounds(x,y)){
    return true;
  }
  if (tiles[y][x] == TILE_MAPPING.WALL){
    return true;
  }
  if (tiles[y][x] == TILE_MAPPING.BLANK){
    return false;
  }
  return false;
} // end isWall

function checkBounds(x, y){

  if( x < 0 || y < 0 ){
    return true;
  } else if( x > SIZEX-1 || y > SIZEY-1 ){
    return true;
  }
  return false;
} // end checkBounds


/*
* The game map is made up of three tilemap layers consisting of
* Floor, Debris, and Wall layers. The Floor and Debris layers fill
* the background of the game map while the wall layer creates the play
* area that the game characters stay within. The Floor layer consists of
* five different tiles that each have a seperate weighted chance of being used.
* The Debris layer uses five different debris tiles with a 10% chance of being
* placed onto the game map otherwise a black tile is placed. The Wall layer
* is made up of wall tiles that create the boundaries for the game map.
* The Wall layer can be collided with by the game characters.
*/
function setUpTileMap(scene){
  map = scene.make.tilemap({ data: gMap, tileWidth: 16, tileHeight: 16, insertNull: true });
  var worldTiles = map.addTilesetImage('tiles',null ,16,16,0,1,null,null);
  var stuffTiles = map.addTilesetImage('tiles',null ,16,16,0,1,null,null);

  floorLayer = map.createBlankDynamicLayer('Ground', worldTiles);
  debrisLayer = map.createBlankDynamicLayer('Debris', worldTiles);
  wallLayer = map.createBlankDynamicLayer('Walls', worldTiles);
  goldLayer = map.createBlankDynamicLayer('Stuff', worldTiles);

  floorLayer.fill(TILE_MAPPING.FLOOR);
  floorLayer.weightedRandomize(0, 0, SIZEX, SIZEY, TILE_MAPPING.FLOOR);
  debrisLayer.fill(TILE_MAPPING.BLANK);
  debrisLayer.weightedRandomize(0, 0, SIZEX, SIZEY, TILE_MAPPING.DEBRIS);
  wallLayer.putTilesAt(gMap, 0, 0);
  wallLayer.setCollision(TILE_MAPPING.WALL);
  goldLayer.putTileAt(TILE_MAPPING.GOLD,20,20)

  scene.physics.world.bounds.width = MAPWIDTH
  scene.physics.world.bounds.height = MAPHEIGHT
} // end setUpTileMap

/*
* Moves the food to a random location on the map that is a valid position.
* Valid positions consist of locations that are not a wall and do not currently
* contain any part of the snake. Once the valid locations are determined, the
* food is randomly placed on the map.
*/
function repositionFood(){
  var testGrid = [];

  for (var y = 0; y < SIZEY; y++){
    testGrid[y] = [];
    for (var x = 0; x < SIZEX; x++){
      if (gMap[y][x] == TILE_MAPPING.WALL)
        testGrid[y][x] = false;
      else
        testGrid[y][x] = true;
    }
  }

  pSnake.updateGrid(testGrid);
  var validLocations = [];

  for (var y = 0; y < SIZEY; y++){
    for (var x = 0; x < SIZEX; x++){
      if (testGrid[y][x] == true){
        validLocations.push({ x: x, y: y });
      }
    }
  }

  if (validLocations.length > 0){
    var pos = Phaser.Math.RND.pick(validLocations);
    food.setPosition(pos.x * 16, pos.y * 16);
    return true;
  } else{
    return false;
  }
} // end repositionFood

/*
* Places the head of the snake at a random valid location. Currently valid
* locations consist of places that are not walls.
*/
function spawnSnake(snake){
  var validLocations = [];

  for (var y = 0; y < SIZEY; y++){
    for (var x = 0; x < SIZEX; x++){
      if (gMap[y][x] == null){
        validLocations.push({ x: x, y: y });
      }
    }
  }

  if (validLocations.length > 0){
    var pos = Phaser.Math.RND.pick(validLocations);
    snake.headPosition.x = pos.x;
    snake.headPosition.y = pos.y;
    snake.head.setPosition(pos.x * 16, pos.y * 16);
    return true;
  } else{
    return false;
  }
} // end spawnSnake

/*
* A callback function that is called upon a game element colliding with a
* wall tile. The game element is determined by its coordinates and is
* then set to not being alive.
*/
function collideWithWall(sprite, tile, test){
  var spriteCollided = 0;
  for (i = 0; i < worldSprites.length; i++){
    if (Phaser.Actions.GetFirst(worldSprites[i].body.getChildren(),{ x: sprite.x, y: sprite.y }, 0) != null){
      spriteCollided = i;
    }
  }
  worldSprites[spriteCollided].heading = STOP;
  worldSprites[spriteCollided].alive = false;
} // end collideWithWall

function spawnGold(){
  goldLayer.putTileAt(TILE_MAPPING.GOLD,Phaser.Math.RND.integerInRange(0,SIZEX),Phaser.Math.RND.integerInRange(0,SIZEY))
} // end spawnGold

function collectCoin(sprite, tile) {
  goldLayer.removeTileAt(tile.x, tile.y);
  spawnGold();
  return false;
} // end collectCoin

var game = new Phaser.Game(config);
