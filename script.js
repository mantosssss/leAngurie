// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Handle multiple Lottie player options with priority
    const handleLottieAnimations = async () => {
        const lottiePlayer = document.getElementById('lottie-animation');
        const dotLottiePlayer = document.getElementById('dotlottie-animation');
        const fallbackSpinner = document.getElementById('fallback-spinner');
        
        // Prova a utilizzare il nuovo file animation.json come prima opzione
        try {
            const jsonResponse = await fetch('animation.json', { method: 'HEAD' });
            if (jsonResponse.ok && lottiePlayer) {
                console.log('Using lottie-player with animation.json');
                // Il player è già configurato nell'HTML per usare animation.json
                if (fallbackSpinner) fallbackSpinner.style.display = 'none';
                return;
            }
        } catch (error) {
            console.log('Error with animation.json file:', error);
        }
        
        // Se non funziona, mostra lo spinner di fallback
        if (lottiePlayer) lottiePlayer.style.display = 'none';
        if (dotLottiePlayer) dotLottiePlayer.style.display = 'none';
        if (fallbackSpinner) fallbackSpinner.style.display = 'block';
    };
    
    // Initialize Lottie animations
    handleLottieAnimations();

    // Hide loading overlay when page is fully loaded
    window.addEventListener('load', function() {
        setTimeout(() => {
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
                // Remove from DOM after transition completes
                setTimeout(() => {
                    loadingOverlay.remove();
                    
                    // Start the background video after loading is complete
                    // but only on mobile devices
                    startBackgroundVideo();
                }, 500);
            }
        }, 1000); // Show loading for at least 1 second
    });

    // Function to handle the background video
    const startBackgroundVideo = () => {
        // Check if we're on a mobile device
        const isMobile = window.innerWidth <= 768;
        const bgVideo = document.getElementById('mobile-bg-video');
        const videoContainer = document.querySelector('.mobile-video-container');
        const heroSection = document.querySelector('.hero');
        
        if (!bgVideo || !videoContainer || !heroSection) {
            console.log('Missing required elements for video background');
            return;
        }
        
        // Function to update video container size
        const updateVideoSize = () => {
            const heroHeight = heroSection.offsetHeight;
            videoContainer.style.height = `${heroHeight}px`;
        };
        
        // Initial size update
        updateVideoSize();
        
        // Function to handle mobile view
        const setupMobileView = () => {
            bgVideo.style.display = 'block';
            videoContainer.style.display = 'block';
            
            // Try to play the video
            const playPromise = bgVideo.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Video playing successfully on mobile');
                }).catch(error => {
                    console.log('Autoplay prevented:', error);
                    
                    // Add a play button for user interaction
                    const playButton = document.createElement('button');
                    playButton.classList.add('video-play-btn');
                    playButton.innerHTML = '<i class="fas fa-play"></i>';
                    videoContainer.appendChild(playButton);
                    
                    playButton.addEventListener('click', () => {
                        bgVideo.play();
                        playButton.style.display = 'none';
                    });
                });
            }
        };
        
        // Function to handle desktop view
        const setupDesktopView = () => {
            bgVideo.style.display = 'none';
            videoContainer.style.display = 'none';
            bgVideo.pause();
            bgVideo.currentTime = 0;
        };
        
        // Setup based on initial device state
        if (isMobile) {
            setupMobileView();
        } else {
            setupDesktopView();
        }
        
        // Handle resize events
        window.addEventListener('resize', () => {
            const isNowMobile = window.innerWidth <= 768;
            
            // Update size regardless of device change
            updateVideoSize();
            
            // Handle device category changes
            if (isNowMobile !== isMobile) {
                if (isNowMobile) {
                    setupMobileView();
                } else {
                    setupDesktopView();
                }
            }
        });
    };

    // Implementazione migliorata dello smooth scroll
    const setupSmoothScroll = () => {
        // Prendi tutti i link che hanno href che inizia con #
        const scrollLinks = document.querySelectorAll('a[href^="#"]');
        
        scrollLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (!targetElement) return; // Se l'elemento target non esiste, esci
                
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                // Calcola la durata dell'animazione in base alla distanza
                const startPosition = window.pageYOffset;
                const distance = targetPosition - startPosition;
                const duration = Math.min(Math.max(Math.abs(distance) / 5, 800), 1500); // Tra 800ms e 1500ms, in base alla distanza
                
                const start = performance.now();
                
                // Funzione di animazione con easing
                const animateScroll = function(currentTime) {
                    const timeElapsed = currentTime - start;
                    const progress = Math.min(timeElapsed / duration, 1);
                    
                    // Funzione di easing (easeInOutQuad)
                    const easeInOutQuad = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                    
                    window.scrollTo(0, startPosition + distance * easeInOutQuad(progress));
                    
                    if (timeElapsed < duration) {
                        requestAnimationFrame(animateScroll);
                    }
                };
                
                requestAnimationFrame(animateScroll);
            });
        });
    };
    
    // Inizializza lo smooth scroll
    setupSmoothScroll();

    // Add smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Rimuovi l'event listener per evitare conflitti con la funzione setupSmoothScroll
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            const headerHeight = document.querySelector('header').offsetHeight;
            
            window.scrollTo({
                top: targetElement.offsetTop - headerHeight,
                behavior: 'smooth'
            });
        });
    });
    
    // Scroll-triggered animations
    const sections = document.querySelectorAll('section');
    
    // Function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    // Add animation class when scrolling
    function animateSections() {
        sections.forEach(section => {
            if (isInViewport(section) && !section.classList.contains('animated')) {
                section.classList.add('animated');
                section.style.opacity = 1;
                section.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Set initial state for sections
    sections.forEach(section => {
        if (section.classList.contains('hero')) return; // Skip hero section
        section.style.opacity = 0;
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    // Run on scroll and on page load
    window.addEventListener('scroll', animateSections);
    animateSections(); // Run once at load
    
    // Form submission
    const contactForm = document.querySelector('.contact-form form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form inputs
            const nameInput = this.querySelector('input[type="text"]');
            const emailInput = this.querySelector('input[type="email"]');
            const messageInput = this.querySelector('textarea');
            
            // Simple validation
            if (nameInput.value.trim() === '' || 
                emailInput.value.trim() === '' || 
                messageInput.value.trim() === '') {
                alert('Per favore, compila tutti i campi');
                return;
            }
            
            // Success message (in a real app, this would send data to a server)
            alert('Grazie per il tuo messaggio! Ti contatteremo presto.');
            
            // Reset form
            this.reset();
        });
    }
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
            
            // Toggle aria-expanded attribute for accessibility
            const expanded = this.getAttribute('aria-expanded') === 'true' || false;
            this.setAttribute('aria-expanded', !expanded);
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenuBtn.contains(event.target) && !mainNav.contains(event.target) && mainNav.classList.contains('active')) {
                mobileMenuBtn.classList.remove('active');
                mainNav.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Responsive handling for other elements
    window.addEventListener('resize', function() {
        // Any responsive handling needed
    });

    // Funzione migliorata per attivare effetti hover durante lo scroll
    function setupScrollHoverEffects() {
        console.log('Configurazione effetti hover su scroll');
        
        // Verifica se è un dispositivo mobile
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        
        if (!isMobile) {
            console.log('Non è un dispositivo mobile, effetti hover su scroll disabilitati');
            return;
        }
        
        // Elementi con effetti hover da attivare durante lo scrolling
        const hoverElements = [
            '.feature', 
            '.menu-item',
            '.review-card',
            '.social-icon-large',
            '.footer-logo-img',
            '.social-icons a',
            '.footer-links a'
        ];
        
        // Configura l'IntersectionObserver con opzioni più sensibili
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log('Elemento in vista:', entry.target);
                    
                    // Quando l'elemento diventa visibile, aggiungi la classe dopo un breve ritardo
                    setTimeout(() => {
                        entry.target.classList.add('hover-activated');
                        console.log('Classe hover-activated aggiunta:', entry.target);
                        
                        // Rimuovi la classe dopo l'animazione
                        setTimeout(() => {
                            entry.target.classList.remove('hover-activated');
                            console.log('Classe hover-activated rimossa:', entry.target);
                        }, 1200); // Durata più lunga per l'effetto (1.2 secondi)
                    }, 200); // Ritardo ridotto per una risposta più veloce
                }
            });
        }, { 
            threshold: 0.3, // Attiva quando l'elemento è visibile al 30% (più sensibile)
            rootMargin: '0px 0px -10% 0px' // Attiva un po' prima che l'elemento sia completamente visibile
        });
        
        // Seleziona e osserva tutti gli elementi specificati negli array
        console.log('Elementi da osservare:');
        hoverElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            console.log(`- ${selector}: ${elements.length} elementi trovati`);
            
            elements.forEach(element => {
                observer.observe(element);
            });
        });
    }
    
    // Assicurati che la pagina sia completamente caricata prima di configurare gli effetti
    if (document.readyState === 'complete') {
        setupScrollHoverEffects();
    } else {
        window.addEventListener('load', setupScrollHoverEffects);
    }
}); 