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
    });

    var Track = Backbone.Model.extend({
    });

    SumOfUs.TrackNode = TrackNode;
    SumOfUs.TrackSegment = TrackSegment;
    SumOfUs.Track = Track;
})(_,Backbone, SumOfUs)
