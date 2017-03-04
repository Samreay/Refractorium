var canvas = document.getElementById("mainCanvas");
var canvas2 = document.getElementById("hiddenCanvas");

var scene = new Scene();
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

window.setInterval(renderer.render.bind(renderer), 100);
