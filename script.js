(() => {
  "use strict";

  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toastText");
  let toastTimer;

  function showToast(message) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${text} kopiert`);
    } catch {
      const input = document.createElement("textarea");
      input.value = text;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      showToast(`${text} kopiert`);
    }
  }

  document.querySelectorAll("[data-copy]").forEach((element) => {
    element.addEventListener("click", () => copyText(element.dataset.copy));
  });

  const shareButton = document.getElementById("shareButton");
  shareButton?.addEventListener("click", async () => {
    const shareData = {
      title: "spook — links & projects",
      text: "Nexus, Discord und Socials von spook.",
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await copyText(window.location.href);
        showToast("Link zur Seite kopiert");
      }
    } catch (error) {
      if (error?.name !== "AbortError") showToast("Teilen nicht möglich");
    }
  });

  const canTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
                  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canTilt) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rx = ((y / rect.height) - 0.5) * -3.2;
        const ry = ((x / rect.width) - 0.5) * 3.2;
        card.style.setProperty("--x", `${x}px`);
        card.style.setProperty("--y", `${y}px`);
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  const canvas = document.getElementById("ambientCanvas");
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  let width = 0;
  let height = 0;
  let dpr = 1;
  let points = [];
  let animationFrame = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(54, Math.max(25, Math.round((width * height) / 26000)));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.3 + 0.35,
      speed: Math.random() * 0.12 + 0.035,
      alpha: Math.random() * 0.28 + 0.08
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const point of points) {
      point.y -= point.speed;
      if (point.y < -8) {
        point.y = height + 8;
        point.x = Math.random() * width;
      }
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(204, 177, 255, ${point.alpha})`;
      ctx.fill();
    }
    animationFrame = requestAnimationFrame(draw);
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
    } else {
      draw();
    }
  });

  resize();
  draw();
})();
