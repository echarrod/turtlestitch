/* Sprite */
// modified SpriteMorph turtlestitch functions



SpriteMorph.prototype.origInit = SpriteMorph.prototype.init;
SpriteMorph.prototype.init = function(globals) {
    this.origInit(globals);
    this.hide();
    this.lastJumped = false;
    this.turtle = null;    
    this.isDown = true;
    this.cache = new Cache;
};

SpriteMorph.prototype.addStitch = function(x1, y1, x2, y2) {
    var stage = this.parentThatIsA(StageMorph);


    if (this.stitchLines === null) {
        this.stitchLines = new THREE.Group();
    }
    
	color = new THREE.Color("rgb("+
            Math.round(stage.drawingColor.r) + "," +
            Math.round(stage.drawingColor.g) + "," +
            Math.round(stage.drawingColor.b)  + ")" )   
    
    var material = this.cache.findMaterial( color, 1); 
    if (!material) {
		material = new THREE.MeshBasicMaterial({
			color: color,
			side:THREE.DoubleSide,
			opacity: 1
		});
		this.cache.addMaterial(material);
	}    

	// render as plain lines
	if (false) {
		var geometry = this.cache.findGeometry('stitch', [x1,y1,x2,y2]);
		if (!geometry) {
			geometry = new THREE.Geometry();
			geometry.vertices = [
				new THREE.Vector3(x1, y1, 0.0),
				new THREE.Vector3(x2, y2, 0.0),
			];
			this.cache.addGeometry('stitch', geometry, [x1,y1,x2,y2]);
		}

		line = new THREE.Line(geometry, material);
		stage.myStitchLines.add(line);
	}
	// render as quads
	if (true) {
		var material = new THREE.MeshBasicMaterial(
			{ color: color, side:THREE.DoubleSide, opacity: 0.8  } );
		var geometry = new THREE.Geometry();
		var s = stage.penSize / 2;

		normal = new THREE.Vector3( -(y2-y1), (x2-x1), 0);
		normal = normal.normalize();
		//dir = new THREE.Vector3( (x2-x1), (y2-y1), 0);
		//dir = dir.normalize();

		material.transparent = false;
		/*geometry.vertices = [
			new THREE.Vector3(x1 + normal.x * s - s * dir.x, y1 + normal.y * s  - s * dir.y, 0.0),
			new THREE.Vector3(x2 + normal.x * s + s * dir.x, y2 + normal.y * s + s * dir.y, 0.0),
			new THREE.Vector3(x2 - normal.x * s + s * dir.x, y2 - normal.y * s + s * dir.y, 0.0),
			new THREE.Vector3(x1 - normal.x * s - s * dir.x, y1 - normal.y * s - s * dir.y, 0.0),
			new THREE.Vector3(x1 + normal.x * s - s * dir.x, y1 + normal.y * s - s * dir.y, 0.0),
		];*/
		geometry.vertices = [
			new THREE.Vector3(x1 + normal.x * s, y1 + normal.y * s, 0.0),
			new THREE.Vector3(x2 + normal.x * s, y2 + normal.y * s, 0.0),
			new THREE.Vector3(x2 - normal.x * s, y2 - normal.y * s, 0.0),
			new THREE.Vector3(x1 - normal.x * s, y1 - normal.y * s, 0.0),
			new THREE.Vector3(x1 + normal.x * s, y1 + normal.y * s, 0.0),
		];
		geometry.faces.push(new THREE.Face3(0, 1, 2));
		geometry.faces.push(new THREE.Face3(0, 2, 3));
		line = new THREE.Mesh(geometry, material);
		stage.myStitchLines.add(line);

		// add a circle to simulate linecaps:round in svg
		if (stage.penSize > 1) {
			geometry = new THREE.CircleGeometry( s, 32 );
			geometry.faces.push(new THREE.Face3(0, 1, 2));
			geometry.faces.push(new THREE.Face3(0, 2, 3));
			var circle = new THREE.Mesh( geometry, material );
			circle.translateX(x2);
			circle.translateY(y2);
			circle.visible = true;
			stage.myStitchLines.add(circle);
		}
	}

    this.lastJumped = false;
    stage.reRender();
};


SpriteMorph.prototype.addJumpLine = function(x1, y1, x2, y2) {
    var stage = this.parentThatIsA(StageMorph);

    if (this.jumpLines === null) {
        this.jumpLines = new THREE.Group();
    }

    var material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
    var geometry = new THREE.Geometry();
    geometry.vertices = [
        new THREE.Vector3(x1, y1, 0.0),
        new THREE.Vector3(x2, y2, 0.0),
    ];
    line = new THREE.Line(geometry, material);
    stage.myJumpLines.add(line);

    this.lastJumped = true;
    stage.reRender();
};

SpriteMorph.prototype.addStitchPoint = function(x2, y2) {
    var stage = this.parentThatIsA(StageMorph);

	var material = this.cache.findMaterial( 0x0000ff, 1);    
    if (!material) {
		material = new THREE.MeshBasicMaterial(
			{ color: 0x0000ff, side:THREE.DoubleSide, opacity: 1  } );
		this.cache.addMaterial(material);
	}
    material.transparent = true;

    if (this.jumpLines === null) {
        this.jumpLines = new THREE.Group();
    }

    //normal = new THREE.Vector3( -(y2-y1), (x2-x1), 0);
    //normal = normal.normalize();

	var geometry = this.cache.findGeometry('stitchPoint', [d,]);
	if (!geometry) {
		geometry = new THREE.Geometry();
		//var d = (stage.penSize * 1.4) / 2;
		var d = 0.7;
		geometry.vertices = [
			new THREE.Vector3(-d, -d, 0.011),
			new THREE.Vector3(+d, -d, 0.011),
			new THREE.Vector3(+d, +d, 0.011),
			new THREE.Vector3(-d, +d, 0.011),
		];

		geometry.faces.push(new THREE.Face3(0, 1, 2));
		geometry.faces.push(new THREE.Face3(0, 2, 3));
		this.cache.addGeometry('stitchPoint', geometry, [d]);		
	}
	
    line = new THREE.Mesh(geometry, material);    
    line.rotation.z = (90 - this.heading) * Math.PI / 180;
    line.position.set(x2,y2,0);

    line.visible = stage.renderer.showingStitchPoints;
    stage.myStitchPoints.add(line);

    stage.reRender();
};

SpriteMorph.prototype.addDensityPoint = function(x1, y1) {
    var stage = this.parentThatIsA(StageMorph);

	var geometry = this.cache.findGeometry('densityPoint', [3, 6,]);
	if (!geometry) {
		geometry = new THREE.CircleGeometry( 3, 6 );
		geometry.vertices.shift();
		this.cache.addGeometry('densityPoint', geometry, [3, 6,]);	
	}
	
	var material = this.cache.findMaterial( 0xff0000, 1);
	if (!material) {
		material = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity:1} );
		this.cache.addMaterial(material);
	}		
    
    var circle = new THREE.Mesh( geometry, material );
    circle.translateX(x1);
    circle.translateY(y1);
    circle.translateZ(0.03);
    circle.visible = true;
    stage.myDensityPoints.add(circle);

    stage.reRender();
};


