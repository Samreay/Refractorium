angular.module('servicesZ', []).service("scenesService", [function () {
    var self = this;

    var aspect = 1.5;

    var scenes = [];
    var scene;


    scene = new Scene(aspect);
    scene.addObject(new ConeSource(1.0, 0.03, 0.9, 6.0, 0.001));
    scene.addObject(new Line(0.4, 0.7821, 5.3, 0.1, 0.0, 0.2, 0.0));
    scene.addObject(new Cylinder(0.286, 0.315, 0.155, 0.0, 0.0, 1.5, 0.0));
    scene.addObject(new Prism(0.418, 0.493, 0.134, 2.028, 0.0, 0.0, 1.5, 0.0));
    scene.addObject(new ConvexLens(1.058, 0.507, 0.235, 2.243, 0.761, 0.0, 0.0, 1.5, 0.0));
    scene.addObject(new Line(0.75, 0.00, 0, 1.5, 0.0, 1.0, 0.9));
    scene.addObject(new Line(0.75, 1.0, 0, 1.5, 0.0, 1.0, 0.9));
    scene.addObject(new Line(1.4, 0.9, 5.4, 0.2, 0.0, 1.0, 0.05));

    scenes.push({"name": "Bouncing Light", "scene": scene});



    scene = new Scene(aspect);
    scene.addObject(new PointSource(1.0, 0.8, 0.3));
    scene.addObject(new ConeSource(0.1, 0.01, 0.73, 2 * Math.PI - 0.3, 0.0003));

    scene.addObject(new Cylinder(0.17, 0.50, 0.14, 0.0, 0.2, 1.2, 0.));
    scene.addObject(new Prism(0.34, 0.5, 0.12, Math.PI/2, 0.0, 0.0, 1.2, 0.0));
    scene.addObject(new Cylinder(0.694, 0.58, 0.1, 0.0, 0.0, 1.5, 0.0));

    scene.addObject(new Line(0.32, 0.63, 2.15, 0.05, 0.1, 0.1, 0.0));
    scene.addObject(new Line(1.3, 0.4,  2 * Math.PI - 0.8, 0.55, 0.1, 1, 0.01));
    scene.addObject(new Line(1.48, 0.63,  Math.PI/2, 0.5, 0.1, 1, 1));

    scene.addObject(new Line(1.33, 0.75, 0.6, 0.4, 0.1, 1.0, 0.5));
    scene.addObject(new ConvexLens(1.1, 0.43, 0.2, 0.2, 0.9, 0, 0, 1.5, 0));

    scenes.push({"name": "Mixed Bag", "scene": scene});


    scene = new Scene(aspect);
    scene.addObject(new PointSource(1.0, 1.13, 0.5));
    scene.addObject(new Cylinder(0.75, 0.5, 0.23, 0, 0, 1.5, 0));
    scene.addObject(new ConvexLens(0.987, 0.5, 0.231, 0, 0.628, 0, 0, 1.5, 0));
    scene.addObject(new ConvexLens(1.229, 0.586, 0.144, 3.832, 0.692, 0, 0, 1.5, 0));
    scene.addObject(new Line(1.393, 0.731, 5.7, 0.196, 0, 1, 0));
    scene.addObject(new Line(1.179, 0.154, 3.671, 0.251, 0, 1, 0));
    scene.addObject(new Prism(0.825, 0.267, 0.077, 4.992, 0, 0, 1.5, 0));
    scene.addObject(new ConvexLens(1.097, 0.638, 0.21, 1.868, 0.926, 0, 0, 1.6, 0));
    scene.addObject(new Line(1.044, 0.943, 3.478, 0.287, 0, 1, 1));
    scenes.push({"name": "The Cylinder", "scene": scene});




    scene = new Scene(aspect);
    scene.addObject(new PointSource(1.0, 0.75, 0.5));
    scenes.push({"name": "Blank", "scene": scene});

    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        scene = new Scene(aspect);
        scene.addObject(new BeamSource(1.0, 0.13, 0.1, 0.1, 1.0));
        scene.addObject(new Line(0.64, 0.9, 0, 0.2, 0, 1, 0));
        scene.addObject(new Line(0.949, 0.443, 0, 0.2, 0, 0.3, 0));
        scene.addObject(new Line(1.232, 0.9, 0, 0.2, 1, 0, 0));
        scene.addObject(new Line(1.155, 0.1, 0, 0.2, 0.6, 1.0, 0.1));
        scenes.push({"name": "Line Test", "scene": scene});


        scene = new Scene(aspect);
        scene.addObject(new BeamSource(1.0, 0.13, 0.1, 0.1, 0.741));
        scene.addObject(new Box(0.26, 0.215, 0.223, 0.067, 1.642, 0, 0, 1.5, 0));
        scene.addObject(new Box(0.489, 0.471, 0.569, 0.169, 1.642, 0, 0.2, 1.7, 0));
        scene.addObject(new ConvexLens(0.714, 0.518, 0.2, 4.026, 0.29, 0, 0, 1.54, 0));
        scene.addObject(new Prism(1.031, 0.675, 0.186, 1.18, 0, 0.333, 1.5, 0.2));
        scenes.push({"name": "Refractive Test", "scene": scene});
    }

    self.getScenes = function () {
        return scenes;
    }
}]);
