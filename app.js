// French Drain Gravel, Pipe & Fabric Calculator Engine
const state = {
  lengthFt: 50,
  widthIn: 12,
  depthIn: 18,
  pipeDiameterIn: 4,
  soilCoverIn: 4
};

const presets = {
  yard: {
    name: "Soggy Backyard Lawn (50 ft, 10\" wide, 14\" deep)",
    length: 50,
    width: 10,
    depth: 14,
    pipe: 4,
    cover: 4
  },
  foundation: {
    name: "Foundation Perimeter Footing (100 ft, 12\" wide, 20\" deep)",
    length: 100,
    width: 12,
    depth: 20,
    pipe: 4,
    cover: 4
  },
  driveway: {
    name: "Driveway Surface Interceptor (30 ft, 12\" wide, 16\" deep)",
    length: 30,
    width: 12,
    depth: 16,
    pipe: 4,
    cover: 2
  },
  deep_commercial: {
    name: "Deep Run / Hillside Swale (120 ft, 16\" wide, 24\" deep, 6\" pipe)",
    length: 120,
    width: 16,
    depth: 24,
    pipe: 6,
    cover: 4
  }
};

function init() {
  attachEventListeners();
  applyPreset("yard");
  calculate();
}

function attachEventListeners() {
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyPreset(btn.dataset.preset);
    });
  });

  const lengthInput = document.getElementById("lengthFt");
  const widthInput = document.getElementById("widthIn");
  const depthInput = document.getElementById("depthIn");
  const pipeSelect = document.getElementById("pipeDiameter");
  const coverInput = document.getElementById("soilCoverIn");

  lengthInput.addEventListener("input", (e) => {
    state.lengthFt = parseFloat(e.target.value) || 0;
    calculate();
  });

  widthInput.addEventListener("input", (e) => {
    state.widthIn = parseFloat(e.target.value) || 0;
    calculate();
  });

  depthInput.addEventListener("input", (e) => {
    state.depthIn = parseFloat(e.target.value) || 0;
    calculate();
  });

  pipeSelect.addEventListener("change", (e) => {
    state.pipeDiameterIn = parseFloat(e.target.value) || 4;
    calculate();
  });

  coverInput.addEventListener("input", (e) => {
    state.soilCoverIn = parseFloat(e.target.value) || 0;
    calculate();
  });
}

function applyPreset(key) {
  const p = presets[key];
  if (!p) return;
  state.lengthFt = p.length;
  state.widthIn = p.width;
  state.depthIn = p.depth;
  state.pipeDiameterIn = p.pipe;
  state.soilCoverIn = p.cover;

  document.getElementById("lengthFt").value = p.length;
  document.getElementById("widthIn").value = p.width;
  document.getElementById("depthIn").value = p.depth;
  document.getElementById("pipeDiameter").value = p.pipe;
  document.getElementById("soilCoverIn").value = p.cover;

  calculate();
}

function calculate() {
  const L = state.lengthFt;
  const W_ft = state.widthIn / 12;
  const D_ft = state.depthIn / 12;
  const cover_ft = state.soilCoverIn / 12;
  const pipe_r_ft = (state.pipeDiameterIn / 2) / 12;

  if (L <= 0 || W_ft <= 0 || D_ft <= 0) {
    document.getElementById("gravelTonsResult").textContent = "—";
    return;
  }

  // Total Trench Volume in Cubic Yards (divided by 27)
  const totalCuFt = L * W_ft * D_ft;
  const totalCuYds = totalCuFt / 27;

  // Soil Cover Volume
  const soilCuFt = L * W_ft * Math.min(cover_ft, D_ft);
  
  // Pipe displacement volume
  const pipeCuFt = Math.PI * Math.pow(pipe_r_ft, 2) * L;

  // Net Gravel Volume
  const netGravelCuFt = Math.max(0, totalCuFt - soilCuFt - pipeCuFt);
  const netGravelCuYds = netGravelCuFt / 27;

  // Crushed #57 stone density: ~1.35 tons per cubic yard (2,700 lbs/yd³)
  const gravelTons = netGravelCuYds * 1.35;

  // Geotextile Fabric Area: Trench perimeter (Width + 2 * Depth + 12" overlap)
  const fabricPerimeterFt = (state.widthIn + 2 * state.depthIn + 12) / 12;
  const fabricSqFt = Math.round(fabricPerimeterFt * L * 1.08); // 8% slack buffer

  // Excavated soil swell factor (+25% volume expansion)
  const spoilSoilCuYds = (totalCuYds * 1.25);

  // Update UI
  document.getElementById("gravelTonsResult").textContent = gravelTons.toFixed(1) + " Tons";
  document.getElementById("gravelYdsResult").textContent = netGravelCuYds.toFixed(1) + " cu yds (#57 Washed Stone)";
  document.getElementById("pipeLengthResult").textContent = Math.round(L) + " ft (" + state.pipeDiameterIn + "\" Perforated)";
  document.getElementById("fabricResult").textContent = fabricSqFt + " sq ft (Non-Woven Geotextile)";
  document.getElementById("spoilResult").textContent = spoilSoilCuYds.toFixed(1) + " cu yds to haul";

  drawTrench();
}

function drawTrench() {
  const svg = document.getElementById("trenchSvg");
  if (!svg) return;

  svg.innerHTML = `
    <!-- Trench ground background -->
    <rect x="10" y="5" width="480" height="100" fill="#0f172a" rx="4"/>
    
    <!-- Trench cut -->
    <polygon points="120,5 380,5 350,95 150,95" fill="#1e293b" stroke="#334155" stroke-width="2"/>
    
    <!-- Geotextile fabric outline (envelope) -->
    <polygon points="135,28 365,28 340,90 160,90" fill="#0369a1" opacity="0.35" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="3,3"/>
    
    <!-- Gravel bed fill -->
    <polygon points="138,30 362,30 338,88 162,88" fill="#334155"/>
    <!-- Gravel pebbles -->
    <circle cx="210" cy="50" r="4" fill="#94a3b8"/>
    <circle cx="290" cy="52" r="4.5" fill="#cbd5e1"/>
    <circle cx="180" cy="70" r="3.5" fill="#94a3b8"/>
    <circle cx="320" cy="68" r="4" fill="#cbd5e1"/>
    <circle cx="250" cy="42" r="3" fill="#cbd5e1"/>
    
    <!-- Perforated Pipe -->
    <circle cx="250" cy="72" r="14" fill="#070c16" stroke="#38bdf8" stroke-width="2.5"/>
    <circle cx="245" cy="78" r="1.5" fill="#38bdf8"/>
    <circle cx="255" cy="78" r="1.5" fill="#38bdf8"/>
    <circle cx="250" cy="81" r="1.5" fill="#38bdf8"/>
    <text x="250" y="75" fill="#94a3b8" font-size="9" font-family="monospace" text-anchor="middle">${state.pipeDiameterIn}" Pipe</text>

    <!-- Topsoil / Sod layer -->
    <polygon points="120,5 380,5 365,25 135,25" fill="#15803d" opacity="0.8"/>
    <text x="250" y="18" fill="#ffffff" font-size="10" font-weight="700" font-family="sans-serif" text-anchor="middle">Topsoil / Grass Cover (${state.soilCoverIn}")</text>
  `;
}

window.addEventListener("DOMContentLoaded", init);
