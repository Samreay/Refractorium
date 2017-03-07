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
    scene.addObject(new PointSource(1.0, 0.75, 0.5));
    scenes.push({"name": "Blank", "scene": scene});

    if (false) {
        scene = new Scene(aspect);
        scene.addObject(new LaserSource(1.0, 0.88, 0.5, 4.742));
        scene.addObject(new Box(0.75, 0.5, 0.3, 0.3, 0.2, 0.0, 0.0, 0.23, 0.0));
        scenes.push({"name": "Box", "scene": scene});


        scene = new Scene(aspect);
        scene.addObject(new PointSource(1.0, 0.3, 0.5));
        scene.addObject(new ConvexLens(0.7, 0.5, 0.2, 0, 0.6, 0, 0, 1.5, 0));
        scenes.push({"name": "Convex", "scene": scene});
    }

    self.getScenes = function () {
        return scenes;
    }
}]);
