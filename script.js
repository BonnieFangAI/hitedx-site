const q = (selector, root = document) => root.querySelector(selector);
const qa = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ideas = {
  sofia: {
    idea: 'What if cities were designed for connection, not just efficiency?',
    person: 'Sofia',
    city: 'Stockholm',
    bio: 'I’m curious about how public spaces can help strangers become communities.',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&crop=face&w=700&q=84'
  },
  alex: {
    idea: 'Can technology actually make us feel less alone?',
    person: 'Alex',
    city: 'Stockholm',
    bio: 'I’m exploring whether technology can create more presence instead of more noise.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&crop=face&w=700&q=84'
  },
  maya: {
    idea: 'What would you do if failure wasn’t embarrassing?',
    person: 'Maya',
    city: 'Stockholm',
    bio: 'I’m interested in what people create when they feel safe enough to be unfinished.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&crop=face&w=700&q=84'
  }
};

const progress = q('.progress span');
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const menuButton = q('.menu-button');
const mobileNav = q('.mobile-nav');
menuButton.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.textContent = isOpen ? 'Close' : 'Menu';
});
qa('a', mobileNav).forEach((link) => link.addEventListener('click', () => {
  mobileNav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = 'Menu';
}));

const stageLinks = qa('[data-stage-link]');
qa('.site-header a[href^="#"]').forEach((link) => link.addEventListener('click', (event) => {
  const target = q(link.getAttribute('href'));
  if (!target) return;
  event.preventDefault();
  const root = document.documentElement;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, Math.max(0, target.offsetTop - q('[data-header]').offsetHeight));
  window.requestAnimationFrame(() => root.style.removeProperty('scroll-behavior'));
}));
const stages = qa('[data-stage]');
function updateActiveStage() {
  const marker = window.scrollY + q('[data-header]').offsetHeight + 4;
  const activeStage = [...stages].reverse().find((stage) => stage.offsetTop <= marker);
  stageLinks.forEach((link) => {
    const active = activeStage && link.dataset.stageLink === activeStage.dataset.stage;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', updateActiveStage, { passive: true });
updateActiveStage();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
qa('.reveal').forEach((element) => revealObserver.observe(element));

const toastElement = q('.toast');
function toast(message) {
  toastElement.textContent = message;
  toastElement.classList.add('show');
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => toastElement.classList.remove('show'), 2400);
}

const dialog = q('#idea-dialog');
const dialogViews = qa('[data-view]', dialog);
const progressSteps = qa('[data-progress]', dialog);
const sayHiButton = q('[data-say-hi]', dialog);
const sendButton = q('[data-send]', dialog);
const selectionHint = q('[data-selection-hint]', dialog);
let currentIdea = ideas.sofia;
let selectedMeeting = '';
let selectedTime = '';
let previousFocus = null;

function showView(name) {
  dialogViews.forEach((view) => { view.hidden = view.dataset.view !== name; });
  const step = name === 'idea' ? 1 : name === 'meet' ? 2 : 3;
  progressSteps.forEach((item, index) => item.classList.toggle('active', index < step));
  dialog.scrollTop = 0;
}

function populateIdea(idea) {
  q('[data-dialog-idea]', dialog).textContent = `“${idea.idea}”`;
  q('[data-person-name]', dialog).textContent = idea.person;
  q('[data-person-city]', dialog).textContent = idea.city;
  q('[data-person-bio]', dialog).textContent = idea.bio;
  q('[data-person-image]', dialog).src = idea.image;
  q('[data-person-image]', dialog).alt = `${idea.person} in ${idea.city}`;
  q('[data-match-name]', dialog).textContent = idea.person;
  q('[data-match-person]', dialog).textContent = idea.person;
  q('[data-match-image]', dialog).src = idea.image;
  q('[data-match-image]', dialog).alt = `${idea.person} in ${idea.city}`;
}

function updateInvitationState() {
  const ready = Boolean(selectedMeeting && selectedTime);
  sendButton.disabled = !ready;
  selectionHint.textContent = ready
    ? `${selectedMeeting} · ${selectedTime}`
    : 'Choose a meeting and a time.';
}

function resetExperience() {
  selectedMeeting = '';
  selectedTime = '';
  qa('[data-meeting], [data-time]', dialog).forEach((button) => button.setAttribute('aria-pressed', 'false'));
  sayHiButton.textContent = 'Say hi';
  sayHiButton.classList.remove('hi-sent');
  sendButton.innerHTML = 'Send invitation <span aria-hidden="true">→</span>';
  updateInvitationState();
  showView('idea');
}

function openIdea(id, trigger) {
  currentIdea = ideas[id] || ideas.sofia;
  previousFocus = trigger;
  resetExperience();
  populateIdea(currentIdea);
  dialog.showModal();
  document.body.classList.add('dialog-open');
  window.setTimeout(() => q('.dialog-close', dialog).focus(), 80);
}

function closeDialog() {
  if (dialog.open) dialog.close();
}

qa('[data-idea]').forEach((button) => button.addEventListener('click', () => {
  openIdea(button.dataset.idea, button);
}));

q('.dialog-close', dialog).addEventListener('click', closeDialog);
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) closeDialog();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  if (previousFocus) previousFocus.focus({ preventScroll: true });
});

