// ===== MAIN JAVASCRIPT FOR BLOG =====

// Guard to prevent multiple executions
if (!window.copyButtonsInitialized) {
    window.copyButtonsInitialized = true;

    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        
        // ===== COPY BUTTON FOR CODE BLOCKS =====
        // Add a single copy button to the top right of each code block
        function initCopyButtons() {
            const codeBlocks = document.querySelectorAll('.highlight');
            
            codeBlocks.forEach((block) => {
                // Remove ALL existing buttons first (nuke them)
                const existingButtons = block.querySelectorAll('.copy-code-btn');
                existingButtons.forEach(btn => btn.remove());
                
                // Create fresh copy button
                const button = document.createElement('button');
                button.className = 'copy-code-btn';
                button.innerHTML = '<i class="fas fa-copy"></i> Copy';
                button.setAttribute('aria-label', 'Copy code to clipboard');
                button.setAttribute('title', 'Copy to clipboard');
                
                // Add button to code block
                block.appendChild(button);
                
                // Add click event
                button.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    // Get the code content
                    const codeElement = block.querySelector('pre code') || block.querySelector('pre');
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
                        console.error('Failed to copy:', err);
                        button.innerHTML = '<i class="fas fa-times"></i> Failed';
                        
                        setTimeout(() => {
                            button.innerHTML = '<i class="fas fa-copy"></i> Copy';
                        }, 2000);
                        
                        // Fallback
                        fallbackCopy(code, button);
                    }
                });
            });
        }
        
        // Fallback copy method
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
                console.error('Fallback failed:', err);
            }
            
            document.body.removeChild(textarea);
        }
        
        // Initialize once with a slight delay to ensure DOM is ready
        setTimeout(initCopyButtons, 100);
        
        // ===== OTHER FUNCTIONS =====
        function initMobileNav() {
            const navToggle = document.querySelector('.nav-toggle');
            const navMenu = document.querySelector('.nav-menu');
            
            if (navToggle && navMenu) {
                navToggle.addEventListener('click', () => {
                    navMenu.classList.toggle('show');
                    
                    const icon = navToggle.querySelector('i');
                    if (icon.classList.contains('fa-bars')) {
                        icon.classList.remove('fa-bars');
                        icon.classList.add('fa-times');
                    } else {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                });
            }
        }
        
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
        
        function initBackToTop() {
            const backToTop = document.querySelector('.back-to-top');
            
            if (backToTop) {
                window.addEventListener('scroll', () => {
                    if (window.scrollY > 300) {
                        backToTop.classList.add('visible');
                    } else {
                        backToTop.classList.remove('visible');
                    }
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
        
        // Initialize other functions
        initMobileNav();
        initDropdowns();
        initBackToTop();
    });
}
