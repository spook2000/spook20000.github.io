document.addEventListener("DOMContentLoaded", () => {
  const DISCORD_NAME = "Spook912";

  const bootScreen = document.getElementById("bootScreen");
  const bootLines = document.getElementById("bootLines");
  const bootProgress = document.getElementById("bootProgress");
  const topbar = document.getElementById("topbar");
  const pageProgress = document.getElementById("pageProgress");
  const cursorGlow = document.getElementById("cursorGlow");
  const backTop = document.getElementById("backTop");
  const toast = document.getElementById("toast");
  const mobileMenu = document.getElementById("mobileMenu");
  const topNav = document.getElementById("topNav");
  const themeToggle = document.getElementById("themeToggle");
  const soundToggle = document.getElementById("soundToggle");

  let soundEnabled = false;
  let toastTimer;

  // Boot sequence
  const lines = [
    "Loading identity...",
    "Connecting project modules...",
    "Mounting gaming stats...",
    "Starting visual effects...",
    "System ready."
  ];
  let bootIndex = 0;
  let bootValue = 0;

  const bootTimer = setInterval(() => {
    bootValue = Math.min(100, bootValue + Math.floor(Math.random() * 17) + 8);
    bootProgress.style.width = `${bootValue}%`;

    if (bootIndex < lines.length && bootValue >= (bootIndex + 1) * 18) {
      const line = document.createElement("p");
      line.textContent = lines[bootIndex];
      bootLines.appendChild(line);
      bootIndex += 1;
    }

    if (bootValue === 100) {
      clearInterval(bootTimer);
      setTimeout(() => bootScreen.classList.add("hidden"), 450);
    }
  }, 170);

  // Toast helper
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
  }

  // Tiny UI sound generated through Web Audio
  function playClick(frequency = 480) {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      gain.gain.setValueAtTime(0.035, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.08);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.08);
    } catch (error) {
      console.warn("Sound konnte nicht gestartet werden.", error);
    }
  }

  document.addEventListener("click", event => {
    if (event.target.closest("button, a")) playClick();
  });

  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? "♫" : "♪";
    showToast(soundEnabled ? "UI-Sounds aktiviert" : "UI-Sounds deaktiviert");
  });

  // Theme
  let storedTheme = null;
  try {
    storedTheme = localStorage.getItem("spook-color-theme");
  } catch {
    // Storage kann in privaten oder eingebetteten Browser-Kontexten blockiert sein.
  }
  if (storedTheme === "blue") document.body.classList.add("neon-blue");

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("neon-blue");
    const isBlue = document.body.classList.contains("neon-blue");
    try {
      localStorage.setItem("spook-color-theme", isBlue ? "blue" : "purple");
    } catch {
      // Der Farbstil funktioniert weiterhin, nur ohne dauerhafte Speicherung.
    }
    showToast(isBlue ? "Neon-Blue aktiviert" : "Purple-Night aktiviert");
  });

  // Discord copy
  async function copyDiscordName() {
    try {
      await navigator.clipboard.writeText(DISCORD_NAME);
      showToast(`Discord-Name kopiert: ${DISCORD_NAME}`);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = DISCORD_NAME;
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
      showToast(`Discord-Name kopiert: ${DISCORD_NAME}`);
    }
  }

  document.querySelectorAll(".copy-discord").forEach(button => {
    button.addEventListener("click", copyDiscordName);
  });

  // Mobile nav
  mobileMenu.addEventListener("click", () => {
    const open = topNav.classList.toggle("open");
    mobileMenu.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("locked", open);
  });

  document.querySelectorAll(".top-link, .side-link").forEach(link => {
    link.addEventListener("click", () => {
      topNav.classList.remove("open");
      mobileMenu.setAttribute("aria-expanded", "false");
      document.body.classList.remove("locked");
    });
  });

  // Scroll progress + active sections
  const sections = [...document.querySelectorAll(".section-anchor")];
  const navigationLinks = [...document.querySelectorAll(".top-link, .side-link")];

  function handleScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    pageProgress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    topbar.classList.toggle("scrolled", y > 20);
    backTop.classList.toggle("show", y > 650);

    let activeId = "home";
    sections.forEach(section => {
      if (y >= section.offsetTop - 180) activeId = section.id;
    });

    navigationLinks.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
    });
  }

  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
  backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Cursor glow + magnetic buttons
  if (matchMedia("(pointer:fine)").matches) {
    window.addEventListener("mousemove", event => {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    });

    document.querySelectorAll(".magnetic").forEach(button => {
      button.addEventListener("mousemove", event => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${x * 0.07}px, ${y * 0.07}px)`;
      });
      button.addEventListener("mouseleave", () => {
        button.style.transform = "";
      });
    });
  }

  // Reveal animations, skills and counters
  const counted = new WeakSet();

  function animateCounter(element) {
    if (counted.has(element)) return;
    counted.add(element);

    const target = Number(element.dataset.target || "0");
    const suffix = element.dataset.suffix || "";
    const duration = 1250;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.floor(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");

      entry.target.querySelectorAll("[data-width]").forEach(bar => {
        bar.style.width = `${bar.dataset.width}%`;
      });

      entry.target.querySelectorAll(".counter").forEach(animateCounter);
    });
  }, { threshold: 0.14 });

  document.querySelectorAll(".reveal").forEach(element => observer.observe(element));

  // More plugins
  const expandPlugins = document.getElementById("expandPlugins");
  let pluginsExpanded = false;

  expandPlugins.addEventListener("click", () => {
    pluginsExpanded = !pluginsExpanded;
    document.querySelectorAll(".extra-plugin").forEach(card => {
      card.classList.toggle("show", pluginsExpanded);
    });
    expandPlugins.textContent = pluginsExpanded ? "SHOW LESS PLUGINS ↑" : "SHOW MORE PLUGINS ↓";
  });

  document.getElementById("showAllProjects").addEventListener("click", () => {
    document.getElementById("plugins").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      if (!pluginsExpanded) expandPlugins.click();
    }, 500);
  });

  // Command palette
  const commandPalette = document.getElementById("commandPalette");
  const commandInput = document.getElementById("commandInput");
  const commandButton = document.getElementById("commandButton");

  function openCommand() {
    commandPalette.classList.add("open");
    commandPalette.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
    setTimeout(() => commandInput.focus(), 50);
  }

  function closeCommand() {
    commandPalette.classList.remove("open");
    commandPalette.setAttribute("aria-hidden", "true");
    document.body.classList.remove("locked");
    commandInput.value = "";
    filterCommands("");
  }

  commandButton.addEventListener("click", openCommand);
  document.querySelectorAll("[data-close-command]").forEach(item => item.addEventListener("click", closeCommand));

  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      commandPalette.classList.contains("open") ? closeCommand() : openCommand();
    }
    if (event.key === "Escape") {
      closeCommand();
      closeModal();
    }
  });

  document.querySelectorAll("[data-command-target]").forEach(button => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.commandTarget);
      closeCommand();
      target?.scrollIntoView({ behavior: "smooth" });
    });
  });

  document.querySelector("[data-command-copy]").addEventListener("click", () => {
    copyDiscordName();
    closeCommand();
  });

  function filterCommands(query) {
    const normalized = query.trim().toLowerCase();
    document.querySelectorAll(".command-results button").forEach(button => {
      button.hidden = !button.textContent.toLowerCase().includes(normalized);
    });
  }
  commandInput.addEventListener("input", () => filterCommands(commandInput.value));

  // Project modal
  const modal = document.getElementById("projectModal");
  const modalIcon = document.getElementById("modalIcon");
  const modalType = document.getElementById("modalType");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalFeatures = document.getElementById("modalFeatures");
  const modalTags = document.getElementById("modalTags");

  const projectData = {
    nexus: {
      title: "Nexus",
      type: "DISCORD BOT",
      icon: "assets/nexus.svg",
      description: "Ein modularer Multipurpose-Bot für Discord-Server. Nexus verbindet Moderation, Community-Funktionen und Server-Setup in einem System.",
      features: ["Tickets, Bewerbungen und Verification", "Logging, Moderation und Schutzsysteme", "Level, Economy, Giveaways und Events", "Server-spezifische Einstellungen"],
      tags: ["JavaScript", "Discord.js", "MongoDB"]
    },
    dashboard: {
      title: "Nexus Panel",
      type: "WEB DASHBOARD CONCEPT",
      icon: "assets/logo.svg",
      description: "Ein modernes Web-Dashboard, über das Serverbesitzer ihren Discord-Server auswählen und Nexus konfigurieren können.",
      features: ["Server-Auswahl und Login", "Module aktivieren und konfigurieren", "Minecraft-Server-IP pro Server speichern", "Live-Vorschau für Panels und Embeds"],
      tags: ["HTML", "CSS", "JavaScript"]
    },
    bridge: {
      title: "DiscordBridge",
      type: "VELOCITY PLUGIN",
      icon: "assets/bridge.svg",
      description: "Verbindet ein Minecraft-Netzwerk mit Discord und synchronisiert wichtige Nachrichten in Echtzeit.",
      features: ["Minecraft-Chat zu Discord", "Join- und Leave-Nachrichten", "Netzwerkstatus und Spielerzahl", "Konfigurierbare Formatierung"],
      tags: ["Java", "Velocity", "Discord API"]
    },
    guard: {
      title: "NexusGuard",
      type: "PAPER PLUGIN CONCEPT",
      icon: "assets/guard.svg",
      description: "Ein Sicherheits- und Verwaltungsplugin für Minecraft-Server mit Logging, Rollback und Schutzfunktionen.",
      features: ["Block- und Container-Logging", "Rollback für Griefing", "Warnungen und Staff-Tools", "Verdächtige Aktionen erkennen"],
      tags: ["Java", "Paper", "Security"]
    },
    homes: {
      title: "SpookHomes",
      type: "PAPER PLUGIN CONCEPT",
      icon: "assets/homes.svg",
      description: "Ein modernes Teleport-System mit Homes, Warps, TPA, Cooldowns und Inventar-Menüs.",
      features: ["Mehrere Homes pro Spieler", "TPA- und Warp-System", "GUI-Verwaltung", "Rechte und Cooldowns"],
      tags: ["Java", "Paper", "GUI"]
    },
    pulse: {
      title: "ServerPulse",
      type: "VELOCITY PLUGIN CONCEPT",
      icon: "assets/pulse.svg",
      description: "Überwacht ein Minecraft-Netzwerk und zeigt Status, Spielerzahlen und Wartungen auf Discord an.",
      features: ["Live-Netzwerkstatus", "Wartungsmodus", "Discord-Status aktualisieren", "Servergruppen überwachen"],
      tags: ["Java", "Velocity", "Network"]
    },
    items: {
      title: "CustomItems",
      type: "PAPER PLUGIN CONCEPT",
      icon: "assets/items.svg",
      description: "Ein umfangreiches System für eigene Items, Fähigkeiten, Rezepte, Seltenheiten und Effekte.",
      features: ["Eigene Items und Lore", "Aktive und passive Fähigkeiten", "Custom Crafting", "Konfigurierbare Seltenheiten"],
      tags: ["Java", "Paper", "Items"]
    }
  };

  function openModal(key) {
    const data = projectData[key];
    if (!data) return;

    modalIcon.src = data.icon;
    modalType.textContent = data.type;
    modalTitle.textContent = data.title;
    modalDescription.textContent = data.description;
    modalFeatures.innerHTML = data.features.map(feature => `<div>${feature}</div>`).join("");
    modalTags.innerHTML = data.tags.map(tag => `<span>${tag}</span>`).join("");

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (!commandPalette.classList.contains("open")) document.body.classList.remove("locked");
  }

  document.querySelectorAll("[data-project] .open-project").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-project]");
      openModal(card.dataset.project);
    });
  });
  document.querySelectorAll("[data-close-modal]").forEach(item => item.addEventListener("click", closeModal));
});