SpriteMorph.prototype.origForward = SpriteMorph.prototype.forward;
SpriteMorph.prototype.forward = function (steps) {
    var dest,
        dist = steps * this.parent.scale || 0;
        stage = this.parentThatIsA(StageMorph);
        warn = false;

    oldx = this.xPosition();
    oldy = this.yPosition();

    if (dist >= 0) {
        dest = this.position().distanceAngle(dist, this.heading);
    } else {
        dest = this.position().distanceAngle(
            Math.abs(dist),  (this.heading - 180)
        );
    }

    if (dist != 0) {
		this.setPosition(dest);
		this.positionTalkBubble();

		warn = stage.turtleShepherd.moveTo(
			oldx, oldy,
			this.xPosition(), this.yPosition(),
			this.isDown );

		//console.log(this.isDown, this.xPosition(), this.yPosition(), dist);

		if (this.isDown) {
			this.addStitch(oldx, oldy, this.xPosition(), this.yPosition());
			this.addStitchPoint(this.xPosition(), this.yPosition());
			if (warn) {
				this.addDensityPoint(this.xPosition(), this.yPosition());
			}
			if (this.parentThatIsA(StageMorph).turtleShepherd.isEmpty()) {
				this.addStitchPoint(0,0);
			}
		} else {
			this.addJumpLine(oldx, oldy, this.xPosition(), this.yPosition());
		}
		stage.moveTurtle(this.xPosition(), this.yPosition());
	}

    //this.changed();
};

SpriteMorph.prototype.forwardByNr = function (totalsteps, nr_steps) {
    stepsize = totalsteps / nr_steps;
    for(i=0;i<nr_steps;i++) {
		this.forward(stepsize);
	}
};

SpriteMorph.prototype.forwardBy = function (totalsteps, stepsize) {
    nr_steps = Math.floor(totalsteps / stepsize);
    rest = totalsteps - (nr_steps * stepsize);
    for(i=0;i<nr_steps;i++) {
		this.forward(stepsize);
	}
	if (rest > 0) {
		this.forward(rest);
	}

};

SpriteMorph.prototype.origGotoXY = SpriteMorph.prototype.gotoXY;
SpriteMorph.prototype.gotoXY = function (x, y, justMe, noShadow) {
    var stage = this.parentThatIsA(StageMorph);
    warn = false;
    oldx = this.xPosition();
    oldy = this.yPosition();
    this.origGotoXY(x, y, justMe);

    x = !isFinite(+x) ? 0 : +x;
    y = !isFinite(+y) ? 0 : +y;

    var a = (oldx - this.xPosition());
    var b = (oldy - this.yPosition());
    var dist = Math.sqrt(a*a + b*b);

    if ( dist <= 1) {
		// jump in place - don't add / ignore
		//console.log("jump in place - don't add / ignore",  this.isDown,this.xPosition(), this.yPosition(), dist);
    } else {
        warn = this.parentThatIsA(StageMorph).turtleShepherd.moveTo(
            oldx, oldy,
            this.xPosition(), this.yPosition(),
            this.isDown );

		//console.log("goto", this.isDown,this.xPosition(), this.yPosition(), dist);

        if (this.isDown) {
            this.addStitch(oldx, oldy, this.xPosition(), this.yPosition());
            this.addStitchPoint(this.xPosition(), this.yPosition());
			if (warn) {
				this.addDensityPoint(this.xPosition(), this.yPosition());
			}
			if (this.parentThatIsA(StageMorph).turtleShepherd.isEmpty())
				this.addStitchPoint(0,0);
        } else {
            this.addJumpLine(oldx, oldy, this.xPosition(), this.yPosition());
        }
        stage.moveTurtle(this.xPosition(), this.yPosition());
	}
};

SpriteMorph.prototype.gotoXYBy = function (x, y, stepsize) {
    var stage = this.parentThatIsA(StageMorph);
    var dest;

    if (!stage) {return; }

    x = !isFinite(+x) ? 0 : +x;
    y = !isFinite(+y) ? 0 : +y;

    var dest = new Point(x, y).subtract(
                  new Point(this.xPosition(), this.yPosition()));

    var a = (x - this.xPosition());
    var b = (y - this.yPosition());
    var dist = Math.sqrt(a*a + b*b);
    if (a == 0 && b == 0)
      dist = 0;

    if (dist > 0) {
      var steps = Math.floor(dist / stepsize);
      var rest = dist - (steps * stepsize);

      var deltaX = (x - this.xPosition()) * this.parent.scale;
      var deltaY = (y - this.yPosition()) * this.parent.scale;
      var angle = Math.abs(deltaX) < 0.001 ? (deltaY < 0 ? 90 : 270)
                  : Math.round(
                  (deltaX >= 0 ? 0 : 180)
                      - (Math.atan(deltaY / deltaX) * 57.2957795131)
              );
      this.setHeading(angle + 90);

      for(i=0; i < steps; i++) {
        this.forward(stepsize);
      }
      if (rest > 0) {
        this.gotoXY(x,y);
      }
    }
};

SpriteMorph.prototype.gotoXYIn = function (x, y, steps) {
    var stage = this.parentThatIsA(StageMorph);
    var dest;

    if (!stage) {return; }

    x = !isFinite(+x) ? 0 : +x;
    y = !isFinite(+y) ? 0 : +y;

    var dest = new Point(x, y).subtract(
                  new Point(this.xPosition(), this.yPosition()));

    var a = (x - this.xPosition());
    var b = (y - this.yPosition());
    var dist = Math.sqrt(a*a + b*b);
    if (a == 0 && b == 0)
      dist = 0;

	var deltaX = (x - this.xPosition()) * this.parent.scale;
	var deltaY = (y - this.yPosition()) * this.parent.scale;
	var angle = Math.abs(deltaX) < 0.001 ? (deltaY < 0 ? 90 : 270)
			  : Math.round(
			  (deltaX >= 0 ? 0 : 180)
				  - (Math.atan(deltaY / deltaX) * 57.2957795131)
		  );
	this.setHeading(angle + 90);

    if (dist > 0) {
		var stepsize =  dist / steps;
		for(i=0; i < steps; i++) {
			this.forward(stepsize);
		}
    }
};


SpriteMorph.prototype.pointTowards = function (x, y) {
    var stage = this.parentThatIsA(StageMorph);
    var dest;

    if (!stage) {return; }

    x = !isFinite(+x) ? 0 : +x;
    y = !isFinite(+y) ? 0 : +y;


	var deltaX = (x - this.xPosition()) * this.parent.scale;
	var deltaY = (y - this.yPosition()) * this.parent.scale;
	var angle = Math.abs(deltaX) < 0.001 ? (deltaY < 0 ? 90 : 270)
			  : Math.round(
			  (deltaX >= 0 ? 0 : 180)
				  - (Math.atan(deltaY / deltaX) * 57.2957795131)
	);
	this.setHeading(angle + 90);
};

