// ===== MAIN JAVASCRIPT FOR BLOG =====

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Flag to prevent multiple initializations
    let copyButtonsInitialized = false;
    
    // ===== COPY BUTTON FOR CODE BLOCKS =====
    // Add a single copy button to the top right of each code block
    function initCopyButtons() {
        // Prevent multiple initializations
        if (copyButtonsInitialized) return;
        
        const codeBlocks = document.querySelectorAll('.highlight');
        
        codeBlocks.forEach((block) => {
            // Remove any existing duplicate buttons first
            const existingButtons = block.querySelectorAll('.copy-code-btn');
            existingButtons.forEach(btn => btn.remove());
            
            // Create copy button
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
                e.preventDefault(); // Prevent any default behavior
                
                // Get the code content
                const codeElement = block.querySelector('pre code') || block.querySelector('pre');
                const code = codeElement ? codeElement.textContent : '';
                
                try {
                    // Copy to clipboard
                    await navigator.clipboard.writeText(code);
                    
                    // Visual feedback - success
                    button.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    button.classList.add('copied');
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        button.innerHTML = '<i class="fas fa-copy"></i> Copy';
                        button.classList.remove('copied');
                    }, 2000);
                    
                } catch (err) {
                    console.error('Failed to copy code:', err);
                    
                    // Visual feedback - error
                    button.innerHTML = '<i class="fas fa-times"></i> Failed';
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        button.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    }, 2000);
                    
                    // Fallback for older browsers
                    fallbackCopy(code, button);
                }
            });
        });
        
        // Set flag to true after initialization
        copyButtonsInitialized = true;
    }
    
    // Fallback copy method for older browsers
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
            console.error('Fallback copy failed:', err);
            button.innerHTML = '<i class="fas fa-times"></i> Failed';
            
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
        }
        
        document.body.removeChild(textarea);
    }
    
    // ===== MOBILE NAVIGATION TOGGLE =====
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
            
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('show');
                    const icon = navToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        }
    }
    
    // ===== DROPDOWN NAVIGATION =====
    function initDropdowns() {
        const dropdowns = document.querySelectorAll('.nav-dropdown');
        
        dropdowns.forEach((dropdown) => {
            const btn = dropdown.querySelector('.dropdown-btn');
            
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    dropdowns.forEach((d) => {
                        if (d !== dropdown) {
                            d.classList.remove('open');
                        }
                    });
                    
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
    
    // ===== BACK TO TOP BUTTON =====
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
    
    // ===== KEYBOARD NAVIGATION DETECTION =====
    function initKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
    
    // ===== CLEANUP FUNCTION FOR DUPLICATE BUTTONS =====
    function cleanupDuplicateButtons() {
        const codeBlocks = document.querySelectorAll('.highlight');
        codeBlocks.forEach((block) => {
            const buttons = block.querySelectorAll('.copy-code-btn');
            // If there's more than one button, keep only the last one
            if (buttons.length > 1) {
                for (let i = 0; i < buttons.length - 1; i++) {
                    buttons[i].remove();
                }
            }
        });
    }
    
    // ===== INITIALIZE ALL FUNCTIONS =====
    // Clean up any existing duplicates first
    cleanupDuplicateButtons();
    
    // Initialize copy buttons
    initCopyButtons();
    
    // Initialize other functions
    initMobileNav();
    initDropdowns();
    initBackToTop();
    initKeyboardNav();
    
    // ===== OBSERVE DYNAMIC CONTENT WITH DEBOUNCE =====
    let timeout;
    const observer = new MutationObserver((mutations) => {
        // Check if new code blocks were added
        const hasNewCodeBlocks = Array.from(mutations).some(mutation => 
            Array.from(mutation.addedNodes).some(node => 
                node.nodeType === 1 && (node.classList?.contains('highlight') || node.querySelector?.('.highlight'))
            )
        );
        
        if (hasNewCodeBlocks) {
            // Clear any existing timeout
            clearTimeout(timeout);
            
            // Set a new timeout to initialize after mutations stop
            timeout = setTimeout(() => {
                // Reset flag to allow reinitialization for new content
                copyButtonsInitialized = false;
                cleanupDuplicateButtons();
                initCopyButtons();
            }, 100);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
