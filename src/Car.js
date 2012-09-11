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
			var position = this.model.get("xyposition");
			if (this.model.get("speed") != undefined)
				var speed = this.model.get("speed");
			else
				var speed = '+';
			var angle = this.options.angle;
			var carColor = this.model.get("color");

			var carWidth = this.options.carWidth;
			var carHeight = this.options.carHeight;
			var bx = position.x - carWidth/2;
			var by = position.y - carHeight/2;

			/* Foundation of car */
			var carSet = this.paper().set();
			var carObject = this.paper().rect(
				bx+1, by+1, carWidth, carHeight-2, 2
			);
			carObject.attr("fill", carColor);
			carObject.attr("stroke", "black");
			carSet.push(carObject);

			if (this.model.hasUpgradedSpeed()) {
				carObject = this.paper().rect(
					bx+1, by + carHeight/4, carWidth, carHeight/2
				);
				carObject.attr("stroke", "black");
				carObject.attr("fill", "black");
				carSet.push(carObject);
			}


			/* Roof of car */
			carObject = this.paper().rect(
				bx + carWidth/4, by + 1/6*carHeight, carWidth/2, 4/6*carHeight, 2
			);
			carObject.attr("fill", "lightgrey");
			carObject.attr("stroke", "black");
			carSet.push(carObject);

			/* Fire-up this car with some awesome wheels */
			carObject = this.paper().rect(
				bx + carWidth/7, by, carWidth/5, 1
			);
			carObject.attr("fill", "black");
			carSet.push(carObject);

			carObject = this.paper().rect(
				bx + carWidth/7, by + carHeight-1, carWidth/5, 1
			);
			carObject.attr("fill", "black");
			carSet.push(carObject);			

			carObject = this.paper().rect(
				bx + 5/7*carWidth, by, carWidth/5, 1
			);
			carObject.attr("fill", "black");
			carSet.push(carObject);

			carObject = this.paper().rect(
				bx + 5/7*carWidth, by + carHeight-1, carWidth/5, 1
			);
			carObject.attr("fill", "black");
			carSet.push(carObject);

			/* Uitlaat */
			if (this.model.hasUpgradedSpeed()) {
				carObject = this.paper().rect(
					bx, by + 1/6*carHeight, 1, 1/6*carHeight
				);
				carObject.attr("fill", "black");
				carObject.attr("stroke", "black");
				carSet.push(carObject);

				carObject = this.paper().rect(
					bx, by + 4/5*carHeight, 1, 1/6*carHeight
				);
				carObject.attr("fill", "black");
				carObject.attr("stroke", "black");
				carSet.push(carObject);
			}

			/* Direction */
			carObject = this.paper().text(
				position.x + 3/8*carWidth, position.y, ">"
			);
			carSet.push(carObject);

			carSet.rotate(angle, position.x, position.y);

			carObject = this.paper().text(
				position.x, position.y, speed
			);
			carSet.push(carObject);
                        this.currentPosition = position;

			return carSet;
		},

		paper : function() {
			return this.options.paper;
		},

		foo : function() {
		    console.log("foo");

		},

		render : function() {
			var position = this.model.get("xyposition");
                        this.element.translate(position.x-this.currentPosition.x,
                                               position.y-this.currentPosition.y);

                        this.currentPosition = position;
                        return this;
		},
	});

	SumOfUs.Car = Car;
	SumOfUs.CarView = CarView;
})(_, Backbone, SumOfUs);
