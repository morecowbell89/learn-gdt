/* ============ Learn GD&T — app.js ============ */
"use strict";

/* ---------------------------------------------------------------
   1. GD&T symbol library (drawn as SVG so no font support needed)
--------------------------------------------------------------- */
const S = 'stroke="currentColor" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const SYM_SVG = {
  straightness:     `<line x1="4" y1="12" x2="20" y2="12" ${S}/>`,
  flatness:         `<path d="M7.5 7 H21 L16.5 17 H3 Z" ${S}/>`,
  circularity:      `<circle cx="12" cy="12" r="7" ${S}/>`,
  cylindricity:     `<circle cx="12" cy="12" r="5.6" ${S}/><line x1="4.2" y1="19.5" x2="8.6" y2="4.5" ${S}/><line x1="15.4" y1="19.5" x2="19.8" y2="4.5" ${S}/>`,
  profile_line:     `<path d="M4 16 A 9.2 9.2 0 0 1 20 16" ${S}/>`,
  profile_surface:  `<path d="M4 16 A 9.2 9.2 0 0 1 20 16 Z" ${S}/>`,
  angularity:       `<path d="M4 18 L16.5 5.5 M4 18 H20" ${S}/>`,
  perpendicularity: `<path d="M12 4.5 V18 M4 18 H20" ${S}/>`,
  parallelism:      `<path d="M8.5 20 L12.5 4 M15.5 20 L19.5 4" ${S}/>`,
  position:         `<circle cx="12" cy="12" r="6" ${S}/><path d="M12 2.5 V21.5 M2.5 12 H21.5" ${S}/>`,
  concentricity:    `<circle cx="12" cy="12" r="3.4" ${S}/><circle cx="12" cy="12" r="7.4" ${S}/>`,
  symmetry:         `<path d="M6 7.5 H18 M3 12 H21 M6 16.5 H18" ${S}/>`,
  runout_circ:      `<line x1="7" y1="20" x2="15.2" y2="6.8" ${S}/><path d="M16.5 4.5 L15.6 10 L11.5 6.9 Z" fill="currentColor" stroke="none"/>`,
  runout_total:     `<line x1="4" y1="20" x2="20" y2="20" ${S}/><line x1="6" y1="20" x2="11.2" y2="7.8" ${S}/><path d="M12.2 5.5 L11.7 10.7 L7.9 8.4 Z" fill="currentColor" stroke="none"/><line x1="13" y1="20" x2="18.2" y2="7.8" ${S}/><path d="M19.2 5.5 L18.7 10.7 L14.9 8.4 Z" fill="currentColor" stroke="none"/>`,
  dia:              `<circle cx="12" cy="12" r="6.2" ${S}/><line x1="5.5" y1="18.5" x2="18.5" y2="5.5" ${S}/>`,
  mmc:  circleLetter("M"),
  lmc:  circleLetter("L"),
  proj: circleLetter("P"),
  freestate: circleLetter("F"),
  tangent: circleLetter("T"),
  unequal: circleLetter("U"),
};
function circleLetter(ch) {
  return `<circle cx="12" cy="12" r="9" ${S}/><text x="12" y="16.2" text-anchor="middle" font-size="12.5" font-weight="700" font-family="Arial, sans-serif" fill="currentColor" stroke="none">${ch}</text>`;
}
function symSVG(name) {
  const body = SYM_SVG[name];
  if (!body) return "";
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
}
function injectSymbols(root = document) {
  root.querySelectorAll("i.gs[data-s]").forEach(el => { el.innerHTML = symSVG(el.dataset.s); });
}

/* ---------------------------------------------------------------
   2. Symbol metadata (cards + cheat sheet)
--------------------------------------------------------------- */
const SYMDATA = [
  { id: "straightness", name: "Straightness", cat: "Form",
    zone: "Two parallel lines (surface elements) or a cylinder (axis, with Ø)",
    datums: "Never", mods: "Ⓜ allowed on an axis (with Ø)",
    use: "A shaft that must not bow; each element of a long rail." },
  { id: "flatness", name: "Flatness", cat: "Form",
    zone: "Two parallel planes, tolerance apart, floating at any orientation",
    datums: "Never", mods: "None (surface control)",
    use: "Sealing faces, mounting faces, gasket surfaces." },
  { id: "circularity", name: "Circularity", cat: "Form",
    zone: "Two concentric circles per cross-section, radii differing by the tolerance",
    datums: "Never", mods: "None",
    use: "Bearing journals, O-ring glands — roundness at every slice." },
  { id: "cylindricity", name: "Cylindricity", cat: "Form",
    zone: "Two coaxial cylinders, radii differing by the tolerance (whole surface at once)",
    datums: "Never", mods: "None",
    use: "Precision pins and bores; controls roundness + straightness + taper together." },
  { id: "perpendicularity", name: "Perpendicularity", cat: "Orientation",
    zone: "Two parallel planes (or Ø cylinder for an axis) held at exactly 90° to the datum",
    datums: "Required", mods: "Ⓜ/Ⓛ allowed on features of size",
    use: "A face square to a base; a hole square to its mounting surface." },
  { id: "parallelism", name: "Parallelism", cat: "Orientation",
    zone: "Two parallel planes (or Ø cylinder) held at exactly 0° to the datum",
    datums: "Required", mods: "Ⓜ/Ⓛ allowed on features of size",
    use: "Opposite faces of a spacer; a bore parallel to a base." },
  { id: "angularity", name: "Angularity", cat: "Orientation",
    zone: "Two parallel planes (or Ø cylinder) held at a basic angle to the datum",
    datums: "Required", mods: "Ⓜ/Ⓛ allowed on features of size",
    use: "Dovetails, chamfered mating faces, angled drillings. The angle is basic; the value is a width." },
  { id: "position", name: "Position", cat: "Location",
    zone: "Cylinder (with Ø) about the true-position axis, or two parallel planes about a center plane",
    datums: "Nearly always", mods: "Ⓜ/Ⓛ very common — enables bonus tolerance and functional gauging",
    use: "THE hole/pin/slot locator. Most-used symbol in GD&T." },
  { id: "concentricity", name: "Concentricity (legacy)", cat: "Location",
    zone: "Cylinder about a datum axis that must contain all diametrically-opposed median points",
    datums: "Required", mods: "None (RFS only)",
    use: "Removed in Y14.5-2018. Use position or runout instead." },
  { id: "symmetry", name: "Symmetry (legacy)", cat: "Location",
    zone: "Two parallel planes about a datum center plane containing all median points",
    datums: "Required", mods: "None (RFS only)",
    use: "Removed in Y14.5-2018. Use position instead." },
  { id: "profile_line", name: "Profile of a Line", cat: "Profile",
    zone: "2D band about the true profile, each cross-section evaluated independently",
    datums: "Optional", mods: "Ⓤ for unequal disposition",
    use: "Extrusions and blends where each slice matters but the surface as a whole doesn't." },
  { id: "profile_surface", name: "Profile of a Surface", cat: "Profile",
    zone: "3D boundary of uniform thickness about the true (basic/CAD) profile",
    datums: "Optional", mods: "Ⓤ for unequal disposition",
    use: "Any shaped surface; the general-purpose control of model-based drawings." },
  { id: "runout_circ", name: "Circular Runout", cat: "Runout",
    zone: "Per circular element: full indicator movement while rotating about the datum axis",
    datums: "Required (axis)", mods: "None — RFS only",
    use: "Quick check of wobble on shafts, seal and bearing seats." },
  { id: "runout_total", name: "Total Runout", cat: "Runout",
    zone: "Two coaxial cylinders about the datum axis containing the entire surface",
    datums: "Required (axis)", mods: "None — RFS only",
    use: "Whole-surface wobble + taper + straightness on rotating parts." },
];
const CATCLASS = { Form: "form", Orientation: "orient", Location: "loc", Profile: "profile", Runout: "runout" };

