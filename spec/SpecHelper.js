beforeEach(function() {
    this.addMatchers({
	toBeAt : function(expectedPosition) {
	    var actual = this.actual;
	    var position = actual.get("position");
	    return position === expectedPosition;
	},

	toHaveADefinedPosition : function() {
	    var car = this.actual;
	    var position = car.get("position");
	    return position !== jasmine.undefined;
	},

	toHaveADefinedDirection : function() {
	    var car = this.actual;
	    var direction = car.get("direction");
	    return direction !== jasmine.undefined;
	},

	toBeGoingInDirection : function(expectedDirection) {
	    var actual = this.actual;
	    var direction = actual.get("direction");
	    return direction === expectedDirection;
	},

	toHaveSpeed : function(expectedSpeed){
	    var actual = this.actual;
	    var speed = actual.get("speed");
	    return speed === expectedSpeed;
	},

	toHaveMaxSpeed : function(expectedMax){
	    var actual = this.actual;
	    var maxSpeed = actual.get("maxSpeed");
	    return maxSpeed === expectedMax;
	},

	toHaveAcceleration : function(expectedAcceleration){
	    var actual = this.actual;
	    var acceleration = actual.get("acceleration");
	    return acceleration === expectedAcceleration;
	},

        toBeHighlighted : function() {
	    return this.actual.get("highlighted");
        },

	toBeAnNPC : function() {
	    return this.actual.get("npc");
	},

	toHaveDelayChance : function(expectedChance) {
	    return this.actual.get("delayChance") === expectedChance;
	},

	toBeOccupiedBy : function(car){
	    var actual = this.actual;
	    return actual.get("occupiedBy") == car;
	},

	toBeOccupied : function(){
	    return this.actual.isOccupied();
	},

	toBeConnectedTo : function(node, inDir, outDir){
	    var actual = this.actual;
	    var links = actual.links(inDir);
	    for each (link in links){
	        if( link.node === node && link.direction === outDir){
		    return true;
		}
	    }
	    return false;
	},

	toBeACheckpoint : function(){
	    return this.actual.get("checkpoint") != undefined;
	},

	toBeCheckpoint : function(expectedCheckpoint){
	    return this.actual.get("checkpoint") === expectedCheckpoint;
	},

	toHavePassedCheckpoints : function(expectedCheckpoints){
	    var passedCheckpoints = this.actual.get("passedCheckpoints");
	    var length = passedCheckpoints.length;
	    if( length != expectedCheckpoints.length){
	        return false;
	    }
	    for(var i = 0; i < length; i++){
	        if( passedCheckpoints[i] != expectedCheckpoints[i]){
		    return false;
		}
	    }
	    return true;
	},

        toHaveNConnections : function(expectedNumberOfConnections) {
	    var trackNode = this.actual;
	    var actualNumberOfConnections = trackNode.get("connections").length;
	    return actualNumberOfConnections === expectedNumberOfConnections;
	},

        //To avoid Jasmine's recursive equality test that is used in toContain, here
        //are two non recursive variations.
        //This one matches elements of the list using ==.
        toContainSomethingEqualTo : function(expectedValue){
            var list = this.actual;
            for each(item in list){
                if(item == expectedValue){
                    return true;
                }
            }
            return false;
        },

        //This one will test all elements for the required properties.
        //Properties are matched with ==
        toContainSomethingWithProperties : function(expectedProperties){
            var list = this.actual;
            for each(item in list){
                var match = true;
                for (property in expectedProperties){
                    if(item[property] != expectedProperties[property]){
                        match = false;
                        break;
                    }
                }
                if(match){
                    return true;
                }
            }
            return false;
        },

	toBeAtTurn : function(expectedTurn){
	    var game = this.actual;
	    var turn = game.get("currentTurn");
	    return turn[0] == expectedTurn[0] && turn[1] == expectedTurn[1];
	},

	toHaveCompletedRounds : function(expectedRounds){
	    return this.actual.get("roundsCompleted") == expectedRounds;
	},

	toHaveStatus : function(expectedStatus){
	    return this.actual.get("status") == expectedStatus;
	}
    });
});
