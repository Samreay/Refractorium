


var Scene = function(aspect) {
    this.objects = [];
    this.lightSources = [];
    this.lightRaysToRender = [];
    this.aspect = aspect;

    this.totalBrightness = 0;
    // this.objects.push(new Line(0, 0, aspect, 0, 1, 0, 0));
    // this.objects.push(new Line(0, 0, 0, aspect, 1, 0, 0));
    // this.objects.push(new Line(0, 1, aspect, 1, 1, 0, 0));
    // this.objects.push(new Line(aspect, 0, aspect, 1, 1, 0, 0));
};
Scene.prototype.addObject = function(obj) {
    this.objects.push(obj);
    if (obj.brightness != undefined) {
        this.totalBrightness += obj.brightness;
    }
};
Scene.prototype.addLightRays = function(num, numBounces) {
    var lightSources = [];
    for (var i = 0; i < this.objects.length; i++) {
        if (this.objects[i].brightness != undefined) {
            lightSources.push(this.objects[i]);
        }
    }
    var raysPerBrightness = num / this.totalBrightness;
    var rays = [];
    for (var j = 0; j < lightSources.length; j++) {
        var source = lightSources[j];
        rays = rays.concat(source.getLightRays(Math.floor(source.brightness * raysPerBrightness)));
    }
    for (i = 0; i < rays.length; i++) {
        this.simulateLightRay(rays[i], numBounces);
    }
};
Scene.prototype.simulateLightRay = function (ray, numBounces) {

    for (var i = 0; i < numBounces; i++) {
        var intersections = [];
        var distances = [];
        for (var j = 0; j < this.objects.length; j++) {
            if (this.objects[j].brightness != undefined) {
                continue;
            }
            var intersection = this.objects[j].intersect(ray);
            if (intersection != null) {
                intersections.push(intersection);
                distances.push(intersection[0]);
            }
        }

        if (distances.length == 0) {
            ray.change_direction(ray.posx + 10 * ray.dx, ray.posy + 10 * ray.dy, 0, 0, 0);
        } else {
            var close = intersections[vec_imin(distances)];
            ray.change_direction(close[1], close[2], close[3], close[4], close[5]);
        }
        if (ray.power < 0.1) {
            break;
        }
    }

    this.lightRaysToRender.push(ray);
};


var Line = function(posx, posy, theta, height, absorption, reflectivity, roughness) {
    this.posx = posx;
    this.posy = posy;
    this.theta = theta;
    this.height = height;
    this.absorption = absorption;
    this.reflectivity = reflectivity;
    this.roughness = roughness;
    this.init();
};
Line.prototype.init = function() {
    this.startx = this.posx - 0.5 * this.height * Math.cos(this.theta);
    this.starty = this.posy - 0.5 * this.height * Math.sin(this.theta);
    this.endx = this.posx + 0.5 * this.height * Math.cos(this.theta);
    this.endy = this.posy + 0.5 * this.height * Math.sin(this.theta);
    this.dx = this.endx - this.startx;
    this.dy = this.endy - this.starty;
    this.normal = this.theta + 0.5 * Math.PI;
};
Line.prototype.intersect = function(ray) {
    if (ray.theta == this.theta || ray.theta + Math.PI == this.theta || ray.theta == this.theta + Math.PI) {
        return null;
    }

    var dist_ray = (this.dx * (ray.posy - this.starty) - (this.dy * (ray.posx - this.startx))) / (this.dy * ray.dx - this.dx * ray.dy);
    if (dist_ray < 0.001) {
        return null;
    }
    var dist_line = 0;
    if (this.dx != 0) {
        dist_line = (ray.posx - this.startx + dist_ray * ray.dx) / this.dx;
    } else {
        dist_line = (ray.posy - this.starty + dist_ray * ray.dy) / this.dy;

    }
    if (dist_line > 1 || dist_line < 0) {
        return null;
    }
    var intersectx = ray.posx + dist_ray * ray.dx;
    var intersecty = ray.posy + dist_ray * ray.dy;

    var result = get_angle_permeable(ray, this.normal, this.absorption, this.reflectivity, null, this.roughness);
    return [dist_ray, intersectx, intersecty, result[0], result[1], result[2]];

};
Line.prototype.render = function(c, w, h, strokeStyle, fillStyle) {
    c.lineWidth = 2;
    c.strokeStyle = strokeStyle;
    c.beginPath();
    c.moveTo(h * this.startx, h * this.starty);
    c.lineTo(h * this.endx, h * this.endy);
    c.stroke();
};
Line.prototype.getName = function() {
    var type = "Beam Splitter";
    if (this.reflectivity > 0.9) {
        if (this.roughness < 0.05) {
            type = "Mirror";
        } else {
            type = "Wall"
        }
    }
    if (this.absorption > 0.99) {
        type = "Wall";
    }
    return type + " at (" + this.startx.toFixed(2) + ", " + this.starty.toFixed(2) + ")";
};