/* ---------------------------------------------------------------
   3. FCF renderer
   spec = {sym, dia:bool, tol:"0.25", mod:"M"|"L"|null, datums:["A","B(M)"]}
--------------------------------------------------------------- */
function renderFCF(spec, large = false) {
  const f = document.createElement("span");
  f.className = "fcf" + (large ? " large" : "");
  const cell = html => { const c = document.createElement("span"); c.className = "cell"; c.innerHTML = html; f.appendChild(c); return c; };
  cell(`<i class="gs">${symSVG(spec.sym)}</i>`);
  let tolHtml = "";
  if (spec.dia) tolHtml += `<i class="gs">${symSVG("dia")}</i>`;
  tolHtml += `<span>${spec.tol}</span>`;
  if (spec.mod) tolHtml += `<i class="gs">${symSVG(spec.mod === "M" ? "mmc" : "lmc")}</i>`;
  cell(tolHtml);
  (spec.datums || []).forEach(d => {
    const m = /^([A-Z])(?:\((M|L)\))?$/.exec(d);
    if (!m) return;
    let h = `<span>${m[1]}</span>`;
    if (m[2]) h += `<i class="gs">${symSVG(m[2] === "M" ? "mmc" : "lmc")}</i>`;
    cell(h);
  });
  return f;
}
function injectFCFs(root = document) {
  root.querySelectorAll(".fcf-json[data-fcf]").forEach(el => {
    try { el.replaceWith(renderFCF(JSON.parse(el.dataset.fcf))); } catch (e) { /* leave as-is */ }
  });
}

/* ---------------------------------------------------------------
   4. Navigation + progress
--------------------------------------------------------------- */
const MODULES = ["home","why","symbols","fcf","datums","form","orientation","position","mmc","profile","runout","legacy","quiz","cheatsheet"];
const store = {
  get() { try { return JSON.parse(localStorage.getItem("gdt-progress") || "{}"); } catch (e) { return {}; } },
  set(v) { localStorage.setItem("gdt-progress", JSON.stringify(v)); },
};

function showModule(id) {
  document.querySelectorAll("section.module").forEach(s => { s.hidden = s.id !== id; });
  document.querySelectorAll("nav#nav a").forEach(a => a.classList.toggle("active", a.dataset.module === id));
  document.getElementById("nav").classList.remove("open");
  window.scrollTo({ top: 0 });
  if (history.replaceState) history.replaceState(null, "", "#" + id);
}

function refreshProgress() {
  const p = store.get();
  const done = MODULES.filter(m => p[m]).length;
  document.getElementById("progress-fill").style.width = (100 * done / MODULES.length) + "%";
  document.getElementById("progress-label").textContent = `${done} / ${MODULES.length}`;
  document.querySelectorAll("nav#nav a").forEach(a => a.classList.toggle("done", !!p[a.dataset.module]));
  document.querySelectorAll(".complete-btn").forEach(b => {
    const isDone = !!p[b.dataset.module];
    b.classList.toggle("done", isDone);
    b.textContent = isDone ? "Completed ✓" : "Mark complete ✓";
  });
}

function initNav() {
  document.querySelectorAll("nav#nav a").forEach(a =>
    a.addEventListener("click", () => showModule(a.dataset.module)));
  document.querySelectorAll(".next-btn").forEach(b =>
    b.addEventListener("click", () => showModule(b.dataset.next)));
  document.querySelectorAll(".complete-btn").forEach(b =>
    b.addEventListener("click", () => {
      const p = store.get(); p[b.dataset.module] = !p[b.dataset.module]; store.set(p); refreshProgress();
    }));
  document.getElementById("nav-toggle").addEventListener("click", () =>
    document.getElementById("nav").classList.toggle("open"));
  const hash = location.hash.replace("#", "");
  showModule(MODULES.includes(hash) ? hash : "home");
}

/* ---------------------------------------------------------------
   5. Widget: square vs cylindrical zone (module 1)
--------------------------------------------------------------- */
function initZoneCompare() {
  const host = document.getElementById("w-zonecompare");
  const W = 460, H = 340, cx = W / 2, cy = H / 2;
  const scale = 900;                     // px per mm
  const half = 0.1 * scale;              // ±0.1 square half-side
  const r = 0.1414 * scale;              // Ø0.283 zone radius
  host.innerHTML = `
    <svg class="diagram" viewBox="0 0 ${W} ${H}" style="touch-action:none; cursor:crosshair">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(30,90,168,.10)" stroke="#1e5aa8" stroke-width="2"/>
      <rect x="${cx-half}" y="${cy-half}" width="${2*half}" height="${2*half}" fill="rgba(192,57,43,.08)" stroke="#c0392b" stroke-width="2" stroke-dasharray="6 4"/>
      <line x1="${cx}" y1="${cy-r-18}" x2="${cx}" y2="${cy+r+18}" stroke="#9aa7b4" stroke-width="1" stroke-dasharray="8 5"/>
      <line x1="${cx-r-18}" y1="${cy}" x2="${cx+r+18}" y2="${cy}" stroke="#9aa7b4" stroke-width="1" stroke-dasharray="8 5"/>
      <text x="${cx-half+6}" y="${cy-half-8}" fill="#c0392b" font-size="13">± square zone</text>
      <text x="${cx+r*0.62}" y="${cy-r*0.75}" fill="#1e5aa8" font-size="13">Ø position zone</text>
      <circle id="zc-dot" cx="${cx+half}" cy="${cy-half}" r="6" fill="#1c2733"/>
      <text x="12" y="${H-14}" font-size="12" fill="#5b6b7b">grid: true position at center · 1 division = 0.05 mm</text>
    </svg>
    <div class="wcontrols" style="margin-top:12px; margin-bottom:0">
      <span>Offset: <span class="readout" id="zc-off">—</span></span>
      <span>± coordinate check: <span id="zc-sq" class="verdict">—</span></span>
      <span>Position Ø0.283 check: <span id="zc-ci" class="verdict">—</span></span>
    </div>`;
  const svg = host.querySelector("svg"), dot = host.querySelector("#zc-dot");
  function update(px, py) {
    dot.setAttribute("cx", px); dot.setAttribute("cy", py);
    const dx = (px - cx) / scale, dy = (cy - py) / scale;
    const rr = Math.hypot(dx, dy);
    host.querySelector("#zc-off").textContent =
      `ΔX ${dx.toFixed(3)}  ΔY ${dy.toFixed(3)}  → ${rr.toFixed(3)} from true position`;
    const sq = Math.abs(dx) <= 0.1 && Math.abs(dy) <= 0.1;
    const ci = rr <= 0.1415;
    const set = (id, ok) => { const el = host.querySelector(id); el.textContent = ok ? "PASS" : "FAIL"; el.className = "verdict " + (ok ? "pass" : "fail"); };
    set("#zc-sq", sq); set("#zc-ci", ci);
  }
  function fromEvent(e) {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    update(Math.max(10, Math.min(W - 10, p.x)), Math.max(10, Math.min(H - 30, p.y)));
  }
  let down = false;
  svg.addEventListener("pointerdown", e => { down = true; svg.setPointerCapture(e.pointerId); fromEvent(e); });
  svg.addEventListener("pointermove", e => { if (down) fromEvent(e); });
  svg.addEventListener("pointerup", () => { down = false; });
  update(cx + half, cy - half); // start at the interesting corner case
}