sayHiButton.addEventListener('click', () => {
  const sent = sayHiButton.classList.toggle('hi-sent');
  sayHiButton.textContent = sent ? 'Hi sent ✓' : 'Say hi';
  toast(sent ? `YOU SAID HI TO ${currentIdea.person.toUpperCase()}.` : 'HI CANCELLED.');
});

q('[data-meet]', dialog).addEventListener('click', () => {
  showView('meet');
  window.setTimeout(() => q('[data-meeting]', dialog).focus(), 60);
});

q('[data-back]', dialog).addEventListener('click', () => {
  showView('idea');
  window.setTimeout(() => q('[data-meet]', dialog).focus(), 60);
});

qa('[data-meeting]', dialog).forEach((button) => button.addEventListener('click', () => {
  qa('[data-meeting]', dialog).forEach((item) => item.setAttribute('aria-pressed', 'false'));
  button.setAttribute('aria-pressed', 'true');
  selectedMeeting = button.dataset.meeting;
  updateInvitationState();
}));

qa('[data-time]', dialog).forEach((button) => button.addEventListener('click', () => {
  qa('[data-time]', dialog).forEach((item) => item.setAttribute('aria-pressed', 'false'));
  button.setAttribute('aria-pressed', 'true');
  selectedTime = button.dataset.time;
  updateInvitationState();
}));

sendButton.addEventListener('click', () => {
  if (!selectedMeeting || !selectedTime) return;
  sendButton.disabled = true;
  sendButton.textContent = 'Sending invitation…';
  q('[data-match-time]', dialog).textContent = selectedTime;
  q('[data-match-format]', dialog).textContent = selectedMeeting;
  const finish = () => {
    showView('match');
    window.setTimeout(() => q('[data-continue]', dialog).focus(), 80);
  };
  if (reducedMotion) finish();
  else window.setTimeout(finish, 620);
});

q('[data-continue]', dialog).addEventListener('click', () => {
  previousFocus = null;
  closeDialog();
  window.setTimeout(() => q('#why').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }), 100);
});

const eventDialog = q('#event-dialog');
const eventOpenButton = q('[data-open-event]');
const eventJoinButton = q('[data-join-event]', eventDialog);
const eventSponsorButton = q('[data-event-sponsor]', eventDialog);
let eventPreviousFocus = null;

function openEventDialog(trigger) {
  eventPreviousFocus = trigger;
  eventDialog.showModal();
  document.body.classList.add('dialog-open');
  window.setTimeout(() => q('.event-dialog-close', eventDialog).focus(), 80);
}

function closeEventDialog({ restoreFocus = true } = {}) {
  if (!restoreFocus) eventPreviousFocus = null;
  if (eventDialog.open) eventDialog.close();
}

eventOpenButton.addEventListener('click', () => openEventDialog(eventOpenButton));
q('.event-dialog-close', eventDialog).addEventListener('click', () => closeEventDialog());
eventDialog.addEventListener('click', (event) => {
  if (event.target === eventDialog) closeEventDialog();
});
eventDialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  if (eventPreviousFocus) eventPreviousFocus.focus({ preventScroll: true });
});

