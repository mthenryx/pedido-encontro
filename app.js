/* =====================
   CORAÇÕES FLUTUANTES NO FUNDO
===================== */
(function spawnHearts() {
  const container  = document.getElementById('hearts-bg');
  const symbols    = ['🤍','🧡','❤️','💕','💗','💓','💖','💝'];
  const darkSymbols = ['♥','❤'];

  function makeHeart() {
    const el = document.createElement('span');
    el.className = 'bg-heart';

    const isDark = Math.random() < 0.5;
    el.textContent = isDark
      ? darkSymbols[Math.floor(Math.random() * darkSymbols.length)]
      : symbols[Math.floor(Math.random() * symbols.length)];

    if (isDark) {
      el.style.color    = '#8b1a1a';
      el.style.fontSize = (Math.random() * 18 + 12) + 'px';
    } else {
      el.style.fontSize = (Math.random() * 14 + 10) + 'px';
    }

    el.style.left             = (Math.random() * 100) + 'vw';
    const dur                 = (Math.random() * 8 + 6);
    el.style.animationDuration = dur + 's';
    el.style.animationDelay   = (Math.random() * dur) + 's';

    container.appendChild(el);
    setTimeout(() => el.remove(), (dur + 2) * 1000);
  }

  // Spawna 20 corações iniciais e depois um a cada 600ms
  for (let i = 0; i < 20; i++) makeHeart();
  setInterval(makeHeart, 600);
})();


/* =====================
   GERENCIAMENTO DE TELAS
===================== */
let currentVibe = null;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}


