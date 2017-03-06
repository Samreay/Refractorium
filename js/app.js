

angular.module('refractorium', ['servicesZ', 'rzModule'])

    .controller('MainController', ['scenesService', function(scenesService) {
        var self = this;

        self.width = 1080;
        self.height = 720;

        var canvas = document.getElementById("mainCanvas");
        var canvas2 = document.getElementById("hiddenCanvas");

        self.renderer = new Renderer(self.width, self.height, canvas, canvas2, 500, 19);

        self.switchPlots = function() {
            self.renderer.showFinal = !self.renderer.showFinal;
        };

        angular.element(document).ready(function () {
            self.renderer.init();
            window.setInterval(self.renderer.render.bind(self.renderer), 25);

        });

        self.scenes = scenesService.getScenes();
        self.activeScene = self.scenes[0].name;
        self.selectedObject = null;
        self.selectedObjectProperties = [];

        self.selectScene = function() {
            for (var i = 0; i < self.scenes.length; i++) {
                if (self.scenes[i].name == self.activeScene) {
                    self.renderer.setScene(self.scenes[i].scene);
                    break;
                }
            }
        };
        self.isScene = function(scene) {
            return self.renderer.scene == scene.scene;
        };
        self.getSceneObjects = function() {
            return self.renderer.scene.objects;
        };
        self.getSceneLights = function() {
            return self.renderer.scene.lightSources;
        };
        self.getObjName = function() {
            return self.selectedObject.getName();
        };
        self.selectObject = function(object) {
            self.selectedObject = object;
            self.computeObjectProperties();
        };
        self.getSelectedObjectProperties = function() {
            return self.selectedObjectProperties;
        };
        self.updateProperty = function(property, value) {
            self.selectedObject[property] = value;
            if (self.selectedObject.init != undefined) {
                self.selectedObject.init();
            }
            self.renderer.init();
        };
        self.computeObjectProperties = function() {
            self.selectedObjectProperties = [];
            var o = self.selectedObject;
            if (o == null) {
                return;
            }
            if (o.brightness != undefined) {
                self.selectedObjectProperties.push({key: "brightness", label: "Brightness", value: o.brightness, options: {floor: 0, ceil: 2, step: 0.01, precision: 3}})
            }
            if (o.posx != undefined) {
                self.selectedObjectProperties.push({key: "posx", label: "Position x", value: o.posx,  options: {floor: 0, ceil: 1.5, step: 0.001, precision: 3}})
            }
            if (o.posy != undefined) {
                self.selectedObjectProperties.push({key: "posy", label: "Position y", value: o.posy,  options: {floor: 0, ceil: 1, step: 0.001, precision: 3}})
            }
            if (o.theta != undefined) {
                self.selectedObjectProperties.push({key: "theta", label: "Angle", value: o.theta,  options: {floor: 0, ceil: 6.28, step: 0.001, precision: 3}})
            }
            if (o.width != undefined) {
                self.selectedObjectProperties.push({key: "width", label: "Width", value: o.width,  options: {floor: 0, ceil: 1.5, step: 0.001, precision: 3}})
            }
            if (o.height != undefined) {
                self.selectedObjectProperties.push({key: "height", label: "Height", value: o.height,  options: {floor: 0, ceil: 1, step: 0.001, precision: 3}})
            }
            if (o.radius != undefined) {
                self.selectedObjectProperties.push({key: "radius", label: "Radius", value: o.radius,  options: {floor: 0, ceil: 1, step: 0.001, precision: 3}})
            }
            if (o.arc != undefined) {
                self.selectedObjectProperties.push({key: "arc", label: "Arc", value: o.arc,  options: {floor: 0, ceil: 1.57, step: 0.001, precision: 3}})
            }
            if (o.absorption != undefined) {
                self.selectedObjectProperties.push({key: "absorption", label: "Absorption", value: o.absorption, options: {floor: 0, ceil: 1, step: 0.001, precision: 3}})
            }
            if (o.reflectivity != undefined) {
                self.selectedObjectProperties.push({key: "reflectivity", label: "Reflectivity", value: o.reflectivity,  options: {floor: 0, ceil: 1, step: 0.001, precision: 3}})
            }
            if (o.refractive != undefined) {
                self.selectedObjectProperties.push({key: "refractive", label: "Refractive Index", value: o.refractive,  options: {floor: 0, ceil: 3, step: 0.001, precision: 3}})
            }
            if (o.absorption != undefined) {
                self.selectedObjectProperties.push({key: "roughness", label: "Roughness", value: o.roughness,  options: {floor: 0, ceil: 1, step: 0.001, precision: 3}})
            }
            for (var i = 0; i < self.selectedObjectProperties.length; i++) {
                self.selectedObjectProperties[i].options.id = self.selectedObjectProperties[i].key;
                self.selectedObjectProperties[i].options.onChange = function(id, value) {
                    self.updateProperty(id, value)
                };
            }
        };
        self.sliderBounceOptions = {
            floor: 1,
            ceil: 20,
            onChange: function() {
                self.renderer.init();
            }
        };
        self.sliderNumRaysPerFrameOptions = {
            floor: 10,
            ceil: 1000,
            onChange: function() {
                self.renderer.init();
            }
        };
        self.sliderExposureptions = {
            floor: 0.5,
            ceil: 5,
            step: 0.1,
            precision: 1
        };
        self.selectScene(self.scenes[0].name);


    }]);