eventJoinButton.addEventListener('click', () => {
  const joined = eventJoinButton.getAttribute('aria-pressed') === 'true';
  eventJoinButton.setAttribute('aria-pressed', String(!joined));
  eventJoinButton.innerHTML = joined
    ? 'Join the guest list <span aria-hidden="true">→</span>'
    : 'You’re on the guest list <span aria-hidden="true">✓</span>';
  toast(joined ? 'GUEST-LIST REQUEST CANCELLED.' : 'YOU JOINED MÅNS’S GUEST LIST.');
});

const sponsorDialog = q('#sponsor-dialog');
const sponsorViews = qa('[data-sponsor-view]', sponsorDialog);
let sponsorPreviousFocus = null;
let sponsorReturnToEvent = false;

function showSponsorView(name) {
  sponsorViews.forEach((view) => { view.hidden = view.dataset.sponsorView !== name; });
  sponsorDialog.scrollTop = 0;
}

function setSponsorConfirmed(confirmed) {
  qa('[data-sponsor-brand]').forEach((brand) => { brand.hidden = !confirmed; });
  qa('[data-open-sponsor]').forEach((button) => {
    button.innerHTML = confirmed
      ? 'Venue sponsored <span aria-hidden="true">✓</span>'
      : 'Sponsor the venue <span aria-hidden="true">+</span>';
  });
  q('[data-event-venue]').textContent = confirmed ? 'Northline Bar · venue confirmed' : 'Venue partner needed';
  eventSponsorButton.innerHTML = confirmed
    ? 'Venue sponsored <span aria-hidden="true">✓</span>'
    : 'Sponsor the venue <span aria-hidden="true">+</span>';
  showSponsorView(confirmed ? 'success' : 'open');
}

qa('[data-open-sponsor]').forEach((button) => button.addEventListener('click', () => {
  sponsorPreviousFocus = button;
  sponsorReturnToEvent = false;
  showSponsorView(q('[data-sponsor-brand]').hidden ? 'open' : 'success');
  sponsorDialog.showModal();
  document.body.classList.add('dialog-open');
  window.setTimeout(() => q('.sponsor-dialog-close', sponsorDialog).focus(), 80);
}));

eventSponsorButton.addEventListener('click', () => {
  sponsorReturnToEvent = true;
  closeEventDialog({ restoreFocus: false });
  window.setTimeout(() => {
    sponsorPreviousFocus = eventSponsorButton;
    showSponsorView(q('[data-sponsor-brand]').hidden ? 'open' : 'success');
    sponsorDialog.showModal();
    document.body.classList.add('dialog-open');
    window.setTimeout(() => q('.sponsor-dialog-close', sponsorDialog).focus(), 80);
  }, 60);
});

q('.sponsor-dialog-close', sponsorDialog).addEventListener('click', () => sponsorDialog.close());
sponsorDialog.addEventListener('click', (event) => {
  if (event.target === sponsorDialog) sponsorDialog.close();
});
sponsorDialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  if (sponsorReturnToEvent) {
    sponsorReturnToEvent = false;
    sponsorPreviousFocus = null;
    window.setTimeout(() => openEventDialog(eventOpenButton), 60);
  } else if (sponsorPreviousFocus) {
    sponsorPreviousFocus.focus({ preventScroll: true });
  }
});

q('[data-confirm-sponsor]', sponsorDialog).addEventListener('click', () => {
  setSponsorConfirmed(true);
  toast('VENUE CONFIRMED · SPONSOR LOGO ADDED.');
});

q('[data-reset-sponsor]', sponsorDialog).addEventListener('click', () => {
  setSponsorConfirmed(false);
  toast('SPONSOR DEMO RESET.');
});

q('[data-view-sponsored-event]', sponsorDialog).addEventListener('click', () => {
  sponsorReturnToEvent = false;
  sponsorPreviousFocus = null;
  sponsorDialog.close();
  window.setTimeout(() => {
    const gatheringCard = q('[data-gathering-card]');
    gatheringCard.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    window.setTimeout(() => openEventDialog(eventOpenButton), reducedMotion ? 0 : 450);
  }, 100);
});
