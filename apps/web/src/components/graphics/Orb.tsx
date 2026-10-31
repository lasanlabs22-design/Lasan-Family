"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

// Ashima Arts 3D simplex noise (MIT).
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uAmp;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
${noise}
void main() {
  float n = snoise(normal * 1.3 + vec3(uTime * 0.16, uTime * 0.11, 0.0));
  float n2 = snoise(normal * 3.1 - uTime * 0.22) * 0.22;
  float d = (n + n2) * uAmp;
  vec3 p = position + normal * d;
  vNoise = d;
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}`;

const fragmentShader = /* glsl */ `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  float fres = pow(1.0 - max(dot(V, N), 0.0), 2.4);

  vec3 peach = vec3(0.98, 0.80, 0.68);
  vec3 blush = vec3(0.97, 0.78, 0.83);
  vec3 rose  = vec3(0.85, 0.40, 0.52);
  vec3 lilac = vec3(0.78, 0.71, 0.95);
  vec3 plum  = vec3(0.48, 0.26, 0.47);

  float t = N.y * 0.5 + 0.5;
  float swirl = sin(N.x * 3.0 + uTime * 0.4) * 0.5 + 0.5;
  vec3 col = mix(peach, blush, smoothstep(0.0, 0.55, t));
  col = mix(col, lilac, smoothstep(0.45, 1.0, t + vNoise * 1.6) * 0.85);
  col = mix(col, rose, smoothstep(0.05, 0.42, vNoise + 0.08) * 0.5 * swirl);
  col = mix(col, plum, smoothstep(0.75, 1.0, 1.0 - t) * 0.25);

  vec3 L = normalize(vec3(0.35, 0.85, 0.6));
  float diff = max(dot(N, L), 0.0);
  float spec = pow(max(dot(reflect(-L, N), V), 0.0), 28.0);
  col *= 0.84 + diff * 0.24;
  col += spec * 0.18;
  col += fres * vec3(1.0, 0.84, 0.9) * 0.32;

  gl_FragColor = vec4(col, 1.0);
}`;

function Blob({ pointer, speed }: { pointer: React.RefObject<{ x: number; y: number }>; speed: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uAmp: { value: 0.32 } }), []);

  useFrame((_, delta) => {
    const m = mesh.current;
    const mat = material.current;
    if (!m || !mat) return;
    const t = (mat.uniforms.uTime.value += delta * speed);
    const { x, y } = pointer.current;
    m.rotation.y = THREE.MathUtils.lerp(m.rotation.y, x * 0.5 + t * 0.08, 0.05);
    m.rotation.x = THREE.MathUtils.lerp(m.rotation.x, -y * 0.35, 0.05);
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.35, 48]} />
      <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  );
}

// Deterministic pseudo-random so the dust field is stable between renders.
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function Dust({ speed }: { speed: number }) {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const rand = seeded(7);
    const count = 140;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.9 + rand() * 1.4;
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.04 * speed;
  });

  return (
    <points ref={points} geometry={geometry}>
      <shaderMaterial
        transparent
        depthWrite={false}
        vertexShader={`void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = 9.0 / -mv.z * 2.0; gl_Position = projectionMatrix * mv; }`}
        fragmentShader={`void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; gl_FragColor = vec4(0.85, 0.42, 0.55, smoothstep(0.5, 0.0, d) * 0.55); }`}
      />
    </points>
  );
}

export default function Orb() {
  const pointer = useRef({ x: 0, y: 0 });
  const speed = useMemo(
    () => (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.15 : 1),
    [],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <Canvas camera={{ position: [0, 0, 4.6], fov: 45 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
      <Blob pointer={pointer} speed={speed} />
      <Dust speed={speed} />
    </Canvas>
  );
}
