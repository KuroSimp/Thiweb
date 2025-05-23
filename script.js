// IMPORTANT: Tailwind CSS Configuration
// When using Tailwind CSS via CDN, this configuration object (tailwind.config)
// typically needs to be defined *before* the main Tailwind CDN script is loaded,
// or the CDN script needs a specific way to pick up this config.
// Placing this in an external JS file loaded *after* the Tailwind CDN script
// might prevent these custom configurations (colors, borderRadius, etc.) from being applied.
// If your custom colors (primary, accent, secondary) or border-radius don't work,
// consider moving this 'tailwind.config' block into a <script> tag in your HTML,
// right BEFORE the <script src="https://cdn.tailwindcss.com/3.4.16"></script> line.
// Alternatively, use Tailwind CSS with a build process (like PostCSS with Tailwind CLI)
// for more robust configuration management.

tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#D82E2F', // Traditional Red
                'primary-darker': '#B82829', // Darker Red for hover
                accent: '#F1C40F',  // Gold/Yellow
                secondary: '#FEF9E7' // Light Gold/Cream
            },
            borderRadius: {
                'none': '0px', 'sm': '4px', DEFAULT: '8px', 'md': '12px', 'lg': '16px',
                'xl': '20px', '2xl': '24px', '3xl': '32px', 'full': '9999px', 'button': '8px'
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Functionality
    const mobileMenuButton = document.getElementById('mobile-menu-button'); // Make sure this ID is on your menu button
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenuButton = document.getElementById('close-menu');
    const menuContent = mobileMenu ? mobileMenu.querySelector('.mobile-menu-content') : null; // Ensure .mobile-menu-content class is on the sliding panel
    const mobileMenuLinks = mobileMenu ? mobileMenu.querySelectorAll('nav a') : []; // More specific selector for links within mobile menu nav

    function openMenu() {
        if (mobileMenu && menuContent) {
            mobileMenu.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
            setTimeout(() => {
                menuContent.classList.remove('-translate-x-full');
            }, 10); // Small delay to ensure 'hidden' is removed first for transition
        }
    }

    function closeMenu() {
        if (mobileMenu && menuContent) {
            menuContent.classList.add('-translate-x-full');
            document.body.style.overflow = ''; // Restore background scroll
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300); // Match transition duration
        }
    }

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', openMenu);
    }
    if (closeMenuButton) {
        closeMenuButton.addEventListener('click', closeMenu);
    }

    // Close menu if clicking on the overlay (background)
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function(e) {
            if (e.target === mobileMenu) { // Clicked on the semi-transparent overlay
                closeMenu();
            }
        });
    }

    // Close menu when a link inside it is clicked
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('hidden')) {
            closeMenu();
        }
    });


    // Smooth Scroll Functionality
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Ensure it's a valid internal link and not just "#"
            if (href && href.length > 1 && href.startsWith('#')) {
                try {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        e.preventDefault();
                        const header = document.querySelector('header');
                        const headerOffset = header ? header.offsetHeight : 70; // Default offset if header not found or fixed
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                } catch (error) {
                    // Catch errors if querySelector fails (e.g., invalid href)
                    console.error("Error finding element for smooth scroll:", href, error);
                }
            } else if (href === '#') {
                // Handle links that are just "#" - typically scroll to top
                // e.preventDefault(); // Uncomment if you want to prevent default jump for plain "#"
                // window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            // Note: If it's a mobile menu link, closeMenu() is already handled by its own listener.
        });
    });


    // Contact Form Validation and Submission
    const contactForm = document.getElementById('contactForm'); // Make sure this ID is on your form
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // e.preventDefault(); // Prevent actual submission for demo; remove/comment for real submission

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone'); // Assuming you have an ID 'phone' for the phone input
            const messageInput = document.getElementById('message'); // Assuming you have an ID 'message' for the textarea
            const agreeCheckbox = document.getElementById('agree');
            let isValid = true;
            let firstInvalidField = null;

            // Helper to reset and set error state for Tailwind
            function setFieldValidity(field, condition, isCheckbox = false) {
                const errorBorderClass = 'border-red-500'; // Tailwind class for error border
                const defaultBorderClass = 'border-gray-300'; // Default border
                const errorTextClass = 'text-red-500'; // Tailwind class for error text on labels

                if (condition) {
                    field.classList.remove(errorBorderClass);
                    if (!isCheckbox) field.classList.add(defaultBorderClass); // Re-add default if not error
                    if (isCheckbox) {
                        const label = field.nextElementSibling;
                        if (label) label.classList.remove(errorTextClass);
                        field.classList.remove(errorBorderClass); // For custom-checkbox error border
                    }
                } else {
                    field.classList.add(errorBorderClass);
                    if (!isCheckbox) field.classList.remove(defaultBorderClass);
                    isValid = false;
                    if (!firstInvalidField) firstInvalidField = field;
                    if (isCheckbox) {
                        const label = field.nextElementSibling;
                        if (label) label.classList.add(errorTextClass);
                        // field.classList.add(errorBorderClass); // This is already done by Tailwind utility
                    }
                }
            }

            // Reset all fields first to clear previous errors
            [nameInput, emailInput, phoneInput, messageInput].forEach(f => {
                if(f) {
                    f.classList.remove('border-red-500');
                    f.classList.add('border-gray-300'); // Ensure default border
                }
            });
            if (agreeCheckbox) {
                const agreeLabel = agreeCheckbox.nextElementSibling;
                agreeCheckbox.classList.remove('border-red-500'); // For custom-checkbox error
                if (agreeLabel) agreeLabel.classList.remove('text-red-500');
            }
            isValid = true;
            firstInvalidField = null;


            // Validate fields
            setFieldValidity(nameInput, nameInput && nameInput.value.trim() !== "");
            setFieldValidity(emailInput, emailInput && emailInput.value.trim() !== "" && /^\S+@\S+\.\S+$/.test(emailInput.value));

            // Optional: Validate phone and message if they are required
            // Example: making phone required
            // setFieldValidity(phoneInput, phoneInput && phoneInput.value.trim() !== "");
            // Example: making message required
            // setFieldValidity(messageInput, messageInput && messageInput.value.trim() !== "");


            if (agreeCheckbox) {
                setFieldValidity(agreeCheckbox, agreeCheckbox.checked, true);
            }

            if (!isValid) {
                e.preventDefault(); // Prevent submission if invalid
                if (firstInvalidField) {
                    firstInvalidField.focus();
                }
                // alert('Vui lòng kiểm tra lại các trường thông tin được đánh dấu đỏ.');
            } else {
                // If form is valid and you're doing a demo submission:
                e.preventDefault();
                alert('Cảm ơn bạn đã gửi thông tin! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
                contactForm.reset();
                // Explicitly remove error styles after reset, as reset doesn't trigger class changes by itself
                [nameInput, emailInput, phoneInput, messageInput].forEach(f => {
                    if(f) {
                        f.classList.remove('border-red-500');
                        f.classList.add('border-gray-300');
                    }
                });
                if (agreeCheckbox) {
                    const agreeLabel = agreeCheckbox.nextElementSibling;
                    agreeCheckbox.classList.remove('border-red-500');
                    if (agreeLabel) agreeLabel.classList.remove('text-red-500');
                    agreeCheckbox.checked = false; // Ensure checkbox is visually reset
                }
            }
        });
    }
});