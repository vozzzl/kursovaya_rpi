class CourseCard {
    constructor(course, presenter) {
        this.course = course;
        this.presenter = presenter;
        this.element = null;
        this.eventHandlers = new Map();
        this.createCard();
    }

    createCard() {
        try {
            const template = document.getElementById('courseTpl');
            if (!template) {
                console.error('Course template not found');
                return;
            }

            const card = template.content.cloneNode(true).querySelector('.course');
            if (!card) {
                console.error('Course card element not found in template');
                return;
            }
            
            card.dataset.id = this.course.id;
            this.element = card;
            this.updateCardContent();
            this.bindEvents();
            
        } catch (error) {
            console.error('Error creating course card:', error);
        }
    }

    updateCardContent() {
        if (!this.element) return;

        try {
            const progress = this.course.totalLessons > 0 
                ? (this.course.completedLessons / this.course.totalLessons) * 100 
                : 0;
            const progressPercent = Math.round(progress);

            const titleElement = this.element.querySelector('.course-title');
            const descElement = this.element.querySelector('.course-desc');
            if (titleElement) titleElement.textContent = this.course.title;
            if (descElement) descElement.textContent = this.course.description;
            
            const statusBadge = this.element.querySelector('.status');
            if (statusBadge) {
                statusBadge.textContent = this.getStatusText(this.course.status);
                statusBadge.className = `badge status ${this.getStatusClass(this.course.status)}`;
            }
            
            const favBtn = this.element.querySelector('.favBtn');
            const favLabel = this.element.querySelector('.favLabel');
            if (favBtn) {
                favBtn.textContent = this.course.favorite ? '★' : '☆';
                favBtn.classList.toggle('fav', this.course.favorite);
            }
            if (favLabel) {
                favLabel.hidden = !this.course.favorite;
            }

            const tagsContainer = this.element.querySelector('.tags');
            if (tagsContainer) {
                tagsContainer.innerHTML = '';
                this.course.tags.forEach(tag => {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'tag';
                    tagElement.textContent = tag;
                    tagsContainer.appendChild(tagElement);
                });
            }
            
            const progressText = this.element.querySelector('.progressText');
            const progressPct = this.element.querySelector('.progress-pct');
            const progressBar = this.element.querySelector('.bar');
            
            if (progressText) {
                progressText.textContent = `Прогресс: ${this.course.completedLessons}/${this.course.totalLessons} уроков`;
            }
            if (progressPct) {
                progressPct.textContent = `${progressPercent}%`;
            }
            if (progressBar) {
                progressBar.style.width = `${progressPercent}%`;
            }
            
            const statusSelect = this.element.querySelector('.statusSel');
            if (statusSelect) {
                statusSelect.value = this.course.status;
            }

            this.addQuickActions();
            
        } catch (error) {
            console.error('Error updating course card content:', error);
        }
    }

    addQuickActions() {
        if (!this.element) return;

        try {
            const oldActions = this.element.querySelector('.quick-actions');
            if (oldActions) {
                oldActions.remove();
            }

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

            if (actionsContainer.children.length > 0) {
                const controls = this.element.querySelector('.controls');
                if (controls && controls.parentNode) {
                    controls.parentNode.insertBefore(actionsContainer, controls.nextSibling);
                }
            }
        } catch (error) {
            console.error('Error adding quick actions:', error);
        }
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

    bindEvents() {
        if (!this.element) return;

        try {
            this.bindButton('.favBtn', 'click', () => {
                if (this.presenter && this.presenter.toggleFavorite) {
                    this.presenter.toggleFavorite(this.course.id);
                }
            });

            this.bindButton('.editBtn', 'click', () => {
                if (this.presenter && this.presenter.editCourse) {
                    this.presenter.editCourse(this.course.id);
                }
            });

            this.bindButton('.delBtn', 'click', () => {
                if (this.presenter && this.presenter.deleteCourse) {
                    this.presenter.deleteCourse(this.course.id);
                }
            });

            this.bindButton('.minus', 'click', () => {
                if (this.presenter && this.presenter.updateProgress) {
                    this.presenter.updateProgress(this.course.id, -1);
                }
            });

            this.bindButton('.plus', 'click', () => {
                if (this.presenter && this.presenter.updateProgress) {
                    this.presenter.updateProgress(this.course.id, 1);
                }
            });
            
            this.bindSelect('.statusSel', 'change', (e) => {
                if (this.presenter && this.presenter.updateCourse) {
                    this.presenter.updateCourse(this.course.id, { status: e.target.value });
                }
            });

            this.bindElement('.progress', 'click', (e) => {
                const rect = e.target.getBoundingClientRect();
                const clickPosition = (e.clientX - rect.left) / rect.width;
                const newCompleted = Math.round(clickPosition * this.course.totalLessons);
                if (this.presenter && this.presenter.setProgress) {
                    this.presenter.setProgress(this.course.id, newCompleted);
                }
            });

            this.bindElement(this.element, 'dblclick', (e) => {
                if (!e.target.closest('.course-actions') && !e.target.closest('.controls')) {
                    if (this.presenter && this.presenter.editCourse) {
                        this.presenter.editCourse(this.course.id);
                    }
                }
            });

            this.bindElement(this.element, 'mouseenter', () => {
                if (this.element) {
                    this.element.style.transform = 'translateY(-2px)';
                    this.element.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }
            });

            this.bindElement(this.element, 'mouseleave', () => {
                if (this.element) {
                    this.element.style.transform = 'translateY(0)';
                    this.element.style.boxShadow = 'var(--shadow)';
                }
            });

        } catch (error) {
            console.error('Error binding events to course card:', error);
        }
    }

    bindButton(selector, event, handler) {
        const element = this.element.querySelector(selector);
        if (element) {
            this.addEventHandler(element, event, (e) => {
                e.stopPropagation();
                try {
                    handler();
                } catch (error) {
                    console.error(`Error in ${selector} ${event} handler:`, error);
                }
            });
        }
    }

    bindSelect(selector, event, handler) {
        const element = this.element.querySelector(selector);
        if (element) {
            this.addEventHandler(element, event, (e) => {
                e.stopPropagation();
                try {
                    handler(e);
                } catch (error) {
                    console.error(`Error in ${selector} ${event} handler:`, error);
                }
            });
        }
    }

    bindElement(element, event, handler) {
        try {
            if (typeof element === 'string') {
                element = this.element.querySelector(element);
            }
            if (element) {
                this.addEventHandler(element, event, (e) => {
                    try {
                        handler(e);
                    } catch (error) {
                        console.error(`Error in element ${event} handler:`, error);
                    }
                });
            }
        } catch (error) {
            console.error('Error binding element:', error);
        }
    }

    addEventHandler(element, event, handler) {
        if (!element) return;
        
        try {
            const wrappedHandler = (e) => {
                try {
                    handler(e);
                } catch (error) {
                    console.error(`Error in ${event} handler:`, error);
                }
            };
            
            element.addEventListener(event, wrappedHandler);
            if (!this.eventHandlers.has(element)) {
                this.eventHandlers.set(element, new Map());
            }
            this.eventHandlers.get(element).set(event, wrappedHandler);
        } catch (error) {
            console.error('Error adding event handler:', error);
        }
    }

    removeEventHandlers() {
        try {
            this.eventHandlers.forEach((handlers, element) => {
                handlers.forEach((handler, event) => {
                    try {
                        if (element && element.removeEventListener) {
                            element.removeEventListener(event, handler);
                        }
                    } catch (error) {
                        console.error('Error removing event handler:', error);
                    }
                });
            });
            this.eventHandlers.clear();
        } catch (error) {
            console.error('Error removing event handlers:', error);
        }
    }

    getStatusText(status) {
        const statusMap = {
            'planned': 'Запланирован',
            'in_progress': 'В процессе',
            'completed': 'Завершен'
        };
        return statusMap[status] || status;
    }

    getStatusClass(status) {
        const classMap = {
            'planned': 'b-planned',
            'in_progress': 'b-in_progress',
            'completed': 'b-completed'
        };
        return classMap[status] || '';
    }

    update(course) {
        this.course = course;
        this.updateCardContent();
        
        if (this.element) {
            this.element.classList.add('updated');
            setTimeout(() => {
                if (this.element) {
                    this.element.classList.remove('updated');
                }
            }, 1000);
        }
    }

    destroy() {
        this.removeEventHandlers();
        
        if (this.element && this.element.parentNode) {
            this.element.remove();
        }
        
        this.element = null;
        this.presenter = null;
        this.course = null;
    }
}
