class Scene1 extends Phaser.Scene {
  constructor() {
    super({key:"Scene1"});
  }

  preload(){
    this.load.image('pSnakeHead', 'assets/GreenBlock.png');
    this.load.image('BlueBlock', 'assets/BlueBlock.png');
    this.load.image('RedBlock', 'assets/RedBlock.png');
    this.load.image('GreenBlock', 'assets/GreenBlock.png');
    this.load.image('food', 'assets/Coins/coin_01.png');
    this.load.spritesheet('coin', 'assets/Coins/FullCoins.png', { frameWidth: 15, frameHeight: 16, spacing: 1 });
    this.load.image('tiles', 'assets/roguelikeDungeon_transparent.png');
  }

  create(){
    /*
    MAPWIDTH = 1600;
    MAPHEIGHT = 1216;
    SIZEX = MAPWIDTH / TILEWIDTH;
    SIZEY = MAPHEIGHT / TILEHEIGHT;
    */
    score = 0;
    makeEnemy = 99;
    createMap();

    map = this.make.tilemap({ data: gMap, tileWidth: 16, tileHeight: 16, insertNull: true });
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

    this.physics.world.bounds.width = MAPWIDTH
    this.physics.world.bounds.height = MAPHEIGHT

    worldSprites = [];

    food = new Food(this, 3, 4);

    pSnake = new Snake(this, 10, 10, 'pSnakeHead', ['RedBlock','GreenBlock','BlueBlock']);
    pSnake.head.setDepth(7);
    spawnSnake(pSnake);

    worldSprites.push(pSnake);

    eSnakes = [];

    goldLayer.setTileIndexCallback(TILE_MAPPING.GOLD, collectCoin, this);
    wallLayer.setTileIndexCallback(TILE_MAPPING.WALL, collideWithWall, "test", this);

    this.physics.add.overlap(pSnake.head, goldLayer);
    this.physics.add.overlap(pSnake.head, wallLayer);
    //this.physics.add.overlap(eSnake.head, wallLayer);

    repositionFood();

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
        //console.log(pSnake.body.getChildren());
        for(var s = 0; s < eSnakes.length; s++){
          if(eSnakes[s].heading == STOP){
              eSnakes[s].heading = eSnakes[s].direction;
          } else{
              eSnakes[s].heading = STOP;
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

    this.input.keyboard.on('keyup_F', function(event) {
      var newESnake = new EnemySnake(this, 10, 15, 'RedBlock', ['RedBlock']);
      spawnSnake(newESnake);
      newESnake.heading = RIGHT;
      newESnake.direction = RIGHT;
      eSnakes.push(newESnake)

      worldSprites.push(newESnake);
      this.physics.add.overlap(newESnake.head, wallLayer);
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
    /*
    text4 = this.add.text(20, 80, '0', {
       fontSize: '20px',
       fill: '#000000'
    });
    text4.setScrollFactor(0);

    text = this.add.text(20, 100, '0', {
       fontSize: '20px',
       fill: '#000000'
    });
    text.setScrollFactor(0);
    */
}

  update (time, delta){
    score = pSnake.score;
    if (!pSnake.alive){
      return;
    }
    for (var s = 0; s < eSnakes.length; s++){
      if (!eSnakes[s].alive){
        eSnakes[s].body.clear(true,true);
        eSnakes.splice(s,1);
      }
    }
    if(((pSnake.score % 5) == 0) && (pSnake.score != 0) && (pSnake.score != makeEnemy))
    {
      var newESnake;
      var numEnemy = pSnake.score / 5
      for(i = 0; i < numEnemy; i++){
        newESnake = new EnemySnake(this, 10, 15, 'RedBlock', 'RedBlock');
        spawnSnake(newESnake);
        newESnake.heading = RIGHT;
        newESnake.direction = RIGHT;
        eSnakes.push(newESnake)

        worldSprites.push(newESnake);
        this.physics.add.overlap(newESnake.head, wallLayer);
      }
      makeEnemy = pSnake.score;
    }


    text1.setText("Player Score: " + pSnake.score);
    text2.setText("Player Length: " + pSnake.body.getLength());
    text3.setText("Enemy Snakes: " + eSnakes.length);
    //text1.setText("pSnake X:" + pSnake.head.x + " + Width: " + (pSnake.head.x + (pSnake.head.width * pSnake.head.scaleX - 1)));
    //text2.setText("pSnake Y:" + pSnake.head.y + " + Width: " + (pSnake.head.y + (pSnake.head.height * pSnake.head.scaleY - 1)));
    //text3.setText("Food X:" + food.x);
    //text4.setText("Food Y:" + food.y);

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
        eSnakes[s].chooseDir(time, food);
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
        gMap[y][x] = TILE_MAPPING.BLANK;
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
      return TILE_MAPPING.BLANK
  } else {
    if (adjWalls >= 5)
      return TILE_MAPPING.WALL;
  }
  return TILE_MAPPING.BLANK;
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
  if (tiles[y][x] == TILE_MAPPING.BLANK){
    return false;
  }
  return false;
}

function checkBounds(x, y){

  if( x < 0 || y < 0 ){
    return true;
  } else if( x > SIZEX-1 || y > SIZEY-1 ){
    return true;
  }
  return false;
}

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
}

function spawnGold(){
  goldLayer.putTileAt(TILE_MAPPING.GOLD,Phaser.Math.RND.integerInRange(0,SIZEX),Phaser.Math.RND.integerInRange(0,SIZEY))
  //goldLayer.putTileAt(TILE_MAPPING.GOLD,posX,posY);
}

function collectCoin(sprite, tile) {
  goldLayer.removeTileAt(tile.x, tile.y);
  //score++;
  //text.setText(score);
  spawnGold();
  return false;
}

function collideWithWall(sprite, tile, test){
  var spriteCollided = 0;
  for (i = 0; i < worldSprites.length; i++){
    if (Phaser.Actions.GetFirst(worldSprites[i].body.getChildren(),{ x: sprite.x, y: sprite.y }, 0) != null){
      spriteCollided = i;
    }
  }
  worldSprites[spriteCollided].heading = STOP;
  worldSprites[spriteCollided].alive = false;
}
