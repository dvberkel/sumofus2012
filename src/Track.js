(function(_, Backbone, SumOfUs, undefined){

    //TrackNodes represent locations on the track, they can be connected to other nodes.
    //TrackSegments represent larger sections of the track, they consist of multiple nodes.
    //Segments have connectors to link them together.
    //Tracks represent the whole track, they consist of several segments.

    var TrackNode = Backbone.Model.extend({
        defaults : { directions : [],
	             connections : [] }
    });

    var TrackSegment = Backbone.Model.extend({
    });

    var Track = Backbone.Model.extend({
    });

    SumOfUs.TrackNode = TrackNode;
    SumOfUs.TrackSegment = TrackSegment;
    SumOfUs.Track = Track;
})(_,Backbone, SumOfUs)
