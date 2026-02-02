"use client";

import { useEffect, useRef } from 'react';

export default function FluidCursor() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // ==========================================
        // WebGPU Fluid Simulation Logic
        // ==========================================

        let device: GPUDevice;
        let context: GPUCanvasContext;
        let presentationFormat: GPUTextureFormat;

        const settings = {
            grid_size: 64,
            dye_size: 256,
            sim_speed: 5,
            contain_fluid: true,
            velocity_add_intensity: 0.28,
            velocity_add_radius: 0.001,
            velocity_diffusion: 1,
            dye_add_intensity: 0.8,
            dye_add_radius: 0.0035,
            dye_diffusion: 0.96204,
            viscosity: 0,
            vorticity: 0,
            pressure_iterations: 8,
            buffer_view: "dye",
            input_symmetry: "none",
            grid_w: 0,
            grid_h: 0,
            dye_w: 0,
            dye_h: 0,
            dx: 0,
            rdx: 0,
            dyeRdx: 0,
            dt: 0,
            time: 0,
            reset: () => { }
        };

        const mouseInfos = {
            current: null as number[] | null,
            last: null as number[] | null,
            velocity: null as number[] | null
        };

        const globalUniforms: { [key: string]: Uniform } = {};

        // Buffers
        let velocity: DynamicBuffer,
            velocity0: DynamicBuffer,
            dye: DynamicBuffer,
            dye0: DynamicBuffer,
            divergence: DynamicBuffer,
            divergence0: DynamicBuffer,
            pressure: DynamicBuffer,
            pressure0: DynamicBuffer,
            vorticity: DynamicBuffer;

        // Uniforms
        let time: Uniform,
            dt: Uniform,
            mouse: Uniform,
            grid: Uniform,
            uSimSpeed: Uniform,
            vel_force: Uniform,
            vel_radius: Uniform,
            vel_diff: Uniform,
            dye_force: Uniform,
            dye_radius: Uniform,
            dye_diff: Uniform,
            viscosity: Uniform,
            uVorticity: Uniform,
            containFluid: Uniform,
            uSymmetry: Uniform,
            uRenderIntensity: Uniform;

        // Programs
        let checkerProgram: Program,
            updateDyeProgram: UpdateProgram,
            updateProgram: UpdateProgram,
            advectProgram: AdvectProgram,
            boundaryProgram: BoundaryProgram,
            divergenceProgram: DivergenceProgram,
            boundaryDivProgram: BoundaryProgram,
            pressureProgram: PressureProgram,
            boundaryPressureProgram: BoundaryProgram,
            gradientSubtractProgram: GradientSubtractProgram,
            advectDyeProgram: AdvectProgram,
            clearPressureProgram: UpdateProgram,
            vorticityProgram: VorticityProgram,
            vorticityConfinmentProgram: VorticityConfinmentProgram,
            renderProgram: RenderProgram;

        // ==========================================
        // Shaders
        // ==========================================

        const STRUCT_GRID_SIZE = `
            struct GridSize {
            w : f32,
            h : f32,
            dyeW: f32,
            dyeH: f32,
            dx : f32,
            rdx : f32,
            dyeRdx : f32
            }`;

        const COMPUTE_START = `
            var pos = vec2<f32>(global_id.xy);

            if (pos.x == 0 || pos.y == 0 || pos.x >= uGrid.w - 1 || pos.y >= uGrid.h - 1) {
                return;
            }      

            let index = ID(pos.x, pos.y);`;

        const COMPUTE_START_DYE = `
            var pos = vec2<f32>(global_id.xy);

            if (pos.x == 0 || pos.y == 0 || pos.x >= uGrid.dyeW - 1 || pos.y >= uGrid.dyeH - 1) {
                return;
            }      

            let index = ID(pos.x, pos.y);`;

        const COMPUTE_START_ALL = `    
            var pos = vec2<f32>(global_id.xy);

            if (pos.x >= uGrid.w || pos.y >= uGrid.h) {
                return;
            }      

            let index = ID(pos.x, pos.y);`;

        const SPLAT_CODE = `
            var m = uMouse.pos;
            var v = uMouse.vel*2.;

            var splat = createSplat(p, m, v, uRadius);
            if (uSymmetry == 1. || uSymmetry == 3.) {splat += createSplat(p, vec2(1. - m.x, m.y), v * vec2(-1., 1.), uRadius);}
            if (uSymmetry == 2. || uSymmetry == 3.) {splat += createSplat(p, vec2(m.x, 1. - m.y), v * vec2(1., -1.), uRadius);}
            if (uSymmetry == 3. || uSymmetry == 4.) {splat += createSplat(p, vec2(1. - m.x, 1. - m.y), v * vec2(-1., -1.), uRadius);}
        `;

        const updateVelocityShader = `
            ${STRUCT_GRID_SIZE}

            struct Mouse {
            pos: vec2<f32>,
            vel: vec2<f32>,
            }
            @group(0) @binding(0) var<storage, read> x_in : array<f32>;
            @group(0) @binding(1) var<storage, read> y_in : array<f32>;
            @group(0) @binding(2) var<storage, read_write> x_out : array<f32>;
            @group(0) @binding(3) var<storage, read_write> y_out : array<f32>;
            @group(0) @binding(4) var<uniform> uGrid: GridSize;
            @group(0) @binding(5) var<uniform> uMouse: Mouse;
            @group(0) @binding(6) var<uniform> uForce : f32;
            @group(0) @binding(7) var<uniform> uRadius : f32;
            @group(0) @binding(8) var<uniform> uDiffusion : f32;
            @group(0) @binding(9) var<uniform> uDt : f32;
            @group(0) @binding(10) var<uniform> uTime : f32;
            @group(0) @binding(11) var<uniform> uSymmetry : f32;

            fn ID(x : f32, y : f32) -> u32 { return u32(x + y * uGrid.w); }
            fn createSplat(pos : vec2<f32>, splatPos : vec2<f32>, vel : vec2<f32>, radius : f32) -> vec2<f32> {
            var p = pos - splatPos;
            p.x *= uGrid.w / uGrid.h;
            var v = vel;
            v.x *= uGrid.w / uGrid.h;
            var splat = exp(-dot(p, p) / radius) * v;
            return splat;
            }

            @compute @workgroup_size(8, 8)
            fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
                
                ${COMPUTE_START}

                let tmpT = uTime;
                var p = pos/vec2(uGrid.w, uGrid.h);

                ${SPLAT_CODE}
                
                splat *= uForce * uDt * 200.;

                x_out[index] = x_in[index]*uDiffusion + splat.x;
                y_out[index] = y_in[index]*uDiffusion + splat.y;
            }`;

        const updateDyeShader = `
            ${STRUCT_GRID_SIZE}

            struct Mouse {
            pos: vec2<f32>,
            vel: vec2<f32>,
            }
            @group(0) @binding(0) var<storage, read> x_in : array<f32>;
            @group(0) @binding(1) var<storage, read> y_in : array<f32>;
            @group(0) @binding(2) var<storage, read> z_in : array<f32>;
            @group(0) @binding(3) var<storage, read_write> x_out : array<f32>;
            @group(0) @binding(4) var<storage, read_write> y_out : array<f32>;
            @group(0) @binding(5) var<storage, read_write> z_out : array<f32>;
            @group(0) @binding(6) var<uniform> uGrid: GridSize;
            @group(0) @binding(7) var<uniform> uMouse: Mouse;
            @group(0) @binding(8) var<uniform> uForce : f32;
            @group(0) @binding(9) var<uniform> uRadius : f32;
            @group(0) @binding(10) var<uniform> uDiffusion : f32;
            @group(0) @binding(11) var<uniform> uTime : f32;
            @group(0) @binding(12) var<uniform> uDt : f32;
            @group(0) @binding(13) var<uniform> uSymmetry : f32;

            fn ID(x : f32, y : f32) -> u32 { return u32(x + y * uGrid.dyeW); }
            fn palette(t : f32, a : vec3<f32>, b : vec3<f32>, c : vec3<f32>, d : vec3<f32> ) -> vec3<f32> {
                return a + b*cos( 6.28318*(c*t+d) );
            }

            fn createSplat(pos : vec2<f32>, splatPos : vec2<f32>, vel : vec2<f32>, radius : f32) -> vec3<f32> {
            var p = pos - splatPos;
            p.x *= uGrid.w / uGrid.h;
            var v = vel;
            v.x *= uGrid.w / uGrid.h;
            var splat = exp(-dot(p, p) / radius) * length(v);
            return vec3(splat);
            }

            @compute @workgroup_size(8, 8)
            fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {

                ${COMPUTE_START_DYE}

                let col_incr = 0.15;
                let col_start = palette(uTime/8., vec3(1), vec3(0.5), vec3(1), vec3(0, col_incr, col_incr*2.));

                var p = pos/vec2(uGrid.dyeW, uGrid.dyeH);

                ${SPLAT_CODE}

                splat *= col_start * uForce * uDt * 100.;

                x_out[index] = max(0., x_in[index]*uDiffusion + splat.x);
                y_out[index] = max(0., y_in[index]*uDiffusion + splat.y);
                z_out[index] = max(0., z_in[index]*uDiffusion + splat.z);
            }`;

        const advectShader = `
            ${STRUCT_GRID_SIZE}
            @group(0) @binding(0) var<storage, read> x_in : array<f32>;
            @group(0) @binding(1) var<storage, read> y_in : array<f32>;
            @group(0) @binding(2) var<storage, read> x_vel : array<f32>;
            @group(0) @binding(3) var<storage, read> y_vel : array<f32>;
            @group(0) @binding(4) var<storage, read_write> x_out : array<f32>;
            @group(0) @binding(5) var<storage, read_write> y_out : array<f32>;
            @group(0) @binding(6) var<uniform> uGrid : GridSize;
            @group(0) @binding(7) var<uniform> uDt : f32;

            fn ID(x : f32, y : f32) -> u32 { return u32(x + y * uGrid.w); }
            fn in_val(x : f32, y : f32) -> vec2<f32> { let id = ID(x, y); return vec2(x_in[id], y_in[id]); }

            @compute @workgroup_size(8, 8)
            fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
                ${COMPUTE_START}
                var x = pos.x - uDt * uGrid.rdx * x_vel[index];
                var y = pos.y - uDt * uGrid.rdx * y_vel[index];
                if (x < 0) { x = 0; } else if (x >= uGrid.w - 1) { x = uGrid.w - 1; }
                if (y < 0) { y = 0; } else if (y >= uGrid.h - 1) { y = uGrid.h - 1; }
                let x1 = floor(x); let y1 = floor(y);
                let x2 = x1 + 1; let y2 = y1 + 1;
                let TL = in_val(x1, y2); let TR = in_val(x2, y2);
                let BL = in_val(x1, y1); let BR = in_val(x2, y1);
                let xMod = fract(x); let yMod = fract(y);
                let bilerp = mix( mix(BL, BR, xMod), mix(TL, TR, xMod), yMod );
                x_out[index] = bilerp.x;
                y_out[index] = bilerp.y;
            }`;

        const advectDyeShader = `
            ${STRUCT_GRID_SIZE}
            @group(0) @binding(0) var<storage, read> x_in : array<f32>;
            @group(0) @binding(1) var<storage, read> y_in : array<f32>;
            @group(0) @binding(2) var<storage, read> z_in : array<f32>;
            @group(0) @binding(3) var<storage, read> x_vel : array<f32>;
            @group(0) @binding(4) var<storage, read> y_vel : array<f32>;
            @group(0) @binding(5) var<storage, read_write> x_out : array<f32>;
            @group(0) @binding(6) var<storage, read_write> y_out : array<f32>;
            @group(0) @binding(7) var<storage, read_write> z_out : array<f32>;
            @group(0) @binding(8) var<uniform> uGrid : GridSize;
            @group(0) @binding(9) var<uniform> uDt : f32;

            fn ID(x : f32, y : f32) -> u32 { return u32(x + y * uGrid.dyeW); }
            fn in_val(x : f32, y : f32) -> vec3<f32> { let id = ID(x, y); return vec3(x_in[id], y_in[id], z_in[id]); }
            fn vel(x : f32, y : f32) -> vec2<f32> { let id = u32(i32(x) + i32(y) * i32(uGrid.w)); return vec2(x_vel[id], y_vel[id]); }
            fn vel_bilerp(x0 : f32, y0 : f32) -> vec2<f32> {
                var x = x0 * uGrid.w / uGrid.dyeW;
                var y = y0 * uGrid.h / uGrid.dyeH;
                if (x < 0) { x = 0; } else if (x >= uGrid.w - 1) { x = uGrid.w - 1; }
                if (y < 0) { y = 0; } else if (y >= uGrid.h - 1) { y = uGrid.h - 1; }
                let x1 = floor(x); let y1 = floor(y);
                let x2 = x1 + 1; let y2 = y1 + 1;
                let TL = vel(x1, y2); let TR = vel(x2, y2);
                let BL = vel(x1, y1); let BR = vel(x2, y1);
                let xMod = fract(x); let yMod = fract(y);
                return mix( mix(BL, BR, xMod), mix(TL, TR, xMod), yMod );
            }

            @compute @workgroup_size(8, 8)
            fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
                ${COMPUTE_START_DYE}
                let V = vel_bilerp(pos.x, pos.y);
                var x = pos.x - uDt * uGrid.dyeRdx * V.x;
                var y = pos.y - uDt * uGrid.dyeRdx * V.y;
                if (x < 0) { x = 0; } else if (x >= uGrid.dyeW - 1) { x = uGrid.dyeW - 1; }
                if (y < 0) { y = 0; } else if (y >= uGrid.dyeH - 1) { y = uGrid.dyeH - 1; }
                let x1 = floor(x); let y1 = floor(y);
                let x2 = x1 + 1; let y2 = y1 + 1;
                let TL = in_val(x1, y2); let TR = in_val(x2, y2);
                let BL = in_val(x1, y1); let BR = in_val(x2, y1);
                let xMod = fract(x); let yMod = fract(y);
                let bilerp = mix( mix(BL, BR, xMod), mix(TL, TR, xMod), yMod );
                x_out[index] = bilerp.x;
                y_out[index] = bilerp.y;
                z_out[index] = bilerp.z;
            }`;

        const divergenceShader = `
            ${STRUCT_GRID_SIZE}
            @group(0) @binding(0) var<storage, read> x_vel : array<f32>;
            @group(0) @binding(1) var<storage, read> y_vel : array<f32>;
            @group(0) @binding(2) var<storage, read_write> div : array<f32>;
            @group(0) @binding(3) var<uniform> uGrid : GridSize;

            fn ID(x : f32, y : f32) -> u32 { return u32(x + y * uGrid.w); }
            fn vel(x : f32, y : f32) -> vec2<f32> { let id = ID(x, y); return vec2(x_vel[id], y_vel[id]); }

            @compute @workgroup_size(8, 8)
            fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            ${COMPUTE_START}
            let L = vel(pos.x - 1, pos.y).x;
            let R = vel(pos.x + 1, pos.y).x;
            let B = vel(pos.x, pos.y - 1).y;
            let T = vel(pos.x, pos.y + 1).y;
            div[index] = 0.5 * uGrid.rdx * ((R - L) + (T - B));
            }`;

        const pressureShader = `
            ${STRUCT_GRID_SIZE}
            @group(0) @binding(0) var<storage, read> pres_in : array<f32>;
            @group(0) @binding(1) var<storage, read> div : array<f32>;
            @group(0) @binding(2) var<storage, read_write> pres_out : array<f32>;
            @group(0) @binding(3) var<uniform> uGrid : GridSize;

            fn ID(x : f32, y : f32) -> u32 { return u32(x + y * uGrid.w); }
            fn in_val(x : f32, y : f32) -> f32 { let id = ID(x, y); return pres_in[id]; }

            @compute @workgroup_size(8, 8)
            fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            ${COMPUTE_START}
            let Lx = in_val(pos.x - 1, pos.y);
            let Rx = in_val(pos.x + 1, pos.y);
            let Bx = in_val(pos.x, pos.y - 1);
            let Tx = in_val(pos.x, pos.y + 1);
            let bC = div[index];
            let alpha = -(uGrid.dx * uGrid.dx);
            let rBeta = .25;
            pres_out[index] = (Lx + Rx + Bx + Tx + alpha * bC) * rBeta;
            }`;

        const gradientSubtractShader = `
            ${STRUCT_GRID_SIZE}
            @group(0) @binding(0) var<storage, read> pressure : array<f32>;
            @group(0) @binding(1) var<storage, read> x_vel : array<f32>;
            @group(0) @binding(2) var<storage, read> y_vel : array<f32>;
            @group(0) @binding(3) var<storage, read_write> x_out : array<f32>;
            @group(0) @binding(4) var<storage, read_write> y_out : array<f32>;
            @group(0) @binding(5) var<uniform> uGrid : GridSize;

            fn ID(x : f32, y : f32) -> u32 { return u32(x + y * uGrid.w); }
            fn pres(x : f32, y : f32) -> f32 { let id = ID(x, y); return pressure[id]; }

            @compute @workgroup_size(8, 8)
            fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            ${COMPUTE_START}
            let xL = pres(pos.x - 1, pos.y);
            let xR = pres(pos.x + 1, pos.y);
            let yB = pres(pos.x, pos.y - 1);
            let yT = pres(pos.x, pos.y + 1);
            x_out[index] = x_vel[index] - .5 * uGrid.rdx * (xR - xL);
            y_out[index] = y_vel[index] - .5 * uGrid.rdx * (yT - yB);
            }`;

        const vorticityShader = `
            ${STRUCT_GRID_SIZE}
            @group(0) @binding(0) var<storage, read> x_vel : array<f32>;
            @group(0) @binding(1) var<storage, read> y_vel : array<f32>;
            @group(0) @binding(2) var<storage, read_write> vorticity : array<f32>;
            @group(0) @binding(3) var<uniform> uGrid : GridSize;

            fn ID(x : f32, y : f32) -> u32 { return u32(x + y * uGrid.w); }
            fn vel(x : f32, y : f32) -> vec2<f32> { let id = ID(x, y); return vec2(x_vel[id], y_vel[id]); }

            @compute @workgroup_size(8, 8)
            fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            ${COMPUTE_START}
            let Ly = vel(pos.x - 1, pos.y).y;
            let Ry = vel(pos.x + 1, pos.y).y;
            let Bx = vel(pos.x, pos.y - 1).x;
            let Tx = vel(pos.x, pos.y + 1).x;
            vorticity[index] = 0.5 * uGrid.rdx * ((Ry - Ly) - (Tx - Bx));
            }`;

        const vorticityConfinmentShader = `
            ${STRUCT_GRID_SIZE}
            @group(0) @binding(0) var<storage, read> x_vel_in : array<f32>;
            @group(0) @binding(1) var<storage, read> y_vel_in : array<f32>;
            @group(0) @binding(2) var<storage, read> vorticity : array<f32>;
            @group(0) @binding(3) var<storage, read_write> x_vel_out : array<f32>;
            @group(0) @binding(4) var<storage, read_write> y_vel_out : array<f32>;
            @group(0) @binding(5) var<uniform> uGrid : GridSize;
            @group(0) @binding(6) var<uniform> uDt : f32;
            @group(0) @binding(7) var<uniform> uVorticity : f32;

            fn ID(x : f32, y : f32) -> u32 { return u32(x + y * uGrid.w); }
            fn vort(x : f32, y : f32) -> f32 { let id = ID(x, y); return vorticity[id]; }

            @compute @workgroup_size(8, 8)
            fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            ${COMPUTE_START}
            let L = vort(pos.x - 1, pos.y);
            let R = vort(pos.x + 1, pos.y);
            let B = vort(pos.x, pos.y - 1);
            let T = vort(pos.x, pos.y + 1);
            let C = vorticity[index];
            var force = 0.5 * uGrid.rdx * vec2(abs(T) - abs(B), abs(R) - abs(L));
            let epsilon = 2.4414e-4;
            let magSqr = max(epsilon, dot(force, force));
            force = force / sqrt(magSqr);
            force *= uGrid.dx * uVorticity * uDt * C * vec2(1, -1);
            x_vel_out[index] = x_vel_in[index] + force.x;
            y_vel_out[index] = y_vel_in[index] + force.y;
            }`;

        const clearPressureShader = `
            ${STRUCT_GRID_SIZE}
            @group(0) @binding(0) var<storage, read> x_in : array<f32>;
            @group(0) @binding(1) var<storage, read_write> x_out : array<f32>;
            @group(0) @binding(2) var<uniform> uGrid : GridSize;
            @group(0) @binding(3) var<uniform> uVisc : f32;

            fn ID(x : f32, y : f32) -> u32 { return u32(x + y * uGrid.w); }

            @compute @workgroup_size(8, 8)
            fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            ${COMPUTE_START_ALL}
            x_out[index] = x_in[index]*uVisc;
            }`;

        const boundaryShader = `
            ${STRUCT_GRID_SIZE}
            @group(0) @binding(0) var<storage, read> x_in : array<f32>;
            @group(0) @binding(1) var<storage, read> y_in : array<f32>;
            @group(0) @binding(2) var<storage, read_write> x_out : array<f32>;
            @group(0) @binding(3) var<storage, read_write> y_out : array<f32>;
            @group(0) @binding(4) var<uniform> uGrid : GridSize;
            @group(0) @binding(5) var<uniform> containFluid : f32;

            fn ID(x : f32, y : f32) -> u32 { return u32(x + y * uGrid.w); }

            @compute @workgroup_size(8, 8)
            fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            ${COMPUTE_START_ALL}
            var scaleX = 1.;
            var scaleY = 1.;
            if (pos.x == 0) { pos.x += 1; scaleX = -1.; }
            else if (pos.x == uGrid.w - 1) { pos.x -= 1; scaleX = -1.; }
            if (pos.y == 0) { pos.y += 1; scaleY = -1.; }
            else if (pos.y == uGrid.h - 1) { pos.y -= 1; scaleY = -1.; }
            if (containFluid == 0.) { scaleX = 1.; scaleY = 1.; }
            x_out[index] = x_in[ID(pos.x, pos.y)] * scaleX;
            y_out[index] = y_in[ID(pos.x, pos.y)] * scaleY;
            }`;

        const boundaryPressureShader = `
            ${STRUCT_GRID_SIZE}
            @group(0) @binding(0) var<storage, read> x_in : array<f32>;
            @group(0) @binding(1) var<storage, read_write> x_out : array<f32>;
            @group(0) @binding(2) var<uniform> uGrid : GridSize;

            fn ID(x : f32, y : f32) -> u32 { return u32(x + y * uGrid.w); }

            @compute @workgroup_size(8, 8)
            fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            ${COMPUTE_START_ALL}
            if (pos.x == 0) { pos.x += 1; }
            else if (pos.x == uGrid.w - 1) { pos.x -= 1; }
            if (pos.y == 0) { pos.y += 1; }
            else if (pos.y == uGrid.h - 1) { pos.y -= 1; }
            x_out[index] = x_in[ID(pos.x, pos.y)];
            }`;

        const checkerboardShader = `
            ${STRUCT_GRID_SIZE}

            @group(0) @binding(0) var<storage, read_write> x_out : array<f32>;
            @group(0) @binding(1) var<storage, read_write> y_out : array<f32>;
            @group(0) @binding(2) var<storage, read_write> z_out : array<f32>;
            @group(0) @binding(3) var<uniform> uGrid : GridSize;
            @group(0) @binding(4) var<uniform> uTime : f32;

            fn ID(x : f32, y : f32) -> u32 { return u32(x + y * uGrid.dyeW); }

            fn noise(p_ : vec3<f32>) -> f32 {
            var p = p_;
                var ip=floor(p);
            p-=ip; 
            var s=vec3(7.,157.,113.);
            var h=vec4(0.,s.y, s.z,s.y+s.z)+dot(ip,s);
            p=p*p*(3. - 2.*p); 
            h=mix(fract(sin(h)*43758.5),fract(sin(h+s.x)*43758.5),p.x);
            var r=mix(h.xz,h.yw,p.y);
            h.x = r.x;
            h.y = r.y;
            return mix(h.x,h.y,p.z); 
            }

            fn fbm(p_ : vec3<f32>, octaveNum : i32) -> vec2<f32> {
            var p=p_;
                var acc = vec2(0.);	
                var freq = 1.0;
                var amp = 0.5;
            var shift = vec3(100.);
                for (var i = 0; i < octaveNum; i++) {
                    acc += vec2(noise(p), noise(p + vec3(0.,0.,10.))) * amp;
                p = p * 2.0 + shift;
                amp *= 0.5;
                }
                return acc;
            }

            @compute @workgroup_size(8, 8)
            fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {

            ${COMPUTE_START_DYE}

            var uv = pos/vec2(uGrid.dyeW, uGrid.dyeH);
            var zoom = 4.;

            var smallNoise = fbm(vec3(uv.x*zoom*2., uv.y*zoom*2., uTime+2.145), 7) - .5;
            var bigNoise = fbm(vec3(uv.x*zoom, uv.y*zoom, uTime*.1+30.), 7) - .5;

            var noise = max(length(bigNoise) * 0.035, 0.);
            var noise2 = max(length(smallNoise) * 0.035, 0.);

            noise = noise + noise2 * .05;

            var czoom = 4.;
            var n = fbm(vec3(uv.x*czoom, uv.y*czoom, uTime*.1+63.1), 7)*.75+.25;
            var n2 = fbm(vec3(uv.x*czoom, uv.y*czoom, uTime*.1+23.4), 7)*.75+.25;
            
            var col = vec3(1.);

            x_out[index] += noise * col.x;
            y_out[index] += noise * col.y;
            z_out[index] += noise * col.z;
            }`;

        const renderShader = `
            ${STRUCT_GRID_SIZE}
            struct VertexOut { @builtin(position) position : vec4<f32>, @location(1) uv : vec2<f32>, };
            @group(0) @binding(0) var<storage, read> fieldX : array<f32>;
            @group(0) @binding(1) var<storage, read> fieldY : array<f32>;
            @group(0) @binding(2) var<storage, read> fieldZ : array<f32>;
            @group(0) @binding(3) var<uniform> uGrid : GridSize;
            @group(0) @binding(4) var<uniform> multiplier : f32;

            @vertex
            fn vertex_main(@location(0) position: vec4<f32>) -> VertexOut {
                var output : VertexOut;
                output.position = position;
                output.uv = position.xy*.5+.5;
                return output;
            }

            @fragment
            fn fragment_main(fragData : VertexOut) -> @location(0) vec4<f32> {
                var w = uGrid.dyeW;
                var h = uGrid.dyeH;
                let fuv = vec2<f32>((floor(fragData.uv*vec2(w, h))));
                let id = u32(fuv.x + fuv.y * w);
                let r = fieldX[id];
                let g = fieldY[id];
                let b = fieldZ[id];
                let col = vec3(r, g, b);
                let alpha = clamp(length(col), 0.0, 1.0);
                // Simple color remapping for brand colors (optional, but requested implicitly by 'exact same look' which implies the rainbow/fluid behavior provided)
                return vec4(col * multiplier, alpha);
            }`;

        // ==========================================
        // Classes
        // ==========================================

        class DynamicBuffer {
            dims: number;
            bufferSize: number;
            w: number;
            h: number;
            buffers: GPUBuffer[];

            constructor({ dims = 1, w = settings.grid_w, h = settings.grid_h } = {}) {
                this.dims = dims;
                this.bufferSize = w * h * 4;
                this.w = w;
                this.h = h;
                this.buffers = new Array(dims).fill(0).map(() => device.createBuffer({
                    size: this.bufferSize,
                    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
                }));
            }

            copyTo(buffer: DynamicBuffer, commandEncoder: GPUCommandEncoder) {
                for (let i = 0; i < Math.max(this.dims, buffer.dims); i++) {
                    commandEncoder.copyBufferToBuffer(
                        this.buffers[Math.min(i, this.buffers.length - 1)], 0,
                        buffer.buffers[Math.min(i, buffer.buffers.length - 1)], 0,
                        this.bufferSize
                    );
                }
            }

            clear(queue: GPUQueue) {
                for (let i = 0; i < this.dims; i++) {
                    queue.writeBuffer(this.buffers[i], 0, new Float32Array(this.w * this.h));
                }
            }
        }

        class Uniform {
            name: string;
            size: number;
            buffer: GPUBuffer;
            needsUpdate: boolean | number[];
            alwaysUpdate: boolean = false;

            constructor(name: string, { size = 1, value = null as any } = {}) {
                this.name = name;
                this.size = size ?? (value && typeof value === 'object' ? value.length : 1);
                this.needsUpdate = false;

                // @ts-ignore
                const settingsVal = settings[name];

                if (this.size === 1) {
                    if (settingsVal == null) {
                        // @ts-ignore
                        settings[name] = value ?? 0;
                        this.alwaysUpdate = true;
                    }
                }

                if (this.size === 1 || value != null) {
                    this.buffer = device.createBuffer({
                        mappedAtCreation: true,
                        size: this.size * 4,
                        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
                    });
                    // @ts-ignore
                    const sourceValue = value ?? [settings[this.name]];
                    const sourceArray = typeof sourceValue === 'number' ? [sourceValue] : (Array.isArray(sourceValue) ? sourceValue : [0]);
                    new Float32Array(this.buffer.getMappedRange()).set(new Float32Array(sourceArray));
                    this.buffer.unmap();
                } else {
                    this.buffer = device.createBuffer({
                        size: this.size * 4,
                        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
                    });
                }
                globalUniforms[name] = this;
            }

            update(queue: GPUQueue, value?: any) {
                if (this.needsUpdate || this.alwaysUpdate || value != null) {
                    if (typeof this.needsUpdate !== 'boolean') value = this.needsUpdate;
                    // @ts-ignore
                    const valToWrite = value ?? [parseFloat(settings[this.name])];
                    queue.writeBuffer(this.buffer, 0, new Float32Array(valToWrite), 0, this.size);
                    this.needsUpdate = false;
                }
            }

            setValue(value: any) {
                // @ts-ignore
                settings[this.name] = value;
                this.needsUpdate = true;
            }
        }

        class Program {
            computePipeline: GPUComputePipeline;
            bindGroup: GPUBindGroup;
            dispatchX: number;
            dispatchY: number;

            constructor({
                buffers = [] as DynamicBuffer[], // Storage buffers
                uniforms = [] as Uniform[], // Uniform buffers
                shader = '',
                dispatchX = settings.grid_w,
                dispatchY = settings.grid_h
            }) {
                this.computePipeline = device.createComputePipeline({
                    layout: 'auto',
                    compute: {
                        module: device.createShaderModule({ code: shader }),
                        entryPoint: 'main'
                    }
                });

                const storageEntries = buffers.map(b => b.buffers).flat();
                const uniformEntries = uniforms.filter(u => u && u.buffer).map(u => u.buffer);

                const allEntries = [...storageEntries, ...uniformEntries].map((buffer, i) => ({
                    binding: i,
                    resource: { buffer }
                }));

                this.bindGroup = device.createBindGroup({
                    layout: this.computePipeline.getBindGroupLayout(0),
                    entries: allEntries
                });

                this.dispatchX = dispatchX;
                this.dispatchY = dispatchY;
            }

            dispatch(passEncoder: GPUComputePassEncoder) {
                passEncoder.setPipeline(this.computePipeline);
                passEncoder.setBindGroup(0, this.bindGroup);
                passEncoder.dispatchWorkgroups(Math.ceil(this.dispatchX / 8), Math.ceil(this.dispatchY / 8));
            }
        }

        // Program Subclasses
        class AdvectProgram extends Program {
            constructor({ in_quantity, in_velocity, out_quantity, uniforms, shader = advectShader, ...props }: any) {
                uniforms ??= [globalUniforms.gridSize];
                super({ buffers: [in_quantity, in_velocity, out_quantity], uniforms, shader, ...props });
            }
        }
        class DivergenceProgram extends Program {
            constructor({ in_velocity, out_divergence, uniforms, shader = divergenceShader }: any) {
                uniforms ??= [globalUniforms.gridSize];
                super({ buffers: [in_velocity, out_divergence], uniforms, shader });
            }
        }
        class PressureProgram extends Program {
            constructor({ in_pressure, in_divergence, out_pressure, uniforms, shader = pressureShader }: any) {
                uniforms ??= [globalUniforms.gridSize];
                super({ buffers: [in_pressure, in_divergence, out_pressure], uniforms, shader });
            }
        }
        class GradientSubtractProgram extends Program {
            constructor({ in_pressure, in_velocity, out_velocity, uniforms, shader = gradientSubtractShader }: any) {
                uniforms ??= [globalUniforms.gridSize];
                super({ buffers: [in_pressure, in_velocity, out_velocity], uniforms, shader });
            }
        }
        class BoundaryProgram extends Program {
            constructor({ in_quantity, out_quantity, uniforms, shader = boundaryShader }: any) {
                uniforms ??= [globalUniforms.gridSize];
                super({ buffers: [in_quantity, out_quantity], uniforms, shader });
            }
        }
        class UpdateProgram extends Program {
            constructor({ in_quantity, out_quantity, uniforms, shader = updateVelocityShader, ...props }: any) {
                uniforms ??= [globalUniforms.gridSize];
                super({ buffers: [in_quantity, out_quantity], uniforms, shader, ...props });
            }
        }
        class VorticityProgram extends Program {
            constructor({ in_velocity, out_vorticity, uniforms, shader = vorticityShader, ...props }: any) {
                uniforms ??= [globalUniforms.gridSize];
                super({ buffers: [in_velocity, out_vorticity], uniforms, shader, ...props });
            }
        }
        class VorticityConfinmentProgram extends Program {
            constructor({ in_velocity, in_vorticity, out_velocity, uniforms, shader = vorticityConfinmentShader, ...props }: any) {
                uniforms ??= [globalUniforms.gridSize];
                super({ buffers: [in_velocity, in_vorticity, out_velocity], uniforms, shader, ...props });
            }
        }

        class RenderProgram {
            vertexBuffer: GPUBuffer;
            renderPipeline: GPURenderPipeline;
            renderBindGroup: GPUBindGroup;
            renderPassDescriptor: GPURenderPassDescriptor;
            buffer: DynamicBuffer;

            constructor() {
                const vertices = new Float32Array([-1, -1, 0, 1, -1, 1, 0, 1, 1, -1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, 1, 1, 0, 1]);
                this.vertexBuffer = device.createBuffer({
                    size: vertices.byteLength,
                    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                    mappedAtCreation: true
                });
                new Float32Array(this.vertexBuffer.getMappedRange()).set(vertices);
                this.vertexBuffer.unmap();

                const shaderModule = device.createShaderModule({ code: renderShader });
                this.renderPipeline = device.createRenderPipeline({
                    layout: 'auto',
                    vertex: {
                        module: shaderModule,
                        entryPoint: 'vertex_main',
                        buffers: [{ attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x4' }], arrayStride: 16, stepMode: 'vertex' }]
                    },
                    fragment: {
                        module: shaderModule,
                        entryPoint: 'fragment_main',
                        targets: [{
                            format: presentationFormat, blend: {
                                color: { srcFactor: 'src-alpha', dstFactor: 'one', operation: 'add' },
                                alpha: { srcFactor: 'src-alpha', dstFactor: 'one', operation: 'add' }
                            }
                        }]
                    },
                    primitive: { topology: 'triangle-list' }
                });

                this.buffer = new DynamicBuffer({ dims: 3, w: settings.dye_w, h: settings.dye_h });

                const entries = [
                    ...this.buffer.buffers,
                    globalUniforms.gridSize.buffer,
                    globalUniforms.render_intensity_multiplier.buffer
                ].map((b, i) => ({ binding: i, resource: { buffer: b } }));

                this.renderBindGroup = device.createBindGroup({
                    layout: this.renderPipeline.getBindGroupLayout(0),
                    entries
                });

                this.renderPassDescriptor = {
                    colorAttachments: [{
                        view: undefined as any, // assigned in dispatch
                        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
                        loadOp: 'clear',
                        storeOp: 'store'
                    }]
                };
            }

            dispatch(commandEncoder: GPUCommandEncoder) {
                (this.renderPassDescriptor.colorAttachments as GPURenderPassColorAttachment[])[0].view = context.getCurrentTexture().createView();
                const renderPassEncoder = commandEncoder.beginRenderPass(this.renderPassDescriptor);
                renderPassEncoder.setPipeline(this.renderPipeline);
                renderPassEncoder.setBindGroup(0, this.renderBindGroup);
                renderPassEncoder.setVertexBuffer(0, this.vertexBuffer);
                renderPassEncoder.draw(6);
                renderPassEncoder.end();
            }
        }

        // ==========================================
        // Initialization & Logic
        // ==========================================

        function initBuffers() {
            velocity = new DynamicBuffer({ dims: 2 });
            velocity0 = new DynamicBuffer({ dims: 2 });
            dye = new DynamicBuffer({ dims: 3, w: settings.dye_w, h: settings.dye_h });
            dye0 = new DynamicBuffer({ dims: 3, w: settings.dye_w, h: settings.dye_h });
            divergence = new DynamicBuffer();
            divergence0 = new DynamicBuffer();
            pressure = new DynamicBuffer();
            pressure0 = new DynamicBuffer();
            vorticity = new DynamicBuffer();
        }

        function initUniforms() {
            time = new Uniform("time");
            dt = new Uniform("dt");
            mouse = new Uniform("mouseInfos", { size: 4 });
            grid = new Uniform("gridSize", {
                size: 7,
                value: [settings.grid_w, settings.grid_h, settings.dye_w, settings.dye_h, settings.dx, settings.rdx, settings.dyeRdx]
            });
            uSimSpeed = new Uniform("sim_speed", { value: settings.sim_speed });
            vel_force = new Uniform("velocity_add_intensity", { value: settings.velocity_add_intensity });
            vel_radius = new Uniform("velocity_add_radius", { value: settings.velocity_add_radius });
            vel_diff = new Uniform("velocity_diffusion", { value: settings.velocity_diffusion });
            dye_force = new Uniform("dye_add_intensity", { value: settings.dye_add_intensity });
            dye_radius = new Uniform("dye_add_radius", { value: settings.dye_add_radius });
            dye_diff = new Uniform("dye_diffusion", { value: settings.dye_diffusion });
            viscosity = new Uniform("viscosity", { value: settings.viscosity });
            uVorticity = new Uniform("vorticity", { value: settings.vorticity });
            containFluid = new Uniform("contain_fluid", { value: settings.contain_fluid });
            uSymmetry = new Uniform("mouse_type", { value: 0 });
            uRenderIntensity = new Uniform("render_intensity_multiplier", { value: 1.5 }); // Boosted intensity for visibility
        }

        function initPrograms() {
            checkerProgram = new Program({
                buffers: [dye],
                shader: checkerboardShader,
                dispatchX: settings.dye_w,
                dispatchY: settings.dye_h,
                uniforms: [grid, time]
            });
            updateDyeProgram = new UpdateProgram({
                in_quantity: dye,
                out_quantity: dye0,
                uniforms: [grid, mouse, dye_force, dye_radius, dye_diff, time, dt, uSymmetry],
                dispatchX: settings.dye_w,
                dispatchY: settings.dye_h,
                shader: updateDyeShader
            });
            updateProgram = new UpdateProgram({
                in_quantity: velocity,
                out_quantity: velocity0,
                uniforms: [grid, mouse, vel_force, vel_radius, vel_diff, dt, time, uSymmetry]
            });
            advectProgram = new AdvectProgram({
                in_quantity: velocity0,
                in_velocity: velocity0,
                out_quantity: velocity,
                uniforms: [grid, dt]
            });
            boundaryProgram = new BoundaryProgram({
                in_quantity: velocity,
                out_quantity: velocity0,
                uniforms: [grid, containFluid]
            });
            divergenceProgram = new DivergenceProgram({
                in_velocity: velocity0,
                out_divergence: divergence0
            });
            boundaryDivProgram = new BoundaryProgram({
                in_quantity: divergence0,
                out_quantity: divergence,
                shader: boundaryPressureShader
            });
            pressureProgram = new PressureProgram({
                in_pressure: pressure,
                in_divergence: divergence,
                out_pressure: pressure0
            });
            boundaryPressureProgram = new BoundaryProgram({
                in_quantity: pressure0,
                out_quantity: pressure,
                shader: boundaryPressureShader
            });
            gradientSubtractProgram = new GradientSubtractProgram({
                in_pressure: pressure,
                in_velocity: velocity0,
                out_velocity: velocity
            });
            advectDyeProgram = new AdvectProgram({
                in_quantity: dye0,
                in_velocity: velocity,
                out_quantity: dye,
                uniforms: [grid, dt],
                dispatchX: settings.dye_w,
                dispatchY: settings.dye_h,
                shader: advectDyeShader
            });
            clearPressureProgram = new UpdateProgram({
                in_quantity: pressure,
                out_quantity: pressure0,
                uniforms: [grid, viscosity],
                shader: clearPressureShader
            });
            vorticityProgram = new VorticityProgram({
                in_velocity: velocity,
                out_vorticity: vorticity
            });
            vorticityConfinmentProgram = new VorticityConfinmentProgram({
                in_velocity: velocity,
                in_vorticity: vorticity,
                out_velocity: velocity0,
                uniforms: [grid, dt, uVorticity]
            });
            renderProgram = new RenderProgram();
        }

        function initSizes() {
            // @ts-ignore
            const dpr = window.devicePixelRatio || 1;
            const maxBufferSize = device.limits.maxStorageBufferBindingSize;
            const maxCanvasSize = device.limits.maxTextureDimension2D;

            const getPreferredDimensions = (baseSize: number) => {
                let w, h;
                const aspectRatio = window.innerWidth / window.innerHeight;
                const scaledBaseSize = baseSize * dpr;
                if (aspectRatio > 1) {
                    h = scaledBaseSize;
                    w = Math.floor(h * aspectRatio);
                } else {
                    w = scaledBaseSize;
                    h = Math.floor(w / aspectRatio);
                }
                return getValidDimensions(w, h);
            };

            const getValidDimensions = (w: number, h: number) => {
                let downRatio = 1;
                if (w * h * 4 >= maxBufferSize) downRatio = Math.sqrt(maxBufferSize / (w * h * 4));
                if (w > maxCanvasSize) downRatio = maxCanvasSize / w;
                else if (h > maxCanvasSize) downRatio = maxCanvasSize / h;
                return { w: Math.floor(w * downRatio), h: Math.floor(h * downRatio) };
            };

            let gridSize = getPreferredDimensions(settings.grid_size);
            settings.grid_w = gridSize.w;
            settings.grid_h = gridSize.h;

            let dyeSize = getPreferredDimensions(settings.dye_size);
            settings.dye_w = dyeSize.w;
            settings.dye_h = dyeSize.h;

            settings.rdx = settings.grid_size * 4;
            settings.dyeRdx = settings.dye_size * 4;
            settings.dx = 1 / settings.rdx;

            canvas!.width = settings.dye_w;
            canvas!.height = settings.dye_h;
        }

        function refreshSizes() {
            initSizes();
            initBuffers();
            initPrograms();
            // @ts-ignore
            globalUniforms.gridSize.needsUpdate = [
                settings.grid_w, settings.grid_h, settings.dye_w, settings.dye_h, settings.dx, settings.rdx, settings.dyeRdx
            ];
        }

        function dispatchComputePipeline(passEncoder: GPUComputePassEncoder) {
            updateDyeProgram.dispatch(passEncoder);
            updateProgram.dispatch(passEncoder);
            advectProgram.dispatch(passEncoder);
            boundaryProgram.dispatch(passEncoder);
            divergenceProgram.dispatch(passEncoder);
            boundaryDivProgram.dispatch(passEncoder);
            for (let i = 0; i < settings.pressure_iterations; i++) {
                pressureProgram.dispatch(passEncoder);
                boundaryPressureProgram.dispatch(passEncoder);
            }
            gradientSubtractProgram.dispatch(passEncoder);
            clearPressureProgram.dispatch(passEncoder);
            vorticityProgram.dispatch(passEncoder);
            vorticityConfinmentProgram.dispatch(passEncoder);
            advectDyeProgram.dispatch(passEncoder);
        }

        function handlePointerMove(e: MouseEvent | TouchEvent) {
            // @ts-ignore
            const pointer = e.touches ? e.touches[0] : e;
            const rect = canvas!.getBoundingClientRect();
            if (!mouseInfos.current) mouseInfos.current = [];
            mouseInfos.current[0] = (pointer.clientX - rect.left) / rect.width;
            mouseInfos.current[1] = 1 - (pointer.clientY - rect.top) / rect.height;
        }

        let animationFrameId: number;

        async function init() {
            if (!navigator.gpu) return;
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) return;
            device = await adapter.requestDevice();

            // @ts-ignore
            context = canvas!.getContext("webgpu");
            if (!context) return;

            // Mouse events
            window.addEventListener('mousemove', handlePointerMove);
            window.addEventListener('touchmove', handlePointerMove);
            window.addEventListener('resize', refreshSizes);

            presentationFormat = navigator.gpu.getPreferredCanvasFormat();
            context.configure({
                device,
                format: presentationFormat,
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
                alphaMode: "premultiplied"
            });

            initSizes();
            initBuffers();
            initUniforms();
            initPrograms();

            let lastFrame = performance.now();

            function step() {
                animationFrameId = requestAnimationFrame(step);
                const now = performance.now();
                settings.dt = Math.min(1 / 60, (now - lastFrame) / 1000) * settings.sim_speed;
                settings.time += settings.dt;
                lastFrame = now;

                Object.values(globalUniforms).forEach(u => u.update(device.queue));

                if (mouseInfos.current) {
                    let dx = mouseInfos.last ? mouseInfos.current[0] - mouseInfos.last[0] : 0;
                    let dy = mouseInfos.last ? mouseInfos.current[1] - mouseInfos.last[1] : 0;
                    // Boost velocity for mouse movement
                    const zoom = 800;
                    mouseInfos.velocity = [dx * zoom, dy * zoom];
                    mouse.update(device.queue, [...mouseInfos.current, ...mouseInfos.velocity]);
                    mouseInfos.last = [...mouseInfos.current];
                }

                const commandEncoder = device.createCommandEncoder();
                const passEncoder = commandEncoder.beginComputePass();
                dispatchComputePipeline(passEncoder);
                passEncoder.end();

                velocity0.copyTo(velocity, commandEncoder);
                pressure0.copyTo(pressure, commandEncoder);
                dye.copyTo(renderProgram.buffer, commandEncoder);

                renderProgram.dispatch(commandEncoder);
                device.queue.submit([commandEncoder.finish()]);
            }

            step();
        }

        init();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('resize', refreshSizes);
        };
    }, []);


    return (
        <section id='container' className="fixed inset-0 z-50 pointer-events-none">
            <canvas
                id="fluid-webgpu"
                ref={canvasRef}
                className="fixed inset-0 w-full h-full pointer-events-none"
                style={{ opacity: 0.6, mixBlendMode: 'screen' }}
            />
        </section>
    );
}

