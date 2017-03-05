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
scene.addLightSource(new PointSource(1.0, 0.8, 0.3));
// scene.addLightSource(new PointSource(1.0, 0.8, 0.5));
// scene.addLightSource(new ConeSource(1.0, 0.7, 0.4, 0.5, 0.25));
// scene.addLightSource(new BeamSource(1.0, 0.7, 0.4, 0.1, 3.14));
// scene.addLightSource(new LaserSource(0.2, 1.2, 0.01, 2.62));
scene.addLightSource(new ConeSource(0.2, 1.2, 0.01, 2.62 / (2 * Math.PI), 0.0003));
// scene.addLightSource(new ConeSource(1, 0.2, 0.45, 0, 0.003));
// scene.addLightSource(new BeamSource(1.0, 0.1, 0.45, 0.1, 0));

if (true) {
    scene.addObject(new Line(0.1, 0.83, 0.30, 0.99, 0.0, 0.5, 0.0));
    scene.addObject(new Line(1.3, 0.20, 1.0, 0.60, 0.0, 0.0, 1.0));
    scene.addObject(new Line(1.4, 0.20, 1.4, 0.80, 0.0, 0.0, 1.0));
    scene.addObject(new Line(0.1, 0.30, 0.30, 0.10, 0.0, 0.0, 0.0));
    scene.addObject(new Box(0.5, 0.01, 0.2, 0.2, 0.1, 0.0, 0.0, 1.7, 0.0));
    scene.addObject(new Cylinder(0.7, 0.58, 0.12, 0.0, 0.0, 1.5, 0.0));

    scene.addObject(new Cylinder(0.15, 0.50, 0.14, 0.0, 0.2, 1.2, 0.));

    scene.addObject(new Prism(0.4, 0.58, 0.2, 0.2, 3.14, 0.0, 0.0, 1.2, 0.0));

// Beam splitter
    scene.addObject(new Line(0.38, 0.4, 0.38, 0.51, 0.0, 0.5, 0.001));
    scene.addObject(new Line(1, 0.64, 1, 0.66, 1.0, 0.0, 0.0));
    scene.addObject(new ConvexLens(0.9, 0.4, 0.2, 1.1, 0.8, 0, 0, 1.5, 0));

// scene.addObject(new Cylinder(0.4, 0.50, 0.3, 0.0, 0.3, 1.1, 0.0));

}
// scene.addObject(new Cylinder(0.8, 0.8, 0.12, 0.0, 0.0, 1.5, 0.0));
// scene.addObject(new ConvexLens(0.3, 0.5, 0.2, 0, 0.9, 0, 0, 1.5, 0));
// scene.addObject(new ConvexLens(0.7, 0.1, 0.2, 1.1, 0.9, 0, 0, 1.5, 0));
// scene.addObject(new ConvexLens(1, 0.5, 0.2, 0, 0.5, 0, 0, 1.5, 0));

var renderer = new Renderer(canvas, canvas2, scene, 500, 19);

function switchPlots() {
    renderer.showFinal = !renderer.showFinal;
    return false;
}

canvas.addEventListener("dblclick", switchPlots, false);
canvas2.addEventListener("dblclick", switchPlots, false);


window.setInterval(renderer.render.bind(renderer), 100);

