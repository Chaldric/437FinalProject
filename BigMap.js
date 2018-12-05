class BigMap extends Phaser.Scene {
  constructor() {
    super({key:"BigMap"});
  }  // end constructor

  preload(){
    this.load.image('pSnakeHead', 'assets/BlackBlock.png');
    this.load.image('BlueBlock', 'assets/BlueBlock.png');
    this.load.image('RedBlock', 'assets/RedBlock.png');
    this.load.image('GreenBlock', 'assets/GreenBlock.png');
    this.load.image('BlackBlock', 'assets/BlackBlock.png');
    this.load.image('food', 'assets/WhiteBlock.png');
    this.load.image('OrangeBlock', 'assets/OrangeBlock.png');
    this.load.image('YellowBlock', 'assets/YellowBlock.png');
    //this.load.image('food', 'assets/Coins/coin_01.png');
    //this.load.spritesheet('coin', 'assets/Coins/FullCoins.png', { frameWidth: 15, frameHeight: 16, spacing: 1 });
    this.load.image('tiles', 'assets/roguelikeDungeon_transparent.png');
  } // end preload

  create(){
    // Map parameters
    MAPWIDTH = 1600;
    MAPHEIGHT = 1216;
    SIZEX = MAPWIDTH / TILEWIDTH;
    SIZEY = MAPHEIGHT / TILEHEIGHT;
    score = 0;
    makeEnemy = 99;

    createMap();
    setUpTileMap(this);

    // Array of all game elements (player and enemies).
    worldSprites = [];

    food = new Food(this, 3, 4);

    pSnake = new Snake(this, 10, 10, 'pSnakeHead', ['RedBlock','BlackBlock','YellowBlock','BlackBlock','RedBlock']);
    pSnake.head.setDepth(7);
    spawnSnake(pSnake);

    worldSprites.push(pSnake);

    // Array of enemy snakes.
    eSnakes = [];

    goldLayer.setTileIndexCallback(TILE_MAPPING.GOLD, collectCoin, this);
    wallLayer.setTileIndexCallback(TILE_MAPPING.WALL, collideWithWall, "test", this);

    this.physics.add.overlap(pSnake.head, goldLayer);
    this.physics.add.overlap(pSnake.head, wallLayer);

    repositionFood();

    // Camera Element follows player.
    var cam = this.cameras.main;
    cam.setBounds(0, 0, MAPWIDTH, MAPHEIGHT);
    cam.startFollow(pSnake.head, true);

    // Keyboard buttons.

    cursors = this.input.keyboard.createCursorKeys();

    // Pauses all moving snakes and unpauses all non moving snakes.
    this.input.keyboard.on('keyup_Q', function(event) {
        if(pSnake.heading == STOP){
            pSnake.heading = pSnake.direction;
        } else{
            pSnake.heading = STOP;
        }
        for(var s = 0; s < eSnakes.length; s++){
          if(eSnakes[s].heading == STOP){
              eSnakes[s].heading = eSnakes[s].direction;
          } else{
              eSnakes[s].heading = STOP;
          }
        }
    },this);

    // Randomly repositions food.
    this.input.keyboard.on('keyup_R', function(event) {
        repositionFood();
    },this);

    // Grows player snake.
    this.input.keyboard.on('keyup_E', function(event) {
        pSnake.grow();
    },this);

    // Increases player snake speed.
    this.input.keyboard.on('keyup_W', function(event) {
        pSnake.speed = pSnake.speed * 0.9;
    },this);

    // Decreases player snake speed.
    this.input.keyboard.on('keyup_S', function(event) {
        pSnake.speed = pSnake.speed * 1.1;
    },this);

    // Destroys all enemy snakes.
    this.input.keyboard.on('keyup_D', function(event) {
        for(var s = 0; s < eSnakes.length; s++){
          eSnakes[s].alive = false;
        }
    },this);

    // Creates a new enemy snake
    this.input.keyboard.on('keyup_F', function(event) {
      var newESnake = new EnemySnake(this, 10, 15, 'BlueBlock', ['GreenBlock','BlueBlock']);
      spawnSnake(newESnake);
      newESnake.heading = RIGHT;
      newESnake.direction = RIGHT;
      eSnakes.push(newESnake)

      worldSprites.push(newESnake);
      this.physics.add.overlap(newESnake.head, wallLayer);
    },this);

    // Moves back to menuscene
    this.input.keyboard.on('keyup_ESC', function(event) {
        this.scene.start("MenuScene");
    },this);

    // HUD elements

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
  } // end create

  update (time, delta){
    score = pSnake.score;
    if (!pSnake.alive){
      this.scene.start("MenuScene");
      //return;
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
        newESnake = new EnemySnake(this, 10, 15, 'BlueBlock', ['GreenBlock','BlueBlock']);
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
  } // end update
} // end BigMap Scene
