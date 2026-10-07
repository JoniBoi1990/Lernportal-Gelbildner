/**
 * Lernportal: Gele & Naturstoffe
 * Schule Birklehof – Kursstufe Chemie Basisfach
 * Interaktive Simulationen, Bindungs-Baukästen, Quiz & LocalStorage
 */

// ==========================================================================
// 1. Globale Zustandsverwaltung & LocalStorage Keys
// ==========================================================================

const STORAGE_KEYS = {
  THEME: 'birklehof_gele_theme',
  STUDENT_NAME: 'birklehof_gele_student_name',
  STUDENT_COURSE: 'birklehof_gele_student_course',
  QUIZ_ANSWERS: 'birklehof_gele_quiz_answers',
  QUIZ_SCORE: 'birklehof_gele_quiz_score',
  TRANSFER_TASKS: 'birklehof_gele_transfer_tasks',
  COMPETENCES: 'birklehof_gele_competences'
};

// ==========================================================================
// 2. Initialisierung & Event Listener beim DOM-Laden
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initStudentMeta();
  initSolGelSimulator();
  initPeptideBondInteractive();
  initProteinStructureTabs();
  initQuiz();
  initTransferTasks();
  initCompetenceGrid();
  initPrintHandlers();
});

// ==========================================================================
// 3. Navigation & Tab-Umschaltung
// ==========================================================================

function initNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');
      switchModule(targetId);
    });
  });
}

function switchModule(targetId) {
  // Tabs aktualisieren
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-target') === targetId);
  });

  // Module aktualisieren
  document.querySelectorAll('.module-section').forEach(section => {
    section.classList.toggle('active', section.id === targetId);
  });

  // Nach oben scrollen
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// 4. Dark/Light Theme Umschaltung
// ==========================================================================

function initTheme() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  });
}

// ==========================================================================
// 5. Benutzerdaten (Schüler/in & Kurs)
// ==========================================================================

function initStudentMeta() {
  const nameInput = document.getElementById('studentNameInput');
  const courseInput = document.getElementById('studentCourseInput');
  const printName = document.getElementById('printName');
  const printCourse = document.getElementById('printCourse');
  const printDate = document.getElementById('printDate');

  const savedName = localStorage.getItem(STORAGE_KEYS.STUDENT_NAME) || '';
  const savedCourse = localStorage.getItem(STORAGE_KEYS.STUDENT_COURSE) || '';

  nameInput.value = savedName;
  courseInput.value = savedCourse;
  if (printName) printName.textContent = savedName || '–';
  if (printCourse) printCourse.textContent = savedCourse || '–';
  if (printDate) printDate.textContent = new Date().toLocaleDateString('de-DE');

  nameInput.addEventListener('input', (e) => {
    const val = e.target.value;
    localStorage.setItem(STORAGE_KEYS.STUDENT_NAME, val);
    if (printName) printName.textContent = val || '–';
  });

  courseInput.addEventListener('input', (e) => {
    const val = e.target.value;
    localStorage.setItem(STORAGE_KEYS.STUDENT_COURSE, val);
    if (printCourse) printCourse.textContent = val || '–';
  });
}

// ==========================================================================
// 6. Sol-Gel Simulator (Canvas Physik & Partikelsimulation)
// ==========================================================================

let simState = {
  temperature: 20,
  viewMode: 'all',          // 'all' | 'network' | 'hydration'
  showHydration: true,
  showJunctions: true,
  showWater: true,
  chains: [],
  junctions: [],
  waterParticles: [],
  isDragging: false,
  dragNode: null,
  mousePos: { x: 0, y: 0 }
};

