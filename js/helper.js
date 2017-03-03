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
        b[i] = Math.min(255, 10 * 255 * a[i] / max);
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

function rand_deflection(reflection, roughness, barrier) {
    if (roughness == 0) {
        return reflection;
    }
    var final_angle = 0;
    var diff = 0;
    var sign = Math.sign(reflection - barrier);
    do {
        final_angle = (reflection + (norm() * roughness)) % Math.PI;
        diff = (final_angle - barrier) % (2 * Math.PI)
    } while (diff > sign * Math.PI || diff < 0);
    return final_angle % (2 * Math.PI);
}