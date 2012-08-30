(function(_, Backbone, SumOfUs, undefined){
    var Game = Backbone.Model.extend({
        defaults : {
	    numberOfTeams : 4,
	    carsPerTeam : 2,
	    roundsCompleted : 0,
	    playerDefaultMaxSpeed : 5,
	    playerDefaultAcceleration : 1,
	},

	initialize : function(){
	    if(this.get("track") == undefined){
	        throw "Can't create a game without a track";
	    }
	    var playerCars = [];
	    for(var team = 0; team < this.get("numberOfTeams"); team++){
	        var cars = [];
	        for(var car = 0; car < this.get("carsPerTeam"); car++){
	            cars.push(new SumOfUs.Car({maxSpeed : this.get("playerDefaultMaxSpeed"),
	                                       acceleration : this.get("playerDefaultAcceleration")}));
	        }
	        playerCars.push(cars);
	    }
	    this.set("playerCars", playerCars);
	    this.set("currentTurn", [0,0]);
	    this.set("status","not started");
        },

	assignLocationToPlayerCar : function(teamNumber, carNumber, position, direction){
	    var car = this.get("playerCars")[teamNumber][carNumber];
	    car.moveTo(position, direction, 1);
	},

	start : function(){
	    var cars = this.get("playerCars");
	    for(var team = 0; team < this.get("numberOfTeams"); team++){
	        for(var car = 0; car < this.get("carsPerTeam"); car++){
		    if(cars[team][car].get("position") == undefined){
		        throw "Can't start when not all cars have a position";
		    }
		}
	    }
	    if(this.get("status") == "not started"){
	       this.set("currentTurn", [0,0]);
	       this.set("roundsCompleted", 0);
	    }

	    this.setupNextTurn();
	},

	setupNextTurn : function(){
	    var turn = this.get("currentTurn");
	    var car = this.get("playerCars")[turn[0]][turn[1]]
	    if(this.get("roundsCompleted") > 0){
	        car.increaseSpeed();
	    }
	    var potentialMoves = this.get("track").getReachableNodes(
	                                                         car.get("position"),
								 car.get("direction"),
								 car.get("speed") 
								    );
            this.set("potentialMoves",potentialMoves);
	    for each(var move in potentialMoves){
	       move.node.changeHighlight(true);
	    }
	    car.changeHighlight(true);
	    this.set("status","waiting for player car move");
	},

	checkIfMoveIsValid : function(node){
	    var turn = this.get("currentTurn");
	    var car = this.get("playerCars")[turn[0]][turn[1]]
	    var potentialMoves = this.get("potentialMoves");
	    var goodMove = false;
	    for each(var move in potentialMoves){
	        if(move.node == node){
 		    goodMove = true;
		    this.set("selectedMove", move);
 		    break;
	        }
	    }
	    if(!goodMove){
	        return;
            }
	    
	    for each(var move in potentialMoves){
	        if(move.node != node){
	            move.node.changeHighlight(false);
		}
	    }
	    this.set("status", "waiting for confirmation of car move");
	},

	handlePlayerCarMove : function(node){
	    var turn = this.get("currentTurn");
	    var car = this.get("playerCars")[turn[0]][turn[1]]
	    var move = this.get("selectedMove");
	    if(move.node == node){
                car.moveTo(move.node, move.direction, move.speed, move.passedCheckpoints);
		node.changeHighlight(false);
		car.changeHighlight(false);

		this.advanceTurn();
		this.setupNextTurn();
            } else {
		for each(var potentialMove in this.get("potentialMoves")){
		   potentialMove.node.changeHighlight(true);
		}
		this.set("status", "waiting for player car move");
	    }
        },

	advanceTurn : function(){
	    var turn = this.get("currentTurn");
	    if(turn[1] < this.get("carsPerTeam")-1){
	        turn[1] += 1;
		this.set("currentTurn",turn);
	    } else if(turn[0] < this.get("numberOfTeams")-1){ 
	        turn[0] += 1;
		turn[1] = 0;
		this.set("currentTurn",turn);
	    } else {
	        this.set("currentTurn",[0,0]);
		this.set("roundsCompleted", this.get("roundsCompleted")+1);
		this.completedARound();
	    }
	},

	completedARound : function(){
	    this.get("track").advanceNonPlayerCars();
	},

	playerClickedOnNode : function(node){
	    if(this.get("status") == "waiting for player car move"){
	        this.checkIfMoveIsValid(node);
	    } else if(this.get("status") == "waiting for confirmation of car move"){
	        this.handlePlayerCarMove(node);
	    }
	}


    });

    SumOfUs.Game = Game;
})(_, Backbone, SumOfUs);