function initSolGelSimulator() {
  const canvas = document.getElementById('solGelCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const tempSlider = document.getElementById('tempSlider');
  const tempDisplay = document.getElementById('tempDisplay');
  const viewModeRadios = document.querySelectorAll('input[name="viewMode"]');
  const toggleHydrationBtn = document.getElementById('toggleHydrationBtn');
  const toggleJunctionsBtn = document.getElementById('toggleJunctionsBtn');
  const toggleWaterBtn = document.getElementById('toggleWaterBtn');

  // Initialisiere Polymerketten, Verknäulungsknoten & Wassermoleküle
  initSimParticles(canvas.width, canvas.height);

  // Event Listener: Temperaturregler
  if (tempSlider) {
    tempSlider.addEventListener('input', (e) => {
      simState.temperature = parseInt(e.target.value, 10);
      if (tempDisplay) tempDisplay.textContent = `${simState.temperature} °C`;
      updateSimDashboard();
    });
  }

  // Event Listener: Betrachtungs-Fokus
  viewModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      simState.viewMode = e.target.value;
      document.querySelectorAll('.radio-pill-group .radio-pill').forEach(pill => {
        const inp = pill.querySelector('input');
        pill.classList.toggle('active', inp && inp.checked);
      });
      updateSimDashboard();
    });
  });

  // Event Listener: Umschalter für visuelle Ebenen
  if (toggleHydrationBtn) {
    toggleHydrationBtn.addEventListener('click', () => {
      simState.showHydration = !simState.showHydration;
      toggleHydrationBtn.classList.toggle('active', simState.showHydration);
    });
  }

  if (toggleJunctionsBtn) {
    toggleJunctionsBtn.addEventListener('click', () => {
      simState.showJunctions = !simState.showJunctions;
      toggleJunctionsBtn.classList.toggle('active', simState.showJunctions);
    });
  }

  if (toggleWaterBtn) {
    toggleWaterBtn.addEventListener('click', () => {
      simState.showWater = !simState.showWater;
      toggleWaterBtn.classList.toggle('active', simState.showWater);
    });
  }

  // Interaktivität: Ziehen im Canvas (Elastische Dehnung im Gel vs. Strömung im Sol)
  function getCanvasCoords(evt) {
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function handlePointerDown(evt) {
    simState.isDragging = true;
    const pos = getCanvasCoords(evt);
    simState.mousePos = pos;

    // Finde nächsten Polymer-Knoten für elastische Interaktion
    let closestNode = null;
    let minDist = 70;
    simState.chains.forEach(chain => {
      chain.forEach(node => {
        const d = Math.hypot(node.x - pos.x, node.y - pos.y);
        if (d < minDist) {
          minDist = d;
          closestNode = node;
        }
      });
    });
    simState.dragNode = closestNode;
  }

  function handlePointerMove(evt) {
    const pos = getCanvasCoords(evt);
    simState.mousePos = pos;

    if (simState.isDragging) {
      const T = simState.temperature;
      if (T >= 42) {
        // Im Sol: Hydrodynamischer Schub auf alle nahen Ketten und Wassermoleküle
        const pushRadius = 75;
        simState.chains.forEach(chain => {
          chain.forEach(node => {
            const d = Math.hypot(node.x - pos.x, node.y - pos.y);
            if (d < pushRadius && d > 1) {
              const force = (pushRadius - d) / pushRadius * 1.8;
              node.vx += (node.x - pos.x) / d * force;
              node.vy += (node.y - pos.y) / d * force;
            }
          });
        });
        simState.waterParticles.forEach(w => {
          const d = Math.hypot(w.x - pos.x, w.y - pos.y);
          if (d < pushRadius && d > 1) {
            const force = (pushRadius - d) / pushRadius * 2.5;
            w.vx += (w.x - pos.x) / d * force;
            w.vy += (w.y - pos.y) / d * force;
          }
        });
      }
    }
  }

  function handlePointerUp() {
    simState.isDragging = false;
    simState.dragNode = null;
  }

  canvas.addEventListener('mousedown', handlePointerDown);
  window.addEventListener('mousemove', handlePointerMove);
  window.addEventListener('mouseup', handlePointerUp);

  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handlePointerDown(e); }, { passive: false });
  window.addEventListener('touchmove', (e) => { handlePointerMove(e); }, { passive: true });
  window.addEventListener('touchend', handlePointerUp);

  // Animation Loop
  function render() {
    updateAndDrawSimulation(ctx, canvas.width, canvas.height);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
  updateSimDashboard();
}

function initSimParticles(width, height) {
  simState.chains = [];
  simState.junctions = [];

  // Wir generieren 6 flexible Polymerketten, die im Gel-Zustand
  // ein durchgehendes Raumnetzwerk mit Verknäulungszonen aufspannen
  const numChains = 6;
  const nodesPerChain = 11;

  // Grundgeometrie des Netzwerks (Schnittpunkte & Maschen)
  for (let c = 0; c < numChains; c++) {
    const chain = [];
    // Jede Kette schlängelt sich über die Fläche
    const isHorizontal = c % 2 === 0;
    const lane = Math.floor(c / 2); // 0, 1, 2

    for (let n = 0; n < nodesPerChain; n++) {
      let bx, by;
      if (isHorizontal) {
        bx = 40 + n * ((width - 80) / (nodesPerChain - 1)) + (lane === 1 ? 25 : 0);
        by = 80 + lane * 140 + Math.sin(n * 0.8 + lane) * 35;
      } else {
        bx = 90 + lane * 180 + Math.sin(n * 0.8 + c) * 35;
        by = 40 + n * ((height - 80) / (nodesPerChain - 1)) + (lane === 1 ? 20 : 0);
      }

      chain.push({
        x: bx + (Math.random() - 0.5) * 8,
        y: by + (Math.random() - 0.5) * 8,
        baseX: bx,
        baseY: by,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        chainIdx: c,
        nodeIdx: n,
        isPolar: true
      });
    }
    simState.chains.push(chain);
  }

  // Definiere die Junction Zones (Verknäulungsknoten) zwischen horizontalen und vertikalen Strängen
  // Diese Knoten verbinden die Stränge beim Abkühlen zu einem stabilen 3D-Netzwerk
  const junctionPairs = [
    // Kette 0 (horiz) kreuzt Ketten 1, 3, 5 (vert)
    { c1: 0, n1: 2, c2: 1, n2: 1 },
    { c1: 0, n1: 5, c2: 3, n2: 1 },
    { c1: 0, n1: 8, c2: 5, n2: 1 },
    // Kette 2 (horiz) kreuzt Ketten 1, 3, 5 (vert)
    { c1: 2, n1: 2, c2: 1, n2: 5 },
    { c1: 2, n1: 5, c2: 3, n2: 5 },
    { c1: 2, n1: 8, c2: 5, n2: 5 },
    // Kette 4 (horiz) kreuzt Ketten 1, 3, 5 (vert)
    { c1: 4, n1: 2, c2: 1, n2: 9 },
    { c1: 4, n1: 5, c2: 3, n2: 9 },
    { c1: 4, n1: 8, c2: 5, n2: 9 },
    // Diagonale Querverknäulungen
    { c1: 0, n1: 4, c2: 2, n2: 3 },
    { c1: 2, n1: 6, c2: 4, n2: 7 }
  ];

  junctionPairs.forEach(pair => {
    if (simState.chains[pair.c1] && simState.chains[pair.c2]) {
      const nodeA = simState.chains[pair.c1][pair.n1];
      const nodeB = simState.chains[pair.c2][pair.n2];
      if (nodeA && nodeB) {
        simState.junctions.push({ a: nodeA, b: nodeB });
      }
    }
  });

  // Wassermoleküle generieren (ca. 100 H₂O-Moleküle)
  simState.waterParticles = [];
  const numWater = 95;
  for (let i = 0; i < numWater; i++) {
    simState.waterParticles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      angle: Math.random() * Math.PI * 2,
      isHydrated: false,
      boundNode: null
    });
  }
}