var Box = function(posx, posy, width, height, theta, absorption, reflectivity, refractive, roughness) {
    this.posx = posx;
    this.posy = posy;
    this.width = width;
    this.height = height;
    this.theta = theta;
    this.absorption = absorption;
    this.reflectivity = reflectivity;
    this.refractive = refractive;
    this.roughness = roughness;

    this.init();
};
Box.prototype.init = function() {
    var gamma = this.theta + 0.5 * Math.PI;
    this.p1x = this.posx + 0.5 * (-this.width * Math.cos(this.theta) + this.height * Math.cos(gamma));
    this.p1y = this.posy + 0.5 * (this.width * Math.sin(this.theta) - this.height * Math.sin(gamma));
    this.p2x = this.posx + 0.5 * (this.width * Math.cos(this.theta) + this.height * Math.cos(gamma));
    this.p2y = this.posy + 0.5 * (-this.width * Math.sin(this.theta) - this.height * Math.sin(gamma));
    this.p3x = this.posx + 0.5 * (this.width * Math.cos(this.theta) - this.height * Math.cos(gamma));
    this.p3y = this.posy - 0.5 * (this.width * Math.sin(this.theta) - this.height * Math.sin(gamma));
    this.p4x = this.posx - 0.5 * (this.width * Math.cos(this.theta) + this.height * Math.cos(gamma));
    this.p4y = this.posy + 0.5 * (this.width * Math.sin(this.theta) + this.height * Math.sin(gamma));

    this.lines = [];
    this.lines.push(new Line(this.posx - this.width * 0.5 * Math.cos(this.theta), this.posy + this.width * 0.5 * Math.sin(this.theta), -gamma, this.height, 0.0, 1.0, 0.0));
    this.lines.push(new Line(this.posx + this.width * 0.5 * Math.cos(this.theta), this.posy - this.width * 0.5 * Math.sin(this.theta), -gamma, this.height, 0.0, 1.0, 0.0));
    this.lines.push(new Line(this.posx + this.height * 0.5 * Math.cos(gamma), this.posy - this.height * 0.5 * Math.sin(gamma), -this.theta, this.width, 0.0, 1.0, 0.0));
    this.lines.push(new Line(this.posx - this.height * 0.5 * Math.cos(gamma), this.posy + this.height * 0.5 * Math.sin(gamma), -this.theta, this.width, 0.0, 1.0, 0.0));

};
Box.prototype.render = function(c, w, h, strokeStyle, fillStyle) {
    c.fillStyle = fillStyle;
    c.strokeStyle = strokeStyle;
    c.lineWidth = 0.5;
    c.beginPath();
    c.moveTo(h * this.p1x, h * this.p1y);
    c.lineTo(h * this.p2x, h * this.p2y);
    c.lineTo(h * this.p3x, h * this.p3y);
    c.lineTo(h * this.p4x, h * this.p4y);
    c.lineTo(h * this.p1x, h * this.p1y);
    c.fill();
    c.stroke()
};
Box.prototype.intersect = function(ray) {
    var intersections = [];
    var distances = [];
    var normals = [];
    for (var j = 0; j < this.lines.length; j++) {
        var intersection = this.lines[j].intersect(ray);
        if (intersection != null) {
            intersections.push(intersection);
            distances.push(intersection[0]);
            normals.push(this.lines[j].normal)
        }
    }
    if (distances.length == 0) {
        return null;
    }
    var close = intersections[vec_imin(distances)];
    var normal = normals[vec_imin(distances)];

    var result = get_angle_permeable(ray, normal, this.absorption, this.reflectivity, this.refractive, this.roughness);
    close[3] = result[0];
    close[4] = result[1];
    close[5] = result[2];
    return close;
};
Box.prototype.getName = function() {
    return "Box at (" + this.posx.toFixed(2) + ", " + this.posy.toFixed(2) + ")";
};



