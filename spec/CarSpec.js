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
	var node = new SumOfUs.TrackNode({directions : ["up","down"]});
	car.moveTo(node,"up",2);
	expect(car).toBeAt(node);
	expect(car).toHaveSpeed(2);
	expect(car).toBeGoingInDirection("up");
    });

});
