// ═══════════════════════════════════════════════════════════════
//  Memristor 3D Schematic — script.js v3.0
//  MoO₃ / ZnO Resistive Switching Stack
//  Three.js r128 · Fully modular · Per-layer color/thickness/delete
//  Cross-device stable labels · Shadow toggle · Top electrode controls
// ═══════════════════════════════════════════════════════════════

'use strict';

/* ──────────────────────────────────────────────────────────────
   STACK GEOMETRY CONSTANTS
────────────────────────────────────────────────────────────── */
const STACK_W = 5.8;   // stack width  (X)
const STACK_D = 4.6;   // stack depth  (Z)

/* ──────────────────────────────────────────────────────────────
   MUTABLE LAYER DEFINITIONS — bottom to top
   Each entry is a plain object; can be spliced/modified at runtime.
────────────────────────────────────────────────────────────── */
const LAYER_DEFS = [
  {
    name: 'Si',   full: 'Silicon Substrate',
    desc: 'Mechanical base — 525 µm, p-type, 1–20 Ω·cm',
    process: 'Substrate (as-received)',
    color: 0x78909C, accent: '#78909C',
    metalness: 0.14, roughness: 0.82, height: 0.62,
  },
  {
    name: 'SiO₂', full: 'Silicon Dioxide',
    desc: 'Thermal oxide insulation — 300 nm',
    process: 'Thermal Oxidation',
    color: 0x90CAF9, accent: '#90CAF9',
    metalness: 0.04, roughness: 0.88, height: 0.22,
  },
  {
    name: 'Ti',   full: 'Titanium Adhesion Layer',
    desc: 'Bonds Pt to SiO₂, prevents delamination — 10 nm',
    process: 'DC Magnetron Sputtering',
    color: 0x4A90D9, accent: '#4A90D9',
    metalness: 0.82, roughness: 0.35, height: 0.18,
  },
  {
    name: 'Pt',   full: 'Platinum — Bottom Electrode',
    desc: 'Inert conductive base contact — 100 nm',
    process: 'DC Sputtered on Ti / 150 W / Ar',
    color: 0xC0CDD8, accent: '#C0CDD8',
    metalness: 0.97, roughness: 0.09, height: 0.13,
  },
  {
    name: 'ZnO',  full: 'Zinc Oxide',
    desc: 'Intermediate n-type oxide — 200 nm',
    process: 'DC Sputtered on Pt / O₂+Ar',
    color: 0x00C9A7, accent: '#00C9A7',
    metalness: 0.18, roughness: 0.54, height: 0.28,
  },
  {
    name: 'MoO₃', full: 'Molybdenum Trioxide',
    desc: 'Active switching layer — O²⁻ vacancy drift — 150 nm',
    process: 'RF Sputtered on ZnO / 60 W / Ar+O₂',
    color: 0x7C3AED, accent: '#7C3AED',
    metalness: 0.28, roughness: 0.46, height: 0.58,
  },
];

/* ── Top electrode config (separate from LAYER_DEFS) ─────────── */
const topElecConfig = {
  visible: true,
  accent:  '#C8D5E5',
  color:   0xd8e0ea,
};

/* ── Snapshot of factory defaults — used by Reset to Defaults ── */
const LAYER_DEFS_DEFAULT     = LAYER_DEFS.map(l => ({ ...l }));
const TOP_ELEC_DEFAULT       = { ...topElecConfig };

/* ──────────────────────────────────────────────────────────────
   THEME DEFINITIONS
────────────────────────────────────────────────────────────── */
const THEMES = {
  'dark-neon': {
    label: 'Dark Blue / Neon',
    sceneBg: 0x07090f, fogColor: 0x07090f, fogDensity: 0.027,
    gridA: 0x1a2a4a,  gridB: 0x0c1525,
    ambient: 0.45, key: 1.80, keyColor: 0xffffff,
    fill: 0x4488ff,  fillInt: 0.50,
    rim:  0x6d28d9,  rimInt:  2.50,
    bounce: 0x1e3a8a, bounceInt: 1.20,
  },
  'pure-black': {
    label: 'Pure Black',
    sceneBg: 0x000000, fogColor: 0x000000, fogDensity: 0.020,
    gridA: 0x181818,  gridB: 0x080808,
    ambient: 0.40, key: 2.00, keyColor: 0xffffff,
    fill: 0x22cc88,  fillInt: 0.45,
    rim:  0x00aa55,  rimInt:  2.00,
    bounce: 0x001a0d, bounceInt: 0.80,
  },
  'gradient': {
    label: 'Deep Space Gradient',
    sceneBg: null,      fogColor: 0x0c0a24, fogDensity: 0.020,
    gridA: 0x1a1445,  gridB: 0x0b0922,
    ambient: 0.40, key: 1.60, keyColor: 0xddeeff,
    fill: 0x8844ff,  fillInt: 0.55,
    rim:  0xa855f7,  rimInt:  2.80,
    bounce: 0x200a44, bounceInt: 1.00,
  },
  'light-gray': {
    label: 'Light Gray',
    sceneBg: 0xe8ecf0, fogColor: 0xe8ecf0, fogDensity: 0.022,
    gridA: 0xaaaaaa,  gridB: 0xcccccc,
    ambient: 0.80, key: 1.20, keyColor: 0xffffff,
    fill: 0x88aadd,  fillInt: 0.40,
    rim:  0x4466aa,  rimInt:  0.90,
    bounce: 0xbbbbee, bounceInt: 0.60,
  },
  'white': {
    label: 'White / Presentation',
    sceneBg: 0xfafafa, fogColor: 0xfafafa, fogDensity: 0.018,
    gridA: 0xbbbbbb,  gridB: 0xdddddd,
    ambient: 0.92, key: 1.00, keyColor: 0xffffff,
    fill: 0x99aabb,  fillInt: 0.35,
    rim:  0x4488cc,  rimInt:  0.70,
    bounce: 0xddeeff, bounceInt: 0.50,
  },
};

/** Named camera presets */
const PRESETS = {
  iso:   { pos: [8,  6,    9],    target: [0, 1.1, 0] },
  front: { pos: [0,  2.5, 13],    target: [0, 1.1, 0] },
  side:  { pos: [13, 2.5,  0],    target: [0, 1.1, 0] },
  top:   { pos: [0, 17,    0.01], target: [0, 1.1, 0] },
};

