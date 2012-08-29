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
		var paper = Raphael("viewport", 1000, 500);
		paper.rect(0, 0, 200+10*60, 200+4*40).attr({ fill : "#ffffff" });

		var demoTrack = new SumOfUs.Track();
		var demoRoad = demoTrack.addSegment(
			"road", {width : 4, length : 10, npcTraffic : "oneway"}
		);

		var demoGame = new SumOfUs.Game({
			track : demoTrack, 
			numberOfTeams : 2, 
			carsPerTeam : 2,
		});

		var ends = demoRoad.get("endPoints");
		
		demoTrack.connectSegments(ends.one, ends.two);

		var nodes = demoRoad.get("nodes");
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

		new SumOfUs.RoadView({
			model : demoRoad,
			callback  : demoGame.playerClickedOnNode.bind(demoGame),
			paper : paper,
			direction : "right",
			beginPoint : {x : 100, y : 100},
			endPoint : {x : 100 + 10*60, y : 100 + 4*40},
		});

		demoGame.start();

		(function loop(){
			requestAnimFrame(loop);
		})();
	});
})(jQuery, Raphael, SumOfUs);
