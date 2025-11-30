class Modal {
    constructor(presenter) {
        this.presenter = presenter;
        this.dialog = document.getElementById('editor');
        this.form = document.getElementById('editorForm');
        
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('addBtn')?.addEventListener('click', () => this.open());
        document.getElementById('emptyAdd')?.addEventListener('click', () => this.open());
        
        this.form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.save();
        });
        
        this.dialog?.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close-btn')) {
                this.close();
            }
            if (e.target.value === 'cancel') {
                this.close();
            }
            if (e.target === this.dialog) {
                this.close();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.dialog?.open) {
                this.close();
            }
        });
        
        document.getElementById('fTotal')?.addEventListener('input', () => this.updateProgressBar());
        document.getElementById('fDone')?.addEventListener('input', () => this.updateProgressBar());
    }

    open(course = null) {
        this.currentCourse = course;
        
        if (course) {
            document.getElementById('modalTitle').textContent = 'Редактировать курс';
            this.fillForm(course);
        } else {
            document.getElementById('modalTitle').textContent = 'Новый курс';
            this.clearForm();
        }
        
        this.dialog.showModal();
    }

    close() {
        this.dialog.close();
        this.currentCourse = null;
    }

    fillForm(course) {
        document.getElementById('fTitle').value = course.title;
        document.getElementById('fDesc').value = course.description;
        document.getElementById('fTags').value = course.tags.join(', ');
        document.getElementById('fTotal').value = course.totalLessons;
        document.getElementById('fDone').value = course.completedLessons;
        this.createStatusRadios(course.status);
        this.updateProgressBar();
    }

    clearForm() {
        document.getElementById('fTitle').value = '';
        document.getElementById('fDesc').value = '';
        document.getElementById('fTags').value = '';
        document.getElementById('fTotal').value = 10;
        document.getElementById('fDone').value = 0;
        this.createStatusRadios('planned');
        this.updateProgressBar();
    }

    createStatusRadios(selectedStatus) {
        const container = document.getElementById('statusRadios');
        container.innerHTML = '';
        
        const statuses = [
            { value: 'planned', label: 'Запланирован', color: 'b-planned' },
            { value: 'in_progress', label: 'В процессе', color: 'b-in_progress' },
            { value: 'completed', label: 'Завершен', color: 'b-completed' }
        ];
        
        statuses.forEach(status => {
            const label = document.createElement('label');
            label.className = 'pill';
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'fStatus';
            radio.value = status.value;
            radio.checked = status.value === selectedStatus;
            
            const badge = document.createElement('span');
            badge.className = `badge ${status.color}`;
            badge.textContent = status.label;
            
            label.appendChild(radio);
            label.appendChild(badge);
            container.appendChild(label);
        });
    }

    updateProgressBar() {
        const total = parseInt(document.getElementById('fTotal').value) || 0;
        const done = parseInt(document.getElementById('fDone').value) || 0;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        
        document.getElementById('fProgress').style.width = `${progress}%`;
        document.getElementById('fPct').textContent = progress;
    }

    save() {
        const title = document.getElementById('fTitle').value.trim();
        if (!title) {
            alert('Пожалуйста, введите название курса');
            return;
        }
        
        const formData = {
            title: title,
            description: document.getElementById('fDesc').value.trim(),
            tags: document.getElementById('fTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            totalLessons: parseInt(document.getElementById('fTotal').value) || 1,
            completedLessons: parseInt(document.getElementById('fDone').value) || 0,
            status: document.querySelector('input[name="fStatus"]:checked').value
        };
        
        if (this.currentCourse) {
            this.presenter.updateCourse(this.currentCourse.id, formData);
        } else {
            this.presenter.addCourse(formData);
        }
        
        this.close();
    }
}