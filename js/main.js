var canvas = document.getElementById("mainCanvas");
var canvas2 = document.getElementById("hiddenCanvas");

var width = 1080, height = 720;

var canvasDiv = document.getElementById("canvases");
var canvas = document.createElement("canvas");
canvas.setAttribute("id", "mainCanvas");
canvas.setAttribute("width", String(width));
canvas.setAttribute("height", String(height));
canvasDiv.appendChild(canvas);
var canvas2 = document.createElement("canvas");
canvas2.setAttribute("id", "hiddenCanvas");
canvas2.setAttribute("width", String(width));
canvas2.setAttribute("height", String(height));
canvas2.setAttribute("style", "display: none;");
canvasDiv.appendChild(canvas2);

var scene = new Scene(width / height);
scene.addLightSource(new PointSource(1.0, 0.5, 0.5));
// scene.addLightSource(new ConeSource(1.0, 0.7, 0.4, 0.5, 0.25));
// scene.addLightSource(new BeamSource(1.0, 0.7, 0.4, 0.1, 3.14));
scene.addLightSource(new LaserSource(0.2, 0.7, 0.4, 2.8));

scene.addObject(new Line(0.1, 0.83, 0.30, 0.99, 0.0, 0.5, 0.0));
scene.addObject(new Line(0.7, 0.20, 0.95, 0.70, 0.0, 0.0, 1.0));
scene.addObject(new Line(0.1, 0.30, 0.30, 0.10, 0.0, 0.0, 0.0));
scene.addObject(new Box(0.3, 0.1, 0.2, 0.2, 0.2, 0.0, 0.0, 1.7, 0.0));
scene.addObject(new Cylinder(0.7, 0.58, 0.08, 0.0, 0.0, 1.5, 0.0));

scene.addObject(new Cylinder(0.15, 0.50, 0.14, 0.0, 0.2, 1.2, 0.));

// scene.addObject(new Prism(0.7, 0.55, 0.2, 0.2, 3.14, 0.0, 0.0, 1.2, 0.0));
scene.addObject(new Prism(0.4, 0.58, 0.2, 0.2, 3.14, 0.0, 0.0, 1.2, 0.0));

// scene.addObject(new Cylinder(0.4, 0.50, 0.3, 0.0, 0.3, 1.1, 0.0));


var renderer = new Renderer(canvas, canvas2, scene, 500, 19);

function switchPlots() {
    renderer.showFinal = !renderer.showFinal;
    return false;
}

canvas.addEventListener("dblclick", switchPlots, false);
canvas2.addEventListener("dblclick", switchPlots, false);


window.setInterval(renderer.render.bind(renderer), 100);

