describe("a Game", function(){
    var track;
    var game;
    var road;
    var nodes;
    var cars;

    beforeEach(function(){
	track = new SumOfUs.Track();
	road = track.addSegment("road",{ length:6, width:4, npcTraffic :"oneway"});
	var ends = road.get("endPoints");
	track.connectSegments(ends.one, ends.two);
	game = new SumOfUs.Game({track:track});
        nodes = road.get("nodes");
	cars = game.get("playerCars");
    });

    it("should have correct defaults", function(){
        expect(game).toHaveStatus("not started");
	expect(game).toBeAtTurn([0,0]);
	expect(game).toHaveCompletedRounds(0);
	expect(game.get("track")==track).toEqual(true);
	expect(game.get("numberOfTeams")).toEqual(4);
	expect(game.get("carsPerTeam")).toEqual(2);
	expect(game.get("playerDefaultMaxSpeed")).toEqual(5);
	expect(game.get("playerDefaultAcceleration")).toEqual(1);
	expect(game.get("pointsPerCheckpoint")).toEqual(10);
	expect(game.get("checkpointOrder")).toEqual(["A","B"]);
	var scores = game.get("scores");
	
	for(var team = 0; team < 4; team++){
	    for(var car = 0; car < 2; car++){
	       expect(cars[team][car]).not.toHaveADefinedDirection();
	       expect(cars[team][car]).not.toHaveADefinedPosition();
	       expect(cars[team][car]).toHaveMaxSpeed(5);
	       expect(cars[team][car]).toHaveAcceleration(1);

	       expect(scores[team][car]).toEqual(0);
	    }
	}
    });

    it("shouldn't be creatable without a track", function(){
        expect( (function(){ new SumOfUs.Game();}) ).toThrow();
    });

    it("should allow cars being assigned locations", function(){
        game.assignLocationToPlayerCar(0,0,nodes[0][0],"one->two");
        game.assignLocationToPlayerCar(2,1,nodes[0][1],"one->two");
	expect(cars[0][0]).toBeAt(nodes[0][0]);
	expect(cars[0][0]).toBeGoingInDirection("one->two");
	expect(cars[0][0]).toHaveSpeed(1);
	expect(cars[2][1]).toBeAt(nodes[0][1]);
	expect(cars[2][1]).toBeGoingInDirection("one->two");
	expect(cars[2][1]).toHaveSpeed(1);

	expect( (function(){game.assignLocationToPlayerCar(0,1,nodes[0][0],"one->two");}) ).toThrow();
	expect( (function(){game.assignLocationToPlayerCar(0,1,nodes[1][1],"foobar");}) ).toThrow();
    });

    it("should be startable once all cars have a location", function(){
        game = new SumOfUs.Game({track : track, numberOfTeams : 2, carsPerTeam : 1});
	expect( (function(){ game.start(); }) ).toThrow();
        game.assignLocationToPlayerCar(0,0,nodes[0][0],"one->two");
        game.assignLocationToPlayerCar(1,0,nodes[0][1],"one->two");
	game.start();
	expect(game).toHaveStatus("waiting for player car move");
	expect(game).toBeAtTurn([0,0]);
	expect(game).toHaveCompletedRounds(0);
    });

    describe("has functionality to let users move cars that", function(){
	it("should move cars according to user input", function(){
	    game = new SumOfUs.Game({track : track, numberOfTeams : 1, carsPerTeam : 2});
	    game.assignLocationToPlayerCar(0,0,nodes[2][2],"one->two");
	    game.assignLocationToPlayerCar(0,1,nodes[0][1],"one->two");
	    game.start();
	    var cars= game.get("playerCars");

	    game.playerClickedOnNode(nodes[3][2]);
	    game.playerClickedOnNode(nodes[3][2]);
	    expect(cars[0][0]).toBeAt(nodes[3][2]);
	});

	it("shouldn't move cars out of their range", function(){
	    game = new SumOfUs.Game({track : track, numberOfTeams : 1, carsPerTeam : 2});
	    game.assignLocationToPlayerCar(0,0,nodes[2][2],"one->two");
	    game.assignLocationToPlayerCar(0,1,nodes[0][1],"one->two");
	    var cars= game.get("playerCars");
	    game.start();

	    game.playerClickedOnNode(nodes[4][2]);
	    game.playerClickedOnNode(nodes[4][2]);
	    expect(cars[0][0]).toBeAt(nodes[2][2]);
	    expect(game).toBeAtTurn([0,0]);
	});

	it("shouldn't move a car after an attempt to cancel", function(){
	    game = new SumOfUs.Game({track : track, numberOfTeams : 1, carsPerTeam : 2});
	    game.assignLocationToPlayerCar(0,0,nodes[2][2],"one->two");
	    game.assignLocationToPlayerCar(0,1,nodes[0][1],"one->two");
	    game.start();
	    var cars= game.get("playerCars");

	    expect(game).toHaveStatus("waiting for player car move");
	    game.playerClickedOnNode(nodes[3][2]);
	    expect(game).toHaveStatus("waiting for confirmation of car move");
	    game.playerClickedOnNode(nodes[2][1]);
	    expect(game).toHaveStatus("waiting for player car move");
	    expect(cars[0][0]).toBeAt(nodes[2][2]);

	    game.playerClickedOnNode(nodes[3][2]);
	    expect(cars[0][0]).toBeAt(nodes[2][2]);
	    expect(game).toHaveStatus("waiting for confirmation of car move");
	    game.playerClickedOnNode(nodes[3][2]);
	    expect(game).toHaveStatus("waiting for player car move");
	    expect(cars[0][0]).toBeAt(nodes[3][2]);
	});


	it("should keep track of turns", function(){
	    game = new SumOfUs.Game({track : track, numberOfTeams : 2, carsPerTeam : 2});
	    game.assignLocationToPlayerCar(0,0,nodes[0][0],"one->two");
	    game.assignLocationToPlayerCar(0,1,nodes[0][1],"one->two");
	    game.assignLocationToPlayerCar(1,0,nodes[0][2],"one->two");
	    game.assignLocationToPlayerCar(1,1,nodes[0][3],"one->two");
	    game.start();
	    var cars= game.get("playerCars");

	    game.playerClickedOnNode(nodes[1][0]);
	    game.playerClickedOnNode(nodes[1][0]);
	    expect(cars[0][0]).toBeAt(nodes[1][0]);
	    expect(game).toBeAtTurn([0,1]);

	    game.playerClickedOnNode(nodes[1][1]);
	    game.playerClickedOnNode(nodes[1][1]);
	    expect(cars[0][1]).toBeAt(nodes[1][1]);
	    expect(game).toBeAtTurn([1,0]);

	    game.playerClickedOnNode(nodes[1][2]);
	    game.playerClickedOnNode(nodes[1][2]);
	    expect(cars[1][0]).toBeAt(nodes[1][2]);
	    expect(game).toBeAtTurn([1,1]);

	    game.playerClickedOnNode(nodes[1][3]);
	    game.playerClickedOnNode(nodes[1][3]);
	    expect(cars[1][1]).toBeAt(nodes[1][3]);
	    expect(game).toBeAtTurn([0,0]);
	    expect(game).toHaveCompletedRounds(1);
	});
	
	it("should accelerate cars each turn after the first", function(){
	    game = new SumOfUs.Game({track : track, numberOfTeams : 1, carsPerTeam : 1});
	    game.assignLocationToPlayerCar(0,0,nodes[0][0],"one->two");
	    game.start();
	    var cars= game.get("playerCars");

	    game.playerClickedOnNode(nodes[0][1]);
	    game.playerClickedOnNode(nodes[0][1]);
	    expect(cars[0][0]).toHaveSpeed(2);

	    game.playerClickedOnNode(nodes[0][3]);
	    game.playerClickedOnNode(nodes[0][3]);
	    expect(cars[0][0]).toHaveSpeed(3);

	    game.playerClickedOnNode(nodes[0][3]);
	    game.playerClickedOnNode(nodes[0][3]);
	    expect(cars[0][0]).toHaveSpeed(1);
	    expect(cars[0][0]).not.toHaveADefinedDirection();
	});

	it("should highlight possible moves", function(){
	    game = new SumOfUs.Game({track : track, numberOfTeams : 1, carsPerTeam : 1});
	    game.assignLocationToPlayerCar(0,0,nodes[0][1],"one->two");
	    game.start();

	    for(var i = 0; i < nodes.length; i++){
		for(var j = 0; j < nodes[i].length; j++){
		    if( (i==0 && j==0) || (i==0 && j==1) || (i==0 && j==2) || (i==1 && j==1)){
			expect(nodes[i][j]).toBeHighlighted();
		    } else {
			expect(nodes[i][j]).not.toBeHighlighted();
		    }
		}
	    }
	    game.playerClickedOnNode(nodes[1][1]);
	    game.playerClickedOnNode(nodes[1][1]);
	    for(var i = 0; i < nodes.length; i++){
		for(var j = 0; j < nodes[i].length; j++){
		    if( (i==1 && j==0) || (i==1 && j==1) || (i==1 && j==2) || (i==1 && j==3) ||
			(i==2 && j==0) || (i==2 && j==1) || (i==2 && j==2) || (i==3 && j==1)    ){
			expect(nodes[i][j]).toBeHighlighted();
		    } else {
			expect(nodes[i][j]).not.toBeHighlighted();
		    }
		}
	    }
	});

	it("should highlight the car to be moved", function(){
	    game = new SumOfUs.Game({track : track, numberOfTeams : 2, carsPerTeam : 1});
	    game.assignLocationToPlayerCar(0,0,nodes[0][0],"one->two");
	    game.assignLocationToPlayerCar(1,0,nodes[0][1],"one->two");
	    var cars = game.get("playerCars");
	    game.start();

	    expect(cars[0][0]).toBeHighlighted();
	    expect(cars[1][0]).not.toBeHighlighted();
	    game.playerClickedOnNode(nodes[1][0]);
	    expect(cars[0][0]).toBeHighlighted();
	    expect(cars[1][0]).not.toBeHighlighted();
	    game.playerClickedOnNode(nodes[1][0]);
	    expect(cars[0][0]).not.toBeHighlighted();
	    expect(cars[1][0]).toBeHighlighted();
	});

	it("should advance the npcs after the players have moved", function(){
	    track.addNonPlayerCar(nodes[0][3]);
	    track.addNonPlayerCar(nodes[2][3]);
	    track.addNonPlayerCar(nodes[4][3]);
	    game = new SumOfUs.Game({track : track, numberOfTeams : 2, carsPerTeam : 1});
	    game.assignLocationToPlayerCar(0,0,nodes[0][0],"one->two");
	    game.assignLocationToPlayerCar(1,0,nodes[0][1],"one->two");
	    game.start();

	    game.playerClickedOnNode(nodes[0][0]);
	    game.playerClickedOnNode(nodes[0][0]);
	    expect(nodes[0][3]).toBeOccupied();
	    expect(nodes[2][3]).toBeOccupied();
	    expect(nodes[4][3]).toBeOccupied();
	    expect(nodes[1][3]).not.toBeOccupied();
	    expect(nodes[3][3]).not.toBeOccupied();
	    expect(nodes[5][3]).not.toBeOccupied();
	    game.playerClickedOnNode(nodes[0][1]);
	    game.playerClickedOnNode(nodes[0][1]);
	    expect(nodes[1][3]).toBeOccupied();
	    expect(nodes[3][3]).toBeOccupied();
	    expect(nodes[5][3]).toBeOccupied();
	    expect(nodes[0][3]).not.toBeOccupied();
	    expect(nodes[2][3]).not.toBeOccupied();
	    expect(nodes[4][3]).not.toBeOccupied();

	    game.playerClickedOnNode(nodes[0][0]);
	    game.playerClickedOnNode(nodes[0][0]);
	    game.playerClickedOnNode(nodes[0][1]);
	    game.playerClickedOnNode(nodes[0][1]);
	    expect(nodes[0][3]).toBeOccupied();
	    expect(nodes[2][3]).toBeOccupied();
	    expect(nodes[4][3]).toBeOccupied();
	    expect(nodes[1][3]).not.toBeOccupied();
	    expect(nodes[3][3]).not.toBeOccupied();
	    expect(nodes[5][3]).not.toBeOccupied();
	});
    });

    describe("should have functionality for scorekeeping that", function(){
        it("should properly calculate scores", function(){
	    game = new SumOfUs.Game({track : track, 
	                             checkpointOrder : ["A","B","C"], 
				     pointsPerCheckpoint : 6});
            var cars = game.get("playerCars");
	    cars[0][0].set("passedCheckpoints", ["A","B","C","A","B"]);
	    cars[0][1].set("passedCheckpoints", ["B","A","C","A","B","A","C","B","A"]);
	    game.recalculateScore(0,0);
	    game.recalculateScore(0,1);
	    var scores = game.get("scores");
	    expect(scores[0][0]).toEqual(30);
	    expect(scores[0][1]).toEqual(24);
	});

	it("should update scores when cars pass checkpoints", function(){
	    track = new SumOfUs.Track();
	    var road1 = track.addSegment("road",{length:3,width:1,checkpoint:"A"});
	    var road2 = track.addSegment("road",{length:3,width:1,checkpoint:"B"});
	    track.connectSegments(road1.get("endPoints").one,road2.get("endPoints").two);
	    track.connectSegments(road1.get("endPoints").two,road2.get("endPoints").one);
	    var nodes1 = road1.get("nodes");
	    var nodes2 = road2.get("nodes");

	    game = new SumOfUs.Game({track : track, numberOfTeams : 1, carsPerTeam : 1});
	    game.assignLocationToPlayerCar(0,0,nodes1[0][0],"one->two");
	    game.start();

	    expect(game.get("scores")[0][0]).toEqual(0);
	    game.playerClickedOnNode(nodes1[1][0]);
	    game.playerClickedOnNode(nodes1[1][0]);
	    expect(game.get("scores")[0][0]).toEqual(10);

	    game.playerClickedOnNode(nodes2[0][0]);
	    game.playerClickedOnNode(nodes2[0][0]);
	    expect(game.get("scores")[0][0]).toEqual(10);

	    game.playerClickedOnNode(nodes1[0][0]);
	    game.playerClickedOnNode(nodes1[0][0]);
	    expect(game.get("scores")[0][0]).toEqual(20);

	    game.playerClickedOnNode(nodes2[0][0]);
	    game.playerClickedOnNode(nodes2[0][0]);
	    expect(game.get("scores")[0][0]).toEqual(30);
	});
    });

    describe("should have functionality for upgrading the cars that", function(){
        it("should allow a car's speed to be upgraded", function(){ 
	    game.giveSpeedUpgradeTo(0,0);
	    game.giveSpeedUpgradeTo(2,1);
	    expect(cars[0][0]).toBeUpgradedWithSpeed();
	    expect(cars[2][1]).toBeUpgradedWithSpeed();
	    expect(cars[0][1]).not.toBeUpgradedWithSpeed();
	    expect(cars[1][1]).not.toBeUpgradedWithSpeed();
	});

        it("should allow a car's acceleration to be upgraded", function(){
	    game.giveAccelerationUpgradeTo(0,0);
	    game.giveAccelerationUpgradeTo(2,1);
	    expect(cars[0][0]).toBeUpgradedWithAcceleration();
	    expect(cars[2][1]).toBeUpgradedWithAcceleration();
	    expect(cars[0][1]).not.toBeUpgradedWithAcceleration();
	    expect(cars[1][1]).not.toBeUpgradedWithAcceleration();
	});

    });
});
