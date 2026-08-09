/* ============================================
   AMS Admin Dashboard — Core Logic
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    // ====== STATE ======
    let state = {};
    const STORAGE_KEY = 'ams_admin_data';
    const localAssetBase = 'assets/images/';

    function resolveAssetPath(path) {
        if (!path) return '';
        if (/^(https?:)?\/\//i.test(path) || path.startsWith('assets/')) return path;
        return `${localAssetBase}${path}`;
    }

    // ====== LOAD DATA ======
    function loadData() {
        // Try localStorage first, fallback to portfolioData from data.js
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                state = JSON.parse(saved);
                showToast('Loaded saved data from local storage');
            } catch (e) {
                state = deepClone(portfolioData);
            }
        } else {
            state = deepClone(portfolioData);
        }
        // Ensure all required arrays exist
        if (!state.projects) state.projects = [];
        if (!state.services) state.services = [];
        if (!state.experience) state.experience = [];
        if (!state.education) state.education = [];
        if (!state.courses) state.courses = [];
        if (!state.technicalSkills) state.technicalSkills = [];
        if (!state.tools) state.tools = [];
        if (!state.categories) state.categories = [];
        if (!state.skills) state.skills = [];
        if (!state.personalInfo) state.personalInfo = {};
    }

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function saveToLocalStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    // ====== TOAST ======
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    let toastTimer;

    function showToast(message) {
        toastMsg.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // ====== SIDEBAR NAVIGATION ======
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const sections = document.querySelectorAll('.admin-section');
    const sidebar = document.getElementById('admin-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            switchSection(section);
            // Close sidebar on mobile
            sidebar.classList.remove('open');
        });
    });

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    function switchSection(sectionId) {
        sidebarItems.forEach(i => i.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));

        const targetItem = document.querySelector(`.sidebar-item[data-section="${sectionId}"]`);
        const targetSection = document.getElementById(`section-${sectionId}`);

        if (targetItem) targetItem.classList.add('active');
        if (targetSection) targetSection.classList.add('active');
    }

    // ====== DASHBOARD STATS ======
    function renderDashboard() {
        const statsGrid = document.getElementById('stats-grid');
        const stats = [
            { icon: 'fa-folder-open', value: state.projects.length, label: 'Projects' },
            { icon: 'fa-cogs', value: state.services.length, label: 'Services' },
            { icon: 'fa-briefcase', value: state.experience.length, label: 'Experience' },
            { icon: 'fa-graduation-cap', value: state.education.length, label: 'Education' },
            { icon: 'fa-book', value: state.courses.length, label: 'Courses' },
            { icon: 'fa-code', value: state.technicalSkills.length, label: 'Skills' },
            { icon: 'fa-wrench', value: state.tools.length, label: 'Tools' },
            { icon: 'fa-tags', value: state.categories.length, label: 'Categories' }
        ];

        statsGrid.innerHTML = stats.map(s => `
            <div class="stat-card">
                <div class="stat-icon"><i class="fa-solid ${s.icon}"></i></div>
                <div class="stat-value">${s.value}</div>
                <div class="stat-label">${s.label}</div>
            </div>
        `).join('');
    }

    // ====== RENDER TABLES ======
    function renderProjects() {
        const tbody = document.getElementById('projects-table-body');
        if (!state.projects.length) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-folder-open"></i><p>No projects yet. Add your first project!</p></div></td></tr>`;
            return;
        }
        tbody.innerHTML = state.projects.map((p, index) => {
            const thumb = p.images && p.images.length > 0 ? resolveAssetPath(p.images[0]) : '';
            const cat = state.categories.find(c => c.id === p.category);
            return `
                <tr>
                    <td>${thumb ? `<img src="${thumb}" class="table-thumb" onerror="this.style.display='none'">` : '—'}</td>
                    <td><span class="table-title">${p.title || ''}</span></td>
                    <td><span class="table-badge">${cat ? cat.name : p.category || ''}</span></td>
                    <td class="table-muted">${p.location || '—'}</td>
                    <td class="table-muted">${p.images ? p.images.length : 0}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-edit" onclick="adminApp.editProject(${index})"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-delete" onclick="adminApp.deleteProject(${index})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderServices() {
        const tbody = document.getElementById('services-table-body');
        if (!state.services.length) {
            tbody.innerHTML = `<tr><td colspan="3"><div class="empty-state"><i class="fa-solid fa-cogs"></i><p>No services yet.</p></div></td></tr>`;
            return;
        }
        tbody.innerHTML = state.services.map((s, index) => `
            <tr>
                <td><span class="table-title">${s.title || ''}</span></td>
                <td class="table-muted">${(s.details || '').substring(0, 80)}${(s.details || '').length > 80 ? '...' : ''}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-edit" onclick="adminApp.editService(${index})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-delete" onclick="adminApp.deleteService(${index})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function renderExperience() {
        const tbody = document.getElementById('experience-table-body');
        if (!state.experience.length) {
            tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><i class="fa-solid fa-briefcase"></i><p>No experience entries yet.</p></div></td></tr>`;
            return;
        }
        tbody.innerHTML = state.experience.map((e, index) => `
            <tr>
                <td><span class="table-title">${e.title || ''}</span></td>
                <td class="table-muted">${e.company || ''}</td>
                <td><span class="table-badge">${e.period || ''}</span></td>
                <td class="table-muted">${e.location || ''}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-edit" onclick="adminApp.editExperience(${index})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-delete" onclick="adminApp.deleteExperience(${index})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function renderEducation() {
        const tbody = document.getElementById('education-table-body');
        if (!state.education.length) {
            tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><i class="fa-solid fa-graduation-cap"></i><p>No education entries yet.</p></div></td></tr>`;
            return;
        }
        tbody.innerHTML = state.education.map((e, index) => `
            <tr>
                <td><span class="table-title">${e.degree || ''}</span></td>
                <td class="table-muted">${e.school || ''}</td>
                <td><span class="table-badge">${e.period || ''}</span></td>
                <td class="table-muted">${e.location || ''}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-edit" onclick="adminApp.editEducation(${index})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-delete" onclick="adminApp.deleteEducation(${index})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function renderCourses() {
        const tbody = document.getElementById('courses-table-body');
        if (!state.courses.length) {
            tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i class="fa-solid fa-book"></i><p>No courses yet.</p></div></td></tr>`;
            return;
        }
        tbody.innerHTML = state.courses.map((c, index) => `
            <tr>
                <td><span class="table-title">${c.title || ''}</span></td>
                <td class="table-muted">${c.provider || ''}</td>
                <td><span class="table-badge">${c.date || ''}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn-edit" onclick="adminApp.editCourse(${index})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-delete" onclick="adminApp.deleteCourse(${index})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function renderSkillsTags() {
        const skillsContainer = document.getElementById('skills-tags-container');
        const toolsContainer = document.getElementById('tools-tags-container');

        skillsContainer.innerHTML = state.technicalSkills.map((skill, i) => `
            <div class="tag-item">
                <span>${skill}</span>
                <button class="tag-remove" onclick="adminApp.removeSkill(${i})">&times;</button>
            </div>
        `).join('') || '<p class="empty-state" style="padding:20px;"><i class="fa-solid fa-code" style="font-size:1.5rem"></i><br>No skills added</p>';

        toolsContainer.innerHTML = state.tools.map((tool, i) => `
            <div class="tag-item">
                <span>${tool}</span>
                <button class="tag-remove" onclick="adminApp.removeTool(${i})">&times;</button>
            </div>
        `).join('') || '<p class="empty-state" style="padding:20px;"><i class="fa-solid fa-wrench" style="font-size:1.5rem"></i><br>No tools added</p>';
    }

    function renderCategories() {
        const tbody = document.getElementById('categories-table-body');
        if (!state.categories.length) {
            tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i class="fa-solid fa-tags"></i><p>No categories yet.</p></div></td></tr>`;
            return;
        }
        tbody.innerHTML = state.categories.map((c, index) => {
            const projectCount = state.projects.filter(p => p.category === c.id).length;
            return `
                <tr>
                    <td><code style="color:var(--accent);background:var(--accent-glow);padding:3px 8px;border-radius:4px;font-size:0.8rem">${c.id}</code></td>
                    <td><span class="table-title">${c.name || ''}</span></td>
                    <td class="table-muted">${projectCount}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-edit" onclick="adminApp.editCategory(${index})"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-delete" onclick="adminApp.deleteCategory(${index})" ${c.id === 'all' ? 'disabled style="opacity:0.3;cursor:not-allowed"' : ''}><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderPersonalInfo() {
        const pi = state.personalInfo || {};
        document.getElementById('pi-name').value = pi.name || '';
        document.getElementById('pi-title').value = pi.title || '';
        document.getElementById('pi-email').value = pi.email || '';
        document.getElementById('pi-phone').value = pi.phone || '';
        document.getElementById('pi-location').value = pi.location || '';
        document.getElementById('pi-linkedin').value = pi.linkedIn || '';
        document.getElementById('pi-about').value = pi.about || '';
    }

    function renderAll() {
        renderDashboard();
        renderProjects();
        renderServices();
        renderExperience();
        renderEducation();
        renderCourses();
        renderSkillsTags();
        renderCategories();
        renderPersonalInfo();
    }

    // ====== MODAL SYSTEM ======
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.getElementById('modal-close');
    const modalCancel = document.getElementById('modal-cancel');
    const modalSaveBtn = document.getElementById('modal-save');

    let currentModalType = '';
    let currentEditIndex = -1;

    function openModal(type, editIndex = -1) {
        currentModalType = type;
        currentEditIndex = editIndex;
        const isEdit = editIndex >= 0;

        const titles = {
            project: isEdit ? 'Edit Project' : 'Add Project',
            service: isEdit ? 'Edit Service' : 'Add Service',
            experience: isEdit ? 'Edit Experience' : 'Add Experience',
            education: isEdit ? 'Edit Education' : 'Add Education',
            course: isEdit ? 'Edit Course' : 'Add Course',
            category: isEdit ? 'Edit Category' : 'Add Category',
            skill: 'Add Skill',
            tool: 'Add Tool'
        };

        modalTitle.textContent = titles[type] || 'Add Item';
        modalBody.innerHTML = buildForm(type, isEdit ? getEditData(type, editIndex) : null);
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus first input
        setTimeout(() => {
            const firstInput = modalBody.querySelector('input, textarea, select');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        currentModalType = '';
        currentEditIndex = -1;
    }

    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    function getEditData(type, index) {
        const dataMap = {
            project: state.projects,
            service: state.services,
            experience: state.experience,
            education: state.education,
            course: state.courses,
            category: state.categories
        };
        return dataMap[type] ? dataMap[type][index] : null;
    }

    // ====== FORM BUILDER ======
    function buildForm(type, data) {
        const d = data || {};
        switch (type) {
            case 'project':
                return buildProjectForm(d);
            case 'service':
                return buildServiceForm(d);
            case 'experience':
                return buildExperienceForm(d);
            case 'education':
                return buildEducationForm(d);
            case 'course':
                return buildCourseForm(d);
            case 'category':
                return buildCategoryForm(d);
            case 'skill':
                return buildSimpleForm('Skill Name', 'e.g. Clash Detection');
            case 'tool':
                return buildSimpleForm('Tool Name', 'e.g. Navisworks');
            default:
                return '';
        }
    }

    function buildProjectForm(d) {
        const catOptions = state.categories
            .filter(c => c.id !== 'all')
            .map(c => `<option value="${c.id}" ${d.category === c.id ? 'selected' : ''}>${c.name}</option>`)
            .join('');

        const images = d.images || [];
        const imageItems = images.map((img, i) => buildImageItem(img, i)).join('');

        return `
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Project Title *</label>
                    <input type="text" class="form-input" id="f-title" value="${escHtml(d.title || '')}" placeholder="e.g. MOTOR SPEED PARK">
                </div>
                <div class="form-group">
                    <label class="form-label">Category *</label>
                    <select class="form-select" id="f-category">${catOptions}</select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Location</label>
                    <input type="text" class="form-input" id="f-location" value="${escHtml(d.location || '')}" placeholder="e.g. KSA">
                </div>
                <div class="form-group">
                    <label class="form-label">Client</label>
                    <input type="text" class="form-input" id="f-client" value="${escHtml(d.client || '')}" placeholder="e.g. QIDDYAH">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Consultant</label>
                    <input type="text" class="form-input" id="f-consultant" value="${escHtml(d.consultant || '')}" placeholder="e.g. FOSTER AND PARTNERS">
                </div>
                <div class="form-group">
                    <label class="form-label">Badge (optional)</label>
                    <input type="text" class="form-input" id="f-badge" value="${escHtml(d.badge || '')}" placeholder="e.g. Software Tool">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Details / Description</label>
                <textarea class="form-textarea" id="f-details" rows="4" placeholder="Project description...">${escHtml(d.details || '')}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Reference Link</label>
                <input type="url" class="form-input" id="f-refLink" value="${escHtml(d.refLink || '')}" placeholder="https://...">
            </div>
            <div class="form-group">
                <label class="form-label">Technologies (comma-separated)</label>
                <input type="text" class="form-input" id="f-technologies" value="${escHtml((d.technologies || []).join(', '))}" placeholder="e.g. BIM, Electrical, Coordination">
            </div>
            <div class="form-group">
                <label class="form-label">Images / Media / PDF Files</label>
                <div class="images-manager">
                    <div class="images-manager-header">
                        <h4><i class="fa-solid fa-folder-open"></i> Project Media & Documents (${images.length})</h4>
                        <div style="display:flex; gap:8px;">
                            <input type="file" id="f-file-picker" multiple accept="image/*,video/*,application/pdf" style="display:none" onchange="adminApp.handleFilePicker(this)">
                            <button type="button" class="add-image-btn" style="background:var(--accent); color:#fff; border:none; padding:8px 16px; border-radius:6px; font-weight:700;" onclick="document.getElementById('f-file-picker').click()">
                                <i class="fa-solid fa-cloud-arrow-up"></i> Upload Files (Images/Video/PDF)
                            </button>
                            <button type="button" class="add-image-btn" onclick="adminApp.addImageField()">
                                <i class="fa-solid fa-plus"></i> Add Link
                            </button>
                        </div>
                    </div>
                    <div id="images-list">
                        ${imageItems || '<div class="images-empty"><i class="fa-solid fa-cloud-arrow-up"></i> Upload files or add media links above</div>'}
                    </div>
                    <p class="form-hint" style="margin-top:10px;">
                        💡 Upload files directly from your computer (Images, MP4, PDF) or type URL / relative path.
                    </p>
                </div>
            </div>
        `;
    }

    function buildImageItem(value, index) {
        const isDataUrl = value && value.startsWith('data:');
        const isExternal = /^(https?:)?\/\//i.test(value);
        const previewSrc = isDataUrl ? value : (isExternal ? value : resolveAssetPath(value));
        const isVideo = value && (value.toLowerCase().endsWith('.mp4') || value.toLowerCase().endsWith('.webm') || value.includes('youtube') || value.includes('drive.google') || (isDataUrl && value.includes('data:video/')));
        const isPdf = value && (value.toLowerCase().endsWith('.pdf') || (isDataUrl && value.includes('data:application/pdf')));

        return `
            <div class="image-item" data-index="${index}">
                ${isPdf ? '<i class="fa-solid fa-file-pdf" style="color:#f87171;width:40px;font-size:1.5rem;text-align:center"></i>' : ''}
                ${isVideo ? '<i class="fa-solid fa-video" style="color:var(--accent);width:40px;font-size:1.5rem;text-align:center"></i>' : ''}
                ${!isPdf && !isVideo && previewSrc ? `<img src="${previewSrc}" class="image-preview-thumb" onerror="this.style.display='none'">` : ''}
                <input type="text" value="${escHtml(value)}" placeholder="File path, DataURL, or Web URL..." onchange="adminApp.updateImagePreview(this)">
                <button type="button" class="image-remove-btn" onclick="adminApp.removeImageField(${index})">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
    }

    function handleFilePicker(input) {
        const files = Array.from(input.files || []);
        if (!files.length) return;

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                // Store filename in dataset attribute for path generation
                const list = document.getElementById('images-list');
                const empty = list.querySelector('.images-empty');
                if (empty) empty.remove();

                const index = list.querySelectorAll('.image-item').length;
                const div = document.createElement('div');
                div.innerHTML = buildImageItem(dataUrl, index);
                const newElem = div.firstElementChild;
                newElem.dataset.filename = file.name;
                list.appendChild(newElem);
                showToast(`Loaded ${file.name}`);
            };
            reader.readAsDataURL(file);
        });
        input.value = '';
    }

    function buildServiceForm(d) {
        return `
            <div class="form-group">
                <label class="form-label">Service Title *</label>
                <input type="text" class="form-input" id="f-title" value="${escHtml(d.title || '')}" placeholder="e.g. Electrical BIM Modeling">
            </div>
            <div class="form-group">
                <label class="form-label">Details</label>
                <textarea class="form-textarea" id="f-details" rows="4" placeholder="Service description...">${escHtml(d.details || '')}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Icon Label</label>
                    <input type="text" class="form-input" id="f-icon" value="${escHtml(d.icon || '')}" placeholder="e.g. BIM">
                </div>
                <div class="form-group">
                    <label class="form-label">Technologies (comma-separated)</label>
                    <input type="text" class="form-input" id="f-technologies" value="${escHtml((d.technologies || []).join(', '))}" placeholder="e.g. Revit, Navisworks">
                </div>
            </div>
        `;
    }

    function buildExperienceForm(d) {
        return `
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Job Title *</label>
                    <input type="text" class="form-input" id="f-title" value="${escHtml(d.title || '')}" placeholder="e.g. Electrical BIM Engineer">
                </div>
                <div class="form-group">
                    <label class="form-label">Company *</label>
                    <input type="text" class="form-input" id="f-company" value="${escHtml(d.company || '')}" placeholder="e.g. AIM United Company">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Period</label>
                    <input type="text" class="form-input" id="f-period" value="${escHtml(d.period || '')}" placeholder="e.g. Mar 2025 - Present">
                </div>
                <div class="form-group">
                    <label class="form-label">Location</label>
                    <input type="text" class="form-input" id="f-location" value="${escHtml(d.location || '')}" placeholder="e.g. Egypt">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-textarea" id="f-description" rows="5" placeholder="Job responsibilities...">${escHtml(d.description || '')}</textarea>
            </div>
        `;
    }

    function buildEducationForm(d) {
        return `
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Degree *</label>
                    <input type="text" class="form-input" id="f-degree" value="${escHtml(d.degree || '')}" placeholder="e.g. Bachelor's Degree">
                </div>
                <div class="form-group">
                    <label class="form-label">School *</label>
                    <input type="text" class="form-input" id="f-school" value="${escHtml(d.school || '')}" placeholder="e.g. Mansoura University">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Period</label>
                    <input type="text" class="form-input" id="f-period" value="${escHtml(d.period || '')}" placeholder="e.g. 2019 - 2024">
                </div>
                <div class="form-group">
                    <label class="form-label">Location</label>
                    <input type="text" class="form-input" id="f-location" value="${escHtml(d.location || '')}" placeholder="e.g. Egypt">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-textarea" id="f-description" rows="4" placeholder="Details...">${escHtml(d.description || '')}</textarea>
            </div>
        `;
    }

    function buildCourseForm(d) {
        return `
            <div class="form-group">
                <label class="form-label">Course Title *</label>
                <input type="text" class="form-input" id="f-title" value="${escHtml(d.title || '')}" placeholder="e.g. BIM Application Development">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Provider</label>
                    <input type="text" class="form-input" id="f-provider" value="${escHtml(d.provider || '')}" placeholder="e.g. KAITECH">
                </div>
                <div class="form-group">
                    <label class="form-label">Date / Year</label>
                    <input type="text" class="form-input" id="f-date" value="${escHtml(d.date || '')}" placeholder="e.g. 2025">
                </div>
            </div>
        `;
    }

    function buildCategoryForm(d) {
        return `
            <div class="form-group">
                <label class="form-label">Category ID *</label>
                <input type="text" class="form-input" id="f-id" value="${escHtml(d.id || '')}" placeholder="e.g. residential" ${d.id ? 'readonly style="opacity:0.6"' : ''}>
                <p class="form-hint">Lowercase, no spaces. Used as internal identifier.</p>
            </div>
            <div class="form-group">
                <label class="form-label">Display Name *</label>
                <input type="text" class="form-input" id="f-name" value="${escHtml(d.name || '')}" placeholder="e.g. Residential Projects">
            </div>
        `;
    }

    function buildSimpleForm(label, placeholder) {
        return `
            <div class="form-group">
                <label class="form-label">${label} *</label>
                <input type="text" class="form-input" id="f-value" value="" placeholder="${placeholder}">
            </div>
        `;
    }

    // ====== SAVE HANDLER ======
    modalSaveBtn.addEventListener('click', () => {
        saveModalData();
    });

    function saveModalData() {
        switch (currentModalType) {
            case 'project': saveProject(); break;
            case 'service': saveService(); break;
            case 'experience': saveExperience(); break;
            case 'education': saveEducation(); break;
            case 'course': saveCourse(); break;
            case 'category': saveCategory(); break;
            case 'skill': saveSkill(); break;
            case 'tool': saveTool(); break;
        }
    }

    function saveProject() {
        const title = val('f-title');
        if (!title) return alert('Project title is required!');

        // Collect images from the list
        const imageInputs = document.querySelectorAll('#images-list .image-item input');
        const images = Array.from(imageInputs).map(inp => inp.value.trim()).filter(Boolean);

        const techStr = val('f-technologies');
        const technologies = techStr ? techStr.split(',').map(t => t.trim()).filter(Boolean) : [];

        const project = {
            id: currentEditIndex >= 0 ? state.projects[currentEditIndex].id : Date.now(),
            category: val('f-category'),
            title: title,
            location: val('f-location'),
            client: val('f-client'),
            consultant: val('f-consultant'),
            details: val('f-details'),
            images: images,
            refLink: val('f-refLink'),
            badge: val('f-badge'),
            technologies: technologies
        };

        // Remove empty fields
        Object.keys(project).forEach(key => {
            if (project[key] === '' || project[key] === null) delete project[key];
        });
        // Keep required fields
        if (!project.images) project.images = [];

        if (currentEditIndex >= 0) {
            state.projects[currentEditIndex] = project;
            showToast('Project updated successfully!');
        } else {
            state.projects.push(project);
            showToast('Project added successfully!');
        }

        saveToLocalStorage();
        renderAll();
        closeModal();
    }

    function saveService() {
        const title = val('f-title');
        if (!title) return alert('Service title is required!');

        const techStr = val('f-technologies');
        const technologies = techStr ? techStr.split(',').map(t => t.trim()).filter(Boolean) : [];

        const service = {
            id: currentEditIndex >= 0 ? state.services[currentEditIndex].id : `s${Date.now()}`,
            category: 'services',
            title: title,
            details: val('f-details'),
            icon: val('f-icon'),
            technologies: technologies
        };

        if (currentEditIndex >= 0) {
            state.services[currentEditIndex] = service;
            showToast('Service updated!');
        } else {
            state.services.push(service);
            showToast('Service added!');
        }
        saveToLocalStorage();
        renderAll();
        closeModal();
    }

    function saveExperience() {
        const title = val('f-title');
        const company = val('f-company');
        if (!title || !company) return alert('Job title and company are required!');

        const exp = {
            company: company,
            title: title,
            period: val('f-period'),
            location: val('f-location'),
            description: val('f-description')
        };

        if (currentEditIndex >= 0) {
            state.experience[currentEditIndex] = exp;
            showToast('Experience updated!');
        } else {
            state.experience.push(exp);
            showToast('Experience added!');
        }
        saveToLocalStorage();
        renderAll();
        closeModal();
    }

    function saveEducation() {
        const degree = val('f-degree');
        const school = val('f-school');
        if (!degree || !school) return alert('Degree and school are required!');

        const edu = {
            school: school,
            degree: degree,
            period: val('f-period'),
            location: val('f-location'),
            description: val('f-description')
        };

        if (currentEditIndex >= 0) {
            state.education[currentEditIndex] = edu;
            showToast('Education updated!');
        } else {
            state.education.push(edu);
            showToast('Education added!');
        }
        saveToLocalStorage();
        renderAll();
        closeModal();
    }

    function saveCourse() {
        const title = val('f-title');
        if (!title) return alert('Course title is required!');

        const course = {
            title: title,
            provider: val('f-provider'),
            date: val('f-date')
        };

        if (currentEditIndex >= 0) {
            state.courses[currentEditIndex] = course;
            showToast('Course updated!');
        } else {
            state.courses.push(course);
            showToast('Course added!');
        }
        saveToLocalStorage();
        renderAll();
        closeModal();
    }

    function saveCategory() {
        const id = val('f-id');
        const name = val('f-name');
        if (!id || !name) return alert('Category ID and name are required!');

        const cat = { id: id, name: name };

        if (currentEditIndex >= 0) {
            state.categories[currentEditIndex] = cat;
            showToast('Category updated!');
        } else {
            // Check for duplicate ID
            if (state.categories.some(c => c.id === id)) {
                return alert('A category with this ID already exists!');
            }
            state.categories.push(cat);
            showToast('Category added!');
        }
        saveToLocalStorage();
        renderAll();
        closeModal();
    }

    function saveSkill() {
        const value = val('f-value');
        if (!value) return alert('Skill name is required!');
        state.technicalSkills.push(value);
        saveToLocalStorage();
        renderAll();
        closeModal();
        showToast('Skill added!');
    }

    function saveTool() {
        const value = val('f-value');
        if (!value) return alert('Tool name is required!');
        state.tools.push(value);
        saveToLocalStorage();
        renderAll();
        closeModal();
        showToast('Tool added!');
    }

    // ====== DELETE SYSTEM ======
    const confirmOverlay = document.getElementById('confirm-overlay');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmCancel = document.getElementById('confirm-cancel');
    const confirmDelete = document.getElementById('confirm-delete');
    let pendingDeleteFn = null;

    function confirmAction(message, onConfirm) {
        confirmMessage.textContent = message;
        pendingDeleteFn = onConfirm;
        confirmOverlay.classList.add('active');
    }

    confirmCancel.addEventListener('click', () => {
        confirmOverlay.classList.remove('active');
        pendingDeleteFn = null;
    });

    confirmDelete.addEventListener('click', () => {
        if (pendingDeleteFn) pendingDeleteFn();
        confirmOverlay.classList.remove('active');
        pendingDeleteFn = null;
    });

    // ====== IMAGE FIELD MANAGEMENT ======
    function addImageField() {
        const list = document.getElementById('images-list');
        // Clear empty state if present
        const empty = list.querySelector('.images-empty');
        if (empty) empty.remove();

        const index = list.querySelectorAll('.image-item').length;
        const div = document.createElement('div');
        div.innerHTML = buildImageItem('', index);
        list.appendChild(div.firstElementChild);

        // Focus the new input
        const newInput = list.querySelector(`.image-item[data-index="${index}"] input`);
        if (newInput) newInput.focus();
    }

    function removeImageField(index) {
        const list = document.getElementById('images-list');
        const items = list.querySelectorAll('.image-item');
        if (items[index]) items[index].remove();

        // Re-index remaining items
        const remaining = list.querySelectorAll('.image-item');
        remaining.forEach((item, i) => {
            item.dataset.index = i;
            const removeBtn = item.querySelector('.image-remove-btn');
            if (removeBtn) removeBtn.setAttribute('onclick', `adminApp.removeImageField(${i})`);
        });

        if (!remaining.length) {
            list.innerHTML = '<div class="images-empty"><i class="fa-solid fa-image"></i> No images added yet</div>';
        }
    }

    function updateImagePreview(input) {
        const item = input.closest('.image-item');
        const existingThumb = item.querySelector('.image-preview-thumb');
        const existingIcon = item.querySelector('.fa-video');

        if (existingThumb) existingThumb.remove();
        if (existingIcon) existingIcon.parentElement && existingIcon.remove();

        const value = input.value.trim();
        if (!value) return;

        const isVideo = value.toLowerCase().endsWith('.mp4') || value.includes('youtube') || value.includes('drive.google');
        const isExternal = /^(https?:)?\/\//i.test(value);

        if (isVideo) {
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-video';
            icon.style.cssText = 'color:var(--accent);width:40px;text-align:center';
            item.insertBefore(icon, input);
        } else {
            const src = isExternal ? value : resolveAssetPath(value);
            const img = document.createElement('img');
            img.className = 'image-preview-thumb';
            img.src = src;
            img.onerror = () => img.style.display = 'none';
            item.insertBefore(img, input);
        }
    }

    // ====== EXPORT data.js ======
    function exportDataJs() {
        // Build clean export object matching original data.js structure
        const exportData = {
            personalInfo: state.personalInfo,
            skills: state.skills || [],
            categories: state.categories,
            services: state.services,
            experience: state.experience,
            education: state.education,
            technicalSkills: state.technicalSkills,
            tools: state.tools,
            courses: state.courses,
            projects: state.projects
        };

        // Build the JS file content
        let content = 'const portfolioData = ';
        content += JSON.stringify(exportData, null, 4);
        content += ';\n';

        // Fix: convert escaped HTML entities back
        content = content.replace(/\\u0026/g, '&');
        content = content.replace(/\\u003c/g, '<');
        content = content.replace(/\\u003e/g, '>');

        // Download the file
        const blob = new Blob([content], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('data.js exported! Upload it to your js/ folder on GitHub.');
    }

    // ====== PERSONAL INFO SAVE ======
    const personalForm = document.getElementById('personal-form');
    personalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        state.personalInfo = {
            name: val('pi-name'),
            title: val('pi-title'),
            email: val('pi-email'),
            phone: val('pi-phone'),
            location: val('pi-location'),
            linkedIn: val('pi-linkedin'),
            about: document.getElementById('pi-about').value.trim()
        };
        saveToLocalStorage();
        renderDashboard();
        showToast('Personal info saved!');
    });

    // ====== ADD BUTTONS ======
    document.getElementById('add-project-btn').addEventListener('click', () => openModal('project'));
    document.getElementById('add-service-btn').addEventListener('click', () => openModal('service'));
    document.getElementById('add-experience-btn').addEventListener('click', () => openModal('experience'));
    document.getElementById('add-education-btn').addEventListener('click', () => openModal('education'));
    document.getElementById('add-course-btn').addEventListener('click', () => openModal('course'));
    document.getElementById('add-category-btn').addEventListener('click', () => openModal('category'));
    document.getElementById('add-skill-btn').addEventListener('click', () => openModal('skill'));
    document.getElementById('add-tool-btn').addEventListener('click', () => openModal('tool'));
    document.getElementById('export-btn').addEventListener('click', exportDataJs);

    // Quick actions
    document.querySelectorAll('.action-card[data-action]').forEach(card => {
        card.addEventListener('click', () => {
            const action = card.dataset.action;
            if (action === 'add-project') {
                switchSection('projects');
                setTimeout(() => openModal('project'), 300);
            } else if (action === 'export') {
                exportDataJs();
            }
        });
    });

    // Keyboard shortcut: Escape to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (confirmOverlay.classList.contains('active')) {
                confirmOverlay.classList.remove('active');
            } else if (modalOverlay.classList.contains('active')) {
                closeModal();
            }
        }
    });

    // ====== UTILITY ======
    function val(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }

    function escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ====== PUBLIC API (for onclick handlers in HTML) ======
    window.adminApp = {
        editProject: (i) => openModal('project', i),
        editService: (i) => openModal('service', i),
        editExperience: (i) => openModal('experience', i),
        editEducation: (i) => openModal('education', i),
        editCourse: (i) => openModal('course', i),
        editCategory: (i) => openModal('category', i),

        deleteProject: (i) => confirmAction(
            `Delete project "${state.projects[i]?.title}"?`,
            () => { state.projects.splice(i, 1); saveToLocalStorage(); renderAll(); showToast('Project deleted'); }
        ),
        deleteService: (i) => confirmAction(
            `Delete service "${state.services[i]?.title}"?`,
            () => { state.services.splice(i, 1); saveToLocalStorage(); renderAll(); showToast('Service deleted'); }
        ),
        deleteExperience: (i) => confirmAction(
            `Delete "${state.experience[i]?.title}" at ${state.experience[i]?.company}?`,
            () => { state.experience.splice(i, 1); saveToLocalStorage(); renderAll(); showToast('Experience deleted'); }
        ),
        deleteEducation: (i) => confirmAction(
            `Delete "${state.education[i]?.degree}"?`,
            () => { state.education.splice(i, 1); saveToLocalStorage(); renderAll(); showToast('Education deleted'); }
        ),
        deleteCourse: (i) => confirmAction(
            `Delete course "${state.courses[i]?.title}"?`,
            () => { state.courses.splice(i, 1); saveToLocalStorage(); renderAll(); showToast('Course deleted'); }
        ),
        deleteCategory: (i) => {
            if (state.categories[i]?.id === 'all') return;
            confirmAction(
                `Delete category "${state.categories[i]?.name}"?`,
                () => { state.categories.splice(i, 1); saveToLocalStorage(); renderAll(); showToast('Category deleted'); }
            );
        },

        removeSkill: (i) => {
            state.technicalSkills.splice(i, 1);
            saveToLocalStorage();
            renderSkillsTags();
            renderDashboard();
            showToast('Skill removed');
        },
        removeTool: (i) => {
            state.tools.splice(i, 1);
            saveToLocalStorage();
            renderSkillsTags();
            renderDashboard();
            showToast('Tool removed');
        },

        addImageField: addImageField,
        removeImageField: removeImageField,
        updateImagePreview: updateImagePreview,
        handleFilePicker: handleFilePicker
    };

    // ====== LOGIN PASSCODE SYSTEM ======
    const PASSCODE_KEY = 'ams_admin_passcode';
    const DEFAULT_PASSCODE = 'TK#BIM2026!Pass';
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const loginInput = document.getElementById('login-passcode');
    const passcodeForm = document.getElementById('passcode-form');

    function checkAuth() {
        const savedPasscode = localStorage.getItem(PASSCODE_KEY) || DEFAULT_PASSCODE;
        const sessionAuth = sessionStorage.getItem('ams_admin_authenticated');

        if (sessionAuth === 'true') {
            loginOverlay.classList.remove('active');
        } else {
            loginOverlay.classList.add('active');
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const entered = loginInput.value.trim();
            const savedPasscode = localStorage.getItem(PASSCODE_KEY) || DEFAULT_PASSCODE;

            if (entered === savedPasscode) {
                sessionStorage.setItem('ams_admin_authenticated', 'true');
                loginOverlay.classList.remove('active');
                showToast('Welcome back, Admin!');
            } else {
                showToast('❌ Incorrect Passcode!');
                loginInput.value = '';
                loginInput.focus();
            }
        });
    }

    if (passcodeForm) {
        passcodeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newPass = document.getElementById('new-passcode').value.trim();
            const confirmPass = document.getElementById('confirm-passcode').value.trim();

            if (!newPass) return showToast('⚠️ Enter a new passcode!');
            if (newPass !== confirmPass) return showToast('❌ Passcodes do not match!');

            localStorage.setItem(PASSCODE_KEY, newPass);
            document.getElementById('new-passcode').value = '';
            document.getElementById('confirm-passcode').value = '';
            showToast('✅ Passcode updated successfully!');
        });
    }

    // ====== GITHUB SYNC SYSTEM ======
    const GH_SETTINGS_KEY = 'ams_github_settings';
    const syncBtn = document.getElementById('sync-btn');
    const githubForm = document.getElementById('github-form');
    const testConnectionBtn = document.getElementById('test-connection-btn');
    const tokenToggle = document.getElementById('token-toggle');

    function loadGitHubSettings() {
        const saved = localStorage.getItem(GH_SETTINGS_KEY);
        let settings = {
            owner: 'MouatafaS',
            repo: 'Tahaportfolio',
            branch: 'main',
            path: 'js/data.js',
            token: ''
        };

        if (saved) {
            try {
                settings = { ...settings, ...JSON.parse(saved) };
            } catch (e) {}
        }

        document.getElementById('gh-owner').value = settings.owner || '';
        document.getElementById('gh-repo').value = settings.repo || '';
        document.getElementById('gh-branch').value = settings.branch || 'main';
        document.getElementById('gh-path').value = settings.path || 'js/data.js';
        document.getElementById('gh-token').value = settings.token || '';
        updateGitHubStatus(!!settings.token);
    }

    function saveGitHubSettings() {
        const settings = {
            owner: val('gh-owner'),
            repo: val('gh-repo'),
            branch: val('gh-branch') || 'main',
            path: val('gh-path') || 'js/data.js',
            token: val('gh-token')
        };
        localStorage.setItem(GH_SETTINGS_KEY, JSON.stringify(settings));
        return settings;
    }

    function getGitHubSettings() {
        const liveOwner = val('gh-owner');
        const liveRepo = val('gh-repo');
        const liveBranch = val('gh-branch') || 'main';
        const livePath = val('gh-path') || 'js/data.js';
        const liveToken = val('gh-token');

        if (liveOwner && liveRepo && liveToken) {
            return {
                owner: liveOwner,
                repo: liveRepo,
                branch: liveBranch,
                path: livePath,
                token: liveToken
            };
        }

        const saved = localStorage.getItem(GH_SETTINGS_KEY);
        return saved ? JSON.parse(saved) : null;
    }

    function updateGitHubStatus(connected) {
        const card = document.getElementById('github-status-card');
        const icon = document.getElementById('github-status-icon');
        const title = document.getElementById('github-status-title');
        const desc = document.getElementById('github-status-desc');

        if (connected) {
            const settings = getGitHubSettings();
            card.classList.add('connected');
            icon.innerHTML = '<i class="fa-solid fa-link"></i>';
            title.textContent = 'Connected';
            desc.textContent = `${settings ? settings.owner : ''}/${settings ? settings.repo : ''} (${settings ? settings.branch : 'main'})`;
        } else {
            card.classList.remove('connected');
            icon.innerHTML = '<i class="fa-solid fa-link-slash"></i>';
            title.textContent = 'Not Connected';
            desc.textContent = 'Set up your GitHub details below to enable one-click sync';
        }
    }

    function buildDataJsContent() {
        const exportData = {
            personalInfo: state.personalInfo,
            skills: state.skills || [],
            categories: state.categories,
            services: state.services,
            experience: state.experience,
            education: state.education,
            technicalSkills: state.technicalSkills,
            tools: state.tools,
            courses: state.courses,
            projects: state.projects
        };

        let content = 'const portfolioData = ';
        content += JSON.stringify(exportData, null, 4);
        content += ';\n';
        content = content.replace(/\\u0026/g, '&');
        content = content.replace(/\\u003c/g, '<');
        content = content.replace(/\\u003e/g, '>');
        return content;
    }

    // Helper to get GitHub Auth Headers (tries Bearer first, standard for GitHub API)
    function getAuthHeaders(token) {
        const cleanToken = (token || '').trim();
        return {
            'Authorization': `Bearer ${cleanToken}`,
            'Accept': 'application/vnd.github.v3+json'
        };
    }

    // Get current file SHA (required by GitHub API to update a file)
    async function getFileSHA(settings) {
        const url = `https://api.github.com/repos/${settings.owner}/${settings.repo}/contents/${settings.path}?ref=${settings.branch}`;
        const response = await fetch(url, {
            headers: getAuthHeaders(settings.token)
        });

        if (response.ok) {
            const data = await response.json();
            return data.sha;
        } else if (response.status === 404) {
            return null; // File doesn't exist yet, will create
        } else {
            throw new Error(`GitHub API error: ${response.status}`);
        }
    }

    // Helper to upload media file (image/video/PDF) directly into project folder on GitHub
    async function uploadMediaFileToGitHub(settings, folderName, fileName, base64Data) {
        const filePath = `assets/images/${folderName}/${fileName}`;
        const url = `https://api.github.com/repos/${settings.owner}/${settings.repo}/contents/${filePath}`;
        
        // Extract raw base64 after data URI prefix
        const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
        
        // Check if file already exists to get SHA
        let sha = null;
        try {
            const getRes = await fetch(`${url}?ref=${settings.branch}`, { headers: getAuthHeaders(settings.token) });
            if (getRes.ok) {
                const data = await getRes.json();
                sha = data.sha;
            }
        } catch(e) {}

        const body = {
            message: `Upload media ${fileName} for ${folderName}`,
            content: cleanBase64,
            branch: settings.branch
        };
        if (sha) body.sha = sha;

        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(settings.token),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            return `${folderName}/${fileName}`;
        } else {
            throw new Error(`Failed to upload file ${fileName}`);
        }
    }

    // Push data.js and all media files to GitHub
    async function syncToGitHub() {
        saveGitHubSettings();
        const settings = getGitHubSettings();
        if (!settings || !settings.owner || !settings.repo || !settings.token) {
            showToast('⚠️ Set up GitHub settings first!');
            switchSection('github');
            return;
        }

        // UI: show syncing state
        syncBtn.classList.add('syncing');
        syncBtn.innerHTML = '<i class="fa-solid fa-spinner"></i><span class="btn-text">Syncing...</span>';

        try {
            // 1. Process & Upload any Base64 media files into project folders on GitHub
            for (let p of state.projects) {
                if (p.images && p.images.length) {
                    const folderName = (p.title || 'project').replace(/[^a-zA-Z0-9_-]/g, '_').toUpperCase();
                    for (let i = 0; i < p.images.length; i++) {
                        const img = p.images[i];
                        if (img && img.startsWith('data:')) {
                            let ext = 'png';
                            if (img.includes('image/jpeg') || img.includes('image/jpg')) ext = 'jpg';
                            else if (img.includes('image/webp')) ext = 'webp';
                            else if (img.includes('video/mp4')) ext = 'mp4';
                            else if (img.includes('application/pdf')) ext = 'pdf';

                            const fileName = `media_${i + 1}_${Date.now()}.${ext}`;
                            showToast(`Uploading ${fileName} to GitHub...`);
                            const relativePath = await uploadMediaFileToGitHub(settings, folderName, fileName, img);
                            p.images[i] = relativePath;
                        }
                    }
                }
            }
            saveToLocalStorage();

            // 2. Get current data.js SHA
            const sha = await getFileSHA(settings);

            // 3. Build data.js content
            const content = buildDataJsContent();
            const base64Content = btoa(unescape(encodeURIComponent(content)));

            // 4. Push data.js to GitHub
            const url = `https://api.github.com/repos/${settings.owner}/${settings.repo}/contents/${settings.path}`;
            const body = {
                message: `Update portfolio data — ${new Date().toLocaleString()}`,
                content: base64Content,
                branch: settings.branch
            };

            if (sha) {
                body.sha = sha; // Required for updating existing file
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(settings.token),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                showToast('✅ Synced to GitHub! Site will update in ~1 minute.');
                renderAll();
            } else {
                const error = await response.json();
                throw new Error(error.message || `HTTP ${response.status}`);
            }
        } catch (error) {
            showToast('❌ Sync failed: ' + error.message);
            console.error('GitHub sync error:', error);
        } finally {
            // Reset button
            syncBtn.classList.remove('syncing');
            syncBtn.innerHTML = '<i class="fa-brands fa-github"></i><span class="btn-text">Sync to GitHub</span>';
        }
    }

    // Test GitHub connection
    async function testGitHubConnection() {
        saveGitHubSettings();
        const settings = getGitHubSettings();
        if (!settings || !settings.owner || !settings.repo || !settings.token) {
            showToast('⚠️ Fill in all GitHub settings first!');
            return;
        }

        testConnectionBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Testing...';

        try {
            // Test Token first
            const userUrl = 'https://api.github.com/user';
            const userRes = await fetch(userUrl, {
                headers: getAuthHeaders(settings.token)
            });

            if (!userRes.ok) {
                if (userRes.status === 401) {
                    updateGitHubStatus(false);
                    showToast('❌ Invalid token. Check your Personal Access Token.');
                    return;
                }
            }

            // Test Repo access
            const url = `https://api.github.com/repos/${settings.owner}/${settings.repo}`;
            const response = await fetch(url, {
                headers: getAuthHeaders(settings.token)
            });

            if (response.ok) {
                const repo = await response.json();
                updateGitHubStatus(true);
                showToast(`✅ Connected! Repo: ${repo.full_name}`);
            } else if (response.status === 404) {
                updateGitHubStatus(false);
                showToast('❌ Repository not found. Check owner/repo name.');
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            updateGitHubStatus(false);
            showToast('❌ Connection failed: ' + error.message);
        } finally {
            testConnectionBtn.innerHTML = '<i class="fa-solid fa-plug"></i> Test Connection';
        }
    }

    // GitHub form save
    if (githubForm) {
        githubForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveGitHubSettings();
            updateGitHubStatus(true);
            showToast('GitHub settings saved!');
        });
    }

    // Test connection button
    if (testConnectionBtn) {
        testConnectionBtn.addEventListener('click', testGitHubConnection);
    }

    // Sync button
    if (syncBtn) {
        syncBtn.addEventListener('click', syncToGitHub);
    }

    // Token visibility toggle
    if (tokenToggle) {
        tokenToggle.addEventListener('click', () => {
            const tokenInput = document.getElementById('gh-token');
            const icon = tokenToggle.querySelector('i');
            if (tokenInput.type === 'password') {
                tokenInput.type = 'text';
                icon.className = 'fa-solid fa-eye-slash';
            } else {
                tokenInput.type = 'password';
                icon.className = 'fa-solid fa-eye';
            }
        });
    }

    // ====== INIT ======
    checkAuth();
    loadData();
    renderAll();
    loadGitHubSettings();
});
