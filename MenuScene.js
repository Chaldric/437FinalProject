class MenuScene extends Phaser.Scene{
  constructor(){
    super({key:"MenuScene"});
  } // end constructor

  preload(){
    this.load.image('tiles', 'assets/roguelikeDungeon_transparent.png');
    this.load.audio('GameSong', ['assets/Quirky-Action.mp3','assets/Quirky-Action.ogg'])
    this.load.audio('snakehiss', ['assets/snakehiss2short.mp3','assets/snakehiss2short.ogg']);
    //Snake Hiss Sound
    //https://www.freesoundeffects.com/free-sounds/snake-10065/

    /*
    "Quirky-Action"
    by Eric Matyas
    www.soundimage.org
    */
  } // end preload

  create(){
    MAPWIDTH = 800;
    MAPHEIGHT = 608;
    SIZEX = MAPWIDTH / TILEWIDTH;
    SIZEY = MAPHEIGHT / TILEHEIGHT;

    gameSound = this.sound.add('GameSong', {
      loop: true
    });
    snakeHiss = this.sound.add('snakehiss');

    gameSound.pauseOnBlur = true;
    gameSound.play();
    gameSound.setVolume(0.5);

    snakeHiss.play();


    createMenuMap(this);

    var gameLogo = this.add.text(MAPWIDTH/2, MAPHEIGHT/3, 'Dungeon Slither', {
       fontSize: '90px',
       fill: '#FFFFFF'
    });
    gameLogo.setOrigin(0.5,0.5);

    var playSmallMap = this.add.text(MAPWIDTH/3, MAPHEIGHT*2/3, 'Small Map', {
       fontSize: '40px',
       fill: '#FFFFFF'
    });
    var playBigMap = this.add.text(MAPWIDTH*2/3, MAPHEIGHT*2/3, 'Big Map', {
       fontSize: '40px',
       fill: '#FFFFFF'
    });
    playSmallMap.setOrigin(0.5,0.5);
    playSmallMap.setScrollFactor(0);
    playBigMap.setOrigin(0.5,0.5);
    playBigMap.setScrollFactor(0);

    playSmallMap.setInteractive();
    playBigMap.setInteractive();

    playSmallMap.on("pointerover", () => {
      //Future Additions
        console.log("Hover");
    });
    playBigMap.on("pointerover", () => {
      //Future Additions
        console.log("Hover");
    });

    playSmallMap.on("pointerout", () => {
      //Future Additions
        console.log("Not Hover");
    });
    playBigMap.on("pointerout", () => {
      //Future Additions
        console.log("Not Hover");
    });

    playSmallMap.on("pointerup", () => {
        console.log("Play");
        snakeHiss.play();
        this.scene.start("SmallMap");
    });
    playBigMap.on("pointerup", () => {
        console.log("Play");
        snakeHiss.play();
        this.scene.start("BigMap");
    });
  } // end create
} // end MenuScene Scene

/*
* Creates a background map for the menu screen.
* The background will be made of the same tiles as the rest of the game.
* The background is made up of three tilemap layers consisting of
* Floor, Debris, and Wall layers made up of there respective tiles.
* The Floor and Debris layers fill the whole screen while the wall only
* creates a border around the outside parameter of the map space.
*/
function createMenuMap(scene){
  gMap = new Array(SIZEX);
  for (var i = 0; i < SIZEX; i++)
    gMap[i] = new Array(SIZEY);


  for (var x = 0; x < SIZEX; x++)
    gMap[0][x] = gMap[SIZEY-1][x] = TILE_MAPPING.WALL;

  for (var y = 0; y < SIZEY; y++)
    gMap[y][0] = gMap[y][SIZEX-1] = TILE_MAPPING.WALL;

  map = scene.make.tilemap({data: gMap, tileWidth: 16, tileHeight: 16, insertNull: true });
  var worldTiles = map.addTilesetImage('tiles',null ,16,16,0,1,null,null);

  floorLayer = map.createBlankDynamicLayer('Ground', worldTiles);
  debrisLayer = map.createBlankDynamicLayer('Debris', worldTiles);
  wallLayer = map.createBlankDynamicLayer('Walls', worldTiles);

  floorLayer.fill(TILE_MAPPING.FLOOR);
  floorLayer.weightedRandomize(0, 0, SIZEX, SIZEY, TILE_MAPPING.FLOOR);
  debrisLayer.fill(TILE_MAPPING.BLANK);
  debrisLayer.weightedRandomize(0, 0, SIZEX, SIZEY, TILE_MAPPING.DEBRIS);
  wallLayer.putTilesAt(gMap, 0, 0);
} // end createMenuMap
