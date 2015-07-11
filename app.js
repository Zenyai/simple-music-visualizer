var game;

// groups containing crates and planets
var crateGroup;
var planetGroup;

var planet;
var bigPlanet;

// a force reducer to let the simulation run smoothly
var forceReducer = 0.005;
var counter = 0;

// graphic object where to draw planet gravity area

var gravityGraphics;

var gbJSON;

// Temporary parse JSON file
$.getJSON("example_json/short.json", function(out) {
    gbJSON = out;
});

window.onload = function() {
	game = new Phaser.Game(800, 600, Phaser.AUTO, "");
  game.state.add("PlayGame",playGame);
  game.state.start("PlayGame");
}

var playGame = function(game){};

playGame.prototype = {
	preload: function(){
		game.load.image("grid", "img/grid.bmp")
		game.load.image("crate", "img/crate.png");
		game.load.image("planet", "img/black_planet.png");
		game.load.image("bigplanet", "img/bigplanet.png");
	},
  	create: function(){

  	// adding group
  	crateGroup = game.add.group();
  	planetGroup = game.add.group();

		// adding graphic objects
		gravityGraphics = game.add.graphics(0, 0);
    gravityGraphics.lineStyle(2,0xffffff,0.5);

		// stage setup
		var background = game.add.tileSprite(0, 0, 1000, 600, 'grid');
		crateGroup.add(background);

		// physics initialization
		game.physics.startSystem(Phaser.Physics.BOX2D);

		// add a simple BOX2D
		var crateSprite = game.add.sprite(50, 50, "crate");
		crateGroup.add(crateSprite);
	  game.physics.box2d.enable(crateSprite);

    var planetCollisionGroup = game.physics.box2d.createCollision();
    var playerCollisionGroup = game.physics.box2d.createCollisionGroup();

    crateSprite.body.setCollisionGroup(playerCollisionGroup);
    crateSprite.body.collides([playerCollisionGroup, planetCollisionGroup])

		// adding a couple of planets. Arguments are:
		// x position
		// y position
		// gravity radius
		// gravity force
		// graphic asset
		//splanet = addPlanet(180, 200, 100, 150, "planet");
    //bigPlanet = addPlanet(570, 350, 400, 250, "bigplanet");

		// waiting for player input
		game.input.onDown.add(addCrate, this);
		game.time.events.loop(1, updateCounter, this);
	},
	update: function(){
		// looping through all crates
		for(var i=0;i<crateGroup.total;i++){
			var c = crateGroup.getChildAt(i);

			// looping through all planets
			for(var j=0;j<planetGroup.total;j++){
				var p = planetGroup.getChildAt(j);

				// calculating distance between the planet and the crate
				var distance = Phaser.Math.distance(c.x,c.y,p.x,p.y);

				// checking if the distance is less than gravity radius
				if(distance<p.width/2+p.gravityRadius/2){
					// calculating angle between the planet and the crate
					var angle = Phaser.Math.angleBetween(c.x,c.y,p.x,p.y);
					// add gravity force to the crate in the direction of planet center
					c.body.applyForce(p.gravityForce*Math.cos(angle)*forceReducer,p.gravityForce*Math.sin(angle)*forceReducer);
				}
			}
		}
	}
}

// function to add a crate

function addCrate(e){
	var crateSprite = game.add.sprite(e.x, e.y, "crate");
	crateGroup.add(crateSprite);
  game.physics.box2d.enable(crateSprite, false);
}

// function to add a planet

function addPlanet(posX, posY, gravityRadius, gravityForce, asset){

	//console.log(posX + " " + posY + " " + gravityRadius + " " + gravityForce);
	var planet = game.add.sprite(posX, posY, asset);
	planet.gravityRadius = gravityRadius;
	planet.gravityForce = gravityForce
	planetGroup.add(planet);
	game.physics.box2d.enable(planet);
	planet.body.static = true;

	// look how I create a circular body
	planet.body.setCircle(planet.width / 2);
	gravityGraphics.drawCircle(planet.x, planet.y, planet.width+planet.gravityRadius);

  planet.body.setCollisionGroup(planetCollisionGroup);
	return planet;
}

function removePlanet(object){
	object.destroy();
}

// function update counter
function updateCounter()
{
	var result = gbJSON[counter];

	if(result != undefined){
		for (var rsi in result){
			var rs = result[rsi]
			console.log(rs.atX);
			addPlanet(parseInt(rs.atX), parseInt(rs.atY), parseInt(rs.gravityRadius), parseInt(rs.gravityForce), "planet");
			console.log(rs);
		}
	}

	counter++;
}
