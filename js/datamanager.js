class DataManager {
    static async exportToJSON(model) {
        try {
            const courses = model.getAllCourses();
            const data = {
                courses: courses,
                exportDate: new Date().toISOString(),
                version: '1.0',
                totalCourses: courses.length
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `courses-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            Notification.show(`Данные успешно экспортированы (${courses.length} курсов)`, 'success');
            return true;
        } catch (error) {
            Notification.show('Ошибка экспорта: ' + error.message, 'error');
            return false;
        }
    }

    static async importFromJSON(model, file) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data.courses && Array.isArray(data.courses)) {
                    if (confirm(`Будет импортировано ${data.courses.length} курсов. Текущие данные будут заменены. Продолжить?`)) {
                        try {
                            const existingCourses = model.getAllCourses();
                            for (const course of existingCourses) {
                                await fetch(`https://6943a43b69b12460f31568b3.mockapi.io/courses/${course.id}`, {
                                    method: 'DELETE'
                                });
                            }

                            for (const course of data.courses) {
                                await fetch('https://6943a43b69b12460f31568b3.mockapi.io/courses', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(course)
                                });
                            }
                            
                            Notification.show(`Успешно импортировано ${data.courses.length} курсов`, 'success');
                            
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        } catch (apiError) {
                            console.error('API import error:', apiError);
                            localStorage.removeItem('courses');
                            localStorage.setItem('courses', JSON.stringify(data.courses));
                            Notification.show(`Импортировано локально (${data.courses.length} курсов)`, 'warning');
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        }
                    }
                } else {
                    throw new Error('Неверный формат файла');
                }
            } catch (error) {
                Notification.show('Ошибка импорта: ' + error.message, 'error');
            }
        };
        reader.onerror = function() {
            Notification.show('Ошибка чтения файла', 'error');
        };
        reader.readAsText(file);
    }

    static async clearAllData(model) {
        if (confirm('ВЫ УВЕРЕНЫ? Это действие удалит ВСЕ курсы и прогресс. Отменить будет невозможно.')) {
            if (confirm('Действительно удалить все данные?')) {
                try {
                    const courses = model.getAllCourses();
                    for (const course of courses) {
                        await fetch(`https://6943a43b69b12460f31568b3.mockapi.io/courses/${course.id}`, {
                            method: 'DELETE'
                        });
                    }
                    
                    localStorage.removeItem('courses');
                    Notification.show('Все данные удалены', 'warning');
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } catch (error) {
                    console.error('Error clearing data:', error);
                    localStorage.removeItem('courses');
                    Notification.show('Данные очищены локально', 'warning');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                }
            }
        }
    }

    static getAppStats(model) {
        const courses = model.getAllCourses();
        const stats = {
            total: courses.length,
            completed: courses.filter(c => c.status === 'completed').length,
            inProgress: courses.filter(c => c.status === 'in_progress').length,
            planned: courses.filter(c => c.status === 'planned').length,
            favorites: courses.filter(c => c.favorite).length,
            totalLessons: courses.reduce((sum, c) => sum + c.totalLessons, 0),
            completedLessons: courses.reduce((sum, c) => sum + c.completedLessons, 0)
        };
        
        stats.completionRate = stats.totalLessons > 0 
            ? Math.round((stats.completedLessons / stats.totalLessons) * 100) 
            : 0;
            
        return stats;
    }
    static async syncWithApi(model) {
        try {
            const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
            const response = await fetch('https://6943a43b69b12460f31568b3.mockapi.io/courses');
            const apiCourses = await response.json();
            
            for (const localCourse of localCourses) {
                const existsInApi = apiCourses.some(apiCourse => apiCourse.id === localCourse.id);
                if (!existsInApi) {
                    await fetch('https://6943a43b69b12460f31568b3.mockapi.io/courses', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(localCourse)
                    });
                }
            }
            
            Notification.show('Данные синхронизированы с API', 'success');
            return true;
        } catch (error) {
            console.error('Sync error:', error);
            Notification.show('Ошибка синхронизации', 'error');
            return false;
        }
    }
}