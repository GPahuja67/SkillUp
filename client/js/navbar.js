// client/js/navbar.js
// Pill navbar: auth-aware, profile pic aware, highlight navigation

document.addEventListener("DOMContentLoaded", () => {
  const items = Array.from(document.querySelectorAll(".pill-item"));
  const authLogin = document.getElementById("navLogin");
  const authRegister = document.getElementById("navRegister");
  const profileItem = document.getElementById("navProfilePic");
  const navPicImg = document.getElementById("navPic");
  const highlight = document.getElementById("pillHighlight");

  const readToken = () => localStorage.getItem("token");
  const readProfilePic = () => localStorage.getItem("profilePic");

  // ---------------- AUTH STATE ----------------
  function applyAuthState() {
    const token = readToken();
    const profilePic = readProfilePic();

    if (token) {
      if (authLogin) authLogin.style.display = "none";
      if (authRegister) authRegister.style.display = "none";

      if (profileItem) {
        profileItem.style.display = "flex";
        if (navPicImg) {
          navPicImg.src =
            profilePic && profilePic.trim()
              ? profilePic
              : "assets/default-avatar.png";
          navPicImg.alt = "Profile";
        }
      }
    } else {
      if (authLogin) authLogin.style.display = "flex";
      if (authRegister) authRegister.style.display = "flex";
      if (profileItem) profileItem.style.display = "none";
      if (navPicImg) navPicImg.src = "";
    }
  }

  // ---------------- LOGOUT ----------------
  if (navPicImg) {
    navPicImg.addEventListener("click", () => {
      if (confirm("Logout?")) {
        localStorage.clear();
        window.location.href = "index.html";
      }
    });
  }

  // ---------------- HIGHLIGHT ----------------
  function placeHighlightOn(element) {
    if (!element || !highlight) return;

    const parentRect = element.parentElement.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    const center = (rect.left + rect.right) / 2 - parentRect.left;

    highlight.style.left = `${center}px`;
    highlight.style.transform = "translateX(-50%)";

    const icon = element.querySelector(".pill-icon");
    const inner = highlight.querySelector(".pill-highlight-inner");
    if (icon && inner) inner.innerHTML = icon.innerHTML;
  }

  function detectCurrentPath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "index.html";
  }

  function findActiveElement() {
    const current = detectCurrentPath();
    return (
      items.find(i => i.dataset.page === current) ||
      items.find(i => i.querySelector("a")?.getAttribute("href") === current) ||
      items[0] ||
      null
    );
  }

  function wireItemClicks() {
    items.forEach(item => {
      item.addEventListener("click", () => {
        const page = item.dataset.page;
        if (page && detectCurrentPath() !== page) {
          window.location.href = page;
        }
      });
    });
  }

  function initHighlightAndActive() {
    const active = findActiveElement();
    items.forEach(i => i.classList.remove("active"));
    if (active) {
      active.classList.add("active");
      requestAnimationFrame(() => placeHighlightOn(active));
    }
  }

  window.addEventListener("resize", () => {
    placeHighlightOn(document.querySelector(".pill-item.active"));
  });

  window.addEventListener("storage", e => {
    if (e.key === "token" || e.key === "profilePic") {
      applyAuthState();
      placeHighlightOn(document.querySelector(".pill-item.active"));
    }
  });

  // ---------------- INIT ----------------
  wireItemClicks();
  applyAuthState();
  initHighlightAndActive();
});
