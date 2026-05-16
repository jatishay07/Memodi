'use client';

import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle, Vec3 } from 'ogl';

const PAGE_BG = '#FFF9F0'; // matches the website background

const STATE_COLORS = {
  idle:      [[0xFC/255, 0x8A/255, 0x2D/255], [0xDC/255, 0x4F/255, 0x7C/255], [0xFC/255, 0xE9/255, 0xAB/255]],
  listening: [[0xFC/255, 0x8A/255, 0x2D/255], [0xFC/255, 0xE9/255, 0xAB/255], [0xFC/255, 0x8A/255, 0x2D/255]],
  thinking:  [[0x9E/255, 0x98/255, 0x20/255], [0xFC/255, 0x8A/255, 0x2D/255], [0xFC/255, 0xE9/255, 0xAB/255]],
  speaking:  [[0xDC/255, 0x4F/255, 0x7C/255], [0xFC/255, 0x8A/255, 0x2D/255], [0xDC/255, 0x4F/255, 0x7C/255]],
  distress:  [[0xC4/255, 0x2B/255, 0x34/255], [0xDC/255, 0x4F/255, 0x7C/255], [0xC4/255, 0x2B/255, 0x34/255]],
};

const GLOW = {
  idle:      'rgba(252,138,45,0.40)',
  listening: 'rgba(252,138,45,0.60)',
  thinking:  'rgba(158,152,32,0.55)',
  speaking:  'rgba(220,79,124,0.60)',
  distress:  'rgba(196,43,52,0.70)',
};

function hexToVec3(hex) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  return new Vec3(r,g,b);
}

const vert = /* glsl */`
  precision highp float;
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const frag = /* glsl */`
  precision highp float;
  uniform float iTime;
  uniform vec3 iResolution;
  uniform float hover;
  uniform float rot;
  uniform float hoverIntensity;
  uniform vec3 backgroundColor;
  uniform vec3 baseColor1;
  uniform vec3 baseColor2;
  uniform vec3 baseColor3;
  varying vec2 vUv;

  vec3 hash33(vec3 p3) {
    p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
    p3 += dot(p3, p3.yxz + 19.19);
    return -1.0 + 2.0 * fract(vec3(p3.x+p3.y, p3.x+p3.z, p3.y+p3.z) * p3.zyx);
  }

  float snoise3(vec3 p) {
    const float K1 = 0.333333333;
    const float K2 = 0.166666667;
    vec3 i = floor(p + (p.x+p.y+p.z)*K1);
    vec3 d0 = p - (i - (i.x+i.y+i.z)*K2);
    vec3 e = step(vec3(0.0), d0 - d0.yzx);
    vec3 i1 = e*(1.0-e.zxy);
    vec3 i2 = 1.0-e.zxy*(1.0-e);
    vec3 d1 = d0-(i1-K2);
    vec3 d2 = d0-(i2-K1);
    vec3 d3 = d0-0.5;
    vec4 h = max(0.6-vec4(dot(d0,d0),dot(d1,d1),dot(d2,d2),dot(d3,d3)),0.0);
    vec4 n = h*h*h*h*vec4(
      dot(d0,hash33(i)),dot(d1,hash33(i+i1)),
      dot(d2,hash33(i+i2)),dot(d3,hash33(i+1.0))
    );
    return dot(vec4(31.316),n);
  }

  vec4 extractAlpha(vec3 colorIn) {
    float a = max(max(colorIn.r,colorIn.g),colorIn.b);
    return vec4(colorIn.rgb/(a+1e-5), a);
  }

  const float innerRadius = 0.6;
  const float noiseScale  = 0.65;

  float light1(float i,float a,float d){return i/(1.0+d*a);}
  float light2(float i,float a,float d){return i/(1.0+d*d*a);}

  vec4 draw(vec2 uv) {
    float ang = atan(uv.y,uv.x);
    float len = length(uv);
    float invLen = len>0.0 ? 1.0/len : 0.0;
    float bgLuminance = dot(backgroundColor, vec3(0.299,0.587,0.114));

    float n0 = snoise3(vec3(uv*noiseScale, iTime*0.5))*0.5+0.5;
    float r0 = mix(mix(innerRadius,1.0,0.4), mix(innerRadius,1.0,0.6), n0);
    float d0 = distance(uv, (r0*invLen)*uv);
    float v0 = light1(1.0,10.0,d0);
    v0 *= smoothstep(r0*1.05, r0, len);
    float innerFade = smoothstep(r0*0.8, r0*0.95, len);
    v0 *= mix(innerFade, 1.0, bgLuminance*0.7);
    float cl = cos(ang + iTime*2.0)*0.5+0.5;

    float a = iTime*-1.0;
    vec2 pos = vec2(cos(a),sin(a))*r0;
    float d = distance(uv,pos);
    float v1 = light2(1.5,5.0,d);
    v1 *= light1(1.0,50.0,d0);

    float v2 = smoothstep(1.0, mix(innerRadius,1.0,n0*0.5), len);
    float v3 = smoothstep(innerRadius, mix(innerRadius,1.0,0.5), len);

    vec3 colBase = mix(baseColor1,baseColor2,cl);
    float fadeAmount = mix(1.0,0.1,bgLuminance);

    vec3 darkCol = mix(baseColor3,colBase,v0);
    darkCol = (darkCol+v1)*v2*v3;
    darkCol = clamp(darkCol,0.0,1.0);

    vec3 lightCol = (colBase+v1)*mix(1.0,v2*v3,fadeAmount);
    lightCol = mix(backgroundColor,lightCol,v0);
    lightCol = clamp(lightCol,0.0,1.0);

    vec3 finalCol = mix(darkCol,lightCol,bgLuminance);
    return extractAlpha(finalCol);
  }

  vec4 mainImage(vec2 fragCoord) {
    vec2 center = iResolution.xy*0.5;
    float size = min(iResolution.x,iResolution.y);
    vec2 uv = (fragCoord-center)/size*2.0;

    float s = sin(rot); float c = cos(rot);
    uv = vec2(c*uv.x-s*uv.y, s*uv.x+c*uv.y);

    uv.x += hover*hoverIntensity*0.1*sin(uv.y*10.0+iTime);
    uv.y += hover*hoverIntensity*0.1*sin(uv.x*10.0+iTime);

    return draw(uv);
  }

  void main() {
    vec2 fragCoord = vUv*iResolution.xy;
    vec4 col = mainImage(fragCoord);
    gl_FragColor = vec4(col.rgb*col.a, col.a);
  }
