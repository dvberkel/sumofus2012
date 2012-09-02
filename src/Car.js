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
	    delayChance : 0,
            color : undefined,
	    upgradedSpeed : 6,
	    upgradedAcceleration : 2
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
	    if(position.isOccupied()){
	        if(speed != 0 || position != this.get("position")){
  	            throw "Can't move to an occupied position";
		}
	    }
	    if(direction != undefined && position.get("directions").indexOf(direction) == -1){
	        throw "Can't move in that direction";
	    }
	    var currentPos = this.get("position");
	    if(currentPos != undefined){
	        currentPos.changeOccupied(undefined);
	    }
	    this.set("position", position);
	    this.set("direction", direction);
	    this._changeSpeedTo(speed);
	    position.changeOccupied(this);

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
	},

	upgradeSpeed : function(){
	    this.set("maxSpeed", this.get("upgradedSpeed"));
	},

	upgradeAcceleration : function(){
	   this.set("acceleration", this.get("upgradedAcceleration"));
	},

	hasUpgradedSpeed : function(){
	    return this.get("maxSpeed") == this.get("upgradedSpeed");
	},

	hasUpgradedAcceleration : function(){
	    return this.get("acceleration") == this.get("upgradedAcceleration");
	}
    });

	var CarView = Backbone.View.extend({
		initialize : function(){
			this.element = this.Car();

			this.model.bind("change", function(){
				this.render();
			}, this);
		},

		Car : function() {
			var position = this.options.position;
			if (this.model.get("speed") != undefined)
				var speed = this.model.get("speed");
			else
				var speed = '+';
			var angle = this.options.angle;
			var carColor = this.model.get("color");

			/* Foundation of car */
			var carSet = this.paper().set();
			var carObject = this.paper().rect(
				position.x+1, position.y+1, 40, 20, 1
			);
			carObject.attr("fill", carColor);
			carObject.attr("stroke", "black");
			carSet.push(carObject);

			if (this.model.hasUpgradedSpeed()) {
				carObject = this.paper().rect(
					position.x+1, position.y+8, 40, 10
				);
				carObject.attr("stroke", "black");
				carObject.attr("fill", "black");
				carSet.push(carObject);
			}


			/* Roof of car */
			carObject = this.paper().rect(
				position.x+11, position.y+3, 20, 16, 2
			);
			carObject.attr("fill", "lightgrey");
			carObject.attr("stroke", "black");
			carSet.push(carObject);

			/* Fire-up this car with some awesome wheels */
			carObject = this.paper().rect(
				position.x+5, position.y, 7, 1
			);
			carObject.attr("fill", "black");
			carSet.push(carObject);

			carObject = this.paper().rect(
				position.x+5, position.y+21, 7, 1
			);
			carObject.attr("fill", "black");
			carSet.push(carObject);			

			carObject = this.paper().rect(
				position.x+30, position.y, 7, 1
			);
			carObject.attr("fill", "black");
			carSet.push(carObject);

			carObject = this.paper().rect(
				position.x+30, position.y+21, 7, 1
			);
			carObject.attr("fill", "black");
			carSet.push(carObject);

			/* Uitlaat */
			if (this.model.hasUpgradedSpeed()) {
				carObject = this.paper().rect(
					position.x, position.y+4, 1, 5
				);
				carObject.attr("fill", "black");
				carObject.attr("stroke", "black");
				carSet.push(carObject);

				carObject = this.paper().rect(
					position.x, position.y+17, 1, 5
				);
				carObject.attr("fill", "black");
				carObject.attr("stroke", "black");
				carSet.push(carObject);
			}

			/* Direction */
			carObject = this.paper().text(
				position.x+36, position.y+11, ">"
			);
			carSet.push(carObject);

			carSet.rotate(angle, position.x+21, position.y+11);

			carObject = this.paper().text(
				position.x+21, position.y+11, speed
			);
			carSet.push(carObject);

			return carSet;
		},

		paper : function() {
			return this.options.paper;
		},

		foo : function() {
		    console.log("foo");

		},

		render : function() {
			/* Do nothing */
		},
	});

	SumOfUs.Car = Car;
	SumOfUs.CarView = CarView;
})(_, Backbone, SumOfUs);
