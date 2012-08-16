(function($, Raphael, SumOfUs, undefined){
    $(function(){
	var paper = Raphael("viewport", 640, 480);
	paper.rect(0, 0, 640, 480).attr({ fill : "#ffffff" });

	new SumOfUs.CyclopView({ paper : paper });
    });
})(jQuery, Raphael, SumOfUs);
