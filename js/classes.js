
var LightRay = function(posx, posy, theta, lambda) {
    this.posx = posx;
    this.posy = posy;
    this.theta = theta;
    this.dx = Math.cos(theta);
    this.dy = Math.sin(theta);
    this.lambda = lambda;
    this.power = 1;
    this.history = [];
};
LightRay.prototype.change_direction = function (intersectx, intersecty, theta, powerLoss) {
    var bias = 1  / Math.max(Math.abs(Math.cos(this.theta)), Math.abs(Math.sin(this.theta)));
    this.history.push([this.posx, this.posy, intersectx, intersecty, this.power * bias]);
    this.power *= powerLoss;
    this.posx = intersectx;
    this.posy = intersecty;
    this.theta = theta;
    this.dx = Math.cos(theta);
    this.dy = Math.sin(theta);
};

var Scene = function() {
    this.objects = [];
    this.numBounces = 6;
    this.lightSource = null;
    this.lightRaysToRender = [];

    this.objects.push(new Line(0, 0, 1, 0, 0, 0));
    this.objects.push(new Line(0, 0, 0, 1, 0, 0));
    this.objects.push(new Line(0, 1, 1, 1, 0, 0));
    this.objects.push(new Line(1, 0, 1, 1, 0, 0));
};
Scene.prototype.addObject = function(obj) {
    this.objects.push(obj);
};
Scene.prototype.setLightSource = function (lightSource) {
    this.lightSource = lightSource;
};
Scene.prototype.addLightRays = function(num) {
    for (var i = 0; i < num; i++) {
        this.addLightRay();
    }
};
Scene.prototype.addLightRay = function () {
    var ray = this.lightSource.getLightRay();

    for (var i = 0; i < this.numBounces; i++) {
        var intersections = [];
        var distances = [];
        for (var j = 0; j < this.objects.length; j++) {
            var intersection = this.objects[j].intersect(ray);
            if (intersection != null) {
                intersections.push(intersection);
                distances.push(intersection[0]);
            }
        }

        if (distances.length == 0) {
            console.error("NO COLLISION");
            ray.change_direction(ray.posx + ray.dx, ray.posy + ray.dy, 0, 0);
        } else {
            var close = intersections[vec_imin(distances)];
            ray.change_direction(close[1], close[2], close[3], close[4]);
        }
        if (ray.power < 0.1) {
            break;
        }
    }

    this.lightRaysToRender.push(ray);
};

var Line = function(startx, starty, endx, endy, reflectivity, roughness) {
    this.startx = startx;
    this.starty = starty;
    this.endx = endx;
    this.endy = endy;
    if ((this.endx - this.startx) == 0) {
        this.grad = Math.POSITIVE_INFINITY;
        this.theta = Math.PI / 2;
    } else {
        this.grad = (this.endy - this.starty) / (this.endx - this.startx);
        this.theta = Math.atan(this.grad)
    }
    this.dx = this.endx - this.startx;
    this.dy = this.endy - this.starty;
    this.reflectivity = reflectivity;
    this.roughness = roughness;
};

Line.prototype.intersect = function(lightray) {
    if (lightray.theta == this.theta || lightray.theta + Math.PI == this.theta || lightray.theta == this.theta + Math.PI) {
        return null;
    }

    var dist_ray = (this.dx * (lightray.posy - this.starty) - (this.dy * (lightray.posx - this.startx))) / (this.dy * lightray.dx - this.dx * lightray.dy);
    if (dist_ray < 0.001) {
        return null;
    }
    var dist_line = 0;
    if (this.dx != 0) {
        dist_line = (lightray.posx - this.startx + dist_ray * lightray.dx) / this.dx;
    } else {
        dist_line = (lightray.posy - this.starty + dist_ray * lightray.dy) / this.dy;

    }
    if (dist_line > 1 || dist_line < 0) {
        return null;
    }
    var intersectx = lightray.posx + dist_ray * lightray.dx;
    var intersecty = lightray.posy + dist_ray * lightray.dy;

    var angle = (2 * Math.PI + 2 * this.theta - lightray.theta) % (2 * Math.PI);
    angle = rand_deflection(angle, this.roughness, this.theta);
    return [dist_ray, intersectx, intersecty, angle, this.reflectivity];
};
Line.prototype.render = function(c, w, h) {
    c.lineWidth = 4;
    c.strokeStyle = "#FF0000";
    c.beginPath();
    c.moveTo(w * this.startx, h * this.starty);
    c.lineTo(w * this.endx, h * this.endy);
    c.stroke();
};


nmToRGB = function (wavelength) {


    var Gamma = 0.90,
        IntensityMax = 255,
        factor, red, green, blue;
    if ((wavelength >= 380) && (wavelength < 440)) {
        red = -(wavelength - 440) / (440 - 380);
        green = 0.0;
        blue = 1.0;
    } else if ((wavelength >= 440) && (wavelength < 490)) {
        red = 0.0;
        green = (wavelength - 440) / (490 - 440);
        blue = 1.0;
    } else if ((wavelength >= 490) && (wavelength < 510)) {
        red = 0.0;
        green = 1.0;
        blue = -(wavelength - 510) / (510 - 490);
    } else if ((wavelength >= 510) && (wavelength < 580)) {
        red = (wavelength - 510) / (580 - 510);
        green = 1.0;
        blue = 0.0;
    } else if ((wavelength >= 580) && (wavelength < 645)) {
        red = 1.0;
        green = -(wavelength - 645) / (645 - 580);
        blue = 0.0;
    } else if ((wavelength >= 645) && (wavelength < 781)) {
        red = 1.0;
        green = 0.0;
        blue = 0.0;
    } else {
        red = 0.0;
        green = 0.0;
        blue = 0.0;
    }
    // Let the intensity fall off near the vision limits
    if ((wavelength >= 380) && (wavelength < 420)) {
        factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
    } else if ((wavelength >= 420) && (wavelength < 701)) {
        factor = 1.0;
    } else if ((wavelength >= 701) && (wavelength < 781)) {
        factor = 0.3 + 0.7 * (780 - wavelength) / (780 - 700);
    } else {
        factor = 0.0;
    }
    if (red !== 0) {
        red = Math.round(IntensityMax * Math.pow(red * factor, Gamma));
    }
    if (green !== 0) {
        green = Math.round(IntensityMax * Math.pow(green * factor, Gamma));
    }
    if (blue !== 0) {
        blue = Math.round(IntensityMax * Math.pow(blue * factor, Gamma));
    }
    return [red, green, blue];
};
toHex = function (number) {
    //converts a decimal number into hex format
    var hex = number.toString(16);
    if (hex.length < 2) {
        hex = "0" + hex;
    }
    return hex;
};
rgbToHex = function (color) {
    //takes an 3 element array (r,g,b) and returns a hexadecimal color
    var hexString = '#';
    for (var i = 0; i < 3; i++) {
        hexString += this.toHex(Math.floor(color[i]));
    }
    return hexString;
};
var LightSource = function(posx, posy) {
    this.posx = posx;
    this.posy = posy;
};
LightSource.prototype.getLightRay = function() {
    var theta = 2 * Math.PI * Math.random();
    // var theta = -0.8 + 0.2 * Math.PI * Math.random();
    var wavelength = Math.random() * (700 - 400) + 400;
    return new LightRay(this.posx, this.posy, theta, wavelength);
};