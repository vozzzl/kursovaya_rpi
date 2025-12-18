class CourseView {
    constructor() {
        this.coursesContainer = document.getElementById('list');
        this.emptyState = document.getElementById('empty');
        this.courseComponents = new Map();
        
        try {
            console.log('Initializing CourseView...');
            
            const statTotalElement = document.getElementById('statTotal');
            const statAvgElement = document.getElementById('statAvg');
            const statAvgBarElement = document.getElementById('statAvgBar');
            
            console.log('Found stat elements:', {
                statTotalElement, statAvgElement, statAvgBarElement
            });
            
            const statsContainer = document.createElement('div');
            statsContainer.id = 'statsContainer';
            
            this.statistics = new Statistics('statsContainer');
            console.log('Statistics component initialized');
            
            this.filterControls = null;
            this.modal = null;
            
            this.setupEmptyState();
        } catch (error) {
            console.error('Error initializing CourseView:', error);
        }
    }

    initialize(presenter) {
        this.presenter = presenter;
        this.filterControls = new FilterControls(presenter);
        this.modal = new Modal(presenter);
        console.log('CourseView fully initialized with presenter');
    }

    setupEmptyState() {
        try {
            if (this.emptyState) {
                const emptyAddBtn = this.emptyState.querySelector('#emptyAdd');
                if (emptyAddBtn) {
                    emptyAddBtn.addEventListener('click', () => {
                        if (this.modal) {
                            this.modal.open();
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error setting up empty state:', error);
        }
    }

    renderCourses(courses, presenter = null) {
        if (!this.coursesContainer) {
            console.error('Courses container not found');
            return;
        }
        
        try {
            if (presenter) {
                this.presenter = presenter;
            }

            console.log('Rendering courses:', courses.length);
            
            this.coursesContainer.innerHTML = '';
            
            this.courseComponents.forEach(component => {
                try {
                    if (component && typeof component.destroy === 'function') {
                        component.destroy();
                    }
                } catch (error) {
                    console.error('Error destroying course component:', error);
                }
            });
            this.courseComponents.clear();
            
            courses.forEach(course => {
                try {
                    const courseComponent = new CourseCard(course, this.presenter);
                    if (courseComponent.element) {
                        this.courseComponents.set(course.id, courseComponent);
                        this.coursesContainer.appendChild(courseComponent.element);
                    }
                } catch (error) {
                    console.error('Error rendering course:', course.id, error);
                }
            });
            
            this.updateEmptyState(courses.length === 0);
            
        } catch (error) {
            console.error('Error rendering courses:', error);
        }
    }

    updateEmptyState(isEmpty) {
        try {
            if (this.emptyState) {
                this.emptyState.hidden = !isEmpty;
            }
            if (this.coursesContainer) {
                this.coursesContainer.hidden = isEmpty;
            }
        } catch (error) {
            console.error('Error updating empty state:', error);
        }
    }

    updateCourse(course) {
        try {
            const component = this.courseComponents.get(course.id);
            if (component && typeof component.update === 'function') {
                component.update(course);
            }
        } catch (error) {
            console.error('Error updating course:', course.id, error);
        }
    }

    removeCourse(courseId) {
        try {
            const component = this.courseComponents.get(courseId);
            if (component) {
                if (typeof component.destroy === 'function') {
                    component.destroy();
                }
                this.courseComponents.delete(courseId);
                
                const remainingCourses = Array.from(this.courseComponents.values());
                this.updateEmptyState(remainingCourses.length === 0);
            }
        } catch (error) {
            console.error('Error removing course:', courseId, error);
        }
    }

 updateStatistics(stats) {
        try {
            console.log('View: Updating statistics with:', stats);
            
            const statTotalElement = document.getElementById('statTotal');
            const statAvgElement = document.getElementById('statAvg');
            const statAvgBarElement = document.getElementById('statAvgBar');
            
            if (statTotalElement) {
                statTotalElement.textContent = stats.total;
            }
            
            if (statAvgElement) {
                statAvgElement.textContent = stats.averageProgress;
            }
            
            if (statAvgBarElement) {
                statAvgBarElement.style.width = `${stats.averageProgress}%`;
            }
            
            if (this.statistics && typeof this.statistics.update === 'function') {
                this.statistics.update(stats);
            }
        } catch (error) {
            console.error('Error updating statistics:', error);
        }
    }
}