var Prism = function(posx, posy, radius, theta, absorption, reflectivity, refractive, roughness) {
    this.posx = posx;
    this.posy = posy;
    this.radius = radius;
    this.theta = theta;
    this.absorption = absorption;
    this.reflectivity = reflectivity;
    this.refractive = refractive;
    this.roughness = roughness;
    this.init();
};
Prism.prototype.init = function() {

    var r2 = this.radius * Math.sin(Math.PI / 6);
    var length = 2 * this.radius * Math.cos(Math.PI / 6);

    this.c1x = this.posx + r2 * Math.cos(this.theta);
    this.c1y = this.posy + r2 * Math.sin(this.theta);
    this.c2x = this.posx + r2 * Math.cos(this.theta + Math.PI * 2 / 3);
    this.c2y = this.posy + r2 * Math.sin(this.theta + Math.PI * 2 / 3);
    this.c3x = this.posx + r2 * Math.cos(this.theta + Math.PI * 4 / 3);
    this.c3y = this.posy + r2 * Math.sin(this.theta + Math.PI * 4 / 3);

    this.lines = [];
    this.lines.push(new Line(this.c1x, this.c1y, Math.PI * 0.5 + this.theta, length, 0.0, 1.0, 0.0));
    this.lines.push(new Line(this.c2x, this.c2y, Math.PI * 0.5 + this.theta + Math.PI * 2 / 3, length, 0.0, 1.0, 0.0));
    this.lines.push(new Line(this.c3x, this.c3y, Math.PI * 0.5 + this.theta + Math.PI * 4 / 3, length, 0.0, 1.0, 0.0));

    this.p1x = this.lines[0].startx;
    this.p1y = this.lines[0].starty;
    this.p2x = this.lines[1].startx;
    this.p2y = this.lines[1].starty;
    this.p3x = this.lines[2].startx;
    this.p3y = this.lines[2].starty;
};
Prism.prototype.render = function(c, w, h, strokeStyle, fillStyle) {
    c.fillStyle = fillStyle;
    c.strokeStyle = strokeStyle;
    c.lineWidth = 0.5;
    c.beginPath();
    c.moveTo(h * this.p1x, h * this.p1y);
    c.lineTo(h * this.p2x, h * this.p2y);
    c.lineTo(h * this.p3x, h * this.p3y);
    c.lineTo(h * this.p1x, h * this.p1y);
    c.fill();
    c.stroke()
};
Prism.prototype.intersect = function(ray) {
    var intersections = [];
    var distances = [];
    var normals = [];
    for (var j = 0; j < this.lines.length; j++) {
        var intersection = this.lines[j].intersect(ray);
        if (intersection != null) {
            intersections.push(intersection);
            distances.push(intersection[0]);
            normals.push(this.lines[j].normal)
        }
    }
    if (distances.length == 0) {
        return null;
    }
    var close = intersections[vec_imin(distances)];
    var normal = normals[vec_imin(distances)];

    var result = get_angle_permeable(ray, normal, this.absorption, this.reflectivity, this.refractive, this.roughness);
    close[3] = result[0];
    close[4] = result[1];
    close[5] = result[2];
    return close;
};
Prism.prototype.getName = function() {
    return "Prism at (" + this.posx.toFixed(2) + ", " + this.posy.toFixed(2) + ")";
};






