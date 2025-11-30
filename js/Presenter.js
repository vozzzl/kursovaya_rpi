class CoursePresenter {
    constructor(model, view) {
        this._model = model;
        this._view = view;
        this.currentFilters = {};
        
        this._model.addListener((courses) => this.onModelChange(courses));
        this.initialize();
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

    addCourse(courseData) {
        const newCourse = this._model.addCourse(courseData);
        if (Notification && typeof Notification.show === 'function') {
            Notification.show(`Курс "${newCourse.title}" добавлен`, 'success');
        }
        this.updateStatistics();
        return newCourse;
    }

    updateCourse(id, courseData) {
        const updatedCourse = this._model.updateCourse(id, courseData);
        if (updatedCourse) {
            if (Notification && typeof Notification.show === 'function') {
                Notification.show(`Курс "${updatedCourse.title}" обновлен`, 'success');
            }
            this._view.updateCourse(updatedCourse);
            this.updateStatistics();
        }
        return updatedCourse;
    }

    deleteCourse(id) {
        const course = this._model.getCourse(id);
        if (course && confirm(`Удалить курс "${course.title}"?`)) {
            const success = this._model.deleteCourse(id);
            if (success) {
                if (Notification && typeof Notification.show === 'function') {
                    Notification.show(`Курс "${course.title}" удален`, 'warning');
                }
                this._view.removeCourse(id);
                this.updateStatistics();
            }
            return success;
        }
        return false;
    }

    toggleFavorite(id) {
        const isFavorite = this._model.toggleFavorite(id);
        const course = this._model.getCourse(id);
        if (course) {
            const message = isFavorite ? 'добавлен в избранное' : 'удален из избранного';
            if (Notification && typeof Notification.show === 'function') {
                Notification.show(`Курс "${course.title}" ${message}`, 'info');
            }
            this._view.updateCourse(course);
            this.updateStatistics();
        }
        return isFavorite;
    }

    updateProgress(id, change) {
        const updatedCourse = this._model.updateProgress(id, change);
        if (updatedCourse) {
            const progress = Math.round((updatedCourse.completedLessons / updatedCourse.totalLessons) * 100);
            if (Notification && typeof Notification.show === 'function') {
                Notification.show(`Прогресс: ${updatedCourse.completedLessons}/${updatedCourse.totalLessons} (${progress}%)`, 'info');
            }
            this._view.updateCourse(updatedCourse);
            this.updateStatistics();
        }
        return updatedCourse;
    }

    setProgress(id, completedLessons) {
        const updatedCourse = this._model.setProgress(id, completedLessons);
        if (updatedCourse) {
            const progress = Math.round((updatedCourse.completedLessons / updatedCourse.totalLessons) * 100);
            if (Notification && typeof Notification.show === 'function') {
                Notification.show(`Прогресс установлен: ${updatedCourse.completedLessons}/${updatedCourse.totalLessons} (${progress}%)`, 'success');
            }
            this._view.updateCourse(updatedCourse);
            this.updateStatistics();
        }
        return updatedCourse;
    }

    duplicateCourse(id) {
        const duplicatedCourse = this._model.duplicateCourse(id);
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
