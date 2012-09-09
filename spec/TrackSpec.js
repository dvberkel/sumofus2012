describe("a TrackNode", function() {

    it("should have correct defaults", function(){
        var node = new SumOfUs.TrackNode;
	var directions = node.get("directions");
	var connections = node.get("connections");
	expect(node).not.toBeOccupied();
	expect(node).not.toBeHighlighted();
	expect(directions).toEqual([]);
	expect(connections).toEqual([]);
	expect(node).not.toBeACheckpoint();
    });

  
    it("should be highlightable", function(){
        var node = new SumOfUs.TrackNode;
	node.changeHighlight(true);
	expect(node).toBeHighlighted();
	node.changeHighlight(false);
	expect(node).not.toBeHighlighted();
    });

    it("should be able to connect to other nodes", function(){
        var node1 = new SumOfUs.TrackNode({ directions : ["A","B"] });
	var node2 = new SumOfUs.TrackNode({ directions : ["A"] });
	var node3 = new SumOfUs.TrackNode({ directions : ["B"] });
        node1.connectTo(node2).along("A");
        node1.connectTo(node3).along("B");
        node1.connectTo(node3).along("A","B");
        expect(node1).toHaveNConnections(3);

        var linksA= node1.links("A");
        var linksB= node1.links("B");
        expect(linksA.length).toEqual(2);
        expect(linksA).toContainSomethingWithProperties({node : node2, direction : "A"});
        expect(linksA).toContainSomethingWithProperties({node : node3, direction : "B"});
        expect(linksB).toEqual([{node : node3, direction : "B"}]);

    });

    it("should be able to be two-way connectable to other nodes", function(){
        var node1 = new SumOfUs.TrackNode({ directions : ["A", "B"] });
	var node2 = new SumOfUs.TrackNode({ directions : ["C", "D"] });
	var node3 = new SumOfUs.TrackNode({ directions : ["E"] });
	var node4 = new SumOfUs.TrackNode({ directions : ["F"] });

	node1.connectTwoWay(node2,["A","B"], "C", ["C"], "A");
	node1.connectTwoWay(node3,["A"], "E", ["E"], "B");
	node1.connectTwoWay(node4,["B"], "F", ["F"], "A");

	expect(node1).toHaveNConnections(4);
	expect(node2).toHaveNConnections(1);

	var links1A = node1.links("A");
	var links1B = node1.links("B");
	expect(links1A.length).toEqual(2);
	expect(links1B.length).toEqual(2);

	expect(links1A).toContainSomethingWithProperties({ node : node2, direction : "C" });
	expect(links1A).toContainSomethingWithProperties({ node : node3, direction : "E" });
	expect(links1B).toContainSomethingWithProperties({ node : node2, direction : "C" });
	expect(links1B).toContainSomethingWithProperties({ node : node4, direction : "F" });

	var links2C = node2.links("C");
	var links2D = node2.links("D");
	var links3E = node3.links("E");
	expect(links2C).toEqual([{ node : node1, direction : "A"}]);
	expect(links2D).toEqual([]);
	expect(links3E).toEqual([{ node : node1, direction : "B"}]);
    });

    it("should return all connections for undefined direction, expect for the npc direction", function(){
        var npcdir = SumOfUs.NPC_DIRECTION;
        var node1 = new SumOfUs.TrackNode({ directions : ["A", "B", "C", npcdir] });
	var node2 = new SumOfUs.TrackNode({ directions : ["D"] });
	var node3 = new SumOfUs.TrackNode({ directions : ["E"] });
	var node4 = new SumOfUs.TrackNode({ directions : ["F"] });
	var node5 = new SumOfUs.TrackNode({ directions : [npcdir] });

	node1.connectTo(node2).along("A", "D");
	node1.connectTo(node3).along("B", "E");
	node1.connectTo(node4).along("C", "F");
	node1.connectTo(node5).along(npcdir);

	var links = node1.links(undefined);
	expect(links.length).toEqual(3);
	expect(node1).toBeConnectedTo(node2, undefined, "D");
	expect(node1).toBeConnectedTo(node3, undefined, "E");
	expect(node1).toBeConnectedTo(node4, undefined, "F");
	expect(links).not.toContainSomethingWithProperties({node : node5});
    });

    it("should throw exceptions when non-existing directions are used when connecting", 
                                                                              function(){
        var node1 = new SumOfUs.TrackNode({ directions : ["A"] });
        var node2 = new SumOfUs.TrackNode({ directions : ["B"] });
        expect( (function(){node1.connectTo(node2).along("A");}) ).toThrow();
        expect( (function(){node1.connectTo(node2).along("B");}) ).toThrow();
        expect( (function(){node1.connectTo(node2).along("A","C");}) ).toThrow();
        expect( (function(){node1.connectTo(node2).along("C","B");}) ).toThrow();
        expect( (function(){node1.connectTwoWay(node2, ["C"], "B", ["B"], "A");}) ).toThrow();
        expect( (function(){node1.connectTwoWay(node2, ["A"], "C", ["B"], "A");}) ).toThrow();
        expect( (function(){node1.connectTwoWay(node2, ["A"], "B", ["C"], "A");}) ).toThrow();
        expect( (function(){node1.connectTwoWay(node2, ["A"], "B", ["B"], "C");}) ).toThrow();

    });

    it("should keep player and npc routes separate", function(){
        var npcdir = SumOfUs.NPC_DIRECTION;
        var node1 = new SumOfUs.TrackNode({ directions : ["A",npcdir] });
        var node2 = new SumOfUs.TrackNode({ directions : ["A",npcdir] });

	expect( (function(){node1.connectTo(node2).along("A",npcdir);}) ).toThrow();
	expect( (function(){node1.connectTo(node2).along(npcdir,"A");}) ).toThrow();
	expect( (function(){node1.connectTo(node2).along(npcdir);}) ).not.toThrow();
    });

    it("shouldn't allow more than one npc exit", function(){
        var npcdir = SumOfUs.NPC_DIRECTION;
        var node1 = new SumOfUs.TrackNode({ directions : [npcdir] });
        var node2 = new SumOfUs.TrackNode({ directions : [npcdir] });
        var node3 = new SumOfUs.TrackNode({ directions : [npcdir] });

	node1.connectTo(node2).along(npcdir);
	expect( (function(){node1.connectTo(node2).along(npcdir);}) ).toThrow();
    });
});