SpriteMorph.prototype.drawText = function (text, scale, fontnr) {
    var stage = this.parentThatIsA(StageMorph);
    var dest;
    var myself = this;

    if (!stage) {return; }


	// a few basic Hershey fonts.
	// https://en.wikipedia.org/wiki/Hershey_fonts
	// retrieved from
	// https://techninja.github.io/hersheytextjs/

    var font = "futuram"
	if (fontnr == 1) font = "scripts"
	if (fontnr == 2) font = "futural"
	
	// Asteroid font 
	// retrieved from https://trmm.net/Asteroids_font
	if (fontnr == 3) font = "asteroid"

	if (fontnr == 3) {
		scale = scale * 2;
	}

	function doAJump(x, y) {
		var penState = myself.isDown;
		myself.isDown = false;
		myself.gotoXY(x, y);
		myself.gotoXY(x+2, y+2);
		myself.gotoXY(x, y);
		myself.isDown = penState;
	}

	if (stage.fonts) {
		for(var i in text) {
			var index = text.charCodeAt(i) - 33;
			var x = this.xPosition();
			var y = this.yPosition();
			var maxx = 0, maxy = 0;
			var nextPenIsUp = false; 
			if (fontnr == 3) {
				if (stage.afonts[text[i].toUpperCase()]){
					coords = stage.afonts[text[i].toUpperCase()];
					for (var j=0; j<coords.length; j++) {
						if (coords[j] == "FONT_UP") {
							nextPenIsUp = true;
						} else if (coords[j] == "FONT_LAST") {
							// ignore last
						} else {
							if (nextPenIsUp || j == 0  ) {
								doAJump(x + coords[j][0] * scale, y + coords[j][1] * scale )
								nextPenIsUp = false;
							} else 	{
								this.gotoXYBy(x + coords[j][0] * scale, y + coords[j][1] * scale, 10 )
							}
						}
					}
				}
				if (i < text.length) {
					doAJump(x + (10 * scale), y );
				}
			} else  {
				if (stage.fonts[font].chars[index]){
					commands = stage.fonts[font].chars[index].d.split(' ');
					for (var i =0; i<commands.length; i++) {
						var coord = commands[i].split(',');
						if (coord[0][0] == "M") {
							coord[0] = coord[0].replace('M','')
						} else if (coord[0][0] == "L") {
							coord[0] = coord[0].replace('L','');
						}
						maxx = Math.max(maxx, parseInt(coord[0]))
						maxy = Math.max(maxy, parseInt(coord[1]))
					}
					for (var i =0; i<commands.length; i++) {
						var coord = commands[i].split(',');
						if (coord[0][0] == "M") {
							coord[0] = coord[0].replace('M','')
							doAJump(x + parseInt(coord[0]) * scale, y + (maxy - parseInt(coord[1])) * scale,)
						} else if (coord[0][0] == "L") {
							coord[0] = coord[0].replace('L','');
							this.gotoXYBy(x + parseInt(coord[0]) * scale, y + (maxy - parseInt(coord[1])) * scale, 10 )
						} else {
							this.gotoXYBy(x + parseInt(coord[0]) * scale, y + (maxy - parseInt(coord[1])) * scale, 10 )
						}
					}
					doAJump(x + (stage.fonts[font].chars[index].o * 1.7) * scale, y)
				} else {
					doAJump(x + 10 * scale, y)
				}
			}
		}
	} else {
		console.log("no fonts loaded");
		console.log(stage.fonts);
	}
};


SpriteMorph.prototype.origSetHeading = SpriteMorph.prototype.setHeading;
SpriteMorph.prototype.setHeading = function (degrees) {
    var stage = this.parentThatIsA(StageMorph);
    this.origSetHeading(degrees);
    stage.rotateTurtle(this.heading);
};

SpriteMorph.prototype.setColor = function (aColor) {
    var stage = this.parentThatIsA(StageMorph);
    if (!this.color.eq(aColor)) {
        this.color = aColor.copy();
    }
    stage.setColor(aColor);
    stage.turtleShepherd.addColorChange(aColor);


    // TO DO: set color in turtleShepherd
};

SpriteMorph.prototype.origSetHue = SpriteMorph.prototype.setHue;
SpriteMorph.prototype.setHue = function (num) {
    var stage = this.parentThatIsA(StageMorph);
    this.origSetHue(num);
    stage.setColor(this.color);
    stage.turtleShepherd.addColorChange(this.color);
};

SpriteMorph.prototype.origSetBrightness = SpriteMorph.prototype.setBrightness;
SpriteMorph.prototype.setBrightness = function (num) {
    var stage = this.parentThatIsA(StageMorph);
    this.origSetBrightness(num);
    stage.setColor(this.color);
    stage.turtleShepherd.addColorChange(this.color);
};

SpriteMorph.prototype.setSize = function (size) {
    var stage = this.parentThatIsA(StageMorph);
    if (!isNaN(size)) {
        this.size = Math.min(Math.max(+size, 0.0001), 1000);
    }
    stage.setPenSize(this.size);
    stage.turtleShepherd.setPenSize(this.size);
};


SpriteMorph.prototype.drawLine = function (start, dest) {};

SpriteMorph.prototype.origSilentGotoXY = SpriteMorph.prototype.silentGotoXY;
SpriteMorph.prototype.silentGotoXY = function (x, y, justMe) {
    this.origSilentGotoXY(x,y,justMe);
};

SpriteMorph.prototype.origClear = SpriteMorph.prototype.clear;
SpriteMorph.prototype.clear = function () {
    this.origClear();
    this.parentThatIsA(StageMorph).clearAll();
    this.parentThatIsA(StageMorph).turtleShepherd.clear();
    this.parentThatIsA(StageMorph).renderer.changed = true  ;
};

SpriteMorph.prototype.reRender = function () {

    //this.hide();
    this.changed();
};

// Single Sprite mode

SpriteMorph.prototype.origDrawNew = SpriteMorph.prototype.drawNew;
SpriteMorph.prototype.drawNew = function () {
    this.origDrawNew();
};

//SpriteMorph.prototype.thumbnail = function (extentPoint) {};
//SpriteMorph.prototype.drawNew = function () { this.hide() }

// THREE additions

THREE.Object3D.prototype.addLineToPointWithColor = function (point, color, thickness) {
    return this.addLineFromPointToPointWithColor(new THREE.Vector3(), point, color, thickness)
};

THREE.Object3D.prototype.addLineFromPointToPointWithColor = function (originPoint, destinationPoint, color, thickness) {
    geometry = new THREE.Geometry();
    geometry.vertices.push(originPoint);
    geometry.vertices.push(destinationPoint);
    var lineMaterial = new THREE.LineBasicMaterial({ color: color, linewidth: (thickness ? thickness : 1) });
    var line = new THREE.Line(geometry, lineMaterial);
    this.add(line);
    return line;
};


// ########################################################################
/* STAGE */
// ########################################################################



// StageMorph

StageMorph.prototype.originalDestroy = StageMorph.prototype.destroy;
StageMorph.prototype.destroy = function () {
    var myself = this;
    this.clearAll();
    this.children.forEach(function (eachSprite) {
        myself.removeChild(eachSprite);
    });
    this.originalDestroy();
};

StageMorph.prototype.originalInit = StageMorph.prototype.init;
StageMorph.prototype.init = function (globals) {
    var myself = this;

    this.originalInit(globals);
    this.initScene();
    this.initRenderer();
    this.initCamera();
    this.fonts = null;

	// implement Hershey fonts.
	// Json data from:
	// https://techninja.github.io/hersheytextjs/
	function loadFont(callback) {
		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open('GET', 'stitchcode/fonts/hershey.json', true);
		xobj.onreadystatechange = function () {
			  if (xobj.readyState == 4 && xobj.status == "200") {
				callback(xobj.responseText);
			  }
		};
		xobj.send(null);
	}
	
    if (!this.fonts) {
		loadFont(function(response) {
			myself.fonts = JSON.parse(response);
		});
	}

	// load Asteroid font 
	// retrieved from https://trmm.net/Asteroids_font
	
	function loadAsteroidFont(callback) {
		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open('GET', 'stitchcode/fonts/asteroid.json', true);
		xobj.onreadystatechange = function () {
			  if (xobj.readyState == 4 && xobj.status == "200") {
				callback(xobj.responseText);
			  }
		};
		xobj.send(null);
	}

    if (!this.afonts) {
		loadAsteroidFont(function(response) {
			myself.afonts = JSON.parse(response);
		});
	}

    this.turtleShepherd = new TurtleShepherd();

    this.scene.grid.draw();
    this.myObjects = new THREE.Object3D();
    this.myStitchPoints = new THREE.Object3D();
    this.myDensityPoints = new THREE.Object3D();
    this.myStitchLines = new THREE.Object3D();
    this.myJumpLines = new THREE.Object3D();
    this.scene.add(this.myObjects);
    this.scene.add(this.myStitchPoints);
    this.scene.add(this.myDensityPoints);
    this.scene.add(this.myStitchLines);
    this.scene.add(this.myJumpLines);

    this.initTurtle();
};

