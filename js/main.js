var canvas = document.getElementById("mainCanvas");
var canvas2 = document.getElementById("hiddenCanvas");

var scene = new Scene();
scene.setLightSource(new LightSource(0.5, 0.5));

scene.addObject(new Line(0.1, 0.85, 0.30, 0.99, 0.0, 0.5, 0.0));
scene.addObject(new Line(0.7, 0.20, 0.95, 0.70, 0.0, 0.0, 1.0));
scene.addObject(new Line(0.1, 0.30, 0.30, 0.10, 0.0, 0.0, 0.0));
scene.addObject(new Box(0.3, 0.1, 0.2, 0.2, 0.2, 0.0, 0.0, 1.7, 0.0));
scene.addObject(new Cylinder(0.7, 0.58, 0.08, 0.0, 0.0, 1.5, 0.0));

scene.addObject(new Cylinder(0.1, 0.50, 0.1, 0.0, 0.2, 1.2, 0.));

// scene.addObject(new Prism(0.7, 0.55, 0.2, 0.2, 3.14, 0.0, 0.0, 1.2, 0.0));
scene.addObject(new Prism(0.3, 0.55, 0.2, 0.2, 3.14, 0.0, 0.0, 1.2, 0.0));

// scene.addObject(new Cylinder(0.4, 0.50, 0.3, 0.0, 0.3, 1.1, 0.0));


var renderer = new Renderer(canvas, canvas2, scene, 500, 9);

window.setInterval(renderer.render.bind(renderer), 100);
