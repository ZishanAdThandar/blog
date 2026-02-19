// ===== MAIN JAVASCRIPT FOR BLOG =====

// Prevent multiple executions globally
if (!window.copyButtonsInitialized) {
    window.copyButtonsInitialized = true;

    document.addEventListener('DOMContentLoaded', function () {

        // ===== COPY BUTTON FOR CODE BLOCKS =====
        function initCopyButtons() {

            // Target ONLY top-level highlight blocks (avoid nested Rouge wrappers)
            const codeBlocks = document.querySelectorAll(
                '.highlight:not(.highlight .highlight)'
            );

            codeBlocks.forEach((block) => {

                // Remove existing buttons safely
                block.querySelectorAll('.copy-code-btn').forEach(btn => btn.remove());

                // Ensure block is positioned correctly
                block.style.position = 'relative';

                // Create button
                const button = document.createElement('button');
                button.className = 'copy-code-btn';
                button.innerHTML = '<i class="fas fa-copy"></i> Copy';
                button.setAttribute('aria-label', 'Copy code to clipboard');
                button.setAttribute('title', 'Copy to clipboard');

                block.appendChild(button);

                // Click handler
                button.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    const codeElement =
                        block.querySelector('pre code') ||
                        block.querySelector('pre');

                    const code = codeElement ? codeElement.textContent : '';

                    try {
                        await navigator.clipboard.writeText(code);

                        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
                        button.classList.add('copied');

                        setTimeout(() => {
                            button.innerHTML = '<i class="fas fa-copy"></i> Copy';
                            button.classList.remove('copied');
                        }, 2000);

                    } catch (err) {
                        fallbackCopy(code, button);
                    }
                });
            });
        }

        // Fallback method
        function fallbackCopy(text, button) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);

            try {
                textarea.select();
                document.execCommand('copy');

                button.innerHTML = '<i class="fas fa-check"></i> Copied!';
                button.classList.add('copied');

                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    button.classList.remove('copied');
                }, 2000);

            } catch (err) {
                button.innerHTML = '<i class="fas fa-times"></i> Failed';
            }

            document.body.removeChild(textarea);
        }

        // Run once
        initCopyButtons();


        // ===== MOBILE NAV =====
        function initMobileNav() {
            const navToggle = document.querySelector('.nav-toggle');
            const navMenu = document.querySelector('.nav-menu');

            if (navToggle && navMenu) {
                navToggle.addEventListener('click', () => {
                    navMenu.classList.toggle('show');

                    const icon = navToggle.querySelector('i');
                    if (!icon) return;

                    icon.classList.toggle('fa-bars');
                    icon.classList.toggle('fa-times');
                });
            }
        }

        // ===== DROPDOWNS =====
        function initDropdowns() {
            const dropdowns = document.querySelectorAll('.nav-dropdown');

            dropdowns.forEach((dropdown) => {
                const btn = dropdown.querySelector('.dropdown-btn');

                if (btn) {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        dropdown.classList.toggle('open');
                    });
                }
            });

            document.addEventListener('click', () => {
                dropdowns.forEach((dropdown) => {
                    dropdown.classList.remove('open');
                });
            });
        }

        // ===== BACK TO TOP =====
        function initBackToTop() {
            const backToTop = document.querySelector('.back-to-top');

            if (backToTop) {
                window.addEventListener('scroll', () => {
                    backToTop.classList.toggle('visible', window.scrollY > 300);
                });

                backToTop.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
            }
        }

        // Initialize other UI
        initMobileNav();
        initDropdowns();
        initBackToTop();

    });
}