function updateSimDashboard() {
  const phaseDisplay = document.getElementById('phaseDisplay');
  const networkDegreeBar = document.getElementById('networkDegreeBar');
  const networkDegreeText = document.getElementById('networkDegreeText');
  const hydrationStatusDisplay = document.getElementById('hydrationStatusDisplay');
  const expTitle = document.getElementById('simExplanationTitle');
  const expText = document.getElementById('simExplanationText');

  const T = simState.temperature;

  // Mathematische S-Kurve für den Sol-Gel-Übergang um 40 °C
  // gelFactor: 1.0 (maximales Gel) bis 0.0 (vollständiges Sol)
  const gelFactor = 1 / (1 + Math.exp((T - 40) / 4.5));
  const networkPercent = Math.round(gelFactor * 96 + 2);

  if (networkDegreeBar) networkDegreeBar.style.width = `${networkPercent}%`;
  if (networkDegreeText) networkDegreeText.textContent = `${networkPercent} %`;

  if (T < 38) {
    if (phaseDisplay) {
      phaseDisplay.textContent = 'Elastisches 3D-GEL (Netzwerk stabil)';
      phaseDisplay.className = 'metric-value phase-gel';
    }
    if (hydrationStatusDisplay) {
      hydrationStatusDisplay.textContent = 'Starke Hydrathülle (Wasser immobilisiert)';
    }
    if (expTitle) expTitle.textContent = `Polymernetzwerk & Hydratisierung bei ${T} °C`;
    if (expText) {
      expText.textContent = 'Die Polymerketten sind über stabile Verknüpfungszonen (Junction Zones) zu einem kontinuierlichen 3D-Netzwerk verknäult. ' +
        'Polare Gruppen lagern Wassermoleküle über Wasserstoffbrücken zu einer dichten Hydrathülle an, während freies Wasser in den Maschen immobilisiert ist (viskoelastischer Festkörper).';
    }
  } else if (T <= 45) {
    if (phaseDisplay) {
      phaseDisplay.textContent = 'Sol-Gel-Übergangszone (Gleichgewicht)';
      phaseDisplay.className = 'metric-value phase-transition';
    }
    if (hydrationStatusDisplay) {
      hydrationStatusDisplay.textContent = 'Partielle Hydratisierung (Maschen lockern sich)';
    }
    if (expTitle) expTitle.textContent = `Sol-Gel-Gleichgewicht bei ${T} °C`;
    if (expText) {
      expText.textContent = 'Die thermische kinetische Energie gleicht den schwachen zwischenmolekularen Bindungskräften. ' +
        'Verknäulungsknoten brechen dynamisch auf und schließen sich kurzzeitig wieder. Das Gel verliert seine Formfestigkeit und beginnt zu schmelzen.';
    }
  } else {
    if (phaseDisplay) {
      phaseDisplay.textContent = 'Flüssiges SOL (Ketten frei beweglich)';
      phaseDisplay.className = 'metric-value phase-sol';
    }
    if (hydrationStatusDisplay) {
      hydrationStatusDisplay.textContent = 'Gelöste Hydrathüllen (freie Wasser-Diffusion)';
    }
    if (expTitle) expTitle.textContent = `Flüssiges Sol bei ${T} °C`;
    if (expText) {
      expText.textContent = 'Bei hoher Temperatur überwindet die Brownsche Wärmebewegung die zwischenmolekularen Kräfte. ' +
        'Die Polymerketten bewegen sich als isolierte, freie Knäuel aneinander vorbei. Die Hydrathüllen sind dynamisch aufgebrochen; die Flüssigkeit fließt ungehindert.';
    }
  }
}