StageMorph.prototype.initScene = function () {
    var myself = this;
    this.scene = new THREE.Scene();
    this.scene.grid = {};
    this.scene.grid.defaultColor = 0xe0e0e0;
    this.scene.grid.visible = true;
    this.scene.grid.interval = new Point(5, 5);

    // Grid
    this.scene.grid.draw = function () {

        //var color = this.lines ? this.lines[0].material.color : this.defaultColor;
        var color = 0xf6f6f6;
        var color2 = 0xe0e0e0;

        if (this.lines) {
            this.lines.forEach(function (eachLine){
                myself.scene.remove(eachLine);
            });
        }

        this.lines = [];

		c = 2.54;
		if (myself.turtleShepherd.isMetric()) {
			this.interval = new Point(5, 5);
			limit = this.interval.x * 50;
		} else {
			this.interval = new Point(Math.round(5 * c), Math.round(5 * c));
			limit = Math.round(this.interval.x * 50 * c);
		}
        for (x = -limit / this.interval.x; x <= limit / this.interval.x; x++) {
            p1 = new THREE.Vector3(x * this.interval.x, -limit, 0);
            p2 = new THREE.Vector3(x * this.interval.x, limit, 0);
            l = myself.scene.addLineFromPointToPointWithColor(p1, p2, color);
            l.visible = this.visible;
            this.lines.push(l);
        }

        for (y = -limit / this.interval.y; y <= limit / this.interval.y; y++) {
            p1 = new THREE.Vector3(-limit, y * this.interval.y, 0);
            p2 = new THREE.Vector3(limit, y * this.interval.y, 0);
            l = myself.scene.addLineFromPointToPointWithColor(p1, p2, color);
            l.visible = this.visible;
            this.lines.push(l);
        }

		if (myself.turtleShepherd.isMetric())
			limit = this.interval.x * 200;
		else
			limit = Math.round(this.interval.x * 200 * c);


        for (x = -limit/10 / this.interval.x; x <= limit/10 / this.interval.x; x++) {
            p1 = new THREE.Vector3(x * this.interval.x * 10, -limit,0);
            p2 = new THREE.Vector3(x * this.interval.x* 10, limit,0);
            l = myself.scene.addLineFromPointToPointWithColor(p1, p2, color2);
            l.visible = this.visible;
            this.lines.push(l);
        }

        for (y = -limit/10 / this.interval.y; y <= limit/10 / this.interval.y ; y++) {
            p1 = new THREE.Vector3(-limit, y * this.interval.y * 10, 0);
            p2 = new THREE.Vector3(limit, y * this.interval.y * 10, 0);
            l = myself.scene.addLineFromPointToPointWithColor(p1, p2, color2);
            l.visible = this.visible;
            this.lines.push(l);
        }

        myself.reRender();
    };

    this.scene.grid.setInterval = function (aPoint) {
        this.interval = aPoint;
        this.draw();
    };

    this.scene.grid.setColor = function (color) {
        this.lines.forEach(function (eachLine) {
            eachLine.material.color.setHex(color);
        });
    };

    this.scene.grid.toggle = function () {
        var myInnerSelf = this;
        this.visible = !this.visible;
        this.lines.forEach(function (line){ line.visible = myInnerSelf.visible; });
        myself.reRender();
    };

};

StageMorph.prototype.clearAll = function () {
    /*for (var i = this.myObjects.children.length - 1; i >= 0; i--) {
        this.myObjects.remove(this.myObjects.children[i]);
    }*/
    for (i = this.myStitchPoints.children.length - 1; i >= 0; i--) {
        this.myStitchPoints.remove(this.myStitchPoints.children[i]);
    }
    for (i = this.myDensityPoints.children.length - 1; i >= 0; i--) {
        this.myDensityPoints.remove(this.myDensityPoints.children[i]);
    }
    for (i = this.myStitchLines.children.length - 1; i >= 0; i--) {
        this.myStitchLines.remove(this.myStitchLines.children[i]);
    }
    for (i = this.myJumpLines.children.length - 1; i >= 0; i--) {
        this.myJumpLines.remove(this.myJumpLines.children[i]);
    }

    this.renderer.clear();
};

StageMorph.prototype.initRenderer = function () {
    var myself = this;

	console.log("set up renderer");
    if (Detector.webgl) {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            canvas: this.penTrails()
        });
        console.log("webgl enabled");
        this.renderer_status_msg = "webgl enabled";

    } else {
		console.log("webgl unavailable. fallback to canvas (SLOW!)");
		this.renderer_status_msg = "webgl unavailable. fallback to canvas (SLOW!)";
        this.renderer = new THREE.CanvasRenderer(
            {canvas: this.penTrails()});
    }
    this.renderer.setClearColor(0xffffff, 1);

    this.renderer.changed = false;
    this.renderer.showingAxes = true;
    this.renderer.showingStitchPoints = true;
    this.renderer.showingJumpLines = true;
    this.renderer.showingTurtle = true;
    this.renderer.isParallelProjection = true;


    this.renderer.toggleJumpLines = function () {
        var myInnerSelf = this;
        this.showingJumpLines = !this.showingJumpLines;
        myself.myJumpLines.children.forEach(function (eachObject) {
            eachObject.visible = myInnerSelf.showingJumpLines;
        });
        myself.reRender();
    };

    this.renderer.toggleStitchPoints = function () {
        var myInnerSelf = this;
        this.showingStitchPoints = !this.showingStitchPoints;
        myself.myStitchPoints.children.forEach(function (eachObject) {
            eachObject.visible = myInnerSelf.showingStitchPoints;
        });
        myself.reRender();
    };

    this.renderer.toggleTurtle = function () {
        var myInnerSelf = this;
        this.showingTurtle = !this.showingTurtle;
        myself.turtle.visible = myInnerSelf.showingTurtle;
        myself.reRender();
    };

};


StageMorph.prototype.render = function () {
    this.renderer.render(this.scene, this.camera);
};

StageMorph.prototype.renderCycle = function () {
    if (this.renderer.changed) {
        this.render();
        this.changed();
        this.parentThatIsA(IDE_Morph).statusDisplay.refresh();
        this.renderer.changed = false;
    }
};

StageMorph.prototype.reRender = function () {
    this.renderer.changed = true;
};

