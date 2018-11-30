var anim;
var sprite;
var progress;
var frameView;

class Scene2 extends Phaser.Scene{
  constructor(){
    super({key:"Scene2"});
  }

  preload(){
    this.load.spritesheet('kirby', 'assets/kirbySpriteSheet.png')
  }

  create ()
  {
    //  Frame debug view

    frameView = this.add.graphics({ fillStyle: { color: 0xff00ff }, x: 32, y: 32 });

    //  Show the whole animation sheet

    var config = {
        key: 'walk',
        frames: this.anims.generateFrameNumbers('kirby'),
        frameRate: 6,
        yoyo: true,
        repeat: -1
    };

    anim = this.anims.create(config);

    console.log(anim);

    sprite = this.add.sprite(400, 300, 'kirby').setScale(4);

    console.log(sprite);

    sprite.anims.load('walk');
  }

  update()
  {
  }
}
/*
  create(){
    this.text = this.add.text(0,0,"Welcome to Scene2!", { font:"40px Impact"});

    var tween = this.tweens.add({
      targets: this.text,
      x:200,
      y:250,
      duration:2000,
      ease:"Elastic",
      easeParams:[1.5,0.5],
      delay:1000,
      onComplete:function(src,tgt){
        tgt[0].x = 0;
        tgt[0].y = 0;
        tgt[0].setColor("Red");
      }
    },this)

    this.input.keyboard.on('keyup', function(event){
      if(event.key == "1"){
        this.scene.start("Scene1");
      }

    },this);
  }

}
*/