function updateAndDrawSimulation(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);

  const T = simState.temperature;
  // gelFactor: 1 = tiefgefroren/raumtemperiertes Gel, 0 = heißes Sol
  const gelFactor = 1 / (1 + Math.exp((T - 40) / 4.5));
  const isGel = gelFactor > 0.45;
  const view = simState.viewMode;

  // 1. PHYSIK-UPDATE: Polymerketten & Verknäulung
  // =============================================
  const thermalNoise = (0.25 + (T / 90) * 2.8) * (1 - gelFactor * 0.7);

  // Kettenglied-Verbindungsfedern & Grundschwingung
  simState.chains.forEach((chain) => {
    // Interne Federkräfte zwischen benachbarten Gliedern
    const restLen = 28;
    for (let i = 0; i < chain.length - 1; i++) {
      const n1 = chain[i];
      const n2 = chain[i + 1];
      const dx = n2.x - n1.x;
      const dy = n2.y - n1.y;
      const dist = Math.hypot(dx, dy) || 1;
      const diff = (dist - restLen);
      const k = 0.08 + gelFactor * 0.12;

      const fx = (dx / dist) * diff * k;
      const fy = (dy / dist) * diff * k;

      n1.vx += fx;
      n1.vy += fy;
      n2.vx -= fx;
      n2.vy -= fy;
    }

    // Bewegung der einzelnen Knoten
    chain.forEach((node) => {
      // Wenn der Knoten aktiv mit der Maus/Touch gezogen wird
      if (simState.isDragging && simState.dragNode === node) {
        node.x += (simState.mousePos.x - node.x) * 0.35;
        node.y += (simState.mousePos.y - node.y) * 0.35;
        node.vx = 0;
        node.vy = 0;
        return;
      }

      // Elastische Rückstellkraft zur Netzwerk-Basisposition (nur im Gel wirksam)
      const anchorK = gelFactor * 0.045;
      node.vx += (node.baseX - node.x) * anchorK;
      node.vy += (node.baseY - node.y) * anchorK;

      // Thermisches Zittern / Brownsche Bewegung
      node.vx += (Math.random() - 0.5) * thermalNoise;
      node.vy += (Math.random() - 0.5) * thermalNoise;

      // Im Sol: Freie Knäuel-Drift durch die Lösung
      if (!isGel) {
        const driftBoost = (T - 38) / 50 * 0.8;
        node.vx += (Math.random() - 0.5) * driftBoost;
        node.vy += (Math.random() - 0.5) * driftBoost;
      }

      // Dämpfung (Viskosität)
      const damping = 0.86 - gelFactor * 0.08;
      node.vx *= damping;
      node.vy *= damping;

      node.x += node.vx;
      node.y += node.vy;

      // Randbegrenzung
      if (node.x < 15) { node.x = 15; node.vx *= -0.5; }
      if (node.x > width - 15) { node.x = width - 15; node.vx *= -0.5; }
      if (node.y < 15) { node.y = 15; node.vy *= -0.5; }
      if (node.y > height - 15) { node.y = height - 15; node.vy *= -0.5; }
    });
  });

  // Verknäulungskräfte an den Junction Zones (ziehen Knoten im Gel zusammen)
  if (gelFactor > 0.05) {
    const junctionK = gelFactor * 0.18;
    simState.junctions.forEach(j => {
      const dx = j.b.x - j.a.x;
      const dy = j.b.y - j.a.y;
      const dist = Math.hypot(dx, dy) || 1;
      const targetDist = 12 * (1 - gelFactor * 0.5); // ziehen sich bis auf ~6px zusammen
      const diff = dist - targetDist;

      const fx = (dx / dist) * diff * junctionK;
      const fy = (dy / dist) * diff * junctionK;

      j.a.vx += fx;
      j.a.vy += fy;
      j.b.vx -= fx;
      j.b.vy -= fy;
    });
  }

  // 2. PHYSIK-UPDATE: Wassermoleküle & Hydratisierung
  // =================================================
  const baseWaterSpeed = 0.35 + (T / 90) * 3.2;

  simState.waterParticles.forEach(w => {
    let closestNode = null;
    let minDist = 999;

    // Finde das nächstgelegene Polymer-Monomer für Hydratisierung
    for (let c = 0; c < simState.chains.length; c++) {
      const chain = simState.chains[c];
      for (let n = 0; n < chain.length; n++) {
        const d = Math.hypot(chain[n].x - w.x, chain[n].y - w.y);
        if (d < minDist) {
          minDist = d;
          closestNode = chain[n];
        }
      }
      if (minDist < 30) break;
    }

    // Hydratisierung: Wenn im Gel und nahe am Polymer, lagert sich Wasser über H-Brücken an
    if (isGel && minDist < 45 && closestNode) {
      w.isHydrated = true;
      w.boundNode = closestNode;

      // Anziehungskraft der H-Brücke (Hydrathülle)
      const attractForce = gelFactor * 0.12;
      const targetDist = 20 + (Math.sin(w.x * 0.1) * 6);
      const diff = minDist - targetDist;
      const dx = closestNode.x - w.x;
      const dy = closestNode.y - w.y;

      if (minDist > 1) {
        w.vx += (dx / minDist) * diff * attractForce;
        w.vy += (dy / minDist) * diff * attractForce;
      }
      // Starke Geschwindigkeitsdämpfung im Hydratwasser
      w.vx *= 0.65;
      w.vy *= 0.65;
      w.angle = Math.atan2(dy, dx);
    } else {
      w.isHydrated = false;
      w.boundNode = null;

      // Freies Wasser: Brownsche Diffusion
      w.vx += (Math.random() - 0.5) * baseWaterSpeed * 0.4;
      w.vy += (Math.random() - 0.5) * baseWaterSpeed * 0.4;

      // Im Gel sind auch nicht direkt gebundene Wassermoleküle in Maschen immobilisiert
      if (isGel) {
        w.vx *= 0.78;
        w.vy *= 0.78;
      } else {
        w.vx *= 0.94;
        w.vy *= 0.94;
      }
    }

    w.x += w.vx;
    w.y += w.vy;

    // Randreflexion
    if (w.x < 8) { w.x = 8; w.vx *= -1; }
    if (w.x > width - 8) { w.x = width - 8; w.vx *= -1; }
    if (w.y < 8) { w.y = 8; w.vy *= -1; }
    if (w.y > height - 8) { w.y = height - 8; w.vy *= -1; }
  });


  // 3. RENDERING: Zeichnen auf Canvas
  // =================================

  // A. Hintergrund: Maschen-Zellen (Polygone) des 3D-Netzwerks schattieren (im Gel)
  if (gelFactor > 0.25 && (simState.showJunctions || view === 'network' || view === 'all')) {
    ctx.save();
    ctx.fillStyle = `rgba(14, 165, 233, ${0.035 * gelFactor})`;
    // Zeichne angedeutete geschlossene Maschen-Bereiche
    for (let jIdx = 0; jIdx < simState.junctions.length - 1; jIdx += 2) {
      const j1 = simState.junctions[jIdx];
      const j2 = simState.junctions[jIdx + 1];
      if (j1 && j2) {
        ctx.beginPath();
        ctx.moveTo(j1.a.x, j1.a.y);
        ctx.lineTo(j1.b.x, j1.b.y);
        ctx.lineTo(j2.b.x, j2.b.y);
        ctx.lineTo(j2.a.x, j2.a.y);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // B. Hydratisierungs-Schein (Hydrathülle als feine Aura um die Ketten)
  if (simState.showHydration && gelFactor > 0.15 && (view === 'hydration' || view === 'all')) {
    ctx.save();
    const haloAlpha = (view === 'hydration' ? 0.28 : 0.15) * gelFactor;
    ctx.strokeStyle = `rgba(56, 189, 248, ${haloAlpha})`;
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    simState.chains.forEach(chain => {
      ctx.beginPath();
      ctx.moveTo(chain[0].x, chain[0].y);
      for (let i = 1; i < chain.length; i++) {
        const xc = (chain[i - 1].x + chain[i].x) / 2;
        const yc = (chain[i - 1].y + chain[i].y) / 2;
        ctx.quadraticCurveTo(chain[i - 1].x, chain[i - 1].y, xc, yc);
      }
      ctx.lineTo(chain[chain.length - 1].x, chain[chain.length - 1].y);
      ctx.stroke();
    });
    ctx.restore();
  }

  // C. H-Brücken zwischen Polymerketten und angelagerten Wassermolekülen
  if (simState.showHydration && gelFactor > 0.2 && (view === 'hydration' || view === 'all')) {
    ctx.save();
    ctx.setLineDash([2, 3]);
    ctx.lineWidth = view === 'hydration' ? 1.6 : 1.2;
    ctx.strokeStyle = '#fbbf24'; // Golden amber H-Brücke

    simState.waterParticles.forEach(w => {
      if (w.isHydrated && w.boundNode) {
        ctx.beginPath();
        ctx.moveTo(w.boundNode.x, w.boundNode.y);
        ctx.lineTo(w.x, w.y);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  // D. Polymerketten (Makromolekül-Rückgrat) zeichnen
  simState.chains.forEach((chain, cIdx) => {
    ctx.save();
    // Leuchtendes Polymerrückgrat
    ctx.beginPath();
    ctx.moveTo(chain[0].x, chain[0].y);
    for (let i = 1; i < chain.length; i++) {
      const xc = (chain[i - 1].x + chain[i].x) / 2;
      const yc = (chain[i - 1].y + chain[i].y) / 2;
      ctx.quadraticCurveTo(chain[i - 1].x, chain[i - 1].y, xc, yc);
    }
    ctx.lineTo(chain[chain.length - 1].x, chain[chain.length - 1].y);

    const chainColor = cIdx % 2 === 0 ? '#38bdf8' : '#818cf8';
    ctx.strokeStyle = chainColor;
    ctx.lineWidth = view === 'network' ? 3.8 : 3.0;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Monomer-Knoten mit polaren funktionellen Gruppen (-OH / -CO / -NH)
    chain.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = chainColor;
      ctx.fill();

      // Weiß-cyanfarbener polarer Punkt im Zentrum
      ctx.beginPath();
      ctx.arc(node.x, node.y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });
    ctx.restore();
  });

  // E. Verknäulungsknoten (Junction Zones) hervorheben
  if (simState.showJunctions && gelFactor > 0.25 && (view === 'network' || view === 'all')) {
    ctx.save();
    simState.junctions.forEach(j => {
      const midX = (j.a.x + j.b.x) / 2;
      const midY = (j.a.y + j.b.y) / 2;
      const dist = Math.hypot(j.a.x - j.b.x, j.a.y - j.b.y);

      // Verbindungslinie an der Verknüpfungsstelle
      ctx.beginPath();
      ctx.moveTo(j.a.x, j.a.y);
      ctx.lineTo(j.b.x, j.b.y);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Leuchtender Verknäulungs-Punkt
      ctx.beginPath();
      ctx.arc(midX, midY, dist < 16 ? 5.5 : 4.0, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = view === 'network' ? 8 : 4;
      ctx.fill();
    });
    ctx.restore();
  }

  // F. Wassermoleküle (H₂O) zeichnen
  if (simState.showWater) {
    ctx.save();
    simState.waterParticles.forEach(w => {
      const isBound = w.isHydrated;
      const oxygenAlpha = isBound ? 0.95 : (isGel ? 0.65 : 0.85);

      // Sauerstoffatom (O, cyan-blau)
      ctx.beginPath();
      ctx.arc(w.x, w.y, isBound ? 3.0 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isBound ? `rgba(103, 232, 249, ${oxygenAlpha})` : `rgba(56, 189, 248, ${oxygenAlpha})`;
      ctx.fill();

      // Zwei Wasserstoffatome (H, hellweiß) im 104°-Winkel andeuten
      const ang = w.angle || 0;
      const hDist = 3.2;
      const h1x = w.x + Math.cos(ang + 0.9) * hDist;
      const h1y = w.y + Math.sin(ang + 0.9) * hDist;
      const h2x = w.x + Math.cos(ang - 0.9) * hDist;
      const h2y = w.y + Math.sin(ang - 0.9) * hDist;

      ctx.beginPath();
      ctx.arc(h1x, h1y, 1.3, 0, Math.PI * 2);
      ctx.arc(h2x, h2y, 1.3, 0, Math.PI * 2);
      ctx.fillStyle = isBound ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)';
      ctx.fill();
    });
    ctx.restore();
  }
}


// ==========================================================================
// 7. Interaktiver Peptidbindungs-Simulator (Kondensation)
// ==========================================================================

function initPeptideBondInteractive() {
  const btnPerform = document.getElementById('btnPerformPeptideReaction');
  const btnReset = document.getElementById('btnResetPeptideReaction');
  const stage = document.getElementById('peptideReactionStage');
  const reactant1 = document.getElementById('reactant1');
  const reactant2 = document.getElementById('reactant2');
  const plus = document.getElementById('reactionPlus');
  const arrowWrap = document.getElementById('reactionArrowWrap');
  const product = document.getElementById('reactionProduct');

  if (!btnPerform || !stage) return;

  // Initialzustand: Vor Reaktion
  product.style.display = 'none';

  btnPerform.addEventListener('click', () => {
    reactant1.style.opacity = '0.35';
    reactant2.style.opacity = '0.35';
    plus.style.opacity = '0.35';
    arrowWrap.classList.add('active');

    setTimeout(() => {
      product.style.display = 'block';
      product.style.animation = 'fadeIn 0.4s ease-out';
      btnPerform.disabled = true;
    }, 200);
  });

  btnReset.addEventListener('click', () => {
    reactant1.style.opacity = '1';
    reactant2.style.opacity = '1';
    plus.style.opacity = '1';
    arrowWrap.classList.remove('active');
    product.style.display = 'none';
    btnPerform.disabled = false;
  });
}

// ==========================================================================
// 8. Proteinstruktur-Hierarchie (Primär- bis Tertiärstruktur)
// ==========================================================================

const PROTEIN_LEVEL_DATA = {
  1: {
    title: '1. Primärstruktur: Die Aminosäuresequenz',
    text: 'Die Primärstruktur ist die exakte Abfolge der Aminosäuren in der Polypeptidkette, verknüpft über kovalente Peptidbindungen (-CO-NH-). Sie ist genetisch festgelegt und bestimmt alle nachfolgenden Faltungsebenen.',
    graphic: `
      <div style="font-family: var(--font-mono); font-size: 1.1rem; padding: 1.5rem; background: var(--bg-card); border-radius: 8px;">
        <span style="color: var(--color-primary); font-weight: bold;">H₃N⁺</span>—[Gly]—[Ala]—[Val]—[Pro]—[Hyp]—[Gly]—<span style="color: var(--color-danger); font-weight: bold;">COO⁻</span>
        <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-top: 0.5rem; font-family: var(--font-main);">
          (Typische Kollagen-Sequenz: Jede dritte Aminosäure ist Glycin, gefolgt von Prolin und Hydroxyprolin)
        </div>
      </div>
    `
  },
  2: {
    title: '2. Sekundärstruktur: Lokale Faltungsmuster (α-Helix & β-Faltblatt)',
    text: 'Die Sekundärstruktur beschreibt die räumliche Anordnung benachbarter Kettenabschnitte. Sie wird ausschließlich durch regelmäßige Wasserstoffbrückenbindungen zwischen den Carbonyl-Sauerstoffen (C=O) und den Amid-Wasserstoffen (N-H) des Peptidrückgrats stabilisiert. Seitenketten (Reste R) sind hieran nicht beteiligt!',
    graphic: `
      <div class="struct-image-card">
        <div class="card-img-title">Schematische Zeichnung: α-Helix &amp; β-Faltblatt</div>
        <div class="struct-img-wrapper">
          <img src="assets/sekundaerstruktur_helix_faltblatt.png" alt="Sekundärstruktur: α-Helix und β-Faltblatt mit Wasserstoffbrückenbindungen" class="struct-img">
        </div>
        <div class="struct-img-caption">
          <strong>Erklärung zur Abbildung:</strong>
          <ul>
            <li><strong>Links (α-Helix):</strong> Die Polypeptidkette schraubt sich schraubenförmig auf (3,6 Aminosäuren pro Windung). Die Wasserstoffbrückenbindungen (rot gepunktet) verlaufen parallel zur Längsachse der Helix zwischen einer C=O-Gruppe und der N-H-Gruppe der viertnächsten Aminosäure. Die Reste R ragen nach außen.</li>
            <li><strong>Rechts (β-Faltblatt):</strong> Mehrere Peptidstränge verlaufen zickzackförmig nebeneinander. Die Wasserstoffbrückenbindungen (rot gepunktet) bilden sich quer zwischen benachbarten Strängen aus. Die Seitenketten ragen abwechselnd nach oben und unten aus der Faltblattebene heraus.</li>
          </ul>
        </div>
      </div>
    `
  },
  3: {
    title: '3. Tertiärstruktur: Die vollständige 3D-Raumstruktur & Seitenketten-Wechselwirkungen',
    text: 'Die Tertiärstruktur ist die vollständige dreidimensionale Anordnung der gesamten Polypeptidkette im Raum. Sie entsteht durch Wechselwirkungen zwischen den funktionellen Seitenketten (Resten R): Disulfidbrücken, Ionenbindungen, Wasserstoffbrücken und London-Wechselwirkungen.',
    graphic: `
      <div class="struct-images-grid">
        <div class="struct-image-card">
          <div class="card-img-title">A. Schematische Übersicht der Seitenketten-Wechselwirkungen</div>
          <div class="struct-img-wrapper">
            <img src="assets/tertiaerstruktur_wechselwirkungen.png" alt="Schema der Tertiärstruktur mit 4 Wechselwirkungen" class="struct-img">
          </div>
          <div class="struct-img-caption">
            <strong>Skizze der Tertiärstruktur:</strong>
            Zusammenspiel von α-Helices (hellblau), β-Faltblättern (grün) und verbindenden Schleifen/Turns (orange):
            <ul>
              <li><strong>Disulfidbrücke (links):</strong> Kovalente Atombindung zwischen zwei Cystein-Resten (-CH₂-S-S-CH₂-).</li>
              <li><strong>London-Wechselwirkungen (Mitte oben):</strong> Zwischen temporären und induzierten Dipolen unpolarer, aromatischer Ringe (Phenylalanin).</li>
              <li><strong>Wasserstoffbrückenbindungen (rechts unten):</strong> Zwischen polaren Carbonsäureamid-Seitenketten (-CO-NH₂).</li>
              <li><strong>Ionenbindung / Salzbrücke (ganz rechts):</strong> Elektrostatische Anziehung zwischen Ammonium- (-NH₃⁺) und Carboxylat-Ionen (-COO⁻).</li>
            </ul>
          </div>
        </div>

        <div class="struct-image-card">
          <div class="card-img-title">B. Biologisches Raumstruktur-Beispiel: Myoglobin</div>
          <div class="struct-img-wrapper">
            <img src="assets/myoglobin_tertiaerstruktur.png" alt="Tertiär-Struktur von Myoglobin mit Häm und Sauerstoff" class="struct-img">
          </div>
          <div class="struct-img-caption">
            <strong>Tertiär-Struktur von Myoglobin:</strong>
            Besteht aus 150 Aminosäuren. Das globuläre Protein faltet sich so, dass im aktiven Zentrum eine hydrophobe Tasche entsteht,
            in der ein <strong>Häm-Molekül</strong> als Cofaktor gehalten wird. Dieses bindet Sauerstoff-Moleküle (O₂) für den Sauerstofftransport
            in Muskelzellen (Quelle: Wikipedia).
          </div>
        </div>
      </div>
    `
  },
  4: {
    title: '4. Gelatine-Spezialfall: Die Kollagen-Tripelhelix & das Gel-Netzwerk',
    text: 'Kollagen besteht aus drei linksgängigen Polyprolin-Helices, die sich zu einer superstolzen rechtsgängigen Tripelhelix verdrillen. Durch Hitze (&gt; 60 °C) denaturiert Kollagen zu löslicher Gelatine. Beim Abkühlen ordnen sich kurze Segmente wieder zu Tripelhelix-Knotenpunkten (Junction Zones) an und fangen Wasser ein.',
    graphic: `
      <div style="display: flex; justify-content: center; align-items: center; gap: 1.5rem; padding: 1rem; flex-wrap: wrap;">
        <div style="border: 2px solid var(--color-protein); padding: 1rem; border-radius: 8px; text-align: center;">
          <span style="font-size: 1.3rem;">🎗️ 🎗️ 🎗️</span>
          <div style="font-weight: bold; font-size: 0.9rem; margin-top: 0.3rem;">Kollagen-Tripelhelix</div>
          <div style="font-size: 0.78rem; color: var(--color-text-muted);">Thermisch stabil, faserartig</div>
        </div>
        <span style="font-size: 1.5rem; color: var(--color-accent);">→ Hitze / Abkühlen ⇄</span>
        <div style="border: 2px solid var(--color-accent); padding: 1rem; border-radius: 8px; text-align: center;">
          <span style="font-size: 1.3rem;">🕸️ 💧</span>
          <div style="font-weight: bold; font-size: 0.9rem; margin-top: 0.3rem;">Gelatine-Netzwerk</div>
          <div style="font-size: 0.78rem; color: var(--color-text-muted);">Partielle Knoten bilden 3D-Netzwerk und fangen Wasser ein</div>
        </div>
      </div>
    `
  }
};

function initProteinStructureTabs() {
  const tabs = document.querySelectorAll('.struct-tab');
  const displayArea = document.getElementById('structDisplayArea');
  if (!displayArea) return;

  function renderLevel(lvl) {
    const data = PROTEIN_LEVEL_DATA[lvl];
    displayArea.innerHTML = `
      <div class="struct-view-box">
        <h4>${data.title}</h4>
        <p>${data.text}</p>
        <div class="struct-graphic">${data.graphic}</div>
      </div>
    `;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const lvl = tab.getAttribute('data-level');
      renderLevel(lvl);
    });
  });

  // Init Level 1
  renderLevel(1);
}

// ==========================================================================
// 9. Diagnose-Quiz & Bildungsplan-Auswertung (10 BE)
// ==========================================================================

function initQuiz() {
  const submitBtn = document.getElementById('btnSubmitQuiz');
  const resetBtn = document.getElementById('btnResetQuiz');
  const globalScoreText = document.getElementById('globalScoreText');
  const printScore = document.getElementById('printScore');

  // Gespeicherten Zustand laden
  const savedAnswers = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUIZ_ANSWERS) || '{}');
  Object.keys(savedAnswers).forEach(qName => {
    const val = savedAnswers[qName];
    const radio = document.querySelector(`input[name="${qName}"][value="${val}"]`);
    if (radio) radio.checked = true;
  });

  const savedScore = localStorage.getItem(STORAGE_KEYS.QUIZ_SCORE);
  if (savedScore !== null) {
    updateScoreDisplays(savedScore);
  }

  submitBtn.addEventListener('click', () => {
    let score = 0;
    const answers = {};
    const questions = document.querySelectorAll('.quiz-question-box');

    questions.forEach(qBox => {
      const qid = qBox.getAttribute('data-qid');
      const points = parseInt(qBox.getAttribute('data-points'), 10);
      const selectedRadio = qBox.querySelector(`input[name="${qid}"]:checked`);
      const feedbackEl = document.getElementById(`feedback-${qid}`);

      // Alle Labels zurücksetzen
      qBox.querySelectorAll('.option-label').forEach(lbl => {
        lbl.classList.remove('is-correct', 'is-wrong');
      });

      if (!selectedRadio) {
        feedbackEl.textContent = '⚠️ Bitte wähle eine Antwort aus.';
        feedbackEl.className = 'q-feedback visible';
        feedbackEl.style.color = 'var(--color-warning)';
        return;
      }

      answers[qid] = selectedRadio.value;
      const isCorrect = selectedRadio.parentElement.getAttribute('data-correct') === 'true';

      if (isCorrect) {
        score += points;
        selectedRadio.parentElement.classList.add('is-correct');
        feedbackEl.textContent = `✓ Richtig! (+${points} BE)`;
        feedbackEl.className = 'q-feedback visible';
        feedbackEl.style.color = 'var(--color-success)';
      } else {
        selectedRadio.parentElement.classList.add('is-wrong');
        // Richtige Antwort hervorheben
        const correctLabel = qBox.querySelector('.option-label[data-correct="true"]');
        if (correctLabel) correctLabel.classList.add('is-correct');

        feedbackEl.textContent = `✗ Leider nicht korrekt. (0 von ${points} BE)`;
        feedbackEl.className = 'q-feedback visible';
        feedbackEl.style.color = 'var(--color-danger)';
      }
    });

    localStorage.setItem(STORAGE_KEYS.QUIZ_ANSWERS, JSON.stringify(answers));
    localStorage.setItem(STORAGE_KEYS.QUIZ_SCORE, score);
    updateScoreDisplays(score);
  });

  resetBtn.addEventListener('click', () => {
    document.querySelectorAll('.quiz-question-box').forEach(qBox => {
      qBox.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
      qBox.querySelectorAll('.option-label').forEach(lbl => lbl.classList.remove('is-correct', 'is-wrong'));
      const fb = qBox.querySelector('.q-feedback');
      if (fb) {
        fb.textContent = '';
        fb.className = 'q-feedback';
      }
    });
    localStorage.removeItem(STORAGE_KEYS.QUIZ_ANSWERS);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_SCORE);
    updateScoreDisplays(0);
  });
}

