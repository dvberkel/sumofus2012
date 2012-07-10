describe("a Car", function(){
    it("should be defined in the SumOfUs namespace", function(){
	expect(SumOfUs.Car).toBeDefined();
    });

    it("should have correct defaults", function(){
        var car = new SumOfUs.Car;
	expect(car).toHaveSpeed(0);
	expect(car).toHaveMaxSpeed(5);
	expect(car).toHaveAcceleration(1);
        
        var pos = car.get("position");
	var dir = car.get("direction");
	expect(pos).toBeUndefined();
	expect(dir).toBeUndefined();

	expect(car).toBeHighlighted(false);
    });

    it("should be highlightable", function(){
        var car = new SumOfUs.Car;
	car.changeHighlight(true);
	expect(car).toBeHighlighted(true);
	car.changeHighlight(false);
	expect(car).toBeHighlighted(false);
    });

    it("should be movable", function(){
        var car = new SumOfUs.Car;
	var node1 = new SumOfUs.TrackNode({directions : ["A"]});
	var node2 = new SumOfUs.TrackNode({directions : ["B"]});
	car.moveTo(node1,"A",2);
	expect(car).toBeAt(node1);
	expect(car).toHaveSpeed(2);
	expect(car).toBeGoingInDirection("A");
	expect(node1).toBeOccupied();

	car.moveTo(node2,"B",3)
	expect(car).toBeAt(node2);
	expect(node1).not.toBeOccupied();
        expect(node2).toBeOccupied();
    });

    it("shouldn't be able to move to occupied positions", function(){
        var car = new SumOfUs.Car;
	var node = new SumOfUs.TrackNode({occupied : false});
	expect( (function(){car.moveTo(node1)}) ).toThrow();
    });
});
