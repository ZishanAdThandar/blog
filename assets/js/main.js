// ===== MAIN JAVASCRIPT FOR BLOG =====

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== COPY BUTTON FOR CODE BLOCKS =====
    // Add copy buttons to all code blocks with terminal header integration
    function initCopyButtons() {
        const codeBlocks = document.querySelectorAll('.highlight');
        
        codeBlocks.forEach((block) => {
            // Skip if button already exists
            if (block.querySelector('.copy-code-btn')) return;
            
            // Create copy button
            const button = document.createElement('button');
            button.className = 'copy-code-btn';
            button.innerHTML = '<i class="fas fa-copy"></i> Copy';
            button.setAttribute('aria-label', 'Copy code to clipboard');
            button.setAttribute('title', 'Copy to clipboard');
            
            // Add button to code block (it will be positioned in the terminal header via CSS)
            block.appendChild(button);
            
            // Add click event
            button.addEventListener('click', async (e) => {
                e.stopPropagation(); // Prevent event bubbling
                
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
                
                // Toggle icon between bars and times
                const icon = navToggle.querySelector('i');
                if (icon.classList.contains('fa-bars')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
            
            // Close menu when clicking outside
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
                    
                    // Close other dropdowns
                    dropdowns.forEach((d) => {
                        if (d !== dropdown) {
                            d.classList.remove('open');
                        }
                    });
                    
                    // Toggle current dropdown
                    dropdown.classList.toggle('open');
                });
            }
        });
        
        // Close dropdowns when clicking outside
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
        // Add class to body when using keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
    
    // ===== RANDOM POST BUTTON =====
    function initRandomPost() {
        const randomBtn = document.getElementById('random-post-btn');
        
        if (randomBtn) {
            randomBtn.addEventListener('click', async () => {
                try {
                    // Fetch all posts (you'll need to generate this list in Jekyll)
                    const response = await fetch('/sitemap.xml');
                    const text = await response.text();
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(text, 'text/xml');
                    const urls = Array.from(xml.querySelectorAll('url loc'))
                        .map(loc => loc.textContent)
                        .filter(url => !url.includes('/posts/') && url !== 'https://yourblog.com/');
                    
                    if (urls.length > 0) {
                        const randomUrl = urls[Math.floor(Math.random() * urls.length)];
                        window.location.href = randomUrl;
                    }
                } catch (err) {
                    console.error('Failed to load random post:', err);
                }
            });
        }
    }
    
    // ===== IMAGE LAZY LOADING =====
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach((img) => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach((img) => {
                img.src = img.dataset.src;
            });
        }
    }
    
    // ===== CODE BLOCK LINE NUMBERS (optional) =====
    function initLineNumbers() {
        // Check if line numbers are enabled in config
        const showLineNumbers = document.body.classList.contains('show-line-numbers');
        
        if (showLineNumbers) {
            const codeBlocks = document.querySelectorAll('.highlight pre');
            
            codeBlocks.forEach((block) => {
                const lines = block.innerHTML.split('\n');
                let numberedHtml = '';
                
                lines.forEach((line, index) => {
                    if (line.trim() !== '') {
                        numberedHtml += `<span class="line">${line}</span>`;
                    }
                });
                
                block.innerHTML = numberedHtml;
            });
        }
    }
    
    // ===== INITIALIZE ALL FUNCTIONS =====
    initCopyButtons();
    initMobileNav();
    initDropdowns();
    initBackToTop();
    initKeyboardNav();
    initRandomPost();
    initLazyLoading();
    initLineNumbers();
    
    // ===== OBSERVE DYNAMIC CONTENT =====
    // For pages that load content dynamically (like pagination)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                // Re-initialize copy buttons for new content
                initCopyButtons();
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
});

// ===== SERVICE WORKER FOR OFFLINE SUPPORT (optional) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

// ===== EXPOSE FUNCTIONS FOR DEBUGGING (remove in production) =====
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debug = {
        initCopyButtons: initCopyButtons,
        initMobileNav: initMobileNav,
        initDropdowns: initDropdowns
    };
}
