(function(_, Backbone, SumOfUs, undefined){
    var CyclopView = Backbone.View.extend({
	initialize : function(){
	    this.render();
	},

	render : function(){
	    var paper = this.paper();
	    paper.circle(320, 240, 120);
	},
	
	paper : function(){
	    return this.options.paper;
	}
    });

    SumOfUs.CyclopView = CyclopView;
})(_, Backbone, SumOfUs);