/* ---------------------------------------------------------------
   6. Widget: FCF anatomy (module 3)
--------------------------------------------------------------- */
function initAnatomy() {
  const host = document.getElementById("w-fcf-anatomy");
  const wrap = document.createElement("div");
  wrap.className = "anatomy";
  const fcf = renderFCF({ sym: "position", dia: true, tol: "0.25", mod: "M", datums: ["A", "B(M)", "C"] }, true);
  const centered = document.createElement("div");
  centered.style.display = "flex"; centered.style.justifyContent = "center";
  centered.appendChild(fcf);
  wrap.appendChild(centered);
  const desc = document.createElement("div");
  desc.className = "anatomy-desc";
  wrap.appendChild(desc);
  host.appendChild(wrap);

  const info = [
    ["Geometric characteristic", "Which control this is — here <strong>position</strong>. Always the first compartment."],
    ["Tolerance zone", "<strong>Ø</strong> = the zone is a cylinder (about the axis). <strong>0.25</strong> = the zone's diameter. <strong>Ⓜ</strong> = the value applies at MMC, so bonus tolerance accrues as the hole is made larger than its smallest size."],
    ["Primary datum", "<strong>A</strong> — the part seats on datum A first (≥3 points of contact). The zone is oriented/located from here."],
    ["Secondary datum", "<strong>B Ⓜ</strong> — second contact (2 points). The Ⓜ here is a <em>datum feature modifier</em>: the datum is simulated at its virtual-condition size, allowing the part to shift slightly on the gauge (datum shift)."],
    ["Tertiary datum", "<strong>C</strong> — final contact (1 point), locking the last degree of freedom."],
  ];
  const cells = fcf.querySelectorAll(".cell");
  const show = i => {
    cells.forEach((c, j) => c.classList.toggle("hl", j === i));
    desc.innerHTML = `<strong>${info[i][0]}</strong> — ${info[i][1]}`;
  };
  cells.forEach((c, i) => {
    c.addEventListener("mouseenter", () => show(i));
    c.addEventListener("click", () => show(i));
  });
  show(0);
}

/* ---------------------------------------------------------------
   7. Widget: FCF builder (module 3)
--------------------------------------------------------------- */
function initBuilder() {
  const host = document.getElementById("w-builder");
  const FORM = ["straightness", "flatness", "circularity", "cylindricity"];
  const NOMOD = ["flatness", "circularity", "cylindricity", "runout_circ", "runout_total", "concentricity", "symmetry", "profile_line", "profile_surface"];
  const NEEDDATUM = ["perpendicularity", "parallelism", "angularity", "position", "runout_circ", "runout_total", "concentricity", "symmetry"];
  const AXIS = ["straightness", "perpendicularity", "parallelism", "angularity", "position"];

  host.innerHTML = `
    <div class="wcontrols">
      <label>Characteristic
        <select id="b-sym">${SYMDATA.map(s => `<option value="${s.id}">${s.name.replace(" (legacy)","")}</option>`).join("")}</select>
      </label>
      <label><input type="checkbox" id="b-dia"> Ø (cylindrical zone)</label>
      <label>Value <input type="number" id="b-tol" value="0.25" step="0.05" min="0.01" style="width:80px"></label>
      <label>Modifier
        <select id="b-mod"><option value="">none (RFS)</option><option value="M">Ⓜ MMC</option><option value="L">Ⓛ LMC</option></select>
      </label>
      <label>Datums
        <select id="b-d1"><option value="">–</option><option>A</option><option>B</option><option>C</option></select>
        <select id="b-d2"><option value="">–</option><option>A</option><option>B</option><option>C</option></select>
        <select id="b-d3"><option value="">–</option><option>A</option><option>B</option><option>C</option></select>
      </label>
    </div>
    <div class="builder-out" id="b-out"></div>
    <div class="translation" id="b-text"></div>
    <div class="builder-warn" id="b-warn"></div>`;
  host.querySelector("#b-sym").value = "position";
  host.querySelector("#b-dia").checked = true;
  host.querySelector("#b-d1").value = "A";
  host.querySelector("#b-d2").value = "B";
  host.querySelector("#b-d3").value = "C";

  const $ = sel => host.querySelector(sel);
  function update() {
    const sym = $("#b-sym").value;
    const isForm = FORM.includes(sym);
    // enforce legality
    if (isForm) { $("#b-d1").value = $("#b-d2").value = $("#b-d3").value = ""; }
    $("#b-d1").disabled = $("#b-d2").disabled = $("#b-d3").disabled = isForm;
    const modAllowed = !NOMOD.includes(sym);
    if (!modAllowed) $("#b-mod").value = "";
    $("#b-mod").disabled = !modAllowed;
    const diaAllowed = AXIS.includes(sym);
    if (!diaAllowed) $("#b-dia").checked = false;
    $("#b-dia").disabled = !diaAllowed;

    const spec = {
      sym,
      dia: $("#b-dia").checked,
      tol: (parseFloat($("#b-tol").value) || 0.25).toString(),
      mod: $("#b-mod").value || null,
      datums: [$("#b-d1").value, $("#b-d2").value, $("#b-d3").value].filter(Boolean),
    };
    const out = $("#b-out"); out.innerHTML = ""; out.appendChild(renderFCF(spec, true));
    $("#b-text").innerHTML = translate(spec);
    const warn = [];
    if (NEEDDATUM.includes(sym) && spec.datums.length === 0)
      warn.push("⚠ This characteristic requires at least one datum reference.");
    if (new Set(spec.datums).size !== spec.datums.length)
      warn.push("⚠ The same datum letter appears twice.");
    $("#b-warn").textContent = warn.join("  ");
  }

  function translate(sp) {
    const t = sp.tol;
    const zone = sp.dia ? `a cylindrical zone Ø${t}` : `two parallel ${["straightness","circularity","profile_line"].includes(sp.sym) ? "lines" : "planes"} ${t} apart`;
    const dl = sp.datums.join(", then ");
    const rel = sp.datums.length ? ` relative to datum${sp.datums.length > 1 ? "s" : ""} <strong>${dl}</strong>` : "";
    const bonus = sp.mod === "M" ? " The zone <em>grows</em> by the amount the feature's actual size departs from MMC (bonus tolerance)."
                : sp.mod === "L" ? " The zone <em>grows</em> by the amount the feature's actual size departs from LMC."
                : "";
    switch (sp.sym) {
      case "straightness": return sp.dia
        ? `The feature's <strong>axis</strong> must lie within ${zone}.${bonus}`
        : `Each <strong>line element</strong> of the surface must lie between two parallel lines ${t} apart.`;
      case "flatness": return `The entire surface must lie between <strong>two parallel planes ${t} apart</strong>. The planes float — orientation and location are not controlled.`;
      case "circularity": return `At <strong>every cross-section</strong>, the surface must lie between two concentric circles whose radii differ by ${t}.`;
      case "cylindricity": return `The entire surface must lie between <strong>two coaxial cylinders</strong> whose radii differ by ${t}.`;
      case "perpendicularity": return `The ${sp.dia ? "feature's <strong>axis</strong>" : "surface"} must lie within ${zone} oriented at exactly <strong>90°</strong>${rel}.${bonus}`;
      case "parallelism": return `The ${sp.dia ? "feature's <strong>axis</strong>" : "surface"} must lie within ${zone} exactly <strong>parallel</strong>${rel}.${bonus}`;
      case "angularity": return `The ${sp.dia ? "feature's <strong>axis</strong>" : "surface"} must lie within ${zone} held at the <strong>basic angle</strong>${rel}.${bonus}`;
      case "position": return `The feature's <strong>${sp.dia ? "axis" : "center plane"}</strong> must lie within ${zone} centered on <strong>true position</strong> (defined by basic dimensions)${rel}.${bonus}`;
      case "concentricity": return `All diametrically-opposed <strong>median points</strong> must lie within a cylindrical zone Ø${t}${rel}. (Legacy — removed in Y14.5-2018.)`;
      case "symmetry": return `All <strong>median points</strong> of the feature must lie between two parallel planes ${t} apart, centered on the datum center plane${rel}. (Legacy — removed in Y14.5-2018.)`;
      case "profile_line": return `Each <strong>2D cross-section</strong> of the surface must lie within a band of total width ${t} centered on the true profile${rel}.`;
      case "profile_surface": return `The <strong>entire surface</strong> must lie within a 3D boundary of total width ${t} centered on the true (basic) profile${rel}.`;
      case "runout_circ": return `Rotating the part about the datum axis${rel ? ` (<strong>${dl}</strong>)` : ""}, the dial-indicator reading at <strong>each circular element independently</strong> must not exceed ${t} FIM.`;
      case "runout_total": return `Rotating the part about the datum axis${rel ? ` (<strong>${dl}</strong>)` : ""} while sweeping the indicator <strong>along the whole surface</strong>, all readings must stay within ${t}.`;
      default: return "";
    }
  }

  host.querySelectorAll("select, input").forEach(el => el.addEventListener("input", update));
  update();
}

