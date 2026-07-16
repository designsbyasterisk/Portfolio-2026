import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const CENTER = new THREE.Vector3(-57, 0, 7);

const PRESETS = {
  top:      { pos: [-57,   0, 700], tgt: [-57,   0, 0] },
  t1:       { pos: [-100, 290, 400], tgt: [-100, 280, 0] },
  straight: { pos: [  30, 220, 400], tgt: [  30, 210, 0] },
  pit:      { pos: [ -57,-200, 400], tgt: [ -57,-190, 0] },
};

const SPEED_RAMP = [0x0057FF, 0x00CFFF, 0x00E676, 0xFFD600, 0xFF6D00, 0xFF1E00];

function speedColor(speed, minS, maxS) {
  const t  = Math.max(0, Math.min(1, (speed - minS) / (maxS - minS || 1)));
  const fi = t * (SPEED_RAMP.length - 1);
  const lo = Math.floor(fi), hi = Math.min(lo + 1, SPEED_RAMP.length - 1);
  const f  = fi - lo;
  const a  = new THREE.Color(SPEED_RAMP[lo]);
  const b  = new THREE.Color(SPEED_RAMP[hi]);
  return new THREE.Color(a.r+(b.r-a.r)*f, a.g+(b.g-a.g)*f, a.b+(b.b-a.b)*f);
}

