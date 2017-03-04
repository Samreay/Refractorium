


var Scene = function() {
    this.objects = [];
    this.lightSources = [];
    this.lightRaysToRender = [];

    this.totalBrightness = 0;
    this.objects.push(new Line(0, 0, 1, 0, 1, 0, 0));
    this.objects.push(new Line(0, 0, 0, 1, 1, 0, 0));
    this.objects.push(new Line(0, 1, 1, 1, 1, 0, 0));
    this.objects.push(new Line(1, 0, 1, 1, 1, 0, 0));
};
Scene.prototype.addObject = function(obj) {
    this.objects.push(obj);
};
Scene.prototype.addLightSource = function (lightSource) {
    this.lightSources.push(lightSource);
    this.totalBrightness += lightSource.brightness;
};
Scene.prototype.addLightRays = function(num, numBounces) {
    var raysPerBrightness = num / this.totalBrightness;
    var rays = [];
    for (var j = 0; j < this.lightSources.length; j++) {
        var source = this.lightSources[j];
        rays = rays.concat(source.getLightRays(Math.floor(source.brightness * raysPerBrightness)));
    }
    for (var i = 0; i < rays.length; i++) {
        this.simulateLightRay(rays[i], numBounces);
    }
};
Scene.prototype.simulateLightRay = function (ray, numBounces) {

    for (var i = 0; i < numBounces; i++) {
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
            ray.change_direction(ray.posx + ray.dx, ray.posy + ray.dy, 0, 0, 0);
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


var Line = function(startx, starty, endx, endy, absorption, reflectivity, roughness) {
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
    this.normal = Math.atan2(this.dy, this.dx) + 0.5 * Math.PI;
    this.absorption = absorption;
    this.reflectivity = reflectivity;
    this.roughness = roughness;
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
    c.moveTo(w * this.startx, h * this.starty);
    c.lineTo(w * this.endx, h * this.endy);
    c.stroke();
};





var Box = function(startx, starty, width, height, theta, absorption, reflectivity, refractive, roughness) {
    this.startx = startx;
    this.starty = starty;
    this.width = width;
    this.height = height;
    this.theta = theta;
    this.absorption = absorption;
    this.reflectivity = reflectivity;
    this.refractive = refractive;
    this.roughness = roughness;

    var gamma = theta + 0.5 * Math.PI;
    this.p2x = startx + height * Math.cos(gamma);
    this.p2y = starty + height * Math.sin(gamma);
    this.p3x = startx + width * Math.cos(theta);
    this.p3y = starty + width * Math.sin(theta);
    this.p4x = this.p3x + height * Math.cos(gamma);
    this.p4y = this.p3y + height * Math.sin(gamma);

    this.lines = [];
    this.lines.push(new Line(startx, starty, this.p2x, this.p2y, 0.0, 1.0, 0.0));
    this.lines.push(new Line(startx, starty, this.p3x, this.p3y, 0.0, 1.0, 0.0));
    this.lines.push(new Line(this.p2x, this.p2y, this.p4x, this.p4y, 0.0, 1.0, 0.0));
    this.lines.push(new Line(this.p3x, this.p3y, this.p4x, this.p4y, 0.0, 1.0, 0.0));

};
Box.prototype.render = function(c, w, h, strokeStyle, fillStyle) {
    c.fillStyle = fillStyle;
    c.strokeStyle = strokeStyle;
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




var Prism = function(startx, starty, width, height, theta, absorption, reflectivity, refractive, roughness) {
    this.startx = startx;
    this.starty = starty;
    this.width = width;
    this.height = height;
    this.theta = theta;
    this.absorption = absorption;
    this.reflectivity = reflectivity;
    this.refractive = refractive;
    this.roughness = roughness;

    var gamma = theta + 0.5 * Math.PI;
    this.p2x = startx + width * Math.cos(theta);
    this.p2y = starty + width * Math.sin(theta);
    this.p3x = startx + 0.5 * width * Math.cos(theta) + height * Math.cos(gamma);
    this.p3y = starty + 0.5 * width * Math.sin(theta) + height * Math.sin(gamma);


    this.lines = [];
    this.lines.push(new Line(startx, starty, this.p2x, this.p2y, 0.0, 1.0, 0.0));
    this.lines.push(new Line(startx, starty, this.p3x, this.p3y, 0.0, 1.0, 0.0));
    this.lines.push(new Line(this.p2x, this.p2y, this.p3x, this.p3y, 0.0, 1.0, 0.0));

};
Prism.prototype.render = function(c, w, h, strokeStyle, fillStyle) {
    c.fillStyle = fillStyle;
    c.strokeStyle = strokeStyle;
    c.lineWidth = 0.5;
    c.beginPath();
    c.moveTo(w * this.startx, h * this.starty);
    c.lineTo(w * this.p2x, h * this.p2y);
    c.lineTo(w * this.p3x, h * this.p3y);
    c.lineTo(w * this.startx, h * this.starty);
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
    c.arc(this.posx * w, this.posy * h, this.radius * w, 0, 2 * Math.PI, false);
    c.fillStyle = fillStyle;
    c.strokeStyle = strokeStyle;
    c.lineWidth = 0.5;
    c.fill();
    c.stroke();
};
Cylinder.prototype.intersect = function(ray) {
    var dx = ray.dx;
    var dy = ray.dy;
    var dr2 = dx * dx + dy * dy;
    var posx = ray.posx - this.posx;
    var posy = ray.posy - this.posy;
    var d = posx * (posy + dy) - (posx + dx) * posy;

    var discriminant = this.radius * this.radius * dr2 - d * d;
    if (discriminant <= 0) {
        return null;
    }
    var sqrt_discriminant = Math.sqrt(discriminant);

    var x1 = (d * dy + Math.sign(dy) * dx * sqrt_discriminant) / (dr2);
    var x2 = (d * dy - Math.sign(dy) * dx * sqrt_discriminant) / (dr2);
    var y1 = (-d * dx + Math.abs(dy) * sqrt_discriminant) / (dr2);
    var y2 = (-d * dx - Math.abs(dy) * sqrt_discriminant) / (dr2);

    var dist1 = (x1 + this.posx - ray.posx) / ray.dx;
    var dist2 = (x2 + this.posx - ray.posx) / ray.dx;
    if (dist1 < 0.001 && dist2 < 0.001) {
        return null;
    }
    if (dist1 < 0.001) {
        dist1 = 9e9;
    }
    if (dist2 < 0.001) {
        dist2 = 9e9;
    }
    var dist_ray = Math.min(dist1, dist2);
    var intersectx = dist1 < dist2 ? x1 + this.posx : x2 + this.posx;
    var intersecty = dist1 < dist2 ? y1 + this.posy : y2 + this.posy;

    var dirx = intersectx - this.posx;
    var diry = intersecty - this.posy;
    var theta = Math.atan2(diry, dirx);
    var result = get_angle_permeable(ray, theta, this.absorption, this.reflectivity, this.refractive, this.roughness);
    return [dist_ray, intersectx, intersecty, result[0], result[1], result[2]];


};
