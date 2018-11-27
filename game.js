var config = {
  type:Phaser.AUTO,
  width:800,
  height:608,
  physics: {
    default:'arcade',
    arcade: {
      gravity: {y : 200},
      debug: false
    }
  },
  scene: [ Scene1, Scene2, Scene3 ]
};

var game = new Phaser.Game(config);