function updateScoreDisplays(score) {
  const globalScoreText = document.getElementById('globalScoreText');
  const printScore = document.getElementById('printScore');
  const text = `${score} / 10 BE (MC)`;
  if (globalScoreText) globalScoreText.textContent = text;
  if (printScore) printScore.textContent = text;
}

// ==========================================================================
// 11. Klausur-Transferaufgaben & Freitext-Speicherung
// ==========================================================================

function initTransferTasks() {
  const taskIds = ['transferTask1Text', 'transferTask2Text', 'transferTask3Text'];
  const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSFER_TASKS) || '{}');

  taskIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    if (savedTasks[id]) el.value = savedTasks[id];

    el.addEventListener('input', () => {
      savedTasks[id] = el.value;
      localStorage.setItem(STORAGE_KEYS.TRANSFER_TASKS, JSON.stringify(savedTasks));
    });
  });

  // Musterlösung Toggle Buttons
  document.querySelectorAll('.toggle-sol-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const solId = btn.getAttribute('data-sol');
      const solBox = document.getElementById(solId);
      if (!solBox) return;

      const isHidden = solBox.classList.contains('hidden');
      solBox.classList.toggle('hidden', !isHidden);
      btn.textContent = isHidden ? '🙈 Musterlösung ausblenden' : '👁️ Musterlösung & Kriterien einblenden [5 BE]';
    });
  });
}

