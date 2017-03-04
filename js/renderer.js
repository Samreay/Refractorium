

var Renderer = function(finalCanvas, hiddenCanvas, scene, numRaysPerFrame, numBounces) {
    this.finalCanvas = finalCanvas;
    this.finalCtx = finalCanvas.getContext('2d');
    this.hiddenCanvas = hiddenCanvas;
    this.hiddenCtx = hiddenCanvas.getContext('2d');
    this.scene = scene;
    this.numRaysPerFrame = numRaysPerFrame;
    this.numBounces = numBounces;

    this.lineWidthScale = 0.5;

    this.w = null;
    this.h = null;
    this.tempBuffer = null;
    this.finalBuffer = null;
    this.backgroundBuffer = null;

    this.showFinal = true;

    this.strokeStyle = "rgba(255, 255, 255, 0.2)";
    // this.strokeStyle = "#FF0000";
    this.fillStyle = "rgba(100, 100, 100, 0.1)";
    // this.fillStyle = "rgba(0, 0, 0, 0)";
    this.init();
};
Renderer.prototype.init = function() {
    this.initFinalCanvas();
    this.drawBackground()
};
Renderer.prototype.initFinalCanvas = function() {
    var w = this.finalCanvas.width;
    var h = this.finalCanvas.height;
    this.w = w;
    this.h = h;
    this.finalBuffer = new Float32Array(w * h * 4);
    this.finalBuffer.fill(0);

};
Renderer.prototype.drawBackground = function() {
    if (this.w != this.hiddenCanvas.width) {
        console.error("Canvases are diff width");
    }
    if (this.h != this.hiddenCanvas.height) {
        console.error("Canvases are diff height");
    }
    var c = this.hiddenCtx;
    c.fillStyle = "#111111";
    c.fillRect(0, 0, this.w, this.h);
    var imageData = c.getImageData(0, 0, this.w, this.h).data;
    this.tempBuffer = new Float32Array(imageData.length);
    for (var i = 0; i < this.scene.objects.length; i++) {
        this.scene.objects[i].render(c, this.w, this.h, this.strokeStyle, this.fillStyle);
    }
    this.backgroundBuffer = c.getImageData(0, 0, this.w, this.h).data.slice(0);
};
Renderer.prototype.renderFrame = function() {
    var ctx = this.hiddenCtx;
    var w = this.w;
    var h = this.h;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);
    scene.addLightRays(this.numRaysPerFrame, this.numBounces);

    for (var i = 0; i < scene.lightRaysToRender.length; i++) {
        var ray = scene.lightRaysToRender[i];
        var colour = rgbToString(nmToRGB(ray.lambda));
        ctx.strokeStyle = colour;

        for (var j = 0; j < ray.history.length; j++) {
            ctx.beginPath();
            ctx.moveTo(ray.history[j][0] * h, ray.history[j][1] * h);
            ctx.lineTo(ray.history[j][2] * h, ray.history[j][3] * h);
            ctx.lineWidth = this.lineWidthScale * ray.history[j][4];
            ctx.stroke();
        }
    }
    scene.lightRaysToRender = [];
    var ret = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    return ret;
};
Renderer.prototype.render = function() {
    var image = this.finalCtx.getImageData(0, 0, this.w, this.h);

    var frameBuffer = this.renderFrame();
    if (this.showFinal) {
        vec_add(this.tempBuffer, frameBuffer);
        vec_normalise_channels(this.tempBuffer, this.finalBuffer);
        vec_add(this.finalBuffer, this.backgroundBuffer);
        vec_clip(this.finalBuffer, image.data);
    } else {
        vec_clip(frameBuffer, image.data);
    }


    this.finalCtx.putImageData(image, 0, 0);

};