(function(_, Backbone, SumOfUs, undefined){
    var Car = Backbone.Model.extend({
        defaults : {
	    speed : 0,
	    maxSpeed : 5,
	    acceleration : 1,
	    position : undefined,
	    direction : undefined,

	    highlighted  : false
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
	},

	decreaseSpeedTo : function(targetSpeed) {
	    var resultSpeed = Math.min(targetSpeed, this.get("speed"));

	    this._changeSpeedTo(resultSpeed);
	},

	moveTo : function(position, direction, speed){
	    var currentPos = this.get("position");
	    if(currentPos != undefined){
	        currentPos.changeOccupied(false);
	    }
	    if(position.isOccupied()){
	        throw "Can't move to an occupied position";
	    }
	    this.set("position", position);
	    this.set("direction", direction);
	    this.set("speed", speed);
	    position.changeOccupied(true);
	},

        changeHighlight : function(setting){
	   this.set("highlighted", setting);
	}
    });

    SumOfUs.Car = Car;
})(_, Backbone, SumOfUs);