var Cylinder = function(posx, posy, radius, absorption, reflectivity, refractive, roughness) {
    this.posx = posx;
    this.posy = posy;
    this.radius = radius;
    this.absorption = absorption;
    this.refractive = refractive;
    this.reflectivity = reflectivity;
    this.roughness = roughness;
};
Cylinder.prototype.render = function(c, w, h, strokeStyle, fillStyle) {
    c.beginPath();
    c.arc(this.posx * h, this.posy * h, this.radius * h, 0, 2 * Math.PI, false);
    c.fillStyle = fillStyle;
    c.strokeStyle = strokeStyle;
    c.lineWidth = 0.5;
    c.fill();
    c.stroke();
};
Cylinder.prototype.intersect = function(ray) {
    var intersects = circleIntersect(ray, this.posx, this.posy, this.radius, null, null);
    if (intersects == null) {
        return null;
    }
    var result = get_angle_permeable(ray, intersects[3], this.absorption, this.reflectivity, this.refractive, this.roughness);
    return [intersects[0], intersects[1], intersects[2], result[0], result[1], result[2]];
};
Cylinder.prototype.getName = function() {
    return "Cylinder at (" + this.posx.toFixed(2) + ", " + this.posy.toFixed(2) + ")";
};




var ConvexLens = function(posx, posy, height, theta, bulge, absorption, reflectivity, refractive, roughness) {
    this.posx = posx;
    this.posy = posy;
    this.height = height;
    this.theta = theta;
    this.bulge = bulge;

    this.absorption = absorption;
    this.reflectivity = reflectivity;
    this.refractive = refractive;
    this.roughness = roughness;

    this.init();
};
ConvexLens.prototype.init = function() {
    this.offset = 0.5 * this.height / Math.tan(this.bulge);
    this.radius = 0.5 * this.height / Math.sin(this.bulge);
    this.c1x = this.posx + this.offset * Math.cos(this.theta);
    this.c2x = this.posx - this.offset * Math.cos(this.theta);
    this.c1y = this.posy + this.offset * Math.sin(this.theta);
    this.c2y = this.posy - this.offset * Math.sin(this.theta);
};
ConvexLens.prototype.render = function(c, w, h, strokeStyle, fillStyle) {
    c.beginPath();
    c.arc(this.c1x * h, this.c1y * h, this.radius * h,  this.theta + Math.PI + this.bulge,  this.theta + Math.PI - this.bulge, true);
    c.arc(this.c2x * h, this.c2y * h, this.radius * h, this.theta + this.bulge, this.theta - this.bulge, true);
    c.fillStyle = fillStyle;
    c.strokeStyle = strokeStyle;
    c.lineWidth = 0.5;
    c.fill();
    c.stroke();
};
ConvexLens.prototype.intersect = function(ray) {
    var intersect1 = circleIntersect(ray, this.c1x, this.c1y, this.radius, this.theta + Math.PI - this.bulge, this.theta + Math.PI + this.bulge);
    var intersect2 = circleIntersect(ray, this.c2x, this.c2y, this.radius, this.theta - this.bulge, this.theta + this.bulge);
    var intersects;
    if (intersect1 == null && intersect2 == null) {
        return null;
    } else if (intersect1 == null) {
        intersects = intersect2;
    } else if (intersect2 == null) {
        intersects = intersect1;
    } else {
        if (intersect1[0] < intersect2[0]) {
            intersects = intersect1;
        } else {
            intersects = intersect2;
        }
    }
    var result = get_angle_permeable(ray, intersects[3], this.absorption, this.reflectivity, this.refractive, this.roughness);
    return [intersects[0], intersects[1], intersects[2], result[0], result[1], result[2]];
};
ConvexLens.prototype.getName = function() {
    return "ConvexLens at (" + this.posx.toFixed(2) + ", " + this.posy.toFixed(2) + ")";
};