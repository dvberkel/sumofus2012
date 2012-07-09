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
	    this.set("position", position);
	    this.set("direction", direction);
	    this.set("speed", speed);
	},

        changeHighlight : function(setting){
	   this.set("highlighted", setting);
	}
    });

    SumOfUs.Car = Car;
})(_, Backbone, SumOfUs);
