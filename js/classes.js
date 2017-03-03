
var LightRay = function(posx, posy, theta, lambda) {
    this.posx = posx;
    this.posy = posy;
    this.theta = theta;
    this.dx = Math.cos(theta);
    this.dy = Math.sin(theta);
    this.lambda = lambda;
    this.power = 1;
    this.history = [];
    this.inMedium = false;
};
LightRay.prototype.change_direction = function (intersectx, intersecty, theta, powerLoss, mediumChange) {
    var bias = 1  / Math.max(Math.abs(Math.cos(this.theta)), Math.abs(Math.sin(this.theta)));
    this.history.push([this.posx, this.posy, intersectx, intersecty, this.power * bias]);
    this.power *= powerLoss;
    this.posx = intersectx;
    this.posy = intersecty;
    this.theta = theta;
    this.dx = Math.cos(theta);
    this.dy = Math.sin(theta);
    if (mediumChange == 1) {
        this.inMedium = !this.inMedium;
    }
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
    return [dist_ray, intersectx, intersecty, angle, this.reflectivity, 0];
};
Line.prototype.render = function(c, w, h) {
    c.lineWidth = 2;
    c.strokeStyle = "rgba(255, 255, 255, 0.4)";
    c.beginPath();
    c.moveTo(w * this.startx, h * this.starty);
    c.lineTo(w * this.endx, h * this.endy);
    c.stroke();
};

var Box = function(startx, starty, width, height, theta, refractive) {
    this.startx = startx;
    this.starty = starty;
    this.width = width;
    this.height = height;
    this.theta = theta;
    this.refractive = refractive;

    var gamma = theta + 0.5 * Math.PI;
    this.p2x = startx + height * Math.cos(gamma);
    this.p2y = starty + height * Math.sin(gamma);
    this.p3x = startx + width * Math.cos(theta);
    this.p3y = starty + width * Math.sin(theta);
    this.p4x = this.p3x + height * Math.cos(gamma);
    this.p4y = this.p3y + height * Math.sin(gamma);

    this.lines = [];
    this.lines.push(new Line(startx, starty, this.p2x, this.p2y, 1.0, 0.0));
    this.lines.push(new Line(startx, starty, this.p3x, this.p3y, 1.0, 0.0));
    this.lines.push(new Line(this.p2x, this.p2y, this.p4x, this.p4y, 1.0, 0.0));
    this.lines.push(new Line(this.p3x, this.p3y, this.p4x, this.p4y, 1.0, 0.0));

};
Box.prototype.render = function(c, w, h) {
    c.fillStyle = "rgba(255, 255, 255, 0.3)";
    c.strokeStyle = "rgba(255, 255, 255, 0.7)";
    c.lineWidth = 0.5;
    c.beginPath();
    c.moveTo(w * this.startx, h * this.starty);
    c.lineTo(w * this.p2x, h * this.p2y);
    c.lineTo(w * this.p4x, h * this.p4y);
    c.lineTo(w * this.p3x, h * this.p3y);
    c.lineTo(w * this.startx, h * this.starty);
    c.fill();
    c.stroke()
};
Box.prototype.intersect = function(ray) {
    var intersections = [];
    var distances = [];
    for (var j = 0; j < this.lines.length; j++) {
        var intersection = this.lines[j].intersect(ray);
        if (intersection != null) {
            intersections.push(intersection);
            distances.push(intersection[0]);
        }
    }
    if (distances.length == 0) {
        return null;
    }
    var close = intersections[vec_imin(distances)];
    if (ray.inMedium) {
        var nratio = 1 / this.refractive;
    } else {
        var nratio = this.refractive; // Or 1/n if coming out
    }
    var r_0 = Math.pow((1 - this.refractive) / (this.refractive + 1), 2);
    var theta_out = (Math.PI + ray.theta) % (2 * Math.PI);
    var theta_bounce = (2 * Math.PI + close[3]) % (2 * Math.PI);
    var angle_incidence =  0.5 * Math.min(Math.abs((theta_out - theta_bounce)), Math.abs((2 * Math.PI + theta_out - theta_bounce)));
    var reflectivity = r_0 + (1 - r_0) * Math.pow((1 - Math.cos(angle_incidence)), 5);
    if (Math.random() < reflectivity) {
        if (reflectivity > 1) {
            console.log("wut")
        }
        close[4] *= reflectivity;
    } else {
        var new_angle = (Math.PI + close[3] + angle_incidence) + Math.asin(Math.sin(angle_incidence) / nratio);
        close[3] = (4 * Math.PI + new_angle) % (2 * Math.PI);
        close[4] *= (1 - reflectivity);
        close[5] = 1 - close[5];
    }
    return close;
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
};
rgbToString = function (color) {
    var string = "rgba(";
    for (var i = 0; i < 3; i++) {
        string += this.Math.floor(color[i]) + ", ";
    }
    string += "0.5)";
    return string;
};
var LightSource = function(posx, posy) {
    this.posx = posx;
    this.posy = posy;
};
LightSource.prototype.getLightRay = function() {
    var theta = 2 * Math.PI * Math.random();
    // var theta = -2.5 + 0.3 * Math.PI * Math.random();
    var wavelength = Math.random() * (700 - 400) + 400;
    return new LightRay(this.posx, this.posy, theta, wavelength);
};