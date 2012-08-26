(function(_, Backbone, SumOfUs, undefined){

	var CyclopView = Backbone.View.extend({
		initialize : function(){
			this.render();
		},

		render : function(){
			var paper = this.paper();
			
			var car1 = new SumOfUs.Car();
			car1.set({
				"position" : {"x" : 20, "y" : 20}, 
				"speed" : 3,
				"color" : "lightblue",
				"direction" : 90,
			});
			new SumOfUs.CarView({ model : car1, paper : paper });
			 

			var car2 = new SumOfUs.Car();
			car2.set({
				"position" : {"x" : 20, "y" : 60},
				"speed" : 3,
				"color" : "red",
				"direction" : 180,
			});
			new SumOfUs.CarView({ model : car2, paper : paper });

			var car3 = new SumOfUs.Car();
			car3.set({
				"position" : {"x" : 20, "y" : 100},
				"speed" : 0,
				"color" : "orange",
				"direction" : 0,
			});
			
			new SumOfUs.CarView({ model : car3, paper : paper });
			var demoTrack = new SumOfUs.Track();
			var road = demoTrack.addSegment(
				"road", {width : 2, length : 4, npcTraffic : "twoway"}
			);
			new SumOfUs.RoadView({
				model : road,
				paper : paper,
				direction : "right",
				beginPoint : {x : 100, y : 100},
				endPoint : {x : 100 + 4*60, y : 100 + 2*40},
			});


			crossing = demoTrack.addSegment(
				"crossing", {width : 2, height : 2}
			);
			new SumOfUs.CrossingView({
				model : crossing,
				paper : paper,
				beginPoint : { x : 100+4*60, y : 100-20 },
				endPoint : { x : 100+4*60 + 2*60, y : 100-20 + 2*60 },
			});

			road = demoTrack.addSegment(
				"road", { width : 2, length : 3, npcTraffic : "twoway" }
			);
			new SumOfUs.RoadView({
				model : road,
				paper : paper,
				direction : "up",
				beginPoint : { x : 100+4*60+20, y : 100+2*40+20+3*60 },
				endPoint : { x : 100+4*60+20+2*40, y : 100+2*40+20},
			});

		},

		paper : function(){
			return this.options.paper;
		}
	});

	SumOfUs.CyclopView = CyclopView;
})(_, Backbone, SumOfUs);
