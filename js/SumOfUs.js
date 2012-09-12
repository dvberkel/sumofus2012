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
        var paper = Raphael("viewport", 1300, 830);
        paper.rect(0, 0, 1300, 830).attr({ fill : "#ffffff" });

	var demoTrack = new SumOfUs.Track({npcMaxSpeed : 4});

	var roads = [];
	var crossings = [];
	roads.push(demoTrack.addSegment("road", {width : 4, length : 9}));
	roads.push(demoTrack.addSegment("road", {width : 4, length : 3}));
	roads.push(demoTrack.addSegment("road", {width : 4, length : 3}));
	for(var i = 0; i < 6; i++){
	    roads.push(demoTrack.addSegment("road", {width : 4, length : 3, npcTraffic : "twoway"}));
	}
	for(var i = 0; i < 3; i++){
	    roads.push(demoTrack.addSegment("road", {width : 3, length : 5}));
	}
	for(var i = 0; i < 6; i++){
	    roads.push(demoTrack.addSegment("road", {width : 4, length : 3, npcTraffic : "twoway"}));
	}
	roads.push(demoTrack.addSegment("road", {width : 4, length : 3}));
	roads.push(demoTrack.addSegment("road", {width : 4, length : 3}));
	roads.push(demoTrack.addSegment("road", {width : 4, length : 9}));

	crossings.push(demoTrack.addSegment("crossing", {width : 4, height : 4}));
	crossings.push(demoTrack.addSegment("crossing", {width : 4, height : 4}));
	crossings.push(demoTrack.addSegment("crossing", {width : 3, height : 4, npcTraffic : "twoway"}));
	crossings.push(demoTrack.addSegment("crossing", {width : 4, height : 4, npcTraffic : "twoway"}));
	crossings.push(demoTrack.addSegment("crossing", {width : 3, height : 4, npcTraffic : "twoway"}));
	crossings.push(demoTrack.addSegment("crossing", {width : 4, height : 4, npcTraffic : "twoway"}));
	crossings.push(demoTrack.addSegment("crossing", {width : 3, height : 4, npcTraffic : "twoway"}));
	crossings.push(demoTrack.addSegment("crossing", {width : 3, height : 4, npcTraffic : "twoway"}));
	crossings.push(demoTrack.addSegment("crossing", {width : 4, height : 4, npcTraffic : "twoway"}));
	crossings.push(demoTrack.addSegment("crossing", {width : 3, height : 4, npcTraffic : "twoway"}));
	crossings.push(demoTrack.addSegment("crossing", {width : 4, height : 4, npcTraffic : "twoway"}));
	crossings.push(demoTrack.addSegment("crossing", {width : 3, height : 4, npcTraffic : "twoway"}));
	crossings.push(demoTrack.addSegment("crossing", {width : 4, height : 4}));
	crossings.push(demoTrack.addSegment("crossing", {width : 4, height : 4}));

	var roadCrossingConnections = [ { road : 0, rend : "one", crossing : 0, cend : "east" },
	                                { road : 0, rend : "two", crossing : 1, cend : "west" },
	                                { road : 1, rend : "one", crossing : 0, cend : "south" },
	                                { road : 1, rend : "two", crossing : 3, cend : "north" },
	                                { road : 2, rend : "one", crossing : 1, cend : "south" },
	                                { road : 2, rend : "two", crossing : 5, cend : "north" },
	                                { road : 3, rend : "two", crossing : 2, cend : "west" },
	                                { road : 4, rend : "one", crossing : 2, cend : "east" },
	                                { road : 4, rend : "two", crossing : 3, cend : "west" },
	                                { road : 5, rend : "one", crossing : 3, cend : "east" },
	                                { road : 5, rend : "two", crossing : 4, cend : "west" },
	                                { road : 6, rend : "one", crossing : 4, cend : "east" },
	                                { road : 6, rend : "two", crossing : 5, cend : "west" },
	                                { road : 7, rend : "one", crossing : 5, cend : "east" },
	                                { road : 7, rend : "two", crossing : 6, cend : "west" },
	                                { road : 8, rend : "one", crossing : 6, cend : "east" },
	                                { road : 9, rend : "one", crossing : 2, cend : "south" },
	                                { road : 9, rend : "two", crossing : 7, cend : "north" },
	                                { road : 10, rend : "one", crossing : 4, cend : "south" },
	                                { road : 10, rend : "two", crossing : 9, cend : "north" },
	                                { road : 11, rend : "one", crossing : 6, cend : "south" },
	                                { road : 11, rend : "two", crossing : 11, cend : "north" },
	                                { road : 12, rend : "two", crossing : 7, cend : "west" },
	                                { road : 13, rend : "one", crossing : 7, cend : "east" },
	                                { road : 13, rend : "two", crossing : 8, cend : "west" },
	                                { road : 14, rend : "one", crossing : 8, cend : "east" },
	                                { road : 14, rend : "two", crossing : 9, cend : "west" },
	                                { road : 15, rend : "one", crossing : 9, cend : "east" },
	                                { road : 15, rend : "two", crossing : 10, cend : "west" },
	                                { road : 16, rend : "one", crossing : 10, cend : "east" },
	                                { road : 16, rend : "two", crossing : 11, cend : "west" },
	                                { road : 17, rend : "one", crossing : 11, cend : "east" },
	                                { road : 18, rend : "one", crossing : 8, cend : "south" },
	                                { road : 18, rend : "two", crossing : 12, cend : "north" },
	                                { road : 19, rend : "one", crossing : 10, cend : "south" },
	                                { road : 19, rend : "two", crossing : 13, cend : "north" },
	                                { road : 20, rend : "one", crossing : 12, cend : "east" },
	                                { road : 20, rend : "two", crossing : 13, cend : "west" } ];
	for each(var con in roadCrossingConnections){
	    demoTrack.connectSegments(roads[con.road].get("endPoints")[con.rend],
	                              crossings[con.crossing].get("endPoints")[con.cend]);
	}
	demoTrack.connectSegments(roads[3].get("endPoints").one,roads[8].get("endPoints").two);
	demoTrack.connectSegments(roads[12].get("endPoints").one,roads[17].get("endPoints").two);

	demoTrack.addNonPlayerCar(roads[3].get("nodes")[0][0]);
	demoTrack.addNonPlayerCar(roads[3].get("nodes")[2][1]);
	demoTrack.addNonPlayerCar(roads[3].get("nodes")[0][2]);
	demoTrack.addNonPlayerCar(roads[3].get("nodes")[1][3]);
	demoTrack.addNonPlayerCar(crossings[2].get("nodes")[0][2]);
	demoTrack.addNonPlayerCar(crossings[2].get("nodes")[1][2]);
	demoTrack.addNonPlayerCar(crossings[2].get("nodes")[3][1]);
	demoTrack.addNonPlayerCar(roads[4].get("nodes")[1][1]);
	demoTrack.addNonPlayerCar(crossings[3].get("nodes")[0][1]);
	demoTrack.addNonPlayerCar(crossings[3].get("nodes")[1][3]);
	demoTrack.addNonPlayerCar(crossings[3].get("nodes")[3][0]);
	demoTrack.addNonPlayerCar(roads[5].get("nodes")[1][1]);
	demoTrack.addNonPlayerCar(crossings[4].get("nodes")[3][1]);
	demoTrack.addNonPlayerCar(crossings[4].get("nodes")[0][1]);
	demoTrack.addNonPlayerCar(roads[6].get("nodes")[2][1]);
	demoTrack.addNonPlayerCar(roads[6].get("nodes")[1][2]);
	demoTrack.addNonPlayerCar(crossings[5].get("nodes")[0][3]);
	demoTrack.addNonPlayerCar(crossings[5].get("nodes")[1][3]);
	demoTrack.addNonPlayerCar(crossings[5].get("nodes")[3][1]);
	demoTrack.addNonPlayerCar(roads[7].get("nodes")[0][1]);
	demoTrack.addNonPlayerCar(crossings[6].get("nodes")[1][1]);
	demoTrack.addNonPlayerCar(crossings[6].get("nodes")[0][2]);
	demoTrack.addNonPlayerCar(crossings[6].get("nodes")[3][1]);
	demoTrack.addNonPlayerCar(roads[8].get("nodes")[1][1]);

	demoTrack.addNonPlayerCar(roads[12].get("nodes")[2][0]);
	demoTrack.addNonPlayerCar(roads[12].get("nodes")[1][2]);
	demoTrack.addNonPlayerCar(roads[12].get("nodes")[2][3]);
	demoTrack.addNonPlayerCar(crossings[7].get("nodes")[0][2]);
	demoTrack.addNonPlayerCar(crossings[7].get("nodes")[2][0]);
	demoTrack.addNonPlayerCar(crossings[7].get("nodes")[3][2]);
	demoTrack.addNonPlayerCar(roads[13].get("nodes")[1][2]);
	demoTrack.addNonPlayerCar(roads[13].get("nodes")[2][1]);
	demoTrack.addNonPlayerCar(crossings[8].get("nodes")[0][0]);
	demoTrack.addNonPlayerCar(crossings[8].get("nodes")[1][2]);
	demoTrack.addNonPlayerCar(crossings[8].get("nodes")[2][3]);
	demoTrack.addNonPlayerCar(crossings[8].get("nodes")[3][0]);
	demoTrack.addNonPlayerCar(roads[14].get("nodes")[1][0]);
	demoTrack.addNonPlayerCar(roads[14].get("nodes")[2][2]);
	demoTrack.addNonPlayerCar(roads[14].get("nodes")[2][3]);
	demoTrack.addNonPlayerCar(crossings[9].get("nodes")[2][1]);
	demoTrack.addNonPlayerCar(roads[15].get("nodes")[1][3]);
	demoTrack.addNonPlayerCar(roads[15].get("nodes")[2][2]);
	demoTrack.addNonPlayerCar(roads[15].get("nodes")[0][0]);
	demoTrack.addNonPlayerCar(crossings[10].get("nodes")[0][2]);
	demoTrack.addNonPlayerCar(crossings[10].get("nodes")[2][0]);
	demoTrack.addNonPlayerCar(crossings[10].get("nodes")[3][2]);
	demoTrack.addNonPlayerCar(roads[16].get("nodes")[2][1]);
	demoTrack.addNonPlayerCar(roads[16].get("nodes")[1][2]);
	demoTrack.addNonPlayerCar(crossings[11].get("nodes")[0][1]);
	demoTrack.addNonPlayerCar(crossings[11].get("nodes")[1][2]);
	demoTrack.addNonPlayerCar(crossings[11].get("nodes")[3][2]);
	demoTrack.addNonPlayerCar(roads[17].get("nodes")[1][1]);


	var demoGame = new SumOfUs.Game({
		track : demoTrack, 
		numberOfTeams : 4, 
		carsPerTeam : 2,
		secondsPerMove : 1
	});


	var cars = demoGame.get("playerCars");

	/* Assign colors to cars */
	for (var i = 0; i < cars[0].length; i++)
		cars[0][i].set("color", "red");
	for (var i = 0; i < cars[1].length; i++)
		cars[1][i].set("color", "yellow");
	for (var i = 0; i < cars[2].length; i++)
		cars[2][i].set("color", "lightblue");
	for (var i = 0; i < cars[3].length; i++)
		cars[3][i].set("color", "lightgreen");
        
	demoGame.assignLocationToPlayerCar(0,0,roads[1].get("nodes")[0][0],"one->two");
	demoGame.assignLocationToPlayerCar(0,1,roads[2].get("nodes")[0][1],"one->two");
	demoGame.assignLocationToPlayerCar(1,0,roads[1].get("nodes")[0][1],"one->two");
	demoGame.assignLocationToPlayerCar(1,1,roads[2].get("nodes")[0][0],"one->two");
	demoGame.assignLocationToPlayerCar(2,0,roads[1].get("nodes")[0][2],"one->two");
	demoGame.assignLocationToPlayerCar(2,1,roads[2].get("nodes")[0][3],"one->two");
	demoGame.assignLocationToPlayerCar(3,0,roads[1].get("nodes")[0][3],"one->two");
	demoGame.assignLocationToPlayerCar(3,1,roads[2].get("nodes")[0][2],"one->two");


        var crossingLocations = [ {begin : {x : 280, y : 10}, end : {x : 400, y : 130}},
                                  {begin : {x : 670, y : 10}, end : {x : 790, y : 130}},
                                  {begin : {x : 100, y : 220}, end : {x : 190, y : 340}},
                                  {begin : {x : 280, y : 220}, end : {x : 400, y : 340}},
                                  {begin : {x : 490, y : 220}, end : {x : 580, y : 340}},
                                  {begin : {x : 670, y : 220}, end : {x : 790, y : 340}},
                                  {begin : {x : 880, y : 220}, end : {x : 970, y : 340}},
                                  {begin : {x : 100, y : 490}, end : {x : 190, y : 610}},
                                  {begin : {x : 280, y : 490}, end : {x : 400, y : 610}},
                                  {begin : {x : 490, y : 490}, end : {x : 580, y : 610}},
                                  {begin : {x : 670, y : 490}, end : {x : 790, y : 610}},
                                  {begin : {x : 880, y : 490}, end : {x : 970, y : 610}},
                                  {begin : {x : 280, y : 700}, end : {x : 400, y : 820}},
                                  {begin : {x : 670, y : 700}, end : {x : 790, y : 820}}];

        for(var i = 0; i < crossings.length; i++){
            new SumOfUs.CrossingView({
	         model : crossings[i],
	 	 callback : demoGame.playerClickedOnNode.bind(demoGame),
	         paper : paper,
	  	 beginPoint : crossingLocations[i].begin,
		 endPoint : crossingLocations[i].end
	    });
        }

        var roadLocations = [ {begin : {x : 400, y : 10}, end : {x : 670, y : 130}, dir : "right"},
                              {begin : {x : 400, y : 130}, end : {x : 280, y : 220}, dir : "down"},
                              {begin : {x : 790, y : 130}, end : {x : 670, y : 220}, dir : "down"},
                              {begin : {x : 10, y : 220}, end : {x : 100, y : 340}, dir : "right"},
                              {begin : {x : 190, y : 220}, end : {x : 280, y : 340}, dir : "right"},
                              {begin : {x : 400, y : 220}, end : {x : 490, y : 340}, dir : "right"},
                              {begin : {x : 580, y : 220}, end : {x : 670, y : 340}, dir : "right"},
                              {begin : {x : 790, y : 220}, end : {x : 880, y : 340}, dir : "right"},
                              {begin : {x : 970, y : 220}, end : {x : 1060, y : 340}, dir : "right"},
                              {begin : {x : 190, y : 340}, end : {x : 100, y : 490}, dir : "down"},
                              {begin : {x : 580, y : 340}, end : {x : 490, y : 490}, dir : "down"},
                              {begin : {x : 970, y : 340}, end : {x : 880, y : 490}, dir : "down"},
                              {begin : {x : 10, y : 490}, end : {x : 100, y : 610}, dir : "right"},
                              {begin : {x : 190, y : 490}, end : {x : 280, y : 610}, dir : "right"},
                              {begin : {x : 400, y : 490}, end : {x : 490, y : 610}, dir : "right"},
                              {begin : {x : 580, y : 490}, end : {x : 670, y : 610}, dir : "right"},
                              {begin : {x : 790, y : 490}, end : {x : 880, y : 610}, dir : "right"},
                              {begin : {x : 970, y : 490}, end : {x : 1060, y : 610}, dir : "right"},
                              {begin : {x : 400, y : 610}, end : {x : 280, y : 700}, dir : "down"},
                              {begin : {x : 790, y : 610}, end : {x : 670, y : 700}, dir : "down"},
                              {begin : {x : 400, y : 700}, end : {x : 670, y : 820}, dir : "right"}]
 
        for(var i = 0; i < roads.length; i++){
            new SumOfUs.RoadView({
 	        model : roads[i],
		callback : demoGame.playerClickedOnNode.bind(demoGame),
		paper : paper,
		direction : roadLocations[i].dir,
		beginPoint : roadLocations[i].begin,
		endPoint : roadLocations[i].end
	    });
        }

