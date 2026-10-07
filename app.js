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
  initSugarRingInteractive();
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
  gelType: 'gelatine',
  showWater: true,
  showHBonds: true,
  chains: [],
  waterParticles: []
};

function initSolGelSimulator() {
  const canvas = document.getElementById('solGelCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const tempSlider = document.getElementById('tempSlider');
  const tempDisplay = document.getElementById('tempDisplay');
  const gelTypeRadios = document.querySelectorAll('input[name="gelType"]');
  const toggleWaterBtn = document.getElementById('toggleWaterBtn');
  const toggleHBondsBtn = document.getElementById('toggleHBondsBtn');

  // Initialisiere Polymerketten & Wassermoleküle
  initSimParticles(canvas.width, canvas.height);

  // Event Listener
  tempSlider.addEventListener('input', (e) => {
    simState.temperature = parseInt(e.target.value, 10);
    tempDisplay.textContent = `${simState.temperature} °C`;
    updateSimDashboard();
  });

  gelTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      simState.gelType = e.target.value;
      document.querySelectorAll('.radio-pill').forEach(pill => {
        pill.classList.toggle('active', pill.querySelector('input').checked);
      });
      updateSimDashboard();
    });
  });

  toggleWaterBtn.addEventListener('click', () => {
    simState.showWater = !simState.showWater;
    toggleWaterBtn.classList.toggle('active', simState.showWater);
  });

  toggleHBondsBtn.addEventListener('click', () => {
    simState.showHBonds = !simState.showHBonds;
    toggleHBondsBtn.classList.toggle('active', simState.showHBonds);
  });

  // Start Animation Loop
  function render() {
    updateAndDrawSimulation(ctx, canvas.width, canvas.height);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
  updateSimDashboard();
}

function initSimParticles(width, height) {
  simState.chains = [];
  const numChains = 7;
  const nodesPerChain = 9;

  for (let c = 0; c < numChains; c++) {
    const chain = [];
    const startX = 60 + (c % 3) * 160 + (Math.random() - 0.5) * 40;
    const startY = 50 + Math.floor(c / 3) * 130 + (Math.random() - 0.5) * 30;

    for (let n = 0; n < nodesPerChain; n++) {
      chain.push({
        x: startX + n * 18 + (Math.random() - 0.5) * 10,
        y: startY + (Math.random() - 0.5) * 20,
        baseX: startX + n * 18,
        baseY: startY,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      });
    }
    simState.chains.push(chain);
  }

  // Wassermoleküle
  simState.waterParticles = [];
  for (let i = 0; i < 70; i++) {
    simState.waterParticles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5
    });
  }
}

function updateSimDashboard() {
  const phaseDisplay = document.getElementById('phaseDisplay');
  const viscosityBar = document.getElementById('viscosityBar');
  const waterMobilityDisplay = document.getElementById('waterMobilityDisplay');
  const expTitle = document.getElementById('simExplanationTitle');
  const expText = document.getElementById('simExplanationText');

  const T = simState.temperature;
  const isGelatine = simState.gelType === 'gelatine';

  // Schmelzpunkt Gelatine: ca. 35 °C; Polysaccharid: ca. 65 °C
  const meltTemp = isGelatine ? 35 : 65;
  const isGel = T < meltTemp;

  if (isGel) {
    phaseDisplay.textContent = 'Elastisches GEL (Netzwerk stabil)';
    phaseDisplay.className = 'metric-value phase-gel';
    const visc = Math.max(20, Math.min(95, 95 - (T / meltTemp) * 40));
    viscosityBar.style.width = `${visc}%`;
    waterMobilityDisplay.textContent = 'Gering (in Maschen immobilisiert)';

    if (isGelatine) {
      expTitle.textContent = `Gelatine-Netzwerk bei ${T} °C`;
      expText.textContent = 'Polypeptidketten sind partiell verknüpft. Das 3D-Maschenwerk hält Wassermoleküle über Wasserstoffbrücken fest.';
    } else {
      expTitle.textContent = `Polysaccharid-Netzwerk bei ${T} °C`;
      expText.textContent = 'Polysaccharidketten bilden durch Quervernetzungen ein kontinuierliches Gitter, das Wassermoleküle in den Maschen immobilisiert.';
    }
  } else {
    phaseDisplay.textContent = 'Flüssiges SOL (Ketten frei beweglich)';
    phaseDisplay.className = 'metric-value phase-sol';
    const visc = Math.max(10, Math.min(30, 30 - ((T - meltTemp) / 30) * 15));
    viscosityBar.style.width = `${visc}%`;
    waterMobilityDisplay.textContent = 'Hoch (freie Diffusion / Brownsche Bewegung)';

    if (isGelatine) {
      expTitle.textContent = `Gelatine im Sol-Zustand bei ${T} °C`;
      expText.textContent = 'Durch die thermische kinetische Energie haben sich die Verknüpfungsknoten gelöst. Die Polypeptidketten gleiten frei aneinander vorbei (Sol-Zustand).';
    } else {
      expTitle.textContent = `Polysaccharid im Sol-Zustand bei ${T} °C`;
      expText.textContent = 'Bei höherer Temperatur löst sich das Netzwerk auf und die Makromoleküle liegen frei beweglich in Lösung vor.';
    }
  }
}

