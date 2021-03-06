

angular.module('refractorium', ['servicesZ', 'rzModule'])

    .controller('MainController', ['scenesService', '$timeout', function(scenesService, $timeout) {
        var self = this;

        self.width = 1280;
        self.height = 720;
        self.selectedSize = 720;

        self.canvas = document.getElementById("mainCanvas");
        self.canvas2 = document.getElementById("hiddenCanvas");
        self.canvases = document.getElementById("canvases");
        self.renderer = new Renderer(self.width, self.height, self.canvas, self.canvas2, 500, 19);

        self.switchPlots = function() {
            self.renderer.showFinal = !self.renderer.showFinal;
        };

        angular.element(document).ready(function () {
            self.renderer.init();
            window.setInterval(self.renderer.render.bind(self.renderer), 25);

        });

        self.scenes = scenesService.getScenes();
        self.activeScene = self.scenes[0].name;
        self.activeSceneObj = self.scenes[0].scene;
        self.sceneObjects = [];
        self.activeObjectIndex = null;
        self.selectedObject = null;
        self.selectedObjectProperties = [];
        self.activeObject = null;
        self.mouseDownAndSelected = false;
        self.xdown = null;
        self.ydown = null;
        self.generator = new Generator();
        self.renderSettingVisible = false;

        self.sizes = [{label: "Fill", height: null}, {label: "720p", height: 720}, {label: "1080p", height: 1080}];
        self.resize = function(height) {
            self.selectedSize = height;
            if (height == null) {
                var w = self.canvases.clientWidth;
                var h1 = self.canvases.clientHeight;
                var h2 = w / (16.0/9.0);
                height = Math.min(h1, h2);
            }
            self.width = height * (16.0/9.0);
            self.height = height;
            $timeout(function() {
                self.renderer.updateDimensions(self.width, self.height);
            }, 50);
        };
        window.onresize = function() {
            if (self.selectedSize == null) {
                self.resize(null);
            }
        };
        self.clickRenderSettings = function() {
            self.renderSettingVisible = !self.renderSettingVisible;
            self.selectedObject = null;
            self.selectedObjectProperties = [];
            self.activeObjectIndex = null;
        };
        self.addObject = function(objtype) {
            self.activeObjectIndex = "" + self.generator.addObjectToScene(self.activeSceneObj.scene, objtype);
            self.sceneObjects = self.activeSceneObj.scene.objects;
            self.selectObject();
            self.renderer.init();
        };
        self.addLight = function(objtype) {
            self.activeObjectIndex =  "" +self.generator.addLightToScene(self.activeSceneObj.scene, objtype);
            self.sceneObjects = self.activeSceneObj.scene.objects;
            self.selectObject();
            self.renderer.init();
        };

        self.selectScene = function() {
            for (var i = 0; i < self.scenes.length; i++) {
                if (self.scenes[i].name == self.activeScene) {
                    self.activeSceneObj = self.scenes[i];
                    self.renderer.setScene(self.scenes[i].scene);
                    break;
                }
            }
            self.sceneObjects = self.activeSceneObj.scene.objects;
        };
        self.isScene = function(scene) {
            return self.renderer.scene == scene.scene;
        };
        self.getSceneLights = function() {
            return self.renderer.scene.lightSources;
        };
        self.getObjName = function() {
            if (self.selectedObject == null) {
                return "";
            }
            return self.selectedObject.getName();
        };
        self.selectObject = function() {
            self.selectedObject = self.sceneObjects[self.activeObjectIndex];
            self.renderSettingVisible = false;
            self.computeObjectProperties();
        };
        self.removeObject = function() {
            self.activeSceneObj.scene.objects.splice(self.activeObjectIndex, 1);
            self.activeObjectIndex = null;
            self.selectedObject = null;
            self.renderer.init();
        };
        self.getSelectedObjectProperties = function() {
            return self.selectedObjectProperties;
        };
        self.updateProperty = function(property, value) {
            if (property == "posx") {
                value *=  (16.0/9.0);
            }
            self.selectedObject[property] = value;
            if (self.selectedObject.init != undefined) {
                self.selectedObject.init();
            }
            self.renderer.init();
        };


        self.canvasClick = function($event) {
            var objectIndex = self.activeSceneObj.scene.getObjectFromClick($event.offsetX / self.height, $event.offsetY / self.height);
            self.activeObjectIndex = "" + objectIndex;
            self.selectObject();
            if (self.activeObjectIndex != "") {
                self.mouseDownAndSelected = true;
                self.xdown = $event.offsetX;
                self.ydown = $event.offsetY;
            }
            if($event.stopPropagation) $event.stopPropagation();
            if($event.preventDefault) $event.preventDefault();
            $event.cancelBubble = true;
            $event.returnValue = false
        };

        self.canvasMouseUp = function($event) {
            self.mouseDownAndSelected = false;
        };
        self.canvasMouseLeave = function($event) {
            self.mouseDownAndSelected = false;
        };
        self.canvasMouseMove = function($event) {
            if (self.mouseDownAndSelected) {
                var moveDist2 = ($event.offsetX - self.xdown) * ($event.offsetX - self.xdown) + ($event.offsetY - self.ydown) * ($event.offsetY - self.ydown);
                if (moveDist2 < 20) {
                    return;
                }
                var x = $event.offsetX / self.height;
                var y = $event.offsetY / self.height;
                self.selectedObject.posx = x;
                self.selectedObject.posy = y;
                if (self.selectedObject.init != undefined) {
                    self.selectedObject.init();
                }
                self.renderer.init();
                self.computeObjectProperties()
            } else {
                var objectIndex = self.activeSceneObj.scene.getObjectFromClick($event.offsetX / self.height, $event.offsetY / self.height);
                if (objectIndex != null) {
                    self.canvas.style.cursor = "pointer";
                    self.canvas2.style.cursor = "pointer";
                } else {
                    self.canvas.style.cursor = "crosshair";
                    self.canvas2.style.cursor = "crosshair";
                }
            }
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
                self.selectedObjectProperties.push({key: "posx", label: "Position x", value: o.posx / (16.0/9.0),  options: {floor: 0, ceil: 1, step: 0.001, precision: 3}})
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
            ceil: 30,
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
            ceil: 8,
            step: 0.1,
            precision: 1
        };
        self.selectScene(self.scenes[0].name);


    }]);

