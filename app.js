import { loadShadersFromURLS, buildProgramFromSources, setupWebGL } from "../../libs/utils.js";

// canvas and information on it
let canvas;
let info_coefs, info_tmin, info_tmax;

// variables for WebGl communication
let gl;
let program;
let vao;

// variables for curves information
let aspect = 1;
let coef = [1., 1., 0.];
let current_coef = 0;
let n_sample = 60000;
let t_min = 0, t_max = Math.PI * 2;

// variables for scaling, dragging
let isDragging = false;
let lastX = 0, lastY = 0;
let offset = [0., 0.];
let u_aspect;
let scale = 1;

// variables for animation
let drawMode = "points";
let isAnimating = false;
let animationDirection = 1;
let animationSpeed = 0.01;
let currentColorHue = 0.0;

let currentFamilyType = 1;

// default parameters for each family type
const defaultParams = {
    1: { a: 1.0, b: 1.0, c: 0.0, t0: 0.0, t1: Math.PI * 2 },
    2: { a: 1.0, b: 17.0, c: 0.0, t0: 0.0, t1: Math.PI * 2 },
    3: { a: 1.0, b: 8.6, c: 0.0, t0: 0.0, t1: Math.PI * 10 },
    4: { a: 7.6, b: 5.1, c: 0.0, t0: 0.0, t1: 10.0 },
    5: { a: 1.0, b: 4.0, c: 0.0, t0: 0.0, t1: 10.0 },
    6: { a: 4.0, b: 1.0, c: 0.0, t0: 0.0, t1: Math.PI * 2 }
};

// function to reset parameters to default for a given family type
function resetToDefaultParams(type) {
    const params = defaultParams[type];
    if (!params) return;
    coef = [params.a, params.b, params.c];
    t_min = params.t0;
    t_max = params.t1;

    // sending updated values to the shader
    gl.uniform1fv(gl.getUniformLocation(program, "u_coef"), coef);
    gl.uniform1f(gl.getUniformLocation(program, "u_tmin"), t_min);
    gl.uniform1f(gl.getUniformLocation(program, "u_tmax"), t_max);

    // updating info display
    info_coefs.textContent = coef.map(c => c.toFixed(2)).join(", ");
    info_tmin.textContent = t_min.toFixed(2);
    info_tmax.textContent = t_max.toFixed(2);
}
function resize(target, u_aspect) {
    // Aquire the new window dimensions
    const width = target.innerWidth;
    const height = target.innerHeight;

    // Set canvas size to occupy the entire window
    canvas.width = width;
    canvas.height = height;


    // Set the WebGL viewport to fill the canvas completely
    gl.viewport(0, 0, width, height);

    // recalculating aspect ratio
    aspect = width / height;
    // sending it to the vertex shader
    gl.uniform1f(gl.getUniformLocation(program, "u_aspect"), aspect);
}


