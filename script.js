const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const q = (s, root = document) => root.querySelector(s);
const qa = (s, root = document) => [...root.querySelectorAll(s)];

const progress = q('.scroll-progress span');
const header = q('[data-nav]');
const themed = qa('[data-theme]');

function updateScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
  const probe = 80;
  let current = themed[0];
  themed.forEach((section) => {
    const box = section.getBoundingClientRect();
    if (box.top <= probe && box.bottom > probe) current = section;
  });
  header.classList.toggle('on-light', current && current.dataset.theme === 'light');
}
addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

const cursor = q('.cursor');
addEventListener('pointermove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});
qa('a,button,.idea-card,.post').forEach((item) => {
  item.addEventListener('pointerenter', () => cursor.classList.add('hot'));
  item.addEventListener('pointerleave', () => cursor.classList.remove('hot'));
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .09, rootMargin: '0px 0px -4% 0px' });
qa('.reveal').forEach((el) => revealObserver.observe(el));

const menuButton = q('.menu-toggle');
const mobileMenu = q('.mobile-menu');
menuButton.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
qa('a', mobileMenu).forEach((link) => link.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

function toast(message) {
  const el = q('.toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2600);
}

const eventGap = q('[data-gap]');
if (eventGap) {
  eventGap.addEventListener('pointermove', (event) => {
    const box = eventGap.getBoundingClientRect();
    const start = Math.max(0, event.clientX - box.left);
    eventGap.style.setProperty('--signal-x', Math.min(100, Math.max(0, start / box.width * 100)) + '%');
  });
  eventGap.addEventListener('pointerleave', () => eventGap.style.setProperty('--signal-x', '50%'));
  eventGap.addEventListener('click', () => toast('THIS IS WHERE HITEDX LIVES — BETWEEN THE EVENTS.'));
}

qa('.join-question').forEach((button) => button.addEventListener('click', () => {
  const card = button.closest('.idea-card');
  const count = q('[data-count-display]', card);
  const joined = button.classList.toggle('joined');
  const base = Number(card.dataset.count);
  count.textContent = String(base + (joined ? 1 : 0));
  button.firstChild.textContent = joined ? 'Joined ' : 'Join the conversation ';
  q('span', button).textContent = joined ? 'JOINED' : '+';
  toast(joined ? 'YOU ARE IN. STAY CURIOUS.' : 'YOU LEFT THE CONVERSATION.');
}));

const topics = {
  Technology: 'how technology changes human behaviour.',
  Culture: 'how culture shapes the stories we tell.',
  Business: 'whether business can create more than growth.',
  Society: 'how strangers can become a community.',
  Sustainability: 'what a truly liveable Stockholm could become.'
};
qa('[data-interest]').forEach((button) => button.addEventListener('click', () => {
  qa('[data-interest]').forEach((b) => b.classList.remove('active'));
  button.classList.add('active');
  q('[data-match-topic]').textContent = topics[button.dataset.interest];
}));
q('.match-button').addEventListener('click', (e) => {
  const button = e.currentTarget;
  button.innerHTML = 'MATCH FOUND <span class="status-mark">01</span>';
  toast('ONE UNEXPECTED CONVERSATION IS WAITING.');
});

qa('.challenge-card > button').forEach((button) => button.addEventListener('click', () => {
  const card = button.closest('.challenge-card');
  const active = card.classList.toggle('done');
  button.innerHTML = active ? 'CHALLENGE ACCEPTED <span class="status-mark">ON</span>' : 'I\'M IN <span class="ui-arrow" aria-hidden="true"></span>';
  toast(active ? 'SMALL ACTION. BIG CONVERSATION.' : 'CHALLENGE SAVED FOR LATER.');
}));

qa('[data-loop]').forEach((button) => button.addEventListener('click', () => {
  qa('[data-loop]').forEach((b) => b.classList.remove('active'));
  button.classList.add('active');
}));

const modal = q('.question-modal');
const textarea = q('#question');
q('[data-open-modal]').addEventListener('click', () => {
  modal.showModal();
  document.body.classList.add('modal-open');
  setTimeout(() => textarea.focus(), 100);
});
function closeModal() {
  modal.close();
  document.body.classList.remove('modal-open');
}
q('.modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
textarea.addEventListener('input', () => q('[data-char-count]').textContent = textarea.value.length + ' / 120');
q('[data-question-form]').addEventListener('submit', (e) => {
  e.preventDefault();
  const value = textarea.value.trim();
  if (!value) return;
  const post = document.createElement('article');
  post.className = 'post post-a visible';
  const clean = value.replace(/[<>]/g, '');
  post.innerHTML = '<span>NEW QUESTION</span><h3>“' + clean + '”</h3><p><b>1</b> curious mind · <b>just now</b></p>';
  q('[data-wall]').prepend(post);
  textarea.value = '';
  q('[data-char-count]').textContent = '0 / 120';
  closeModal();
  toast('YOUR QUESTION IS NOW ON THE WALL.');
});

const counters = qa('[data-counter]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.counter);
    if (reduced) { el.textContent = target; return; }
    let start = 0;
    const begun = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - begun) / 1100);
      el.textContent = Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: .6 });
counters.forEach((el) => counterObserver.observe(el));

const canvas = q('#signal-canvas');
const ctx = canvas.getContext('2d');
let dots = [];
function resizeCanvas() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = innerWidth < 700 ? 18 : 34;
  dots = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.clientWidth,
    y: Math.random() * canvas.clientHeight,
    vx: (Math.random() - .5) * .16,
    vy: (Math.random() - .5) * .16
  }));
}
function draw() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  dots.forEach((d, i) => {
    d.x += d.vx; d.y += d.vy;
    if (d.x < 0 || d.x > w) d.vx *= -1;
    if (d.y < 0 || d.y > h) d.vy *= -1;
    ctx.fillStyle = i % 7 === 0 ? '#eb0028' : 'rgba(255,255,255,.5)';
    ctx.beginPath(); ctx.arc(d.x, d.y, i % 7 === 0 ? 2.6 : 1.3, 0, Math.PI * 2); ctx.fill();
    dots.slice(i + 1).forEach((o) => {
      const dx = d.x - o.x, dy = d.y - o.y, dist = Math.hypot(dx, dy);
      if (dist < 145) {
        ctx.strokeStyle = 'rgba(255,255,255,' + (.12 * (1 - dist / 145)) + ')';
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(o.x, o.y); ctx.stroke();
      }
    });
  });
  if (!reduced) requestAnimationFrame(draw);
}
resizeCanvas();
addEventListener('resize', resizeCanvas);
draw();