describe("a TrackSegment", function() {
    describe("of type road", function(){
        it("should have the right number of nodes", function(){
	    var road = new SumOfUs.TrackSegment("road", {length : 10, width : 4});
	    var nodes = road.get("nodes");

	    expect(nodes.length).toEqual(10);
	    for(var i = 0; i < 10; i++){
	        expect(nodes[i].length).toEqual(4);
	    }
	});

	it("should have the nodes connected correctly", function(){
	    var road = new SumOfUs.TrackSegment("road", {length : 5, width : 3});
	    var nodes = road.get("nodes");

	    for(var i = 0; i < 5; i++){
	        for(var j = 0; j < 3; j++){
	            if(i < 4){
   	                expect(nodes[i][j]).toBeConnectedTo(nodes[i+1][j],"one->two","one->two");
	            }
	            if(i > 0){
	                expect(nodes[i][j]).toBeConnectedTo(nodes[i-1][j],"two->one","two->one");
	            }
	            if(j < 2){
	                expect(nodes[i][j]).toBeConnectedTo(nodes[i][j+1],"one->two","one->two");
	                expect(nodes[i][j]).toBeConnectedTo(nodes[i][j+1],"two->one","two->one");
	            }
	            if(j > 0){
	                expect(nodes[i][j]).toBeConnectedTo(nodes[i][j-1],"one->two","one->two");
	                expect(nodes[i][j]).toBeConnectedTo(nodes[i][j-1],"two->one","two->one");
	            }
	        }
	    }
	});

        it("should have two endpoints", function(){
	    var road = new SumOfUs.TrackSegment("road", {length : 3, width : 4});
	    var nodes = road.get("nodes");
	    var endPoints = road.get("endPoints");

	    expect(endPoints.one.nodes.length).toEqual(4);
	    expect(endPoints.one.leavingDirs).toEqual(["two->one"]);
	    expect(endPoints.one.incomingDir).toEqual("one->two");
	    expect(endPoints.two.nodes.length).toEqual(4);
	    expect(endPoints.two.leavingDirs).toEqual(["one->two"]);
	    expect(endPoints.two.incomingDir).toEqual("two->one");

            for(var i = 0; i < 4; i++){
	        expect(endPoints.one.nodes[i]).toBe(nodes[0][3- i]);
		expect(endPoints.two.nodes[i]).toBe(nodes[2][i]);
	    }
	});

	it("should support one-way npc traffic", function(){
	    var road = new SumOfUs.TrackSegment("road", {length : 10,
	                                                 width : 4,
							 npcTraffic : "oneway"});
	    var nodes = road.get("nodes");
	    var endPoints = road.get("endPoints");
	    var npcdir = SumOfUs.NPC_DIRECTION;

	    for(var i = 0; i < 9; i++){
	        for(var j = 0; j < 4; j++){
		    expect(nodes[i][j]).toBeConnectedTo(nodes[i+1][j],npcdir,npcdir);
		}
	    }

	    expect(endPoints.one.npcTraffic).toEqual("in");
	    expect(endPoints.two.npcTraffic).toEqual("out");
	});

	it("should support two-way npc traffic", function(){
	    var road = new SumOfUs.TrackSegment("road", {length : 10,
	                                                 width : 4,
							 npcTraffic : "twoway"});
	    var nodes = road.get("nodes");
	    var endPoints = road.get("endPoints");
	    var npcdir = SumOfUs.NPC_DIRECTION;

	    for(var i = 0; i < 9; i++){
	        for(var j = 0; j < 2; j++){
		    expect(nodes[i+1][j]).toBeConnectedTo(nodes[i][j],npcdir,npcdir);
		    expect(nodes[i][3-j]).toBeConnectedTo(nodes[i+1][3-j],npcdir,npcdir);
		}
	    }

	    expect(endPoints.one.npcTraffic).toEqual("twoway");
	    expect(endPoints.two.npcTraffic).toEqual("twoway");
	});

	it("can have a checkpoint in the middle", function(){
	    var road = new SumOfUs.TrackSegment("road", {length : 6, width: 4, checkpoint : "A"});
	    var nodes = road.get("nodes");
	    for(var i = 0; i < 4; i++){
	        expect(nodes[3][i]).toBeCheckpoint("A");
	    }
	});
    });

    describe("of type crossing", function(){
        it("should have the right number of nodes", function(){
	    var crossing = new SumOfUs.TrackSegment("crossing",{height : 3, width:4});
	    var nodes = crossing.get("nodes");
	    
	    expect(nodes.length).toEqual(3);
	    for(var i = 0; i < 3; i++){
	        expect(nodes[i].length).toEqual(4);
	    }
	});

	it("should have the nodes connected correctly", function(){
	    var crossing = new SumOfUs.TrackSegment("crossing",{height : 3, width:4});
	    var nodes = crossing.get("nodes");

	    for(var i = 0; i < 3; i++){
	        for(var j = 0; j < 4; j++){
	            if(i < 2){
			expect(nodes[i][j]).toBeConnectedTo(nodes[i+1][j],"north","north");
			expect(nodes[i][j]).toBeConnectedTo(nodes[i+1][j],"east","north");
			expect(nodes[i][j]).toBeConnectedTo(nodes[i+1][j],"west","north");
	 	    }
		    if(i > 0){
			expect(nodes[i][j]).toBeConnectedTo(nodes[i-1][j],"south","south");
			expect(nodes[i][j]).toBeConnectedTo(nodes[i-1][j],"east","south");
			expect(nodes[i][j]).toBeConnectedTo(nodes[i-1][j],"west","south");
		    }
		    if(j < 3){
		        expect(nodes[i][j]).toBeConnectedTo(nodes[i][j+1],"north","east");
		        expect(nodes[i][j]).toBeConnectedTo(nodes[i][j+1],"east","east");
		        expect(nodes[i][j]).toBeConnectedTo(nodes[i][j+1],"south","east");
		    }
		    if(j > 0){
		        expect(nodes[i][j]).toBeConnectedTo(nodes[i][j-1],"north","west");
		        expect(nodes[i][j]).toBeConnectedTo(nodes[i][j-1],"west","west");
		        expect(nodes[i][j]).toBeConnectedTo(nodes[i][j-1],"south","west");
		    }
	        }
	    }
	});

        it("should have four endpoints", function(){
	    var crossing = new SumOfUs.TrackSegment("crossing",{height : 3, width:4});
	    var nodes = crossing.get("nodes");
	    var endPoints = crossing.get("endPoints");

	    expect(endPoints.north.nodes.length).toEqual(4);
	    expect(endPoints.north.leavingDirs).toEqual(["north","east","west"]);
	    expect(endPoints.north.incomingDir).toEqual("south");
	    expect(endPoints.south.nodes.length).toEqual(4);
	    expect(endPoints.south.leavingDirs).toEqual(["east","south","west"]);
	    expect(endPoints.south.incomingDir).toEqual("north");
	    expect(endPoints.east.nodes.length).toEqual(3);
	    expect(endPoints.east.leavingDirs).toEqual(["north","east","south"]);
	    expect(endPoints.east.incomingDir).toEqual("west");
	    expect(endPoints.west.nodes.length).toEqual(3);
	    expect(endPoints.west.leavingDirs).toEqual(["north","south","west"]);
	    expect(endPoints.west.incomingDir).toEqual("east");

            for(var i = 0; i < 4; i++){
	        expect(endPoints.north.nodes[i]).toBe(nodes[2][i]);
		expect(endPoints.south.nodes[i]).toBe(nodes[0][3-i]);
	    }
	    for(var i = 0; i < 3; i++){
	        expect(endPoints.east.nodes[i]).toBe(nodes[2-i][3]);
		expect(endPoints.west.nodes[i]).toBe(nodes[i][0]);
	    }
	});

	it("should support one-way npc traffic", function(){
	    var crossing = new SumOfUs.TrackSegment("crossing",{width : 4,
	                                                    height : 4,
	 						    npcTraffic : "oneway"});
	    var nodes = crossing.get("nodes");
	    var endPoints = crossing.get("endPoints");
	    var npcdir = SumOfUs.NPC_DIRECTION;
	    for(var i = 0; i < 4; i++){
	        for(var j=0;j < 3; j++){
		    expect(nodes[i][j]).toBeConnectedTo(nodes[i][j+1],npcdir,npcdir);
		}
	    }

	    expect(endPoints.east.npcTraffic).toEqual("out");
	    expect(endPoints.west.npcTraffic).toEqual("in");
	});

	it("should support two-way npc traffic", function(){
	    var crossing = new SumOfUs.TrackSegment("crossing",{width : 4,
	                                                    height : 4,
	 						   npcTraffic : "twoway"});
	    var nodes = crossing.get("nodes");
	    var endPoints = crossing.get("endPoints");
	    var npcdir = SumOfUs.NPC_DIRECTION;
	    for(var i = 0; i < 2; i++){
	        for(var j=0;j < 3; j++){
		    expect(nodes[i][j]).toBeConnectedTo(nodes[i][j+1],npcdir,npcdir);
		    expect(nodes[3-i][j+1]).toBeConnectedTo(nodes[3-i][j],npcdir,npcdir);
		}
	    }

	    expect(endPoints.east.npcTraffic).toEqual("twoway");
	    expect(endPoints.west.npcTraffic).toEqual("twoway");
	});
    });
});