/* ---------------------------------------------------------------
   8. Widget: datum order (module 4)
--------------------------------------------------------------- */
function initDatumOrder() {
  const host = document.getElementById("w-datumorder");
  const faces = {
    A: "the large bottom face",
    B: "the long back edge",
    C: "the short left edge",
  };
  host.innerHTML = `
    <div class="wcontrols">
      <label>Datum precedence
        <select id="do-order">
          <option value="ABC" selected>A, B, C</option>
          <option value="BAC">B, A, C</option>
          <option value="ACB">A, C, B</option>
          <option value="CBA">C, B, A</option>
        </select>
      </label>
      <span id="do-fcf-slot"></span>
    </div>
    <svg class="diagram" viewBox="0 0 460 240" id="do-svg">
      <!-- plate, isometric-ish -->
      <polygon points="120,60 380,60 420,120 160,120" fill="#dde7f2" stroke="#1c2733" stroke-width="1.5"/>
      <polygon points="120,60 160,120 160,160 120,100" fill="#c3d3e6" stroke="#1c2733" stroke-width="1.5"/>
      <polygon points="160,120 420,120 420,160 160,160" fill="#b0c4dc" stroke="#1c2733" stroke-width="1.5"/>
      <circle cx="230" cy="92" r="13" fill="#fff" stroke="#1c2733" stroke-width="1.5"/>
      <circle cx="330" cy="92" r="13" fill="#fff" stroke="#1c2733" stroke-width="1.5"/>
      <text id="do-lblA" x="290" y="150" font-size="14" font-weight="700" fill="#1c2733">A (bottom)</text>
      <text id="do-lblB" x="230" y="50" font-size="14" font-weight="700" fill="#1c2733">B (back edge)</text>
      <text id="do-lblC" x="92" y="140" font-size="14" font-weight="700" fill="#1c2733">C (left edge)</text>
      <g id="do-dots"></g>
    </svg>
    <div class="anatomy-desc" id="do-text"></div>
    <p class="wnote">Contact points shown as ● — the primary datum feature gets 3, secondary 2, tertiary 1. Because real surfaces are imperfect, seating on A first then sliding to B gives a <em>different resting position</em> than seating on B first — so the measured hole locations differ, and a part can pass one callout and fail the other.</p>`;

  const dotPos = { // approximate contact dots per face on the sketch
    A: [[210,140],[300,140],[380,140]],
    B: [[200,60],[300,60],[360,60]],
    C: [[133,80],[145,112],[139,96]],
  };
  const fcfSlot = host.querySelector("#do-fcf-slot");
  function update() {
    const ord = host.querySelector("#do-order").value.split("");
    fcfSlot.innerHTML = "";
    fcfSlot.appendChild(renderFCF({ sym: "position", dia: true, tol: "0.2", mod: "M", datums: ord }));
    const counts = [3, 2, 1];
    const g = host.querySelector("#do-dots"); g.innerHTML = "";
    ord.forEach((letter, i) => {
      dotPos[letter].slice(0, counts[i]).forEach(([x, y]) => {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 5);
        c.setAttribute("fill", ["#1e5aa8", "#b07d0e", "#c0392b"][i]);
        g.appendChild(c);
      });
    });
    host.querySelector("#do-text").innerHTML =
      `Fixturing sequence: <strong>1.</strong> Seat the part on ${faces[ord[0]]} (<strong>${ord[0]}</strong>, 3 points — blue). ` +
      `<strong>2.</strong> Slide it against ${faces[ord[1]]} (<strong>${ord[1]}</strong>, 2 points — amber). ` +
      `<strong>3.</strong> Push it to ${faces[ord[2]]} (<strong>${ord[2]}</strong>, 1 point — red). ` +
      `Now measure the holes in this coordinate system.`;
  }
  host.querySelector("#do-order").addEventListener("input", update);
  update();
}

/* ---------------------------------------------------------------
   9. Widget: flatness (module 5)
--------------------------------------------------------------- */
function initFlatness() {
  const host = document.getElementById("w-flatness");
  const W = 460, H = 200;
  const scale = 350;               // px per mm of error (exaggerated)
  const PV = 0.12;                 // surface peak-to-valley error, mm
  host.innerHTML = `
    <div class="wcontrols">
      <label>Flatness tolerance <input type="range" id="fl-tol" min="0.02" max="0.25" step="0.01" value="0.15"></label>
      <span class="readout" id="fl-val"></span>
      <span id="fl-verdict" class="verdict">—</span>
    </div>
    <svg class="diagram" viewBox="0 0 ${W} ${H}" id="fl-svg"></svg>
    <p class="wnote">Surface peak-to-valley error: ${PV.toFixed(2)} mm (exaggerated for display). The two zone planes float to best-fit the surface — flatness doesn't care which way the part is tilted.</p>`;
  // wavy surface
  const pts = [];
  for (let i = 0; i <= 100; i++) {
    const x = 30 + (W - 60) * i / 100;
    const t = i / 100;
    const err = (Math.sin(t * Math.PI * 2.2) * 0.4 + Math.sin(t * Math.PI * 5.1 + 1) * 0.25 + Math.sin(t * Math.PI * 9 + 2) * 0.1);
    pts.push([x, err]);
  }
  const errs = pts.map(p => p[1]);
  const eMin = Math.min(...errs), eMax = Math.max(...errs);
  const norm = e => (e - eMin) / (eMax - eMin);       // 0..1
  const yOf = e => 130 - norm(e) * PV * scale;        // px
  const svg = host.querySelector("#fl-svg");
  function draw(tol) {
    const topY = yOf(eMax);                     // top zone plane hugs the highest point
    const botY = topY + tol * scale;            // second plane tol below
    const pass = PV <= tol;
    const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + yOf(p[1]).toFixed(1)).join(" ");
    svg.innerHTML = `
      <rect x="20" y="${topY}" width="${W - 40}" height="${Math.max(0, botY - topY)}" fill="${pass ? "rgba(29,122,62,.12)" : "rgba(192,57,43,.10)"}"/>
      <line x1="20" y1="${topY}" x2="${W - 20}" y2="${topY}" stroke="${pass ? "#1d7a3e" : "#c0392b"}" stroke-width="2"/>
      <line x1="20" y1="${botY}" x2="${W - 20}" y2="${botY}" stroke="${pass ? "#1d7a3e" : "#c0392b"}" stroke-width="2"/>
      <path d="${path} L ${W - 30} 185 L 30 185 Z" fill="#dde7f2" stroke="none"/>
      <path d="${path}" fill="none" stroke="#1c2733" stroke-width="2.5"/>
      <text x="${W - 150}" y="${topY - 8}" font-size="12" fill="#5b6b7b">two parallel planes, ${tol.toFixed(2)} apart</text>`;
    host.querySelector("#fl-val").textContent = tol.toFixed(2) + " mm";
    const v = host.querySelector("#fl-verdict");
    v.textContent = pass ? "PASS" : "FAIL";
    v.className = "verdict " + (pass ? "pass" : "fail");
  }
  const slider = host.querySelector("#fl-tol");
  slider.addEventListener("input", () => draw(parseFloat(slider.value)));
  draw(parseFloat(slider.value));
}

