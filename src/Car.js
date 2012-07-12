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
