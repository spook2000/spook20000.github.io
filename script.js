const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const preloader = $("#preloader");
const toast = $("#toast");
const toastText = $("#toastText");
const themeButton = $("#themeButton");
const shareButton = $("#shareButton");
const copyHandle = $("#copyHandle");
const cursorGlow = $("#cursorGlow");
const liveClock = $("#liveClock");
const typingText = $("#typingText");

const themes = ["void", "blood", "ice"];
let themeIndex = 0;
let toastTimer;

function showToast(message) {
  toastText.textContent = message;
  toast.classList.add("is-visible");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

function copyText(text, successMessage = "In die Zwischenablage kopiert") {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(successMessage))
      .catch(() => fallbackCopy(text, successMessage));
    return;
  }

  fallbackCopy(text, successMessage);
}

function fallbackCopy(text, successMessage) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
  showToast(successMessage);
}

function createParticles() {
  const container = $("#particles");
  const amount = window.innerWidth < 700 ? 14 : 25;

  for (let i = 0; i < amount; i += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.setProperty("--duration", `${12 + Math.random() * 18}s`);
    particle.style.setProperty("--delay", `${-Math.random() * 25}s`);
    particle.style.setProperty("--opacity", `${0.15 + Math.random() * 0.5}`);
    particle.style.setProperty("--travel-x", `${-80 + Math.random() * 160}px`);
    container.appendChild(particle);
  }
}

function revealElements() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  $$(".reveal").forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
    observer.observe(element);
  });
}

function animateCounters() {
  const counters = $$("[data-counter]");

  counters.forEach((counter) => {
    const target = Number(counter.dataset.counter);
    const startTime = performance.now();
    const duration = 950;

    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.floor(target * eased);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  });
}

function updateClock() {
  const formatter = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  liveClock.textContent = formatter.format(new Date());
}

function startTyping() {
  const phrases = [
    "npm run build",
    "deploy --production",
    "git commit -m \"make it insane\"",
    "node nexus.js",
    "python create_future.py"
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const phrase = phrases[phraseIndex];

    if (!deleting) {
      charIndex += 1;
      typingText.textContent = phrase.slice(0, charIndex);

      if (charIndex === phrase.length) {
        deleting = true;
        setTimeout(tick, 1250);
        return;
      }
    } else {
      charIndex -= 1;
      typingText.textContent = phrase.slice(0, charIndex);

      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }

    setTimeout(tick, deleting ? 40 : 74);
  }

  tick();
}

function addRipple(event) {
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  const ripple = document.createElement("span");

  ripple.className = "ripple";
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;

  target.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

function enableTilt() {
  if (window.matchMedia("(hover: none)").matches) return;

  $$(".tilt-card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      card.style.transform = `perspective(900px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg) translateY(-3px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

function cycleTheme() {
  themeIndex = (themeIndex + 1) % themes.length;
  document.body.dataset.theme = themes[themeIndex];
  localStorage.setItem("spook-theme", themes[themeIndex]);

  const names = {
    void: "Void Theme",
    blood: "Blood Theme",
    ice: "Ice Theme"
  };

  showToast(names[themes[themeIndex]]);
}

function loadTheme() {
  const saved = localStorage.getItem("spook-theme");
  const savedIndex = themes.indexOf(saved);

  if (savedIndex !== -1) {
    themeIndex = savedIndex;
    document.body.dataset.theme = themes[themeIndex];
  }
}

async function shareProfile() {
  const shareData = {
    title: document.title,
    text: "Check mein Link-Hub aus.",
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      showToast("Profil geteilt");
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  copyText(window.location.href, "Profil-Link kopiert");
}

function trackCursor(event) {
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
}

window.addEventListener("load", () => {
  setTimeout(() => preloader.classList.add("is-hidden"), 650);
  setTimeout(animateCounters, 850);
});

document.addEventListener("mousemove", trackCursor);

themeButton.addEventListener("click", cycleTheme);
shareButton.addEventListener("click", shareProfile);
copyHandle.addEventListener("click", () => {
  copyText(copyHandle.dataset.copy, "Discord-Name kopiert");
});

$$(".link-card").forEach((card) => {
  card.addEventListener("click", addRipple);
});


const discordCard = $(".discord-copy-card");

if (discordCard) {
  discordCard.addEventListener("click", (event) => {
    event.preventDefault();
    copyText(discordCard.dataset.copy, "Discord-Name spook912 kopiert");
  });
}

$("#year").textContent = new Date().getFullYear();

loadTheme();
createParticles();
revealElements();
enableTilt();
startTyping();
updateClock();
setInterval(updateClock, 1000);
