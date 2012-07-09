describe("a TrackNode", function() {
    it("should be highlightable", function(){
        var node = new SumOfUs.TrackNode;
	node.changeHighlight(true);
	expect(node).toBeHighlighted(true);
	node.changeHighlight(false);
	expect(node).toBeHighlighted(false);
    });

    it("should be properly connectable to other nodes", function(){
        var node1 = new SumOfUs.TrackNode({ directions : ["A", "B"] });
	var node2 = new SumOfUs.TrackNode({ directions : ["C", "D"] });
	var node3 = new SumOfUs.TrackNode({ directions : ["E"] });
	var node4 = new SumOfUs.TrackNode({ directions : ["F"] });

	node1.connect(node2,["A","B"], "C", ["C"], "A");
	node1.connect(node3,["A"], "E", ["E"], "B");
	node1.connect(node4,["B"], "F", ["F"], "A");

	var connections1 = node1.get("connections");
	var connections2 = node2.get("connections");
	expect(connections1.length).toEqual(3);
	expect(connections2.length).toEqual(1);

	var exits1A = node1.exits("A");
	var exits1B = node1.exits("B");
	expect(exits1A.length).toEqual(2);
	expect(exits1B.length).toEqual(2);

	expect(exits1A).toContain({ node : node2, direction : "C" });
	expect(exits1A).toContain({ node : node3, direction : "E" });
	expect(exits1B).toContain({ node : node2, direction : "C" });
	expect(exits1B).toContain({ node : node4, direction : "F" });

	var exits2C = node2.exits("C");
	var exits2D = node2.exits("D");
	var exits3E = node3.exits("E");
	expect(exits2C).toEqual([{ node : node1, direction : "A"}]);
	expect(exits2D).toEqual([]);
	expect(exits3E).toEqual([{ node : node1, direction : "B"}]);
    });

    it("should return all exits for undefined direction", function(){
        var node1 = new SumOfUs.TrackNode({ directions : ["A", "B","C"] });
	var node2 = new SumOfUs.TrackNode({ directions : ["D"] });
	var node3 = new SumOfUs.TrackNode({ directions : ["E"] });
	var node4 = new SumOfUs.TrackNode({ directions : ["F"] });

	node1.connect(node2, ["A"], "D", ["D"], "A");
	node1.connect(node3, ["B"], "E", ["E"], "A");
	node1.connect(node4, ["C"], "F", ["F"], "A");

	var exits = node1.exits(undefined);
	expect(exits.length).toEqual(3);
	expect(exits).toContain({ node : node2, direction : "D"});
	expect(exits).toContain({ node : node3, direction : "E"});
	expect(exits).toContain({ node : node4, direction : "F"});
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
