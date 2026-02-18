// assets/js/main.js
document.addEventListener('DOMContentLoaded', function() {
    // Add copy buttons to code blocks
    document.querySelectorAll('pre').forEach(pre => {
        // Skip if already has copy button
        if (pre.querySelector('.code-copy-btn')) return;
        
        // Add language indicator
        const code = pre.querySelector('code');
        if (code && code.className) {
            const match = code.className.match(/language-(\w+)/);
            if (match) {
                pre.setAttribute('data-language', match[1]);
            }
        }
        
        // Create copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.setAttribute('aria-label', 'Copy code');
        
        // Add click event
        copyBtn.addEventListener('click', async () => {
            const code = pre.querySelector('code').innerText;
            try {
                await navigator.clipboard.writeText(code);
                
                // Show success state
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                copyBtn.classList.add('copied');
                
                // Reset after 2 seconds
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                    copyBtn.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                
                // Show error state
                copyBtn.innerHTML = '<i class="fas fa-times"></i>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            }
        });
        
        pre.appendChild(copyBtn);
        pre.style.position = 'relative'; // Ensure positioning context
    });

    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }

    // Back to top button visibility
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
    }

    // Keyboard navigation detection
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });

    // Dropdown menus
    document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
        const btn = dropdown.querySelector('.dropdown-btn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                dropdown.classList.toggle('open');
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
                dropdown.classList.remove('open');
            });
        }
    });
});
