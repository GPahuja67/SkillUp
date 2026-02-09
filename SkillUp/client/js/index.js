// Smooth scroll animation on reveal
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.scroll-fade').forEach(el => {
      observer.observe(el);
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Add some interactivity to floating shapes
    document.querySelectorAll('.floating-shape').forEach(shape => {
      shape.addEventListener('mouseenter', () => {
        shape.style.transform = 'scale(1.2)';
        shape.style.opacity = '0.2';
      });
      
      shape.addEventListener('mouseleave', () => {
        shape.style.transform = 'scale(1)';
        shape.style.opacity = '0.1';
      });
    });

    document.addEventListener('DOMContentLoaded', () => {
  const navbarHTML = `
    <nav class="glass-navbar">
      <div class="nav-brand">SkillUp</div>
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="createprofile.html">Create Profile</a></li>
        <li><a href="login.html">Login</a></li>
        <li><a href="register.html">Register</a></li>
        <li><a href="explore.html">Explore</a></li>
      </ul>
    </nav>
  `;

  document.body.insertAdjacentHTML('afterbegin', navbarHTML);
});
