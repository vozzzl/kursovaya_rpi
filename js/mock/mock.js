
const mockCourses = [
    {
        id: 'course-1',
        title: 'Современный JavaScript',
        description: 'ES6+, практики и паттерны. Изучение современных возможностей JavaScript, включая стрелочные функции, деструктуризацию, промисы, async/await и многое другое.',
        tags: ['javascript', 'frontend', 'es6', 'programming'],
        totalLessons: 24,
        completedLessons: 8,
        status: 'in_progress',
        favorite: true,
        lastUpdated: '2024-11-28T10:30:00.000Z'
    },
    {
        id: 'course-2',
        title: 'React с нуля',
        description: 'Хуки, состояние, маршрутизация. Полный курс по React от основ до продвинутых тем, включая управление состоянием, работу с API и оптимизацию.',
        tags: ['react', 'frontend', 'hooks', 'javascript'],
        totalLessons: 30,
        completedLessons: 30,
        status: 'completed',
        favorite: false,
        lastUpdated: '2024-11-25T14:20:00.000Z'
    },
    {
        id: 'course-3',
        title: 'Основы SQL',
        description: 'Запросы, JOIN\'ы, индексы. Основы работы с реляционными базами данных, написание эффективных запросов и проектирование схемы БД.',
        tags: ['sql', 'database', 'backend', 'postgresql'],
        totalLessons: 18,
        completedLessons: 0,
        status: 'planned',
        favorite: false,
        lastUpdated: '2024-11-20T09:15:00.000Z'
    },
    {
        id: 'course-4',
        title: 'Python для анализа данных',
        description: 'Pandas, NumPy, визуализация. Использование Python для обработки и анализа данных, создание графиков и построение моделей машинного обучения.',
        tags: ['python', 'data-science', 'pandas', 'numpy', 'matplotlib'],
        totalLessons: 28,
        completedLessons: 15,
        status: 'in_progress',
        favorite: true,
        lastUpdated: '2024-11-27T16:45:00.000Z'
    },
    {
        id: 'course-5',
        title: 'Веб-дизайн и UX/UI',
        description: 'Figma, прототипирование, адаптивный дизайн. Создание пользовательских интерфейсов, работа с макетами и принципы юзабилити.',
        tags: ['design', 'ux-ui', 'figma', 'frontend'],
        totalLessons: 22,
        completedLessons: 5,
        status: 'in_progress',
        favorite: false,
        lastUpdated: '2024-11-26T11:30:00.000Z'
    },
    {
        id: 'course-6',
        title: 'Node.js и Express',
        description: 'Создание REST API, middleware, аутентификация. Разработка серверных приложений на Node.js с использованием фреймворка Express.',
        tags: ['nodejs', 'backend', 'express', 'javascript', 'api'],
        totalLessons: 20,
        completedLessons: 20,
        status: 'completed',
        favorite: false,
        lastUpdated: '2024-11-15T13:10:00.000Z'
    },
    {
        id: 'course-7',
        title: 'Docker и контейнеризация',
        description: 'Dockerfile, Docker Compose, оркестрация. Упаковка приложений в контейнеры, управление образами и развертывание в production.',
        tags: ['docker', 'devops', 'containers', 'deployment'],
        totalLessons: 16,
        completedLessons: 3,
        status: 'in_progress',
        favorite: true,
        lastUpdated: '2024-11-28T08:20:00.000Z'
    },
    {
        id: 'course-8',
        title: 'TypeScript для React',
        description: 'Типизация, generics, продвинутые паттерны. Использование TypeScript в React-приложениях для повышения надежности кода.',
        tags: ['typescript', 'react', 'frontend', 'programming'],
        totalLessons: 25,
        completedLessons: 0,
        status: 'planned',
        favorite: false,
        lastUpdated: '2024-11-10T12:00:00.000Z'
    }
];

const courseStatuses = [
    { value: 'planned', label: 'Запланированные', color: 'b-planned' },
    { value: 'in_progress', label: 'В процессе', color: 'b-in_progress' },
    { value: 'completed', label: 'Завершенные', color: 'b-completed' }
];

const sortOptions = [
    { value: 'updated_desc', label: 'Недавно изменённые' },
    { value: 'alpha_asc', label: 'По алфавиту A→Я' },
    { value: 'progress_desc', label: 'По прогрессу ↓' },
    { value: 'progress_asc', label: 'По прогрессу ↑' }
];
const tagColors = {
    'javascript': '#f7df1e',
    'react': '#61dafb',
    'python': '#3776ab',
    'sql': '#336791',
    'nodejs': '#339933',
    'docker': '#2496ed',
    'typescript': '#3178c6',
    'frontend': '#ff6b6b',
    'backend': '#4ecdc4',
    'database': '#45b7d1',
    'data-science': '#96ceb4',
    'design': '#feca57',
    'ux-ui': '#ff9ff3',
    'devops': '#54a0ff',
    'api': '#5f27cd',
    'programming': '#00d2d3'
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        mockCourses,
        courseStatuses,
        sortOptions,
        tagColors
    };
} else {
    window.mockData = {
        mockCourses,
        courseStatuses,
        sortOptions,
        tagColors
    };
}