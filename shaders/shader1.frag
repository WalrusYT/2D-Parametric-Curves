#version 300 es
precision highp float;
precision highp int;

uniform float u_hue;
out vec4 frag_color;

void main() {
    // OUR FEATURE:
    // we convert hue to rgb using cosine function
    // for example, if hue = 0, then w = 0, R = cos(0) = 1, G = cos(2.094) = -0.5, B = cos(4.188) = -0.5
    // if hue = 1/3, then w = 2.094, R = cos(2.094) = -0.5, G = cos(4.188) = -0.5, B = cos(6.283) = 1
    // if hue = 2/3, then w = 4.188, R = cos(4.188) = -0.5, G = cos(6.283) = 1, B = cos(8.378) = -0.5
    // so we get a smooth transition between red, green and blue colors
    float w = 6.2831853 * u_hue;             // 2pi * hue
    // shifts of 0, 2pi/3 and 4pi/3 for R, G and B channels respectively
    vec3 color = 0.5 + 0.5 * cos(w + vec3(0.0, 2.094, 4.188));
    frag_color = vec4(color, 1.0);
}
