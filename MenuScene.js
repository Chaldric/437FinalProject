class MenuScene extends Phaser.Scene{
  constructor(){
    super({key:"MenuScene"});
  }

  preload(){
    this.load.image('tiles', 'assets/roguelikeDungeon_transparent.png');
  }

  create(){
    createMenuMap(this);

    var gameLogo = this.add.text(MAPWIDTH/2, MAPHEIGHT/3, 'Basic Snake', {
       fontSize: '100px',
       fill: '#FFFFFF'
    });
    gameLogo.setOrigin(0.5,0.5);

    var playButton = this.add.text(MAPWIDTH/2, MAPHEIGHT*2/3, 'Play', {
       fontSize: '60px',
       fill: '#FFFFFF'
    });
    playButton.setOrigin(0.5,0.5);
    playButton.setScrollFactor(0);

    playButton.setInteractive();

    playButton.on("pointerover", () => {
        console.log("Hover");
    })

    playButton.on("pointerout", () => {
        console.log("Not Hover");
    })

    playButton.on("pointerup", () => {
        console.log("Play");
        this.scene.start("Scene1");
    })
/*
        optionsButton.setInteractive();

        optionsButton.on("pointerover", () => {
            hoverSprite.setVisible(true);
            hoverSprite.play("walk");
            hoverSprite.x = optionsButton.x - optionsButton.width;
            hoverSprite.y = optionsButton.y;

        })

        optionsButton.on("pointerout", () => {
            hoverSprite.setVisible(false);
        })

        optionsButton.on("pointerup", () => {
            //this.scene.launch();
        })
*/
    }

}

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
}
