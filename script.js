/* ============================================================
   ANTIGRAVITY TSP SOLVER — JAVASCRIPT
   ============================================================ */

// ─── Starfield ──────────────────────────────────────────────
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  const STAR_COUNT = 420;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      alpha: Math.random(),
      dAlpha: (Math.random() - 0.5) * 0.008,
      speed: Math.random() * 0.15 + 0.02,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      s.alpha += s.dAlpha;
      if (s.alpha <= 0.1 || s.alpha >= 1) s.dAlpha *= -1;
      s.y += s.speed;
      if (s.y > canvas.height + 4) {
        s.y = -4;
        s.x = Math.random() * canvas.width;
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.alpha.toFixed(2)})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ─── Floating Nodes / Planets ───────────────────────────────
(function initNodes() {
  const canvas = document.getElementById('nodes-canvas');
  const ctx = canvas.getContext('2d');
  let nodes = [];
  const NODE_COUNT = 14;
  const CONNECT_DIST = 220;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const palette = [
    { r: 180, g: 74, b: 255 },   // purple
    { r: 0, g: 240, b: 255 },    // cyan
    { r: 61, g: 122, b: 255 },   // blue
    { r: 255, g: 74, b: 220 },   // pink
  ];

  for (let i = 0; i < NODE_COUNT; i++) {
    const col = palette[i % palette.length];
    nodes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 8 + 4,
      color: col,
      glowSize: Math.random() * 20 + 15,
      phase: Math.random() * Math.PI * 2,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(180,74,255,${alpha.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    const time = Date.now() * 0.001;

    // Draw nodes
    for (const n of nodes) {
      // Float motion
      n.x += n.vx;
      n.y += n.vy;
      // Gentle bob
      const bobY = Math.sin(time + n.phase) * 0.4;
      n.y += bobY;

      // Bounce off edges
      if (n.x < -20) n.vx = Math.abs(n.vx);
      if (n.x > canvas.width + 20) n.vx = -Math.abs(n.vx);
      if (n.y < -20) n.vy = Math.abs(n.vy);
      if (n.y > canvas.height + 20) n.vy = -Math.abs(n.vy);

      // Glow
      const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.glowSize);
      glow.addColorStop(0, `rgba(${n.color.r},${n.color.g},${n.color.b},0.35)`);
      glow.addColorStop(1, `rgba(${n.color.r},${n.color.g},${n.color.b},0)`);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.glowSize, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${n.color.r},${n.color.g},${n.color.b},0.9)`;
      ctx.fill();

      // Bright center
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,0.7)`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

// ─── Counter Animations ────────────────────────────────────
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const step = Math.ceil(target / 60);
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    el.textContent = current.toLocaleString() + suffix;
  }, 25);
}

// Start counters when hero is visible
const heroObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCounter(document.getElementById('stat-nodes'), 12847);
        animateCounter(document.getElementById('stat-time'), 42, 'ms');
        heroObserver.disconnect();
      }
    });
  },
  { threshold: 0.4 }
);
heroObserver.observe(document.getElementById('hero'));

// ─── Scroll Reveal ─────────────────────────────────────────
document.querySelectorAll(
  '.about-card, .step, .approach-code, .feature-card'
).forEach((el) => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ─── Launch Solver (Modal) ──────────────────────────────────
function launchSolver() {
  document.getElementById('solver-modal').classList.add('active');
  document.getElementById('solver-result').classList.remove('show');
  document.getElementById('solver-result').innerHTML = '';
}

function closeSolverModal() {
  document.getElementById('solver-modal').classList.remove('active');
}

function closeModal(event) {
  if (event.target === event.currentTarget) closeSolverModal();
}

// ─── TSP Solver (Held-Karp DP) ──────────────────────────────
function solveTSP() {
  const raw = document.getElementById('matrix-input').value.trim();
  const resultEl = document.getElementById('solver-result');

  if (!raw) {
    showResult(resultEl, '⚠ Please enter a distance matrix.', true);
    return;
  }

  try {
    const rows = raw.split('\n').map((line) =>
      line.split(',').map((v) => {
        const num = Number(v.trim());
        if (isNaN(num)) throw new Error('Non-numeric value detected.');
        return num;
      })
    );

    const n = rows.length;
    if (n < 2 || n > 20) throw new Error('Matrix must be 2–20 cities.');
    for (const row of rows) {
      if (row.length !== n) throw new Error('Matrix must be square (n × n).');
    }

    // Held-Karp DP
    const ALL = (1 << n) - 1;
    const INF = Number.MAX_SAFE_INTEGER;
    const dp = Array.from({ length: 1 << n }, () => new Array(n).fill(INF));
    const parent = Array.from({ length: 1 << n }, () => new Array(n).fill(-1));
    dp[1][0] = 0;

    for (let S = 1; S <= ALL; S++) {
      for (let j = 0; j < n; j++) {
        if (!(S & (1 << j))) continue;
        if (dp[S][j] === INF) continue;
        for (let k = 0; k < n; k++) {
          if (S & (1 << k)) continue;
          const NS = S | (1 << k);
          const cost = dp[S][j] + rows[j][k];
          if (cost < dp[NS][k]) {
            dp[NS][k] = cost;
            parent[NS][k] = j;
          }
        }
      }
    }

    // Find minimum tour cost
    let best = INF;
    let lastCity = -1;
    for (let i = 0; i < n; i++) {
      const total = dp[ALL][i] + rows[i][0];
      if (total < best) {
        best = total;
        lastCity = i;
      }
    }

    // Reconstruct path
    const path = [];
    let mask = ALL;
    let cur = lastCity;
    while (cur !== -1) {
      path.push(cur);
      const prev = parent[mask][cur];
      mask ^= 1 << cur;
      cur = prev;
    }
    path.reverse();
    path.push(0); // close the loop

    const pathStr = path.map((c) => `City ${c}`).join(' → ');
    showResult(
      resultEl,
      `✅ <strong>Optimal Tour Cost:</strong> <span style="color:var(--neon-cyan)">${best}</span>\n\n` +
        `🗺️ <strong>Route:</strong> ${pathStr}\n` +
        `📐 <strong>Cities:</strong> ${n}   |   <strong>States evaluated:</strong> ${(1 << n).toLocaleString()}`,
      false
    );
  } catch (err) {
    showResult(resultEl, `❌ ${err.message}`, true);
  }
}

function showResult(el, html, isError) {
  el.innerHTML = html.replace(/\n/g, '<br>');
  el.classList.add('show');
  if (isError) {
    el.style.borderColor = 'rgba(255,74,100,0.3)';
    el.style.background = 'rgba(255,74,100,0.06)';
  } else {
    el.style.borderColor = 'rgba(0,240,255,0.15)';
    el.style.background = 'rgba(0,240,255,0.05)';
  }
}

// ─── Navbar scroll shadow ───────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 60) {
    nav.style.background = 'rgba(5,5,15,0.88)';
  } else {
    nav.style.background = 'rgba(5,5,15,0.6)';
  }
});
