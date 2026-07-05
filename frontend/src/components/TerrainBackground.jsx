import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * TerrainBackground
 * ------------------
 * A slowly rotating 3D topographic "contour map" rendered with Three.js.
 * Procedurally generates a heightfield (a few mountain peaks + fbm noise),
 * extracts iso-elevation contour lines from it (marching squares), and
 * draws the whole thing as a single glowing line-mesh in the site's teal
 * palette — evoking a geophysical survey / terrain-mapping visual.
 *
 * Everything is baked into one BufferGeometry on mount (cheap to draw),
 * so the animation loop only has to rotate/nudge the group each frame.
 */

// ---- tiny deterministic 2D value-noise (no external deps) ----------------
function makeNoise2D(seed = 1337) {
  const perm = new Uint8Array(512);
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + t * (b - a);
  const grad = (hash, x, y) => {
    const h = hash & 7;
    const gx = [1, -1, 1, -1, 1, -1, 0, 0][h];
    const gy = [1, 1, -1, -1, 0, 0, 1, -1][h];
    return gx * x + gy * y;
  };

  return function noise2D(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[(perm[X] + Y) & 255];
    const ab = perm[(perm[X] + Y + 1) & 255];
    const ba = perm[(perm[X + 1] + Y) & 255];
    const bb = perm[(perm[X + 1] + Y + 1) & 255];
    const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
    const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
    return lerp(x1, x2, v); // roughly [-1, 1]
  };
}

function fbm(noise, x, y, octaves = 5, lacunarity = 2.0, gain = 0.5) {
  let amp = 0.5;
  let freq = 1.0;
  let sum = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * freq, y * freq);
    freq *= lacunarity;
    amp *= gain;
  }
  return sum;
}

// ---- heightfield: a couple of peaks + rolling fbm detail ------------------
function buildHeightfield(res, seed) {
  const noise = makeNoise2D(seed);
  const heights = new Float32Array(res * res);

  const peaks = [
    { x: -0.28, y: 0.05, r: 0.34, h: 1.0 },
    { x: 0.05, y: -0.35, r: 0.4, h: 0.85 },
    { x: 0.45, y: 0.1, r: 0.5, h: 0.35 },
  ];

  let min = Infinity;
  let max = -Infinity;

  for (let j = 0; j < res; j++) {
    for (let i = 0; i < res; i++) {
      const nx = i / (res - 1) - 0.5; // -0.5..0.5
      const ny = j / (res - 1) - 0.5;

      let h = 0;
      for (const pk of peaks) {
        const d = Math.hypot(nx - pk.x, ny - pk.y) / pk.r;
        h += pk.h * Math.exp(-d * d * 2.2);
      }

      // rolling detail + irregular coastline-like falloff toward the edges
      const detail = fbm(noise, nx * 3.2 + 10, ny * 3.2 + 10, 5) * 0.28;
      const edge = fbm(noise, nx * 1.5 - 4, ny * 1.5 - 4, 3) * 0.12;
      const cornerFalloff = Math.max(
        0,
        1 - Math.pow(Math.hypot(nx * 1.15, ny * 1.15) * 1.15, 2.2)
      );

      h = (h + detail) * (0.55 + 0.45 * cornerFalloff) + edge;

      heights[j * res + i] = h;
      if (h < min) min = h;
      if (h > max) max = h;
    }
  }

  // normalize to 0..1
  for (let k = 0; k < heights.length; k++) {
    heights[k] = (heights[k] - min) / (max - min || 1);
  }

  return heights;
}

// ---- marching squares: extract all contour line segments in one pass -----
function buildContourGeometry({
  heights,
  res,
  levels = 26,
  worldSize = 15,
  heightScale = 3.2,
  colorLow,
  colorHigh,
}) {
  const positions = [];
  const colors = [];
  const cLow = new THREE.Color(colorLow);
  const cHigh = new THREE.Color(colorHigh);
  const tmp = new THREE.Color();

  const at = (i, j) => heights[j * res + i];
  const toWorld = (i, j, h) => [
    (i / (res - 1) - 0.5) * worldSize,
    h * heightScale,
    (j / (res - 1) - 0.5) * worldSize,
  ];

  const pushSegment = (p1, p2, level) => {
    positions.push(...p1, ...p2);
    tmp.copy(cLow).lerp(cHigh, level);
    colors.push(tmp.r, tmp.g, tmp.b, tmp.r, tmp.g, tmp.b);
  };

  for (let lvl = 1; lvl < levels; lvl++) {
    const threshold = lvl / levels;

    for (let j = 0; j < res - 1; j++) {
      for (let i = 0; i < res - 1; i++) {
        // corners: 0=TL 1=TR 2=BR 3=BL
        const v0 = at(i, j) - threshold;
        const v1 = at(i + 1, j) - threshold;
        const v2 = at(i + 1, j + 1) - threshold;
        const v3 = at(i, j + 1) - threshold;

        const edgePoint = (a, b, ia, ja, ib, jb) => {
          const t = a / (a - b);
          const h = at(ia, ja) + (at(ib, jb) - at(ia, ja)) * t;
          const ii = ia + (ib - ia) * t;
          const jj = ja + (jb - ja) * t;
          return toWorld(ii, jj, h);
        };

        const pts = [];
        if (Math.sign(v0) !== Math.sign(v1)) pts.push(edgePoint(v0, v1, i, j, i + 1, j));
        if (Math.sign(v1) !== Math.sign(v2)) pts.push(edgePoint(v1, v2, i + 1, j, i + 1, j + 1));
        if (Math.sign(v2) !== Math.sign(v3)) pts.push(edgePoint(v2, v3, i + 1, j + 1, i, j + 1));
        if (Math.sign(v3) !== Math.sign(v0)) pts.push(edgePoint(v3, v0, i, j + 1, i, j));

        if (pts.length === 2) {
          pushSegment(pts[0], pts[1], threshold);
        } else if (pts.length === 4) {
          // saddle case — pair them up (visually fine for decorative contours)
          pushSegment(pts[0], pts[1], threshold);
          pushSegment(pts[2], pts[3], threshold);
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

export default function TerrainBackground({
  className = '',
  colorLow = '#0d4f4f',
  colorHigh = '#5eead4',
  opacity = 0.75,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05080f, 0.055);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 5.4, 8.6);
    camera.lookAt(0, 0.6, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const res = window.innerWidth < 768 ? 70 : 100;
    const heights = buildHeightfield(res, 42);
    const geometry = buildContourGeometry({
      heights,
      res,
      levels: 28,
      worldSize: 15,
      heightScale: 3.2,
      colorLow,
      colorHigh,
    });

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const lines = new THREE.LineSegments(geometry, material);
    lines.position.y = -0.6;

    const group = new THREE.Group();
    group.add(lines);
    group.rotation.x = -0.15;
    scene.add(group);

    let raf = null;
    let t = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      t += dt;

      if (!prefersReducedMotion) {
        group.rotation.y = Math.sin(t * 0.06) * 0.55 + t * 0.035;
        group.position.y = Math.sin(t * 0.35) * 0.08;
        camera.position.y = 5.4 + Math.sin(t * 0.25) * 0.15;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (raf) cancelAnimationFrame(raf);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [colorLow, colorHigh, opacity]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  );
}