/* ---------------------------------------------------------------
   10. Widget: position deviation calculator (module 7)
--------------------------------------------------------------- */
function initPosCalc() {
  const host = document.getElementById("w-poscalc");
  host.innerHTML = `
    <div class="wcontrols">
      <label>ΔX <input type="number" id="pc-x" value="0.08" step="0.01" style="width:80px"> mm</label>
      <label>ΔY <input type="number" id="pc-y" value="0.05" step="0.01" style="width:80px"> mm</label>
      <label>Position tol Ø <input type="number" id="pc-t" value="0.25" step="0.05" min="0.01" style="width:80px"> mm</label>
    </div>
    <div class="wcontrols">
      <span>Deviation = 2√(ΔX²+ΔY²) = <span class="readout" id="pc-dev">—</span></span>
      <span id="pc-verdict" class="verdict">—</span>
    </div>
    <svg class="diagram" viewBox="0 0 300 220" id="pc-svg"></svg>`;
  const svg = host.querySelector("#pc-svg");
  function update() {
    const dx = parseFloat(host.querySelector("#pc-x").value) || 0;
    const dy = parseFloat(host.querySelector("#pc-y").value) || 0;
    const tol = Math.max(0.01, parseFloat(host.querySelector("#pc-t").value) || 0.25);
    const dev = 2 * Math.hypot(dx, dy);
    const pass = dev <= tol;
    host.querySelector("#pc-dev").textContent = "Ø" + dev.toFixed(3) + " mm";
    const v = host.querySelector("#pc-verdict");
    v.textContent = pass ? "PASS" : "FAIL";
    v.className = "verdict " + (pass ? "pass" : "fail");
    const cx = 150, cy = 105;
    const R = 80;                                   // tol circle drawn at fixed 80px radius
    const s = R / (tol / 2);                        // px per mm
    const px = cx + Math.max(-140, Math.min(140, dx * s));
    const py = cy - Math.max(-95, Math.min(95, dy * s));
    svg.innerHTML = `
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="rgba(30,90,168,.09)" stroke="#1e5aa8" stroke-width="2"/>
      <line x1="${cx}" y1="10" x2="${cx}" y2="200" stroke="#9aa7b4" stroke-dasharray="7 5"/>
      <line x1="20" y1="${cy}" x2="280" y2="${cy}" stroke="#9aa7b4" stroke-dasharray="7 5"/>
      <text x="${cx + R - 46}" y="${cy - R + 18}" font-size="12" fill="#1e5aa8">Ø${tol} zone</text>
      <line x1="${cx}" y1="${cy}" x2="${px}" y2="${py}" stroke="#1c2733" stroke-width="1.5"/>
      <circle cx="${px}" cy="${py}" r="6" fill="${pass ? "#1d7a3e" : "#c0392b"}"/>
      <text x="${px + 10}" y="${py - 8}" font-size="12" fill="#1c2733">actual axis</text>`;
  }
  host.querySelectorAll("input").forEach(el => el.addEventListener("input", update));
  update();
}

/* ---------------------------------------------------------------
   11. Widget: bonus tolerance (module 8)
--------------------------------------------------------------- */
function initBonus() {
  const host = document.getElementById("w-bonus");
  const MMC = 10.0, LMC = 10.6, TOL = 0.2;
  host.innerHTML = `
    <div class="wcontrols">
      <label>Actual produced hole size <input type="range" id="bn-size" min="${MMC}" max="${LMC}" step="0.05" value="10.0"></label>
      <span class="readout" id="bn-sizev"></span>
    </div>
    <svg class="diagram" viewBox="0 0 460 190" id="bn-svg"></svg>
    <div class="wcontrols" style="margin-top:10px; margin-bottom:0">
      <span>Stated: <span class="readout">Ø${TOL.toFixed(2)}</span></span>
      <span>Bonus: <span class="readout" id="bn-bonus"></span></span>
      <span><strong>Total zone: <span class="readout" id="bn-total"></span></strong></span>
    </div>
    <p class="wnote">Why it's safe: the gauge pin — the virtual condition — is Ø${(MMC - TOL).toFixed(1)}. A bigger hole leaves more clearance around that pin, so it can afford to be further off-center and the assembly still works.</p>`;
  const svg = host.querySelector("#bn-svg");
  function update() {
    const size = parseFloat(host.querySelector("#bn-size").value);
    const bonus = size - MMC;
    const total = TOL + bonus;
    host.querySelector("#bn-sizev").textContent = "Ø" + size.toFixed(2) + " mm";
    host.querySelector("#bn-bonus").textContent = "Ø" + bonus.toFixed(2);
    host.querySelector("#bn-total").textContent = "Ø" + total.toFixed(2);
    const cx = 150, cy = 95, s = 14;               // px per mm for the hole drawing
    const holeR = size / 2 * s;
    const zs = 220;                                // px per mm for the (small) zone
    const zoneR = total / 2 * zs;
    const vcR = (MMC - TOL) / 2 * s;
    svg.innerHTML = `
      <circle cx="${cx}" cy="${cy}" r="${holeR}" fill="#eef2f7" stroke="#1c2733" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="${vcR}" fill="rgba(176,125,14,.15)" stroke="#b07d0e" stroke-width="1.5" stroke-dasharray="5 4"/>
      <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="11" fill="#7a5a10">gauge pin Ø${(MMC - TOL).toFixed(1)}</text>
      <text x="${cx}" y="${cy - holeR - 8}" text-anchor="middle" font-size="12" fill="#1c2733">hole Ø${size.toFixed(2)}</text>
      <circle cx="360" cy="${cy}" r="${zoneR}" fill="rgba(30,90,168,.12)" stroke="#1e5aa8" stroke-width="2"/>
      <line x1="352" y1="${cy}" x2="368" y2="${cy}" stroke="#1e5aa8" stroke-width="1.5"/>
      <line x1="360" y1="${cy - 8}" x2="360" y2="${cy + 8}" stroke="#1e5aa8" stroke-width="1.5"/>
      <text x="360" y="${cy + zoneR + 18}" text-anchor="middle" font-size="12" fill="#1e5aa8">position zone Ø${total.toFixed(2)} (10× scale)</text>`;
  }
  host.querySelector("#bn-size").addEventListener("input", update);
  update();
}