`;

export default function Orb({ state = 'idle', size = 280, onClick }) {
  const ctnRef  = useRef(null);
  const stateRef = useRef(state);
  const glRef   = useRef(null);

  useEffect(() => { stateRef.current = state; }, [state]);

  // Smooth color transition when state changes
  useEffect(() => {
    const ctx = glRef.current;
    if (!ctx) return;
    const c = STATE_COLORS[state] || STATE_COLORS.idle;
    const { baseColor1: u1, baseColor2: u2, baseColor3: u3 } = ctx.program.uniforms;
    [u1,u2,u3].forEach((u,i) => { u.value[0]=c[i][0]; u.value[1]=c[i][1]; u.value[2]=c[i][2]; });
  }, [state]);

  useEffect(() => {
    const container = ctnRef.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0,0,0,0);
    const canvas = gl.canvas;
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const colors = STATE_COLORS[stateRef.current] || STATE_COLORS.idle;
    const program = new Program(gl, {
      vertex: vert, fragment: frag,
      uniforms: {
        iTime:           { value: 0 },
        iResolution:     { value: new Vec3(1,1,1) },
        hover:           { value: 0 },
        rot:             { value: 0 },
        hoverIntensity:  { value: 0.2 },
        backgroundColor: { value: hexToVec3(PAGE_BG) },
        baseColor1:      { value: new Vec3(...colors[0]) },
        baseColor2:      { value: new Vec3(...colors[1]) },
        baseColor3:      { value: new Vec3(...colors[2]) },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    glRef.current = { renderer, program, mesh, gl };

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w*dpr, h*dpr);
      canvas.style.width = w+'px';
      canvas.style.height = h+'px';
      program.uniforms.iResolution.value.set(w*dpr, h*dpr, (w*dpr)/(h*dpr));
    }
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    let targetHover = 0;
    let currentRot  = 0;
    let lastTime    = 0;
    const handleMouseMove = e => {
      const rect = container.getBoundingClientRect();
      const uvX = ((e.clientX-rect.left-rect.width/2)/Math.min(rect.width,rect.height))*2;
      const uvY = ((e.clientY-rect.top-rect.height/2)/Math.min(rect.width,rect.height))*2;
      targetHover = Math.sqrt(uvX*uvX+uvY*uvY) < 0.8 ? 1 : 0;
    };
    const handleMouseLeave = () => { targetHover = 0; };
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    let rafId;
    const update = t => {
      rafId = requestAnimationFrame(update);
      const dt = lastTime ? (t-lastTime)*0.001 : 0;
      lastTime = t;
      program.uniforms.iTime.value = t*0.001;
      program.uniforms.hover.value += (targetHover - program.uniforms.hover.value)*0.1;
      if (program.uniforms.hover.value > 0.5) currentRot += dt*0.3;
      program.uniforms.rot.value = currentRot;
      renderer.render({ scene: mesh });
    };
    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      glRef.current = null;
    };
  }, []);

  const isAudible = state === 'listening' || state === 'speaking';
  const glow = GLOW[state] || GLOW.idle;
  const shadowSize = Math.round(size * 0.22);

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', width: size, height: size,
        cursor: onClick ? 'pointer' : 'default', userSelect: 'none',
      }}
    >
      <div
        ref={ctnRef}
        style={{
          width: size, height: size,
          borderRadius: '50%', overflow: 'hidden',
          boxShadow: `0 0 ${shadowSize}px ${glow}`,
          transition: 'box-shadow 0.8s ease',
        }}
      />

      {isAudible && [0,1,2].map(i => (
        <div key={i} style={{
          position: 'absolute', borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.35)',
          width: size*(1+(i+1)*0.12), height: size*(1+(i+1)*0.12),
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          animation: 'breath 2.5s ease-in-out infinite',
          animationDelay: `${i*0.3}s`, opacity: 0.5, pointerEvents: 'none',
        }} />
      ))}

      {state === 'distress' && [0,1,2].map(i => (
        <div key={i} style={{
          position: 'absolute', width: size, height: size, top: 0, left: 0,
          borderRadius: '50%', border: '3px solid #C42B34',
          animation: 'pulseRing 2s ease-out infinite',
          animationDelay: `${i*0.5}s`, pointerEvents: 'none',
        }} />
      ))}
    </div>
  );
}
