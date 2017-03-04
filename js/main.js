var canvas = document.getElementById("mainCanvas");
var canvas2 = document.getElementById("hiddenCanvas");

var scene = new Scene();
scene.setLightSource(new LightSource(0.5, 0.5));
scene.addObject(new Line(0.1, 0.85, 0.3, 0.99, 0.5, 0.0));
scene.addObject(new Box(0.3, 0.1, 0.2, 0.2, 0.2, 1.7));
scene.addObject(new Line(0.7, 0.2, 0.95, 0.7, 1.0, 1.0));
scene.addObject(new Line(0.1, 0.3, 0.3, 0.1, 1.0, 0.0));
scene.addObject(new Cylinder(0.7, 0.58, 0.1, 1.5));
// scene.addObject(new Line(0.5, 0.1, 0.4, 0.4, 1.0, 0.0));
// scene.addObject(new Line(0.4, 0.4, 0.5, 0.1, 1.0, 0.0));

var renderer = new Renderer(canvas, canvas2, scene, 500);

window.setInterval(renderer.render.bind(renderer), 100);