StageMorph.prototype.initCamera = function () {
    var myself = this,
        threeLayer;

    if (this.scene.camera) { this.scene.remove(this.camera); }

    var createCamera = function () {
        threeLayer = document.createElement('div');

        if (myself.renderer.isParallelProjection) {
            var zoom = myself.camera ? myself.camera.zoomFactor : 82,
                width = Math.max(myself.width(), 480),
                height = Math.max(myself.height(), 360);

            myself.camera = new THREE.OrthographicCamera(
                    width / - zoom,
                    width / zoom,
                    height / zoom,
                    height / - zoom,
                    0.1,
                    10000);
        } else {
            myself.camera = new THREE.PerspectiveCamera(60, 480/360);
        }

        // We need to implement zooming ourselves for parallel projection

        myself.camera.zoomIn = function () {
            this.zoomFactor /= 1.1;
            this.applyZoom();
        };
        myself.camera.zoomOut = function () {
            this.zoomFactor *= 1.1;
            this.applyZoom();
        };

        myself.camera.applyZoom = function () {
            var zoom = myself.camera ? myself.camera.zoomFactor : 2,
                width = Math.max(myself.width(), 480),
                height = Math.max(myself.height(), 360);
            this.left = width / - zoom;
            this.right = width / zoom;
            this.top = height / zoom;
            this.bottom = height / - zoom;
            this.updateProjectionMatrix();
        };

        myself.camera.reset = function () {

            myself.controls = new THREE.OrbitControls(this, threeLayer);
            myself.controls.addEventListener('change', function (event) { myself.render(); });

            if (myself.renderer.isParallelProjection) {
                this.zoomFactor = 1.7;
                this.applyZoom();
                this.position.set(0,0,10);
                //myself.controls.rotateLeft(radians(90));
            } else {
                this.position.set(0,0,10);
            }

            myself.controls.update();
            myself.reRender();
        };

        myself.camera.fitScene = function () {

            var boundingBox = new THREE.Box3().setFromObject(myself.myStitchLines),
                boundingSphere = boundingBox.getBoundingSphere(),
                center = boundingSphere.center,
                distance = boundingSphere.radius;

            this.reset();

            this.position.set(center.x, center.y, center.z);
            this.translateZ(distance * 1.2);

            myself.controls.center.set(center.x, center.y, center.z);
            myself.controls.dollyOut(1.2);
            myself.controls.update();
            myself.reRender();
        };
    };

    createCamera();
    this.scene.add(this.camera);
    this.camera.reset();
};

StageMorph.prototype.initTurtle = function() {
    var myself = this;    
    var geometry = new THREE.Geometry();    
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, opacity:0.8 } );
    

    geometry.vertices = [ new THREE.Vector3(10, 0, 0.01),
         new THREE.Vector3(-8, 8, 0.02),
         new THREE.Vector3(-8,-8, 0.02),
    ];
    geometry.faces.push(new THREE.Face3(0, 1, 2));
    geometry.verticesNeedUpdate = true;
    this.turtle = new THREE.Mesh(new THREE.Geometry(), material);
    this.turtle.visible = this.renderer.showingTurtle;
    myself.myObjects.add(this.turtle);
    
    
    if (typeof this.turtle.loaded === 'undefined') {
		
		var mtlloader = new THREE.MTLLoader();
		var onLoadMtl = function ( materials ) {
			materials.preload();
			var loader = new THREE.OBJLoader();
			loader.setMaterials( materials )
			
			loader.load( 'stitchcode/assets/turtle.obj',  function (object) {
				this.turtle = object;
				object.scale.set(4, 4, 4);
				object.position.z = 0.02;
				//object.position.set(0,0, 0.01);
				object.rotation.x = 90 * Math.PI / 180;
				object.rotation.y = 270 * Math.PI / 180;
				myself.turtle.add(object);
				myself.renderer.changed = true;
				this.turtle.loaded = true;
			}, null, null, null, false );
		};
		mtlloader.load( 'stitchcode/assets/turtle.mtl', onLoadMtl );		
        

    }

    this.drawingColor = new Color(0,0,0);
    this.penSize = 0.8;
};

StageMorph.prototype.moveTurtle = function(x, y) {
    this.turtle.position.x = x;
    this.turtle.position.y = y;
};

StageMorph.prototype.setColor = function(c) {
    this.drawingColor = c;
};

StageMorph.prototype.setPenSize = function(s) {
    this.penSize = s;
};

StageMorph.prototype.rotateTurtle = function(h) {
    this.turtle.rotation.z = (90 -h) * Math.PI / 180;
    this.renderer.changed = true;
};

StageMorph.prototype.originalStep = StageMorph.prototype.step;
StageMorph.prototype.step = function () {
    this.originalStep();

    // update, if needed
    this.renderCycle();
};

StageMorph.prototype.referencePos = null;

StageMorph.prototype.mouseScroll = function (y, x) {
    if (this.renderer.isParallelProjection) {
        if (y > 0) {
            this.camera.zoomOut();
        } else if (y < 0) {
            this.camera.zoomIn();
        }
    } else {
        if (y > 0) {
            this.controls.dollyOut();
        } else if (y < 0) {
            this.controls.dollyIn();
        }
        this.controls.update();
    }
    this.renderer.changed = true;
};

StageMorph.prototype.mouseDownLeft = function (pos) {
    this.referencePos = pos;
};

StageMorph.prototype.mouseDownRight = function (pos) {
    this.referencePos = pos;
};

StageMorph.prototype.mouseMove = function (pos, button) {

    if (this.referencePos === null) { return };

    var factor = this.renderer.isParallelProjection ? 65 / this.camera.zoomFactor : this.controls.object.position.length() / 10,
        deltaX = (pos.x - this.referencePos.x),
        deltaY = (pos.y - this.referencePos.y);

    this.referencePos = pos;

    if (button === 'right' || this.world().currentKey === 16 || button === 'left') { // shiftClicked
        this.controls.panLeft(deltaX / this.dimensions.x / this.scale * 15 * factor);
        this.controls.panUp(deltaY / this.dimensions.y / this.scale * 10 * factor);
    } else {
        var horzAngle = deltaX / (this.dimensions.x * this.scale) * 360;
        var vertAngle = deltaY / (this.dimensions.y * this.scale) * 360;
        this.controls.rotateLeft(radians(horzAngle));
        this.controls.rotateUp(radians(vertAngle));
    }

    this.controls.update();
    this.reRender();
};

StageMorph.prototype.mouseLeave = function () {
    this.referencePos = null;
};

// StageMorph Mouse Coordinates

StageMorph.prototype.reportMouseX = function () {
    var world = this.world();
    if (world) {
        return ((world.hand.position().x - this.center().x) / this.scale)  / this.camera.zoomFactor * 2 + this.controls.center.x;
    }
    return 0;
};

StageMorph.prototype.reportMouseY = function () {
    var world = this.world();
    if (world) {
        return ((this.center().y - world.hand.position().y) / this.scale)  / this.camera.zoomFactor * 2 + this.controls.center.y;
    }
    return 0;
};


StageMorph.prototype.clearPenTrails = nop;

StageMorph.prototype.penTrails = function () {
    if (!this.trailsCanvas) {
        this.trailsCanvas = newCanvas(this.dimensions, true);
    }
    return this.trailsCanvas;
};

