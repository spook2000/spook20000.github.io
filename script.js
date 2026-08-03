(() => {
  "use strict";

  const links = window.SPOOK_LINKS || {};
  const toast = document.getElementById("toast");
  let toastTimer;

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function isConfigured(url) {
    if (!url || url === "#") return false;
    return !/(DEINE-|BEISPIEL\.DE|CLIENT_ID|USER_ID)/i.test(url);
  }

  document.querySelectorAll(".configurable-link").forEach((element) => {
    const key = element.dataset.link;
    const url = links[key];

    if (isConfigured(url)) {
      element.href = url;
      if (!url.startsWith("mailto:")) {
        element.target = "_blank";
        element.rel = "noopener noreferrer";
      }
      return;
    }

    element.href = "#";
    element.classList.add("disabled-link");
    element.setAttribute("aria-disabled", "true");
    element.addEventListener("click", (event) => {
      event.preventDefault();
      showToast(`Link „${key}“ zuerst in config.js eintragen.`);
    });
  });

  document.getElementById("copyDiscord")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("Spook912");
      showToast("Discord-Name kopiert: Spook912");
    } catch {
      showToast("Discord: Spook912");
    }
  });

  document.getElementById("shareButton")?.addEventListener("click", async () => {
    const shareData = {
      title: document.title,
      text: "spook — Discord Bots, Minecraft Plugins & Nexus",
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Seitenlink kopiert.");
      }
    } catch (error) {
      if (error?.name !== "AbortError") showToast("Teilen war nicht möglich.");
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 55, 240)}ms`;
    observer.observe(element);
  });

  const canTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canTilt) {
    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${y * -2.5}deg) rotateY(${x * 3}deg) translateY(-2px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  const canvas = document.getElementById("particleCanvas");
  const context = canvas?.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canvas && context && !reducedMotion) {
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(65, Math.max(28, Math.round(width / 24)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.1 + 0.25,
        vx: (Math.random() - 0.5) * 0.13,
        vy: (Math.random() - 0.5) * 0.13,
        alpha: Math.random() * 0.42 + 0.08
      }));
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < -5) particle.x = width + 5;
        if (particle.x > width + 5) particle.x = -5;
        if (particle.y < -5) particle.y = height + 5;
        if (particle.y > height + 5) particle.y = -5;
        context.beginPath();
        context.fillStyle = `rgba(202, 155, 255, ${particle.alpha})`;
        context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        context.fill();
      }
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    draw();
  }
})();
