function vec_min(vec) {
    var min = 9e9;
    for (var i = 0; i < vec.length; i++) {
        if (vec[i] < min) {
            min = vec[i];
        }
    }
    return min;
}
function vec_imin(vec) {
    var min = 9e9;
    var index = null;
    for (var i = 0; i < vec.length; i++) {
        if (vec[i] < min) {
            min = vec[i];
            index = i;
        }
    }
    return index;
}

function vec_add(a, b) {
    for (var i = 0; i < a.length; i++) {
        a[i] += b[i];
    }
}

function vec_normalise(a, b) {
    var max = -9e9;
    for (var i = 0; i < a.length; i++) {
        if (i % 4 != 0 && a[i] > max) {
            max = a[i];
        }
    }
    for (var i = 0; i < a.length; i++) {
        b[i] = Math.min(255, 3 * 255 * a[i] / max);
    }
    return b;
}
function vec_normalise_channels(a, b) {
    var maxr = -9e9;
    var maxg = -9e9;
    var maxb = -9e9;
    var maxa = -9e9;
    for (var i = 0; i < a.length; i+=4) {
        if (a[i] > maxr) { maxr = a[i]; }
        if (a[i + 1] > maxg) { maxg = a[i + 1]; }
        if (a[i + 2] > maxb) { maxb = a[i + 2]; }
        if (a[i + 3] > maxa) { maxa = a[i + 3]; }
    }
    var boost = 2;
    for (var i = 0; i < a.length; i+=4) {
        b[i] = Math.min(255, boost * 255 * a[i] / maxr);
        b[i + 1] = Math.min(255, boost * 255 * a[i + 1] / maxg);
        b[i + 2] = Math.min(255, boost * 255 * a[i + 2] / maxb);
        b[i + 3] = Math.min(255, boost * 255 * a[i + 3] / maxa);
    }
    return b;
}
function vec_mean(a) {
    var sum = 0;
    for (var i = 0; i < a.length; i++) {
        sum += a[i];
    }
    return sum / a.length;
}
function vec_means(a) {
    var sumr = 0;
    var sumg = 0;
    var sumb = 0;
    var suma = 0;
    var num = a.length / 4;
    for (var i = 0; i < a.length; i+=4) {
        sumr += a[i];
        sumg += a[i + 1];
        sumb += a[i + 2];
        suma += a[i + 3];
    }
    return [sumr / num, sumg / num, sumb / num, suma / num]
}

function vec_boost_mean(input, output, target) {
    var means = vec_means(input);
    var ratior = target / means[0];
    var ratiog = target / means[1];
    var ratiob = target / means[2];
    var ratioa = 255 / means[3];
    for (var i = 0; i < input.length; i+=4) {
        output[i] = input[i] * ratior;
        output[i + 1] = input[i + 1] * ratiog;
        output[i + 2] = input[i + 2] * ratiob;
        output[i + 3] = input[i + 3] * ratioa;
    }
}
function vec_clip(a, b) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] > 255) {
            b[i] = 255;
        } else {
            b[i] = a[i];
        }
    }
}

function vec_power(input, output) {
    for (var i = 0; i < input.length; i++) {
        output[i] = Math.sqrt(input[i]);
    }
}

function vec_log(input, output) {
    for (var i = 0; i < input.length; i++) {
        if (input[i] > 0) {
            output[i] = Math.log(input[i]);
        }
    }
}
function norm() {
    var u = 1 - Math.random(); // Subtraction to flip [0, 1) to (0, 1].
    var v = 1 - Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function rand_deflection(reflection, roughness, normal) {
    var final_angle = reflection;
    var diff = 0;
    var count = 5;
    do {
        count++;
        if (count > 20) {
            break;
        }
        final_angle = (reflection + (norm() * roughness));
        diff = angle_diff(final_angle, normal)
    } while (Math.abs(diff) > 0.5 * Math.PI);
    return final_angle % (2 * Math.PI);
}

function angle_diff(a, b) {
    var phi = (2 * Math.PI + (b - a)) % (2 * Math.PI);
    return phi > Math.PI ? phi -(2 * Math.PI) : phi;
}

function get_angle_incidence(incoming, normal) {
    var a1 = angle_diff(incoming + Math.PI, normal);
    var a2 = angle_diff(incoming, normal);
    return Math.abs(a1) < Math.abs(a2) ? [a1, normal] : [a2, normal + Math.PI];
}

function get_angle_permeable(ray, normal, absorb, refractive, roughness) {

    var angles = get_angle_incidence(ray.theta, normal);
    var angle_incidence = angles[0];
    normal = angles[1];
    var theta_out = normal + angle_incidence;
    var power = (1 - absorb);
    var inMaterial = false;

    if (refractive != null) {
        refractive = refractive + (ray.lambda - 400) / 3000;
        if (ray.inMedium) {
            var nratio = 1 / refractive;
        } else {
            var nratio = refractive; // Or 1/n if coming out
        }
        var r_0 = Math.pow((1 - refractive) / (refractive + 1), 2);
        var reflectivity = r_0 + (1 - r_0) * Math.pow((1 - Math.cos(angle_incidence)), 5);
        if (!(Math.abs(angle_incidence) > Math.asin(nratio)) && Math.random() < reflectivity) {
            power *= reflectivity;
        } else {
            var new_angle = (Math.PI + normal) - Math.sign(angle_incidence) * Math.asin(Math.sin(Math.abs(angle_incidence)) / nratio);
            if (!isNaN(new_angle)) {
                // NaN means total internal reflection
                theta_out = (4 * Math.PI + new_angle) % (2 * Math.PI);
                power *= (1 - reflectivity);
                inMaterial = true;
            }
        }
    }
    if (isNaN(theta_out)) {
        console.log("But why")
    }
    if (roughness > 0) {
        theta_out = rand_deflection(theta_out, roughness, normal);
    }
    return [theta_out, power, inMaterial];
}