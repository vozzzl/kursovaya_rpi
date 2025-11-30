class DataManager {
    static exportToJSON(model) {
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

    static importFromJSON(model, file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data.courses && Array.isArray(data.courses)) {
                    if (confirm(`Будет импортировано ${data.courses.length} курсов. Текущие данные будут заменены. Продолжить?`)) {
                        localStorage.removeItem('courses');
                        localStorage.setItem('courses', JSON.stringify(data.courses));
                        Notification.show(`Успешно импортировано ${data.courses.length} курсов`, 'success');
                        
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
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

    static clearAllData(model) {
        if (confirm('ВЫ УВЕРЕНЫ? Это действие удалит ВСЕ курсы и прогресс. Отменить будет невозможно.')) {
            if (confirm('Действительно удалить все данные?')) {
                localStorage.removeItem('courses');
                Notification.show('Все данные удалены', 'warning');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
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
}