/* client/js/explore.js
   Hybrid Explore: REAL profiles + PSEUDO (AI demo)
*/

(() => {
  "use strict";

  /* ---------------- PSEUDO PROFILES ---------------- */
  const pseudoProfiles = [
    {
      _id: "pseudo-1",
      isPseudo: true,
      profilePicture: "/assets/p1.jpeg",
      expertiseSkills: "UI/UX Designer",
      goals: "Build clean product interfaces"
    },
    {
      _id: "pseudo-2",
      isPseudo: true,
      profilePicture: "/assets/p2.jpeg",
      expertiseSkills: "Full Stack Dev",
      goals: "Create reliable web systems"
    },
    {
      _id: "pseudo-3",
      isPseudo: true,
      profilePicture: "/assets/p3.jpg",
      expertiseSkills: "Mobile App Dev",
      goals: "Ship delightful mobile apps"
    },
    {
      _id: "pseudo-4",
      isPseudo: true,
      profilePicture: "/assets/p4.jpg",
      expertiseSkills: "Data Scientist",
      goals: "Apply ML to real problems"
    }
  ];

  let profiles = [];
  let swiper;
  let skillCart = JSON.parse(localStorage.getItem("skillCart")) || [];

  document.addEventListener("DOMContentLoaded", loadProfiles);

  /* ---------------- LOAD PROFILES ---------------- */
  async function loadProfiles() {
    const token = localStorage.getItem("token");
    const myUserId = localStorage.getItem("userId");

    if (!token) {
      window.location.href = "login.html";
      return;
    }

    let realProfiles = [];

    try {
      const res = await fetch("/api/profiles", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      realProfiles = data
        .filter(p => String(p.userId?._id || p.userId) !== String(myUserId))
        .map(p => ({
          ...p,
          chatId: String(p.userId?._id || p.userId),
          isPseudo: false
        }));
    } catch {
      console.warn("Using demo profiles only");
    }

    profiles = [...realProfiles, ...pseudoProfiles];
    renderProfiles();
    initSwiper();
  }

  /* ---------------- RENDER ---------------- */
  function renderProfiles() {
    const wrapper = document.querySelector(".swiper-wrapper");
    wrapper.innerHTML = "";

    profiles.forEach(profile => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";

      const card = document.createElement("div");
      card.className = "profile-card swiper-no-swiping";

      const img = document.createElement("img");
      img.className = "card-img";
      img.src = profile.profilePicture || "/assets/default-avatar.png";

      const crossBtn = createCornerBtn("✖", "cross", () => swipeRemove(slide));
      const likeBtn = createCornerBtn("❤", "like", () => {
        addToCart(profile.expertiseSkills);
        swipeRemove(slide);
      });

      const body = document.createElement("div");
      body.className = "card-body";
      body.innerHTML = `
        <h3>${profile.expertiseSkills}</h3>
        <p>${profile.goals}</p>
      `;

      const chatBtn = document.createElement("button");
      chatBtn.className = "chat-btn swiper-no-swiping";
      chatBtn.textContent = "Chat";

      // 🔥 CRITICAL CLICK FIX
      ["pointerdown","mousedown","touchstart"].forEach(evt =>
        chatBtn.addEventListener(evt, e => e.stopPropagation())
      );

      chatBtn.addEventListener("click", e => {
        e.stopPropagation();
        if (profile.isPseudo) {
          openChat(`demo-${profile._id}`);
        } else {
          openChat(profile.chatId);
        }
      });

      card.append(img, crossBtn, likeBtn, body, chatBtn);
      slide.appendChild(card);
      wrapper.appendChild(slide);
    });
  }

  /* ---------------- SWIPER ---------------- */
  function initSwiper() {
    swiper = new Swiper(".swiper", {
      effect: "coverflow",
      centeredSlides: true,
      slidesPerView: "auto",
      grabCursor: true,
      speed: 400,

      allowTouchMove: true,
      noSwiping: true,
      noSwipingClass: "swiper-no-swiping",

      preventClicks: false,
      preventClicksPropagation: false,
      touchStartPreventDefault: false,

      coverflowEffect: {
        rotate: 10,
        stretch: -20,
        depth: 180,
        modifier: 1,
        slideShadows: false
      }
    });
  }

  /* ---------------- HELPERS ---------------- */
  function createCornerBtn(symbol, type, handler) {
    const btn = document.createElement("button");
    btn.className = `card-corner-btn ${type}`;
    btn.innerHTML = symbol;
    btn.onclick = e => {
      e.stopPropagation();
      handler();
    };
    return btn;
  }

  function swipeRemove(slide) {
    slide.remove();
    swiper.update();
  }

  function addToCart(skill) {
    if (!skillCart.includes(skill)) {
      skillCart.push(skill);
      localStorage.setItem("skillCart", JSON.stringify(skillCart));
    }
  }

  function openChat(profileId) {
    window.location.href = `chat.html?profile=${encodeURIComponent(profileId)}`;
  }

})();
