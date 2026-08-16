/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

import idCardImg from '../assets/id_card/id_card_web.png';
import mcBookImg from '../assets/lanyard_img/MC_book.png';

extend({ MeshLineGeometry, MeshLineMaterial });

export interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
}

// Generate 3D Extruded Geometry with Curved Rounded Corners
function createRoundedCardGeometry(width = 1.35, height = 2.05, radius = 0.12, depth = 0.025) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const w = width;
  const h = height;
  const r = radius;

  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  const extrudeSettings = {
    depth: depth,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.012,
    bevelThickness: 0.012
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();

  // Compute clean normalized UVs for front and back faces
  const pos = geom.attributes.position;
  const uvs = new Float32Array((pos.count) * 2);
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    uvs[i * 2] = (px + width / 2) / width;
    uvs[i * 2 + 1] = (py + height / 2) / height;
  }
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  return geom;
}

// Draw the React Bits Atomic Logo for fallback/back face
function drawReactBitsLogo(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string = '#0a0a0c') {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = size * 0.11;
  ctx.lineCap = 'round';

  // Center dot
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.09, 0, Math.PI * 2);
  ctx.fill();

  // Outer orbital ring 1
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.65, size * 0.28, Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();

  // Outer orbital ring 2
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.65, size * 0.28, -Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// React Bits black lanyard band texture with repeating white logos
function createReactBitsBandTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#0a0a0c';
  ctx.fillRect(0, 0, 512, 64);

  for (let x = 64; x < 512; x += 128) {
    drawReactBitsLogo(ctx, x, 32, 28, '#ffffff');
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = idCardImg,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-full relative flex justify-center items-center">
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span className="text-5xl sm:text-7xl font-black text-white/5 tracking-wider">
          Drag It!
        </span>
      </div>

      {/* Transparent wrapper — prevents white flash before Three.js sets clear color */}
      <div className="relative z-10 w-full h-full" style={{ background: 'transparent' }}>
        <Canvas
          camera={{ position: position, fov: fov }}
          dpr={[1, isMobile ? 1.5 : 2]}
          style={{ background: 'transparent' }}
          gl={{
            alpha: transparent,
            powerPreference: 'high-performance',
            antialias: !isMobile,
            preserveDrawingBuffer: false,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1);
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
            }, false);
          }}
        >
          <ambientLight intensity={Math.PI} />
          <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
            <Band
              isMobile={isMobile}
              frontImage={frontImage || idCardImg}
              backImage={backImage}
              imageFit={imageFit}
              lanyardImage={lanyardImage}
              lanyardWidth={lanyardWidth}
            />
          </Physics>
          <Environment blur={0.75}>
            <Lightformer
              intensity={2}
              color="white"
              position={[0, -1, 5]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={3}
              color="white"
              position={[-1, -1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={3}
              color="white"
              position={[1, 1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={10}
              color="white"
              position={[-10, 0, 14]}
              rotation={[0, Math.PI / 2, Math.PI / 3]}
              scale={[100, 10, 1]}
            />
          </Environment>
        </Canvas>
      </div>
    </div>
  );
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = idCardImg,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1
}: {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
}) {
  const band = useRef<any>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);

  // Stable reusable vectors — allocated once, mutated in-place each frame
  const vec = useMemo(() => new THREE.Vector3(), []);
  const ang = useMemo(() => new THREE.Vector3(), []);
  const rot = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);

  const segmentProps = { type: 'dynamic' as const, canSleep: true, colliders: false as const, angularDamping: 4, linearDamping: 4 };

  // Load raw id_card_web.png texture
  const frontTex = useTexture(frontImage || idCardImg);
  frontTex.colorSpace = THREE.SRGBColorSpace;

  // Band texture and card geometry — created once, disposed on unmount
  const defaultBandTex = useMemo(() => {
    const tex = createReactBitsBandTexture();
    return tex;
  }, []);

  const cardGeometry = useMemo(() => {
    const geom = createRoundedCardGeometry(1.35, 2.05, 0.12, 0.025);
    return geom;
  }, []);

  // Band material and geometry — created once, stable references for <primitive>
  const bandGeometry = useMemo(() => new MeshLineGeometry(), []);
  const bandMaterial = useMemo(() => new MeshLineMaterial({
    color: '#ffffff',
    depthTest: false,
    resolution: isMobile ? new THREE.Vector2(1000, 2000) : new THREE.Vector2(1000, 1000),
    useMap: 1,
    map: defaultBandTex,
    repeat: new THREE.Vector2(-4, 1),
    lineWidth: lanyardWidth
  }), [defaultBandTex, isMobile, lanyardWidth]);

  // Dispose Three.js resources on unmount to prevent GPU memory leaks
  useEffect(() => {
    return () => {
      cardGeometry.dispose();
      defaultBandTex.dispose();
      bandGeometry.dispose();
      bandMaterial.dispose();
    };
  }, [cardGeometry, defaultBandTex, bandGeometry, bandMaterial]);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.2, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref: any) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());

      if (band.current?.geometry) {
        band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      }

      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.6, 0.9, 0.01]} />
          <group
            scale={1.55}
            position={[0, -0.9, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => {
              const target = e.target as unknown as HTMLElement;
              target?.releasePointerCapture?.(e.pointerId);
              drag(false);
            }}
            onPointerDown={e => {
              const target = e.target as unknown as HTMLElement;
              target?.setPointerCapture?.(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            {/* Pure Raw Material without lighting filters or tone mapping shifts */}
            <mesh geometry={cardGeometry} position={[0, 0, 0]}>
              <meshBasicMaterial
                map={frontTex}
                toneMapped={false}
              />
            </mesh>

            {/* Black Metallic Strap Clamp Base */}
            <mesh position={[0, 1.15, 0]}>
              <boxGeometry args={[0.22, 0.1, 0.05]} />
              <meshStandardMaterial color="#0a0a0c" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Swivel Metal Ring */}
            <mesh position={[0, 1.07, 0]}>
              <torusGeometry args={[0.07, 0.016, 16, 32]} />
              <meshStandardMaterial color="#111827" metalness={0.95} roughness={0.15} />
            </mesh>

            {/* Swivel Clasp Hook */}
            <mesh position={[0, 0.97, 0]}>
              <torusGeometry args={[0.055, 0.016, 16, 32]} />
              <meshStandardMaterial color="#111827" metalness={0.95} roughness={0.15} />
            </mesh>
            <mesh position={[0, 0.91, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 0.1, 16]} />
              <meshStandardMaterial color="#111827" metalness={0.95} roughness={0.15} />
            </mesh>
          </group>
        </RigidBody>
      </group>

      {/* Black Lanyard Strap with Repeating White React Bits Logos */}
      {/* Stable primitive references — no new object on every render */}
      <mesh ref={band}>
        <primitive object={bandGeometry} attach="geometry" />
        <primitive object={bandMaterial} attach="material" />
      </mesh>
    </>
  );
}
