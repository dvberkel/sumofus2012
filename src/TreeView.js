(function(_, Backbone, SumOfUs, undefined){

	/* Does not really work :( */
	var Shuffle = Backbone.View.extend({
		initialize : function() {
			/* Do nothing */
		},

		Shuffle : function(shuffleList) {
			for (var i = shuffleList.length; i != 0; i--) {
				var j = parseInt(Math.random * i);
				var elm = shuffleList[i];
				shuffleList[i] = shuffleList[j];
				shuffleList[j] = elm;
			}
			
			return shuffleList;
		},
	});

	var TreeView = Backbone.View.extend({
		initialize : function(){
			this.element = this.Tree();
		},

		Tree : function() {
			var color = this.options.color;
			var x = this.options.position.x - 32/2;
			var y = this.options.position.y - 32/2;
			var ratio = this.options.ratio/32;

			var c = this.paper().path("M31.274,15.989c0-2.473-2.005-4.478-4.478-4.478l0,0c0.81-0.811,1.312-1.93,1.312-3.167c0-2.474-2.005-4.479-4.479-4.479c-1.236,0-2.356,0.501-3.167,1.312c0-2.473-2.005-4.478-4.478-4.478c-2.474,0-4.479,2.005-4.479,4.478c-0.811-0.81-1.93-1.312-3.167-1.312c-2.474,0-4.479,2.005-4.479,4.479c0,1.236,0.501,2.356,1.312,3.166c-2.474,0-4.479,2.005-4.479,4.479c0,2.474,2.005,4.479,4.479,4.479c-0.811,0.81-1.312,1.93-1.312,3.167c0,2.473,2.005,4.478,4.479,4.478c1.236,0,2.356-0.501,3.167-1.312c0,2.473,2.005,4.479,4.479,4.479c2.473,0,4.478-2.006,4.478-4.479l0,0c0.811,0.811,1.931,1.312,3.167,1.312c2.474,0,4.478-2.005,4.478-4.478c0-1.237-0.501-2.357-1.312-3.168c0.001,0,0.001,0,0.001,0C29.27,20.467,31.274,18.463,31.274,15.989zM23.583,21.211c0.016,0,0.031-0.001,0.047-0.001z");
			c.attr("fill", color);
			c.transform("t" + x + "," + y + "s" + ratio);
			

			return c;
		},

		paper : function() {
			return this.options.paper;
		},

		render : function() {
			/* Do nothing */
		},
	});

	SumOfUs.TreeView = TreeView;
	SumOfUs.Shuffle = Shuffle;
})(_, Backbone, SumOfUs);
