var LightRay = function(posx, posy, theta, lambda) {
    theta = (Math.PI * 3 + theta) % (2 * Math.PI) - Math.PI;
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
    theta = (Math.PI * 3 + theta) % (2 * Math.PI) - Math.PI;
    this.theta = theta;
    this.dx = Math.cos(theta);
    this.dy = Math.sin(theta);
    if (mediumChange == 1) {
        this.inMedium = !this.inMedium;
    }
};


var PointSource = function(brightness, posx, posy) {
    this.posx = posx;
    this.posy = posy;
    this.brightness = brightness;
};
PointSource.prototype.getLightRays = function(num) {
    var rays = [];
    for (var i = 0; i < num; i++) {
        var offset = 2 * Math.PI * Math.random() / num;
        var wavelength = Math.random() * (670 - 400) + 400;
        var theta_chunk = 2 * Math.PI * i / num;
        var ray = new LightRay(this.posx, this.posy, offset + theta_chunk, wavelength);
        rays.push(ray);
    }
    return rays;
};


var ConeSource = function(brightness, posx, posy, dir, arc) {
    this.posx = posx;
    this.posy = posy;
    this.dir = (dir - 0.5 * arc) * 2 * Math.PI;
    this.arc = arc;
    this.brightness = brightness;
};
ConeSource.prototype.getLightRays = function(num) {
    var rays = [];
    for (var i = 0; i < num; i++) {
        var offset = this.arc * 2 * Math.PI * Math.random() / num;
        var wavelength = Math.random() * (670 - 400) + 400;
        var theta_chunk = this.arc * 2 * Math.PI * i / num;
        var ray = new LightRay(this.posx, this.posy, this.dir + offset + theta_chunk, wavelength);
        rays.push(ray);

    }
    return rays;
};

var BeamSource = function(brightness, posx, posy, width, theta) {
    this.posx = posx;
    this.posy = posy;
    this.width = width;
    this.theta = theta;
    this.endx = posx + width * Math.cos(theta + 0.5 * Math.PI);
    this.endy = posy + width * Math.sin(theta + 0.5 * Math.PI);
    this.dx = this.endx - posx;
    this.dy = this.endy - posy;
    this.brightness = brightness;
};
BeamSource.prototype.getLightRays = function(num) {
    var rays = [];
    for (var i = 0; i < num; i++) {
        var length = (i + Math.random()) / num;
        var px = this.posx + this.dx * length;
        var py = this.posy + this.dy * length;

        var wavelength = Math.random() * (670 - 400) + 400;
        var ray = new LightRay(px, py, this.theta, wavelength);
        rays.push(ray);

    }
    return rays;
};

var LaserSource = function(brightness, posx, posy, theta) {
    this.posx = posx;
    this.posy = posy;
    this.theta = theta;
    this.dx = this.endx - posx;
    this.dy = this.endy - posy;
    this.brightness = brightness;
};
LaserSource.prototype.getLightRays = function(num) {
    var rays = [];
    for (var i = 0; i < num; i++) {
        var wavelength = Math.random() * (780 - 350) + 350;
        var ray = new LightRay(this.posx, this.posy, this.theta, wavelength);
        rays.push(ray);

    }
    return rays;
};

nmToRGB = function (wavelength) {
    var Gamma = 0.90,
        IntensityMax = 255,
        factor, red, green, blue;

    var t1 = 350, t2 = 460, t3 = 520, t4 = 540, t5 = 580, t6 = 670, t7 = 781;
    if ((wavelength >= t1) && (wavelength < t2)) {
        red = -(wavelength - t2) / (t2 - t1);
        green = 0.0;
        blue = 1.0;
    } else if ((wavelength >= t2) && (wavelength < t3)) {
        red = 0.0;
        green = (wavelength - t2) / (t3 - t2);
        blue = 1.0;
    } else if ((wavelength >= t3) && (wavelength < t4)) {
        red = 0.0;
        green = 1.0;
        blue = -(wavelength - t4) / (t4 - t3);
    } else if ((wavelength >= t4) && (wavelength < t5)) {
        red = (wavelength - t4) / (t5 - t4);
        green = 1.0;
        blue = 0.0;
    } else if ((wavelength >= t5) && (wavelength < t6)) {
        red = 1.0;
        green = -(wavelength - t6) / (t6 - t5);
        blue = 0.0;
    } else if ((wavelength >= t6) && (wavelength < t7)) {
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