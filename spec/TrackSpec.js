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
	expect(node).toBeHighlighted(true);
	node.changeHighlight(false);
	expect(node).toBeHighlighted(false);
    });

    it("should be connectable to other nodes", function(){
        var node1 = new SumOfUs.TrackNode({ directions : ["A", "B"] });
	var node2 = new SumOfUs.TrackNode({ directions : ["C", "D"] });
	var node3 = new SumOfUs.TrackNode({ directions : ["E"] });
	var node4 = new SumOfUs.TrackNode({ directions : ["F"] });

	node1.connect(node2,["A","B"], "C", ["C"], "A");
	node1.connect(node3,["A"], "E", ["E"], "B");
	node1.connect(node4,["B"], "F", ["F"], "A");

	var connections1 = node1.get("connections");
	var connections2 = node2.get("connections");
	expect(connections1.length).toEqual(4);
	expect(connections2.length).toEqual(1);

	var links1A = node1.links("A");
	var links1B = node1.links("B");
	expect(links1A.length).toEqual(2);
	expect(links1B.length).toEqual(2);

	expect(links1A).toContain({ node : node2, direction : "C" });
	expect(links1A).toContain({ node : node3, direction : "E" });
	expect(links1B).toContain({ node : node2, direction : "C" });
	expect(links1B).toContain({ node : node4, direction : "F" });

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

	node1.connect(node2, ["A"], "D", ["D"], "A");
	node1.connect(node3, ["B"], "E", ["E"], "A");
	node1.connect(node4, ["C"], "F", ["F"], "A");

	var links = node1.links(undefined);
	expect(links.length).toEqual(3);
	expect(links).toContain({ node : node2, direction : "D"});
	expect(links).toContain({ node : node3, direction : "E"});
	expect(links).toContain({ node : node4, direction : "F"});
    });

    it("should throw exceptions when non-existing directions are used when connecting", 
                                                                              function(){
        var node1 = new SumOfUs.TrackNode({ directions : ["A"] });
        var node2 = new SumOfUs.TrackNode({ directions : ["B"] });
        expect( (function(){node1.connect(node2, ["C"], "B", ["B"], "A");}) ).toThrow();
        expect( (function(){node1.connect(node2, ["A"], "C", ["B"], "A");}) ).toThrow();
        expect( (function(){node1.connect(node2, ["A"], "B", ["C"], "A");}) ).toThrow();
        expect( (function(){node1.connect(node2, ["A"], "B", ["B"], "C");}) ).toThrow();

    });

});

describe("a TrackSegment", function() {
});

describe("a Track", function (){
});
