document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // Update Dynamic Year in Footer
    // ----------------------------------------------------
    const currentYearEl = document.getElementById('current-year');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    // ----------------------------------------------------
    // Mobile Navigation Toggle
    // ----------------------------------------------------
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-link');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Close mobile menu when a link is clicked
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ----------------------------------------------------
    // Navbar Scroll Effect & Active Link Highlight
    // ----------------------------------------------------
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        // Navbar Scrolled State
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active Link Highlight
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').substring(1) === current) {
                item.classList.add('active');
            }
        });
    });

    // ----------------------------------------------------
    // Intersection Observer for Scroll Animations
    // ----------------------------------------------------
    const animationSelectors = ['.fade-up', '.fade-left', '.fade-right', '.zoom-in', '.flip-up', '.bounce-in'];
    
    // Fallback for older browsers
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll(animationSelectors.join(', ')).forEach(el => {
            el.classList.add('fade-in');
        });
    } else {
        const appearOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };

        const appearOnScroll = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    // Optional: stop observing once it has appeared
                    // observer.unobserve(entry.target);
                } else {
                    // Optional: remove class when scrolling up to animate again
                    // entry.target.classList.remove('fade-in');
                }
            });
        }, appearOptions);

        animationSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                appearOnScroll.observe(el);
            });
        });
    }

    // ----------------------------------------------------
    // Fetch GitHub Projects dynamically
    // ----------------------------------------------------
    const fetchGitHubProjects = async () => {
        const container = document.getElementById('projects-container');
        if (!container) return;

        try {
            // Fetch public repos from GitHub API
            const response = await fetch('https://api.github.com/users/codewithjoyal/repos?sort=updated');
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const repos = await response.json();
            
            // Filter out specific repos if needed, sort by recency or stars. 
            // Here we take top 6 most recently updated repositories
            const topProjects = repos
                .filter(repo => !repo.fork) // Exclude forks if desired
                .slice(0, 6);
                
            container.innerHTML = ''; // Clear loading spinner

            if (topProjects.length === 0) {
                container.innerHTML = '<p>No projects found. Check out my GitHub profile!</p>';
                return;
            }

            topProjects.forEach(repo => {
                // Determine icons based on language
                let techIcon = '';
                if (repo.language === 'JavaScript') techIcon = '<i class="fa-brands fa-js" style="color:#f7df1e"></i>';
                else if (repo.language === 'HTML') techIcon = '<i class="fa-brands fa-html5" style="color:#e34c26"></i>';
                else if (repo.language === 'C#') techIcon = '<i class="fa-solid fa-c" style="color:#239120"></i>';
                else if (repo.language === 'Python') techIcon = '<i class="fa-brands fa-python" style="color:#3776ab"></i>';
                else techIcon = '<i class="fa-solid fa-code"></i>';

                const html = `
                    <div class="project-card glass-panel zoom-in">
                        <div class="project-header">
                            <i class="fa-regular fa-folder folder-icon"></i>
                            <div class="project-links">
                                ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" title="Live Demo"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
                                <a href="${repo.html_url}" target="_blank" title="GitHub Repo"><i class="fa-brands fa-github"></i></a>
                            </div>
                        </div>
                        <h3 class="project-title">${repo.name.replace(/-/g, ' ')}</h3>
                        <p class="project-desc">${repo.description || 'A project developed to showcase skills and solve specific technical challenges.'}</p>
                        <div class="project-tech">
                            <span>${techIcon} ${repo.language || 'Code'}</span>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', html);
            });

            // Need to observe newly added elements for scroll animations
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            setTimeout(() => {
                                entry.target.classList.add('fade-in');
                            }, 100); // slight delay for visual stagger
                        }
                    });
                }, { threshold: 0.1 });
                
                container.querySelectorAll('.zoom-in').forEach(el => observer.observe(el));
            } else {
                container.querySelectorAll('.zoom-in').forEach(el => el.classList.add('fade-in'));
            }

        } catch (error) {
            console.error('Error fetching projects:', error);
            // Fallback UI if API fails
            container.innerHTML = `
                <div class="glass-panel" style="grid-column: 1/-1; text-align:center; padding: 40px;">
                    <i class="fa-brands fa-github" style="font-size: 3rem; margin-bottom: 20px; color: var(--text-secondary)"></i>
                    <h3>Unable to load projects right now</h3>
                    <p style="margin-top:10px; color: var(--text-muted)">Please visit my GitHub profile directly to see my work.</p>
                </div>
            `;
        }
    };

    fetchGitHubProjects();

    // ----------------------------------------------------
    // 3D Tilt Effect for Profile Card
    // ----------------------------------------------------
    const tiltCard = document.getElementById('hero-tilt');
    if (tiltCard) {
        tiltCard.addEventListener('mousemove', (e) => {
            const rect = tiltCard.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate rotation (max 15 degrees)
            const rotateX = ((y - centerY) / centerY) * -15;
            const rotateY = ((x - centerX) / centerX) * 15;
            
            const card = tiltCard.querySelector('.profile-card');
            if(card) {
                card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }
        });
        
        tiltCard.addEventListener('mouseleave', () => {
            const card = tiltCard.querySelector('.profile-card');
            if(card) {
                card.style.transform = `rotateX(0) rotateY(0)`;
                // Add quick transition for reset
                card.style.transition = 'transform 0.5s ease-out';
                setTimeout(() => {
                    card.style.transition = 'transform 0.1s ease-out';
                }, 500);
            }
        });
    }

    // ----------------------------------------------------
    // Seamless Google Form Submission Handling
    // ----------------------------------------------------
    let formSubmitted = false;
    const contactForm = document.getElementById('contact-form');
    const hiddenIframe = document.getElementById('hidden_iframe');
    const successMsg = document.getElementById('form-success-msg');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm && hiddenIframe && successMsg) {
        contactForm.addEventListener('submit', () => {
            formSubmitted = true;
            if(submitBtn) {
                submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
                submitBtn.disabled = true;
            }
        });

        hiddenIframe.addEventListener('load', () => {
            if (formSubmitted) {
                // Form was submitted successfully
                contactForm.style.display = 'none';
                successMsg.style.display = 'block';
                formSubmitted = false; // reset
            }
        });
    }

    // ----------------------------------------------------
    // Three.js 3D Particle Animation Background
    // ----------------------------------------------------
    const canvas = document.getElementById('particle-canvas');
    if (canvas && window.THREE) {
        // Scene Setup
        const scene = new THREE.Scene();
        // Add subtle fog to fade particles in the distance
        scene.fog = new THREE.FogExp2(0x0a0a0f, 0.0008);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.z = 1000;

        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Particle Geometry Setup
        const particleCount = 2500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const themeColors = [
            new THREE.Color('#6366f1'), // Indigo (Primary)
            new THREE.Color('#ec4899'), // Pink (Secondary)
            new THREE.Color('#14b8a6')  // Teal (Accent)
        ];

        for (let i = 0; i < particleCount; i++) {
            // Generating a field of particles within a giant sphere
            const r = 2000;
            const x = r * (Math.random() - 0.5);
            const y = r * (Math.random() - 0.5);
            const z = r * (Math.random() - 0.5);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Assign random theme color to each particle
            const color = themeColors[Math.floor(Math.random() * themeColors.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Create elegant glowing circular sprite via Canvas for particle texture
        const canvasSprite = document.createElement('canvas');
        canvasSprite.width = 32;
        canvasSprite.height = 32;
        const context = canvasSprite.getContext('2d');
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);
        
        const particleTexture = new THREE.CanvasTexture(canvasSprite);

        // Particle Material
        const material = new THREE.PointsMaterial({
            size: 15,
            vertexColors: true,
            map: particleTexture,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            opacity: 0.8
        });

        const particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);

        // Interaction State for Parallax Parallax Effect
        let mouseX = 0;
        let mouseY = 0;
        
        let windowHalfX = window.innerWidth / 2;
        let windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - windowHalfX) * 0.5;
            mouseY = (event.clientY - windowHalfY) * 0.5;
        });

        // Touch support for Mobile parallax
        document.addEventListener('touchmove', (event) => {
            if (event.touches.length > 0) {
                mouseX = (event.touches[0].clientX - windowHalfX) * 1.5;
                mouseY = (event.touches[0].clientY - windowHalfY) * 1.5;
            }
        }, { passive: true });

        // Handle Window Resize
        window.addEventListener('resize', () => {
            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Animation Loop
        function animate() {
            requestAnimationFrame(animate);

            // Subtle auto-rotation of the entire particle cloud
            particleSystem.rotation.y += 0.001;
            particleSystem.rotation.x += 0.0005;

            // Smooth parallax formula: current + (target - current) * easing
            camera.position.x += (mouseX - camera.position.x) * 0.02;
            camera.position.y += (-mouseY - camera.position.y) * 0.02;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        }

        animate();
    }
});
