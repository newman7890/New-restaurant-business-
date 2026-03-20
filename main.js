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

    // ── Smooth Header Shrink on Scroll (DISABLED) ──
    // The user requested that the header stay exactly where it is (static at top) 
    // rather than following or animating on scroll.
    const header = document.getElementById('header');
    if (header) {
        header.style.padding = '1.2rem 0';
        header.style.backgroundColor = 'transparent';
        header.style.backdropFilter = 'none';
        header.style.boxShadow = 'none';
    }

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
    const navLinksList = document.querySelector('.nav-links');

    if (menuToggle && navLinksList) {
        // Toggle menu on click
        menuToggle.addEventListener('click', (e) => {
            navLinksList.classList.toggle('open');
            // Update icon: ✕ (close) or ☰ (hamburger)
            menuToggle.innerHTML = navLinksList.classList.contains('open') ? '&#10005;' : '&#9776;';
        });

        // Close menu when a link is clicked
        const navLinks = navLinksList.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navLinksList.classList.remove('open');
                menuToggle.innerHTML = '&#9776;'; // Reset to hamburger icon
            });
        });

        // Accessibility: Handle Enter/Space keys
        menuToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                menuToggle.click();
            }
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

    // ── Online Ordering Logic ──
    const cart = [];
    const cartTrigger = document.getElementById('cartTrigger');
    const cartPanel = document.getElementById('cartPanel');
    const closeCart = document.getElementById('closeCart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalVal = document.getElementById('cartTotalVal');
    const cartCount = document.querySelector('.cart-count');
    const categoryLinks = document.querySelectorAll('.cat-link');

    // Toggle Cart Panel
    if (cartTrigger) {
        cartTrigger.addEventListener('click', () => {
            cartPanel.classList.toggle('open');
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', () => {
            cartPanel.classList.remove('open');
        });
    }

    // Add to Cart Logic
    const addBtnElements = document.querySelectorAll('.btn-add-cart');
    addBtnElements.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.item-card');
            const id = card.getAttribute('data-id');
            const name = card.getAttribute('data-name');
            const price = parseFloat(card.getAttribute('data-price'));

            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id, name, price, quantity: 1 });
            }

            updateCartUI();
            if (cartPanel) cartPanel.classList.add('open');
        });
    });

    const updateCartUI = () => {
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
        } else {
            cart.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <div class="cart-item-info">
                        <h5>${item.name}</h5>
                        <div class="cart-qty-controls">
                            <button class="qty-btn minus" data-id="${item.id}">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn plus" data-id="${item.id}">+</button>
                        </div>
                        <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <button class="cart-remove-btn" data-id="${item.id}">&times;</button>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotalVal) cartTotalVal.textContent = `$${total.toFixed(2)}`;
        if (cartCount) cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    // Event Delegation for Cart Controls
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            if (!id) return;

            const itemIndex = cart.findIndex(item => item.id === id);
            if (itemIndex === -1) return;

            if (e.target.classList.contains('plus')) {
                cart[itemIndex].quantity += 1;
            } else if (e.target.classList.contains('minus')) {
                if (cart[itemIndex].quantity > 1) {
                    cart[itemIndex].quantity -= 1;
                } else {
                    cart.splice(itemIndex, 1);
                }
            } else if (e.target.classList.contains('cart-remove-btn')) {
                cart.splice(itemIndex, 1);
            }

            updateCartUI();
        });
    }

    // Category Navigation Click
    categoryLinks.forEach(link => {
        link.addEventListener('click', () => {
            categoryLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Checkout Logic
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeModal = document.getElementById('closeModal');
    const checkoutForm = document.getElementById('checkoutForm');
    const summaryTotal = document.getElementById('summaryTotal');
    const summaryGrandTotal = document.getElementById('summaryGrandTotal');

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }

            // Calculate and show totals
            const itemTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const grandTotal = itemTotal + 5.00; // $5 delivery fee

            if (summaryTotal) summaryTotal.textContent = `$${itemTotal.toFixed(2)}`;
            if (summaryGrandTotal) summaryGrandTotal.textContent = `$${grandTotal.toFixed(2)}`;

            // Close cart and open modal
            if (cartPanel) cartPanel.classList.remove('open');
            if (checkoutModal) checkoutModal.classList.add('open');
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (checkoutModal) checkoutModal.classList.remove('open');
        });
    }

    // Close on overlay click
    if (checkoutModal) {
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) checkoutModal.classList.remove('open');
        });
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const placeOrderBtn = document.getElementById('placeOrderBtn');
            const originalText = placeOrderBtn.textContent;

            // Change button state to "Processing..."
            placeOrderBtn.disabled = true;
            placeOrderBtn.textContent = 'PROCESSING SECURE PAYMENT...';

            // Simulate server delay/processing
            setTimeout(() => {
                alert('Success! Your order has been placed. You will receive a confirmation call shortly at ' + document.getElementById('phone').value);

                // Reset everything
                cart.length = 0;
                updateCartUI();
                checkoutForm.reset();
                if (checkoutModal) checkoutModal.classList.remove('open');

                // Restore button
                placeOrderBtn.disabled = false;
                placeOrderBtn.textContent = originalText;
            }, 2500);
        });
    }
});