/* ---------------------------------------------------------------
   12. Widget: runout animation (module 10)
--------------------------------------------------------------- */
function initRunout() {
  const host = document.getElementById("w-runout");
  host.innerHTML = `
    <div class="wcontrols">
      <button class="btn small" id="ro-play">⏸ Pause</button>
      <label>Eccentricity <input type="range" id="ro-e" min="0" max="0.2" step="0.01" value="0.1"></label>
      <span class="readout" id="ro-ev"></span>
      <span>Indicator: <span class="readout" id="ro-read">—</span></span>
      <span>FIM: <span class="readout" id="ro-fim">—</span></span>
    </div>
    <svg class="diagram" viewBox="0 0 460 260" id="ro-svg"></svg>
    <p class="wnote">End view. The + is the datum axis (rotation center); the part's outer circle is centered off-axis by the eccentricity. The indicator tip rides the surface as the part spins — its total swing over one revolution is the runout (FIM = 2 × eccentricity).</p>`;
  const svg = host.querySelector("#ro-svg");
  const cx = 180, cy = 145, R = 90, s = 300;       // s: px per mm eccentricity (exaggerated)
  let theta = 0, playing = true, minR = Infinity, maxR = -Infinity, lastE = null;
  function frame() {
    const e = parseFloat(host.querySelector("#ro-e").value);
    if (e !== lastE) { minR = Infinity; maxR = -Infinity; lastE = e; }
    host.querySelector("#ro-ev").textContent = e.toFixed(2) + " mm";
    if (playing) theta += 0.035;
    const ox = cx + e * s * Math.cos(theta), oy = cy + e * s * Math.sin(theta);
    // surface height under the fixed vertical indicator (above center):
    const ex = e * s * Math.cos(theta);
    const surfY = oy - Math.sqrt(Math.max(0, R * R - ex * ex)) + (cx - ox) * 0; // circle top at x = cx
    const dxc = cx - ox;
    const topY = oy - Math.sqrt(Math.max(0, R * R - dxc * dxc));
    const reading = (cy - R) - topY;               // px; positive = surface high
    const readMM = reading / s;
    minR = Math.min(minR, readMM); maxR = Math.max(maxR, readMM);
    host.querySelector("#ro-read").textContent = (readMM >= 0 ? "+" : "") + readMM.toFixed(3) + " mm";
    host.querySelector("#ro-fim").textContent = (maxR > minR ? (maxR - minR) : 0).toFixed(3) + " mm";
    const needleAngle = -readMM * 600;             // degrees, exaggerated dial
    svg.innerHTML = `
      <circle cx="${ox}" cy="${oy}" r="${R}" fill="#dde7f2" stroke="#1c2733" stroke-width="2.5"/>
      <line x1="${ox - 10}" y1="${oy}" x2="${ox + 10}" y2="${oy}" stroke="#5b6b7b" stroke-width="1.5"/>
      <line x1="${ox}" y1="${oy - 10}" x2="${ox}" y2="${oy + 10}" stroke="#5b6b7b" stroke-width="1.5"/>
      <path d="M ${cx - 12} ${cy} H ${cx + 12} M ${cx} ${cy - 12} V ${cy + 12}" stroke="#c0392b" stroke-width="2"/>
      <text x="${cx + 16}" y="${cy + 16}" font-size="11" fill="#c0392b">datum axis</text>
      <line x1="${cx}" y1="${topY}" x2="${cx}" y2="28" stroke="#1c2733" stroke-width="3"/>
      <rect x="${cx - 7}" y="${topY - 5}" width="14" height="7" rx="2.5" fill="#1c2733"/>
      <circle cx="${cx}" cy="18" r="0" />
      <g transform="translate(${cx + 140}, 70)">
        <circle r="42" fill="#fff" stroke="#1c2733" stroke-width="2"/>
        ${Array.from({length: 12}, (_, i) => {
          const a = i * 30 * Math.PI / 180;
          return `<line x1="${36 * Math.sin(a)}" y1="${-36 * Math.cos(a)}" x2="${41 * Math.sin(a)}" y2="${-41 * Math.cos(a)}" stroke="#5b6b7b" stroke-width="1.5"/>`;
        }).join("")}
        <line x1="0" y1="4" x2="${34 * Math.sin(needleAngle * Math.PI / 180)}" y2="${-34 * Math.cos(needleAngle * Math.PI / 180)}" stroke="#c0392b" stroke-width="2.5"/>
        <circle r="4" fill="#1c2733"/>
        <text y="60" text-anchor="middle" font-size="12" fill="#5b6b7b">dial indicator</text>
      </g>`;
    requestAnimationFrame(frame);
  }
  host.querySelector("#ro-play").addEventListener("click", e => {
    playing = !playing;
    e.target.textContent = playing ? "⏸ Pause" : "▶ Play";
  });
  requestAnimationFrame(frame);
}

/* ---------------------------------------------------------------
   13. Widget: symbol cards (module 2) + cheat table (module 13)
--------------------------------------------------------------- */
function initSymbolCards() {
  const host = document.getElementById("w-symbolcards");
  const grid = document.createElement("div");
  grid.className = "cards";
  let detail = null, openId = null;
  SYMDATA.forEach(d => {
    const card = document.createElement("div");
    card.className = "symcard b-" + CATCLASS[d.cat];
    card.innerHTML = `<i class="gs">${symSVG(d.id)}</i><div class="name">${d.name}</div><div class="cat">${d.cat}</div>`;
    card.addEventListener("click", () => {
      if (openId === d.id) { detail?.remove(); detail = null; openId = null; return; }
      detail?.remove();
      detail = document.createElement("div");
      detail.className = "symdetail";
      detail.innerHTML = `
        <strong style="font-size:16px"><i class="gs">${symSVG(d.id)}</i> ${d.name}</strong>
        <span class="chip cat-${CATCLASS[d.cat]}" style="margin-left:10px">${d.cat}</span>
        <table style="margin-top:10px">
          <tr><td>Tolerance zone</td><td>${d.zone}</td></tr>
          <tr><td>Datums</td><td>${d.datums}</td></tr>
          <tr><td>Modifiers</td><td>${d.mods}</td></tr>
          <tr><td>Typical use</td><td>${d.use}</td></tr>
        </table>`;
      card.after(detail);
      openId = d.id;
    });
    grid.appendChild(card);
  });
  host.appendChild(grid);
}

function initCheatTable() {
  const host = document.getElementById("w-cheattable");
  const tbl = document.createElement("table");
  tbl.className = "neat";
  tbl.innerHTML = `<thead><tr><th></th><th>Name</th><th>Family</th><th>Zone</th><th>Datums</th></tr></thead>
    <tbody>${SYMDATA.map(d => `
      <tr><td><i class="gs" style="width:22px;height:22px">${symSVG(d.id)}</i></td>
      <td><strong>${d.name}</strong></td>
      <td><span class="chip cat-${CATCLASS[d.cat]}">${d.cat}</span></td>
      <td>${d.zone}</td><td>${d.datums}</td></tr>`).join("")}
    </tbody>`;
  host.appendChild(tbl);
}