// ==========================================================================
// 12. Kompetenzraster (Ampel-System)
// ==========================================================================

function initCompetenceGrid() {
  const savedComps = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPETENCES) || '{}');

  document.querySelectorAll('.comp-row').forEach(row => {
    const cid = row.getAttribute('data-cid');
    const btns = row.querySelectorAll('.comp-btn');

    if (savedComps[cid]) {
      btns.forEach(b => {
        b.classList.toggle('selected', b.getAttribute('data-val') === savedComps[cid]);
      });
    }

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        savedComps[cid] = btn.getAttribute('data-val');
        localStorage.setItem(STORAGE_KEYS.COMPETENCES, JSON.stringify(savedComps));
      });
    });
  });
}

// ==========================================================================
// 13. PDF-Druck-Export & Portfolio
// ==========================================================================

function initPrintHandlers() {
  const printBtn = document.getElementById('printBtn');
  const genPortfolioBtn = document.getElementById('btnGeneratePortfolio');

  const triggerPrint = () => {
    // Sicherstellen, dass Name & Kurs im Header übertragen sind
    const nameInput = document.getElementById('studentNameInput');
    const courseInput = document.getElementById('studentCourseInput');
    const printName = document.getElementById('printName');
    const printCourse = document.getElementById('printCourse');
    const printDate = document.getElementById('printDate');

    if (printName) printName.textContent = nameInput.value || '(Kein Name eingegeben)';
    if (printCourse) printCourse.textContent = courseInput.value || '(Kein Kurs eingegeben)';
    if (printDate) printDate.textContent = new Date().toLocaleDateString('de-DE');

    window.print();
  };

  if (printBtn) printBtn.addEventListener('click', triggerPrint);
  if (genPortfolioBtn) genPortfolioBtn.addEventListener('click', triggerPrint);
}
