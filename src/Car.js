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
			var position = this.model.get("position").get("views")[0].getCenter();
			if (this.model.get("speed") != undefined)
				var speed = this.model.get("speed");
			else
				var speed = '+';
			var direction = this.model.get("direction");
			var angle = this.model.get("position").get("views")[0].getAngle(direction);
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
			this.carFoundation = carObject;			

			carSet.push(carObject);

			/* Direction */
			carObject = this.paper().text(
				position.x + 3/8*carWidth, position.y+0.5, ">"
			);
			carSet.push(carObject);
			
			/* Acceleration */
			this.upgradedAccelerationObject = this.paper().set();

			carObject = this.paper().rect(
				bx+1, by + 2/5*carHeight, carWidth, carHeight/5
			);
			carObject.attr("stroke", "black");
			carObject.attr("fill", "black");
			carSet.push(carObject);
			this.upgradedAccelerationObject.push(carObject);

			carObject = this.paper().text(
				position.x + 3/8*carWidth, position.y+0.5, ">"
			);
			carObject.attr("fill", "white");
			carObject.attr("stroke", "white");
			carSet.push(carObject);
			this.upgradedAccelerationObject.push(carObject);

			this.upgradedAccelerationObject.hide();


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

			/* Uitlaat - Speed upgrade */
			this.upgradedSpeedObject = this.paper().set();
			
			carObject = this.paper().rect(
				bx-1, by + 1/6*carHeight, 2, 1/6*carHeight
			);
			carObject.attr("fill", "black");
			carObject.attr("stroke", "black");
			carSet.push(carObject);
			this.upgradedSpeedObject.push(carObject);

			carObject = this.paper().rect(
				bx-1, by + 4/6*carHeight, 2, 1/6*carHeight
			);
			carObject.attr("fill", "black");
			carObject.attr("stroke", "black");
			carSet.push(carObject);
			this.upgradedSpeedObject.push(carObject);

			this.upgradedSpeedObject.hide();

			/* Transformations in correct direction */
			carSet.transform("...R"+angle+","+position.x+","+position.y);

			carObject = this.paper().text(
				position.x, position.y, speed
			);
			carSet.push(carObject);
			this.carSpeedNumber = carObject;

                        this.currentPosition = position;
			this.currentAngle = angle;

			return carSet;
		},

		paper : function() {
			return this.options.paper;
		},

		foo : function() {
		    console.log("foo");

		},

		render : function() {
			var position = this.model.get("position").get("views")[0].getCenter();
		
			var tx = position.x - this.currentPosition.x;
			var ty = position.y - this.currentPosition.y;
			this.element.transform("...T"+tx+","+ty);
			this.currentPosition = position;
			
			var direction = this.model.get("direction");
			var newAngle = this.model.get("position").get("views")[0].getAngle(direction);
			this.element.transform("...R"+(newAngle-this.currentAngle) 
			                         +","+position.x
						 +","+position.y);

			this.currentAngle = newAngle;
			
	
			if (this.model.get("speed") != undefined)
				var speed = this.model.get("speed");
			else
				var speed = '+';
			this.carSpeedNumber.remove();
			this.carSpeedNumber = this.paper().text(
				position.x, position.y, speed
			);

			if (this.carGlow != undefined)
				this.carGlow.remove();
			if (this.model.get("highlighted"))
				this.carGlow = this.carFoundation.glow({width : 10, color : "red"});
			
			if (this.model.hasUpgradedSpeed()) {
				this.upgradedSpeedObject.show();
			} else {
				this.upgradedSpeedObject.hide();
			}

			if (this.model.hasUpgradedAcceleration()) {
				this.upgradedAccelerationObject.show();
			} else {
				this.upgradedAccelerationObject.hide();
			}

                        return this;
		},
	});

	SumOfUs.Car = Car;
	SumOfUs.CarView = CarView;
})(_, Backbone, SumOfUs);
