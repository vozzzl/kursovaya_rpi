document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        try {
            console.log('🚀 Инициализация учебного трекера...');
            
            const requiredElements = ['list', 'editor', 'statTotal', 'statAvg', 'statAvgBar'];
            const missingElements = requiredElements.filter(id => !document.getElementById(id));
            
            if (missingElements.length > 0) {
                console.error('Missing elements:', missingElements);
                throw new Error(`Отсутствуют необходимые DOM элементы: ${missingElements.join(', ')}`);
            }
            
            console.log('✅ Все необходимые DOM элементы найдены');
            
            const model = new CourseModel();
            const view = new CourseView();
            const presenter = new CoursePresenter(model, view);
            
            view.initialize(presenter);
            
            console.log('✅ Приложение успешно инициализировано');
            console.log('📊 Загружено курсов:', model.getAllCourses().length);
            
            const stats = model.getStatistics();
            console.log('📈 Начальная статистика:', stats);
            
            const statTotal = document.getElementById('statTotal');
            const statAvg = document.getElementById('statAvg');
            const statAvgBar = document.getElementById('statAvgBar');
            
            console.log('Элемент statTotal:', statTotal);
            console.log('Элемент statAvg:', statAvg);
            console.log('Элемент statAvgBar:', statAvgBar);
            
            setTimeout(() => {
                console.log('Принудительное обновление статистики...');
                presenter.updateStatistics();
            }, 100);
            
            setTimeout(() => {
                const courses = model.getAllCourses();
                if (courses.length > 0) {
                    console.log('Тестируем обновление прогресса для первого курса:', courses[0].title);
                }
            }, 500);
            
            window.courseApp = {
                model: model,
                view: view,
                presenter: presenter,
                Notification: Notification,
                DataManager: DataManager
            };
            
            setTimeout(() => {
                try {
                    const coursesCount = model.getAllCourses().length;
                    if (coursesCount > 0 && window.Notification && typeof window.Notification.show === 'function') {
                        Notification.show(`Добро пожаловать! Загружено ${coursesCount} курсов`, 'info', 2000);
                    }
                } catch (error) {
                    console.warn('Не удалось показать приветственное сообщение:', error);
                }
            }, 500);
            
        } catch (error) {
            console.error('❌ Ошибка инициализации приложения:', error);
            
            try {
                const errorMessage = `Не удалось загрузить приложение.\nОшибка: ${error.message}\nПроверьте консоль для подробностей.`;
                alert(errorMessage);
            } catch (alertError) {
                console.error('Не удалось показать alert:', alertError);
            }
            
            try {
                const listContainer = document.getElementById('list');
                if (listContainer) {
                    listContainer.innerHTML = `
                        <div class="card empty">
                            <div class="empty-title">Ошибка загрузки</div>
                            <div class="muted empty-text">${error.message}</div>
                            <button class="btn primary empty-btn" onclick="window.location.reload()">🔄 Перезагрузить</button>
                        </div>
                    `;
                }
            } catch (domError) {
                console.error('Не удалось создать интерфейс ошибки:', domError);
            }
        }
    }, 100);
});

document.addEventListener('keydown', function(e) {
    try {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            if (window.courseApp && window.courseApp.model) {
                const stats = DataManager.getAppStats(window.courseApp.model);
                console.log('📊 Отладочная информация:', stats);
                if (window.Notification && typeof window.Notification.show === 'function') {
                    Notification.show('Отладочная информация в консоли', 'info');
                }
            }
        }
        
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            if (confirm('Очистить все данные?')) {
                localStorage.clear();
                window.location.reload();
            }
        }
    } catch (error) {
        console.error('Ошибка в обработчике хоткеев:', error);
    }
});