// StageMorph drawing
StageMorph.prototype.originalDrawOn = StageMorph.prototype.drawOn;
StageMorph.prototype.drawOn = function (aCanvas, aRect) {
    // If the scale is lower than 1, we reuse the original method,
    // otherwise we need to modify the renderer dimensions
    // we do not need to render the original canvas anymore because
    // we have removed sprites and backgrounds

    var rectangle, area, delta, src, context, w, h, sl, st;
    if (!this.isVisible) {
        return null;
    }
    /*
    if (this.scale < 1) {
        return this.originalDrawOn(aCanvas, aRect);
    }*/

    rectangle = aRect || this.bounds;
    area = rectangle.intersect(this.bounds).round();
    if (area.extent().gt(new Point(0, 0))) {
        delta = this.position().neg();
        src = area.copy().translateBy(delta).round();
        context = aCanvas.getContext('2d');
        context.globalAlpha = this.alpha;

        sl = src.left();
        st = src.top();
        w = Math.min(src.width(), this.image.width - sl);
        h = Math.min(src.height(), this.image.height - st);

        if (w < 1 || h < 1) {
            return null;
        }
        // we only draw pen trails!
        context.save();
        context.clearRect(
            area.left(),
            area.top() ,
            w,
            h);
        try {
            context.drawImage(
                this.penTrails(),
                sl,
                st,
                w,
                h,
                area.left(),
                area.top(),
                w,
                h
            );
        } catch (err) { // sometimes triggered only by Firefox
            console.log(err);
        }
        context.restore();
    }
};

StageMorph.prototype.originalSetScale = StageMorph.prototype.setScale;
StageMorph.prototype.setScale = function (number) {
    this.scaleChanged = true;
    this.originalSetScale(number);
    this.camera.aspect = this.extent().x / this.extent().y;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.extent().x, this.extent().y);
    this.renderer.changed = true;
};


// Contextual menu
StageMorph.prototype.userMenu = function () {
    var ide = this.parentThatIsA(IDE_Morph),
        menu = new MenuMorph(this),
        shiftClicked = this.world().currentKey === 16,
        myself = this;

    if (ide && ide.isAppMode) {
        menu.hide();
        return menu;
    }
    menu.addItem(
            'pic...',
            function () {
                window.open(myself.fullImageClassic().toDataURL());
            },
            'open a new window\nwith a picture of the scene'
            );
    return menu;
};

SpriteMorph.prototype.resetAll = function () {

    var myself = this;

	myself.gotoXY(0,0);
	myself.setHeading(90);
    myself.clear();
    myself.setColor(new Color(0,0,0,0));
}


// Block specs

SpriteMorph.prototype.originalInitBlocks = SpriteMorph.prototype.initBlocks;
SpriteMorph.prototype.initBlocks = function () {

    var myself = this;
    this.originalInitBlocks();

    // control
    this.blocks.resetAll =
    {
		only: SpriteMorph,
        type: 'command',
        spec: 'reset',
        category: 'control'
    };

    // control
    this.blocks.forwardBy =
    {
		only: SpriteMorph,
        type: 'command',
        category: 'motion',
        spec: 'move %n steps by %n steps',
        defaults: [100,10]
    };

    // control
    this.blocks.forwardByNr =
    {
		only: SpriteMorph,
        type: 'command',
        category: 'motion',
        spec: 'move %n steps in %n',
        defaults: [100,10]
    };

    // control
    this.blocks.gotoXYBy =
    {
		only: SpriteMorph,
        type: 'command',
        category: 'motion',
        spec: 'go to x: %n y: %n by %n',
        defaults: [0, 0, 10]
    };

   // control
    this.blocks.gotoXYIn =
    {
		only: SpriteMorph,
        type: 'command',
        category: 'motion',
        spec: 'go to x: %n y: %n in %n',
        defaults: [0, 0, 10]
    };


   // control
    this.blocks.pointTowards =
    {
		only: SpriteMorph,
        type: 'command',
        category: 'motion',
        spec: 'point towards x: %n y: %n',
        defaults: [0, 0]
    };
    
   // control
    this.blocks.drawText =
    {
		only: SpriteMorph,
        type: 'command',
        category: 'motion',
        spec: 'draw text: %s scale: %n font: %n',
        defaults: ["hello", 2, 0]
    };
};

SpriteMorph.prototype.initBlocks();

// SpriteMorph block templates

