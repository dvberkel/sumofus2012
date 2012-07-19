(function(_, Backbone, SumOfUs, undefined){
    var Car = Backbone.Model.extend({
        defaults : {
	    speed : 0,
	    maxSpeed : 5,
	    acceleration : 1,
	    position : undefined,
	    direction : undefined,
	    highlighted  : false,
	    npc : false,
	    delayChance : 0
	},

	initialize : function(){
	    this.set("passedCheckpoints",[]);
	},

	increaseSpeed : function(){
	    this._changeSpeedWith(this.get("acceleration"));
	},

	_changeSpeedWith : function(delta){
	    var currentSpeed = this.get("speed");
	    
	    this._changeSpeedTo(currentSpeed + delta);
	},

	_changeSpeedTo : function(targetSpeed){
	    var resultSpeed = Math.max(Math.min(targetSpeed, this.get("maxSpeed")), 0);

	    this.set({"speed" : resultSpeed});
	    if( resultSpeed == 0 && !this.get("npc") ){
	        //undefined direction represents standing still so the car can turn around.
		//npc cars should not turn around and just stick to the track.
	        this.set({"direction" : undefined});
	    }
	},

	decreaseSpeedTo : function(targetSpeed) {
	    var resultSpeed = Math.min(targetSpeed, this.get("speed"));

	    this._changeSpeedTo(resultSpeed);
	},

	moveTo : function(position, direction, speed, checkpoints){
	    var currentPos = this.get("position");
	    if(currentPos != undefined){
	        currentPos.changeOccupied(false);
	    }
	    if(position.isOccupied()){
	        throw "Can't move to an occupied position";
	    }
	    this.set("position", position);
	    this.set("direction", direction);
	    this._changeSpeedTo(speed);
	    position.changeOccupied(true);

	    if(checkpoints != undefined){
	        var passedCheckpoints = this.get("passedCheckpoints");
		this.set("passedCheckpoints", passedCheckpoints.concat(checkpoints));
	    }
	},

	hesitate : function(){
	    if(Math.random() < this.get("delayChance")){
	        this._changeSpeedWith(-1);
	    }
	},

        changeHighlight : function(setting){
	   this.set("highlighted", setting);
	}
    });

    SumOfUs.Car = Car;
})(_, Backbone, SumOfUs);
