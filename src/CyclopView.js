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
				"direction" : "r90",
			});
			new SumOfUs.CarView({ model : car1, paper : paper });
			 

			var car2 = new SumOfUs.Car();
			car2.set({
				"position" : {"x" : 100, "y" : 200},
				"speed" : 3,
				"color" : "red",
				"direction" : "r180",
			});
			new SumOfUs.CarView({ model : car2, paper : paper });

			var car3 = new SumOfUs.Car();
			car3.set({
				"position" : {"x" : 400, "y" : 100},
				"speed" : 0,
				"color" : "orange",
				"direction" : "r0",
			});
			new SumOfUs.CarView({ model : car3, paper : paper });
		},

		paper : function(){
			return this.options.paper;
		}
	});

	SumOfUs.CyclopView = CyclopView;
})(_, Backbone, SumOfUs);
