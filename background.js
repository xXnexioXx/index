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

const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
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

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Starten
initParticles();
animate();