SpriteMorph.prototype.blockTemplates = function (category) {
    var blocks = [], myself = this, varNames, button,
        cat = category || 'motion', txt,
        inheritedVars = this.inheritedVariableNames();

    function block(selector) {
        if (StageMorph.prototype.hiddenPrimitives[selector]) {
            return null;
        }
        var newBlock = SpriteMorph.prototype.blockForSelector(selector, true);
        newBlock.isTemplate = true;
        return newBlock;
    }

    function variableBlock(varName) {
        var newBlock = SpriteMorph.prototype.variableBlock(varName);
        newBlock.isDraggable = false;
        newBlock.isTemplate = true;
        if (contains(inheritedVars, varName)) {
            newBlock.ghost();
        }
        return newBlock;
    }

    function watcherToggle(selector) {
        if (StageMorph.prototype.hiddenPrimitives[selector]) {
            return null;
        }
        var info = SpriteMorph.prototype.blocks[selector];
        return new ToggleMorph(
            'checkbox',
            this,
            function () {
                myself.toggleWatcher(
                    selector,
                    localize(info.spec),
                    myself.blockColor[info.category]
                );
            },
            null,
            function () {
                return myself.showingWatcher(selector);
            },
            null
        );
    }

    function variableWatcherToggle(varName) {
        return new ToggleMorph(
            'checkbox',
            this,
            function () {
                myself.toggleVariableWatcher(varName);
            },
            null,
            function () {
                return myself.showingVariableWatcher(varName);
            },
            null
        );
    }

    function helpMenu() {
        var menu = new MenuMorph(this);
        menu.addItem('help...', 'showHelp');
        return menu;
    }

    function addVar(pair) {
        var ide;
        if (pair) {
            if (myself.isVariableNameInUse(pair[0], pair[1])) {
                myself.inform('that name is already in use');
            } else {
                ide = myself.parentThatIsA(IDE_Morph);
                myself.addVariable(pair[0], pair[1]);
                if (!myself.showingVariableWatcher(pair[0])) {
                    myself.toggleVariableWatcher(pair[0], pair[1]);
                }
                ide.flushBlocksCache('variables'); // b/c of inheritance
                ide.refreshPalette();
            }
        }
    }

    if (cat === 'motion') {

        blocks.push(block('forward'));
        blocks.push(block('forwardByNr'));
        blocks.push(block('forwardBy'));
        blocks.push('-');
        blocks.push(block('turn'));
        blocks.push(block('turnLeft'));
        blocks.push('-');
        blocks.push(block('setHeading'));
        blocks.push(block('doFaceTowards'));
        blocks.push(block('pointTowards'));
        blocks.push(block('drawText'));
        blocks.push('-');
        blocks.push(block('gotoXY'));
        blocks.push(block('gotoXYIn'));
        blocks.push(block('gotoXYBy'));
        blocks.push(block('doGotoObject'));
        blocks.push(block('doGlide'));
        blocks.push('-');
        blocks.push(block('changeXPosition'));
        blocks.push(block('setXPosition'));
        blocks.push(block('changeYPosition'));
        blocks.push(block('setYPosition'));
        blocks.push('-');
        blocks.push(block('bounceOffEdge'));
        blocks.push('-');
        blocks.push(watcherToggle('xPosition'));
        blocks.push(block('xPosition'));
        blocks.push(watcherToggle('yPosition'));
        blocks.push(block('yPosition'));
        blocks.push(watcherToggle('direction'));
        blocks.push(block('direction'));

    } else if (cat === 'looks') {

        blocks.push(block('doSwitchToCostume'));
        blocks.push(block('doWearNextCostume'));
        blocks.push(watcherToggle('getCostumeIdx'));
        blocks.push(block('getCostumeIdx'));
        blocks.push('-');
        blocks.push(block('doSayFor'));
        blocks.push(block('bubble'));
        blocks.push(block('doThinkFor'));
        blocks.push(block('doThink'));
        blocks.push('-');
        blocks.push(block('changeEffect'));
        blocks.push(block('setEffect'));
        blocks.push(block('clearEffects'));
        blocks.push('-');
        blocks.push(block('changeScale'));
        blocks.push(block('setScale'));
        blocks.push(watcherToggle('getScale'));
        blocks.push(block('getScale'));
        blocks.push('-');
        blocks.push(block('show'));
        blocks.push(block('hide'));
        blocks.push('-');
        blocks.push(block('comeToFront'));
        blocks.push(block('goBack'));

    // for debugging: ///////////////

        if (this.world().isDevMode) {
            blocks.push('-');
            txt = new TextMorph(localize(
                'development mode \ndebugging primitives:'
            ));
            txt.fontSize = 9;
            txt.setColor(this.paletteTextColor);
            blocks.push(txt);
            blocks.push('-');
            blocks.push(block('reportCostumes'));
            blocks.push('-');
            blocks.push(block('log'));
            blocks.push(block('alert'));
            blocks.push('-');
            blocks.push(block('doScreenshot'));
        }

    /////////////////////////////////

    } else if (cat === 'sound') {

        blocks.push(block('playSound'));
        blocks.push(block('doPlaySoundUntilDone'));
        blocks.push(block('doStopAllSounds'));
        blocks.push('-');
        blocks.push(block('doRest'));
        blocks.push('-');
        blocks.push(block('doPlayNote'));
        blocks.push('-');
        blocks.push(block('doChangeTempo'));
        blocks.push(block('doSetTempo'));
        blocks.push(watcherToggle('getTempo'));
        blocks.push(block('getTempo'));

    // for debugging: ///////////////

        if (this.world().isDevMode) {
            blocks.push('-');
            txt = new TextMorph(localize(
                'development mode \ndebugging primitives:'
            ));
            txt.fontSize = 9;
            txt.setColor(this.paletteTextColor);
            blocks.push(txt);
            blocks.push('-');
            blocks.push(block('reportSounds'));
        }

    } else if (cat === 'pen') {

        blocks.push(block('clear'));
        blocks.push('-');
        blocks.push(block('down'));
        blocks.push(block('up'));
        blocks.push('-');
        blocks.push(block('setColor'));
        blocks.push(block('changeHue'));
        blocks.push(block('setHue'));
        blocks.push('-');
        blocks.push(block('changeBrightness'));
        blocks.push(block('setBrightness'));
        blocks.push('-');
        blocks.push(block('changeSize'));
        blocks.push(block('setSize'));
    } else if (cat === 'control') {

		blocks.push(block('resetAll'));
		blocks.push('-');
        blocks.push(block('receiveGo'));
        blocks.push(block('receiveKey'));
        blocks.push(block('receiveInteraction'));
        blocks.push(block('receiveCondition'));
        blocks.push(block('receiveMessage'));
        blocks.push('-');
        blocks.push(block('doBroadcast'));
        blocks.push(block('doBroadcastAndWait'));
        blocks.push(watcherToggle('getLastMessage'));
        blocks.push(block('getLastMessage'));
        blocks.push('-');
        blocks.push(block('doWarp'));
        blocks.push('-');
        blocks.push(block('doWait'));
        blocks.push(block('doWaitUntil'));
        blocks.push('-');
        blocks.push(block('doForever'));
        blocks.push(block('doRepeat'));
        blocks.push(block('doUntil'));
        blocks.push('-');
        blocks.push(block('doIf'));
        blocks.push(block('doIfElse'));
        blocks.push('-');
        blocks.push(block('doReport'));
        blocks.push('-');
    /*
    // old STOP variants, migrated to a newer version, now redundant
        blocks.push(block('doStopBlock'));
        blocks.push(block('doStop'));
        blocks.push(block('doStopAll'));
    */
        blocks.push(block('doStopThis'));
        blocks.push(block('doStopOthers'));
        blocks.push('-');
        blocks.push(block('doRun'));
        blocks.push(block('fork'));
        blocks.push(block('evaluate'));
        blocks.push('-');
    /*
    // list variants commented out for now (redundant)
        blocks.push(block('doRunWithInputList'));
        blocks.push(block('forkWithInputList'));
        blocks.push(block('evaluateWithInputList'));
        blocks.push('-');
    */
        blocks.push(block('doCallCC'));
        blocks.push(block('reportCallCC'));
        blocks.push('-');
        blocks.push(block('receiveOnClone'));
        blocks.push(block('createClone'));
        blocks.push(block('removeClone'));
        blocks.push('-');
        blocks.push(block('doPauseAll'));

    } else if (cat === 'sensing') {

        blocks.push(block('reportTouchingObject'));
        blocks.push(block('reportTouchingColor'));
        blocks.push(block('reportColorIsTouchingColor'));
        blocks.push('-');
        blocks.push(block('doAsk'));
        blocks.push(watcherToggle('getLastAnswer'));
        blocks.push(block('getLastAnswer'));
        blocks.push('-');
        blocks.push(watcherToggle('reportMouseX'));
        blocks.push(block('reportMouseX'));
        blocks.push(watcherToggle('reportMouseY'));
        blocks.push(block('reportMouseY'));
        blocks.push(block('reportMouseDown'));
        blocks.push('-');
        blocks.push(block('reportKeyPressed'));
        blocks.push('-');
        blocks.push(block('reportDistanceTo'));
        blocks.push('-');
        blocks.push(block('doResetTimer'));
        blocks.push(watcherToggle('getTimer'));
        blocks.push(block('getTimer'));
        blocks.push('-');
        blocks.push(block('reportAttributeOf'));

        if (SpriteMorph.prototype.enableFirstClass) {
            blocks.push(block('reportGet'));
        }
        blocks.push('-');

        blocks.push(block('reportURL'));
        blocks.push('-');
        blocks.push(block('reportIsFastTracking'));
        blocks.push(block('doSetFastTracking'));
        blocks.push('-');
        blocks.push(block('reportDate'));

    // for debugging: ///////////////

        if (this.world().isDevMode) {

            blocks.push('-');
            txt = new TextMorph(localize(
                'development mode \ndebugging primitives:'
            ));
            txt.fontSize = 9;
            txt.setColor(this.paletteTextColor);
            blocks.push(txt);
            blocks.push('-');
            blocks.push(watcherToggle('reportThreadCount'));
            blocks.push(block('reportThreadCount'));
            blocks.push(block('colorFiltered'));
            blocks.push(block('reportStackSize'));
            blocks.push(block('reportFrameCount'));
        }

    } else if (cat === 'operators') {

        blocks.push(block('reifyScript'));
        blocks.push(block('reifyReporter'));
        blocks.push(block('reifyPredicate'));
        blocks.push('#');
        blocks.push('-');
        blocks.push(block('reportSum'));
        blocks.push(block('reportDifference'));
        blocks.push(block('reportProduct'));
        blocks.push(block('reportQuotient'));
        blocks.push('-');
        blocks.push(block('reportModulus'));
        blocks.push(block('reportRound'));
        blocks.push(block('reportMonadic'));
        blocks.push(block('reportRandom'));
        blocks.push('-');
        blocks.push(block('reportLessThan'));
        blocks.push(block('reportEquals'));
        blocks.push(block('reportGreaterThan'));
        blocks.push('-');
        blocks.push(block('reportAnd'));
        blocks.push(block('reportOr'));
        blocks.push(block('reportNot'));
        blocks.push(block('reportBoolean'));
        blocks.push('-');
        blocks.push(block('reportJoinWords'));
        blocks.push(block('reportTextSplit'));
        blocks.push(block('reportLetter'));
        blocks.push(block('reportStringSize'));
        blocks.push('-');
        blocks.push(block('reportUnicode'));
        blocks.push(block('reportUnicodeAsLetter'));
        blocks.push('-');
        blocks.push(block('reportIsA'));
        blocks.push(block('reportIsIdentical'));
        blocks.push('-');
        blocks.push(block('reportJSFunction'));

    // for debugging: ///////////////

        if (this.world().isDevMode) {
            blocks.push('-');
            txt = new TextMorph(localize(
                'development mode \ndebugging primitives:'
            ));
            txt.fontSize = 9;
            txt.setColor(this.paletteTextColor);
            blocks.push(txt);
            blocks.push('-');
            blocks.push(block('reportTypeOf'));
            blocks.push(block('reportTextFunction'));
        }

    /////////////////////////////////

    } else if (cat === 'variables') {

        button = new PushButtonMorph(
            null,
            function () {
                new VariableDialogMorph(
                    null,
                    addVar,
                    myself
                ).prompt(
                    'Variable name',
                    null,
                    myself.world()
                );
            },
            'Make a variable'
        );
        button.userMenu = helpMenu;
        button.selector = 'addVariable';
        button.showHelp = BlockMorph.prototype.showHelp;
        blocks.push(button);

        if (this.deletableVariableNames().length > 0) {
            button = new PushButtonMorph(
                null,
                function () {
                    var menu = new MenuMorph(
                        myself.deleteVariable,
                        null,
                        myself
                    );
                    myself.deletableVariableNames().forEach(function (name) {
                        menu.addItem(name, name);
                    });
                    menu.popUpAtHand(myself.world());
                },
                'Delete a variable'
            );
            button.userMenu = helpMenu;
            button.selector = 'deleteVariable';
            button.showHelp = BlockMorph.prototype.showHelp;
            blocks.push(button);
        }

        blocks.push('-');

        varNames = this.variables.allNames();
        if (varNames.length > 0) {
            varNames.forEach(function (name) {
                blocks.push(variableWatcherToggle(name));
                blocks.push(variableBlock(name));
            });
            blocks.push('-');
        }

        blocks.push(block('doSetVar'));
        blocks.push(block('doChangeVar'));
        blocks.push(block('doShowVar'));
        blocks.push(block('doHideVar'));
        blocks.push(block('doDeclareVariables'));

    // inheritance:

        if (StageMorph.prototype.enableInheritance) {
            blocks.push('-');
            blocks.push(block('doDeleteAttr'));
        }

    ///////////////////////////////

        blocks.push('=');

        blocks.push(block('reportNewList'));
        blocks.push('-');
        blocks.push(block('reportCONS'));
        blocks.push(block('reportListItem'));
        blocks.push(block('reportCDR'));
        blocks.push('-');
        blocks.push(block('reportListLength'));
        blocks.push(block('reportListContainsItem'));
        blocks.push('-');
        blocks.push(block('doAddToList'));
        blocks.push(block('doDeleteFromList'));
        blocks.push(block('doInsertInList'));
        blocks.push(block('doReplaceInList'));

    // for debugging: ///////////////

        if (this.world().isDevMode) {
            blocks.push('-');
            txt = new TextMorph(localize(
                'development mode \ndebugging primitives:'
            ));
            txt.fontSize = 9;
            txt.setColor(this.paletteTextColor);
            blocks.push(txt);
            blocks.push('-');
            blocks.push(block('reportMap'));
            blocks.push('-');
            blocks.push(block('doForEach'));
            blocks.push(block('doShowTable'));
        }

    /////////////////////////////////

        blocks.push('=');

        if (StageMorph.prototype.enableCodeMapping) {
            blocks.push(block('doMapCodeOrHeader'));
            blocks.push(block('doMapStringCode'));
            blocks.push(block('doMapListCode'));
            blocks.push('-');
            blocks.push(block('reportMappedCode'));
            blocks.push('=');
        }

        button = new PushButtonMorph(
            null,
            function () {
                var ide = myself.parentThatIsA(IDE_Morph),
                    stage = myself.parentThatIsA(StageMorph);
                new BlockDialogMorph(
                    null,
                    function (definition) {
                        if (definition.spec !== '') {
                            if (definition.isGlobal) {
                                stage.globalBlocks.push(definition);
                            } else {
                                myself.customBlocks.push(definition);
                            }
                            ide.flushPaletteCache();
                            ide.refreshPalette();
                            new BlockEditorMorph(definition, myself).popUp();
                        }
                    },
                    myself
                ).prompt(
                    'Make a block',
                    null,
                    myself.world()
                );
            },
            'Make a block'
        );
        button.userMenu = helpMenu;
        button.selector = 'addCustomBlock';
        button.showHelp = BlockMorph.prototype.showHelp;
        blocks.push(button);
    }
    return blocks;
};

