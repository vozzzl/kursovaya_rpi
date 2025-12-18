document.addEventListener('DOMContentLoaded', function() {
    setTimeout(async () => {
        try {
            console.log('🚀 Инициализация учебного трекера с API...');
            
            const requiredElements = ['list', 'editor', 'statTotal', 'statAvg', 'statAvgBar'];
            const missingElements = requiredElements.filter(id => !document.getElementById(id));
            
            if (missingElements.length > 0) {
                console.error('Missing elements:', missingElements);
                throw new Error(`Отсутствуют необходимые DOM элементы: ${missingElements.join(', ')}`);
            }
            
            console.log('✅ Все необходимые DOM элементы найдены');
            
            // Показываем индикатор загрузки
            const listContainer = document.getElementById('list');
            if (listContainer) {
                listContainer.innerHTML = `
                    <div class="card empty">
                        <div class="empty-title">Загрузка данных...</div>
                        <div class="muted empty-text">Подключение к API...</div>
                    </div>
                `;
            }
            
            const model = new CourseModel();
            const view = new CourseView();
            const presenter = new CoursePresenter(model, view);
            
            view.initialize(presenter);
            
            // Даем время на загрузку данных
            setTimeout(() => {
                console.log('✅ Приложение успешно инициализировано');
                console.log('📊 Загружено курсов:', model.getAllCourses().length);
                
                const stats = model.getStatistics();
                console.log('📈 Начальная статистика:', stats);
                
                presenter.updateStatistics();
                
                // Проверяем синхронизацию
                setTimeout(async () => {
                    const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
                    if (localCourses.length > 0) {
                        if (confirm('Обнаружены локальные данные. Синхронизировать с API?')) {
                            await DataManager.syncWithApi(model);
                        }
                    }
                }, 2000);
            }, 1000);
            
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
                        Notification.show(`Загружено ${coursesCount} курсов из API`, 'info', 2000);
                    }
                } catch (error) {
                    console.warn('Не удалось показать приветственное сообщение:', error);
                }
            }, 1500);
            
        } catch (error) {
            console.error('❌ Ошибка инициализации приложения:', error);
            
            try {
                const errorMessage = `Не удалось загрузить приложение.\nОшибка: ${error.message}\nПроверьте соединение с API и консоль для подробностей.`;
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
                            <div class="muted empty-text">${error.message}<br>Проверьте подключение к интернету.</div>
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
            if (confirm('Очистить все данные с API и локально?')) {
                DataManager.clearAllData(window.courseApp.model);
            }
        }
        
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            if (window.courseApp && window.courseApp.model) {
                DataManager.syncWithApi(window.courseApp.model);
            }
        }
    } catch (error) {
        console.error('Ошибка в обработчике хоткеев:', error);
    }
});