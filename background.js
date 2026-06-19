// Particle Background System

// ─── Guard: Doppelter Lauf verhindern ────────────────────────────────────────
if (window._particleAnimId != null) {
  cancelAnimationFrame(window._particleAnimId);
  window._particleAnimId = null;
}
const _existingCanvas = document.getElementById('particles');
if (_existingCanvas) _existingCanvas.remove();

// ─── Viewport-Größe ───────────────────────────────────────────────────────────
function getViewportSize() {
  return {
    width:  document.documentElement.clientWidth,
    height: document.documentElement.clientHeight
  };
}

// ─── Konfiguration ────────────────────────────────────────────────────────────
const isMobile = getViewportSize().width < 768;
const particleConfig = {
  count:     isMobile ?  80 : 180,
  color:     'rgba(136, 136, 136, 0.5)',
  minSize:   isMobile ? 0.3 : 0.7,
  maxSize:   isMobile ? 1.8 : 2.8,
  minSpeed:  isMobile ? -0.2 : -0.3,
  maxSpeed:  isMobile ?  0.2 :  0.3,
  lineWidth: isMobile ? 0.7 : 0.8,
  maxDistance: 0, // wird dynamisch berechnet (siehe updateMaxDistance)
  lineColor: 'rgba(85, 85, 85, {opacity})'
};

// ─── Dynamische Verbindungsdistanz ───────────────────────────────────────────
// Kernproblem: Ein fester maxDistance-Wert erzeugt auf kleinen Canvas-Flächen
// (z.B. Querformat) eine viel zu hohe Verbindungsdichte, auf großen Flächen
// (z.B. Hochformat Desktop) dagegen zu wenige Verbindungen.
//
// Lösung: maxDistance so berechnen, dass jedes Partikel im Schnitt immer
// dieselbe Anzahl Nachbarn hat – unabhängig von Canvas-Größe und Modus.
//
// Formel:   n_nachbarn = (count / fläche) × π × maxDistance²
// Auflösen: maxDistance = √(n_nachbarn × fläche / (π × count))
function updateMaxDistance() {
  const TARGET_NEIGHBORS = 10; // angestrebte Nachbarn pro Partikel
  const area = canvas.width * canvas.height;
  const raw  = Math.sqrt(TARGET_NEIGHBORS * area / (Math.PI * particleConfig.count));
  // Sinnvolle Grenzen: nicht zu kurz (unsichtbar) und nicht zu lang (zu dicht)
  particleConfig.maxDistance = Math.max(60, Math.min(220, raw));
}

// ─── Canvas ───────────────────────────────────────────────────────────────────
const canvas = document.createElement('canvas');
canvas.id = 'particles';
canvas.style.position = 'fixed';
canvas.style.width    = '100%';
canvas.style.height   = '100%';
canvas.style.top      = '0';
canvas.style.left     = '0';
canvas.style.zIndex   = '-1';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
const { width: initW, height: initH } = getViewportSize();
canvas.width  = initW;
canvas.height = initH;
updateMaxDistance(); // initiale Distanz berechnen

// ─── Partikel ─────────────────────────────────────────────────────────────────
const particles = [];

class Particle {
  constructor() { this.randomize(); }

  randomize() {
    this.x      = Math.random() * canvas.width;
    this.y      = Math.random() * canvas.height;
    this.size   = Math.random() * (particleConfig.maxSize - particleConfig.minSize) + particleConfig.minSize;
    this.speedX = Math.random() * (particleConfig.maxSpeed - particleConfig.minSpeed) + particleConfig.minSpeed;
    this.speedY = Math.random() * (particleConfig.maxSpeed - particleConfig.minSpeed) + particleConfig.minSpeed;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width)  this.speedX = -this.speedX;
    if (this.y < 0 || this.y > canvas.height)  this.speedY = -this.speedY;
  }

  draw() {
    ctx.fillStyle = particleConfig.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  for (let i = 0; i < particleConfig.count; i++) {
    particles.push(new Particle());
  }
}

function connectParticles() {
  for (let a = 0; a < particles.length; a++) {
    for (let b = a + 1; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < particleConfig.maxDistance) {
        const opacity = 0.8 - distance / particleConfig.maxDistance;
        ctx.strokeStyle = particleConfig.lineColor.replace('{opacity}', opacity);
        ctx.lineWidth   = particleConfig.lineWidth;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  connectParticles();
  window._particleAnimId = requestAnimationFrame(animate);
}

// ─── Resize ───────────────────────────────────────────────────────────────────
function resizeCanvas(forceRandomize) {
  const { width: newWidth, height: newHeight } = getViewportSize();
  if (!newWidth || !newHeight) return;

  const oldWidth  = canvas.width;
  const oldHeight = canvas.height;

  canvas.width  = newWidth;
  canvas.height = newHeight;
  updateMaxDistance(); // Verbindungsdistanz an neue Fläche anpassen

  if (forceRandomize) {
    particles.forEach(p => p.randomize());
  } else if (oldWidth > 0 && oldHeight > 0) {
    const scaleX = newWidth  / oldWidth;
    const scaleY = newHeight / oldHeight;
    const MAX_SCALE = 4, MIN_SCALE = 0.25;
    if (scaleX <= MAX_SCALE && scaleX >= MIN_SCALE &&
        scaleY <= MAX_SCALE && scaleY >= MIN_SCALE) {
      particles.forEach(p => { p.x *= scaleX; p.y *= scaleY; });
    } else {
      particles.forEach(p => p.randomize());
    }
  }
}

// ─── Event-Listener ───────────────────────────────────────────────────────────
let resizeTimeout;
let orientationChangePending = false;

window.addEventListener('orientationchange', () => {
  clearTimeout(resizeTimeout);
  orientationChangePending = true;
  resizeTimeout = setTimeout(() => {
    orientationChangePending = false;
    resizeCanvas(true);
  }, 500);
});

window.addEventListener('resize', () => {
  if (orientationChangePending) return;
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => resizeCanvas(false), 150);
});

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    if (orientationChangePending) return;
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => resizeCanvas(false), 150);
  });
}

// ─── Start ────────────────────────────────────────────────────────────────────
initParticles();
animate();
