/**
 * Glowing Comet Trail Flight Animation
 * High-performance curved bezier path from Add-to-Cart button to Navbar Cart
 */

export function flyToCart(originEl) {
  if (!originEl || typeof window === 'undefined') return;

  // 1. Locate the visible Navbar cart element (mobile or desktop)
  const mobileCart = document.getElementById('navbar-cart-mobile');
  const desktopCart = document.getElementById('navbar-cart-desktop');
  let cartEl = null;

  if (desktopCart && desktopCart.offsetParent !== null) {
    cartEl = desktopCart;
  } else if (mobileCart && mobileCart.offsetParent !== null) {
    cartEl = mobileCart;
  } else {
    cartEl = document.querySelector('[data-cart-tab]') || desktopCart || mobileCart;
  }

  const originRect = originEl.getBoundingClientRect();
  const startX = originRect.left + originRect.width / 2;
  const startY = originRect.top + originRect.height / 2;

  let targetX = window.innerWidth - 36;
  let targetY = 28;

  if (cartEl) {
    const cartRect = cartEl.getBoundingClientRect();
    targetX = cartRect.left + cartRect.width / 2;
    targetY = cartRect.top + cartRect.height / 2;
  }

  // 2. Control point for a graceful high-arching parabolic bezier curve
  const dx = targetX - startX;
  const dy = targetY - startY;
  const dist = Math.hypot(dx, dy);

  // Arch apex: lift control point gracefully towards top of viewport
  const midX = (startX + targetX) / 2;
  const archHeight = Math.max(140, dist * 0.38);
  const controlX = midX - dx * 0.12;
  const controlY = Math.min(startY, targetY) - archHeight;

  // Quadratic bezier formula: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
  const getBezierPoint = (t) => {
    const inv = 1 - t;
    const x = inv * inv * startX + 2 * inv * t * controlX + t * t * targetX;
    const y = inv * inv * startY + 2 * inv * t * controlY + t * t * targetY;
    return { x, y };
  };

  // 3. Create SVG overlay for the glowing laser / light-beam arc line
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('style', `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 99998;
    overflow: visible;
  `);

  const uniqueId = `comet-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="${uniqueId}-grad" gradientUnits="userSpaceOnUse" x1="${startX}" y1="${startY}" x2="${targetX}" y2="${targetY}">
      <stop offset="0%" stop-color="#ea580c" stop-opacity="0.2" />
      <stop offset="60%" stop-color="#f97316" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#fde047" stop-opacity="1" />
    </linearGradient>
    <filter id="${uniqueId}-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  `;
  svg.appendChild(defs);

  // The curved path
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const d = `M ${startX} ${startY} Q ${controlX} ${controlY} ${targetX} ${targetY}`;
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', `url(#${uniqueId}-grad)`);
  path.setAttribute('stroke-width', '2.5');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('filter', `url(#${uniqueId}-glow)`);

  document.body.appendChild(svg);
  svg.appendChild(path);

  const totalLength = path.getTotalLength() || dist;
  path.style.strokeDasharray = `${totalLength}`;
  path.style.strokeDashoffset = `${totalLength}`;
  path.style.opacity = '1';

  // 4. Create Glowing Comet Head (Orb)
  const cometHead = document.createElement('div');
  cometHead.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: radial-gradient(circle, #ffffff 15%, #fde047 45%, #ea580c 100%);
    box-shadow: 0 0 14px 4px rgba(234, 88, 12, 0.95), 0 0 28px 8px rgba(245, 158, 11, 0.7);
    pointer-events: none;
    z-index: 99999;
    transform: translate(-50%, -50%);
    will-change: transform, opacity;
  `;
  document.body.appendChild(cometHead);

  // 5. Animation loop with requestAnimationFrame
  const duration = 750; // ms
  const startTime = performance.now();
  let lastSparkTime = 0;

  // Smooth cubic ease-in-out
  const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  function animate(now) {
    const elapsed = now - startTime;
    const rawProgress = Math.min(elapsed / duration, 1);
    const t = easeInOutCubic(rawProgress);

    // Current comet position on bezier curve
    const { x, y } = getBezierPoint(t);
    cometHead.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${1 + 0.35 * Math.sin(t * Math.PI)})`;

    // Path stroke-dashoffset animation
    path.style.strokeDashoffset = `${totalLength * (1 - t)}`;
    if (t > 0.65) {
      path.style.opacity = `${(1 - t) / 0.35}`;
    }

    // Glowing stardust trail
    if (now - lastSparkTime > 26 && t < 0.96) {
      lastSparkTime = now;
      createTrailSparkle(x, y);
    }

    if (rawProgress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Arrived at destination!
      window.dispatchEvent(new CustomEvent('cart-item-arrived'));

      // Micro burst flash on arrival
      createArrivalBurst(targetX, targetY);

      // Clean up comet head and SVG
      cometHead.remove();
      setTimeout(() => {
        svg.remove();
      }, 150);
    }
  }

  requestAnimationFrame(animate);
}

function createTrailSparkle(x, y) {
  const spark = document.createElement('div');
  const size = 3 + Math.random() * 3.5;
  const offsetX = (Math.random() - 0.5) * 8;
  const offsetY = (Math.random() - 0.5) * 8;
  spark.style.cssText = `
    position: fixed;
    left: ${x + offsetX}px;
    top: ${y + offsetY}px;
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: ${Math.random() > 0.4 ? '#fde047' : '#ea580c'};
    box-shadow: 0 0 8px rgba(234, 88, 12, 0.85);
    pointer-events: none;
    z-index: 99997;
    transform: translate(-50%, -50%);
    transition: transform 0.38s ease-out, opacity 0.38s ease-out;
  `;
  document.body.appendChild(spark);
  requestAnimationFrame(() => {
    spark.style.transform = 'translate(-50%, -50%) scale(0.15)';
    spark.style.opacity = '0';
  });
  setTimeout(() => spark.remove(), 400);
}

function createArrivalBurst(x, y) {
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    const angle = (i / 8) * Math.PI * 2;
    const velocity = 16 + Math.random() * 14;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: radial-gradient(circle, #ffffff 20%, #ea580c 100%);
      box-shadow: 0 0 10px rgba(234, 88, 12, 1);
      pointer-events: none;
      z-index: 100001;
      transform: translate(-50%, -50%);
      transition: transform 0.45s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.45s ease-out;
    `;
    document.body.appendChild(particle);
    requestAnimationFrame(() => {
      particle.style.transform = `translate(calc(-50% + ${vx}px), calc(-50% + ${vy}px)) scale(0)`;
      particle.style.opacity = '0';
    });
    setTimeout(() => particle.remove(), 480);
  }
}
