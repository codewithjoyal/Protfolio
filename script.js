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
    const animationSelectors = ['.fade-up', '.fade-left', '.fade-right'];
    
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
                    <div class="project-card glass-panel fade-up">
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
                
                container.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
            } else {
                container.querySelectorAll('.fade-up').forEach(el => el.classList.add('fade-in'));
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
    // Mouse Tracker Particle Network Effect
    // ----------------------------------------------------
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        // Configuration
        let particles = [];
        const particleCount = 80; // Adjust for density
        const connectDistance = 120;
        const baseSize = 2;
        const particleSpeed = 0.5;
        
        let mouse = {
            x: null,
            y: null,
            radius: 150
        };

        // Resize Canvas
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Mouse Event Listeners
        window.addEventListener('mousemove', (event) => {
            mouse.x = event.x;
            mouse.y = event.y;
        });

        window.addEventListener('mouseout', () => {
            mouse.x = undefined;
            mouse.y = undefined;
        });

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                // Move in random directions
                this.directionX = (Math.random() - 0.5) * particleSpeed;
                this.directionY = (Math.random() - 0.5) * particleSpeed;
                this.size = Math.random() * baseSize + 1;
                // Base colors from theme
                const colors = ['#6366f1', '#ec4899', '#14b8a6'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                // Bounce off edges
                if (this.x > canvas.width || this.x < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y > canvas.height || this.y < 0) {
                    this.directionY = -this.directionY;
                }

                // Collision detection with mouse (push particles away gently)
                if (mouse.x !== undefined && mouse.y !== undefined) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        // Move away from mouse
                        this.x -= forceDirectionX * force * 2;
                        this.y -= forceDirectionY * force * 2;
                    }
                }

                // Move particle
                this.x += this.directionX;
                this.y += this.directionY;

                this.draw();
            }
        }

        // Initialize particles
        function init() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        // Connect particles with lines
        function connect() {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < connectDistance) {
                        // Opacity based on distance
                        let opacity = 1 - (distance / connectDistance);
                        ctx.strokeStyle = `rgba(148, 163, 184, ${opacity * 0.2})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Animation Loop
        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
            }
            connect();
        }

        // Start
        init();
        animate();
    }
});
