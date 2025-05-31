document.addEventListener('DOMContentLoaded', function() {
    // --- Mobile Menu ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenuButton = document.getElementById('close-menu');
    const menuContent = mobileMenu ? mobileMenu.querySelector('.mobile-menu-content') : null;

    function openMenu() {
        if (!mobileMenu || !menuContent) return;
        mobileMenu.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        setTimeout(() => { menuContent.classList.remove('-translate-x-full'); }, 10);
    }

    function closeMenu() {
        if (!mobileMenu || !menuContent) return;
        menuContent.classList.add('-translate-x-full');
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }

    if (mobileMenuButton) mobileMenuButton.addEventListener('click', openMenu);
    if (closeMenuButton) closeMenuButton.addEventListener('click', closeMenu);
    if (mobileMenu) {
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) closeMenu();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('hidden')) {
            closeMenu();
        }
    });

    // --- Page Content Toggling (Main Page vs All Events Page) ---
    const mainContentWrapper = document.querySelector('.main-content-wrapper');
    const allEventsPage = document.getElementById('all-events-page');
    const navLinks = document.querySelectorAll('.nav-link'); // General nav links
    const eventTriggerLinks = document.querySelectorAll('.event-trigger'); // Links that should always open events page
    const homeLinks = document.querySelectorAll('.nav-link-home'); // Links that should always go to home
    const homepageEventCTAs = document.querySelectorAll('#events .cta-view-event-details'); // CTAs on homepage for events

    function isElementInViewport(el) {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function showAllEventsPage(options = {}) {
        if (mainContentWrapper) mainContentWrapper.classList.add('hidden');
        if (allEventsPage) {
            allEventsPage.classList.remove('hidden');
            const allFilterButton = allEventsPage.querySelector('.filter-button[data-filter="all"]');
            const currentFilterButtons = allEventsPage.querySelectorAll('.filter-button'); // Re-query to ensure it's specific to this page

            if (allFilterButton && currentFilterButtons.length > 0) {
                 currentFilterButtons.forEach(btn => btn.classList.remove('active'));
                 allFilterButton.classList.add('active');
                 // Simulate a click to apply the 'all' filter by default
                 const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
                 allFilterButton.dispatchEvent(clickEvent);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
            const cards = allEventsPage.querySelectorAll('.event-card.scroll-animate');
            cards.forEach(card => {
                // Make sure card is not already hidden by filter
                if (!card.classList.contains('hidden') && isElementInViewport(card) && !card.classList.contains('is-visible')) {
                    card.classList.add('is-visible');
                }
            });
        }
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) closeMenu();
    }

    function showMainPageContent(targetId = null) {
        if (allEventsPage) allEventsPage.classList.add('hidden');
        if (mainContentWrapper) mainContentWrapper.classList.remove('hidden');

        if (targetId) {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const headerOffset = document.querySelector('header')?.offsetHeight || 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                if (targetElement.classList.contains('scroll-animate') && !targetElement.classList.contains('is-visible')) {
                     setTimeout(() => {
                        if (isElementInViewport(targetElement)) {
                            targetElement.classList.add('is-visible');
                        }
                    }, 100); // Delay for smooth scroll
                }
            }
        } else {
             window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) closeMenu();
    }

    eventTriggerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showAllEventsPage();
        });
    });

    homepageEventCTAs.forEach(cta => {
        cta.addEventListener('click', function(e) {
            e.preventDefault();
            // const eventName = this.dataset.eventName; // You can use this if needed
            showAllEventsPage(); // Simplified to just show all events page
        });
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // If it's an event trigger or a CTA handled above, let those handlers work
            if (this.classList.contains('event-trigger') || this.classList.contains('cta-view-event-details')) {
                return;
            }
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                 if (targetId === "events" && allEventsPage) { // Special case for #events link
                    showAllEventsPage();
                } else if (document.getElementById(targetId)) {
                    showMainPageContent(targetId);
                } else {
                    // Fallback if ID not found, maybe go home
                    showMainPageContent();
                }
            }
        });
    });

    homeLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showMainPageContent(); // Scroll to top of main page
        });
    });

    // --- Event Filtering on All Events Page ---
    const filterButtons = document.querySelectorAll('#all-events-page .filter-button');
    const eventCardsOnAllEventsPage = document.querySelectorAll('#all-events-grid .event-card'); // Removed .scroll-animate to select all cards for filtering

    if (filterButtons.length > 0 && eventCardsOnAllEventsPage.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                const filterType = this.dataset.filter;

                eventCardsOnAllEventsPage.forEach(card => {
                    const cardType = card.dataset.eventType;
                    const shouldBeVisible = (filterType === 'all' || cardType === filterType);

                    if (shouldBeVisible) {
                        card.classList.remove('hidden');
                        // Trigger animation if it becomes visible and wasn't
                        if (card.classList.contains('scroll-animate') && !card.classList.contains('is-visible') && isElementInViewport(card)) {
                            card.classList.add('is-visible');
                        }
                    } else {
                        card.classList.add('hidden');
                        card.classList.remove('is-visible'); // Reset visibility if hidden by filter
                    }
                });
            });
        });
    }


    // --- Form Submission to Backend ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Create a div for messages if it doesn't exist
        let formMessageArea = contactForm.querySelector('.form-message-area');
        if (!formMessageArea) {
            formMessageArea = document.createElement('div');
            formMessageArea.className = 'form-message-area mt-4 text-sm'; // Tailwind classes
            // Insert it after the submit button, or at the end of the form
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            if (submitBtn && submitBtn.parentNode) {
                submitBtn.parentNode.insertBefore(formMessageArea, submitBtn.nextSibling);
            } else {
                contactForm.appendChild(formMessageArea);
            }
        }

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            formMessageArea.textContent = ''; // Clear previous messages
            formMessageArea.className = 'form-message-area mt-4 text-sm'; // Reset classes

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');
            const messageInput = document.getElementById('message');
            const agreeCheckbox = document.getElementById('agree');

            // Helper to reset and apply error styles
            const resetError = (el) => { if(el) el.classList.remove('border-red-500'); };
            const setError = (el, msgField) => {
                if(el) el.classList.add('border-red-500');
                if(msgField && formMessageArea.textContent === '') formMessageArea.textContent = msgField;
            };
            const resetAgreeError = () => {
                if (agreeCheckbox) agreeCheckbox.classList.remove('border-red-500');
                const label = agreeCheckbox ? agreeCheckbox.closest('div').querySelector('label') : null;
                if (label) label.classList.remove('text-red-500');
            };
            const setAgreeError = (msg) => {
                 if (agreeCheckbox) agreeCheckbox.classList.add('border-red-500');
                const label = agreeCheckbox ? agreeCheckbox.closest('div').querySelector('label') : null;
                if (label) label.classList.add('text-red-500');
                if (formMessageArea.textContent === '') formMessageArea.textContent = msg;
            };


            resetError(nameInput);
            resetError(emailInput);
            resetError(phoneInput); // Phone is optional, so no error styling unless specific validation needed
            resetError(messageInput);
            resetAgreeError();

            const hoTen = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const soDienThoai = phoneInput ? phoneInput.value.trim() : '';
            const loiNhan = messageInput ? messageInput.value.trim() : '';

            let isValid = true;
            let firstInvalidField = null;

            if (!hoTen) {
                setError(nameInput, 'Vui lòng nhập họ và tên.');
                if (!firstInvalidField) firstInvalidField = nameInput;
                isValid = false;
            }
            if (!email) {
                setError(emailInput, 'Vui lòng nhập địa chỉ email.');
                if (!firstInvalidField) firstInvalidField = emailInput;
                isValid = false;
            } else if (!/^\S+@\S+\.\S+$/.test(email)) {
                setError(emailInput, 'Địa chỉ email không hợp lệ.');
                if (!firstInvalidField) firstInvalidField = emailInput;
                isValid = false;
            }
            if (!loiNhan) {
                setError(messageInput, 'Vui lòng nhập lời nhắn.');
                if(!firstInvalidField) firstInvalidField = messageInput;
                isValid = false;
            }
            if (agreeCheckbox && !agreeCheckbox.checked) {
                setAgreeError('Bạn cần đồng ý với điều khoản và chính sách bảo mật.');
                if (!firstInvalidField) firstInvalidField = agreeCheckbox;
                isValid = false;
            }

            if (!isValid) {
                if (firstInvalidField && typeof firstInvalidField.focus === 'function') {
                    firstInvalidField.focus();
                }
                formMessageArea.classList.add('text-red-600');
                return;
            }

            const formData = {
                hoTen: hoTen,
                email: email,
                soDienThoai: soDienThoai, // Backend handles empty string for optional field
                loiNhan: loiNhan
            };

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Đang gửi...';

            try {
                const response = await fetch('http://localhost:3000/api/contact', { // Ensure this matches your backend port
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const result = await response.json(); // Always try to parse JSON

                if (response.ok) { // Status 200-299
                    formMessageArea.textContent = result.message || 'Gửi thông tin thành công!';
                    formMessageArea.classList.remove('text-red-600');
                    formMessageArea.classList.add('text-green-600');
                    contactForm.reset();
                    if(agreeCheckbox) agreeCheckbox.checked = false; // Uncheck agree
                } else {
                    formMessageArea.textContent = result.message || `Lỗi ${response.status}: Không thể gửi thông tin.`;
                    formMessageArea.classList.add('text-red-600');
                }
            } catch (error) {
                console.error('Lỗi khi gửi form:', error);
                formMessageArea.textContent = 'Đã có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại sau.';
                formMessageArea.classList.add('text-red-600');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }


    // --- Hero Slideshow ---
    const slidesContainer = document.getElementById('hero-slides');
    if (slidesContainer) {
        const slides = slidesContainer.querySelectorAll('.hero-slide');
        let currentSlide = 0;
        const slideInterval = 5000;
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.style.opacity = (i === index) ? '1' : '0';
            });
        }
        function nextSlide() { currentSlide = (currentSlide + 1) % slides.length; showSlide(currentSlide); }
        if (slides.length > 0) {
            slides[currentSlide].style.opacity = '1'; // Show first slide immediately
            setInterval(nextSlide, slideInterval);
        }
    }

    // --- Scroll Animation using Intersection Observer ---
    const animatedElements = document.querySelectorAll('.scroll-animate');
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Optional: unobserve if you want the animation to run only once
                    // observerInstance.unobserve(entry.target);
                } else {
                    // Optional: remove 'is-visible' if you want animations to replay on scroll up/down
                    // if (!entry.target.classList.contains('hidden')) { // Don't remove if hidden by filter
                    //     entry.target.classList.remove('is-visible');
                    // }
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
        });
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        animatedElements.forEach(el => {
            el.classList.add('is-visible');
        });
        console.warn("IntersectionObserver not supported, scroll animations might not work as intended or will all trigger at once.");
    }
});