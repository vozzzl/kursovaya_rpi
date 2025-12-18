

const initialCourses = [
    {
        "title": "Современный JavaScript",
        "description": "ES6+, практики и паттерны. Изучение современных возможностей JavaScript, включая стрелочные функции, деструктуризацию, промисы, async/await и многое другое.",
        "tags": ["javascript", "frontend", "es6", "programming"],
        "totalLessons": 24,
        "completedLessons": 8,
        "status": "in_progress",
        "favorite": true,
        "lastUpdated": "2024-11-28T10:30:00.000Z"
    },
    {
        "title": "React с нуля",
        "description": "Хуки, состояние, маршрутизация. Полный курс по React от основ до продвинутых тем, включая управление состоянием, работу с API и оптимизацию.",
        "tags": ["react", "frontend", "hooks", "javascript"],
        "totalLessons": 30,
        "completedLessons": 30,
        "status": "completed",
        "favorite": false,
        "lastUpdated": "2024-11-25T14:20:00.000Z"
    },
    {
        "title": "Основы SQL",
        "description": "Запросы, JOIN'ы, индексы. Основы работы с реляционными базами данных, написание эффективных запросов и проектирование схемы БД.",
        "tags": ["sql", "database", "backend", "postgresql"],
        "totalLessons": 18,
        "completedLessons": 0,
        "status": "planned",
        "favorite": false,
        "lastUpdated": "2024-11-20T09:15:00.000Z"
    },
    {
        "title": "Python для анализа данных",
        "description": "Pandas, NumPy, визуализация. Использование Python для обработки и анализа данных, создание графиков и построение моделей машинного обучения.",
        "tags": ["python", "data-science", "pandas", "numpy", "matplotlib"],
        "totalLessons": 28,
        "completedLessons": 15,
        "status": "in_progress",
        "favorite": true,
        "lastUpdated": "2024-11-27T16:45:00.000Z"
    },
    {
        "title": "Веб-дизайн и UX/UI",
        "description": "Figma, прототипирование, адаптивный дизайн. Создание пользовательских интерфейсов, работа с макетами и принципы юзабилити.",
        "tags": ["design", "ux-ui", "figma", "frontend"],
        "totalLessons": 22,
        "completedLessons": 5,
        "status": "in_progress",
        "favorite": false,
        "lastUpdated": "2024-11-26T11:30:00.000Z"
    }
];

async function initializeApiData() {
    console.log('Начало инициализации данных в API...');
    
    for (const course of initialCourses) {
        try {
            const response = await fetch('https://6943a43b69b12460f31568b3.mockapi.io/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(course)
            });
            
            if (response.ok) {
                console.log(`Курс "${course.title}" добавлен в API`);
            } else {
                console.error(`Ошибка добавления курса "${course.title}"`);
            }
        } catch (error) {
            console.error(`Ошибка при добавлении курса "${course.title}":`, error);
        }
    }
    
    console.log('Инициализация данных завершена');
    alert('Данные успешно загружены в API!');
}