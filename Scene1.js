class Scene1 extends Phaser.Scene {
  constructor() {
    super({key:"Scene1"});
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

    groundLayer.putTilesAt(gMap, 0, 0);
    groundLayer.setCollision(TILE_MAPPING.WALL);

    this.physics.world.bounds.width = MAPWIDTH//groundLayer.width;
    this.physics.world.bounds.height = MAPHEIGHT//groundLayer.height;

    var Food = new Phaser.Class({
      Extends: Phaser.GameObjects.Image,
      initialize:
      function Food(scene, x, y){
        Phaser.GameObjects.Image.call(this, scene)

        this.setTexture('ship');
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
      function Snake (scene, x, y){
        this.headPosition = new Phaser.Geom.Point(x, y);

        this.body = scene.physics.add.group();

        this.head = this.body.create(x * 16, y * 16, 'ship');
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

          var hitBody = Phaser.Actions.GetFirst(this.body.getChildren(), { x: this.head.x, y: this.head.y }, 1);

          if (hitBody){
            if(this.body.getLength() < 5){
              console.log('dead');
              console.log(hitBody);
              this.alive = false;
              return false;
            } else {
              this.heading = STOP;
              this.split(hitBody);
              this.moveTime = time + this.speed;
              return true;
            }
          } else {
            this.moveTime = time + this.speed;
            return true;
          }
        }
      },

      split: function(hit){
        let tempArr = this.body.getChildren();
        console.log(tempArr);
        console.log("Segment Hit: " + hit.name);
        console.log("Segment " + tempArr[hit.name].name);
        var ni;
        for(ni = 0; ni < (tempArr.length - hit.name); ni++){
          console.log("Segments Removed: " + tempArr[hit.name+ni].name);
          this.body.remove(tempArr[hit.name + ni]);
        }
        //console.log(tempArr);
        //tempArr = this.body.getChildren();
        //for(var j = 1; j < tempArr.length; j++){
          //tempArr[j].name = j - 1;
        //}
      },

      grow: function(){
        var newPart = this.body.create(this.tail.x, this.tail.y, 'ship');
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
        //if (this.head.x === food.x && this.head.y === food.y){
          this.grow();
          food.eat();

          //  For every 5 items of food eaten we'll increase the snake speed a little
          if (this.speed > 20 && food.total % 5 === 0){
            this.speed -= 5;
          }
          return true;
        } else {
          return false;
        }
      },

      updateGrid: function(grid){
        //  Remove all body pieces from valid positions list
        this.body.children.each(function (segment){
          var bx = segment.x / 16;
          var by = segment.y / 16;

          grid[by][bx] = false;
        });
        return grid;
      }
    });

    class EnemySnake extends Snake{
      constructor(scene,x,y) {
        super(scene,x,y);
      }
      testFunc(test){
        console.log(test);
      }

      chooseDir(time){
        if (time >= this.moveTime){
          var cX1 = food.x - this.head.x;
          var cY1 = food.y - this.head.y;
          //console.log("Food X: "+food.x+" Food Y: "+food.y);
          //console.log("Diff X: "+cX1+" Diff Y: "+cY1+" Heading: "+this.heading);
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
    }

    food = new Food(this, 3, 4);

    pSnake = new Snake(this, 10, 10);
    eSnakes = [];
    eSnake = new EnemySnake(this, 10, 15);
    eSnake.heading = STOP;
    eSnake.direction = RIGHT;
    eSnakes.push(eSnake)

    repositionFood();

    //this.physics.add.collider(groundLayer, pSnake.body);

    var cam = this.cameras.main;
    cam.setBounds(0, 0, MAPWIDTH, MAPHEIGHT);
    cam.startFollow(pSnake.head, true);

    cursors = this.input.keyboard.createCursorKeys();

    this.input.keyboard.on('keyup_Q', function(event) {
        if(pSnake.heading == STOP){
            pSnake.heading = pSnake.direction;
        } else{
            pSnake.heading = STOP;
        }
        console.log(pSnake.body.getChildren());
        for(var s = 0; s < eSnakes.length; s++){
          if(eSnakes[s].heading == STOP){
              //eSnakes[s].heading = eSnakes[s].direction;
          } else{
              //eSnakes[s].heading = STOP;
          }
        }
    },this);

    this.input.keyboard.on('keyup_R', function(event) {
        repositionFood();
    },this);

    this.input.keyboard.on('keyup_E', function(event) {
        pSnake.grow();
    },this);

    this.input.keyboard.on('keyup_W', function(event) {
        pSnake.speed = pSnake.speed * 0.9;
    },this);

    this.input.keyboard.on('keyup_S', function(event) {
        pSnake.speed = pSnake.speed * 1.1;
    },this);

    this.input.keyboard.on('keyup_D', function(event) {
        for(var s = 0; s < eSnakes.length; s++){
          eSnake.alive = false;
        }
    },this);


    text1 = this.add.text(20, 20, '0', {
       fontSize: '20px',
       fill: '#000000'
    });
    text1.setScrollFactor(0);

    text2 = this.add.text(20, 40, '0', {
       fontSize: '20px',
       fill: '#000000'
    });
    text2.setScrollFactor(0);

    text3 = this.add.text(20, 60, '0', {
       fontSize: '20px',
       fill: '#000000'
    });
    text3.setScrollFactor(0);

    text4 = this.add.text(20, 80, '0', {
       fontSize: '20px',
       fill: '#000000'
    });
    text4.setScrollFactor(0);
}

  update (time, delta){
    if (!pSnake.alive){
      return;
    }
    for (var s = 0; s < eSnakes.length; s++){
      if (!eSnakes[s].alive){
        eSnakes[s].body.clear(true,true);
        eSnakes.splice(s,1);
      }
    }
    text1.setText("pSnake X:" + pSnake.head.x + " + Width: " + (pSnake.head.x + (pSnake.head.width * pSnake.head.scaleX - 1)));
    text2.setText("pSnake Y:" + pSnake.head.y + " + Width: " + (pSnake.head.y + (pSnake.head.height * pSnake.head.scaleY - 1)));
    text3.setText("Food X:" + food.x);
    text4.setText("Food Y:" + food.y);

    /**
    * Check which key is pressed, and then change the direction the snake
    * is heading based on that. The checks ensure you don't double-back
    * on yourself, for example if you're moving to the right and you press
    * the LEFT cursor, it ignores it, because the only valid directions you
    * can move in at that time is up and down.
    */
    if (cursors.left.isDown){
        pSnake.faceLeft();
    } else if (cursors.right.isDown){
        pSnake.faceRight();
    } else if (cursors.up.isDown){
        pSnake.faceUp();
    } else if (cursors.down.isDown){
        pSnake.faceDown();
    }

    if (pSnake.update(time)){
      if (pSnake.collideWithFood(food)){
        repositionFood();
      }
    }
    for (var s = 0; s < eSnakes.length; s++){
      if(!(eSnakes[s].heading == STOP))
        eSnakes[s].chooseDir(time);
      if (eSnakes[s].update(time)){
        if (eSnakes[s].collideWithFood(food)){
          repositionFood();
        }
      }
    }
  }
}

function stopSnake(){
  pSnake.heading = STOP;
  console.log('Stopped pSnake')
}
/*
function chooseDir(){
  var cX1 = food.x - eSnake.head.x;
  var cY1 = food.y - eSnake.head.y;
  console.log("Food X: "+food.x+" Food Y: "+food.y);
  console.log("Diff X: "+cX1+" Diff Y: "+cY1+" Heading: "+eSnake.heading);
  if (Math.abs(cX1) > Math.abs(cY1)){
    if ((cX1 > 0) && !(eSnake.heading == LEFT)){
      eSnake.faceRight();
    } else if ((cX1 > 0) && (eSnake.heading == LEFT)) {
      eSnake.faceUp();
    }
    if ((cX1 < 0) && !(eSnake.heading == RIGHT)){
      eSnake.faceLeft();
    } else if ((cX1 < 0) && (eSnake.heading == RIGHT)) {
      eSnake.faceDown();
    }
  } else if (Math.abs(cX1) < Math.abs(cY1)){
    if ((cY1 > 0) && !(eSnake.heading == UP)){
      eSnake.faceDown();
    } else if ((cY1 > 0) && (eSnake.heading == UP)) {
      eSnake.faceLeft();
    }
    if ((cY1 < 0) && !(eSnake.heading == DOWN)){
      eSnake.faceUp();
    } else if ((cY1 < 0) && (eSnake.heading == DOWN)) {
      eSnake.faceRight();
    }
  }
}
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
      if (testGrid[y][x] === true){
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
}


function createMap(){

  gMap = new Array(SIZEX);
  for (i = 0; i < SIZEX; i++)
    gMap[i] = new Array(SIZEY);

  for (x = 1; x < SIZEX-1; x++){
    for (y = 1; y < SIZEY-1; y++){
      if (Phaser.Math.RND.integerInRange(0,100) < 40)
        gMap[y][x] = TILE_MAPPING.WALL;
      else
        gMap[y][x] = TILE_MAPPING.FLOOR;
    }
  }

  for (x = 0; x < SIZEX; x++)
    gMap[0][x] = gMap[SIZEY-1][x] = TILE_MAPPING.WALL;

  for (y = 0; y < SIZEY; y++)
    gMap[y][0] = gMap[y][SIZEX-1] = TILE_MAPPING.WALL;

  for (g = 0; g < 6; g++)
    generateMap(gMap);
  return gMap;
}

function generateMap(tiles){

  for (x = 1; x < SIZEX-1; x++){
    for (y = 1; y < SIZEY-1; y++){
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

  if( x < 0 || y < 0 ){
    return true;
  }
  else if( x > SIZEX-1 || y > SIZEY-1 ){
    return true;
  }
  return false;
}