function updateAndDrawSimulation(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);

  const T = simState.temperature;
  const isGelatine = simState.gelType === 'gelatine';
  const meltTemp = isGelatine ? 35 : 65;
  const isGel = T < meltTemp;

  const thermalJitter = 0.2 + (T / 90) * 2.0;

  // 1. Polymerketten aktualisieren & zeichnen
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  simState.chains.forEach((chain, cIdx) => {
    // Knotenpunkte bewegen
    chain.forEach(node => {
      if (isGel) {
        // Im Gel: Schwaches Oszillieren um Basisposition
        node.x += (Math.random() - 0.5) * thermalJitter;
        node.y += (Math.random() - 0.5) * thermalJitter;
        node.x += (node.baseX - node.x) * 0.05;
        node.y += (node.baseY - node.y) * 0.05;
      } else {
        // Im Sol: Freie Knäuel-Bewegung
        node.x += node.vx * (1 + T / 30);
        node.y += node.vy * (1 + T / 30);
        if (node.x < 20 || node.x > width - 20) node.vx *= -1;
        if (node.y < 20 || node.y > height - 20) node.vy *= -1;
      }
    });

    // Kette zeichnen
    ctx.beginPath();
    ctx.moveTo(chain[0].x, chain[0].y);
    for (let i = 1; i < chain.length; i++) {
      ctx.lineTo(chain[i].x, chain[i].y);
    }
    ctx.strokeStyle = isGelatine ? '#38bdf8' : '#4ade80';
    ctx.stroke();

    // Monomer-Knoten zeichnen
    chain.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = isGelatine ? '#0284c7' : '#16a34a';
      ctx.fill();
    });
  });

  // 2. Wasserstoffbrückenbindungen (H-Brücken) zwischen benachbarten Ketten im Gel
  if (simState.showHBonds && isGel) {
    ctx.setLineDash([3, 4]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#f59e0b'; // Amber H-Brücke

    for (let c1 = 0; c1 < simState.chains.length; c1++) {
      for (let c2 = c1 + 1; c2 < simState.chains.length; c2++) {
        const n1 = simState.chains[c1][Math.floor(simState.chains[c1].length / 2)];
        const n2 = simState.chains[c2][Math.floor(simState.chains[c2].length / 2)];
        const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);

        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.stroke();

          // H-Brücken Symbolpunkt in der Mitte
          ctx.beginPath();
          ctx.arc((n1.x + n2.x) / 2, (n1.y + n2.y) / 2, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
        }
      }
    }
    ctx.setLineDash([]);
  }

  // 3. Wassermoleküle
  if (simState.showWater) {
    simState.waterParticles.forEach(w => {
      const speed = isGel ? (0.2 + (T / 90) * 0.8) : (1.0 + (T / 90) * 3.0);
      w.x += w.vx * speed;
      w.y += w.vy * speed;

      if (w.x < 10) { w.x = 10; w.vx *= -1; }
      if (w.x > width - 10) { w.x = width - 10; w.vx *= -1; }
      if (w.y < 10) { w.y = 10; w.vy *= -1; }
      if (w.y > height - 10) { w.y = height - 10; w.vy *= -1; }

      // Kleines Wassermolekül (Sauerstoff blau, 2 Wasserstoffe)
      ctx.beginPath();
      ctx.arc(w.x, w.y, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = isGel ? 'rgba(56, 189, 248, 0.7)' : 'rgba(56, 189, 248, 0.4)';
      ctx.fill();
    });
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
// 9. D-Glucose: Ringschluss & Haworth-Projektion
// ==========================================================================

const SUGAR_SVGS = {
  fischer: `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 0.5rem;">
      <div class="struct-img-wrapper" style="max-width: 220px; padding: 0.75rem; margin-bottom: 0;">
        <img src="assets/glucose_fischer_projektion.png" alt="D-Glucose in Fischer-Projektion" class="struct-img" style="max-height: 220px;">
      </div>
      <div style="font-size: 0.92rem; font-weight: 700; color: var(--color-primary);">D-Glucose in Fischer-Projektion (offenkettige Aldohexose)</div>
      <div style="font-size: 0.82rem; color: var(--color-text-muted); text-align: center; max-width: 480px;">
        C1: Aldehydgruppe • C2–C5: Asymmetrische C-Atome • C5-OH rechts (D-Konfiguration, Ta-Ba-Ta-Ta)
      </div>
    </div>
  `,
  haworthAlpha: `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 0.5rem;">
      <div class="struct-img-wrapper" style="max-width: 280px; padding: 0.75rem; margin-bottom: 0;">
        <img src="assets/glucose_haworth_alpha.png" alt="α-D-Glucopyranose in Haworth-Projektion" class="struct-img" style="max-height: 180px;">
      </div>
      <div style="font-size: 0.92rem; font-weight: 700; color: var(--color-accent);">α-D-Glucopyranose (Haworth-Ringform)</div>
      <div style="font-size: 0.82rem; color: var(--color-text-muted); text-align: center; max-width: 480px;">
        Intramolekularer Halbacetal-Ringschluss (Sechsring / Pyranose) • C1-anomere OH-Gruppe zeigt nach UNTEN (trans zu C6-CH₂OH) • Monomerer Baustein von Stärke (Amylose & Amylopektin)
      </div>
    </div>
  `,
  haworthBeta: `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 0.5rem;">
      <div class="struct-img-wrapper" style="max-width: 280px; padding: 0.75rem; margin-bottom: 0;">
        <img src="assets/glucose_haworth_beta.png" alt="β-D-Glucopyranose in Haworth-Projektion" class="struct-img" style="max-height: 180px;">
      </div>
      <div style="font-size: 0.92rem; font-weight: 700; color: var(--color-primary);">β-D-Glucopyranose (Haworth-Ringform)</div>
      <div style="font-size: 0.82rem; color: var(--color-text-muted); text-align: center; max-width: 480px;">
        C1-anomere OH-Gruppe zeigt nach OBEN (cis zu C6-CH₂OH) • Thermodynamisch begünstigte Form (ca. 64 % im Lösungsgleichgewicht) • Baustein von Cellulose
      </div>
    </div>
  `
};

function initSugarRingInteractive() {
  const container = document.getElementById('sugarDiagramContainer');
  const btnFischer = document.getElementById('btnShowFischer');
  const btnAlpha = document.getElementById('btnShowHaworthAlpha');
  const btnBeta = document.getElementById('btnShowHaworthBeta');

  if (!container) return;

  function showSugar(type) {
    container.innerHTML = SUGAR_SVGS[type] || '';
    btnFischer.classList.toggle('active', type === 'fischer');
    btnAlpha.classList.toggle('active', type === 'haworthAlpha');
    btnBeta.classList.toggle('active', type === 'haworthBeta');
  }

  btnFischer.addEventListener('click', () => showSugar('fischer'));
  btnAlpha.addEventListener('click', () => showSugar('haworthAlpha'));
  btnBeta.addEventListener('click', () => showSugar('haworthBeta'));

  showSugar('fischer');
}

// ==========================================================================
// 10. Diagnose-Quiz & Bildungsplan-Auswertung (10 BE)
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
