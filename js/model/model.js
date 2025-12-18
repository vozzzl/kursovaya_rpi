class CourseModel {
    constructor() {
        this.courses = [];
        this.listeners = [];
        this.baseUrl = 'https://6943a43b69b12460f31568b3.mockapi.io';
        this.endpoint = 'courses';
        this.loadFromApi();
    }

    async loadFromApi() {
        try {
            const response = await fetch(`${this.baseUrl}/${this.endpoint}`);
            if (!response.ok) throw new Error('Ошибка загрузки данных');
            this.courses = await response.json();
            this.notifyListeners();
        } catch (error) {
            console.error('Ошибка загрузки с API:', error);
            this.loadFromStorage();
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('courses');
            if (stored) {
                this.courses = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Ошибка загрузки из localStorage:', error);
        }
    }

    async saveToApi() {
        try {
            this.notifyListeners();
        } catch (error) {
            console.error('Ошибка синхронизации с API:', error);
        }
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    notifyListeners() {
        console.log('Model: Notifying listeners, count:', this.listeners.length);
        this.listeners.forEach(listener => {
            try {
                listener(this.courses);
            } catch (error) {
                console.error('Ошибка в listener:', error);
            }
        });
    }

    getAllCourses() {
        return [...this.courses];
    }

    getCourse(id) {
        return this.courses.find(course => course.id === id);
    }

    async addCourse(courseData) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...courseData,
                    lastUpdated: new Date().toISOString()
                })
            });
            
            if (!response.ok) throw new Error('Ошибка добавления курса');
            
            const newCourse = await response.json();
            this.courses.push(newCourse);
            this.saveToApi();
            return newCourse;
        } catch (error) {
            console.error('Ошибка добавления курса в API:', error);
            const newCourse = {
                id: 'course-' + Date.now(),
                ...courseData,
                lastUpdated: new Date().toISOString()
            };
            this.courses.push(newCourse);
            localStorage.setItem('courses', JSON.stringify(this.courses));
            this.saveToApi();
            return newCourse;
        }
    }

    async updateCourse(id, courseData) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.endpoint}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...courseData,
                    lastUpdated: new Date().toISOString()
                })
            });
            
            if (!response.ok) throw new Error('Ошибка обновления курса');
            
            const updatedCourse = await response.json();
            const index = this.courses.findIndex(course => course.id === id);
            if (index !== -1) {
                this.courses[index] = updatedCourse;
            }
            this.saveToApi();
            return updatedCourse;
        } catch (error) {
            console.error('Ошибка обновления курса в API:', error);
            const index = this.courses.findIndex(course => course.id === id);
            if (index !== -1) {
                this.courses[index] = {
                    ...this.courses[index],
                    ...courseData,
                    lastUpdated: new Date().toISOString()
                };
                localStorage.setItem('courses', JSON.stringify(this.courses));
                this.saveToApi();
                return this.courses[index];
            }
            return null;
        }
    }

    async deleteCourse(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.endpoint}/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Ошибка удаления курса');
            
            const index = this.courses.findIndex(course => course.id === id);
            if (index !== -1) {
                this.courses.splice(index, 1);
            }
            this.saveToApi();
            return true;
        } catch (error) {
            console.error('Ошибка удаления курса из API:', error);
            const index = this.courses.findIndex(course => course.id === id);
            if (index !== -1) {
                this.courses.splice(index, 1);
                localStorage.setItem('courses', JSON.stringify(this.courses));
                this.saveToApi();
                return true;
            }
            return false;
        }
    }

    async toggleFavorite(id) {
        const course = this.getCourse(id);
        if (course) {
            const updatedData = {
                favorite: !course.favorite,
                lastUpdated: new Date().toISOString()
            };
            return await this.updateCourse(id, updatedData);
        }
        return false;
    }

    async updateProgress(id, change) {
        const course = this.getCourse(id);
        if (course) {
            let newCompleted = course.completedLessons + change;
            newCompleted = Math.max(0, Math.min(newCompleted, course.totalLessons));
            
            const updatedData = {
                completedLessons: newCompleted,
                lastUpdated: new Date().toISOString()
            };

            if (newCompleted === 0) {
                updatedData.status = 'planned';
            } else if (newCompleted === course.totalLessons) {
                updatedData.status = 'completed';
            } else {
                updatedData.status = 'in_progress';
            }
            
            return await this.updateCourse(id, updatedData);
        }
        return null;
    }

    async setProgress(id, completedLessons) {
        const course = this.getCourse(id);
        if (course) {
            completedLessons = Math.max(0, Math.min(completedLessons, course.totalLessons));
            const change = completedLessons - course.completedLessons;
            return await this.updateProgress(id, change);
        }
        return null;
    }

    async duplicateCourse(id) {
        const course = this.getCourse(id);
        if (course) {
            const duplicateData = {
                ...course,
                title: `${course.title} (копия)`,
                favorite: false,
                lastUpdated: new Date().toISOString()
            };
            delete duplicateData.id;
            
            return await this.addCourse(duplicateData);
        }
        return null;
    }

    getStatistics() {
        try {
            const total = this.courses.length;
            console.log('Model.getStatistics: total courses =', total);
            
            if (total === 0) {
                return {
                    total: 0,
                    averageProgress: 0
                };
            }

            let totalProgress = 0;
            let validCourses = 0;

            this.courses.forEach(course => {
                if (course.totalLessons > 0) {
                    const courseProgress = (course.completedLessons / course.totalLessons) * 100;
                    totalProgress += courseProgress;
                    validCourses++;
                    console.log(`Course "${course.title}": ${courseProgress}%`);
                }
            });

            console.log('Valid courses:', validCourses, 'Total progress sum:', totalProgress);

            if (validCourses === 0) {
                return {
                    total: total,
                    averageProgress: 0
                };
            }

            const averageProgress = Math.round(totalProgress / validCourses);
            console.log('Average progress calculated:', averageProgress);

            return {
                total: total,
                averageProgress: averageProgress
            };
        } catch (error) {
            console.error('Error calculating statistics:', error);
            return {
                total: 0,
                averageProgress: 0
            };
        }
    }

    getAllTags() {
        const allTags = new Set();
        this.courses.forEach(course => {
            course.tags.forEach(tag => allTags.add(tag.toLowerCase()));
        });
        return Array.from(allTags);
    }
}