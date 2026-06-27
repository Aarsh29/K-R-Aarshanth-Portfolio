import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface CyberCanvasProps {
  currentSlide: number;
}

export default function CyberCanvas({ currentSlide }: CyberCanvasProps) {
  const containerRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const currentSlideRef = useRef(currentSlide);

  // Sync current slide state to ref so render loop can access it without destroying the WebGL context
  useEffect(() => {
    currentSlideRef.current = currentSlide;
  }, [currentSlide]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Create Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);
    scene.add(camera);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: containerRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // 4. Background Custom Shader (Matrix Scanline Grid)
    const uniforms = {
      uT: { value: 0 },
      uR: { value: new THREE.Vector2(width, height) },
      uM: { value: new THREE.Vector2() },
      uS: { value: 0 },
    };

    const bgFrag = `
      precision mediump float;
      uniform float uT;
      uniform vec2 uR;
      uniform vec2 uM;
      uniform float uS;

      float hash(float n) { return fract(sin(n) * 43758.5453123); }
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float matrixRain(vec2 uv, float time) {
        float colWidth = 0.08;
        float colId = floor(uv.x / colWidth);
        float colOffset = hash(colId) * 15.0;
        
        float speed = 0.35 + hash(colId) * 0.75;
        float y = uv.y + time * speed + colOffset;
        
        float rowId = floor(y * 12.0);
        float cellNoise = noise(vec2(colId, rowId));
        
        float trail = fract(-y);
        float head = step(0.97, trail) * 0.35;
        
        float stream = step(0.12, cellNoise) * (trail * 0.55 + head);
        return stream;
      }

      float grid(vec2 uv, float size, float thickness) {
        vec2 g = step(thickness, fract(uv / size));
        return 1.0 - min(g.x, g.y);
      }

      void main() {
        vec2 centerUv = gl_FragCoord.xy / uR - 0.5;
        float distToCenter = length(centerUv);
        
        vec2 uv = centerUv * vec2(uR.x / uR.y, 1.0) * 2.0;
        uv += uM * 0.05;
        
        float t = uT * 0.35;
        float distortion = 0.015 * (0.1 + uS * 0.9);
        float split = distToCenter * distToCenter * 0.035;
        
        vec2 uvR = uv * (1.0 + split);
        vec2 uvG = uv;
        vec2 uvB = uv * (1.0 - split);
        
        uvR.x += sin(uvR.y * 3.0 + t) * distortion;
        uvR.y += cos(uvR.x * 3.0 - t) * distortion;
        
        uvG.x += sin(uvG.y * 3.0 + t) * distortion;
        uvG.y += cos(uvG.x * 3.0 - t) * distortion;
        
        uvB.x += sin(uvB.y * 3.0 + t) * distortion;
        uvB.y += cos(uvB.x * 3.0 - t) * distortion;
        
        float gR = grid(uvR, 0.25, 0.993) * 0.09;
        float gG = grid(uvG, 0.25, 0.993) * 0.11;
        float gB = grid(uvB, 0.25, 0.993) * 0.09;
        
        float rainR = matrixRain(uvR, t * 1.5);
        float rainG = matrixRain(uvG, t * 1.5);
        float rainB = matrixRain(uvB, t * 1.5);
        
        float scanline = sin(gl_FragCoord.y * 0.5 + uT * 5.0) * 0.015;
        
        vec3 baseColor = vec3(0.001, 0.003, 0.005);
        
        vec3 cyberGreen = vec3(0.0, 1.0, 0.25);
        vec3 cyberCyan = vec3(0.0, 0.898, 1.0);
        
        vec3 accentColor = mix(cyberGreen, cyberCyan, uS);
        
        vec3 color = baseColor;
        
        color.r += accentColor.r * gR;
        color.g += accentColor.g * gG;
        color.b += accentColor.b * gB;
        
        color.r += accentColor.r * rainR * 0.6;
        color.g += accentColor.g * rainG * 0.7;
        color.b += accentColor.b * rainB * 0.6;
        
        color += accentColor * scanline;
        color *= (1.0 - distToCenter * distToCenter * 0.85);
        
        float grain = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.02;
        color += vec3(grain);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const bgMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: bgFrag,
      uniforms,
      depthWrite: false,
      depthTest: false,
    });

    const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), bgMat);
    bgMesh.position.set(0, 0, -8);
    bgMesh.renderOrder = -10;
    camera.add(bgMesh);

    // 5. Ambient Particles Swarm
    const PACount = 300; // Lower count for more elegant, minimal dust
    const ppAmbient = new Float32Array(PACount * 3);
    const pcAmbient = new Float32Array(PACount * 3);
    const pdAmbient: { vx: number; vy: number; vz: number; sx: number; sy: number; sz: number }[] = [];

    // Helper canvas to generate a glow-circle texture for particles
    const getCircleTexture = () => {
      const canv = document.createElement("canvas");
      canv.width = 16;
      canv.height = 16;
      const ctx = canv.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, "rgba(0, 255, 65, 1)");
        grad.addColorStop(0.5, "rgba(0, 255, 65, 0.4)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
      }
      return new THREE.CanvasTexture(canv);
    };
    const pTexture = getCircleTexture();

    for (let i = 0; i < PACount; i++) {
      ppAmbient[i * 3] = (Math.random() - 0.5) * 10.0;
      ppAmbient[i * 3 + 1] = (Math.random() - 0.5) * 8.0;
      ppAmbient[i * 3 + 2] = (Math.random() - 0.5) * 4.0;

      // Darker, subtle cyber colors
      if (Math.random() < 0.7) {
        pcAmbient[i * 3] = 0.0;
        pcAmbient[i * 3 + 1] = 0.8;
        pcAmbient[i * 3 + 2] = 0.2;
      } else {
        pcAmbient[i * 3] = 0.0;
        pcAmbient[i * 3 + 1] = 0.7;
        pcAmbient[i * 3 + 2] = 0.8;
      }

      pdAmbient.push({
        vx: 0,
        vy: 0,
        vz: 0,
        sx: (Math.random() - 0.5) * 0.05,
        sy: 0.04 + Math.random() * 0.06, // extremely slow drift upward
        sz: (Math.random() - 0.5) * 0.05,
      });
    }

    const ambientGeom = new THREE.BufferGeometry();
    ambientGeom.setAttribute("position", new THREE.BufferAttribute(ppAmbient, 3));
    ambientGeom.setAttribute("color", new THREE.BufferAttribute(pcAmbient, 3));

    const ambientMat = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      map: pTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ambientParticles = new THREE.Points(ambientGeom, ambientMat);
    scene.add(ambientParticles);

    // Mouse listener inside canvas
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", onMouseMove);

    // Render loop state
    let startTime = performance.now();
    let prevTime = performance.now();

    const animateScene = () => {
      const now = performance.now();
      // Cap delta at 0.1s to prevent extreme jumps when tab is hidden/backgrounded
      const delta = Math.min(0.1, (now - prevTime) / 1000);
      prevTime = now;
      const elapsed = (now - startTime) / 1000;

      // Handle custom mouse movement drift in WebGL space
      const smx = mouseRef.current.x;
      const smy = mouseRef.current.y;

      // Slow drift Ambient Particles logic
      const paAmbient = ambientParticles.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < PACount; i++) {
        paAmbient[i * 3] += pdAmbient[i].sx * delta * 0.5;
        paAmbient[i * 3 + 1] += pdAmbient[i].sy * delta * 0.8;
        paAmbient[i * 3 + 2] += pdAmbient[i].sz * delta * 0.5;

        if (paAmbient[i * 3 + 1] > 4.0) {
          paAmbient[i * 3 + 1] = -4.0;
          paAmbient[i * 3] = (Math.random() - 0.5) * 10.0;
        }
      }
      ambientParticles.geometry.attributes.position.needsUpdate = true;

      // Camera is kept beautifully stable and elegant, with tiny mouse parallax
      const targetCamX = smx * 0.15;
      const targetCamY = -smy * 0.10;
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.position.z = 5.0; // Fixed depth
      camera.lookAt(0, 0, 0);

      // Uniform updates
      uniforms.uT.value = elapsed;
      uniforms.uM.value.set(smx * 0.5, -smy * 0.5);
      uniforms.uS.value = currentSlideRef.current / 6.0;

      renderer.render(scene, camera);
      requestAnimationFrame(animateScene);
    };

    const rAf = requestAnimationFrame(animateScene);

    // Resize Handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      uniforms.uR.value.set(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rAf);
      
      // Clean up Three geometries and textures to avoid memory leaks
      bgMesh.geometry.dispose();
      bgMat.dispose();
      ambientParticles.geometry.dispose();
      ambientMat.dispose();
      pTexture.dispose();
      
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={containerRef}
      className="fixed inset-0 w-full h-full z-[1] pointer-events-none"
    />
  );
}
