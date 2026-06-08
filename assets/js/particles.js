/**
 * particles.js — Animated particle background for nexio.network
 * Creates a canvas overlay with floating, connected particles.
 */

(function () {
  const isMobile = window.innerWidth < 768;

  const config = {
    count:       isMobile ? 80 : 180,
    color:       'rgba(136, 136, 136, 0.5)',
    lineColor:   'rgba(85, 85, 85, {o})',
    minSize:     isMobile ? 0.3 : 0.7,
    maxSize:     isMobile ? 1.8 : 2.8,
    minSpeed:    isMobile ? -0.2 : -0.3,
    maxSpeed:    isMobile ? 0.2 : 0.3,
    lineWidth:   isMobile ? 0.7 : 0.8,
    maxDistance: isMobile ? 100 : 160,
  };

  // Create and insert canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'particles';
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    zIndex: '-1',
    pointerEvents: 'none',
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Particle class
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x      = Math.random() * canvas.width;
      this.y      = Math.random() * canvas.height;
      this.size   = Math.random() * (config.maxSize - config.minSize) + config.minSize;
      this.speedX = Math.random() * (config.maxSpeed - config.minSpeed) + config.minSpeed;
      this.speedY = Math.random() * (config.maxSpeed - config.minSpeed) + config.minSpeed;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width)  this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height)  this.speedY *= -1;
    }

    draw() {
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw connecting lines between nearby particles
  function drawConnections(particles) {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.maxDistance) {
          const opacity = 0.8 - dist / config.maxDistance;
          ctx.strokeStyle = config.lineColor.replace('{o}', opacity);
          ctx.lineWidth   = config.lineWidth;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  // Init particles
  const particles = Array.from({ length: config.count }, () => new Particle());

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => { p.update(); p.draw(); });
    drawConnections(particles);
    requestAnimationFrame(animate);
  }

  animate();
})();
