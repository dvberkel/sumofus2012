(function(_, Backbone, SumOfUs, undefined){

    //TrackNodes represent locations on the track, they can be connected to other nodes.
    //TrackSegments represent larger sections of the track, like roads or crossings. 
    //They consist of multiple nodes, and can be connected together.
    //Tracks represent the whole track, they consist of several segments.

    const NPC_DIRECTION = "npc"

    var TrackNode = Backbone.Model.extend({
        defaults : { occupiedBy : undefined,
		             highlighted : false},

	initialize : function(){
	    if(this.get("directions") === undefined){
                this.set("directions",[]);
	    };
	    this.set("connections",[]);
            this.set("views",[]);
	},
        
        changeHighlight : function(setting){
	   this.set("highlighted", setting);
	},

	changeOccupied : function(setting){
	   this.set("occupiedBy",setting);
	},

	isOccupied : function(){
	   return this.get("occupiedBy") != undefined;
	},

	addConnection : function(node, inDir, outDir){
	    var connections = this.get("connections");
            if( this.get("directions").indexOf(inDir) === -1){
                throw "Invalid inDir";
            }
            if( node.get("directions").indexOf(outDir) === -1){
                throw "Invalid outDir";
            }
	    if( (inDir == NPC_DIRECTION || outDir == NPC_DIRECTION) && inDir != outDir){
	        throw "Can't connect npc and player directions";
	    }
	    if(inDir == NPC_DIRECTION){
	        for each(item in connections){
		    if( item.inDir == NPC_DIRECTION){
		        throw "Can't have two exits for npcs";
		    }
		}
	    }
	    connections.push({ node : node, inDir : inDir, outDir : outDir});
            this.set("connections",connections);

	},

        connectTo: function(otherNode){
            var thisNode = this;
            return { along : function(inDir, outDir){
                         if(outDir == undefined){
                             outDir = inDir;
                         }
                         thisNode.addConnection(otherNode,inDir,outDir);
                         
                   }};
        },

	connectTwoWay : function(otherNode, inDirs, outDir, otherInDirs, otherOutDir){
	    var directions = this.get("directions");
	    var otherDirections = otherNode.get("directions");
	    for each (dir in inDirs){
	        this.addConnection(otherNode, dir, outDir);
	    }
	    for each (dir in otherInDirs){
	        otherNode.addConnection(this, dir, otherOutDir);
            }
	},

	links : function(direction){
	    var res = [];
	    for each (con in this.get("connections")){
	        if(direction === con.inDir || (direction === undefined && con.inDir != NPC_DIRECTION)){
		    res.push({ node : con.node, direction : con.outDir });
		}
	    }
	    return res;
	},

        addView : function(view){
            var views = this.get("views");
            views.push(view);
            this.set("views",views);
        }
    });

    var TrackSegment = Backbone.Model.extend({
        //A note on creating new TrackSegments:
	//TrackSegments should have end points to connect them to other segments.
	//Each endpoint should have the following atributes
	//  * leavingDirs: a list of all directions from which you can leave the segment
	//  * incomingDir: the direction in which you enter the segment
	//  * nodes: a list of the the nodes in the endpoint. nodes[0] should be the
	//           left most one (when viewed from inside the segment).
	//  * npcTraffic: what kind of npc traffic the endpoint supports. Should be one of the following:
	//                   - "in": allows npc traffic to come in along every lane;
	//                   - "out": allows npc traffic to go out along every lane;
	//                   - "twoway": allows npc traffic to come in along half the lanes 
	//                               and go out the other half.
        initialize : function(type, args){
	    this.set("type",type);
	    if(type == "road"){
	        this.createAsRoad(args);
	    } else if(type == "crossing"){
	        this.createAsCrossing(args);
	    } else {
  	        throw "Unknown TrackSegment type";
	    }
	},


	createAsRoad : function(args){
	    if(args.length == undefined || args.width == undefined){
	        throw "No length or width specified";
	    }
	    var length = args.length;
	    var width = args.width;
	    var nodes = [];
	    var dirs = ["one->two","two->one"];
	    
		this.set("length", length);
		this.set("width", width);

            if(args.npcTraffic == "oneway" || args.npcTraffic == "twoway"){
	        dirs.push(NPC_DIRECTION);
	    }
	    for(var i = 0; i < length; i++){
	        nodes.push([]);
		if( args.checkpoint != undefined && i == Math.floor(length/2)){
		    for(var j = 0; j < width; j++){
			nodes[i].push(new TrackNode({directions : dirs, checkpoint:args.checkpoint}));
		    }
		} else {
		    for(var j = 0; j < width; j++){
			nodes[i].push(new TrackNode({directions : dirs}));
		    }
		}
		
	    }
	    
	    for(var i = 0; i < length; i++){
	        for(var j = 0; j < width; j++){
		    if(i < length - 1){
		        nodes[i][j].connectTwoWay(nodes[i+1][j],["one->two"],"one->two",
		                                                ["two->one"],"two->one");
		    }
		    if(j < width - 1){
		        nodes[i][j].connectTwoWay(nodes[i][j+1],["one->two"],"one->two",
			                                        ["one->two"],"one->two");
		        nodes[i][j].connectTwoWay(nodes[i][j+1],["two->one"],"two->one",
			                                        ["two->one"],"two->one");
		    }
		}
	    }

	    if(args.npcTraffic == "oneway"){//creates npc routes in one -> two direction
	        for(var i = 0; i < length-1; i++){ 
		    for(var j = 0; j < width; j++){
		        nodes[i][j].connectTo(nodes[i+1][j]).along(NPC_DIRECTION);
		    }
		}
	    } else if(args.npcTraffic == "twoway"){
	        for(var i = 0; i < length-1; i++){
		    for(var j=0; j < width/2; j++){
		        nodes[i+1][j].connectTo(nodes[i][j]).along(NPC_DIRECTION);
		        nodes[i][width-1-j].connectTo(nodes[i+1][width-1-j]).along(NPC_DIRECTION);
		    }
		}
	    }
	    this.set("nodes",nodes);

	    var endPoints = {};
	    endPoints.one = {};
	    endPoints.one.leavingDirs = ["two->one"];
	    endPoints.one.incomingDir = "one->two";
	    endPoints.one.nodes = []
	    for(var i = 0; i < width; i++){
	        endPoints.one.nodes.push(nodes[0][width-1-i]);
	    }
	    endPoints.two = {};
	    endPoints.two.leavingDirs = ["one->two"];
	    endPoints.two.incomingDir = "two->one";
	    endPoints.two.nodes = []
	    for(var i = 0; i < width; i++){
	        endPoints.two.nodes.push(nodes[length-1][i]);
	    }
	    
	    if(args.npcTraffic == "oneway"){
	        endPoints.one.npcTraffic = "in";
		endPoints.two.npcTraffic = "out";
	    } else if(args.npcTraffic == "twoway"){
	        endPoints.one.npcTraffic = "twoway";
		endPoints.two.npcTraffic = "twoway";
	    }
	    this.set("endPoints",endPoints);
	},

	createAsCrossing : function(args){
	    if(args.height == undefined || args.width == undefined){
	        throw "No height or width specified";
	    }
	    var height = args.height;
	    var width = args.width;
	    var nodes = [];
	    var dirs = ["north","east","south","west"];
		
		this.set("height", height);
		this.set("width", width);

	    if(args.npcTraffic == "oneway" || args.npcTraffic == "twoway"){
	        dirs.push(NPC_DIRECTION);
	    }
	    for(var i = 0; i < height; i++){
	        nodes.push([]);
		for(var j = 0; j < width; j++){
		    nodes[i].push(new TrackNode({directions : dirs}));
		}
	    }
	    for(var i = 0; i < height; i++){
	        for(var j = 0; j < width; j++){
		    if(i < height - 1){
		        nodes[i][j].connectTwoWay(nodes[i+1][j],["north","east","west"],"north",
		                                                ["east","south","west"],"south");
		    }
		    if(j < width - 1){
		        nodes[i][j].connectTwoWay(nodes[i][j+1],["north","east","south"],"east",
			                                        ["north","south","west"],"west");
		    }
		}
	    }

	    if(args.npcTraffic == "oneway"){//creates west to east npc traffic routes
	        for(var i = 0; i < height; i++){
		    for(var j = 0; j < width - 1; j++){
		        nodes[i][j].connectTo(nodes[i][j+1]).along(NPC_DIRECTION);
		    }
		}
	    } else if(args.npcTraffic == "twoway"){
	        for(var i = 0; i < height / 2; i++){
		    for(var j = 0; j < width - 1; j++){
		        nodes[i][j].connectTo(nodes[i][j+1]).along(NPC_DIRECTION);
			nodes[height-1-i][j+1].connectTo(nodes[height-1-i][j]).along(NPC_DIRECTION);
		    }
		}
	    }
	    this.set("nodes",nodes);

	    var endPoints = {};
	    endPoints.north= {};
	    endPoints.north.leavingDirs = ["north","east","west"];
	    endPoints.north.incomingDir = "south";
	    endPoints.north.nodes = []
	    for(var i = 0; i < width; i++){
	        endPoints.north.nodes.push(nodes[height-1][i]);
	    }
	    endPoints.east = {};
	    endPoints.east.leavingDirs = ["north","east","south"];
	    endPoints.east.incomingDir = "west";
	    endPoints.east.nodes = []
	    for(var i = 0; i < height; i++){
	        endPoints.east.nodes.push(nodes[height-1-i][width-1]);
	    }
	    endPoints.south= {};
	    endPoints.south.leavingDirs = ["east","south","west"];
	    endPoints.south.incomingDir = "north";
	    endPoints.south.nodes = []
	    for(var i = 0; i < width; i++){
	        endPoints.south.nodes.push(nodes[0][width-1-i]);
	    }
	    endPoints.west = {};
	    endPoints.west.leavingDirs = ["north","south","west"];
	    endPoints.west.incomingDir = "east";
	    endPoints.west.nodes = []
	    for(var i = 0; i < height; i++){
	        endPoints.west.nodes.push(nodes[i][0]);
	    }

	    if(args.npcTraffic == "oneway"){
	        endPoints.east.npcTraffic = "out";
		endPoints.west.npcTraffic = "in";
	    } else if(args.npcTraffic == "twoway"){
	        endPoints.east.npcTraffic = "twoway";
		endPoints.west.npcTraffic = "twoway";
	    }
	    this.set("endPoints",endPoints);
	}
    });

    var Track = Backbone.Model.extend({
        defaults : {
	    npcMaxSpeed : 5,
	    npcDelayChance : 0
	},

        initialize : function (){
	    this.set("segments",[]);
	    this.set("nonPlayerCars", []);
	},

	addSegment : function(type, args){
	    var segment = new TrackSegment(type,args);
	    var segments = this.get("segments");
	    segments.push(segment);
	    this.set("segments",segments);
	    return segment;
	},

	connectSegments : function(endpoint1, endpoint2){
	    var size = endpoint1.nodes.length;
	    if( endpoint2.nodes.length != size){
	        throw "endpoints not of the same size";
	    }
	    for(var i = 0; i < size; i++){
	        endpoint1.nodes[i].connectTwoWay(endpoint2.nodes[size-1-i],
		                                 endpoint1.leavingDirs,
                                                 endpoint2.incomingDir,
					         endpoint2.leavingDirs,
					         endpoint1.incomingDir);
	    }

	    if(endpoint1.npcTraffic == "out" && endpoint2.npcTraffic == "in"){
	        for(var i = 0; i < size; i++){
		    endpoint1.nodes[i].connectTo(endpoint2.nodes[size-1-i]).along(NPC_DIRECTION);
		}
	    } else if(endpoint1.npcTraffic == "in" && endpoint2.npcTraffic == "out"){
	        for(var i = 0; i < size; i++){
		    endpoint2.nodes[i].connectTo(endpoint1.nodes[size-1-i]).along(NPC_DIRECTION);
		}
	    } else if(endpoint1.npcTraffic == "twoway" && endpoint2.npcTraffic == "twoway"){
	        for(var i = 0; i < size/2; i++){
		    endpoint1.nodes[size-1-i].connectTo(endpoint2.nodes[i]).along(NPC_DIRECTION);
		    endpoint2.nodes[size-1-i].connectTo(endpoint1.nodes[i]).along(NPC_DIRECTION);
		}
	    } else if(endpoint1.npcTraffic != undefined || endpoint2.npcTraffic != undefined){
	        throw "Trying to connect endpoints with incompatible npc traffic";
	    }

	},


	getReachableNodes : function(startingNode, startingDirection, speed){
	    var res = [{node : startingNode,
	                direction : startingDirection,
			speed : 0,
			passedCheckpoints : []}];
	    var current = 0;

	    while(current < res.length && res[current].speed < speed){
	        var links = res[current].node.links(res[current].direction);
		for each(link in links){
		    if(link.node.isOccupied()){
		        continue;
		    }
		    var visited = false;
		    for each(item in res){
		        if(item.node == link.node){
			    visited = true;
			    break;
			}
		    }
		    if(!visited){
		        var newCheckpoint = []
			var checkpoint = link.node.get("checkpoint");
			if(checkpoint != undefined){
			    newCheckpoint = [checkpoint];
			}
		        res.push({
			    node : link.node,
			    direction : link.direction,
			    speed : res[current].speed+1,
			    passedCheckpoints : res[current].passedCheckpoints.concat(newCheckpoint)
			    });
		    }
		}
		current +=1;
	    }
	    return res;
	},

	addNonPlayerCar : function(node,speed){
	    if(speed == undefined || speed > this.get("npcMaxSpeed") || speed < 0){
	        speed = this.get("npcMaxSpeed");
	    }

	    var car = new SumOfUs.Car({npc : true, 
	                               maxSpeed : this.get("npcMaxSpeed"),
				       delayChance : this.get("npcDelayChance")});
	    if(node.get("directions").indexOf(NPC_DIRECTION) == -1){
	        throw "Can't add npc car on node without npc direction";
	    }
	    car.moveTo(node, NPC_DIRECTION, speed);

	    var cars = this.get("nonPlayerCars");
	    cars.push(car);
	    this.set("nonPlayerCars", cars);
	},

	advanceNonPlayerCars : function(){
	    var cars = this.get("nonPlayerCars");
	    var length = cars.length;
	    var newPositions = []
	    for(var i = 0; i < length; i++){
	        cars[i].increaseSpeed();
		cars[i].hesitate();
		var reachableNodes = this.getReachableNodes(cars[i].get("position"),
		                                                cars[i].get("direction"),
								cars[i].get("speed"));
		newPositions.push(reachableNodes[reachableNodes.length-1]);
	    }

	    for(var i = 0; i < length; i++){
	        cars[i].moveTo(newPositions[i].node, newPositions[i].direction, newPositions[i].speed);
	    }
	}
    });
	
	var TrackNodeView = Backbone.View.extend({
		initialize : function() {
			this.element = this.TrackNode()
			
			this.model.bind("change", function() {
				this.render();
			}, this);
		},

		TrackNode : function() {
			var x = this.options.beginPoint.x;
			var y = this.options.beginPoint.y;
                        this.model.addView(this);
			var length = this.options.measures.length;
			var height = this.options.measures.height;
			var edge = this.options.measures.edge;

			var roadObject = this.paper().rect(x, y, length, height, edge);
			roadObject.attr("stroke", "gray");
			roadObject.attr("fill", "white");

			var callback = this.options.callback;
			var node = this.model;
			roadObject.click(function(){callback(node);});


			return roadObject;
		},

		paper : function() {
			return this.options.paper;
		},

		render : function() {
			if (this.trackGlow != undefined)
				this.trackGlow.remove();
			if (this.model.get("highlighted")) {
				this.trackGlow = this.element.glow({width : 10, color : "black"})
				//this.element.attr("fill", "gray");
			} 
			return this;
		},

                getCenter : function() {
                       return { x : this.options.beginPoint.x + this.options.measures.length/2,
                                y : this.options.beginPoint.y + this.options.measures.height/2 };
                },
                
		getAngle : function(direction) {
			if (this.options.direction == "crossing") {
			    return (direction == "east") ? 0 :
			           (direction == "south") ? 90 :
				   (direction == "west") ? 180 :
				   (direction == "north") ? 270 : 0;
				   
			}
			if(this.options.direction == "right"){
			    return (direction == "one->two") ? 0 :
			           (direction == "two->one") ? 180 : 0;
			}
			if(this.options.direction == "left"){
			    return (direction == "one->two") ? 180 :
			           (direction == "two->one") ? 0 : 0;
			}
			if(this.options.direction == "up"){
			    return (direction == "one->two") ? 270 :
			           (direction == "two->one") ? 90 : 0;
			}
			if(this.options.direction == "down"){
			    return (direction == "one->two") ? 90 :
			           (direction == "two->one") ? 270 : 0;
			}
		}

	});

	var RoadView = Backbone.View.extend({
		initialize : function() {
			this.element = this.Road();

			this.model.bind("change", function(){
				this.render();
			}, this);
		},

		rightRoad : function() {
			var direction  = this.options.direction;
			var beginPoint = this.options.beginPoint;
			var endPoint   = this.options.endPoint;
			var width      = this.model.get("width");
			var length     = this.model.get("length");

			var bx = beginPoint.x;
			var by = beginPoint.y;
			var ex = endPoint.x;
			var ey = endPoint.y;
			
			var roadSet = this.paper().set();
			var roadObject = this.paper().rect(
				bx, by-1, ex - bx, 1
			);
			roadObject.attr("stroke", "black");
			
			roadSet.push(roadObject);

			roadObject = this.paper().rect(
				bx, ey, ex - bx, 1
			);
			roadObject.attr("stroke", "black");

			roadSet.push(roadObject);
			var spaceWidth  = (ex - bx) / length;
			var spaceHeight = (ey - by) / width;

			/* Map over all TrackNodes. */
			for (var i = 0; i < length; i++) {
				for (var j = 0; j < width; j++) {
					var center = {
						x : bx + (i + 1/2)*spaceWidth,
						y : by + (j + 1/2)*spaceHeight,
					};
					var begin = {
						x : bx + i * spaceWidth,
						y : by + j * spaceHeight,
					};
				
					roadObject = new SumOfUs.TrackNodeView({
						model : this.model.get("nodes")[i][j],
						callback : this.options.callback,
						paper : this.options.paper,
						direction : this.options.direction,
						place : { xi : i, xj : j },
						beginPoint : { 
							x : begin.x + 4,
							y : begin.y + 4
						},
						measures : {
							length : spaceWidth - 8,
							height : spaceHeight - 8,
							edge : 2,
						},
						rotations : 0,
					});
					roadSet.push(roadObject);
	
				}
			}

			/* Marks */
			for (var j = 1; j < width; j++) {
				for (var i = 0; i < 2*length; i++) {
					var x = bx + (i + 1/2)/2 * spaceWidth;
					var y = by + j * spaceHeight;

					roadObject = this.paper().rect(
						x-5, y-1, 10, 2
					);
					roadObject.attr("fill", "black");
					roadSet.push(roadObject);
				}
			}

			return roadSet;
		},

		leftRoad : function() {
			var direction  = this.options.direction;
			var beginPoint = this.options.beginPoint;
			var endPoint   = this.options.endPoint;
			var width      = this.model.get("width");
			var length     = this.model.get("length");

			var bx = beginPoint.x;
			var by = beginPoint.y;
			var ex = endPoint.x;
			var ey = endPoint.y;
			
			var roadSet = this.paper().set();
			var roadObject = this.paper().rect(
				ex, ey-1, bx - ex, 1
			);
			roadObject.attr("stroke", "black");
			
			roadSet.push(roadObject);

			roadObject = this.paper().rect(
				ex, by, bx - ex, 1
			);
			roadObject.attr("stroke", "black");

			roadSet.push(roadObject);
			var spaceWidth  = (bx - ex) / length;
			var spaceHeight = (ey - by) / width;

			/* Map over all TrackNodes. */
			for (var i = 0; i < length; i++) {
				for (var j = 0; j < width; j++) {
					var center = {
						x : bx - (i + 1/2)*spaceWidth,
						y : by + (j + 1/2)*spaceHeight,
					};
					var begin = {
						x : bx - (i + 1) * spaceWidth,
						y : by + j * spaceHeight,
					};
				
					roadObject = new SumOfUs.TrackNodeView({
						model : this.model.get("nodes")[i][width-j-1],
						callback : this.options.callback,
						paper : this.options.paper,
						direction : this.options.direction,
						place : { xi : i, xj : j },
						beginPoint : { 
							x : begin.x + 4,
							y : begin.y + 4
						},
						measures : {
							length : spaceWidth - 8,
							height : spaceHeight - 8,
							edge : 2,
						},
						rotation : 180,
					});
					roadSet.push(roadObject);
	
				}
			}

			/* Marks */
			for (var j = 1; j < width; j++) {
				for (var i = 0; i < 2*length; i++) {
					var x = bx - (i + 1/2)/2 * spaceWidth;
					var y = by + j * spaceHeight;

					roadObject = this.paper().rect(
						x-5, y-1, 10, 2
					);
					roadObject.attr("fill", "black");
					roadSet.push(roadObject);
				}
			}

			return roadSet;
		},

		upRoad : function() {
			var direction  = this.options.direction;
			var beginPoint = this.options.beginPoint;
			var endPoint   = this.options.endPoint;
			var width      = this.model.get("width");
			var length     = this.model.get("length");

			var bx = beginPoint.x;
			var by = beginPoint.y;
			var ex = endPoint.x;
			var ey = endPoint.y;
			
			var roadSet = this.paper().set();
			var roadObject = this.paper().rect(
				bx-1, ey, 1, by - ey
			);
			roadObject.attr("stroke", "black");
			
			roadSet.push(roadObject);

			roadObject = this.paper().rect(
				ex, ey, 1, by - ey
			);
			roadObject.attr("stroke", "black");

			roadSet.push(roadObject);
			var spaceWidth  = (ex - bx) / width;
			var spaceHeight = (by - ey) / length;

			/* Map over all TrackNodes. */
			for (var i = 0; i < length; i++) {
				for (var j = 0; j < width; j++) {
					var center = {
						x : bx + (j + 1/2)*spaceWidth,
						y : by - (i + 1/2)*spaceHeight,
					};
					var begin = {
						x : bx + j * spaceWidth,
						y : by - (i + 1) * spaceHeight,
					};
				
					roadObject = new SumOfUs.TrackNodeView({
						model : this.model.get("nodes")[i][j],
						callback : this.options.callback,
						paper : this.options.paper,
						direction : this.options.direction,
						place : { xi : i, xj : j },
						beginPoint : { 
							x : begin.x + 4,
							y : begin.y + 4
						},
						measures : {
							length : spaceWidth - 8,
							height : spaceHeight - 8,
							edge : 2,
						},
						rotation : 270,
					});
					roadSet.push(roadObject);
	
				}
			}

			/* Marks */
			for (var j = 1; j < width; j++) {
				for (var i = 0; i < 2*length; i++) {
					var x = bx + j * spaceWidth;
					var y = by - (i + 1/2)/2 * spaceHeight;

					roadObject = this.paper().rect(
						x-1, y-5, 2, 10
					);
					roadObject.attr("fill", "black");
					roadSet.push(roadObject);
				}
			}

			return roadSet;
		},

		downRoad : function() {
			var direction  = this.options.direction;
			var beginPoint = this.options.beginPoint;
			var endPoint   = this.options.endPoint;
			var width      = this.model.get("width");
			var length     = this.model.get("length");

			var bx = beginPoint.x;
			var by = beginPoint.y;
			var ex = endPoint.x;
			var ey = endPoint.y;
			
			var roadSet = this.paper().set();
			var roadObject = this.paper().rect(
				bx-1, by, 1, ey - by
			);
			roadObject.attr("stroke", "black");
			
			roadSet.push(roadObject);

			roadObject = this.paper().rect(
				ex, by, 1, ey - by
			);
			roadObject.attr("stroke", "black");

			roadSet.push(roadObject);
			var spaceWidth  = (bx - ex) / width;
			var spaceHeight = (ey - by) / length;

			/* Map over all TrackNodes. */
			for (var i = 0; i < length; i++) {
				for (var j = 0; j < width; j++) {
					var center = {
						x : bx + (j + 1/2)*spaceWidth,
						y : by - (i + 1/2)*spaceHeight,
					};
					var begin = {
						x : bx - (j + 1) * spaceWidth,
						y : by + i * spaceHeight,
					};
				
					roadObject = new SumOfUs.TrackNodeView({
						model : this.model.get("nodes")[i][j],
						callback : this.options.callback,
						paper : this.options.paper,
						direction : this.options.direction,
						place : { xi : i, xj : j },
						beginPoint : { 
							x : begin.x + 4,
							y : begin.y + 4
						},
						measures : {
							length : spaceWidth - 8,
							height : spaceHeight - 8,
							edge : 2,
						},
						rotation : 90,
					});
					roadSet.push(roadObject);
	
				}
			}

			/* Marks */
			for (var j = 1; j < width; j++) {
				for (var i = 0; i < 2*length; i++) {
					var x = bx - j * spaceWidth;
					var y = by + (i + 1/2)/2 * spaceHeight;

					roadObject = this.paper().rect(
						x-1, y-5, 2, 10
					);
					roadObject.attr("fill", "black");
					roadSet.push(roadObject);
				}
			}

			return roadSet;
		},

		Road : function() {
			switch (this.options.direction) {
			case "right":
				return this.rightRoad();
				break;
			case "left":
				return this.leftRoad();
				break;
			case "up":
				return this.upRoad();
				break;
			case "down":
				return this.downRoad();
				break;
			}

		},

		paper : function() {
			return this.options.paper;
		},

		render : function() {
			/* pass */
		},
	});

	var CrossingView = Backbone.View.extend({
		initialize : function() {
			this.element = this.Crossing();

			this.model.bind("change", function(){
				this.render();
			}, this);
		},

		Crossing : function() {
			var direction  = this.options.direction;
			var beginPoint = this.options.beginPoint;
			var endPoint   = this.options.endPoint;
			var width      = this.model.get("width");
			var height     = this.model.get("height");

			var crossingSet = this.paper().set();
			
			var bx = beginPoint.x;
			var by = beginPoint.y;
			var ex = endPoint.x;
			var ey = endPoint.y;

			/* Foundation object */
			var crossingObject = this.paper().rect(
				bx, by, ex - bx, ey - by, 3
			);
			crossingObject.attr("stroke", "black");

			crossingSet.push(crossingObject);

			var spaceWidth  = (ex - bx) / height;
			var spaceHeight = (ey - by) / width;
		
			/* Seats in the crossing */
			for (var i = 0; i < width; i++) {
				for (var j = 0; j < height; j++) {
					var begin = {
						x : bx + i * spaceWidth,
						y : by + j * spaceHeight,
					};
					
					crossingObject = new SumOfUs.TrackNodeView({
						model : this.model.get("nodes")[height-1-j][i],
						callback : this.options.callback,
						paper : this.options.paper,
						direction : "crossing",
						place : { xi : i, xj : j },
						beginPoint : { 
							x : begin.x + 4,
							y : begin.y + 4
						},
						measures : {
							length : spaceWidth - 8,
							height : spaceHeight - 8,
							edge : 2,
						},
						rotations : 0,
					});
					
					crossingSet.push(crossingObject);
				}
			}

			/* Marks */
			for (var i = 1; i < width; i++) {
				for (var j = 0; j < 2*height; j++) {
					var x = bx + (j + 1/2)/2 * spaceWidth;
					var y = by + i * spaceHeight;

					crossingObject = this.paper().rect(
						x-5, y-1, 10, 2
					);
					crossingObject.attr("fill", "black");
					
					crossingSet.push(crossingObject);
				}
			}

			for (var i = 1; i < height; i++) {
				for (var j = 0; j < 2*width; j++) {
					var x = bx + i * spaceHeight;
					var y = by + (j + 1/2)/2 * spaceWidth;

					crossingObject = this.paper().rect(
						x-1, y-5, 2, 10
					);
					crossingObject.attr("fill", "black");

					crossingSet.push(crossingObject);
				}
			}

			return crossingSet;
		},

		paper : function() {
			return this.options.paper;
		},

		render : function() {
			/* pass */
		},
	});

    SumOfUs.NPC_DIRECTION = NPC_DIRECTION;
    SumOfUs.TrackNode = TrackNode;
    SumOfUs.TrackSegment = TrackSegment;
    SumOfUs.Track = Track;
	SumOfUs.RoadView = RoadView;
	SumOfUs.CrossingView = CrossingView;
	SumOfUs.TrackNodeView = TrackNodeView;
})(_,Backbone, SumOfUs)