/* =====================
   TELA 1 — BOTÃO "NÃO" QUE FOGE
===================== */
(function setupNoButton() {
  const noBtn = document.getElementById('btn-no');
  const app   = document.getElementById('app');

  const msgs = [
    'Tem certeza? 😢',
    'Pensa melhor 🥺',
    'Você clicou errado 😅',
    'Nem tenta 😂',
    'Essa opção não funciona ❤️',
    'Ei, não faz isso! 🙈',
    'Não é por aqui... 💔',
    'Tenta de novo 🥰',
  ];
  let msgIdx = 0;

  /* Posiciona o botão NÃO ao lado do botão SIM */
  function initNoBtn() {
    const yesRect = document.getElementById('btn-yes').getBoundingClientRect();
    noBtn.style.position = 'fixed';
    noBtn.style.left     = (yesRect.right + 16) + 'px';
    noBtn.style.top      = yesRect.top + 'px';
  }
  setTimeout(initNoBtn, 100);
  window.addEventListener('resize', initNoBtn);

  /* Lógica de fuga: move o botão para longe do cursor/dedo */
  function flee(cx, cy) {
    const appRect = app.getBoundingClientRect();
    const nRect   = noBtn.getBoundingClientRect();
    const nCx     = nRect.left + nRect.width  / 2;
    const nCy     = nRect.top  + nRect.height / 2;

    // Vetor apontando para longe do cursor
    let dx = nCx - cx;
    let dy = nCy - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    dx = (dx / dist) * 180;
    dy = (dy / dist) * 180;

    // Garante que o botão fique dentro dos limites do card
    const pad = 10;
    let nx = Math.max(appRect.left  + pad, Math.min(appRect.right  - nRect.width  - pad, nRect.left + dx));
    let ny = Math.max(appRect.top   + pad, Math.min(appRect.bottom - nRect.height - pad, nRect.top  + dy));

    noBtn.style.left = nx + 'px';
    noBtn.style.top  = ny + 'px';

    // Exibe mensagem engraçada
    document.getElementById('fun-msg').textContent = msgs[msgIdx % msgs.length];
    msgIdx++;
  }

  // Desktop — detecção por proximidade do mouse
  document.addEventListener('mousemove', e => {
    const nRect = noBtn.getBoundingClientRect();
    const dist  = Math.hypot(e.clientX - (nRect.left + nRect.width / 2), e.clientY - (nRect.top + nRect.height / 2));
    if (dist < 80) flee(e.clientX, e.clientY);
  });

  // Mobile — detecção por proximidade do toque
  document.addEventListener('touchmove', e => {
    const t     = e.touches[0];
    const nRect = noBtn.getBoundingClientRect();
    const dist  = Math.hypot(t.clientX - (nRect.left + nRect.width / 2), t.clientY - (nRect.top + nRect.height / 2));
    if (dist < 100) flee(t.clientX, t.clientY);
  }, { passive: true });

  // Caso o clique/toque chegue ao botão — foge mesmo assim
  noBtn.addEventListener('click', e => { e.preventDefault(); flee(e.clientX, e.clientY); });
  noBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    flee(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
})();

/* Navega para a tela de vibes */
function goToVibe() {
  showScreen('screen-vibe');
  buildVibes();
}


/* =====================
   TELA 2 — ESCOLHA DE VIBE
===================== */
const VIBES = [
  { emoji: '🍔', label: 'Hambúrguer' },
  { emoji: '🍣', label: 'Sushi'      },
  { emoji: '🍝', label: 'Massas'     },
  { emoji: '🌮', label: 'Tacos'      },
  { emoji: '🍕', label: 'Pizza'      },
  { emoji: '☕', label: 'Café'        },
  { emoji: '🍨', label: 'Sorvete'    },
  { emoji: '🎬', label: 'Cinema'     },
  { emoji: '🌳', label: 'Parque'     },
];

function buildVibes() {
  const grid = document.getElementById('vibes-grid');
  if (grid.children.length) return; // evita duplicar os cards

  VIBES.forEach(v => {
    const card = document.createElement('div');
    card.className = 'vibe-card';
    card.innerHTML = `<span class="vibe-emoji">${v.emoji}</span><span>${v.label}</span>`;

    card.addEventListener('click', () => {
      document.querySelectorAll('.vibe-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      currentVibe = v;
      document.getElementById('btn-vibe-next').disabled = false;
    });

    grid.appendChild(card);
  });
}

/* Navega para a tela de data */
function goToDate() {
  if (!currentVibe) return;
  showScreen('screen-date');

  // Define data mínima como hoje
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('pick-date').min = today;
}


/* =====================
   TELA 3 — SELEÇÃO DE DATA E HORA
===================== */
function goToSummary() {
  const dateVal = document.getElementById('pick-date').value;
  const timeVal = document.getElementById('pick-time').value;

  if (!dateVal) { alert('Escolha uma data 😉'); return; }

  // Formata a data de forma legível
  const [y, m, d] = dateVal.split('-');
  const months    = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const niceDate  = `${d} de ${months[parseInt(m) - 1]} de ${y}`;

  // Formata o horário
  const [h, min] = timeVal.split(':');
  const niceTime  = `${h}h${min}`;

  // Preenche o resumo
  document.getElementById('sum-vibe-icon').textContent = currentVibe.emoji;
  document.getElementById('sum-vibe-name').textContent = currentVibe.label;
  document.getElementById('sum-date').textContent      = niceDate;
  document.getElementById('sum-time').textContent      = niceTime;

  showScreen('screen-summary');
}


/* =====================
   TELA 5 — CELEBRAÇÃO + CONFETE
===================== */
function celebrate() {
  showScreen('screen-celebrate');
  launchConfetti();
}

function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  canvas.style.display = 'block';
  const ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6','#ff69b4','#fff'];
  const pieces = [];

  // Cria 120 pedaços de confete
  for (let i = 0; i < 120; i++) {
    pieces.push({
      x:        Math.random() * canvas.width,
      y:        -20 - Math.random() * 300,
      r:        Math.random() * 9 + 4,
      color:    COLORS[Math.floor(Math.random() * COLORS.length)],
      speed:    Math.random() * 4 + 2,
      swing:    Math.random() * 3 - 1.5,
      rot:      Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.12,
      isHeart:  Math.random() < 0.15,
    });
  }

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(p => {
      if (p.isHeart) {
        ctx.font = `${p.r * 3}px serif`;
        ctx.fillText('❤️', p.x, p.y);
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.4);
        ctx.restore();
      }

      // Física simples
      p.y   += p.speed;
      p.x   += p.swing;
      p.rot += p.rotSpeed;
    });

    frame++;
    if (frame < 220) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
    }
  }

  draw();
}