SpriteMorph.prototype.bounceOffEdge = function () {
    // taking nested parts into account
    var stage = this.parentThatIsA(StageMorph),
        fb = this.nestingBounds(),
        dirX,
        dirY;

    if (!stage) {return null; }
    if (stage.bounds.containsRectangle(fb)) {return null; }

    dirX = Math.cos(radians(this.heading - 90));
    dirY = -(Math.sin(radians(this.heading - 90)));

    if (fb.left() < stage.left()) {
        dirX = Math.abs(dirX);
    }
    if (fb.right() > stage.right()) {
        dirX = -(Math.abs(dirX));
    }
    if (fb.top() < stage.top()) {
        dirY = -(Math.abs(dirY));
    }
    if (fb.bottom() > stage.bottom()) {
        dirY = Math.abs(dirY);
    }

    this.setHeading(degrees(Math.atan2(-dirY, dirX)) + 90);

};

// Caches

var Cache;

Cache.prototype = {};
Cache.prototype.constructor = Cache;
Cache.uber = Object.prototype;

function Cache () {
    this.init();
};

Cache.prototype.init = function () {
    this.materials = [];
    this.geometries = { stitch: [], stitchPoint: [], densityPoint: [], };
};

Cache.prototype.clear = function () {
    this.init();
};

Cache.prototype.addMaterial = function (material) {
    this.materials.push(material);
};

Cache.prototype.findMaterial = function (color, opacity) {
    return detect(
            this.materials,
            function (each) {
                return each.color.equals(color) && each.opacity === opacity;
            });
};

Cache.prototype.addGeometry = function (type, geometry, params) {
    this.geometries[type].push({ params: params, geometry: geometry });
};

Cache.prototype.findGeometry = function (type, params) {

    var geometry = detect(
            this.geometries[type],
            function (each) {
                return (each.params.length === params.length)
                    && each.params.every(function (element, index) {
                        return element === params[index];
                    })
            });

    if (geometry) {
        return geometry.geometry;
    } else {
        return null;
    }
};
