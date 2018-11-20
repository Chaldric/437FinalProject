class Scene3 extends Phaser.Scene{
  constructor(){
    super({key:"Scene3"});
  }

  preload(){
      this.load.audio('test',['assets/Laser-weapon.ogg']);
  }

  create(){
    this.soundFX = this.sound.add("test", {loop: "true"});
    this.soundFX.play();

    this.soundFX.rate = 0.5

    this.input.Keyboard.on("keydown_L", function(event){
      this.soundFX.loop = !this.soundFX.loop;
      if(this.soundFX.loop){
        this.soundFX.play();
      }
    },this);

    this.input.keyboard.on("keydown_P", function(event){
      if(this.soundFX.isPlaying) this.soundFX.pause();
      else this.soundFX.resume();
    },this);
  }

}
