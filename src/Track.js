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
        initialize : function(type, args){
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
    });

    SumOfUs.TrackNode = TrackNode;
    SumOfUs.TrackSegment = TrackSegment;
    SumOfUs.Track = Track;
})(_,Backbone, SumOfUs)
