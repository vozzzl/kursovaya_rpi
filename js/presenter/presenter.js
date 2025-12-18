class CoursePresenter {
    constructor(model, view) {
        this._model = model;
        this._view = view;
        this.currentFilters = {};
        
        this._model.addListener((courses) => this.onModelChange(courses));
        this.initializeWithDelay();
    }

    async initializeWithDelay() {
        setTimeout(() => {
            this.initialize();
        }, 500);
    }

    initialize() {
        const courses = this._model.getAllCourses();
        console.log('Presenter: Initializing with courses:', courses.length);
        this._view.renderCourses(courses, this);
        this.updateStatistics();
    }

    onModelChange(courses) {
        console.log('Presenter: Model changed, courses:', courses.length);
        try {
            const filteredCourses = this.applyCurrentFilters(courses);
            this._view.renderCourses(filteredCourses, this);
            this.updateStatistics();
        } catch (error) {
            console.error('Error in onModelChange:', error);
        }
    }

    applyFilters(filters) {
        try {
            this.currentFilters = filters;
            const courses = this._model.getAllCourses();
            const filteredCourses = this.applyCurrentFilters(courses);
            this._view.renderCourses(filteredCourses, this);
            this.updateStatistics();
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    }

    applyCurrentFilters(courses) {
        let filtered = courses.filter(course => {
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                
                if (searchTerm.startsWith('#')) {
                    const tagSearch = searchTerm.slice(1);
                    const matchesTags = course.tags.some(tag => 
                        tag.toLowerCase().includes(tagSearch)
                    );
                    if (!matchesTags) return false;
                } else {
                    const matchesTitle = course.title.toLowerCase().includes(searchTerm);
                    const matchesDesc = course.description.toLowerCase().includes(searchTerm);
                    const matchesTags = course.tags.some(tag => 
                        tag.toLowerCase().includes(searchTerm)
                    );
                    if (!matchesTitle && !matchesDesc && !matchesTags) {
                        return false;
                    }
                }
            }
            
            if (this.currentFilters.statuses && this.currentFilters.statuses.length > 0) {
                if (!this.currentFilters.statuses.includes(course.status)) {
                    return false;
                }
            }
            
            if (this.currentFilters.onlyFavorites && !course.favorite) {
                return false;
            }
            
            return true;
        });
        
        filtered = this.sortCourses(filtered, this.currentFilters.sort);
        
        return filtered;
    }

    sortCourses(courses, sortType) {
        const sorted = [...courses];
        
        switch (sortType) {
            case 'alpha_asc':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'progress_desc':
                sorted.sort((a, b) => {
                    const progressA = a.completedLessons / a.totalLessons;
                    const progressB = b.completedLessons / b.totalLessons;
                    return progressB - progressA;
                });
                break;
            case 'progress_asc':
                sorted.sort((a, b) => {
                    const progressA = a.completedLessons / a.totalLessons;
                    const progressB = b.completedLessons / b.totalLessons;
                    return progressA - progressB;
                });
                break;
            case 'favorites_first':
                sorted.sort((a, b) => {
                    if (a.favorite && !b.favorite) return -1;
                    if (!a.favorite && b.favorite) return 1;
                    return new Date(b.lastUpdated) - new Date(a.lastUpdated);
                });
                break;
            case 'updated_desc':
            default:
                sorted.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
                break;
        }
        
        return sorted;
    }

    updateStatistics() {
        try {
            const stats = this._model.getStatistics();
            console.log('Presenter: Updating statistics with:', stats);
            this._view.updateStatistics(stats);
        } catch (error) {
            console.error('Error updating statistics:', error);
        }
    }

    async addCourse(courseData) {
        try {
            const newCourse = await this._model.addCourse(courseData);
            if (Notification && typeof Notification.show === 'function') {
                Notification.show(`Курс "${newCourse.title}" добавлен`, 'success');
            }
            this.updateStatistics();
            return newCourse;
        } catch (error) {
            console.error('Error adding course:', error);
            Notification.show('Ошибка добавления курса', 'error');
            return null;
        }
    }

    async updateCourse(id, courseData) {
        try {
            const updatedCourse = await this._model.updateCourse(id, courseData);
            if (updatedCourse) {
                if (Notification && typeof Notification.show === 'function') {
                    Notification.show(`Курс "${updatedCourse.title}" обновлен`, 'success');
                }
                this._view.updateCourse(updatedCourse);
                this.updateStatistics();
            }
            return updatedCourse;
        } catch (error) {
            console.error('Error updating course:', error);
            Notification.show('Ошибка обновления курса', 'error');
            return null;
        }
    }

    async deleteCourse(id) {
        const course = this._model.getCourse(id);
        if (course && confirm(`Удалить курс "${course.title}"?`)) {
            try {
                const success = await this._model.deleteCourse(id);
                if (success) {
                    if (Notification && typeof Notification.show === 'function') {
                        Notification.show(`Курс "${course.title}" удален`, 'warning');
                    }
                    this._view.removeCourse(id);
                    this.updateStatistics();
                }
                return success;
            } catch (error) {
                console.error('Error deleting course:', error);
                Notification.show('Ошибка удаления курса', 'error');
                return false;
            }
        }
        return false;
    }

    async toggleFavorite(id) {
        try {
            const updatedCourse = await this._model.toggleFavorite(id);
            if (updatedCourse) {
                const message = updatedCourse.favorite ? 'добавлен в избранное' : 'удален из избранного';
                if (Notification && typeof Notification.show === 'function') {
                    Notification.show(`Курс "${updatedCourse.title}" ${message}`, 'info');
                }
                this._view.updateCourse(updatedCourse);
                this.updateStatistics();
            }
            return updatedCourse;
        } catch (error) {
            console.error('Error toggling favorite:', error);
            Notification.show('Ошибка обновления избранного', 'error');
            return null;
        }
    }

    async updateProgress(id, change) {
        try {
            const updatedCourse = await this._model.updateProgress(id, change);
            if (updatedCourse) {
                const progress = Math.round((updatedCourse.completedLessons / updatedCourse.totalLessons) * 100);
                if (Notification && typeof Notification.show === 'function') {
                    Notification.show(`Прогресс: ${updatedCourse.completedLessons}/${updatedCourse.totalLessons} (${progress}%)`, 'info');
                }
                this._view.updateCourse(updatedCourse);
                this.updateStatistics();
            }
            return updatedCourse;
        } catch (error) {
            console.error('Error updating progress:', error);
            Notification.show('Ошибка обновления прогресса', 'error');
            return null;
        }
    }

    async setProgress(id, completedLessons) {
        try {
            const updatedCourse = await this._model.setProgress(id, completedLessons);
            if (updatedCourse) {
                const progress = Math.round((updatedCourse.completedLessons / updatedCourse.totalLessons) * 100);
                if (Notification && typeof Notification.show === 'function') {
                    Notification.show(`Прогресс установлен: ${updatedCourse.completedLessons}/${updatedCourse.totalLessons} (${progress}%)`, 'success');
                }
                this._view.updateCourse(updatedCourse);
                this.updateStatistics();
            }
            return updatedCourse;
        } catch (error) {
            console.error('Error setting progress:', error);
            Notification.show('Ошибка установки прогресса', 'error');
            return null;
        }
    }

    async duplicateCourse(id) {
        try {
            const duplicatedCourse = await this._model.duplicateCourse(id);
            if (duplicatedCourse) {
                if (Notification && typeof Notification.show === 'function') {
                    Notification.show(`Курс "${duplicatedCourse.title}" создан`, 'success');
                }
                const courses = this._model.getAllCourses();
                const filteredCourses = this.applyCurrentFilters(courses);
                this._view.renderCourses(filteredCourses, this);
                this.updateStatistics();
            }
            return duplicatedCourse;
        } catch (error) {
            console.error('Error duplicating course:', error);
            Notification.show('Ошибка создания копии курса', 'error');
            return null;
        }
    }

    editCourse(id) {
        const course = this._model.getCourse(id);
        if (course && this._view.modal) {
            this._view.modal.open(course);
        }
    }

    get model() {
        return this._model;
    }

    get view() {
        return this._view;
    }
}