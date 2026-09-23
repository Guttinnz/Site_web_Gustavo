import { useEffect, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three';

const DESKTOP_PARTICLES = 2500;
const MOBILE_PARTICLES = 800;
const SPHERE_RADIUS = 4;
const ACCENT_RATIO = 0.35;
/** Tamanho no mundo 3D; com a câmera a 7 unidades resulta em ~1,5–2 px na tela. */
const PARTICLE_SIZE = 0.035;
const ROTATION_SPEED = 0.04; // rad/s
const PARALLAX_EASING = 2.5;

/** Sprite circular com borda suave (sem ele os pontos seriam quadrados). */
function createSprite(): CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.85)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  return new CanvasTexture(canvas);
}

/** Campo de partículas em WebGL. Carregado sob demanda (React.lazy) — o three.js fica fora do bundle inicial. */
export default function Background3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Um canvas novo a cada montagem: depois do forceContextLoss() o contexto antigo
    // não pode ser reaproveitado (o StrictMode monta o efeito duas vezes no dev).
    const canvas = document.createElement('canvas');
    canvas.className = 'h-full w-full opacity-0 transition-opacity duration-[1500ms]';
    container.appendChild(canvas);

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch {
      canvas.remove();
      return; // Sem WebGL: fica só o gradiente estático do fundo.
    }

    const isSmallScreen = window.matchMedia('(max-width: 767px)').matches;
    const count = isSmallScreen ? MOBILE_PARTICLES : DESKTOP_PARTICLES;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmallScreen ? 1.5 : 2));

    const scene = new Scene();
    const camera = new PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 7;

    const accentHex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const accent = new Color(accentHex || '#22d3ee');
    const white = new Color('#ffffff');

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      // Distribuição uniforme no volume da esfera.
      const radius = SPHERE_RADIUS * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = Math.random() < ACCENT_RATIO ? accent : white;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    const sprite = createSprite();
    const material = new PointsMaterial({
      size: PARTICLE_SIZE,
      map: sprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: AdditiveBlending,
      sizeAttenuation: true,
    });

    const points = new Points(geometry, material);
    scene.add(points);

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      // Em telas largas a esfera fica à direita, onde o gradiente do hero é transparente.
      points.position.x = width >= 1024 ? 1.8 : 0;
    };
    resize();

    const pointer = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    let frame = 0;
    let lastTime = performance.now();
    const tick = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const ease = Math.min(1, delta * PARALLAX_EASING);
      eased.x += (pointer.x - eased.x) * ease;
      eased.y += (pointer.y - eased.y) * ease;

      points.rotation.y += delta * ROTATION_SPEED;
      camera.position.x = eased.x * 0.6;
      camera.position.y = -eased.y * 0.4;
      camera.lookAt(points.position);

      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const onVisibilityChange = () => (document.hidden ? stop() : start());

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    renderer.render(scene, camera);
    canvas.style.opacity = '1';
    if (!document.hidden) start();

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      geometry.dispose();
      material.dispose();
      sprite.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, []);

  return <div ref={containerRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" />;
}