/* ---------------------------------------------------------------
   14. Quiz
--------------------------------------------------------------- */
const QUIZ = [
  { q: "What goes in the FIRST compartment of a feature control frame?",
    c: ["The tolerance value", "The geometric characteristic symbol", "The primary datum", "The material condition modifier"],
    a: 1, why: "Order is always: symbol → zone size (+modifiers) → datums in precedence order." },
  { q: "Which tolerance family NEVER references a datum?",
    c: ["Orientation", "Location", "Form", "Runout"], a: 2,
    why: "Form (straightness, flatness, circularity, cylindricity) controls a feature's shape by itself; its zone floats to best-fit the feature." },
  { q: "A hole is dimensioned Ø10.0–10.6. Its MMC size is:",
    c: ["Ø10.6", "Ø10.3", "Ø10.0", "Depends on the modifier"], a: 2,
    why: "Maximum material = most metal left = smallest hole. For a shaft it's the opposite: MMC is the largest shaft." },
  { q: "A hole (MMC Ø10.0) has position Ø0.2 Ⓜ. The hole is produced at Ø10.4. Total available position tolerance?",
    c: ["Ø0.2", "Ø0.4", "Ø0.6", "Ø0.8"], a: 2,
    why: "Bonus = 10.4 − 10.0 = 0.4. Total = stated 0.2 + bonus 0.4 = Ø0.6." },
  { q: "Rule #1 of ASME Y14.5 says:",
    c: ["All tolerances apply at MMC by default", "Size limits also control form — perfect form is required at MMC", "Every feature needs a datum", "Basic dimensions carry ±0.5 unless noted"],
    a: 1, why: "The envelope principle: a feature of size at MMC must have perfect form; form error is allowed only as size departs from MMC." },
  { q: "If no Ⓜ or Ⓛ appears in a feature control frame, the tolerance applies:",
    c: ["At MMC", "At LMC", "Regardless of feature size (RFS)", "Only after datum shift"], a: 2,
    why: "Rule #2: RFS is the default. The stated tolerance is fixed no matter the produced size — no bonus." },
  { q: "The Ø symbol in front of a position tolerance value means:",
    c: ["The feature must be cylindrical", "The tolerance zone is a cylinder", "The tolerance is a diameter of the hole", "Datum shift is allowed"], a: 1,
    why: "Ø describes the ZONE: a cylinder centered on true position that the feature's axis must stay within." },
  { q: "Compared with a ±0.1/±0.1 coordinate zone, the equivalent circumscribed cylindrical position zone has how much more area?",
    c: ["7%", "27%", "57%", "100%"], a: 2,
    why: "Circle area (Ø0.283) vs square (0.2 × 0.2): π(0.1414)²/0.04 ≈ 1.57 — 57% more accepting of functionally-good parts." },
  { q: "How many minimum contact points does the PRIMARY datum feature get in a 3-plane datum reference frame?",
    c: ["1", "2", "3", "6"], a: 2,
    why: "3-2-1: primary 3 points (seats the part), secondary 2 (aligns), tertiary 1 (stops the last translation)." },
  { q: "Which control creates a zone of two COAXIAL cylinders?",
    c: ["Circularity", "Cylindricity", "Concentricity", "Flatness"], a: 1,
    why: "Cylindricity: the whole surface between two coaxial cylinders. Circularity is two concentric CIRCLES, evaluated per cross-section." },
  { q: "The flatness tolerance zone is:",
    c: ["Two parallel planes, oriented to a datum", "Two parallel planes, free to float at any orientation", "One plane the surface must touch", "A cylinder about an axis"], a: 1,
    why: "Flatness is form-only: the two planes best-fit the surface. If the planes were datum-oriented, that would be parallelism/perpendicularity." },
  { q: "Which statements about runout are true?",
    c: ["It can use Ⓜ for bonus tolerance", "It needs no datum", "It requires a datum axis and applies RFS only", "It only applies to holes"], a: 2,
    why: "Runout is defined by physically rotating the part about a datum axis with an indicator — so a datum axis is mandatory and material-condition modifiers are meaningless." },
  { q: "Circular runout differs from total runout because circular runout:",
    c: ["Checks each circular element independently", "Sweeps the indicator along the whole surface", "Controls taper", "Uses two datums minimum"], a: 0,
    why: "Circular = one reading per axial position, each within tolerance separately. Total = one band for the entire surface, which also catches taper." },
  { q: "Which symbols were REMOVED in ASME Y14.5-2018?",
    c: ["Straightness and flatness", "Concentricity and symmetry", "Profile of a line and circularity", "Angularity and parallelism"], a: 1,
    why: "Their median-point definitions were nearly impossible to inspect economically; position and runout cover the real functions." },
  { q: "A basic dimension (boxed number) has a tolerance of:",
    c: ["±0.5 by default", "±10% of nominal", "None — it's theoretically exact; the FCF provides the tolerance", "Whatever the title block says"], a: 2,
    why: "Basic dimensions define true position / true profile exactly. The geometric tolerance in the FCF is the only allowed variation." },
  { q: "A CMM finds a hole axis at ΔX = 0.10, ΔY = 0.10 from true position. Its diametral position deviation is:",
    c: ["0.10", "0.14", "0.20", "0.28"], a: 3,
    why: "2 × √(0.1² + 0.1²) = 2 × 0.1414 = 0.283. The factor 2 converts radial offset to a diameter for comparison with the Ø zone." },
  { q: "Virtual condition of a hole Ø10.0 (MMC) with position Ø0.2 Ⓜ is:",
    c: ["Ø10.2", "Ø10.0", "Ø9.8", "Ø9.6"], a: 2,
    why: "Hole VC = MMC − geo tol = 10.0 − 0.2 = Ø9.8: the worst-case boundary, and the size of the functional gauge pin." },
  { q: "Ⓛ (LMC) is typically used to:",
    c: ["Maximize bonus for clearance fits", "Protect a minimum wall thickness or edge distance", "Allow datum shift", "Tighten form control"], a: 1,
    why: "At LMC the least material remains; controlling location there guards thin-wall cases, e.g. a hole close to an edge." },
  { q: "A datum differs from a datum feature in that the datum is:",
    c: ["The real surface on the part", "The theoretical perfect plane/axis derived from the real surface", "The gauge itself", "Always a hole"], a: 1,
    why: "Datum feature = real, imperfect geometry on the part. Datum = the perfect abstraction (plane, axis, point) simulated by a surface plate, chuck, or gauge." },
  { q: "An angularity callout controls a surface at 30° to datum A. The 30° dimension must be:",
    c: ["Toleranced ±1°", "A basic (boxed) dimension", "A reference dimension", "At MMC"], a: 1,
    why: "The angle is basic — exact. The angularity value is the WIDTH of the zone in mm, never degrees." },
  { q: "Which control is the general-purpose tool that can tolerance ANY shaped surface, controlling form, orientation, and location together?",
    c: ["Cylindricity", "Position", "Profile of a surface", "Total runout"], a: 2,
    why: "Profile of a surface wraps a uniform boundary around the true (basic/CAD) shape; with datums it locates and orients too." },
  { q: "By default, a profile tolerance of 1.0 is disposed:",
    c: ["All outside the true profile", "All inside the true profile", "0.5 outside, 0.5 inside (equal bilateral)", "However inspection prefers"], a: 2,
    why: "Default is equally disposed about the true profile. Unequal disposition uses the Ⓤ modifier (e.g. 1.0 Ⓤ 0.8 = 0.8 outward)." },
  { q: "A perpendicularity FCF with Ø0.1 attached to a hole's size dimension controls:",
    c: ["The hole's surface waviness", "The hole's axis within a Ø0.1 cylinder held at 90° to the datum", "The hole's diameter within 0.1", "The hole's location from the edges"], a: 1,
    why: "Attached to a size dimension → controls the axis. The cylinder is perpendicular to the datum but free to be anywhere (orientation ≠ location)." },
  { q: "Position tolerance is applied to:",
    c: ["Any surface", "Features of size (holes, pins, slots, tabs) — their axes or center planes", "Only threaded holes", "Cosmetic surfaces"], a: 1,
    why: "Position controls where an axis or center plane sits. A plain surface's location is controlled with profile instead." },
  { q: "Why does datum ORDER (A|B|C vs B|A|C) matter?",
    c: ["It doesn't; it's stylistic", "Letters must be alphabetical", "It sets the fixturing sequence — which surface seats first (3 pts), second (2), third (1) — changing how the part is held and measured", "It changes which tolerance applies"], a: 2,
    why: "Different precedence = different resting orientation of the imperfect part = different measured values. Same part can pass one and fail the other." },
  { q: "An orientation tolerance of 0.1 on a face (two parallel planes ⊥ datum A) ALSO limits the face's:",
    c: ["Location from datum A", "Flatness, to 0.1 max", "Diameter", "Surface roughness"], a: 1,
    why: "The face must fit between planes 0.1 apart, so it can't be less flat than 0.1. Location ⊃ orientation ⊃ form." },
  { q: "Which modifier extends the tolerance zone ABOVE the part's surface, where a mating stud/pin actually engages?",
    c: ["Ⓜ", "Ⓕ", "Ⓟ (projected tolerance zone)", "Ⓣ"], a: 2,
    why: "Ⓟ projects the position zone up into the mating part's space — vital for press-fit studs and tapped holes, where tilt matters above the surface." },
  { q: "Bonus tolerance exists because:",
    c: ["Inspectors round in your favor", "A hole made larger than MMC physically has more clearance around the mating pin, so it can be further off-location and still assemble", "Machines drift over a shift", "The standard allows 10% grace"], a: 1,
    why: "Ⓜ encodes the assembly physics: fit is governed by the virtual-condition boundary, and extra size = extra location room." },
  { q: "To check a Ø0.2 Ⓜ position callout on 10,000 holes/day cheaply, the classic method is:",
    c: ["CMM every part", "A fixed functional gauge: a pin at virtual condition size, at true position, on datum simulators", "Calipers", "Optical comparator"], a: 1,
    why: "MMC callouts are gauge-able: if the part drops onto the VC-size pin(s) while seated on its datums, it passes — seconds per part." },
  { q: "Circularity is checked:",
    c: ["Once, at the middle of the part", "At each cross-section independently, between two concentric circles", "Against the datum axis", "Only on holes"], a: 1,
    why: "Circularity is per-slice and datum-free. (If you need the slices to line up with each other, that's cylindricity; relative to an axis, runout.)" },
];

