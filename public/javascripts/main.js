var video = $("#video").get(0);
var $output = $("#output");
var canvas = $("#canvas").get(0);
var gif;
var captureImage = function() {



    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var ctx = canvas.getContext('2d');


    gif = new GIF({
        workers: 4,
        quality: 10,
        height: canvas.height,
        width: canvas.width,
        workerScript: 'http://localhost:3000/javascripts/gif.worker.js'
    });

    gif.on('start', function() {
        console.log('start');
    });

    gif.on('finished', function (blob) {
        console.log("100%\n\n" + ((blob.size / 1000).toFixed(2)) + "kb");
        $output.attr('src', URL.createObjectURL(blob));
    });
    gif.on('progress', function (p) {
        console.log("Rendering  frame(s) at q" + gif.options.quality + "... " + (Math.round(p * 100)) + "%");
    });

    video.pause();
    video.currentTime = start;
    video.play();

    var timer = Date.now();
    var frameCapture = function() {

    }

    // add a image element
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    gif.addFrame(ctx, {copy: true, delay: 10});

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






/*
    Mask Drawing
 */
var mousePressed = false;
var lastX, lastY;
var $maskCanvas = $('#mask-canvas');
var maskCtx = document.getElementById('mask-canvas').getContext('2d');
document.getElementById('mask-canvas').height = $maskCanvas.height();
document.getElementById('mask-canvas').width = $maskCanvas.width();

$maskCanvas.mousedown(function (e) {
    mousePressed = true;
    Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
});

$maskCanvas.mousemove(function (e) {
    if (mousePressed) {
        Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
    }
});

$maskCanvas.mouseup(function (e) {
    mousePressed = false;
});

$maskCanvas.mouseleave(function (e) {
    mousePressed = false;
});

function Draw(x, y, isDown) {
    if (isDown) {
        maskCtx.beginPath();
        maskCtx.strokeStyle = 'red';//$('#selColor').val();
        maskCtx.lineWidth = 15;//$('#selWidth').val();
        maskCtx.lineJoin = "round";
        maskCtx.moveTo(lastX, lastY);
        maskCtx.lineTo(x, y);
        maskCtx.closePath();
        maskCtx.stroke();
    }
    lastX = x; lastY = y;
}

function clearArea() {
    // Use the identity matrix while clearing the canvas
    maskCtx.setTransform(1, 0, 0, 1, 0, 0);
    maskCtx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