/* ──────────────────────────────────────────────────────────────
   WEBGL COMPATIBILITY CHECK
   Shows a clear error message instead of a blank screen if the
   device / browser doesn't support WebGL.
────────────────────────────────────────────────────────────── */
(function checkWebGL() {
  try {
    const t = document.createElement('canvas');
    if (!(t.getContext('webgl') || t.getContext('experimental-webgl'))) throw 0;
  } catch (_) {
    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;
                  justify-content:center;height:100vh;gap:18px;
                  font-family:'Segoe UI',system-ui,sans-serif;
                  background:#07090f;color:#aab4cc;text-align:center;padding:24px">
        <div style="font-size:40px">⚠️</div>
        <div style="font-size:20px;font-weight:700;color:#e8eeff">
          WebGL Not Supported
        </div>
        <div style="font-size:14px;opacity:0.65;max-width:400px;line-height:1.7">
          Your browser or device does not support WebGL, which is required for
          this 3D visualization.<br><br>
          Please use a modern browser such as <b>Chrome</b>, <b>Edge</b>, or
          <b>Firefox</b> with hardware acceleration enabled.
        </div>
      </div>`;
    throw new Error('WebGL not supported — halting script.');
  }
})();

/* ──────────────────────────────────────────────────────────────
   RENDERER
────────────────────────────────────────────────────────────── */
const canvas = document.getElementById('canvas');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;

/* ──────────────────────────────────────────────────────────────
   SCENE & CAMERA
────────────────────────────────────────────────────────────── */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07090f);
scene.fog = new THREE.FogExp2(0x07090f, 0.027);

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(...PRESETS.iso.pos);

/* ──────────────────────────────────────────────────────────────
   ORBIT CONTROLS
────────────────────────────────────────────────────────────── */
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(...PRESETS.iso.target);
controls.enableDamping   = true;
controls.dampingFactor   = 0.05;
controls.autoRotate      = true;
controls.autoRotateSpeed = 0.55;
controls.minDistance     = 3;
controls.maxDistance     = 30;
controls.update();

/* ──────────────────────────────────────────────────────────────
   LIGHTS
────────────────────────────────────────────────────────────── */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
keyLight.position.set(8, 14, 8);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near   = 0.5;
keyLight.shadow.camera.far    = 40;
keyLight.shadow.camera.left   = keyLight.shadow.camera.bottom = -10;
keyLight.shadow.camera.right  = keyLight.shadow.camera.top   = 10;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x4488ff, 0.5);
fillLight.position.set(-8, 5, -5);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0x6d28d9, 2.5, 20);
rimLight.position.set(-5, 6, -6);
scene.add(rimLight);

const bounceLight = new THREE.PointLight(0x1e3a8a, 1.2, 14);
bounceLight.position.set(0, -2, 0);
scene.add(bounceLight);

/* ──────────────────────────────────────────────────────────────
   GLOW PLANE — optional shadow/glow under the stack
────────────────────────────────────────────────────────────── */
const glowGeo  = new THREE.PlaneGeometry(STACK_W + 2, STACK_D + 2);
const glowMat  = new THREE.MeshBasicMaterial({
  color: 0x3b4fd4, transparent: true, opacity: 0.07,
});
const glowPlane = new THREE.Mesh(glowGeo, glowMat);
glowPlane.rotation.x = -Math.PI / 2;
glowPlane.position.y = 0.005;
scene.add(glowPlane);

let glowVisible = true;   // user-controlled

/* ──────────────────────────────────────────────────────────────
   FLOOR GRID
────────────────────────────────────────────────────────────── */
let floorGrid = buildGrid(0x1a2a4a, 0x0c1525);
let gridVisible = true;
scene.add(floorGrid);

function buildGrid(c1, c2) {
  const g = new THREE.GridHelper(40, 40, c1, c2);
  g.position.y = -0.01;
  return g;
}

/* ──────────────────────────────────────────────────────────────
   TOP ELECTRODE GEOMETRY (shared, reused)
────────────────────────────────────────────────────────────── */
const cylGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.30, 40);
const cylMat = new THREE.MeshStandardMaterial({
  color:     topElecConfig.color,
  metalness: 0.97,
  roughness: 0.09,
});
// Add subtle emissive so color changes are visible for metallic material
_applyMetallicEmissive(cylMat, topElecConfig.color);

const topGroup = new THREE.Group();
scene.add(topGroup);

/** Build the 5×4 cylinder grid inside topGroup */
function buildTopElectrodes() {
  while (topGroup.children.length) topGroup.remove(topGroup.children[0]);
  if (!topElecConfig.visible) return;

  const COLS = 5, ROWS = 4;
  const xSpan = STACK_W - 1.4;
  const zSpan = STACK_D - 1.2;
  const xStep = xSpan / (COLS - 1);
  const zStep = zSpan / (ROWS - 1);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cyl = new THREE.Mesh(cylGeo, cylMat);
      cyl.position.set(-xSpan / 2 + c * xStep, 0.15, -zSpan / 2 + r * zStep);
      topGroup.add(cyl);
    }
  }
}

buildTopElectrodes();

/* ──────────────────────────────────────────────────────────────
   STACK STATE — rebuilt on any structural change
────────────────────────────────────────────────────────────── */
const layerMeshes    = [];   // THREE.Mesh per layer
const labelData      = [];   // { el, rightPos, leftPos, mesh, index }
const labelsContainer = document.getElementById('labels-container');
const labelSvgEl      = document.getElementById('label-svg');

let hoveredMesh = null;      // reset on rebuild

/* ── BUILD / REBUILD FULL STACK ──────────────────────────────── */
function buildStack() {
  // ── Clear old meshes ──────────────────────────────────────────
  layerMeshes.forEach(m => scene.remove(m));
  layerMeshes.length = 0;

  // ── Clear old labels ─────────────────────────────────────────
  labelData.forEach(ld => { if (ld.el && ld.el.parentNode) ld.el.parentNode.removeChild(ld.el); });
  labelData.length = 0;
  labelSvgEl.innerHTML = '';

  // Reset hover state so no stale reference
  hoveredMesh = null;

  let yAccum = 0;

  LAYER_DEFS.forEach((lyr, i) => {
    // ── 3D mesh ──────────────────────────────────────────────────
    const geo = new THREE.BoxGeometry(STACK_W, lyr.height, STACK_D);
    const mat = new THREE.MeshStandardMaterial({
      color:           lyr.color,
      metalness:       lyr.metalness,
      roughness:       lyr.roughness,
      envMapIntensity: 0.6,
    });

    // FIX: For metallic layers (Pt, Ti) a subtle emissive ensures the
    // chosen color is always visible regardless of environment-map state.
    _applyMetallicEmissive(mat, lyr.color);

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, yAccum + lyr.height / 2, 0);
    mesh.castShadow    = true;
    mesh.receiveShadow = true;
    mesh.userData      = { ...lyr, layerIndex: i };
    scene.add(mesh);
    layerMeshes.push(mesh);

    // ── HTML label ───────────────────────────────────────────────
    const midY    = yAccum + lyr.height / 2;
    const OFFSET  = STACK_W / 2 + 0.55;
    const rightPos = new THREE.Vector3( OFFSET, midY, 0);
    const leftPos  = new THREE.Vector3(-OFFSET, midY, 0);

    const el = document.createElement('div');
    el.className = 'lbl';
    el.innerHTML =
      `<div class="lbl-dot" style="background:${lyr.accent}"></div>` +
      `<div class="lbl-box" style="border-color:${lyr.accent}55;color:${lyr.accent}">${lyr.name}</div>`;
    labelsContainer.appendChild(el);
    labelData.push({ el, rightPos, leftPos, mesh, index: i });

    yAccum += lyr.height;
  });

  // ── Position top electrode group ──────────────────────────────
  topGroup.position.y  = yAccum;
  topGroup.visible     = topElecConfig.visible;

  // ── Top electrode label ───────────────────────────────────────
  if (topElecConfig.visible) {
    const topMidY = yAccum + 0.15;
    const OFFSET  = STACK_W / 2 + 0.55;
    const el      = document.createElement('div');
    el.className  = 'lbl';
    el.innerHTML  =
      `<div class="lbl-dot" style="background:${topElecConfig.accent}"></div>` +
      `<div class="lbl-box" style="border-color:${topElecConfig.accent}55;color:${topElecConfig.accent}">Pt (Top)</div>`;
    labelsContainer.appendChild(el);
    labelData.push({
      el,
      rightPos: new THREE.Vector3( OFFSET, topMidY, 0),
      leftPos:  new THREE.Vector3(-OFFSET, topMidY, 0),
      mesh: null,
      index: LAYER_DEFS.length,
    });
  }

  // ── Refresh side panels ───────────────────────────────────────
  buildFabPanel();
  buildColorMenu();
}

/* ──────────────────────────────────────────────────────────────
   HELPER: apply a faint emissive to metallic materials so the
   user's chosen color is always perceptible in the viewport.
────────────────────────────────────────────────────────────── */
function _applyMetallicEmissive(mat, hexColor) {
  if (mat.metalness > 0.65) {
    const r = ((hexColor >> 16) & 0xff) / 255;
    const g = ((hexColor >> 8)  & 0xff) / 255;
    const b = (hexColor         & 0xff) / 255;
    mat.emissive.setRGB(r * 0.10, g * 0.10, b * 0.10);
  }
}

/* ──────────────────────────────────────────────────────────────
   FABRICATION PANEL — dynamic step list
────────────────────────────────────────────────────────────── */
const fabStepsEl = document.getElementById('fab-steps');

function buildFabPanel() {
  fabStepsEl.innerHTML = '';

  LAYER_DEFS.forEach((lyr, i) => {
    const step = document.createElement('div');
    step.className   = 'step';
    step.dataset.index = i;
    step.innerHTML   =
      `<div class="step-dot" style="background:${lyr.accent};color:${lyr.accent}"></div>` +
      `<div class="step-text"><b>${lyr.full}</b><span>${lyr.process}</span></div>`;
    step.addEventListener('click', () => pulseLayer(i));
    fabStepsEl.appendChild(step);
  });

  if (topElecConfig.visible) {
    const stepTop = document.createElement('div');
    stepTop.className = 'step';
    stepTop.dataset.index = LAYER_DEFS.length;
    stepTop.innerHTML =
      `<div class="step-dot" style="background:${topElecConfig.accent};color:${topElecConfig.accent}"></div>` +
      `<div class="step-text"><b>Pt — Top Electrodes</b><span>DC Sputtered · 5×4 grid array</span></div>`;
    fabStepsEl.appendChild(stepTop);
  }
}

/* ──────────────────────────────────────────────────────────────
   COLOR / THICKNESS / DELETE MENU
────────────────────────────────────────────────────────────── */
const colorsMenu = document.getElementById('colors-menu');

function buildColorMenu() {
  colorsMenu.innerHTML = '';

  // ── Standard layers ───────────────────────────────────────────
  LAYER_DEFS.forEach((lyr, i) => {
    const row = document.createElement('div');
    row.className = 'color-row';

    // Indicator dot
    const dot = document.createElement('div');
    dot.className = 'color-indicator';
    dot.style.background = lyr.accent;

    // Layer name
    const nameEl = document.createElement('span');
    nameEl.className = 'color-name';
    nameEl.textContent = lyr.name;

    // Thickness control
    const thickCtrl = document.createElement('div');
    thickCtrl.className = 'thickness-ctrl';
    thickCtrl.innerHTML = `<label class="thick-label">h:</label>`;
    const thickInput = document.createElement('input');
    thickInput.type      = 'number';
    thickInput.className = 'thickness-input';
    thickInput.value     = lyr.height.toFixed(2);
    thickInput.min       = '0.05';
    thickInput.max       = '3.00';
    thickInput.step      = '0.05';
    thickInput.title     = 'Layer thickness (visual units)';
    // Prevent dropdown from closing when clicking number input
    thickInput.addEventListener('click',  e => e.stopPropagation());
    thickInput.addEventListener('mousedown', e => e.stopPropagation());
    thickInput.addEventListener('change', e => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val >= 0.05) {
        LAYER_DEFS[i].height = Math.min(3.0, Math.max(0.05, val));
        buildStack();
        showToast(`${lyr.name} thickness → ${LAYER_DEFS[i].height.toFixed(2)}`);
      }
    });
    thickCtrl.appendChild(thickInput);

    // Color input
    const colorInput = document.createElement('input');
    colorInput.type      = 'color';
    colorInput.className = 'color-input';
    colorInput.value     = lyr.accent;
    colorInput.title     = 'Change layer color';
    colorInput.addEventListener('click',  e => e.stopPropagation());
    colorInput.addEventListener('mousedown', e => e.stopPropagation());
    colorInput.addEventListener('input', e => {
      const hex = e.target.value;
      updateLayerColor(i, hex);
      dot.style.background = hex;
    });

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className   = 'delete-layer-btn';
    delBtn.title       = `Delete ${lyr.name} layer`;
    delBtn.textContent = '×';
    delBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (LAYER_DEFS.length <= 1) {
        showToast('Cannot delete the last layer!');
        return;
      }
      const name = LAYER_DEFS[i].name;
      LAYER_DEFS.splice(i, 1);
      buildStack();
      closeAllMenus();
      showToast(`Layer "${name}" deleted`);
    });

    row.appendChild(dot);
    row.appendChild(nameEl);
    row.appendChild(thickCtrl);
    row.appendChild(colorInput);
    row.appendChild(delBtn);
    colorsMenu.appendChild(row);
  });

  // ── Divider ───────────────────────────────────────────────────
  const divider = document.createElement('div');
  divider.className = 'menu-divider';
  colorsMenu.appendChild(divider);

  // ── Top electrodes row ────────────────────────────────────────
  if (topElecConfig.visible) {
    const row = document.createElement('div');
    row.className = 'color-row';

    const dot = document.createElement('div');
    dot.className = 'color-indicator';
    dot.style.background = topElecConfig.accent;

    const nameEl = document.createElement('span');
    nameEl.className   = 'color-name';
    nameEl.textContent = 'Pt (Top)';

    // Empty spacer for thickness column alignment
    const spacer = document.createElement('div');
    spacer.className = 'thickness-ctrl';

    const colorInput = document.createElement('input');
    colorInput.type      = 'color';
    colorInput.className = 'color-input';
    colorInput.value     = topElecConfig.accent;
    colorInput.title     = 'Change top electrode color';
    colorInput.addEventListener('click',  e => e.stopPropagation());
    colorInput.addEventListener('mousedown', e => e.stopPropagation());
    colorInput.addEventListener('input', e => {
      const hex = e.target.value;
      updateLayerColor(LAYER_DEFS.length, hex);
      dot.style.background = hex;
    });

    const delBtn = document.createElement('button');
    delBtn.className   = 'delete-layer-btn';
    delBtn.title       = 'Remove top electrodes';
    delBtn.textContent = '×';
    delBtn.addEventListener('click', e => {
      e.stopPropagation();
      topElecConfig.visible = false;
      topGroup.visible = false;
      buildStack();
      closeAllMenus();
      showToast('Top electrodes removed');
    });

    row.appendChild(dot);
    row.appendChild(nameEl);
    row.appendChild(spacer);
    row.appendChild(colorInput);
    row.appendChild(delBtn);
    colorsMenu.appendChild(row);
  }

  // ── Add Layer + Reset sections ────────────────────────────────
  const actionDiv = document.createElement('div');
  actionDiv.className = 'menu-divider';
  colorsMenu.appendChild(actionDiv);

  _buildAddLayerSection(colorsMenu);
  _buildResetSection(colorsMenu);
}

/* ──────────────────────────────────────────────────────────────
   ADD LAYER — inline form at the bottom of the Colors panel
────────────────────────────────────────────────────────────── */
function _buildAddLayerSection(container) {
  // Toggle button
  const toggleRow = document.createElement('div');
  toggleRow.className = 'add-layer-row';
  const toggleBtn = document.createElement('button');
  toggleBtn.className   = 'add-layer-toggle-btn';
  toggleBtn.textContent = '＋ Add New Layer';
  toggleRow.appendChild(toggleBtn);
  container.appendChild(toggleRow);

  // Inline form (hidden by default)
  const form = document.createElement('div');
  form.className = 'add-layer-form add-layer-form-hidden';
  form.innerHTML = `
    <div class="add-form-fields">
      <input type="text"   class="add-name-input"  placeholder="Name e.g. HfO₂" maxlength="8" title="Short layer name">
      <input type="text"   class="add-full-input"  placeholder="Full name (optional)" title="Full descriptive name">
      <div class="add-form-bottom">
        <div class="thickness-ctrl">
          <label class="thick-label">h:</label>
          <input type="number" class="thickness-input add-height-input" value="0.20" min="0.05" max="3.0" step="0.05" title="Layer height">
        </div>
        <input type="color" class="color-input add-color-input" value="#FF6B35" title="Layer color">
        <button class="add-confirm-btn">Add</button>
        <button class="add-cancel-btn">✕</button>
      </div>
    </div>`;
  container.appendChild(form);

  // Prevent all form interactions from closing dropdown
  form.addEventListener('click',     e => e.stopPropagation());
  form.addEventListener('mousedown', e => e.stopPropagation());

  // Toggle show/hide
  toggleBtn.addEventListener('click', e => {
    e.stopPropagation();
    const hidden = form.classList.toggle('add-layer-form-hidden');
    toggleBtn.textContent = hidden ? '＋ Add New Layer' : '▲ Cancel';
    if (!hidden) setTimeout(() => form.querySelector('.add-name-input').focus(), 50);
  });

  // Confirm — add the new layer
  form.querySelector('.add-confirm-btn').addEventListener('click', e => {
    e.stopPropagation();
    const nameVal   = form.querySelector('.add-name-input').value.trim();
    const fullVal   = form.querySelector('.add-full-input').value.trim();
    const heightVal = parseFloat(form.querySelector('.add-height-input').value) || 0.20;
    const hexStr    = form.querySelector('.add-color-input').value;

    if (!nameVal) {
      form.querySelector('.add-name-input').focus();
      showToast('Layer name is required');
      return;
    }

    const height   = Math.max(0.05, Math.min(3.0, heightVal));
    const threeHex = parseInt(hexStr.replace('#', ''), 16);

    LAYER_DEFS.push({
      name:      nameVal,
      full:      fullVal || nameVal,
      desc:      `${fullVal || nameVal} — user-defined layer`,
      process:   'User-defined',
      color:     threeHex,
      accent:    hexStr,
      metalness: 0.20,
      roughness: 0.60,
      height,
    });

    buildStack();
    showToast(`Layer "${nameVal}" added`);
    // Reset form and close
    form.querySelector('.add-name-input').value  = '';
    form.querySelector('.add-full-input').value  = '';
    form.querySelector('.add-height-input').value = '0.20';
    form.querySelector('.add-color-input').value = '#FF6B35';
    form.classList.add('add-layer-form-hidden');
    toggleBtn.textContent = '＋ Add New Layer';
  });

  // Cancel
  form.querySelector('.add-cancel-btn').addEventListener('click', e => {
    e.stopPropagation();
    form.classList.add('add-layer-form-hidden');
    toggleBtn.textContent = '＋ Add New Layer';
  });
}

/* ──────────────────────────────────────────────────────────────
   RESET TO DEFAULTS
────────────────────────────────────────────────────────────── */
function _buildResetSection(container) {
  const row = document.createElement('div');
  row.className = 'reset-defaults-row';
  const btn = document.createElement('button');
  btn.className   = 'reset-defaults-btn';
  btn.textContent = '↺  Reset to Defaults';
  btn.title       = 'Restore all original layers and colors';
  btn.addEventListener('click', e => {
    e.stopPropagation();
    resetToDefaults();
    closeAllMenus();
  });
  row.appendChild(btn);
  container.appendChild(row);
}

function resetToDefaults() {
  // Restore all layer definitions from the saved snapshot
  LAYER_DEFS.length = 0;
  LAYER_DEFS_DEFAULT.forEach(l => LAYER_DEFS.push({ ...l }));

  // Restore top electrode config
  topElecConfig.visible = TOP_ELEC_DEFAULT.visible;
  topElecConfig.accent  = TOP_ELEC_DEFAULT.accent;
  topElecConfig.color   = TOP_ELEC_DEFAULT.color;

  // Restore top electrode 3D material
  cylMat.color.setHex(topElecConfig.color);
  _applyMetallicEmissive(cylMat, topElecConfig.color);
  buildTopElectrodes();

  buildStack();
  showToast('All layers restored to defaults');
}

/* ──────────────────────────────────────────────────────────────
   UPDATE LAYER COLOR
   Fixes the Pt color problem: metallic materials reflect env maps;
   without an env map the base color isn't visible.  We fix this by
   always adding a proportional emissive component for metallic layers.
────────────────────────────────────────────────────────────── */
function updateLayerColor(idx, hexStr) {
  const threeHex = parseInt(hexStr.replace('#', ''), 16);

  if (idx < LAYER_DEFS.length) {
    // ── Standard layer ──────────────────────────────────────────
    const mat = layerMeshes[idx].material;
    mat.color.setHex(threeHex);
    _applyMetallicEmissive(mat, threeHex);

    LAYER_DEFS[idx].accent = hexStr;
    LAYER_DEFS[idx].color  = threeHex;

    // Update HTML label
    const ld = labelData[idx];
    if (ld && ld.el) {
      const ldDot = ld.el.querySelector('.lbl-dot');
      const ldBox = ld.el.querySelector('.lbl-box');
      if (ldDot) ldDot.style.background = hexStr;
      if (ldBox) { ldBox.style.color = hexStr; ldBox.style.borderColor = hexStr + '55'; }
    }

    // Update fab-panel step dot
    const steps = fabStepsEl.querySelectorAll('.step');
    if (steps[idx]) {
      const sd = steps[idx].querySelector('.step-dot');
      if (sd) { sd.style.background = hexStr; sd.style.color = hexStr; }
    }

  } else {
    // ── Top electrodes ──────────────────────────────────────────
    cylMat.color.setHex(threeHex);
    _applyMetallicEmissive(cylMat, threeHex);

    topElecConfig.accent = hexStr;
    topElecConfig.color  = threeHex;

    // Update the top electrode label (always the last entry in labelData)
    if (topElecConfig.visible) {
      const ld = labelData[labelData.length - 1];
      if (ld && ld.el) {
        const ldDot = ld.el.querySelector('.lbl-dot');
        const ldBox = ld.el.querySelector('.lbl-box');
        if (ldDot) ldDot.style.background = hexStr;
        if (ldBox) { ldBox.style.color = hexStr; ldBox.style.borderColor = hexStr + '55'; }
      }
    }
  }
}

/* ──────────────────────────────────────────────────────────────
   RAYCASTING / HOVER INTERACTION
────────────────────────────────────────────────────────────── */
const raycaster   = new THREE.Raycaster();
const mouseNDC    = new THREE.Vector2();
const tooltipEl   = document.getElementById('tooltip');
let   autoTimer   = null;
let   autoEnabled = true;

window.addEventListener('mousemove', onMouseMove);

function onMouseMove(e) {
  // Use canvas bounding rect for correct NDC on all screen sizes
  const rect = canvas.getBoundingClientRect();
  mouseNDC.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
  mouseNDC.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouseNDC, camera);
  const hits = raycaster.intersectObjects(layerMeshes);

  if (hits.length > 0) {
    const hit = hits[0];
    const lyr = hit.object.userData;

    if (hoveredMesh !== hit.object) {
      _restoreEmissive(hoveredMesh);
      hoveredMesh = hit.object;
      hoveredMesh.material.emissive.setHex(0x181830);
      highlightFabStep(lyr.layerIndex);
    }

    tooltipEl.style.display = 'block';
    tooltipEl.style.left    = (e.clientX + 16) + 'px';
    tooltipEl.style.top     = (e.clientY - 12) + 'px';
    tooltipEl.innerHTML     =
      `<div class="tt-name">${lyr.full}</div>` +
      `<div class="tt-desc">${lyr.desc}</div>` +
      `<div class="tt-badge">${lyr.process}</div>`;

    controls.autoRotate = false;
    clearTimeout(autoTimer);

  } else {
    if (hoveredMesh) {
      _restoreEmissive(hoveredMesh);
      hoveredMesh = null;
      highlightFabStep(null);
    }
    tooltipEl.style.display = 'none';
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => { if (autoEnabled) controls.autoRotate = true; }, 2500);
  }
}

/** Restore the correct emissive after hover/pulse ends */
function _restoreEmissive(mesh) {
  if (!mesh) return;
  const mat = mesh.material;
  if (mat.metalness > 0.65) {
    const hex = mat.color.getHex();
    _applyMetallicEmissive(mat, hex);
  } else {
    mat.emissive.setHex(0x000000);
  }
}

renderer.domElement.addEventListener('pointerdown', () => {
  controls.autoRotate = false;
  clearTimeout(autoTimer);
});
renderer.domElement.addEventListener('pointerup', () => {
  autoTimer = setTimeout(() => { if (autoEnabled) controls.autoRotate = true; }, 3000);
});

function highlightFabStep(index) {
  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.toggle('active', i === index);
  });
}

function pulseLayer(index) {
  const mesh = layerMeshes[index];
  if (!mesh) return;
  mesh.material.emissive.setHex(0x2a2060);
  setTimeout(() => _restoreEmissive(mesh), 550);
  highlightFabStep(index);
}

/* ──────────────────────────────────────────────────────────────
   LABEL SYSTEM
   ──
   Cross-device stable approach:
   1. Project each label anchor from 3D to 2D screen space.
   2. Choose left/right side based on camera.position.x.
   3. Run 1-D collision avoidance in Y (push overlapping labels apart).
   4. Clamp adjusted Y to safe viewport area (toolbar + bottom bar).
   5. Draw SVG connector only when label has been displaced.
   6. Hide labels behind camera or outside safe margins.
────────────────────────────────────────────────────────────── */
const _v3        = new THREE.Vector3();
const MIN_SPACING = 24;    // px — minimum vertical gap between labels
const SIDE_MARGIN = 62;    // px — hide labels too close to viewport edge

let labelsVisible = true;

function updateLabels() {
  if (!labelsVisible) {
    labelSvgEl.innerHTML = '';
    labelData.forEach(ld => { if (ld.el) ld.el.style.opacity = '0'; });
    return;
  }

  // Use the canvas's actual CSS dimensions (cross-device safe).
  // These match window.innerWidth/Height since the canvas is fixed + inset:0,
  // but getBoundingClientRect() is immune to browser zoom quirks.
  const rect = canvas.getBoundingClientRect();
  const W    = rect.width  || window.innerWidth;
  const H    = rect.height || window.innerHeight;

  // ── Account for camera.setViewOffset in NDC → screen mapping ─
  // When the fab panel is visible we shift the camera frustum so the
  // scene centres over the right-hand area.  Three.js project() returns
  // NDC in the space of that shifted frustum, so we must add the same
  // CSS pixel offset back when converting to screen coordinates.
  let vOffX = 0;
  if (camera.view && camera.view.enabled) {
    // offsetX is the pixel shift we passed to setViewOffset (negative = left)
    // portWidth == fullWidth in our setup, so the scale factor is 1.
    vOffX = (camera.view.offsetX / camera.view.fullWidth) * W;
  }

  const side = camera.position.x >= 0 ? 1 : -1;   // right (+1) or left (-1)
  const GAP  = 8;   // px gap between anchor and label box

  const proj = [];

  // ── Step 1: project anchor → screen ──────────────────────────
  labelData.forEach(({ el, rightPos, leftPos }) => {
    const anchor = side === 1 ? rightPos : leftPos;
    _v3.copy(anchor).project(camera);

    // NDC → CSS pixels, corrected for any active camera view offset
    const sx = ((_v3.x + 1) * 0.5) * W + vOffX;
    const sy = ((-_v3.y + 1) * 0.5) * H;

    const behind  = _v3.z > 1.0;
    // Safe zones: below toolbar (58px), above bottom bar (52px), and side margins
    const offEdge = sx < SIDE_MARGIN || sx > W - SIDE_MARGIN
                 || sy < 58          || sy > H - 52;

    proj.push({ el, origX: sx, origY: sy, adjY: sy, side, visible: !behind && !offEdge });
  });

  // ── Step 2: collision avoidance ───────────────────────────────
  const vis = proj.filter(p => p.visible);
  vis.sort((a, b) => a.origY - b.origY);
  for (let i = 1; i < vis.length; i++) {
    if (vis[i].adjY - vis[i - 1].adjY < MIN_SPACING) {
      vis[i].adjY = vis[i - 1].adjY + MIN_SPACING;
    }
  }

  // ── Step 3: clamp to safe area (cross-device guard) ───────────
  vis.forEach(p => {
    p.adjY = Math.max(62, Math.min(H - 52, p.adjY));
  });

  // ── Step 4: apply positions + SVG connectors ──────────────────
  const svgLines = [];

  proj.forEach(p => {
    if (!p.el) return;
    if (!p.visible) { p.el.style.opacity = '0'; return; }

    p.el.style.opacity = '1';

    const ax = p.origX.toFixed(1);   // anchor X
    const ay = p.origY.toFixed(1);   // anchor Y (true 3D projection)
    const ly = p.adjY.toFixed(1);    // label Y  (collision-adjusted)

    const displaced = Math.abs(p.adjY - p.origY) > 3;

    if (p.side === 1) {
      // Label to the right
      p.el.style.left      = (p.origX + GAP) + 'px';
      p.el.style.top       = p.adjY + 'px';
      p.el.style.transform = 'translateY(-50%)';
      p.el.classList.remove('lbl-left');

      const lx2 = (p.origX + GAP).toFixed(1);
      svgLines.push(
        `<circle cx="${ax}" cy="${ay}" r="2.5" style="fill:var(--connector);opacity:0.85"/>`
      );
      if (displaced) {
        svgLines.push(
          `<line x1="${ax}" y1="${ay}" x2="${lx2}" y2="${ly}" ` +
          `style="stroke:var(--connector);stroke-width:1.2;stroke-dasharray:3,2;opacity:0.65"/>`
        );
      }
    } else {
      // Label to the left
      p.el.style.left      = (p.origX - GAP) + 'px';
      p.el.style.top       = p.adjY + 'px';
      p.el.style.transform = 'translateX(-100%) translateY(-50%)';
      p.el.classList.add('lbl-left');

      const lx2 = (p.origX - GAP).toFixed(1);
      svgLines.push(
        `<circle cx="${ax}" cy="${ay}" r="2.5" style="fill:var(--connector);opacity:0.85"/>`
      );
      if (displaced) {
        svgLines.push(
          `<line x1="${ax}" y1="${ay}" x2="${lx2}" y2="${ly}" ` +
          `style="stroke:var(--connector);stroke-width:1.2;stroke-dasharray:3,2;opacity:0.65"/>`
        );
      }
    }
  });

  labelSvgEl.innerHTML = svgLines.join('');
}

/* ──────────────────────────────────────────────────────────────
   THEME SYSTEM
────────────────────────────────────────────────────────────── */
let currentThemeKey = 'dark-neon';

function applyTheme(key) {
  const T = THEMES[key];
  if (!T) return;
  currentThemeKey = key;

  document.documentElement.setAttribute('data-theme', key);

  if (T.sceneBg === null) {
    scene.background = null;
    renderer.setClearColor(0x000000, 0);
  } else {
    scene.background = new THREE.Color(T.sceneBg);
    renderer.setClearColor(T.sceneBg, 1);
  }
  scene.fog.color.setHex(T.fogColor);
  scene.fog.density = T.fogDensity;

  ambientLight.intensity   = T.ambient;
  keyLight.color.setHex(T.keyColor);
  keyLight.intensity       = T.key;
  fillLight.color.setHex(T.fill);
  fillLight.intensity      = T.fillInt;
  rimLight.color.setHex(T.rim);
  rimLight.intensity       = T.rimInt;
  bounceLight.color.setHex(T.bounce);
  bounceLight.intensity    = T.bounceInt;

  scene.remove(floorGrid);
  floorGrid         = buildGrid(T.gridA, T.gridB);
  floorGrid.visible = gridVisible;
  scene.add(floorGrid);

  const isLight = key === 'white' || key === 'light-gray';
  glowMat.color.setHex(isLight ? 0x6688cc : 0x3b4fd4);
  glowMat.opacity = isLight ? 0.04 : 0.07;

  document.querySelectorAll('.theme-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === key);
  });
}

// Theme dropdown
const themeBtn  = document.getElementById('theme-btn');
const themeMenu = document.getElementById('theme-menu');

themeBtn.addEventListener('click', e => {
  e.stopPropagation();
  const wasOpen = themeMenu.classList.contains('open');
  closeAllMenus();
  if (!wasOpen) openMenu(themeMenu, themeBtn);
});

document.querySelectorAll('.theme-item').forEach(btn => {
  btn.addEventListener('click', () => {
    applyTheme(btn.dataset.theme);
    closeAllMenus();
    showToast('Theme: ' + (THEMES[btn.dataset.theme]?.label || btn.dataset.theme));
  });
});

/* ──────────────────────────────────────────────────────────────
   EXPORT SYSTEM
────────────────────────────────────────────────────────────── */
const exportBtn  = document.getElementById('export-btn');
const exportMenu = document.getElementById('export-menu');

exportBtn.addEventListener('click', e => {
  e.stopPropagation();
  const wasOpen = exportMenu.classList.contains('open');
  closeAllMenus();
  if (!wasOpen) openMenu(exportMenu, exportBtn);
});

document.querySelectorAll('.dl-item').forEach(btn => {
  btn.addEventListener('click', () => {
    closeAllMenus();
    handleExport(btn.dataset.type);
  });
});

function handleExport(type) {
  switch (type) {
    case 'png':        captureImage(false, 1); break;
    case 'png-hd':     captureImage(false, 2); break;
    case 'png-transp': captureImage(true,  1); break;
    case 'webm':       startVideoCapture();    break;
  }
}

function captureImage(transparent, scale) {
  const W = Math.round(window.innerWidth  * scale);
  const H = Math.round(window.innerHeight * scale);

  renderer.setSize(W, H, false);
  camera.aspect = W / H;
  camera.updateProjectionMatrix();

  const savedBg = scene.background;
  if (transparent) {
    scene.background = null;
    renderer.setClearColor(0x000000, 0);
  } else if (scene.background === null) {
    scene.background = new THREE.Color(0x0c0a24);
    renderer.setClearColor(0x0c0a24, 1);
  }

  renderer.render(scene, camera);
  const dataURL = canvas.toDataURL('image/png');

  scene.background = savedBg;
  if (savedBg === null) renderer.setClearColor(0x000000, 0);
  else                  renderer.setClearColor(savedBg.getHex(), 1);

  renderer.setSize(window.innerWidth, window.innerHeight, false);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  const suffix = transparent ? '-transparent' : scale > 1 ? '-hd' : '';
  triggerDownload(dataURL, `memristor${suffix}.png`);
  showToast(transparent ? 'Transparent PNG saved!' : scale > 1 ? 'HD PNG saved!' : 'PNG saved!');
}

let mediaRecorder  = null;
let recordedChunks = [];
const recIndicator = document.getElementById('rec-indicator');

function startVideoCapture() {
  if (mediaRecorder?.state === 'recording') return;
  try {
    const stream   = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9' : 'video/webm';
    mediaRecorder  = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
    recordedChunks = [];

    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url  = URL.createObjectURL(blob);
      triggerDownload(url, 'memristor-rotation.webm');
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      recIndicator.classList.remove('active');
      controls.autoRotate = autoEnabled;
      showToast('WebM video saved!');
    };

    controls.autoRotate = true;
    mediaRecorder.start();
    recIndicator.classList.add('active');
    setTimeout(() => { if (mediaRecorder?.state === 'recording') mediaRecorder.stop(); }, 5000);

  } catch (err) {
    showToast('Video download not supported in this browser');
  }
}

function triggerDownload(url, filename) {
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* ──────────────────────────────────────────────────────────────
   PRESENTATION MODE
────────────────────────────────────────────────────────────── */
const pptBtn   = document.getElementById('ppt-btn');
const pptLabel = document.getElementById('ppt-label');
let   pptMode  = false;

pptBtn.addEventListener('click', () => {
  pptMode = !pptMode;
  document.body.classList.toggle('ppt-mode', pptMode);
  pptBtn.classList.toggle('active', pptMode);
  pptLabel.textContent = pptMode ? 'Exit' : 'Present';
  showToast(pptMode ? 'Presentation Mode — panel hidden' : 'Normal Mode');
});

/* ──────────────────────────────────────────────────────────────
   SIDEBAR TOGGLE
────────────────────────────────────────────────────────────── */
const sidebarBtn  = document.getElementById('sidebar-toggle');
const fabPanel    = document.getElementById('fab-panel');
let   panelVisible = true;

sidebarBtn.addEventListener('click', () => {
  panelVisible = !panelVisible;
  fabPanel.classList.toggle('hidden', !panelVisible);
  sidebarBtn.textContent = panelVisible ? 'Hide Panel' : 'Show Panel';
  sidebarBtn.classList.toggle('active', !panelVisible);
  updateCameraViewOffset();
});

/* ──────────────────────────────────────────────────────────────
   CAMERA VIEW OFFSET — centres the scene in the area right of panel
────────────────────────────────────────────────────────────── */
const FAB_PANEL_RIGHT = 237;   // px: left(17) + width(220)

function updateCameraViewOffset() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  if (panelVisible) {
    camera.setViewOffset(W, H, -FAB_PANEL_RIGHT / 2, 0, W, H);
  } else {
    camera.clearViewOffset();
    camera.aspect = W / H;
  }
  camera.updateProjectionMatrix();
}

updateCameraViewOffset();

/* ──────────────────────────────────────────────────────────────
   LABELS TOGGLE
────────────────────────────────────────────────────────────── */
const labelsToggleBtn = document.getElementById('labels-toggle');

labelsToggleBtn.addEventListener('click', () => {
  labelsVisible = !labelsVisible;
  document.getElementById('labels-container').style.opacity = labelsVisible ? '1' : '0';
  if (!labelsVisible) labelSvgEl.innerHTML = '';
  labelsToggleBtn.textContent = `Labels: ${labelsVisible ? 'ON' : 'OFF'}`;
  labelsToggleBtn.classList.toggle('active', labelsVisible);
});

/* ──────────────────────────────────────────────────────────────
   GRID TOGGLE
────────────────────────────────────────────────────────────── */
const gridToggleBtn = document.getElementById('grid-toggle');

gridToggleBtn.addEventListener('click', () => {
  gridVisible = !gridVisible;
  floorGrid.visible = gridVisible;
  gridToggleBtn.textContent = `Grid: ${gridVisible ? 'ON' : 'OFF'}`;
  gridToggleBtn.classList.toggle('active', gridVisible);
});

/* ──────────────────────────────────────────────────────────────
   SHADOW / GLOW TOGGLE
   Controls the decorative glow plane beneath the device stack.
────────────────────────────────────────────────────────────── */
const shadowToggleBtn = document.getElementById('shadow-toggle');

shadowToggleBtn.addEventListener('click', () => {
  glowVisible       = !glowVisible;
  glowPlane.visible = glowVisible;
  shadowToggleBtn.textContent = `Shadow: ${glowVisible ? 'ON' : 'OFF'}`;
  shadowToggleBtn.classList.toggle('active', glowVisible);
  showToast(`Shadow effect ${glowVisible ? 'enabled' : 'disabled'}`);
});

/* ──────────────────────────────────────────────────────────────
   COLORS DROPDOWN
────────────────────────────────────────────────────────────── */
const colorsBtn = document.getElementById('colors-btn');

// Prevent clicks inside the colors menu from closing it
colorsMenu.addEventListener('click', e => e.stopPropagation());

colorsBtn.addEventListener('click', e => {
  e.stopPropagation();
  const wasOpen = colorsMenu.classList.contains('open');
  closeAllMenus();
  if (!wasOpen) openMenu(colorsMenu, colorsBtn);
});

/* ──────────────────────────────────────────────────────────────
   PRESET CAMERA VIEWS
────────────────────────────────────────────────────────────── */
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const p = PRESETS[btn.dataset.preset];
    if (p) animateCameraTo(p.pos, p.target);
  });
});

document.getElementById('reset-btn').addEventListener('click', () => {
  animateCameraTo(PRESETS.iso.pos, PRESETS.iso.target);
});

function animateCameraTo(targetPos, targetLook, duration = 950) {
  const startPos    = camera.position.clone();
  const startTarget = controls.target.clone();
  const endPos      = new THREE.Vector3(...targetPos);
  const endTarget   = new THREE.Vector3(...targetLook);
  const t0          = performance.now();

  controls.autoRotate = false;
  clearTimeout(autoTimer);

  function tick(now) {
    const t    = Math.min((now - t0) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);   // cubic ease-out

    camera.position.lerpVectors(startPos, endPos, ease);
    controls.target.lerpVectors(startTarget, endTarget, ease);
    controls.update();

    if (t < 1) {
      requestAnimationFrame(tick);
    } else if (autoEnabled) {
      autoTimer = setTimeout(() => { controls.autoRotate = true; }, 2000);
    }
  }
  requestAnimationFrame(tick);
}

/* ──────────────────────────────────────────────────────────────
   AUTO-ROTATE TOGGLE
────────────────────────────────────────────────────────────── */
const autoRotateBtn = document.getElementById('autorotate-toggle');

autoRotateBtn.addEventListener('click', () => {
  autoEnabled = !autoEnabled;
  controls.autoRotate = autoEnabled;
  clearTimeout(autoTimer);
  autoRotateBtn.textContent = `Auto-rotate: ${autoEnabled ? 'ON' : 'OFF'}`;
  autoRotateBtn.classList.toggle('active', autoEnabled);
});

/* ──────────────────────────────────────────────────────────────
   DROPDOWN UTILITIES
────────────────────────────────────────────────────────────── */
function openMenu(menuEl, btnEl) {
  menuEl.classList.add('open');
  btnEl.setAttribute('aria-expanded', 'true');
}

function closeAllMenus() {
  document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('[aria-expanded]').forEach(b => b.setAttribute('aria-expanded', 'false'));
}

document.addEventListener('click', closeAllMenus);

/* ──────────────────────────────────────────────────────────────
   TOAST NOTIFICATION
────────────────────────────────────────────────────────────── */
const toastEl = document.getElementById('toast');
let   toastTimer;

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

/* ──────────────────────────────────────────────────────────────
   RENDER LOOP
────────────────────────────────────────────────────────────── */
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Subtle rim-light pulse (uses current theme's rimInt as base)
  const T = THEMES[currentThemeKey];
  rimLight.intensity = T.rimInt * (1 + Math.sin(t * 0.85) * 0.11);

  controls.update();
  renderer.render(scene, camera);
  updateLabels();
}

/* ──────────────────────────────────────────────────────────────
   RESIZE HANDLER
────────────────────────────────────────────────────────────── */
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  updateCameraViewOffset();
});

/* ──────────────────────────────────────────────────────────────
   INITIALISE
────────────────────────────────────────────────────────────── */
buildStack();
animate();
