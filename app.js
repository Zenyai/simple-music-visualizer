/* SETTINGS */

var WIDTH = 1000
var HEIGHT = 600

var BOUND_WIDTH = 1000000;
var BOUND_HEIGHT = 600;

var LOOP_INTERVAL = 10;

/* END SETTINGS */

var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'music-visualization', { preload: preload, create: create, update: update, render: render });
var timer;
var circle;

var emitter;
var moveSpeed = 0;
var fadeSpeed = 500;

var sequence;
var midiFile;
var counter = 0;
var ready = false;
var started = false;

var file = "midi/minute_waltz.mid";
var bpm = 60;
var trackNo = 1;

fetchMidi(file, function(data) {
  // load and initialize midi file
  var original = MidiFile(data);
  var midi = initMidiFile(original, bpm);

  // parse midi events
  var parsed = parseEvents(midi, trackNo);

  // generate sequence
  var seq = generateSequence(parsed, bpm);
  console.log(seq);

  // play the midi
  var synth = Synth(44100);
  var replayer = Replayer(midi, synth);
  var audio = AudioPlayer(replayer);

  // assign value to gloval
  sequence = seq;
  midiFile = midi;

  setTimeout(function() { ready = true; }, 500);
});

// $.getJSON("example_json/short.json", function(out) {
//   sequence = out;
//   ready = true;
// });

function preload() {
  this.game.stage.backgroundColor = '#000000';
  game.load.image('circle', 'img/circle.png');
  game.load.image('particle', 'img/blue.png');
  game.load.image("grid", "img/grid.bmp");
}

function create() {
  game.physics.startSystem(Phaser.Physics.P2JS);
  game.world.setBounds(0, 0, BOUND_WIDTH, BOUND_HEIGHT);

  var background = game.add.tileSprite(0, 0, BOUND_WIDTH, BOUND_HEIGHT, 'grid');

  emitter = game.add.emitter(0, 0, 200);
  emitter.makeParticles('particle')
  emitter.setAlpha(0.3, 0.8);
  emitter.setScale(0.1, 0.1);
  emitter.gravity = 0;
  //emitter.start(false, 500, 50);

  circle = game.add.sprite(0, HEIGHT - 50, 'circle');

  game.physics.p2.gravity.y = 500;
  game.physics.p2.enable(circle);

  circle.anchor.set(0.5);
  circle.body.setCircle(15);
  circle.body.collideWorldBounds = true;

  //game.time.events.loop(LOOP_INTERVAL, updateCounter, this);
  game.camera.follow(circle);

  // create timer
  timer = new Tock({
    interval: LOOP_INTERVAL,
    callback: fixedUpdate,
    //complete: someCompleteFunction
  });

  // start timer
  timer.start();
}

function update() {
  emitter.x = circle.x
  emitter.y = circle.y

  circle.body.moveRight(moveSpeed);
}

function fixedUpdate() {
  if (!ready) {
    return;
  }

  if (!started) {
    // var synth = Synth(44100);
    // var replayer = Replayer(midiFile, synth);
    // var audio = AudioPlayer(replayer);

    started = true;
  }

	var currentSeq = sequence[counter];

	if(currentSeq){
    console.log(currentSeq)

    if(currentSeq.fadespeed){
      fadeSpeed = currentSeq.fadespeed
    }

    if(currentSeq.gravity){
        game.physics.p2.gravity.y = currentSeq.gravity;
    }

    if(currentSeq.speed){
        moveSpeed = currentSeq.speed;
    }

    if(currentSeq.hide == 1){
      game.add.tween(circle).to( { alpha: 0 }, fadeSpeed, Phaser.Easing.Linear.None, true, 0, 0, false);
    } 
    else if(currentSeq.jump) {
      if(currentSeq.immediate == 1){
        circle.alpha = 1
        circle.body.y = circle.y - currentSeq.jump
      } 
      else {
        game.add.tween(circle).to( { alpha: 1 }, fadeSpeed, Phaser.Easing.Linear.None, true, 0, 0, false);
        circle.body.moveUp(currentSeq.jump);
      }
    }
	}

	counter += LOOP_INTERVAL;
}

function render() {
  game.debug.cameraInfo(game.camera, 32, 64);
  game.debug.spriteCoords(circle, 32, 150);
}