describe("a Track", function (){
    var track;

    beforeEach(function(){
        track = new SumOfUs.Track();
    });

    it("should have correct defaults", function(){
        expect(track.get("segments")).toEqual([]);
	expect(track.get("nonPlayerCars")).toEqual([]);
	expect(track.get("npcMaxSpeed")).toEqual(5);
	expect(track.get("npcDelayChance")).toEqual(0);
    });

    it("can have segments added to it", function(){
        var road = track.addSegment("road", {length : 5,width : 4});
	var crossing = track.addSegment("crossing", {height : 3, width : 4});
	var segments = track.get("segments")

	expect(segments).toContainSomethingEqualTo(road);
        expect(segments).toContainSomethingEqualTo(crossing);
    });

    describe("has a segment connecting function that",function(){
	it("should be able to connect segments together", function(){
	    var road = track.addSegment("road", {length : 5,width : 4});
	    var crossing = track.addSegment("crossing", {height : 3, width : 4});
	    var one = road.get("endPoints").one;
	    var south = crossing.get("endPoints").south;
      
	    track.connectSegments(one,south);
	    for(var i = 0; i < 4; i++){
		for each(dir in one.leavingDirs){
		    expect(one.nodes[i]).toBeConnectedTo(south.nodes[3-i],dir,south.incomingDir);
		}
		for each(dir in south.leavingDirs){
		    expect(south.nodes[i]).toBeConnectedTo(one.nodes[3-i],dir,one.incomingDir);
		}
	    }       
	});

	it("shouldn't be able to connect non matching endpoints", function(){
	    var road = track.addSegment("road", {length : 5, width : 4});
	    var crossing = track.addSegment("crossing", {height : 3, width : 4});
	    expect((function(){
			track.connectSegments(road.get("endPoints").one,
					      crossing.get("endPoints").west);
		    })).toThrow();
	});

	it("should be able to connect endpoints with one-way npc traffic",function(){
	    var road = track.addSegment("road", {length : 5, width : 4, npcTraffic : "oneway"});
	    var crossing = track.addSegment("crossing", {height : 4, width : 4, npcTraffic : "oneway"});
	    var one = road.get("endPoints").one;
	    var two = road.get("endPoints").two;
	    var east = crossing.get("endPoints").east;
	    var west = crossing.get("endPoints").west;
	    var npcdir = SumOfUs.NPC_DIRECTION;

	    track.connectSegments(one,east);
	    track.connectSegments(two,west);

	    for(var i = 0; i < 4; i++){
	        expect(east.nodes[i]).toBeConnectedTo(one.nodes[3-i], npcdir, npcdir);
		expect(two.nodes[i]).toBeConnectedTo(west.nodes[3-i], npcdir, npcdir);
	    }
	});

	it("should be able to connect endpoints with two-way npc traffic",function(){
	    var road = track.addSegment("road", {length : 5, width : 4, npcTraffic : "twoway"});
	    var crossing = track.addSegment("crossing", {height : 4, width : 4, npcTraffic : "twoway"});
	    var one = road.get("endPoints").one;
	    var two = road.get("endPoints").two;
	    var east = crossing.get("endPoints").east;
	    var west = crossing.get("endPoints").west;
	    var npcdir = SumOfUs.NPC_DIRECTION;

	    track.connectSegments(one,east);
	    track.connectSegments(two,west);

	    for(var i = 0; i < 2; i++){
	        expect(east.nodes[3-i]).toBeConnectedTo(one.nodes[i], npcdir, npcdir);
		expect(one.nodes[3-i]).toBeConnectedTo(east.nodes[i], npcdir, npcdir);
		expect(two.nodes[3-i]).toBeConnectedTo(west.nodes[i], npcdir, npcdir);
		expect(west.nodes[3-i]).toBeConnectedTo(two.nodes[i], npcdir, npcdir);
	    }
	});

	it("shouldn't be able to connect endpoints with non matching npc traffic", function(){
	    var road1 = track.addSegment("road", {length : 5, width: 4, npcTraffic : "oneway"});
	    var road2 = track.addSegment("road", {length : 5, width: 4, npcTraffic : "twoway"});
	    var road3 = track.addSegment("road", {length : 5, width: 4});
	    var ends1 = road1.get("endPoints");
	    var ends2 = road2.get("endPoints");
	    var ends3 = road3.get("endPoints");

	    expect( (function(){track.connectSegments(ends1.one, ends1.one);}) ).toThrow();
	    expect( (function(){track.connectSegments(ends1.two, ends1.two);}) ).toThrow();
	    expect( (function(){track.connectSegments(ends2.one, ends1.one);}) ).toThrow();
	    expect( (function(){track.connectSegments(ends2.one, ends1.two);}) ).toThrow();
	    expect( (function(){track.connectSegments(ends1.one, ends3.one);}) ).toThrow();
	    expect( (function(){track.connectSegments(ends1.two, ends3.one);}) ).toThrow();
	    expect( (function(){track.connectSegments(ends2.one, ends3.one);}) ).toThrow();
	});
    });

    describe("has a pathfinding function that",function(){
        it("should find existing paths",function(){
            var nodes = [];
            for(var i=0;i<7;i++){
                nodes.push(new SumOfUs.TrackNode({directions:["A","B"]}));
            }
            
            nodes[0].connectTo(nodes[1]).along("A");
            nodes[0].connectTo(nodes[2]).along("A");
            nodes[1].connectTo(nodes[3]).along("A");
            nodes[1].connectTo(nodes[4]).along("A","B");
            nodes[3].connectTo(nodes[5]).along("A");
            nodes[4].connectTo(nodes[6]).along("B");

            var reachableNodes = track.getReachableNodes(nodes[0],"A",3);
            expect(reachableNodes.length).toEqual(7);
            for(var i=0;i<7;i++){
                expect(reachableNodes).toContainSomethingWithProperties({node: nodes[i]});
            }
        });

        it("shouldn't find non-existing paths" , function(){
            var nodes = [];
            for(var i=0;i<4;i++){
                nodes.push(new SumOfUs.TrackNode({directions:["A","B"]}));
            }
            nodes[0].connectTo(nodes[1]).along("A");
            nodes[0].connectTo(nodes[2]).along("B");
            nodes[1].connectTo(nodes[2]).along("B");
            nodes[1].connectTo(nodes[3]).along("A","B");
            nodes[3].connectTo(nodes[2]).along("A");

            var reachableNodes = track.getReachableNodes(nodes[0],"A",3);
            expect(reachableNodes.length).toEqual(3);
            expect(reachableNodes).not.toContainSomethingWithProperties({node: nodes[2]});
        });

        it("should give the right resulting speeds and directions" , function(){
            var nodes = [];
            var dirs = ["A","B","C","D","E","F","G"]
            for(var i=0; i<7;i++){
                nodes.push(new SumOfUs.TrackNode({directions: dirs}));
                if(i > 0){
                    nodes[i-1].connectTo(nodes[i]).along(dirs[i-1],dirs[i]);
                }
            }
            var reachableNodes = track.getReachableNodes(nodes[0],"A",6);
            for(var i=0; i<7; i++){
                expect(reachableNodes).toContainSomethingWithProperties({node : nodes[i],
                                                                         direction : dirs[i],
                                                                         speed : i});
            }

        });

        it("should look the right number of steps ahead", function(){
            var nodes = [];
            for(var i=0; i<7;i++){
                nodes.push(new SumOfUs.TrackNode({directions: ["A"]}));
                if(i > 0){
                    nodes[i-1].connectTo(nodes[i]).along("A");
                }
            }
            var reachableNodes = track.getReachableNodes(nodes[0],"A",4);
            expect(reachableNodes).toContainSomethingWithProperties({node : nodes[4]});
            expect(reachableNodes).not.toContainSomethingWithProperties({node : nodes[5]});
            expect(reachableNodes).not.toContainSomethingWithProperties({node : nodes[6]});
            
        });

	it("should not pass through occupied nodes", function(){
            var nodes = [];
            for(var i=0; i<7;i++){
                nodes.push(new SumOfUs.TrackNode({directions: ["A"]}));
                if(i > 0){
                    nodes[i-1].connectTo(nodes[i]).along("A");
                }
            }
	    nodes[4].changeOccupied(new SumOfUs.Car());
            var reachableNodes = track.getReachableNodes(nodes[0],"A",6);
            expect(reachableNodes).toContainSomethingWithProperties({node : nodes[3]});
            expect(reachableNodes).not.toContainSomethingWithProperties({node : nodes[4]});
            expect(reachableNodes).not.toContainSomethingWithProperties({node : nodes[5]});
            expect(reachableNodes).not.toContainSomethingWithProperties({node : nodes[6]});
	});

	it("should keep track of passed checkpoints", function(){
	    var node1 = new SumOfUs.TrackNode({directions : "A"});
	    var node2 = new SumOfUs.TrackNode({directions : "A", checkpoint : "a"});
	    var node3 = new SumOfUs.TrackNode({directions : "A"});
	    var node4 = new SumOfUs.TrackNode({directions : "A"});
	    var node5 = new SumOfUs.TrackNode({directions : "A", checkpoint : "b"});
	    var node6 = new SumOfUs.TrackNode({directions : "A"});
	    node1.connectTo(node2).along("A");
	    node2.connectTo(node3).along("A");
	    node3.connectTo(node4).along("A");
	    node4.connectTo(node5).along("A");
	    node5.connectTo(node6).along("A");

            var reachableNodes = track.getReachableNodes(node1,"A",5);
	    expect(reachableNodes[0].passedCheckpoints).toEqual([]);
	    expect(reachableNodes[1].passedCheckpoints).toEqual(["a"]);
	    expect(reachableNodes[2].passedCheckpoints).toEqual(["a"]);
	    expect(reachableNodes[3].passedCheckpoints).toEqual(["a"]);
	    expect(reachableNodes[4].passedCheckpoints).toEqual(["a","b"]);
	    expect(reachableNodes[5].passedCheckpoints).toEqual(["a","b"]);
	});
    });

    describe("has functionality for non player cars that", function(){
	it("can have non-player cars added to it", function(){
	    track = new SumOfUs.Track({npcMaxSpeed : 4, npcDelayChance : 0.1});
	    var npcdir = SumOfUs.NPC_DIRECTION;
	    var node1 = new SumOfUs.TrackNode({directions : [npcdir]});
	    var node2 = new SumOfUs.TrackNode({directions : [npcdir]});

	    track.addNonPlayerCar(node1);
	    track.addNonPlayerCar(node2);
	    var cars = track.get("nonPlayerCars");
	    for each(car in cars){
	        expect(car).toBeAnNPC(0);
		expect(car).toHaveMaxSpeed(4);
		expect(car).toHaveSpeed(4);
		expect(car).toHaveDelayChance(0.1);
		expect(car).toBeGoingInDirection(npcdir);
	    }
	    expect(cars[0]).toBeAt(node1);
	    expect(cars[1]).toBeAt(node2);
	});

	it("can only have non-player cars added on nodes with the non-player direction", function(){
	    var npcdir = SumOfUs.NPC_DIRECTION;
	    var dir = "A";
	    if(dir == npcdir){
	        dir = "B";
	    }
	    var node = new SumOfUs.TrackNode({directions : [dir]});
	    expect( (function(){track.addNonPlayerCar(node);}) ).toThrow();
	});

	it("can't have non-player cars added on occupied positions", function(){
	    var npcdir = SumOfUs.NPC_DIRECTION;
	    var node = new SumOfUs.TrackNode({directions : [npcdir]});
	    node.changeOccupied(new SumOfUs.Car());
	    expect( (function(){track.addNonPlayerCar(node);}) ).toThrow();
	});

	it("should properly advance the non-player cars", function(){
	    track = new SumOfUs.Track({npcMaxSpeed :4,npcDelayChance : 0});
	    var road = track.addSegment("road",{length : 10, width : 1, npcTraffic : "oneway"});
	    var nodes = road.get("nodes");
	    track.connectSegments(road.get("endPoints").one, road.get("endPoints").two);

	    track.addNonPlayerCar(nodes[1][0]);
	    track.addNonPlayerCar(nodes[4][0]);
	    track.addNonPlayerCar(nodes[6][0]);
	    var cars = track.get("nonPlayerCars");

	    track.advanceNonPlayerCars();
	    track.advanceNonPlayerCars();
	    track.advanceNonPlayerCars();
	    expect(cars[0]).toBeAt(nodes[6][0]);
	    expect(cars[0]).toHaveSpeed(2);
	    expect(cars[1]).toBeAt(nodes[0][0]);
	    expect(cars[1]).toHaveSpeed(3);
	    expect(cars[2]).toBeAt(nodes[3][0]);
	    expect(cars[2]).toHaveSpeed(1);

	    track.advanceNonPlayerCars();
	    track.advanceNonPlayerCars();
	    expect(cars[0]).toBeAt(nodes[1][0]);
	    expect(cars[0]).toHaveSpeed(2);
	    expect(cars[1]).toBeAt(nodes[4][0]);
	    expect(cars[1]).toHaveSpeed(2);
	    expect(cars[2]).toBeAt(nodes[8][0]);
	    expect(cars[2]).toHaveSpeed(3);
	});
    });
});
