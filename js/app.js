function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

// Partículas flutuantes de fundo
(function criarParticulas() {
  const container = document.getElementById('particles');
  const emojis = ['❤️', '💕', '💖', '💗', '🌹', '✨'];

  for (let i = 0; i < 18; i++) {
    const el = document.createElement('span');
    el.classList.add('heart-particle');
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.setProperty('--x', randomBetween(2, 98) + '%');
    el.style.setProperty('--dur', randomBetween(5, 11) + 's');
    el.style.setProperty('--delay', randomBetween(0, 10) + 's');
    container.appendChild(el);
  }
})();

// Botão "Não" — foge do cursor/toque
(function configurarBotaoNao() {
  const btn     = document.getElementById('btn-nao');
  const wrapper = document.querySelector('.botoes-wrapper');
  const msg     = document.getElementById('msg-deboche');

  const frases = [
    'Ei, para com isso! 😤',
    'Não vou deixar você clicar... 😏',
    'Tá achando o quê? 🙅',
    'Aqui não! 💨',
    'Vim de longe pra escapar! 🏃',
    'Impossível me pegar! ✌️',
  ];

  let fugidas = 0;

  // Posição inicial do botão (centro-direita dentro do wrapper)
  let posX = null;
  let posY = null;

  function inicializarPosicao() {
    const wRect = wrapper.getBoundingClientRect();
    // Começa um pouco à direita do centro
    posX = wRect.width * 0.65;
    posY = wRect.height * 0.5;
    aplicarPosicao();
  }

  function aplicarPosicao() {
    btn.style.left      = posX + 'px';
    btn.style.top       = posY + 'px';
    btn.style.transform = 'translate(-50%, -50%)';
  }

  function escapar(clientX, clientY) {
    const wRect = wrapper.getBoundingClientRect();

    // Limites seguros (meio botão + 8px de margem das bordas)
    const mX = btn.offsetWidth  / 2 + 8;
    const mY = btn.offsetHeight / 2 + 8;

    // Inicializa posição se ainda não foi definida
    if (posX === null) inicializarPosicao();

    // Vetor do cursor até o botão (fuga na direção oposta ao cursor)
    const dx = (clientX - wRect.left) - posX;
    const dy = (clientY - wRect.top)  - posY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const velocidade = Math.min(wRect.width, wRect.height) * 0.35;
    posX = clamp(posX - (dx / dist) * velocidade, mX, wRect.width  - mX);
    posY = clamp(posY - (dy / dist) * velocidade, mY, wRect.height - mY);

    aplicarPosicao();

    // Mensagem de deboche
    msg.textContent = frases[fugidas % frases.length];
    msg.classList.add('visivel');
    fugidas++;
  }

  btn.addEventListener('mouseenter', e => escapar(e.clientX, e.clientY));
  btn.addEventListener('mousemove',  e => escapar(e.clientX, e.clientY));

  btn.addEventListener('touchstart', function(e) {
    const t = e.touches[0];
    escapar(t.clientX, t.clientY);
    e.preventDefault();
  }, { passive: false });

  // Inicializa posição assim que o DOM carregar
  window.addEventListener('load', inicializarPosicao);
  window.addEventListener('resize', inicializarPosicao);
})();

// Botão "Sim" → abre tela de agendamento
document.getElementById('btn-sim').addEventListener('click', function () {
  document.getElementById('tela-pergunta').style.display = 'none';
  document.getElementById('tela-encontro').classList.add('ativa');
});

// Botão "Marcar" → valida e exibe confirmação
document.getElementById('btn-marcar').addEventListener('click', function () {
  const data = document.getElementById('campo-data').value;
  const hora = document.getElementById('campo-hora').value;

  if (!data || !hora) {
    alert('Por favor, preencha a data e o horário! 📅');
    return;
  }

  const dataObj = new Date(data + 'T' + hora);
  const dataFmt = dataObj.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const horaFmt = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  document.getElementById('tela-encontro').classList.remove('ativa');
  document.getElementById('confirmacao-data').textContent = dataFmt;
  document.getElementById('confirmacao-hora').textContent = horaFmt;
  document.getElementById('tela-confirmacao').classList.add('ativa');

  // Configura botão WhatsApp com a mensagem pronta
  const NUMERO = '5511983230652';
  const msgWpp = encodeURIComponent(`Oi! \n\nQuero marcar nosso encontro para:\n\n ${dataFmt}\n ${horaFmt}\n\nO que você acha?`);
  document.getElementById('btn-whatsapp').onclick = function () {
    window.open(`https://wa.me/${NUMERO}?text=${msgWpp}`, '_blank');
  };
});

// Define data mínima como hoje
(function () {
  const hoje = new Date();
  const yyyy = hoje.getFullYear();
  const mm   = String(hoje.getMonth() + 1).padStart(2, '0');
  const dd   = String(hoje.getDate()).padStart(2, '0');
  document.getElementById('campo-data').min = `${yyyy}-${mm}-${dd}`;
})();
