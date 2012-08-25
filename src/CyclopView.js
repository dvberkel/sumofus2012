(function(_, Backbone, SumOfUs, undefined){

	var CyclopView = Backbone.View.extend({
		initialize : function(){
			this.render();
		},

		render : function(){
			var paper = this.paper();
			
			var car1 = new SumOfUs.Car();
			car1.set({
				"position" : {"x" : 200, "y" : 300}, 
				"speed" : 3,
				"color" : "lightblue",
				"direction" : 90,
			});
			new SumOfUs.CarView({ model : car1, paper : paper });
			 

			var car2 = new SumOfUs.Car();
			car2.set({
				"position" : {"x" : 100, "y" : 200},
				"speed" : 3,
				"color" : "red",
				"direction" : 180,
			});
			new SumOfUs.CarView({ model : car2, paper : paper });

			var demoTrack = new SumOfUs.Track();
			var road = demoTrack.addSegment(
				"road", {width : 2, length : 2, npcTraffic : "twoway"}
			);
			new SumOfUs.RoadView({
				model : road,
				paper : paper,
				direction : "right",
				beginPoint : {x : 100, y : 100},
				endPoint : {x : 200, y : 150},
			});

			var car3 = new SumOfUs.Car();
			car3.set({
				"position" : {"x" : 400, "y" : 100},
				"speed" : 0,
				"color" : "orange",
				"direction" : 0,
			});
			new SumOfUs.CarView({ model : car3, paper : paper });
		},

		paper : function(){
			return this.options.paper;
		}
	});

	SumOfUs.CyclopView = CyclopView;
})(_, Backbone, SumOfUs);
