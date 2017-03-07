

var Renderer = function(width, height, finalCanvas, hiddenCanvas, numRaysPerFrame, numBounces) {
    this.finalCanvas = finalCanvas;
    this.finalCtx = finalCanvas.getContext('2d');
    this.hiddenCanvas = hiddenCanvas;
    this.hiddenCtx = hiddenCanvas.getContext('2d');
    this.scene = null;
    this.numRaysPerFrame = numRaysPerFrame;
    this.numBounces = numBounces;
    this.exposure = 2.0;

    this.image = null;
    this.busy = false;

    this.lineWidthScale = 0.5;

    this.w = width;
    this.h = height;
    this.tempBuffer = null;
    this.finalBuffer = null;
    this.backgroundBuffer = null;

    this.showFinal = true;

    this.strokeStyle = "rgba(255, 255, 255, 0.2)";
    // this.strokeStyle = "#FF0000";
    this.fillStyle = "rgba(100, 100, 100, 0.1)";
    // this.fillStyle = "rgba(0, 0, 0, 0)";
};
Renderer.prototype.updateDimensions = function(w, h) {
    this.w = w;
    this.h = h;
    this.init();
};
Renderer.prototype.setScene = function(scene) {
    this.scene = scene;
    this.init();
};
Renderer.prototype.init = function() {
    this.initFinalCanvas();
    this.drawBackground()
};
Renderer.prototype.initFinalCanvas = function() {
    this.finalBuffer = new Float32Array(this.w * this.h * 4);
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
    this.image = c.getImageData(0, 0, this.w, this.h);
    c.fillRect(0, 0, this.w, this.h);
    var imageData = c.getImageData(0, 0, this.w, this.h).data;
    this.tempBuffer = new Float32Array(imageData.length);
    for (var i = 0; i < this.scene.objects.length; i++) {
        if (this.scene.objects[i].render != undefined) {
            this.scene.objects[i].render(c, this.w, this.h, this.strokeStyle, this.fillStyle);
        }
    }
    this.backgroundBuffer = c.getImageData(0, 0, this.w, this.h).data.slice(0);
};
Renderer.prototype.renderFrame = function() {
    var ctx = this.hiddenCtx;
    var w = this.w;
    var h = this.h;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);
    this.scene.addLightRays(this.numRaysPerFrame, this.numBounces);

    for (var i = 0; i < this.scene.lightRaysToRender.length; i++) {
        var ray = this.scene.lightRaysToRender[i];
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
    this.scene.lightRaysToRender = [];
    var ret = ctx.getImageData(0, 0, this.w, this.h).data;
    return ret;
};
Renderer.prototype.render = function() {
    if (this.scene == null) {
        return;
    }
    if (!this.busy) {
        this.busy = true;
        var frameBuffer = this.renderFrame();
        if (this.showFinal) {
            vec_add(this.tempBuffer, frameBuffer);
            // vec_normalise_channels(this.tempBuffer, this.finalBuffer);
            var totalBrightness = this.scene.getTotalBrightness();
            vec_normalise(this.tempBuffer, this.finalBuffer, totalBrightness * this.exposure);
            vec_add(this.finalBuffer, this.backgroundBuffer);
            vec_clip(this.finalBuffer, this.image.data);
        } else {
            vec_clip(frameBuffer, this.image.data);
        }
        this.finalCtx.putImageData(this.image, 0, 0);
        this.busy = false;
    }
};