(function(_, Backbone, SumOfUs, undefined){

    //TrackNodes represent locations on the track, they can be connected to other nodes.
    //TrackSegments represent larger sections of the track, like roads or crossings. 
    //They consist of multiple nodes, and can be connected together.
    //Tracks represent the whole track, they consist of several segments.

    var TrackNode = Backbone.Model.extend({
        defaults : { occupied : false },

	initialize : function(){
	    if(this.get("directions") === undefined){
                this.set("directions",[]);
	    };
	    this.set("connections",[]);
	},
        
        changeHighlight : function(setting){
	   this.set("highlighted", setting);
	},

	changeOccupied : function(setting){
	   this.set("occupied",setting);
	},

	isOccupied : function(){
	   return this.get("occupied");
	},

	addConnection : function(node, inDir, outDir){
	    var connections = this.get("connections");
	    connections.push({ node : node, 
	                       inDir : inDir,
			       outDir : outDir 
			     });
            this.set("connections",connections);

	},

	connect : function(otherNode, inDirs, outDir, otherInDirs, otherOutDir){
	    var directions = this.get("directions");
	    var otherDirections = otherNode.get("directions");
	    if(otherDirections.indexOf(outDir) === -1){
	        throw "Invalid outDir";
	    }
	    if(directions.indexOf(otherOutDir) === -1){
	        throw "Invalid otherOutDir";
	    }

	    for each (dir in inDirs){
	        if(directions.indexOf(dir) === -1){
		    throw "Invalid inDir";
		}
	        this.addConnection(otherNode, dir, outDir);
	    }
	    for each (dir in otherInDirs){
	        if(otherDirections.indexOf(dir) === -1){
		    throw "Invalid otherInDir";
		}
	        otherNode.addConnection(this, dir, otherOutDir);
            }
	},

	links : function(direction){
	    var res = [];
	    for each (con in this.get("connections")){
	        if(direction === con.inDir || direction === undefined){
		    res.push({ node : con.node, direction : con.outDir });
		}
	    }
	    return res;
	},
    });

    var TrackSegment = Backbone.Model.extend({
        //A note on creating new TrackSegments:
	//TrackSegments should have end points to connect them to other segments.
	//Each endpoint should have the following atributes
	//  * leavingDirs, a list of all directions from which you can leave the segment
	//  * incomingDir, the direction in which you enter the segment
	//  * nodes, a list of the the nodes in the endpoint. nodes[0] should be the
	//           left most one (when viewed from inside the segment).
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
	    for(var i = 0; i < length; i++){
	        nodes.push([]);
		for(var j = 0; j < width; j++){
		    nodes[i].push(new TrackNode({directions : ["one->two","two->one"]}));
		}
	    }
	    
	    for(var i = 0; i < length; i++){
	        for(var j = 0; j < width; j++){
		    if(i < length - 1){
		        nodes[i][j].connect(nodes[i+1][j],["one->two"],"one->two",
		                                          ["two->one"],"two->one");
		    }
		    if(j < width - 1){
		        nodes[i][j].connect(nodes[i][j+1],["one->two"],"one->two",
			                                  ["one->two"],"one->two");
		        nodes[i][j].connect(nodes[i][j+1],["two->one"],"two->one",
			                                  ["two->one"],"two->one");
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
	    this.set("endPoints",endPoints);
	},

	createAsCrossing : function(args){
	    if(args.height == undefined || args.width == undefined){
	        throw "No height or width specified";
	    }
	    var height = args.height;
	    var width = args.width;
	    var nodes = [];
	    for(var i = 0; i < height; i++){
	        nodes.push([]);
		for(var j = 0; j < width; j++){
		    nodes[i].push(new TrackNode({directions : ["north","east","south","west"]}));
		}
	    }
	    for(var i = 0; i < height; i++){
	        for(var j = 0; j < width; j++){
		    if(i < height - 1){
		        nodes[i][j].connect(nodes[i+1][j],["north","east","west"],"north",
		                                          ["east","south","west"],"south");
		    }
		    if(j < width - 1){
		        nodes[i][j].connect(nodes[i][j+1],["north","east","south"],"east",
			                                  ["north","south","west"],"west");
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
	    this.set("endPoints",endPoints);
	}
    });

    var Track = Backbone.Model.extend({
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
	        endpoint1.nodes[i].connect(endpoint2.nodes[size-1-i],
		                           endpoint1.leavingDirs,
					   endpoint2.incomingDir,
					   endpoint2.leavingDirs,
					   endpoint1.incomingDir);
	    }
	},

	getReachableNodes : function(startingNode, startingDirection, speed){
	    var res = [{node : startingNode, direction : startingDirection, speed : 0}];
	    var current = 0;

	    while(current < res.length && res[current].speed < speed){
	        var links = res[current].node.links(res[current].direction);
		for each(link in links){
		    var visited = false;
		    for each(item in res){
		        if(item.node == link.node){
			    visited = true;
			    break;
			}
		    }
		    if(!visited){
		        res.push({node : link.node, direction : link.direction, speed : res[current].speed+1});
		    }
		}
		current +=1;
	    }
	    return res;
	}
    });

    SumOfUs.TrackNode = TrackNode;
    SumOfUs.TrackSegment = TrackSegment;
    SumOfUs.Track = Track;
})(_,Backbone, SumOfUs)