//	var randomPositions = [
//		{x : 250 + parseInt(Math.random() * 25), 
//		 y : 250 + parseInt(Math.random() * 25)},
//		{x : 375 + parseInt(Math.random() * 25), 
//		 y : 250 + parseInt(Math.random() * 25)},
//		{x : 250 + parseInt(Math.random() * 25), 
//		 y : 375 + parseInt(Math.random() * 25)},
//		{x : 375 + parseInt(Math.random() * 25), 
//		 y : 375 + parseInt(Math.random() * 25)},
//		{x : 700 + parseInt(Math.random() * 55), 
//		 y : 100 + parseInt(Math.random() * 25)},
//		{x : 700 + parseInt(Math.random() * 25), 
//		 y : 200 + parseInt(Math.random() * 25)},
//		{x : 700 + parseInt(Math.random() * 55), 
//		 y : 300 + parseInt(Math.random() * 25)},
//		{x : 700 + parseInt(Math.random() * 55), 
//		 y : 400 + parseInt(Math.random() * 25)},
//		{x : 700 + parseInt(Math.random() * 55), 
//		 y : 500 + parseInt(Math.random() * 25)},
//	];
//
//	for (var i = 0; i < randomPositions.length; i++)
//		new SumOfUs.TreeView({
//			paper : paper,
//			position : randomPositions[i],
//			color : "lightgreen",
//			ratio : 30,
//		});

        for(var team = 0; team < 4; team++){
	    for(var car = 0; car < 2; car++){
	        new SumOfUs.CarView({ model : cars[team][car],
		                      paper : paper,
				      carWidth : 30,
				      carHeight : 17 });
	    }
	}

	var npcCars = demoTrack.get("nonPlayerCars");
	for each(var car in npcCars){
	    new SumOfUs.CarView({ model : car,
	                         paper : paper,
				 carWidth : 30,
				 carHeight : 17 });
	}

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
