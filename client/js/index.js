/* =========================================================
   INDEX PAGE SCRIPT
   - Landing page animations
   - Smooth scrolling
   - Floating shapes interaction
   - Header navbar auth + profile pic sync
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------------------------------------------------------
     1️⃣ HEADER NAVBAR AUTH STATE (SYNC WITH EXPLORE)
  --------------------------------------------------------- */
  applyHeaderAuthState();

  // Listen to storage changes (helps when navigating between tabs)
  window.addEventListener("storage", applyHeaderAuthState);

  function applyHeaderAuthState() {
    const token = localStorage.getItem("token");
    const profilePic = localStorage.getItem("profilePic");

    const joinBtn = document.getElementById("joinBtn");
    const profileImg = document.getElementById("headerProfilePic");

    if (!joinBtn || !profileImg) return;

    if (token) {
      // Logged in
      joinBtn.style.display = "none";

      profileImg.style.display = "inline-block";
      profileImg.src =
        profilePic && profilePic.trim().length > 0
          ? profilePic
          : "https://i.pravatar.cc/80"; // fallback avatar

      const dropdown = document.getElementById("profileDropdown");
      const goExplore = document.getElementById("goExplore");
      const logoutBtn = document.getElementById("logoutBtn");

      profileImg.onclick = (e) => {
        e.stopPropagation();
        dropdown.style.display =
          dropdown.style.display === "block" ? "none" : "block";
      };

      // Navigate to explore
      goExplore.onclick = () => {
        window.location.href = "explore.html";
      };

      // Logout
      logoutBtn.onclick = () => {
        if (confirm("Logout?")) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("userId");
          localStorage.removeItem("profilePic");
          window.location.href = "index.html";
        }
      };

      // Close dropdown on outside click
      document.addEventListener("click", () => {
        dropdown.style.display = "none";
      });

    } else {
      // Logged out
      joinBtn.style.display = "inline-block";
      profileImg.style.display = "none";
      profileImg.src = "";
    }
  }

  /* ---------------------------------------------------------
     2️⃣ SCROLL REVEAL ANIMATION
  --------------------------------------------------------- */
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  document.querySelectorAll(".scroll-fade").forEach(el => {
    observer.observe(el);
  });

  /* ---------------------------------------------------------
     3️⃣ SMOOTH SCROLL FOR ANCHOR LINKS
  --------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  /* ---------------------------------------------------------
     4️⃣ FLOATING SHAPES INTERACTIVITY
  --------------------------------------------------------- */
  document.querySelectorAll(".floating-shape").forEach(shape => {
    shape.addEventListener("mouseenter", () => {
      shape.style.transform = "scale(1.2)";
      shape.style.opacity = "0.2";
    });

    shape.addEventListener("mouseleave", () => {
      shape.style.transform = "scale(1)";
      shape.style.opacity = "0.1";
    });
  });
});
