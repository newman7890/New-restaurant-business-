document.addEventListener('DOMContentLoaded', () => {

    // ── IntersectionObserver for Scroll Reveal Animations ──
    // Much more performant than scroll events. Uses a threshold to trigger
    // when 15% of the element is visible.
    const revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
    const revealElements = document.querySelectorAll(revealSelectors);

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Once revealed, no need to observe anymore
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ── Smooth Header Shrink on Scroll ──
    const header = document.getElementById('header');
    let lastScrollY = 0;
    let ticking = false;

    const updateHeader = () => {
        if (window.scrollY > 50) {
            header.style.padding = '0.6rem 0';
            header.style.backgroundColor = 'rgba(10, 10, 10, 0.97)';
            header.style.backdropFilter = 'blur(12px)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.padding = '1.2rem 0';
            header.style.backgroundColor = 'rgba(20, 20, 20, 0.85)';
            header.style.backdropFilter = 'blur(8px)';
            header.style.boxShadow = 'none';
        }
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });
    updateHeader();

    // ── Smooth Page Transitions ──
    // Fade out before navigating to internal pages
    const internalLinks = document.querySelectorAll('a[href$=".html"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            // Skip if modifier key held or same page anchor
            if (e.metaKey || e.ctrlKey || href.startsWith('#')) return;

            e.preventDefault();
            document.body.style.transition = 'opacity 0.35s ease';
            document.body.style.opacity = '0';

            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });

    // ── Smooth Parallax on Scroll for Hero Sections ──
    const heroSections = document.querySelectorAll('.page-hero, .events-hero-section, .hero');
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                heroSections.forEach(hero => {
                    const scrolled = window.scrollY;
                    const rate = scrolled * 0.3;
                    hero.style.backgroundPositionY = `calc(50% + ${rate}px)`;
                });
            });
        }
    });

    // ── Counter Animation for any .count-up elements ──
    const counters = document.querySelectorAll('.count-up');
    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-target'));
                    let count = 0;
                    const increment = target / 60;
                    const updateCounter = () => {
                        count += increment;
                        if (count < target) {
                            entry.target.textContent = Math.ceil(count);
                            requestAnimationFrame(updateCounter);
                        } else {
                            entry.target.textContent = target;
                        }
                    };
                    updateCounter();
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(c => counterObserver.observe(c));
    }

    // ── Mobile Menu Toggle ──
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const nav = document.querySelector('.nav-links');
            if (nav) nav.classList.toggle('open');
        });
    }

    // ── Form Submission ──
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input').value;
            alert(`Thanks for subscribing with ${email}!`);
            newsletterForm.reset();
        });
    }
});
