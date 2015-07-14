

// SETTINGS

_WIDTH = 1000
_HEIGHT = 600


// END SETTINGS


var game = new Phaser.Game(_WIDTH, _HEIGHT, Phaser.AUTO, 'music-visualization', { preload: preload, create: create, update: update, render: render });
var rJson;
var circle;
var counter = 0;

var moveSpeed = 0;
var emitter;
var fadeSpeed = 500;

$.getJSON("example_json/short.json", function(out) {
    rJson = out;
});

function preload() {

    this.game.stage.backgroundColor = '#000000';
    game.load.image('circle', 'img/circle.png');
    game.load.image('particle', 'img/blue.png');
    game.load.image("grid", "img/grid.bmp");

}

function create() {

    game.physics.startSystem(Phaser.Physics.P2JS);
    game.world.setBounds(0, 0, 1920, 600);

    var background = game.add.tileSprite(0, 0, 1920, 600, 'grid');

    emitter = game.add.emitter(0, 0, 200);
    emitter.makeParticles('particle')
    emitter.setAlpha(0.3, 0.8);
    emitter.setScale(0.1, 0.1);
    emitter.gravity = 0;
    //emitter.start(false, 500, 50);

    circle = game.add.sprite(0, _HEIGHT - 50, 'circle');

    game.physics.p2.gravity.y = 500;
    game.physics.p2.enable(circle);

    circle.anchor.set(0.5);
    circle.body.setCircle(15);
    circle.body.collideWorldBounds = true;

    game.time.events.loop(1, updateCounter, this);
    game.camera.follow(circle);
}

function update() {
    emitter.x = circle.x
    emitter.y = circle.y

    circle.body.moveRight(moveSpeed);
}

function updateCounter()
{
	var result = rJson[counter];

	if(result != undefined){
      console.log(result)

      if(result.fadespeed != undefined){
        fadeSpeed = result.fadespeed
      }

      if(result.gravity != undefined){
          game.physics.p2.gravity.y = result.gravity;
      }

      if(result.speed != undefined){
          moveSpeed = result.speed;
      }

      if(result.hide == 1){
        game.add.tween(circle).to( { alpha: 0 }, fadeSpeed, Phaser.Easing.Linear.None, true, 0, 0, false);
      } else if(result.jump != undefined) {
        if(result.immediate == 1){
          circle.alpha = 1
          circle.body.y = circle.y - result.jump
        } else {
          game.add.tween(circle).to( { alpha: 1 }, fadeSpeed, Phaser.Easing.Linear.None, true, 0, 0, false);
          circle.body.moveUp(result.jump);
        }
      }
	}

	counter++;
}

function render() {
    game.debug.cameraInfo(game.camera, 32, 64);
    game.debug.spriteCoords(circle, 32, 150);
}
