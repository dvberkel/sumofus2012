describe("a TrackNode", function() {

    it("should have correct defaults", function(){
        var node = new SumOfUs.TrackNode;
	var directions = node.get("directions");
	var connections = node.get("connections");
	expect(node).not.toBeOccupied();
	expect(directions).toEqual([]);
	expect(connections).toEqual([]);
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

    it("should return all connections for undefined direction", function(){
        var node1 = new SumOfUs.TrackNode({ directions : ["A", "B","C"] });
	var node2 = new SumOfUs.TrackNode({ directions : ["D"] });
	var node3 = new SumOfUs.TrackNode({ directions : ["E"] });
	var node4 = new SumOfUs.TrackNode({ directions : ["F"] });

	node1.connectTo(node2).along("A", "D");
	node1.connectTo(node3).along("B", "E");
	node1.connectTo(node4).along("C", "F");

	var links = node1.links(undefined);
	expect(links.length).toEqual(3);
	expect(node1).toBeConnectedTo(node2, undefined, "D");
	expect(node1).toBeConnectedTo(node3, undefined, "E");
	expect(node1).toBeConnectedTo(node4, undefined, "F");
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
    });

    it("can have segments added to it", function(){
        var road = track.addSegment("road", {length : 5,width : 4});
	var crossing = track.addSegment("crossing", {height : 3, width : 4});
	var segments = track.get("segments")

	expect(segments).toContainSomethingEqualTo(road);
        expect(segments).toContainSomethingEqualTo(crossing);
    });

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
        var road = track.addSegment("road", {length : 5,width : 4});
	var crossing = track.addSegment("crossing", {height : 3, width : 4});
	expect((function(){
	            track.connectSegments(road.get("endPoints").one,
		                          crossing.get("endPoints").west);
	        })).toThrow();
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

            var track = new SumOfUs.Track();
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

            var track = new SumOfUs.Track();
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
            var track = new SumOfUs.Track();
            var reachableNodes = track.getReachableNodes(nodes[0],"A",6);
            for(var i=0; i<7; i++){
                expect(reachableNodes).toContainSomethingWithProperties({node : nodes[i],
                                                                         direction : dirs[i],
                                                                         speed : i})
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
            var track = new SumOfUs.Track();
            var reachableNodes = track.getReachableNodes(nodes[0],"A",4);
            expect(reachableNodes).toContainSomethingWithProperties({node : nodes[4]})
            expect(reachableNodes).not.toContainSomethingWithProperties({node : nodes[5]})
            expect(reachableNodes).not.toContainSomethingWithProperties({node : nodes[6]})
            
        });
    });


});