// Build flat ribbon mesh. zOff pushes it above the track surface so it's always visible.
function buildRibbon(lapData, getColor, zOff, halfWidth) {
  if (!lapData || lapData.length < 2) return null;

  const positions = [], colors = [], indices = [];

  lapData.forEach((p, i) => {
    const next = lapData[Math.min(i + 1, lapData.length - 1)];
    const prev = lapData[Math.max(i - 1, 0)];
    const dx = next.lng - prev.lng, dy = next.lat - prev.lat;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const px = -dy/len, py = dx/len;

    positions.push(
      p.lng + px*halfWidth, p.lat + py*halfWidth, zOff,
      p.lng - px*halfWidth, p.lat - py*halfWidth, zOff,
    );
    const c = getColor(p, i);
    colors.push(c.r, c.g, c.b, c.r, c.g, c.b);

    if (i < lapData.length - 1) {
      const b = i * 2;
      indices.push(b, b+1, b+2,  b+1, b+3, b+2);
    }
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);

  const mat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1.0,       // caller sets this after creation
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 999;
  return mesh;
}

// Track dominance: color each segment by who is faster
function buildDominanceMesh(lap1, lap2, zOff, halfWidth) {
  if (!lap1?.lapData || !lap2?.lapData) return null;

  const d1 = lap1.lapData;
  const d2 = lap2.lapData;
  const n  = Math.min(d1.length, d2.length);

  // 5-point rolling average to smooth transitions
  const SMOOTH = 5;
  const smoothSpeed = (data, i) => {
    let sum = 0, cnt = 0;
    for (let k = Math.max(0, i-SMOOTH); k <= Math.min(data.length-1, i+SMOOTH); k++) {
      sum += data[k].speed; cnt++;
    }
    return sum / cnt;
  };

  const getColor = (p, i) => {
    const s1 = smoothSpeed(d1, i);
    const s2 = smoothSpeed(d2, Math.round(i * d2.length / d1.length));
    const diff = s1 - s2;

    if (diff >= 0) {
      // Driver 1 faster — vivid red
      return new THREE.Color(1, 0.08, 0.08);
    } else {
      // Driver 2 faster — vivid cyan/blue
      return new THREE.Color(0.0, 0.75, 1);
    }
  };

  return buildRibbon(d1.slice(0, n), getColor, zOff, halfWidth);
}

export default function TrackViewer3D({
  trackGltfPath    = '/models/scene.gltf',
  telemetryData    = null,
  comparisonData   = null,
  viewMode         = 'spatial',
  telemetryOpacity = 1.0,
  incidentMarkers  = [],
  onIncidentClick  = null,
  driver1Name      = 'Driver 1',
  driver2Name      = 'Driver 2',
  selectedIncident = null,
}) {
  const mountRef   = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0D0D14);

    const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 1, 5000);
    camera.position.set(-57, 0, 700);
    camera.lookAt(CENTER);

    scene.add(new THREE.AmbientLight(0xffffff, 3.0));
    const sun = new THREE.DirectionalLight(0xffffff, 3.0);
    sun.position.set(0, 0, 1000);
    scene.add(sun);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(CENTER);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance   = 80;
    controls.maxDistance   = 2000;
    controls.update();

    const label = document.createElement('div');
    label.style.cssText = `position:absolute;inset:0;display:flex;align-items:center;
      justify-content:center;font-family:'Barlow Condensed',sans-serif;font-size:15px;
      letter-spacing:3px;text-transform:uppercase;color:#FF1E00;pointer-events:none;z-index:5`;
    label.textContent = 'Loading Monaco…';
    el.appendChild(label);

    new GLTFLoader().load(
      trackGltfPath,
      (gltf) => {
        const root = gltf.scene;
        root.traverse(obj => {
          obj.position.set(0,0,0);
          obj.rotation.set(0,0,0);
          obj.scale.set(1,1,1);
          obj.updateMatrix();
          obj.updateMatrixWorld(true);
        });
        scene.add(root);
        label.remove();
      },
      (p) => { if (p.total) label.textContent = `Loading Monaco… ${Math.round(p.loaded/p.total*100)}%`; },
      (err) => { console.error(err); label.textContent='Error — F12'; label.style.color='#FF6D00'; }
    );

    const overlayGroup = new THREE.Group();
    scene.add(overlayGroup);
    overlayRef.current = overlayGroup;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e) => {
      const r = el.getBoundingClientRect();
      mouse.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(overlayGroup.children, true);
      if (hits.length && hits[0].object.name === 'incident_dot') {
        const clickedData = hits[0].object.userData;
        // Highlight: scale up clicked dot, reset others
        overlayGroup.children.forEach(c => {
          if (c.name === 'incident_dot') {
            const isSelected = c.userData === clickedData;
            c.scale.setScalar(isSelected ? 2.2 : 0.9);
            c.material.opacity = isSelected ? 1 : 0.45;
            c.material.transparent = true;
          }
        });
        onIncidentClick?.(clickedData);
      }
    };
    el.addEventListener('click', onClick);

    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', onResize);

    el._goTo = (preset) => {
      const p = PRESETS[preset]; if (!p) return;
      const start = camera.position.clone();
      const end = new THREE.Vector3(...p.pos);
      const t0 = performance.now(), DUR = 1100;
      const tick = () => {
        const t = Math.min((performance.now()-t0)/DUR, 1);
        const ease = 1 - Math.pow(1-t, 3);
        camera.position.lerpVectors(start, end, ease);
        controls.target.set(...p.tgt);
        controls.update();
        if (t < 1) requestAnimationFrame(tick);
      };
      tick();
    };

    let raf;
    const animate = () => { raf = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      el.removeEventListener('click', onClick);
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
      if (label.parentNode) label.remove();
      delete el._goTo;
      overlayRef.current = null;
    };
  }, [trackGltfPath]); // eslint-disable-line

  useEffect(() => {
    const group = overlayRef.current;
    if (!group) return;

    while (group.children.length) {
      const c = group.children[0];
      group.remove(c);
      c.geometry?.dispose();
      (Array.isArray(c.material)?c.material:[c.material]).forEach(m=>m?.dispose());
    }

    // ── TELEMETRY ──
    if (viewMode === 'telemetry' && telemetryData?.lapData) {
      const speeds = telemetryData.lapData.map(p => p.speed);
      const minS = Math.min(...speeds), maxS = Math.max(...speeds);
      const m = buildRibbon(
        telemetryData.lapData,
        (p) => speedColor(p.speed, minS, maxS),
        40, 5.5
      );
      if (m) { m.material.opacity = telemetryOpacity; group.add(m); }
    }

    // ── COMPARISON (track dominance) ──
    if (viewMode === 'comparison') {
      const m = buildDominanceMesh(telemetryData, comparisonData, 40, 5.5);
      if (m) { m.material.opacity = telemetryOpacity; group.add(m); }
    }

    // ── INCIDENTS ──
    if (viewMode === 'incidents') {
      const typeCol = {
        crash:0xFF1E00, collision:0xFF6D00,
        safety_car:0xFFD600, overtake:0x00E676, mechanical:0x9C27B0, fastest_lap:0x00E5FF,
      };
      incidentMarkers.forEach(inc => {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(6, 16, 16),
          new THREE.MeshBasicMaterial({
            color: typeCol[inc.type] ?? 0xFF1E00,
            depthTest: false,
          })
        );
        mesh.renderOrder = 999;
        mesh.position.set(inc.x, inc.z, 40);
        mesh.userData = inc;
        mesh.name = 'incident_dot';
        group.add(mesh);
      });
    }
  }, [viewMode, telemetryData, comparisonData, telemetryOpacity, incidentMarkers]);

  // Reset dot highlights when selectedIncident is cleared
  useEffect(() => {
    const group = overlayRef.current;
    if (!group) return;
    if (!selectedIncident) {
      group.children.forEach(c => {
        if (c.name === 'incident_dot') {
          c.scale.setScalar(1);
          c.material.opacity = 1;
          c.material.transparent = false;
        }
      });
    }
  }, [selectedIncident]);

  return (
    <div style={{ width:'100%', height:'100%', position:'relative', overflow:'hidden', background:'#0D0D14' }}>
      <div ref={mountRef} style={{ width:'100%', height:'100%' }} />

      <div style={{ position:'absolute', top:14, right:14, display:'flex', flexDirection:'column', gap:4, zIndex:10 }}>
        {[['TOP','top'],['T1','t1'],['STR','straight'],['PIT','pit']].map(([lbl,key]) => (
          <button key={key} onClick={() => mountRef.current?._goTo?.(key)}
            style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:10,
              letterSpacing:1, padding:'6px 10px', background:'#2A2A38', border:'1px solid #33334a',
              color:'#fff', cursor:'pointer', borderRadius:3, textTransform:'uppercase', transition:'all .15s' }}
            onMouseEnter={e => Object.assign(e.currentTarget.style,{background:'#FF1E00',borderColor:'#FF1E00'})}
            onMouseLeave={e => Object.assign(e.currentTarget.style,{background:'#2A2A38',borderColor:'#33334a'})}
          >{lbl}</button>
        ))}
      </div>

      {/* Speed legend */}
      {viewMode === 'telemetry' && (
        <div style={{ position:'absolute', bottom:14, left:14, background:'#1E1E2A',
          border:'1px solid #33334a', padding:'8px 12px', borderRadius:3, zIndex:10 }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:9,
            letterSpacing:2, color:'#ffffff99', textTransform:'uppercase', marginBottom:5 }}>Speed km/h</div>
          <div style={{ height:6, width:140, marginBottom:4, borderRadius:1,
            background:'linear-gradient(to right,#0057FF,#00CFFF,#00E676,#FFD600,#FF6D00,#FF1E00)' }} />
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:9,
            color:'#ffffff99', fontFamily:"'DM Mono',monospace" }}>
            <span>0</span><span>150</span><span>300+</span>
          </div>
        </div>
      )}

      {/* Track dominance legend */}
      {viewMode === 'comparison' && (
        <div style={{ position:'absolute', bottom:14, left:14, background:'#1E1E2Aee',
          border:'1px solid #33334a', padding:'12px 16px', borderRadius:4, zIndex:10, minWidth:180 }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:11,
            letterSpacing:2, color:'#ffffff', textTransform:'uppercase', marginBottom:12 }}>
            Track Dominance
          </div>
          {[
            { color:'#FF1408', label: driver1Name },
            { color:'#00BFFF', label: driver2Name },
          ].map(({ color, label }) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:7 }}>
              <div style={{ width:28, height:8, background:color, borderRadius:2, flexShrink:0 }} />
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13,
                fontWeight:700, color:'#ffffff', textTransform:'uppercase', letterSpacing:0.5 }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Incidents legend */}
      {viewMode === 'incidents' && (
        <div style={{ position:'absolute', bottom:14, left:14, background:'#1E1E2A',
          border:'1px solid #33334a', padding:'8px 12px', borderRadius:3, zIndex:10 }}>
          {[['#FF1E00','Crash'],['#FF6D00','Collision'],['#FFD600','Safety Car'],['#00E676','Overtake'],['#9C27B0','Mechanical'],['#00E5FF','Fastest Lap']].map(([c,l]) => (
            <div key={l} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:c, flexShrink:0 }} />
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10,
                fontWeight:600, color:'#ffffff99', textTransform:'uppercase', letterSpacing:1 }}>{l}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
