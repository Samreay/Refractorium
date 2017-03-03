var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext('2d');
var canvas2 = document.getElementById("hiddenCanvas");
var ctx2 = canvas2.getContext('2d');

var debugEnabled = true;

var imageData = null;
var image = null;
var floatBuf = null;
var floatBuf2 = null;
var background = null;
var spectrum = getRGBs();
var debug = function (message) {
    if (debugEnabled) {
        console.log(message);
    }
};

var scene = new Scene();
scene.setLightSource(new LightSource(0.5, 0.5));
scene.addObject(new Line(0.7, 0.2, 0.95, 0.7, 1.0, 0.1));
scene.addObject(new Line(0.1, 0.3, 0.3, 0.1, 1.0, 0.0));
scene.addObject(new Line(0.1, 0.85, 0.3, 0.99, 0.5, 0.0));
scene.addObject(new Box(0.3, 0.1, 0.2, 0.2, 0.2, 1.7));
var drawRandomLine = function (ctx, num) {
    ctx.fillStyle = "#000000";
    var w = canvas.width;
    var h = canvas.height;
    ctx.fillRect(0, 0, w, h);
    scene.addLightRays(num);
    for (var i = 0; i < num; i++) {
        var ray = scene.lightRaysToRender[i];

        var colour = rgbToString(nmToRGB(ray.lambda));
        ctx.strokeStyle = colour;

        for (var j = 0; j < ray.history.length; j++) {
            ctx.beginPath();
            ctx.moveTo(ray.history[j][0] * w, ray.history[j][1] * h);
            ctx.lineTo(ray.history[j][2] * w, ray.history[j][3] * h);
            ctx.lineWidth = 0.5 * ray.history[j][4];
            ctx.stroke();
        }
    }
    scene.lightRaysToRender = [];
    var ret = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    return ret;
};




var render = function () {
    debug("Rendering canvas");
    if (imageData == null) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        imageData = image.data;
        floatBuf = new Float32Array(image.data.length);
        for (var i = 0; i < scene.objects.length; i++) {
            scene.objects[i].render(ctx, canvas.width, canvas.height);
        }
        background = ctx.getImageData(0, 0, canvas.width, canvas.height).data.slice(0);
        floatBuf2 = new Float32Array(image.data.length);
        floatBuf2.fill(1);
    }
    image.data = imageData;
    var buf = drawRandomLine(ctx, 500);
    vec_add(floatBuf, buf);
    if (true) {
        vec_power(floatBuf, floatBuf2);
        vec_boost_mean(floatBuf2, floatBuf2, 120);
    } else {
        vec_boost_mean(floatBuf, floatBuf2, 120);
    }
    vec_add(floatBuf2, background);
    vec_clip(floatBuf2, image.data);

    ctx2.putImageData(image, 0, 0);


};

console.log("Done");
// render();
window.setInterval(render, 150);