class CourseCardActions {
    constructor(course, presenter) {
        this.course = course;
        this.presenter = presenter;
    }

    createQuickActions() {
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'quick-actions row';
        
        if (this.course.completedLessons < this.course.totalLessons) {
            const completeAllBtn = this.createActionButton('✅ Все', 'Отметить все уроки как пройденные', () => {
                if (this.presenter && this.presenter.setProgress) {
                    this.presenter.setProgress(this.course.id, this.course.totalLessons);
                }
            });
            actionsContainer.appendChild(completeAllBtn);
        }

        if (this.course.completedLessons > 0) {
            const resetBtn = this.createActionButton('🔄 Сброс', 'Сбросить прогресс', () => {
                if (this.presenter && this.presenter.setProgress) {
                    this.presenter.setProgress(this.course.id, 0);
                }
            });
            actionsContainer.appendChild(resetBtn);
        }

        const duplicateBtn = this.createActionButton('📋 Дубль', 'Создать копию курса', () => {
            if (this.presenter && this.presenter.duplicateCourse) {
                this.presenter.duplicateCourse(this.course.id);
            }
        });
        actionsContainer.appendChild(duplicateBtn);

        return actionsContainer.children.length > 0 ? actionsContainer : null;
    }

    createActionButton(text, title, onClick) {
        const button = document.createElement('button');
        button.className = 'btn small';
        button.textContent = text;
        button.title = title;
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            try {
                onClick();
            } catch (error) {
                console.error('Error in action button handler:', error);
            }
        });
        return button;
    }

    updateActions(container) {
        if (!container) return;
        
        const quickActions = container.querySelector('.quick-actions');
        if (quickActions) {
            quickActions.remove();
        }
        
        const newActions = this.createQuickActions();
        if (newActions) {
            const controls = container.querySelector('.controls');
            if (controls && controls.parentNode) {
                controls.parentNode.insertBefore(newActions, controls.nextSibling);
            }
        }
    }
}