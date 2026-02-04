# 2D Parametric Curves — WebGL

Interactive visualization of 2D parametric curves implemented in WebGL using custom GLSL shaders.

This project was developed during the **1st semester of the 2025/2026 academic year** as part of the  
**Computer Graphics and Interfaces** course.

**Final grade:** 17.5 / 20

---

## 📚 Course Context

- **Course:** Computer Graphics and Interfaces  
- **Institution:** NOVA School of Science and Technology (FCT), Lisbon  
- **Semester:** 1st semester, 2025/2026  

---

## 👥 Team

- **Ilia Taitsel** (67258)  
- Oleksandra Kozlova (68739)

---

## 🎯 Project Overview

The goal of this project was to design and implement an interactive WebGL application capable of rendering and manipulating different families of **2D parametric curves** in real time.

The curves are generated entirely on the GPU using **vertex and fragment shaders**, with extensive user interaction for exploration, animation, and visualization.

---

## ✨ Features

### Parametric Curve Rendering
- Six different families of parametric curves, selectable via keyboard input.
- Real-time evaluation of parametric equations directly in the vertex shader.
- Adjustable curve coefficients and parameter ranges.

### Interaction & Controls
- **Zooming:** Mouse wheel  
- **Panning:** Mouse drag  
- **Coefficient control:** Arrow keys  
- **Parameter range control:** Page Up / Page Down  
- **Sample density control:** `+` / `-`  
- **Rendering mode:** Toggle between points and line strip  
- **Reset to defaults:** `R` key  

### Animation
- Smooth real-time animation of curve parameters.
- Automatic cycling through curve colors during animation.
- Animation toggle via the **Space** key.

---

## 🎨 Extra Functionality — Dynamic Color Control

An additional feature beyond the basic requirements was implemented: **dynamic color control using hue interpolation**.

### Manual Color Control
- A hue slider (`<input type="range">`) allows the user to manually change the curve color in real time.
- Hue values (0–360°) are normalized to `[0,1]` and passed to the fragment shader.

### Animated Color Cycling
- When animation is enabled, the hue slider automatically hides.
- The curve color cycles smoothly through the entire color spectrum, creating a rainbow-like transition.
- When animation stops, manual color control becomes available again.

### Color Interpolation Method
color = 0.5 + 0.5 · cos(2π · u_hue + phase)

Where the phase shifts for each color channel are:

- Red: `0`
- Green: `2π / 3`
- Blue: `4π / 3`

This approach ensures:
- Smooth sinusoidal transitions
- Continuous color changes
- All color components remain within the `[0,1]` range

---

## 🧠 Technical Details

### Vertex Attributes
| Name   | Type  | Description |
|-------|-------|-------------|
| `a_idx` | float | Index of each vertex sample (from `0` to `u_nsamples - 1`), used to compute the curve parameter |

### Uniform Variables
| Name | Type | Description |
|----|----|----|
| `u_tmin` | float | Lower bound of parameter `t` |
| `u_tmax` | float | Upper bound of parameter `t` |
| `u_nsamples` | int | Number of samples used to draw the curve |
| `u_type` | int | Curve family selector (1–6) |
| `u_coef` | float[3] | Parametric equation coefficients |
| `u_scale` | float | Global zoom factor |
| `u_offset` | vec2 | Translation offset for panning |
| `u_aspect` | float | Viewport aspect ratio |
| `u_hue` | float | Normalized hue value for color control |

---

## 🛠 Technologies Used

- **WebGL 2.0**
- **GLSL (Vertex & Fragment Shaders)**
- **JavaScript**
- **HTML5 Canvas**

---

## 🚀 How to Run

1. Serve the project using a local web server (required for shader loading).
2. Open `index.html` in a modern WebGL-enabled browser.
3. Use the keyboard and mouse to interact with the curves.

---

## 📌 Learning Outcomes

- GPU-based parametric curve generation
- Practical use of GLSL shaders
- WebGL rendering pipeline
- Real-time interaction and animation
- Mathematical modeling of curves
- Color interpolation and shader-based effects