function initQuiz() {
  const host = document.getElementById("w-quiz");
  const N = 10;
  let order = [], idx = 0, score = 0;
  function start() {
    order = [...QUIZ.keys()].sort(() => Math.random() - 0.5).slice(0, N);
    idx = 0; score = 0;
    ask();
  }
  function ask() {
    const q = QUIZ[order[idx]];
    // shuffle choices, remember where the right one lands
    const perm = [...q.c.keys()].sort(() => Math.random() - 0.5);
    host.innerHTML = `
      <div class="quiz-meta"><span>Question ${idx + 1} of ${N}</span><span>Score: ${score}</span></div>
      <div class="quiz-q">${q.q}</div>
      <div class="quiz-choices">${perm.map(p => `<button class="quiz-choice" data-p="${p}">${q.c[p]}</button>`).join("")}</div>
      <div id="qz-after"></div>`;
    host.querySelectorAll(".quiz-choice").forEach(btn => btn.addEventListener("click", () => {
      const pick = +btn.dataset.p;
      const right = pick === q.a;
      if (right) score++;
      host.querySelectorAll(".quiz-choice").forEach(b => {
        b.disabled = true;
        if (+b.dataset.p === q.a) b.classList.add("correct");
        else if (b === btn) b.classList.add("wrong");
      });
      host.querySelector("#qz-after").innerHTML = `
        <div class="quiz-expl">${right ? "✅ Correct." : "❌ Not quite."} ${q.why}</div>
        <div style="margin-top:12px"><button class="btn primary" id="qz-next">${idx + 1 < N ? "Next question →" : "See results"}</button></div>`;
      host.querySelector("#qz-next").addEventListener("click", () => {
        idx++;
        if (idx < N) ask(); else finish();
      });
    }));
  }
  function finish() {
    const p = store.get();
    const best = Math.max(score, p.quizBest || 0);
    p.quizBest = best; store.set(p);
    const msg = score >= 9 ? "Outstanding — you read GD&T." : score >= 7 ? "Solid. Review the ones you missed and rerun." : "Good start — revisit modules 3, 7 and 8, then try again.";
    host.innerHTML = `
      <div class="quiz-score-big">${score} / ${N}</div>
      <p>${msg}</p>
      <p class="wnote">Best score in this browser: ${best}/${N}. The bank has ${QUIZ.length} questions — each run draws a fresh set.</p>
      <button class="btn primary" id="qz-again">Take it again</button>`;
    host.querySelector("#qz-again").addEventListener("click", start);
  }
  const p = store.get();
  host.innerHTML = `
    <p>10 randomized questions from a bank of ${QUIZ.length}. Explanations after every answer.${p.quizBest ? ` Your best so far: <strong>${p.quizBest}/10</strong>.` : ""}</p>
    <button class="btn primary" id="qz-start">Start quiz</button>`;
  host.querySelector("#qz-start").addEventListener("click", start);
}

/* ---------------------------------------------------------------
   15. Decode-the-frame drill
--------------------------------------------------------------- */
const DECODE = [
  { fcf: { sym: "position", dia: true, tol: "0.25", mod: "M", datums: ["A", "B", "C"] },
    text: "The hole's axis must stay inside a Ø0.25 cylinder at true position from datums A, B, C — and the cylinder grows as the hole is made larger than MMC." },
  { fcf: { sym: "flatness", tol: "0.05", datums: [] },
    text: "The surface must fit between two parallel planes 0.05 apart, at any orientation — no datums involved." },
  { fcf: { sym: "perpendicularity", dia: true, tol: "0.1", datums: ["A"] },
    text: "The feature's axis must fit in a Ø0.1 cylinder held exactly square to datum A (location not controlled)." },
  { fcf: { sym: "runout_total", tol: "0.08", datums: ["A"] },
    text: "Spinning the part about datum axis A while sweeping an indicator along the whole surface, all readings must stay within an 0.08 band." },
  { fcf: { sym: "profile_surface", tol: "0.5", datums: ["A", "B"] },
    text: "The entire surface must lie within a 0.5-wide boundary (0.25 each side of the exact CAD/basic shape), located and oriented from datums A and B." },
  { fcf: { sym: "parallelism", tol: "0.15", datums: ["A"] },
    text: "The surface must fit between two parallel planes 0.15 apart that are exactly parallel to datum A." },
  { fcf: { sym: "circularity", tol: "0.02", datums: [] },
    text: "At every cross-section independently, the surface must fit between two concentric circles whose radii differ by 0.02." },
  { fcf: { sym: "position", tol: "0.3", datums: ["A", "B"] },
    text: "The feature's center plane must fit between two parallel planes 0.3 apart at true position from datums A and B (no Ø = planar zone; no modifier = RFS)." },
  { fcf: { sym: "cylindricity", tol: "0.04", datums: [] },
    text: "The whole surface must fit between two coaxial cylinders whose radii differ by 0.04 — roundness, straightness and taper in one, no datum." },
  { fcf: { sym: "runout_circ", tol: "0.05", datums: ["A"] },
    text: "At each axial position independently, the dial indicator must swing no more than 0.05 per revolution about datum axis A." },
];

function initDecode() {
  const host = document.getElementById("w-decode");
  let current = -1, streak = 0;
  function next() {
    let i;
    do { i = Math.floor(Math.random() * DECODE.length); } while (i === current);
    current = i;
    const item = DECODE[i];
    const wrong = [...DECODE.keys()].filter(k => k !== i).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [i, ...wrong].sort(() => Math.random() - 0.5);
    host.innerHTML = `
      <div class="quiz-meta"><span>Decode this frame:</span><span>Streak: ${streak}</span></div>
      <div class="decode-frame" id="dc-frame"></div>
      <div class="quiz-choices">${opts.map(k => `<button class="quiz-choice" data-k="${k}">${DECODE[k].text}</button>`).join("")}</div>
      <div id="dc-after"></div>`;
    host.querySelector("#dc-frame").appendChild(renderFCF(item.fcf, true));
    host.querySelectorAll(".quiz-choice").forEach(btn => btn.addEventListener("click", () => {
      const right = +btn.dataset.k === i;
      streak = right ? streak + 1 : 0;
      host.querySelectorAll(".quiz-choice").forEach(b => {
        b.disabled = true;
        if (+b.dataset.k === i) b.classList.add("correct");
        else if (b === btn) b.classList.add("wrong");
      });
      host.querySelector("#dc-after").innerHTML =
        `<div style="margin-top:12px"><button class="btn primary" id="dc-next">${right ? "✅ Next frame →" : "❌ Try another →"}</button></div>`;
      host.querySelector("#dc-next").addEventListener("click", next);
    }));
  }
  host.innerHTML = `<button class="btn primary" id="dc-start">Start decoding</button>`;
  host.querySelector("#dc-start").addEventListener("click", next);
}

/* ---------------------------------------------------------------
   boot
--------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  injectSymbols();
  injectFCFs();
  initNav();
  refreshProgress();
  initZoneCompare();
  initSymbolCards();
  initAnatomy();
  initBuilder();
  initDatumOrder();
  initFlatness();
  initPosCalc();
  initBonus();
  initRunout();
  initQuiz();
  initDecode();
  initCheatTable();
});
