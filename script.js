document.addEventListener('DOMContentLoaded', () => {
    const { projects, categories, services, personalInfo, experience, education } = portfolioData;
    const localAssetBase = 'assets/images/';
    const isExternalAsset = (path) => /^(https?:)?\/\//i.test(path) || path.startsWith('mailto:') || path.startsWith('tel:');
    const resolveAssetPath = (path) => {
        if (!path || isExternalAsset(path) || path.startsWith('assets/')) return path;
        // Encode each path segment to handle spaces and special characters (needed for GitHub Pages)
        const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
        return `${localAssetBase}${encodedPath}`;
    };
    const refreshScrollTriggers = () => {
        if (window.ScrollTrigger) ScrollTrigger.refresh();
    };
    const animateFrom = (target, vars) => {
        if (window.gsap) gsap.from(target, vars);
    };

    // 1. Menu Controls
    const menuToggle = document.querySelector('#menu-toggle');
    const menuOverlay = document.querySelector('#menu-overlay');
    const navLinks = document.querySelectorAll('.nav-link');

    // --- View Switching Logic (Resume standalone as requested) ---
    const homeView = document.getElementById('home-view');
    const resumeView = document.getElementById('resume');
    const backBtn = document.getElementById('resume-back-btn');

    const showResume = () => {
        homeView.style.display = 'none';
        resumeView.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        // Refresh GSAP ScrollTrigger since layout changed
        setTimeout(() => {
            refreshScrollTriggers();
            // Re-run motion
            animateFrom('.profile-card', { opacity: 0, x: -50, duration: 1 });
            animateFrom('.timeline-item', { opacity: 0, y: 30, stagger: 0.15, duration: 0.8 });
        }, 100);
    };

    const showHome = (targetHash = null) => {
        resumeView.style.display = 'none';
        homeView.style.display = 'block';
        
        if (targetHash) {
            const el = document.querySelector(targetHash);
            if (el) {
                // Wait for display change to settle
                setTimeout(() => {
                    const offset = 80;
                    const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({
                        top: elementPosition - offset,
                        behavior: 'smooth'
                    });
                }, 50);
            }
        }
        refreshScrollTriggers();
    };

    if (menuToggle && menuOverlay) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            document.body.style.overflow = menuOverlay.classList.contains('active') ? 'hidden' : 'auto';
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href !== '#resume') {
                if(menuToggle && menuOverlay) {
                    menuToggle.classList.remove('active');
                    menuOverlay.classList.remove('active');
                }
                document.body.style.overflow = 'auto';
                if (href.startsWith('#')) {
                    e.preventDefault();
                    showHome(href);
                }
            }
        });
    });

    // Global router for any Resume link clicks
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a[href="#resume"]');
        if (link) {
            e.preventDefault();
            if (menuToggle && menuOverlay) {
                menuToggle.classList.remove('active');
                menuOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            showResume();
        }
    });

    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showHome('#hero');
        });
    }

    // Header Scroll Effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Populate Static Data
    const aboutText = document.querySelector('#about-text');
    if (aboutText) aboutText.innerHTML = personalInfo.about;

    // 3. Render Resume/Timeline
    const expTimeline = document.querySelector('#experience-timeline');
    const eduTimeline = document.querySelector('#education-timeline');
    const skillsList = document.querySelector('#resume-skills');
    const toolsGrid = document.querySelector('#resume-tools');
    const coursesList = document.querySelector('#resume-courses');

    // Destructure new data
    const { technicalSkills, tools, courses } = portfolioData;

    if (expTimeline && experience) {
        experience.forEach(item => {
            const div = document.createElement('div');
            div.className = 'timeline-item';
            div.innerHTML = `
                <div class="timeline-dot"></div>
                <span class="timeline-date">${item.period}</span>
                <div class="timeline-content">
                    <h5>${item.title}</h5>
                    <span class="company">${item.company}</span>
                    <span class="location"><i class="fa-solid fa-location-dot"></i> ${item.location}</span>
                    <p>${item.description}</p>
                </div>
            `;
            expTimeline.appendChild(div);
        });
    }

    if (eduTimeline && education) {
        education.forEach(item => {
            const div = document.createElement('div');
            div.className = 'timeline-item';
            div.innerHTML = `
                <div class="timeline-dot"></div>
                <span class="timeline-date">${item.period}</span>
                <div class="timeline-content">
                    <h5>${item.degree}</h5>
                    <span class="company">${item.school}</span>
                    <span class="location"><i class="fa-solid fa-location-dot"></i> ${item.location}</span>
                    <p>${item.description}</p>
                </div>
            `;
            eduTimeline.appendChild(div);
        });
    }

    if (skillsList && technicalSkills) {
        technicalSkills.forEach(skill => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${skill}`;
            skillsList.appendChild(li);
        });
    }

    if (toolsGrid && tools) {
        tools.forEach(tool => {
            const span = document.createElement('span');
            span.className = 'tool-tag';
            span.innerText = tool;
            toolsGrid.appendChild(span);
        });
    }

    if (coursesList && courses) {
        courses.forEach(course => {
            const div = document.createElement('div');
            div.className = 'course-card';
            div.innerHTML = `
                <div class="course-info">
                    <h5>${course.title}</h5>
                    <p>${course.provider}</p>
                </div>
                <span class="course-date">${course.date}</span>
            `;
            coursesList.appendChild(div);
        });
    }

    // 4. Render Services
    const servicesGrid = document.querySelector('#services-grid');
    if (servicesGrid) {
        services.forEach(s => {
            const card = document.createElement('div');
            card.className = 'service-card';
            card.innerHTML = `
                <div class="s-icon"><i class="fa-solid fa-microchip"></i></div>
                <h3 class="s-title">${s.title}</h3>
                <p class="modal-desc" style="font-size:0.9rem;">${s.details}</p>
            `;
            servicesGrid.appendChild(card);
            
            animateFrom(card, {
                y: 30,
                opacity: 0,
                duration: 0.6,
                ...(window.ScrollTrigger ? { scrollTrigger: {
                    trigger: card,
                    start: 'top 90%'
                }} : {})
            });
        });
    }

    // 4. Render Filters
    const filterTabs = document.querySelector('#filter-tabs');
    if (filterTabs) {
        const displayCategories = categories.filter(c => c.id !== 'addin');
        displayCategories.forEach((cat, index) => {
            const btn = document.createElement('button');
            btn.className = `tab-btn ${index === 0 ? 'active' : ''}`;
            btn.textContent = cat.name;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderProjects(cat.id);
            });
            filterTabs.appendChild(btn);
        });
    }

    // 5. Render Projects
    const projectsGrid = document.querySelector('#projects-grid');
    function renderProjects(categoryId = 'all') {
        projectsGrid.innerHTML = '';
        const filtered = categoryId === 'all' 
            ? projects.filter(p => p.category !== 'addin') 
            : projects.filter(p => p.category === categoryId && p.category !== 'addin');

        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = `project-card ${p.badge ? 'software-card' : ''}`;
            const mainImg = p.images && p.images.length > 0 ? resolveAssetPath(p.images[0]) : resolveAssetPath('placeholder.png');
            
            card.innerHTML = `
                <img src="${mainImg}" alt="${p.title}" class="project-image">
                <div class="project-info">
                    ${p.badge ? `<span class="p-badge" style="background: var(--accent); color: #fff; padding: 5px 12px; font-size: 0.6rem; font-weight: 900; position: absolute; top: -15px; left: 0; text-transform: uppercase; letter-spacing: 2px;">${p.badge}</span>` : ''}
                    <span class="p-cat">${p.category.toUpperCase()}</span>
                    <h3 class="p-title">${p.title}</h3>
                </div>
            `;

            card.addEventListener('click', () => openModal(p));
            projectsGrid.appendChild(card);
            
            animateFrom(card, {
                scale: 0.9,
                opacity: 0,
                duration: 0.5,
                ...(window.ScrollTrigger ? { scrollTrigger: {
                    trigger: card,
                    start: 'top 95%'
                }} : {})
            });
        });
    }
    renderProjects();

    // Render Addins
    const addinsGrid = document.querySelector('#addins-grid');
    if (addinsGrid) {
        const addinProjects = projects.filter(p => p.category === 'addin');
        addinProjects.forEach(p => {
            const card = document.createElement('div');
            card.className = `project-card ${p.badge ? 'software-card' : ''}`;
            const mainImg = p.images && p.images.length > 0 ? resolveAssetPath(p.images[0]) : resolveAssetPath('placeholder.png');
            
            card.innerHTML = `
                <img src="${mainImg}" alt="${p.title}" class="project-image">
                <div class="project-info">
                    ${p.badge ? `<span class="p-badge" style="background: var(--accent); color: #fff; padding: 5px 12px; font-size: 0.6rem; font-weight: 900; position: absolute; top: -15px; left: 0; text-transform: uppercase; letter-spacing: 2px;">${p.badge}</span>` : ''}
                    <span class="p-cat">${p.category.toUpperCase()}</span>
                    <h3 class="p-title">${p.title}</h3>
                </div>
            `;

            card.addEventListener('click', () => openModal(p));
            addinsGrid.appendChild(card);
            
            animateFrom(card, {
                scale: 0.9,
                opacity: 0,
                duration: 0.5,
                ...(window.ScrollTrigger ? { scrollTrigger: {
                    trigger: card,
                    start: 'top 95%'
                }} : {})
            });
        });
    }

    // 6. Modal / Gallery Logic
    const modal = document.querySelector('#project-modal');
    const closeBtn = document.querySelector('.close-modal');
    const mediaContainer = document.querySelector('#modal-media-container');
    const modalTitle = document.querySelector('#modal-title');
    const modalCat = document.querySelector('#modal-category');
    const modalDetails = document.querySelector('#modal-details');
    const modalMeta = document.querySelector('#modal-meta');
    const modalRef = document.querySelector('#modal-ref-link');

    let currentProject = null;
    let currentImgIndex = 0;

    function openModal(p) {
        currentProject = p;
        currentImgIndex = 0;
        updateModalContent();
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        animateFrom('.modal-content', { scale: 0.9, opacity: 0, duration: 0.4, ease: 'power2.out' });
    }

    function updateModalContent() {
        if (!currentProject) return;

        const media = currentProject.images[currentImgIndex];
        const mediaSrc = resolveAssetPath(media);
        const isVideo = media.toLowerCase().endsWith('.mp4');
        const isYouTube = media.includes('youtube.com') || media.includes('youtu.be');
        const isDrive = media.includes('drive.google.com');

        if (isYouTube) {
            const videoId = media.split('v=')[1] || media.split('/').pop().split('?')[0];
            mediaContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="width:100%; height:100%"></iframe>`;
        } else if (isDrive) {
            const driveId = media.split('/d/')[1].split('/')[0];
            mediaContainer.innerHTML = `<iframe src="https://drive.google.com/file/d/${driveId}/preview" frameborder="0" allow="autoplay" style="width:100%; height:100%"></iframe>`;
        } else if (isVideo) {
            mediaContainer.innerHTML = `<video src="${mediaSrc}" controls autoplay style="width:100%; height:100%"></video>`;
        } else {
            mediaContainer.innerHTML = `<img src="${mediaSrc}" alt="${currentProject.title}">`;
        }

        modalTitle.textContent = currentProject.title;
        modalCat.textContent = currentProject.category.toUpperCase();
        modalDetails.innerHTML = currentProject.details || '';

        // Meta data
        modalMeta.innerHTML = `
            ${currentProject.location ? `<li><span class="meta-label">Location</span><span class="meta-value">${currentProject.location}</span></li>` : ''}
            ${currentProject.consultant ? `<li><span class="meta-label">Consultant</span><span class="meta-value">${currentProject.consultant}</span></li>` : ''}
            ${currentProject.client ? `<li><span class="meta-label">Client</span><span class="meta-value">${currentProject.client}</span></li>` : ''}
        `;

        // Reference link
        if (currentProject.refLink) {
            modalRef.style.display = 'inline-block';
            modalRef.href = currentProject.refLink;
            if (currentProject.category === 'addin') {
                modalRef.innerHTML = 'Download Add-in <i class="fa-solid fa-download" style="margin-left: 5px;"></i>';
            } else {
                modalRef.innerHTML = 'View Reference';
            }
        } else {
            modalRef.style.display = 'none';
        }
    }

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Prev/Next buttons
    document.querySelector('#prev-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        currentImgIndex = (currentImgIndex - 1 + currentProject.images.length) % currentProject.images.length;
        updateModalContent();
    });

    document.querySelector('#next-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        currentImgIndex = (currentImgIndex + 1) % currentProject.images.length;
        updateModalContent();
    });

    // Keyboard & Mouse Scroll controls for modal
    let isScrolling = false;
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'flex') {
            if (e.key === 'ArrowLeft') {
                currentImgIndex = (currentImgIndex - 1 + currentProject.images.length) % currentProject.images.length;
                updateModalContent();
            } else if (e.key === 'ArrowRight') {
                currentImgIndex = (currentImgIndex + 1) % currentProject.images.length;
                updateModalContent();
            } else if (e.key === 'Escape') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    });

    modal.addEventListener('wheel', (e) => {
        if (isScrolling) return;
        isScrolling = true;
        
        if (e.deltaY > 0) {
            // Scroll Down -> Next
            currentImgIndex = (currentImgIndex + 1) % currentProject.images.length;
        } else {
            // Scroll Up -> Prev
            currentImgIndex = (currentImgIndex - 1 + currentProject.images.length) % currentProject.images.length;
        }
        
        updateModalContent();
        
        setTimeout(() => {
            isScrolling = false;
        }, 500); // 500ms debounce
    });

    // 7. Smooth Scrolling
    document.querySelectorAll('a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Only handle local anchor links starting with # but not just #
            if (href && href.startsWith('#') && href !== "#") {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 50,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 8. Theme Toggle (Dark / Light Mode)
    const themeToggleBtn = document.querySelector('#theme-toggle');
    const savedTheme = localStorage.getItem('portfolio_theme') || 'dark';

    function applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            document.body.classList.remove('light-mode');
            if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    }

    applyTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isLight = document.body.classList.contains('light-mode');
            const newTheme = isLight ? 'dark' : 'light';
            localStorage.setItem('portfolio_theme', newTheme);
            applyTheme(newTheme);
        });
    }

    // Initial Hero reveal
    animateFrom('.hero-content h1', { y: 100, opacity: 0, duration: 1, ease: 'power4.out', delay: 0.2 });
    animateFrom('.hero-content h2', { y: 50, opacity: 0, duration: 1, ease: 'power4.out', delay: 0.4 });
    animateFrom('.hero-content p', { y: 50, opacity: 0, duration: 1, ease: 'power4.out', delay: 0.6 });
    animateFrom('.cta-button', { y: 30, opacity: 0, duration: 1, ease: 'power4.out', delay: 0.8 });
});
