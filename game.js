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
  },

  eat: function(){
    this.total++;
  }
});

var Snake = new Phaser.Class({
  initialize:
  function Snake (scene, x, y, headImage, tailImage){
    this.headImage = headImage;
    this.tailImage = tailImage;

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
  },

  update: function(time){
    if (time >= this.moveTime){
      return this.move(time);
    }
  },

  faceLeft: function(){
    if (!(this.direction == RIGHT)){
      this.heading = LEFT;
    }
  },

  faceRight: function(){
    if (!(this.direction == LEFT)){
      this.heading = RIGHT;
    }
  },

  faceUp: function(){
    if (!(this.direction == DOWN)){
      this.heading = UP;
    }
  },

  faceDown: function(){
    if (!(this.direction == UP)){
      this.heading = DOWN;
    }
  },

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
  },
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

  },

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
  },

  grow: function(){
    var randBodyColor = Phaser.Math.RND.integerInRange(0,this.tailImage.length-1)
    var newPart = this.body.create(this.tail.x, this.tail.y, this.tailImage[randBodyColor]);
    newPart.name = this.body.getLength() - 1;
    newPart.setOrigin(0);
    newPart.setScale(0.5);
  },

  collideWithFood: function(food){
    var maxX = this.head.x + this.head.width * this.head.scaleX - 1;
    var maxY = this.head.y +  this.head.height * this.head.scaleY - 1;
    var rangeX = ((food.x >= this.head.x) && (food.x < maxX));
    var rangeY = ((food.y >= this.head.y) && (food.y < maxY));
    if (rangeX && rangeY){
      this.score++;
      this.grow();
      food.eat();

      if ((this.speed > 20) && (food.total % 5 == 0)){
        this.speed -= 5;
      }
      return true;
    } else {
      return false;
    }
  },

  updateGrid: function(grid){
    this.body.children.each(function (segment){
      var bx = segment.x / 16;
      var by = segment.y / 16;

      grid[by][bx] = false;
    });
    return grid;
  }
});

class EnemySnake extends Snake{
  constructor(scene, x, y, headImage, tailImage) {
    super(scene, x, y, headImage, tailImage);
  }

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
      } else if (Math.abs(cX1) < Math.abs(cY1)){
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
      }
    }
  }

  checkBodyCollision(time){
      var hitBody = Phaser.Actions.GetFirst(this.body.getChildren(), { x: this.head.x, y: this.head.y }, 1);

      /*if (hitBody){
        if(this.body.getLength() <= 10){
          console.log('dead');
          this.alive = false;
          return false;
        }
      } else {*/
        this.moveTime = time + this.speed;
        return true;
      //}

  }

  checkFoodInRange(food){
    if(Phaser.Math.Distance.Between(this.head.x, this.head.y, food.x, food.y) < (MAPWIDTH/3) ){
      //console.log("Greater Than 1/3 MapWidth");
      return true;
    } else {
      //console.log("Greater than 1/3 MapWidth");
      return false;
    }
  }
}

var game = new Phaser.Game(config);
