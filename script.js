

export function initNav() {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");
  const header = document.querySelector(".site-header");

  if (!toggle || !menu) return;

  let isOpen = false;

  function setOpen(open) {
    isOpen = open;
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
    document.body.classList.toggle("overflow-hidden", open);
  }
  toggle.addEventListener("click", () => setOpen(!isOpen));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (isOpen && header && !header.contains(e.target)) {
      setOpen(false);
    }
  });

  const mediaQuery = window.matchMedia("(min-width: 768px)");
  function handleDesktopChange(e) {
    if (e.matches && isOpen) {
      setOpen(false);
    }
  }
  mediaQuery.addEventListener("change", handleDesktopChange);
}

export function initHeaderOnScroll() {
  const header = document.getElementById("site-header");
  const sentinel = document.getElementById("nav-sentinel");

  if (!header || !sentinel) return;

  const observer = new IntersectionObserver(([entry]) => {
    const scrolled = !entry.isIntersecting;
    header.classList.toggle("is-scrolled", scrolled);
  });

  observer.observe(sentinel);
}

export function initToTop() {
  const btn = document.getElementById("to-top");
  if (!btn) return;

  const sentinel = document.getElementById("nav-sentinel");

  if (sentinel) {
    const observer = new IntersectionObserver(([entry]) => {
      const shouldShow = !entry.isIntersecting;
      btn.classList.toggle("is-visible", shouldShow);
    });
    observer.observe(sentinel);
  }

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    btn.focus();
  });
}

export function initTheme() {
  const toggles = document.querySelectorAll("#theme-toggle, #theme-toggle-mobile");
  if (toggles.length === 0) return;

  function setTheme(dark) {
    document.documentElement.classList.toggle("dark", dark);
    toggles.forEach((toggle) => {
      toggle.setAttribute("aria-checked", String(dark));
      toggle.setAttribute("aria-label", dark ? "Bật chế độ sáng" : "Bật chế độ tối");
    });
    localStorage.setItem("theme", dark ? "dark" : "light");
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(!isDark);
  }

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", toggleTheme);
  });

  const isDark = document.documentElement.classList.contains("dark");
  toggles.forEach((toggle) => {
    toggle.setAttribute("aria-checked", String(isDark));
    toggle.setAttribute("aria-label", isDark ? "Bật chế độ sáng" : "Bật chế độ tối");
  });
}

export function initFaq() {
  const root = document.getElementById("faq-list");
  if (!root) return;

  const triggers = root.querySelectorAll("[data-faq-trigger]");
  if (triggers.length === 0) return;

  function setOpen(trigger, open) {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    trigger.setAttribute("aria-expanded", String(open));
    if (panel) {
      panel.classList.toggle("is-open", open);
    }
  }

  root.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-faq-trigger]");
    if (!trigger) return;

    const willOpen = trigger.getAttribute("aria-expanded") !== "true";

    triggers.forEach((t) => setOpen(t, false));

    if (willOpen) setOpen(trigger, true);
  });

  root.addEventListener("keydown", (e) => {
    const trigger = e.target.closest("[data-faq-trigger]");
    if (!trigger) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      trigger.click();
    }
  });
}

export function initPricing() {
  const toggle = document.getElementById("pricing-toggle");
  const prices = document.querySelectorAll("[data-price]");
  const monthlyLabel = document.getElementById("billing-monthly-label");
  const yearlyLabel = document.getElementById("billing-yearly-label");

  if (!toggle || prices.length === 0) return;

  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

  let isYearly = false;

  function updatePrices(yearly) {
    isYearly = yearly;
    toggle.setAttribute("aria-checked", String(yearly));
    toggle.setAttribute(
      "aria-label",
      yearly ? "Chuyển sang giá theo tháng" : "Chuyển sang giá theo năm"
    );

    if (monthlyLabel) monthlyLabel.classList.toggle("font-semibold", !yearly);
    if (yearlyLabel) yearlyLabel.classList.toggle("font-semibold", yearly);

    prices.forEach((el) => {
      const key = yearly ? "yearly" : "monthly";
      const value = el.dataset[key];
      if (value) {
        el.textContent = formatter.format(Number(value));
      }
    });

    const periods = document.querySelectorAll(".price-period");
    periods.forEach((period) => {
      period.textContent = yearly ? "/năm" : "/tháng";
    });
  }

  toggle.addEventListener("click", () => {
    updatePrices(!isYearly);
  });

  toggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle.click();
    }
  });

  updatePrices(false);
}

export function initSlider() {
  const root = document.querySelector(".testimonial-slider");
  if (!root) return;

  const track = root.querySelector(".slider-track");
  const slides = root.querySelectorAll(".slide");
  const prevBtn = root.querySelector(".slider-prev");
  const nextBtn = root.querySelector(".slider-next");
  const dotsContainer = root.querySelector(".slider-dots");

  if (!track || slides.length === 0) return;

  let index = 0;
  let autoPlayId = null;
  let isPlaying = true;

  if (dotsContainer) {
    dotsContainer.innerHTML = "";
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "slider-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Chuyển đến slide ${i + 1}`);
      dot.setAttribute("data-index", String(i));
      if (i === 0) dot.setAttribute("aria-current", "true");
      dot.addEventListener("click", () => go(i));
      dotsContainer.appendChild(dot);
    });
  }

  function go(next) {
    index = (next + slides.length) % slides.length;

    track.style.transform = `translateX(-${index * 100}%)`;

    slides.forEach((s, i) => {
      s.toggleAttribute("inert", i !== index);
    });

    const dots = dotsContainer?.querySelectorAll(".slider-dot");
    dots?.forEach((dot, i) => {
      dot.setAttribute("aria-current", i === index ? "true" : "false");
    });
  }

  function goPrev() {
    go(index - 1);
    resetAutoPlay();
  }

  function goNext() {
    go(index + 1);
    resetAutoPlay();
  }

  function startAutoPlay() {
    if (autoPlayId) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    autoPlayId = setInterval(goNext, 4000);
    isPlaying = true;
  }

  function stopAutoPlay() {
    if (autoPlayId) {
      clearInterval(autoPlayId);
      autoPlayId = null;
    }
    isPlaying = false;
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  if (prevBtn) prevBtn.addEventListener("click", goPrev);
  if (nextBtn) nextBtn.addEventListener("click", goNext);

  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  });

  root.addEventListener("mouseenter", stopAutoPlay);
  root.addEventListener("mouseleave", startAutoPlay);
  root.addEventListener("focusin", stopAutoPlay);
  root.addEventListener("focusout", startAutoPlay);

  document.addEventListener("visibilitychange", () => {
    document.hidden ? stopAutoPlay() : startAutoPlay();
  });

  go(0);
  startAutoPlay();
}

export function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (items.length === 0) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); 
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -20px 0px",
    }
  );

  items.forEach((el) => observer.observe(el));
}