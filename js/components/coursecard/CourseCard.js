class CourseCard {
    constructor(course, presenter) {
        this.course = course;
        this.presenter = presenter;
        this.element = null;
        
        this.header = new CourseCardHeader(course, presenter);
        this.tags = new CourseCardTags(course);
        this.progress = new CourseCardProgress(course, presenter);
        this.actions = new CourseCardActions(course, presenter);
        
        this.eventHandlers = new Map();
        this.createCard();
    }

    createCard() {
        try {
            const card = document.createElement('article');
            card.className = 'card course';
            card.dataset.id = this.course.id;
            
            card.appendChild(this.header.createHeader());
            
            const desc = document.createElement('p');
            desc.className = 'desc muted course-desc';
            desc.textContent = this.course.description;
            card.appendChild(desc);
            
            card.appendChild(this.tags.createTags());
            
            card.appendChild(this.progress.createProgress());
            
            const quickActions = this.actions.createQuickActions();
            if (quickActions) {
                card.appendChild(quickActions);
            }

            card.appendChild(this.progress.createControls());
            
            this.element = card;
            this.bindEvents();
            
        } catch (error) {
            console.error('Error creating course card:', error);
        }
    }

    bindEvents() {
        if (!this.element) return;

        try {
            this.addEventHandler(this.element, 'dblclick', (e) => {
                if (!e.target.closest('.course-actions') && !e.target.closest('.controls')) {
                    if (this.presenter && this.presenter.editCourse) {
                        this.presenter.editCourse(this.course.id);
                    }
                }
            });

            this.addEventHandler(this.element, 'mouseenter', () => {
                if (this.element) {
                    this.element.style.transform = 'translateY(-2px)';
                    this.element.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }
            });

            this.addEventHandler(this.element, 'mouseleave', () => {
                if (this.element) {
                    this.element.style.transform = 'translateY(0)';
                    this.element.style.boxShadow = 'var(--shadow)';
                }
            });

        } catch (error) {
            console.error('Error binding events to course card:', error);
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

    update(course) {
        this.course = course;
        
        this.header.course = course;
        this.tags.course = course;
        this.progress.course = course;
        this.actions.course = course;
        
        if (this.element) {
            const headerElement = this.element.querySelector('.course-head');
            if (headerElement) {
                this.header.updateHeader(headerElement);
            }
            
            const descElement = this.element.querySelector('.course-desc');
            if (descElement) {
                descElement.textContent = course.description;
            }
            
            const tagsElement = this.element.querySelector('.tags');
            if (tagsElement) {
                this.tags.updateTags(tagsElement);
            }
            
            const progressContainer = this.element.querySelector('.progress').parentNode;
            if (progressContainer) {
                this.progress.updateProgress(progressContainer);
            }
            
            this.actions.updateActions(this.element);
            
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
        this.header = null;
        this.tags = null;
        this.progress = null;
        this.actions = null;
    }
}