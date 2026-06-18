// Particle Background System
const isMobile = window.innerWidth < 768;
const particleConfig = {
  count: isMobile ? 80 : 180,
  color: 'rgba(136, 136, 136, 0.5)',
  minSize: isMobile ? 0.3 : 0.7,
  maxSize: isMobile ? 1.8 : 2.8,
  minSpeed: isMobile ? -0.2 : -0.3,
  maxSpeed: isMobile ? 0.2 : 0.3,
  lineWidth: isMobile ? 0.7 : 0.8,
  maxDistance: isMobile ? 100 : 160,
  lineColor: 'rgba(85, 85, 85, {opacity})'
};

// Canvas erstellen und einfügen
const canvas = document.createElement('canvas');
canvas.id = 'particles';
canvas.style.position = 'fixed';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '-1';
document.body.appendChild(canvas);

// In manchen mobilen Browsern liefert window.innerWidth/innerHeight im
// erzwungenen "Desktop-Modus" beim Drehen kurzzeitig stark abweichende/
// unsinnige Werte (weil die erzwungene Desktop-Breite neu berechnet wird).
// window.visualViewport spiegelt zuverlässiger die tatsächlich sichtbare
// Fläche wider und wird daher bevorzugt, falls verfügbar.
function getViewportSize() {
  if (window.visualViewport) {
    return {
      width: window.visualViewport.width,
      height: window.visualViewport.height
    };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

const ctx = canvas.getContext('2d');
const initialViewport = getViewportSize();
canvas.width = initialViewport.width;
canvas.height = initialViewport.height;
const particles = [];

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * (particleConfig.maxSize - particleConfig.minSize) + particleConfig.minSize;
    this.speedX = Math.random() * (particleConfig.maxSpeed - particleConfig.minSpeed) + particleConfig.minSpeed;
    this.speedY = Math.random() * (particleConfig.maxSpeed - particleConfig.minSpeed) + particleConfig.minSpeed;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
    if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;
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
    for (let b = a; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < particleConfig.maxDistance) {
        const opacity = 0.8 - distance / particleConfig.maxDistance;
        ctx.strokeStyle = particleConfig.lineColor.replace('{opacity}', opacity);
        ctx.lineWidth = particleConfig.lineWidth;
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
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  connectParticles();
  requestAnimationFrame(animate);
}

function resizeCanvas() {
  const oldWidth = canvas.width;
  const oldHeight = canvas.height;
  const { width: newWidth, height: newHeight } = getViewportSize();

  // Manche Browser melden während einer Drehung im Desktop-Modus kurzzeitig
  // 0 oder unsinnig kleine Werte (z.B. während die erzwungene Desktop-Breite
  // neu berechnet wird). Solche Zwischenwerte ignorieren wir komplett.
  if (!newWidth || !newHeight) return;

  if (oldWidth > 0 && oldHeight > 0) {
    const scaleX = newWidth / oldWidth;
    const scaleY = newHeight / oldHeight;

    // Sicherheitsnetz: Im Desktop-Modus auf Mobilgeräten kann der gemeldete
    // Skalierungsfaktor beim Rotieren völlig unrealistisch ausfallen (z.B.
    // weil die "Desktop-Breite" anders neu berechnet wird als die echte
    // Bildschirmbreite). Ein extremer Faktor würde alle Partikel auf einen
    // winzigen Fleck zusammenquetschen -> sieht aus wie "viel zu viele
    // Partikel" (dichte Häufung + extrem viele Verbindungslinien).
    // In so einem Fall verteilen wir die Partikel stattdessen einfach neu,
    // statt sie zu skalieren.
    const MAX_SCALE = 4;
    const MIN_SCALE = 0.25;
    const scaleIsSane =
      scaleX <= MAX_SCALE && scaleX >= MIN_SCALE &&
      scaleY <= MAX_SCALE && scaleY >= MIN_SCALE;

    if (scaleIsSane) {
      particles.forEach(p => {
        p.x *= scaleX;
        p.y *= scaleY;
      });
    } else {
      particles.forEach(p => {
        p.x = Math.random() * newWidth;
        p.y = Math.random() * newHeight;
      });
    }
  }

  canvas.width = newWidth;
  canvas.height = newHeight;
}

let resizeTimeout;
window.addEventListener('resize', () => {
  // Mobile Browser (besonders beim Drehen) liefern kurz nach dem Event teils
  // noch nicht final aktualisierte innerWidth/innerHeight-Werte (z.B. während
  // die Adressleiste ein-/ausfährt). Ein kurzer Debounce sorgt dafür, dass wir
  // mit den endgültigen, stabilen Maßen rechnen.
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(resizeCanvas, 150);
});

// orientationchange zusätzlich abhören: auf manchen Android-Browsern
// (inkl. Opera) feuert das resize-Event nach einer Drehung nicht zuverlässig.
window.addEventListener('orientationchange', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(resizeCanvas, 200);
});

// Zusätzlich auf visualViewport-Resize hören: in einigen mobilen Browsern
// (besonders im erzwungenen "Desktop-Modus") feuert das normale window
// 'resize'-Event bei einer Drehung nicht zuverlässig oder mit veralteten
// Maßen, visualViewport dagegen schon.
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 150);
  });
}

// Starten
initParticles();
animate();