function setup(shaders) {
    // elements from the canvas
    canvas     = document.getElementById("gl-canvas");
    info_tmin  = document.getElementById("t_min");
    info_tmax  = document.getElementById("t_max");
    info_coefs = document.getElementById("coefs");
    const hueEl  = document.getElementById("hue");
    const hueVal = document.getElementById("hue-val");

    // creating WebGL context
    gl = setupWebGL(canvas, { alpha: true, preserveDrawingBuffer: false });

    // Create WebGL program after confirming context exists
    program = buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);

    gl.useProgram(program);
    // Creating an array of vertices indexes
    const vertices_idxs = [];
    for (let i = 0; i < n_sample; i++) {
        vertices_idxs.push(i);
    }

    // Creating and binding the buffer
    const aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint32Array(vertices_idxs), gl.STATIC_DRAW);
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const a_idx = gl.getAttribLocation(program, "a_idx");
    gl.vertexAttribPointer(a_idx, 1, gl.UNSIGNED_INT, false, 0, 0);
    gl.enableVertexAttribArray(a_idx);
    gl.bindVertexArray(null);

    // Getting uniform locations and sending initial values
    const u_tmin = gl.getUniformLocation(program, "u_tmin");
    const u_tmax = gl.getUniformLocation(program, "u_tmax");
    const u_nsamples = gl.getUniformLocation(program, "u_nsamples");
    const u_type = gl.getUniformLocation(program, "u_type");
    const u_coef = gl.getUniformLocation(program, "u_coef");
    const u_scale = gl.getUniformLocation(program, "u_scale");
    u_aspect = gl.getUniformLocation(program, "u_aspect");
    const u_offset = gl.getUniformLocation(program, "u_offset");
    const u_hue = gl.getUniformLocation(program, "u_hue");
    gl.uniform1f(u_hue, 0.0);

    // Sending initial values
    gl.uniform1f(u_tmin, t_min);
    gl.uniform1f(u_tmax, t_max);
    gl.uniform1i(u_nsamples, 60000);
    gl.uniform1i(u_type, 1);
    gl.uniform1fv(u_coef, coef);
    gl.uniform1f(u_scale, 1.);
    gl.uniform2fv(u_offset, offset);
    resize(window, u_aspect);

    // Handle resize events 
     window.addEventListener("resize", (event) => {
        resize(event.target);
    });

    // scroll events for zooming
    window.addEventListener("wheel", (event) => {
        if (event.deltaY < 0) { // vertical scroll up
            scale *= 1.1;
            console.log(scale);
        } else { // vertical scroll down
            scale /= 1.1; 
        }
        gl.useProgram(program);
        gl.uniform1f(u_scale, scale);
    });

    // mouse events for dragging
    window.addEventListener("mousedown", (event) => {
        isDragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });

    window.addEventListener("mousemove", (event) => {
        if (!isDragging) return;
        offset[0] += (event.clientX - lastX) / canvas.width * 2.0;
        offset[1] += -(event.clientY - lastY) / canvas.height * 2.0;
        gl.useProgram(program);
        gl.uniform2fv(u_offset, offset);
        lastX = event.clientX;
        lastY = event.clientY;
    });

    // changing color events (our own feature)
    hueEl.addEventListener("input", (event) => {
        isDragging = false;
        const deg = Number(event.target.value);  // 0..360
        const hue = deg / 360;               // 0..1
        gl.useProgram(program);
        gl.uniform1f(u_hue, hue);
        hueVal.textContent = `${deg}°`;
    });


    // keyboard events for changing parameters
    window.addEventListener("keydown", (event) =>{ 
        info_coefs.textContent = coef.map(c => c.toFixed(2)).join(", ");
        info_tmin.textContent = t_min.toFixed(2);
        info_tmax.textContent = t_max.toFixed(2);
        switch (event.key) {
            // Family type change
            case "1": case "2": case "3": case "4": case "5": case "6":
                currentFamilyType = Number(event.key);
                gl.uniform1i(u_type, currentFamilyType);
                resetToDefaultParams(currentFamilyType);
                break; 
            case " ": //animation toggle
                isAnimating = !isAnimating;
                const hueEl = document.getElementById("hue");
                const hueVal = document.getElementById("hue-val");  
                // hide the hue control when animating
                if (isAnimating) {
                    hueEl.style.display = "none";
                    hueVal.style.display = "none";
                } else {
                    hueEl.style.display = "inline";
                    hueVal.style.display = "inline";
                }
                break;
            case "ArrowUp": // increase current coef
                isAnimating = false;
                coef[current_coef] += 0.01;
                gl.uniform1fv(u_coef, coef);
                break;
            case "ArrowDown": // decrease current coef
                isAnimating = false;
                coef[current_coef] -= 0.01
                gl.uniform1fv(u_coef, coef);
                break;
            case "ArrowLeft": // change current coef
                current_coef = (current_coef + 2) % 3; 
                break;
            case "ArrowRight": 
                current_coef = (current_coef + 1) % 3; 
                break;
            case "PageUp": // increase t_max
                t_max += 0.01;
                gl.uniform1f(u_tmax, t_max);
                break;
            case "PageDown": // decrease t_max
                t_max -= 0.01;
                gl.uniform1f(u_tmax, t_max);
                break;
            case "r": // reset view
                resetToDefaultParams(currentFamilyType);
                break;
            case "p": // toggle points/lines
                drawMode = (drawMode === "points") ? "lines" : "points";
                console.log("Draw mode:", drawMode);
                break;
            case "+": // adding sample points
                if (n_sample < 59500) {
                    console.log(n_sample);
                    n_sample += 500;
                    gl.uniform1i(u_nsamples, n_sample);
                    break;
                } 
            case "-": // removing sample points
                if (n_sample > 499) {
                    console.log(n_sample);
                    n_sample -= 500;
                    gl.uniform1i(u_nsamples, n_sample);
                    break;
                } 
        }
    });

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    window.requestAnimationFrame(animate);
}
// Animation loop
function animate(_timestamp) {
    window.requestAnimationFrame(animate);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    // our feature: sending color hue to the shader
    const u_hue = gl.getUniformLocation(program, "u_hue");
    const u_coef = gl.getUniformLocation(program, "u_coef");

    // update coef if animating
    if (isAnimating) {
        coef[current_coef] += animationDirection * animationSpeed;

        // changing color hue
        currentColorHue += 0.002;
        if (currentColorHue > 1.0) currentColorHue = 0.0; 
        gl.uniform1f(u_hue, currentColorHue);
        gl.uniform1fv(u_coef, coef);
        info_coefs.textContent = coef.map(c => c.toFixed(2)).join(", ");
    }
    gl.bindVertexArray(vao);
    // Drawing according to the current mode
    gl.bindVertexArray(vao);
    gl.drawArrays(drawMode === "points" ? gl.POINTS : gl.LINE_STRIP, 0, n_sample);
    gl.bindVertexArray(null);
}

loadShadersFromURLS(["shader1.vert", "shader1.frag"]).then(shaders => setup(shaders));
