var width = 1080, height = 720;

// width *= 1.5;
// height *= 1.5;

var canvas = document.getElementById("mainCanvas");
var canvas2 = document.getElementById("hiddenCanvas");


var renderer = new Renderer(canvas, canvas2, 500, 19);

function switchPlots() {
    renderer.showFinal = !renderer.showFinal;
    return false;
}

canvas.addEventListener("dblclick", switchPlots, false);
canvas2.addEventListener("dblclick", switchPlots, false);


window.setInterval(renderer.render.bind(renderer), 200);

