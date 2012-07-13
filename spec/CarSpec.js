describe("a Car", function(){
    var car;

    beforeEach(function(){
	car = new SumOfUs.Car();
    });

    it("should be defined in the SumOfUs namespace", function(){
	expect(SumOfUs.Car).toBeDefined();
    });

    it("should have correct defaults", function(){
	expect(car).toHaveSpeed(0);
	expect(car).toHaveMaxSpeed(5);
	expect(car).toHaveAcceleration(1);
	expect(car).not.toHaveADefinedPosition();
	expect(car).not.toHaveADefinedDirection();
	expect(car).not.toBeHighlighted();
    });

    it("should be highlightable", function(){
	car.changeHighlight(true);
	expect(car).toBeHighlighted();
	car.changeHighlight(false);
	expect(car).not.toBeHighlighted();
    });

    it("should be able to increase speed",function(){
	var speed = car.get("speed");
	var acceleration = car.get("acceleration");

	car.increaseSpeed();

	expect(car).toHaveSpeed(speed + acceleration);
    });

    it("should be not able to increase speed beyond maximum speed",function(){
	var maximumSpeed = car.get("maxSpeed");
	car.set({ "speed" : maximumSpeed });

	car.increaseSpeed();

	expect(car).toHaveSpeed(maximumSpeed);
    });

    it("should be able to decrease speed",function(){
	car.set({"speed" : 4});
	var targetSpeed = 1;

	car.decreaseSpeedTo(targetSpeed);

	expect(car).toHaveSpeed(targetSpeed);
    });

    it("should be not able to decrease speed below zero",function(){
	car.decreaseSpeedTo(-1);

	expect(car).toHaveSpeed(0);
    });

    it("should be not able to incease speed by decreasing to a higher value",function(){
	var originalSpeed = car.get("speed");
	
	car.decreaseSpeedTo(4);

	expect(car).toHaveSpeed(originalSpeed);
    });

    it("should be movable", function(){
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
	var node = new SumOfUs.TrackNode({occupied : false});
	expect( (function(){car.moveTo(node1)}) ).toThrow();
    });
});
