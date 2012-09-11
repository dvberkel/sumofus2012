(function($, Raphael, SumOfUs, undefined){
	var requestAnimFrame = (function(){
		return  window.requestAnimationFrame   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			};
	})();

	$(function(){
		var paper = Raphael("viewport", 1000, 700);
		paper.rect(0, 0, 1000, 700).attr({ fill : "#ffffff" });

		var demoTrack = new SumOfUs.Track();

		var roads = []
		var crossings = []

		for (var i = 0; i < 4; i++) {
			roads.push(demoTrack.addSegment(
				"road", {width : 4, length : 4}
			));
			crossings.push(demoTrack.addSegment(
				"crossing", {width : 4, height : 4}
			));
		}	

		demoTrack.connectSegments(
			roads[0].get("endPoints").one, crossings[0].get("endPoints").north
		);
		demoTrack.connectSegments(
			roads[0].get("endPoints").two, crossings[1].get("endPoints").south
		);
		demoTrack.connectSegments(
			roads[1].get("endPoints").one, crossings[1].get("endPoints").east
		);
		demoTrack.connectSegments(
			roads[1].get("endPoints").two, crossings[2].get("endPoints").west
		);
		demoTrack.connectSegments(
			roads[2].get("endPoints").one, crossings[2].get("endPoints").south
		);
		demoTrack.connectSegments(
			roads[2].get("endPoints").two, crossings[3].get("endPoints").north
		);
		demoTrack.connectSegments(
			roads[3].get("endPoints").one, crossings[3].get("endPoints").west
		);
		demoTrack.connectSegments(
			roads[3].get("endPoints").two, crossings[0].get("endPoints").east
		);

		var demoGame = new SumOfUs.Game({
			track : demoTrack, 
			numberOfTeams : 2, 
			carsPerTeam : 2,
			secondsPerMove : 10
		});


		var nodes = roads[0].get("nodes");
		var cars = demoGame.get("playerCars");

		/* Assign colors to cars */
		for (var i = 0; i < cars[0].length; i++)
			cars[0][i].set("color", "red");
		for (var i = 0; i < cars[1].length; i++)
			cars[1][i].set("color", "yellow");

		demoGame.assignLocationToPlayerCar(0,0,nodes[0][0],"one->two");
		demoGame.assignLocationToPlayerCar(0,1,nodes[0][1],"one->two");
		demoGame.assignLocationToPlayerCar(1,0,nodes[0][2],"one->two");
		demoGame.assignLocationToPlayerCar(1,1,nodes[0][3],"one->two");

                var cars = demoGame.get("playerCars");
                demoGame.giveSpeedUpgradeTo(0,0);
                demoGame.giveSpeedUpgradeTo(1,0);
                demoGame.giveAccelerationUpgradeTo(1,0);
                demoGame.giveAccelerationUpgradeTo(0,1);


		new SumOfUs.CrossingView({
			model : crossings[0],
			callback : demoGame.playerClickedOnNode.bind(demoGame),
			paper : paper,
			beginPoint : {x : 10, y : 10},
			endPoint : {x : 200, y : 200},
		});

		new SumOfUs.RoadView({
			model : roads[0],
			callback  : demoGame.playerClickedOnNode.bind(demoGame),
			paper : paper,
			direction : "right",
			beginPoint : {x : 200, y : 15},
			endPoint : {x : 200 + 4*60, y : 15 + 4*45},
		});
		
		new SumOfUs.CrossingView({
			model : crossings[1],
			callback : demoGame.playerClickedOnNode.bind(demoGame),
			paper : paper,
			beginPoint : {x : 440, y : 10},
			endPoint : {x : 440 + 190, y : 10 + 190},
		});

		new SumOfUs.RoadView({
			model : roads[1],
			callback  : demoGame.playerClickedOnNode.bind(demoGame),
			paper : paper,
			direction : "down",
			beginPoint : {x : 625, y : 200},
			endPoint : {x : 445, y : 200 + 4 * 60},
		});
		
		new SumOfUs.CrossingView({
			model : crossings[2],
			callback : demoGame.playerClickedOnNode.bind(demoGame),
			paper : paper,
			beginPoint : {x : 440, y : 440},
			endPoint : {x : 440 + 190, y : 440 + 190},
		});

		new SumOfUs.RoadView({
			model : roads[2],
			callback  : demoGame.playerClickedOnNode.bind(demoGame),
			paper : paper,
			direction : "left",
			beginPoint : {x : 440, y : 445},
			endPoint : {x : 440 - 4*60, y : 445 + 4*45},
		});
		new SumOfUs.CrossingView({
			model : crossings[3],
			callback : demoGame.playerClickedOnNode.bind(demoGame),
			paper : paper,
			beginPoint : {x : 10, y : 440},
			endPoint : {x : 10 + 190, y : 440 + 190},
		});

		new SumOfUs.RoadView({
			model : roads[3],
			callback  : demoGame.playerClickedOnNode.bind(demoGame),
			paper : paper,
			direction : "up",
			beginPoint : {x : 15, y : 440},
			endPoint : {x : 15 + 4*45, y : 440 - 4*60},
		});

		var randomPositions = [
			{x : 250 + parseInt(Math.random() * 25), 
			 y : 250 + parseInt(Math.random() * 25)},
			{x : 375 + parseInt(Math.random() * 25), 
			 y : 250 + parseInt(Math.random() * 25)},
			{x : 250 + parseInt(Math.random() * 25), 
			 y : 375 + parseInt(Math.random() * 25)},
			{x : 375 + parseInt(Math.random() * 25), 
			 y : 375 + parseInt(Math.random() * 25)},
			{x : 700 + parseInt(Math.random() * 55), 
			 y : 100 + parseInt(Math.random() * 25)},
			{x : 700 + parseInt(Math.random() * 25), 
			 y : 200 + parseInt(Math.random() * 25)},
			{x : 700 + parseInt(Math.random() * 55), 
			 y : 300 + parseInt(Math.random() * 25)},
			{x : 700 + parseInt(Math.random() * 55), 
			 y : 400 + parseInt(Math.random() * 25)},
			{x : 700 + parseInt(Math.random() * 55), 
			 y : 500 + parseInt(Math.random() * 25)},
		];

		for (var i = 0; i < randomPositions.length; i++)
			new SumOfUs.TreeView({
				paper : paper,
				position : randomPositions[i],
				color : "lightgreen",
				ratio : 30,
			});
                
		cars[0][0].set("xyposition",{x:230,y:37.5});
                var carView = new SumOfUs.CarView({ model: cars[0][0],
                                                    paper : paper,
                                                    carWidth : 40,
                                                    carHeight : 25,
                                                    angle : 0});
                window.car = cars[0][0];                                     
                window.view = carView;

		cars[0][1].set("xyposition",{x:230,y:37.5 + 45});
                var carView = new SumOfUs.CarView({ model: cars[0][1],
                                                    paper : paper,
                                                    carWidth : 40,
                                                    carHeight : 25,
                                                    angle : 0});
                window.car = cars[0][0];                                     
                window.view = carView;
		cars[1][0].set("xyposition",{x:230,y:37.5 + 90});
                var carView = new SumOfUs.CarView({ model: cars[1][0],
                                                    paper : paper,
                                                    carWidth : 40,
                                                    carHeight : 25,
                                                    angle : 0});
                window.car = cars[0][0];                                     
                window.view = carView;
		cars[1][1].set("xyposition",{x:230,y:37.5 + 135});
                var carView = new SumOfUs.CarView({ model: cars[1][1],
                                                    paper : paper,
                                                    carWidth : 40,
                                                    carHeight : 25,
                                                    angle : 0});
                window.car = cars[0][0];                                     
                window.view = carView;
		
		demoGame.start();

		var timerView = new SumOfUs.TimerView({
		                     model: demoGame.get("timer"),
				     paper : paper, 
				     x : 840, 
				     y : 50,
				     height : 15,
				     width : 100 });



		(function loop(){
			requestAnimFrame(loop);
		})();
	});
})(jQuery, Raphael, SumOfUs);
