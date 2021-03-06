(function(_, Backbone, SumOfUs, undefined){
    var Game = Backbone.Model.extend({
        defaults : {
	    numberOfTeams : 4,
	    carsPerTeam : 2,
	    roundsCompleted : 0,
	    playerDefaultMaxSpeed : 5,
	    playerDefaultAcceleration : 1,
	    pointsPerCheckpoint : 10,
	    secondsPerMove : 30
	},

	initialize : function(){
	    if(this.get("track") == undefined){
	        throw "Can't create a game without a track";
	    }
	    var playerCars = [];
	    var scores = [];
	    for(var team = 0; team < this.get("numberOfTeams"); team++){
	        var cars = [];
		var teamscores = [];
	        for(var car = 0; car < this.get("carsPerTeam"); car++){
	            cars.push(new SumOfUs.Car({maxSpeed : this.get("playerDefaultMaxSpeed"),
	                                       acceleration : this.get("playerDefaultAcceleration")}));
		    teamscores.push(0);
	        }
	        playerCars.push(cars);
		scores.push(teamscores);
	    }
	    this.set("playerCars", playerCars);
	    this.set("scores",scores);
	    this.set("currentTurn", [0,0]);
	    this.set("status","not started");

	    if(this.get("checkpointOrder") == undefined){
	        this.set("checkpointOrder",["A","B"]);
	    }

	    this.set("timer",new SumOfUs.Timer());
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

	    if(turn[1] == 0){
	        this.startTimer();
	    }
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
		if(move.passedCheckpoints.length > 0){
		    this.recalculateScore(turn[0],turn[1]);
		}

		node.changeHighlight(false);
		car.changeHighlight(false);

		if(turn[1] == this.get("carsPerTeam")-1){
		    this.stopTimer();
		}
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
	},

	recalculateScore : function(team, car){
	    var passedCheckpoints = this.get("playerCars")[team][car].get("passedCheckpoints");
	    var checkpointOrder = this.get("checkpointOrder");
	    var pointsPerCheckpoint = this.get("pointsPerCheckpoint");
	    var score = 0;
	    var atCheckpoint = 0;
	    for(var i = 0; i < passedCheckpoints.length; i++){
	        if(passedCheckpoints[i] == checkpointOrder[atCheckpoint]){
		    score += pointsPerCheckpoint;
		    atCheckpoint += 1;
		    atCheckpoint %= checkpointOrder.length;
		}
	    }
	    var scores = this.get("scores");
	    scores[team][car] = score;
	    this.set("scores",scores);
	},

	giveSpeedUpgradeTo : function(team,car){
	    this.get("playerCars")[team][car].upgradeSpeed();
	},

	giveAccelerationUpgradeTo : function(team,car){
	    this.get("playerCars")[team][car].upgradeAcceleration();
	},

	pause : function(){
	    var currentStatus = this.get("status");
	    if(currentStatus == "paused"){
	        return;
	    }
	    this.set("prePausedStatus",currentStatus);
	    this.set("status","paused");
	},

	resume : function(){
	    if(this.get("status") == "paused"){
	        this.set("status",this.get("prePausedStatus"));
	    }
	},

	addNPC : function(node){
	    this.get("track").addNonPlayerCar(node,0);
	},

	timeOut : function(){
	    var status = this.get("status");
	    var turn = this.get("currentTurn");
	    var car = this.get("playerCars")[turn[0]][turn[1]]
	    if(status == "waiting for player car move"){
	        var potentialMoves = this.get("potentialMoves");
		for each(var move in potentialMoves){
		    move.node.changeHighlight(false);
		}
		car.changeHighlight(false);
	        while(this.get("currentTurn")[1] != this.get("carsPerTeam") -1){
		    this.advanceTurn();
		}
		this.advanceTurn();
		this.setupNextTurn();
	    } else if( status == "waiting for confirmation of car move"){
		var move = this.get("selectedMove");
		move.node.changeHighlight(false);
		car.changeHighlight(false);
	        while(this.get("currentTurn")[1] != this.get("carsPerTeam") -1){
		    this.advanceTurn();
		}
		this.advanceTurn();
		this.setupNextTurn();
	    }
	},

	startTimer : function(){
	    this.get("timer").start(this.get("secondsPerMove"),this.timeOut.bind(this));
	},

	stopTimer : function(){
	    this.get("timer").stop();
	},

	resumeTimer : function(){
	    this.get("timer").resume();
	}

    });

    SumOfUs.Game = Game;
})(_, Backbone, SumOfUs);
