#version 300 es
precision highp float;

// Input vertex attributes
in float a_idx;
uniform float u_tmin;
uniform float u_tmax;
uniform int u_nsamples;
uniform int u_type;
uniform float u_aspect;
uniform float u_scale;
uniform float u_coef[3];
uniform vec2 u_offset;

void main() {
    // Map a_idx to the parameter t in the range [u_tmin, u_tmax]
    float u = a_idx / float(u_nsamples - 1);
    // Interpolate t between u_tmin and u_tmax
    float t = mix(u_tmin, u_tmax, u);

    // Extract coefficients
    float a = u_coef[0];
    float b = u_coef[1];
    float c = u_coef[2];

    // Initialize x and y
    float x = 0.0;
    float y = 0.0;

    // Compute the parametric equations based on u_type
    switch (u_type) {
        case 1:
            x = cos(a*t) + cos(b*t)/2.0 + sin(c*t)/3.0;
            y = sin(a*t) + sin(b*t)/2.0 + cos(c*t)/3.0;
            break;
        case 2:
            x = 2.0*(cos(a*t) + pow(cos(b*t),3.0));
            y = 2.0*(sin(a*t) + pow(sin(b*t),3.0));
            break;
        case 3:
            x = cos(a*t)*sin(sin(a*t));
            y = sin(a*t)*cos(cos(b*t));
            break;
        case 4:
            x = cos(a*t)*cos(b*t);
            y = sin(cos(a*t));
            break;
        case 5:
            float expPart = exp(cos(a*t)) - 2.0*cos(b*t);
            x = sin(a*t)*expPart;
            y = cos(a*t)*expPart;
            break;
        case 6:
            x = (a - b) * cos(b*t) + cos(a*t - b*t);
            y = (a - b) * sin(b*t) - sin(a*t - b*t);
            break;
        default:
            x = cos(t);
            y = sin(t);
            break;
    }

    // Apply scaling and offset
    vec2 p = vec2(x, y) * u_scale + u_offset;
    // Adjust for aspect ratio
    p.x /= u_aspect;

    // Set the final position
    gl_Position = vec4(p, 0.0, 1.0);
    gl_PointSize = 2.0;
}
