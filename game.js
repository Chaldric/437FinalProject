var config = {
  type:Phaser.AUTO,
  width:800,
  height:608,
  pixelArt: true,
  physics: {
    default:'arcade',
    arcade: {
      gravity: {y : 0},
      debug: true
    }
  },
  scene: [ Scene1, Scene2, Scene3 ]
};

var game = new Phaser.Game(config);
