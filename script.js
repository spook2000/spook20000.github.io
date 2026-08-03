const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const DISCORD_NAME = "Spook912";
const themes = ["void", "blood", "ice"];

const bootScreen = $("#bootScreen");
const bootLog = $("#bootLog");
const bootBar = $("#bootBar");
const cursorGlow = $("#cursorGlow");
const particles = $("#particles");
const scrollProgress = $("#scrollProgress");
const themeButton = $("#themeButton");
const shareButton = $("#shareButton");
const commandButton = $("#commandButton");
const commandPalette = $("#commandPalette");
const commandInput = $("#commandInput");
const toast = $("#toast");
const toastText = $("#toastText");
const liveClock = $("#liveClock");
const liveClockMobile = $("#liveClockMobile");
const typingText = $("#typingText");
const typingTextMobile = $("#typingTextMobile");
const backTop = $("#backTop");

let themeIndex = 0;
let toastTimer;

// Boot sequence
const bootMessages = [
  "Loading identity...",
  "Connecting social links...",
  "Mounting Nexus modules...",
  "Loading gaming profile...",
  "System ready."
];

let bootValue = 0;
let bootMessageIndex = 0;

const bootTimer = setInterval(() => {
  bootValue = Math.min(100, bootValue + Math.floor(Math.random() * 16) + 8);
  bootBar.style.width = `${bootValue}%`;

  if (
    bootMessageIndex < bootMessages.length &&
    bootValue >= (bootMessageIndex + 1) * 18
  ) {
    const line = document.createElement("p");
    line.textContent = bootMessages[bootMessageIndex];
    bootLog.appendChild(line);
    bootMessageIndex += 1;
  }

  if (bootValue === 100) {
    clearInterval(bootTimer);
    setTimeout(() => bootScreen.classList.add("hidden"), 420);
  }
}, 150);

function showToast(message) {
  toastText.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2300);
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch {
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
}

$$(".copy-discord").forEach(button => {
  button.addEventListener("click", () => {
    copyText(DISCORD_NAME, `Discord-Name kopiert: ${DISCORD_NAME}`);
  });
});

function loadTheme() {
  const savedTheme = localStorage.getItem("spook-link-theme");
  const index = themes.indexOf(savedTheme);

  if (index !== -1) {
    themeIndex = index;
    document.body.dataset.theme = themes[themeIndex];
  }
}

function cycleTheme() {
  themeIndex = (themeIndex + 1) % themes.length;
  document.body.dataset.theme = themes[themeIndex];
  localStorage.setItem("spook-link-theme", themes[themeIndex]);

  const themeNames = {
    void: "Void Theme",
    blood: "Blood Theme",
    ice: "Ice Theme"
  };

  showToast(`${themeNames[themes[themeIndex]]} aktiviert`);
}

loadTheme();
themeButton.addEventListener("click", cycleTheme);

async function shareProfile() {
  const data = {
    title: document.title,
    text: "Check den Link-Hub von spook aus.",
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(data);
      showToast("Profil geteilt");
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  copyText(window.location.href, "Profil-Link kopiert");
}

shareButton.addEventListener("click", shareProfile);

// Particles
const particleCount = innerWidth < 700 ? 14 : 26;

for (let index = 0; index < particleCount; index += 1) {
  const particle = document.createElement("span");
  particle.className = "particle";
  particle.style.left = `${Math.random() * 100}%`;
  particle.style.setProperty("--duration", `${12 + Math.random() * 18}s`);
  particle.style.setProperty("--delay", `${-Math.random() * 25}s`);
  particle.style.setProperty("--opacity", `${0.15 + Math.random() * 0.45}`);
  particle.style.setProperty("--travel-x", `${-90 + Math.random() * 180}px`);
  particles.appendChild(particle);
}

// Cursor glow
if (matchMedia("(pointer:fine)").matches) {
  addEventListener("mousemove", event => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });
}

// Reveal + counters
const counted = new WeakSet();

function animateCounter(element) {
  if (counted.has(element)) return;
  counted.add(element);

  const target = Number(element.dataset.target || 0);
  const suffix = element.dataset.suffix || "";
  const duration = 1150;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${Math.floor(target * eased)}${suffix}`;

    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add("visible");
    entry.target.querySelectorAll(".counter").forEach(animateCounter);
  });
}, { threshold: 0.13 });

$$(".reveal").forEach(element => revealObserver.observe(element));

// Tilt effect
if (!matchMedia("(hover:none)").matches) {
  $$(".tilt-card").forEach(card => {
    card.addEventListener("mousemove", event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      card.style.transform =
        `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 7}deg) translateY(-3px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

// Clock
function updateClock() {
  const value = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date());

  liveClock.textContent = value;
  liveClockMobile.textContent = value;
}

updateClock();
setInterval(updateClock, 1000);

// Typing
const phrases = [
  "node nexus.js",
  "deploy --multi-server",
  "java build-plugin.jar",
  "npm run create-something-insane",
  "status: probably coding..."
];

let phraseIndex = 0;
let characterIndex = 0;
let deleting = false;

function typeLoop() {
  const phrase = phrases[phraseIndex];

  if (!deleting) {
    characterIndex += 1;
  } else {
    characterIndex -= 1;
  }

  const output = phrase.slice(0, characterIndex);
  typingText.textContent = output;
  typingTextMobile.textContent = output;

  let delay = deleting ? 35 : 70;

  if (!deleting && characterIndex === phrase.length) {
    deleting = true;
    delay = 1100;
  } else if (deleting && characterIndex === 0) {
    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    delay = 320;
  }

  setTimeout(typeLoop, delay);
}

typeLoop();

// Scroll progress
function handleScroll() {
  const top = scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  scrollProgress.style.width = `${max > 0 ? (top / max) * 100 : 0}%`;
  backTop.classList.toggle("show", top > 650);
}

handleScroll();
addEventListener("scroll", handleScroll, { passive: true });
backTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

// Command palette
function filterCommands(query) {
  const normalized = query.trim().toLowerCase();

  $$(".command-results > *").forEach(item => {
    item.hidden = !item.textContent.toLowerCase().includes(normalized);
  });
}

function openCommandPalette() {
  commandPalette.classList.add("open");
  commandPalette.setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
  setTimeout(() => commandInput.focus(), 50);
}

function closeCommandPalette() {
  commandPalette.classList.remove("open");
  commandPalette.setAttribute("aria-hidden", "true");
  document.body.classList.remove("locked");
  commandInput.value = "";
  filterCommands("");
}

commandButton.addEventListener("click", openCommandPalette);
$("[data-close-command]").addEventListener("click", closeCommandPalette);
commandInput.addEventListener("input", () => filterCommands(commandInput.value));

$$("[data-target-section]").forEach(button => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.targetSection);
    closeCommandPalette();
    target?.scrollIntoView({ behavior: "smooth" });
  });
});

$("[data-copy-command]").addEventListener("click", () => {
  copyText(DISCORD_NAME, `Discord-Name kopiert: ${DISCORD_NAME}`);
  closeCommandPalette();
});

document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();

    if (commandPalette.classList.contains("open")) {
      closeCommandPalette();
    } else {
      openCommandPalette();
    }
  }

  if (event.key === "Escape") {
    closeCommandPalette();
  }
});

$("#year").textContent = new Date().getFullYear();
