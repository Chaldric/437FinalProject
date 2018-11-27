class Scene1 extends Phaser.Scene {
  constructor() {
    super({key:"Scene1"});
  }

  preload(){
    player = this.load.image('Ship', 'assets/player_ship.png')

  }

  create(){
    this.image = this.add.image(400,300,'Ship')

    this.input.keyboard.on('keyup_D', function(event) {
      this.image.x += 10;
    },this);

    this.key_A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

    this.input.on('pointerdown', function(event) {
      this.image.x = event.x;
      this.image.y = event.y;
    },this);

    this.input.keyboard.on('keyup_P', function(event){
      var physicsImage = this.physics.add.image(this.image.x, this.image.y, 'Ship');
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

    const level = [
    [  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ],
    [  0,   1,   1,   1,   0,   0,   0,   1,   1,   1,   0 ],
    [  0,   1,   1,   1,   0,   0,   0,   1,   1,   1,   0 ],
    [  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ],
    [  0,   0,   0,   1,   1,   1,   0,   0,   0,   0,   0 ],
    [  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ],
    [  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ],
    [  0,   0,   1,   1,   1,   1,   1,   0,   0,   0,   1 ],
    [  0,   0,   0,   0,   0,   0,   0,   0,   0,   1,   1 ],
    [  1,   1,   1,   0,   0,   0,   0,   0,   1,   1,   1 ],
    [  1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1 ]
  ];

  }

  update(delta){
    if(this.key_A.isDown)
      this.image.x--;
  }

}
