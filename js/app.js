

angular.module('refractorium', ['servicesZ'])

    .controller('MainController', ['scenesService', function(scenesService) {
        var self = this;

        self.scenes = scenesService.getScenes();
        self.selectedObject = null;
        self.selectedObjectProperties = [];
        var aspect = 1.5;

        self.selectScene = function(scene) {
            renderer.setScene(scene.scene);
        };

        self.getSceneObjects = function() {
            return renderer.scene.objects;
        };
        self.getSceneLights = function() {
            return renderer.scene.lightSources;
        };

        self.selectObject = function(object) {
            self.selectedObject = object;
            self.computeObjectProperties();
        };
        self.computeObjectProperties = function() {
            self.selectedObjectProperties = [];
            var o = self.selectedObject;
            if (o == null) {
                return;
            }
            if (o.posx != undefined) {
                self.selectedObjectProperties.push({key: "posx", label: "Position x", value: o.posx, minv: 0, maxv: 1.5})
            }
            if (o.posy != undefined) {
                self.selectedObjectProperties.push({key: "posy", label: "Position y", value: o.posy, minv: 0, maxv: 1})
            }
            if (o.theta != undefined) {
                self.selectedObjectProperties.push({key: "theta", label: "Angle", value: o.theta, minv: 0, maxv: 2 * Math.PI})
            }
            if (o.width != undefined) {
                self.selectedObjectProperties.push({key: "width", label: "Width", value: o.width, minv: 0, maxv: 1})
            }
            if (o.height != undefined) {
                self.selectedObjectProperties.push({key: "height", label: "Height", value: o.height, minv: 0, maxv: 1})
            }
            if (o.radius != undefined) {
                self.selectedObjectProperties.push({key: "radius", label: "Radius", value: o.radius, minv: 0, maxv: 1})
            }
            if (o.absorption != undefined) {
                self.selectedObjectProperties.push({key: "absorption", label: "Absorption", value: o.absorption, minv: 0, maxv: 1})
            }
            if (o.reflectivity != undefined) {
                self.selectedObjectProperties.push({key: "reflectivity", label: "Reflectivity", value: o.reflectivity, minv: 0, maxv: 1})
            }
            if (o.refractive != undefined) {
                self.selectedObjectProperties.push({key: "refractive", label: "Refractive Index", value: o.refractive, minv: 1, maxv: 3})
            }
            if (o.absorption != undefined) {
                self.selectedObjectProperties.push({key: "roughness", label: "Roughness", value: o.roughness, minv: 0, maxv: 1})
            }
        };
        self.getSelectedObjectProperties = function() {
            return self.selectedObjectProperties;
        };
        self.updateProperty = function(property) {
            self.selectedObject[property.key] = property.value;
            if (self.selectedObject.init != undefined) {
                self.selectedObject.init();
            }
            renderer.init();
        };

        self.selectScene(self.scenes[0]);


    }]);

