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
	expect(car).not.toBeAnNPC();
	expect(car).toHaveDelayChance(0);
	expect(car).toHavePassedCheckpoints([]);
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
	expect(node1).toBeOccupiedBy(car);

	car.moveTo(node2,"B",3)
	expect(car).toBeAt(node2);
	expect(node1).not.toBeOccupied();
        expect(node2).toBeOccupiedBy(car);
    });

    it("shouldn't be able to move to occupied positions", function(){
	var node = new SumOfUs.TrackNode({occupiedBy : new SumOfUs.Car()});
	expect( (function(){car.moveTo(node)}) ).toThrow();
    });

    it("should be able to pass checkpoints", function(){
	var node1 = new SumOfUs.TrackNode({directions : ["A"]});
	car.moveTo(node1,"A",2,["a","b","c"]);
	expect(car).toHavePassedCheckpoints(["a","b","c"]);
    });

    it("should have undefined direction when stopping, unless it's an npc", function(){
        var npcdir = SumOfUs.NPC_DIRECTION;
	var node1 = new SumOfUs.TrackNode({directions : ["A"]});
	var node2 = new SumOfUs.TrackNode({directions : ["A"]});
	var node3 = new SumOfUs.TrackNode({directions : [npcdir]});
	var node4 = new SumOfUs.TrackNode({directions : [npcdir]});
        var npcCar = new SumOfUs.Car({npc : true});

	car.moveTo(node1,"A",2);
	expect(car).toHaveADefinedDirection();
	car.decreaseSpeedTo(0);
	expect(car).not.toHaveADefinedDirection();
	car.moveTo(node2,"A",2);
	expect(car).toHaveADefinedDirection();
	car.moveTo(node1,"A",0);
	expect(car).not.toHaveADefinedDirection();


	npcCar.moveTo(node3,npcdir,2);
	expect(npcCar).toBeGoingInDirection(npcdir);
	npcCar.decreaseSpeedTo(0);
	expect(npcCar).toBeGoingInDirection(npcdir);
	npcCar.moveTo(node4,npcdir,2);
	npcCar.moveTo(node3,npcdir,0);
	expect(npcCar).toBeGoingInDirection(npcdir);
    });

    it("should be able to hesitate", function(){
        car = new SumOfUs.Car({delayChance : 0, speed : 5});
        car.hesitate();
        car.hesitate();
        car.hesitate();
        expect(car).toHaveSpeed(5);

        car = new SumOfUs.Car({delayChance : 1, speed : 5});
        car.hesitate();
        car.hesitate();
        car.hesitate();
        expect(car).toHaveSpeed(2);
        car.hesitate();
        car.hesitate();
        car.hesitate();
        expect(car).toHaveSpeed(0);

        car = new SumOfUs.Car({delayChance : 0.5, speed : 5});
        var count4 = 0;
        var count5 = 0;
        for(var i = 0; i < 1000; i++){
            car.hesitate();
            if(car.get("speed") == 4){
                count4++;
            } else if(car.get("speed") == 5){
                count5++;
            }
            car.increaseSpeed();
        }
        expect(count4+count5).toEqual(1000);
        expect(count4).toBeGreaterThan(400);
        expect(count5).toBeGreaterThan(400);
    });
});
