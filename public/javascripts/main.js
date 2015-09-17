var video = $("#video").get(0);
var $output = $("#output");
var canvas = $("#canvas").get(0);

var captureImage = function() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')
        .drawImage(video, 0, 0, canvas.width, canvas.height);

    var gif = new GIF({
        workers: 0,
        quality: 10,
        workerScript: 'http://localhost:3000/javascripts/gif.workers.js'
    });

    // add a image element
    gif.addFrame(canvas, {copy: true});

    gif.on('finished', function (blob) {
        $output.src = URL.createObjectURL(blob);
    });
    gif.on('progress', function (p) {
        console.log("Rendering  frame(s) at q" + gif.options.quality + "... " + (Math.round(p * 100)) + "%");
    });

    gif.render();
};

$('#go').click(captureImage);
$('#toggle').click(function() {
    if(video.paused) {
        video.play();
        $('#toggle').html('Pause');
    } else {
        video.pause();
        $('#toggle').html('Play');
    }
});


var start, stop;
var setLoop = function(s, e) {
    start = s;
    stop = e;
};

video.addEventListener('timeupdate', function() {
    if(video.currentTime > stop || video.currentTime < start) {
        video.currentTime = start;
    }

    $('#progressbar').progressbar({
        value: video.currentTime
    });
});

video.oncanplaythrough = function() { console.log('start');
    video.oncanplaythrough = null;
    start = video.seekable.start(0);
    stop = video.seekable.end(0);
    $('#slider-range').slider({
        range: true,
        step: 0.1,
        min: start,
        max: stop,
        values: [ start, stop ],
        slide: function( event, ui ) {
            setLoop(ui.values[0], ui.values[1]);
        }
    });

    $('#progressbar').progressbar({
        value: start,
        max: stop
    });

    setLoop(start, stop);

    video.muted = true;
};

