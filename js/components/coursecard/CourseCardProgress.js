class CourseCardProgress {
    constructor(course, presenter) {
        this.course = course;
        this.presenter = presenter;
    }

    createProgress() {
        const progress = (this.course.completedLessons / this.course.totalLessons) * 100;
        const progressPercent = Math.round(progress);
        
        const container = document.createElement('div');
        
        const infoRow = document.createElement('div');
        infoRow.className = 'row progress-info-row';
        
        const progressText = document.createElement('span');
        progressText.className = 'progressText';
        progressText.textContent = `Прогресс: ${this.course.completedLessons}/${this.course.totalLessons} уроков`;
        
        const progressPct = document.createElement('span');
        progressPct.className = 'pct progress-pct';
        progressPct.textContent = `${progressPercent}%`;
        
        infoRow.appendChild(progressText);
        infoRow.appendChild(progressPct);
        
        const progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'progress';
        
        const progressBar = document.createElement('span');
        progressBar.className = 'bar';
        progressBar.style.width = `${progressPercent}%`;
        
        progressBarContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = progressBarContainer.getBoundingClientRect();
            const clickPosition = (e.clientX - rect.left) / rect.width;
            const newCompleted = Math.round(clickPosition * this.course.totalLessons);
            if (this.presenter && this.presenter.setProgress) {
                this.presenter.setProgress(this.course.id, newCompleted);
            }
        });
        
        progressBarContainer.appendChild(progressBar);
        
        container.appendChild(infoRow);
        container.appendChild(progressBarContainer);
        
        return container;
    }

    createControls() {
        const controls = document.createElement('div');
        controls.className = 'controls';
        
        const minusBtn = document.createElement('button');
        minusBtn.className = 'btn minus';
        minusBtn.textContent = '−1';
        minusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.presenter && this.presenter.updateProgress) {
                this.presenter.updateProgress(this.course.id, -1);
            }
        });
        
        const plusBtn = document.createElement('button');
        plusBtn.className = 'btn plus';
        plusBtn.textContent = '+1';
        plusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.presenter && this.presenter.updateProgress) {
                this.presenter.updateProgress(this.course.id, 1);
            }
        });
        
        const statusSelect = document.createElement('select');
        statusSelect.className = 'statusSel';
        
        const options = [
            { value: 'planned', text: 'Запланирован' },
            { value: 'in_progress', text: 'В процессе' },
            { value: 'completed', text: 'Завершен' }
        ];
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            if (option.value === this.course.status) {
                optionElement.selected = true;
            }
            statusSelect.appendChild(optionElement);
        });
        
        statusSelect.addEventListener('change', (e) => {
            e.stopPropagation();
            if (this.presenter && this.presenter.updateCourse) {
                this.presenter.updateCourse(this.course.id, { status: e.target.value });
            }
        });
        
        controls.appendChild(minusBtn);
        controls.appendChild(plusBtn);
        controls.appendChild(statusSelect);
        
        return controls;
    }

    updateProgress(container) {
        const progress = (this.course.completedLessons / this.course.totalLessons) * 100;
        const progressPercent = Math.round(progress);
        
        const progressText = container.querySelector('.progressText');
        const progressPct = container.querySelector('.progress-pct');
        const progressBar = container.querySelector('.bar');
        const statusSelect = container.querySelector('.statusSel');
        
        if (progressText) {
            progressText.textContent = `Прогресс: ${this.course.completedLessons}/${this.course.totalLessons} уроков`;
        }
        
        if (progressPct) {
            progressPct.textContent = `${progressPercent}%`;
        }
        
        if (progressBar) {
            progressBar.style.width = `${progressPercent}%`;
        }
        
        if (statusSelect) {
            statusSelect.value = this.course.status;
        }
    }
}