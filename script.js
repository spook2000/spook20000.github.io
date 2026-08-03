(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const boot = $('#boot');
  const bootProgress = $('#bootProgress');
  const bootPercent = $('#bootPercent');
  const bootText = $('#bootText');
  const year = $('#year');
  const toast = $('#toast');
  const toastText = $('#toastText');
  const shareButton = $('#shareButton');
  const commandButton = $('#commandButton');
  const commandOverlay = $('#commandOverlay');
  const typedRole = $('#typedRole');

  year.textContent = new Date().getFullYear();

  function startBoot() {
    if (reduceMotion.matches || sessionStorage.getItem('spookBootSeen')) {
      boot.classList.add('done');
      document.body.classList.remove('booting');
      return;
    }

    document.body.classList.add('booting');
    const messages = [
      [12, 'loading visual core...'],
      [36, 'connecting nexus modules...'],
      [63, 'syncing social channels...'],
      [84, 'activating identity...'],
      [100, 'system ready.']
    ];
    let progress = 0;

    const timer = window.setInterval(() => {
      progress += Math.max(1, Math.ceil((100 - progress) / 11));
      progress = Math.min(progress, 100);
      bootProgress.style.width = `${progress}%`;
      bootPercent.textContent = `${String(progress).padStart(2, '0')}%`;
      const message = messages.find(([point]) => progress <= point) || messages[messages.length - 1];
      bootText.textContent = message[1];

      if (progress >= 100) {
        window.clearInterval(timer);
        sessionStorage.setItem('spookBootSeen', '1');
        window.setTimeout(() => {
          boot.classList.add('done');
          document.body.classList.remove('booting');
        }, 360);
      }
    }, 42);
  }

  startBoot();

  let toastTimer;
  function showToast(message) {
    toastText.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2300);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      Object.assign(textarea.style, { position: 'fixed', opacity: '0', pointerEvents: 'none' });
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      return copied;
    }
  }

  $$('[data-copy]').forEach((element) => {
    element.addEventListener('click', async () => {
      const copied = await copyText(element.dataset.copy);
      if (!copied) {
        showToast('Kopieren nicht möglich');
        return;
      }
      element.classList.add('copied');
      showToast('Discord-Name kopiert: spook912');
      window.setTimeout(() => element.classList.remove('copied'), 1600);
      closeCommand();
    });
  });

  shareButton.addEventListener('click', async () => {
    const data = {
      title: 'spook // digital identity',
      text: 'Nexus, Discord und Socials von spook.',
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await copyText(window.location.href);
        showToast('Seitenlink kopiert');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') showToast('Teilen nicht möglich');
    }
  });

  function openCommand() {
    commandOverlay.classList.add('open');
    commandOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('command-open');
  }

  function closeCommand() {
    commandOverlay.classList.remove('open');
    commandOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('command-open');
  }

  commandButton.addEventListener('click', openCommand);
  $$('[data-close-command]').forEach((element) => element.addEventListener('click', closeCommand));
  $$('.command-list a').forEach((element) => element.addEventListener('click', closeCommand));

  window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      commandOverlay.classList.contains('open') ? closeCommand() : openCommand();
    }
    if (event.key === 'Escape') closeCommand();
  });

  const roles = ['DISCORD BOTS', 'MINECRAFT PLUGINS', 'WEB EXPERIENCES', 'SYSTEMS'];
  let roleIndex = 0;
  let deleting = false;
  let charIndex = roles[0].length;

  function animateRoles() {
    if (reduceMotion.matches) return;
    const current = roles[roleIndex];
    typedRole.textContent = current.slice(0, charIndex);

    if (!deleting && charIndex < current.length) {
      charIndex += 1;
      window.setTimeout(animateRoles, 72);
    } else if (!deleting && charIndex === current.length) {
      deleting = true;
      window.setTimeout(animateRoles, 1500);
    } else if (deleting && charIndex > 0) {
      charIndex -= 1;
      window.setTimeout(animateRoles, 34);
    } else {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      window.setTimeout(animateRoles, 280);
    }
  }

  window.setTimeout(animateRoles, 1300);

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  $$('.reveal').forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 65, 260)}ms`;
    revealObserver.observe(element);
  });

  if (canHover && !reduceMotion.matches) {
    const cursorDot = $('#cursorDot');
    const cursorRing = $('#cursorRing');
    const spotlight = $('#spotlight');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('pointermove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      spotlight.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
      spotlight.style.opacity = '1';
    }, { passive: true });

    function updateCursor() {
      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    $$('a, button').forEach((element) => {
      element.addEventListener('pointerenter', () => cursorRing.classList.add('active'));
      element.addEventListener('pointerleave', () => cursorRing.classList.remove('active'));
    });

    $$('.magnetic').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate(${x * 0.08}px, ${y * 0.1}px)`;
      });
      element.addEventListener('pointerleave', () => { element.style.transform = ''; });
    });

    $$('[data-tilt]').forEach((element) => {
      const strength = Number(element.dataset.strength || 7);
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        element.style.transform = `perspective(1100px) rotateX(${-py * strength}deg) rotateY(${px * strength}deg)`;
      });
      element.addEventListener('pointerleave', () => { element.style.transform = ''; });
    });
  }

  const canvas = $('#network');
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = 1;
  let nodes = [];
  let frame;
  const pointer = { x: -1000, y: -1000 };

  function resizeNetwork() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(65, Math.max(26, Math.floor(width / 22)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
      size: Math.random() * 1.25 + 0.35
    }));
  }

  function drawNetwork() {
    ctx.clearRect(0, 0, width, height);

    for (const node of nodes) {
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < -10) node.x = width + 10;
      if (node.x > width + 10) node.x = -10;
      if (node.y < -10) node.y = height + 10;
      if (node.y > height + 10) node.y = -10;

      const pdx = pointer.x - node.x;
      const pdy = pointer.y - node.y;
      const pd = Math.hypot(pdx, pdy);
      if (pd < 150 && pd > 0) {
        node.x -= pdx * 0.0008;
        node.y -= pdy * 0.0008;
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(203, 177, 255, .36)';
      ctx.fill();
    }

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.hypot(dx, dy);
        if (distance < 108) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(151, 103, 240, ${(1 - distance / 108) * 0.11})`;
          ctx.lineWidth = 0.65;
          ctx.stroke();
        }
      }
    }

    frame = requestAnimationFrame(drawNetwork);
  }

  window.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }, { passive: true });

  function updateNetworkMotion() {
    cancelAnimationFrame(frame);
    if (!reduceMotion.matches) {
      resizeNetwork();
      drawNetwork();
    } else {
      ctx.clearRect(0, 0, width, height);
    }
  }

  window.addEventListener('resize', () => {
    if (!reduceMotion.matches) resizeNetwork();
  }, { passive: true });

  reduceMotion.addEventListener?.('change', updateNetworkMotion);
  updateNetworkMotion();
})();
