class CourseModel {
    constructor() {
        this.courses = [];
        this.listeners = [];
        this.loadFromStorage();
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('courses');
            if (stored) {
                this.courses = JSON.parse(stored);
            } else {
                this.courses = this.getMockCourses();
                this.saveToStorage();
            }
        } catch (error) {
            console.error('Ошибка загрузки из localStorage:', error);
            this.courses = this.getMockCourses();
        }
    }

    getMockCourses() {
        if (typeof mockData !== 'undefined' && mockData.mockCourses) {
            return JSON.parse(JSON.stringify(mockData.mockCourses));
        }
        
        return [
            {
                id: 'course-1',
                title: 'Современный JavaScript',
                description: 'ES6+, практики и паттерны.',
                tags: ['js', 'frontend'],
                totalLessons: 24,
                completedLessons: 8,
                status: 'in_progress',
                favorite: true,
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'course-2',
                title: 'React с нуля',
                description: 'Хуки, состояние, маршрутизация.',
                tags: ['react'],
                totalLessons: 30,
                completedLessons: 30,
                status: 'completed',
                favorite: false,
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'course-3',
                title: 'Основы SQL',
                description: 'Запросы, JOIN\'ы, индексы.',
                tags: ['sql', 'db'],
                totalLessons: 18,
                completedLessons: 0,
                status: 'planned',
                favorite: false,
                lastUpdated: new Date().toISOString()
            }
        ];
    }

    saveToStorage() {
        try {
            localStorage.setItem('courses', JSON.stringify(this.courses));
            this.notifyListeners();
        } catch (error) {
            console.error('Ошибка сохранения в localStorage:', error);
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

    addCourse(courseData) {
        const newCourse = {
            id: 'course-' + Date.now(),
            ...courseData,
            lastUpdated: new Date().toISOString()
        };
        this.courses.push(newCourse);
        this.saveToStorage();
        return newCourse;
    }

    updateCourse(id, courseData) {
        const index = this.courses.findIndex(course => course.id === id);
        if (index !== -1) {
            this.courses[index] = {
                ...this.courses[index],
                ...courseData,
                lastUpdated: new Date().toISOString()
            };
            this.saveToStorage();
            return this.courses[index];
        }
        return null;
    }

    deleteCourse(id) {
        const index = this.courses.findIndex(course => course.id === id);
        if (index !== -1) {
            this.courses.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    toggleFavorite(id) {
        const course = this.getCourse(id);
        if (course) {
            course.favorite = !course.favorite;
            course.lastUpdated = new Date().toISOString();
            this.saveToStorage();
            return course.favorite;
        }
        return false;
    }

    updateProgress(id, change) {
        const course = this.getCourse(id);
        if (course) {
            let newCompleted = course.completedLessons + change;
            newCompleted = Math.max(0, Math.min(newCompleted, course.totalLessons));
            
            course.completedLessons = newCompleted;

            if (newCompleted === 0) {
                course.status = 'planned';
            } else if (newCompleted === course.totalLessons) {
                course.status = 'completed';
            } else {
                course.status = 'in_progress';
            }
            
            course.lastUpdated = new Date().toISOString();
            this.saveToStorage();
            return course;
        }
        return null;
    }

    setProgress(id, completedLessons) {
        const course = this.getCourse(id);
        if (course) {
            completedLessons = Math.max(0, Math.min(completedLessons, course.totalLessons));
            const change = completedLessons - course.completedLessons;
            return this.updateProgress(id, change);
        }
        return null;
    }

    duplicateCourse(id) {
        const course = this.getCourse(id);
        if (course) {
            const duplicate = { 
                ...course,
                id: 'course-' + Date.now(),
                title: `${course.title} (копия)`,
                favorite: false,
                lastUpdated: new Date().toISOString()
            };
            this.courses.push(duplicate);
            this.saveToStorage();
            return duplicate;
        }
        return null;
    }

    getStatistics() {
        try {
            const total = this.courses.length;
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
                }
            });

            if (validCourses === 0) {
                return {
                    total: total,
                    averageProgress: 0
                };
            }

            const averageProgress = Math.round(totalProgress / validCourses);

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