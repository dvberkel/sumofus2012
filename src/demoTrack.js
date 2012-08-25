(function(_, Backbone, SumOfUs, undefined){
	var demoTrack =  SumOfUs.Track();

	var roads = [];
	var crossings = [];
	for(var i = 0; i < 4; i++) {
		roads.push(demoTrack.addSegment("roads", {width : 2, length : 2, npcTraffic : "twoway"});
		crossings.push(demoTracks.addSegment("crossings", {width : 2, height : 2});
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

	/* A suggestion */
        roadViews = [];
	roadViews.push( new SumOfUs.RoadView(
		model : road[0],
		paper : paper,
		direction : "right", 
		beginpoint : {x:10,y:15}, 
		endpoint : {x:120,y:25},
	));

})(_, Backbone, SumOfUs);
