(function(_, Backbone, SumOfUs, undefined){
    var Timer = Backbone.Model.extend({
        defaults : {
	    secondsElapsed : 0,
	    duration : 30,
	    running : false,
	    intervalID : undefined,
	    callback : undefined
	},

        start : function(seconds, callback){
	    if(this.get("running")){
	        return;
	    }
	    this.set("secondsElapsed",0);
	    this.set("duration", seconds);
	    this.set("running",true);
	    this.set("callback",callback);
	    var intervalID = window.setInterval(this.secondPassed.bind(this),1000);
	    this.set("intervalID",intervalID);
	},

	resume : function(){
	    if(this.get("secondsElapsed") >= this.get("duration")){
	        return;
	    }
	    var intervalID = window.setInterval(this.secondPassed.bind(this),1000);
	    this.set("intervalID",intervalID);
	    this.set("running",true);
	},

	stop : function(){
	    this.set("running",false);
	    window.clearInterval(this.get("intervalID"));
	},

	secondPassed : function(){
	    var seconds = this.get("secondsElapsed");
	    seconds += 1;
	    this.set("secondsElapsed",seconds);
	    if(seconds >= this.get("duration")){
	        this.stop();
		this.get("callback")();
	    }
	},

	isRunning : function(){
	    return this.get("running");
	},

	hasElapsed : function(){
	    return this.get("secondsElapsed") == this.get("duration");
	}
    });

    var TimerView = Backbone.View.extend({
        initialize : function(){
	    this.clock();
	    this.model.bind("change", function(){
	        this.render();
	    }, this);
	},

	clock : function(){
	    var paper = this.options.paper;
	    var boundingRect = paper.rect( this.options.x, this.options.y,
	                                   this.options.width, this.options.height);
	    boundingRect.attr("fill", "white");
	    var insideRect = paper.rect( this.options.x+2, this.options.y +2, 0, this.options.height -4);
	    insideRect.attr("fill", "green");
	    insideRect.attr("stroke","green");
	    this.insideRect = insideRect;
	    this.maxWidth = this.options.width - 4
	},

	render : function(){
	    var percentage = this.model.get("secondsElapsed")/this.model.get("duration");
	    this.insideRect.attr("width", this.maxWidth*percentage);
	    if(percentage > 0.85){
	        this.insideRect.attr("fill","red");
	        this.insideRect.attr("stroke","red");
	    } else if(percentage > 0.66 ){
	        this.insideRect.attr("fill","e0e030");
	        this.insideRect.attr("stroke","e0e030");
	    } else {
	        this.insideRect.attr("fill","green");
	        this.insideRect.attr("stroke","green");
	    }
	},
	
	paper : function() {
	    return this.options.paper;
	},
    });

    SumOfUs.Timer = Timer;
    SumOfUs.TimerView = TimerView;
})(_, Backbone, SumOfUs);
