class FilterControls {
    constructor(presenter) {
        this.presenter = presenter;
        this.searchInput = document.getElementById('q');
        this.sortSelect = document.getElementById('sort');
        this.onlyFavsCheckbox = document.getElementById('onlyFavs');
        this.statusChecksContainer = document.getElementById('statusChecks');
        
        this.initialize();
    }

    initialize() {
        try {
            this.bindEvents();
            this.createStatusFilters();
            this.populateSortOptions();
            this.createToolbarActions();
            this.setupTagSearch();
        } catch (error) {
            console.error('Error initializing FilterControls:', error);
        }
    }

    createStatusFilters() {
        if (!this.statusChecksContainer) return;

        try {
            const statuses = (typeof mockData !== 'undefined' && mockData.courseStatuses) 
                ? mockData.courseStatuses 
                : [
                    { value: 'planned', label: 'Запланированные', color: 'b-planned' },
                    { value: 'in_progress', label: 'В процессе', color: 'b-in_progress' },
                    { value: 'completed', label: 'Завершенные', color: 'b-completed' }
                ];

            this.statusChecksContainer.innerHTML = '';

            statuses.forEach(status => {
                const label = document.createElement('label');
                label.className = 'pill';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = status.value;
                checkbox.checked = true;
                
                const badge = document.createElement('span');
                badge.className = `badge ${status.color}`;
                badge.textContent = status.label;
                
                label.appendChild(checkbox);
                label.appendChild(badge);
                this.statusChecksContainer.appendChild(label);
                
                checkbox.addEventListener('change', () => this.applyFilters());
            });
        } catch (error) {
            console.error('Error creating status filters:', error);
        }
    }

    populateSortOptions() {
        if (!this.sortSelect) return;

        try {
            const sortOptions = (typeof mockData !== 'undefined' && mockData.sortOptions) 
                ? mockData.sortOptions 
                : [
                    { value: 'updated_desc', label: 'Недавно изменённые' },
                    { value: 'alpha_asc', label: 'По алфавиту A→Я' },
                    { value: 'progress_desc', label: 'По прогрессу ↓' },
                    { value: 'progress_asc', label: 'По прогрессу ↑' },
                    { value: 'favorites_first', label: 'Сначала избранные' }
                ];

            this.sortSelect.innerHTML = '';
            sortOptions.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.label;
                this.sortSelect.appendChild(optionElement);
            });
        } catch (error) {
            console.error('Error populating sort options:', error);
        }
    }

    createToolbarActions() {
        const toolbar = document.querySelector('.toolbar .row');
        if (!toolbar) return;

        try {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'row';
            actionsContainer.style.gap = '8px';
            actionsContainer.style.marginLeft = 'auto';

            const exportBtn = document.createElement('button');
            exportBtn.className = 'btn';
            exportBtn.textContent = '📤 Экспорт';
            exportBtn.title = 'Экспорт данных в JSON';
            exportBtn.addEventListener('click', () => {
                if (this.presenter && this.presenter.model) {
                    DataManager.exportToJSON(this.presenter.model);
                }
            });

            const importBtn = document.createElement('button');
            importBtn.className = 'btn';
            importBtn.textContent = '📥 Импорт';
            importBtn.title = 'Импорт данных из JSON';
            
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            fileInput.addEventListener('change', (e) => {
                if (e.target.files[0] && this.presenter && this.presenter.model) {
                    DataManager.importFromJSON(this.presenter.model, e.target.files[0]);
                }
            });
            
            importBtn.addEventListener('click', () => {
                fileInput.click();
            });

            const statsBtn = document.createElement('button');
            statsBtn.className = 'btn';
            statsBtn.textContent = '📊 Статистика';
            statsBtn.title = 'Показать статистику';
            statsBtn.addEventListener('click', () => {
                this.showStatistics();
            });

            actionsContainer.appendChild(exportBtn);
            actionsContainer.appendChild(importBtn);
            actionsContainer.appendChild(statsBtn);
            actionsContainer.appendChild(fileInput);
            
            toolbar.appendChild(actionsContainer);
        } catch (error) {
            console.error('Error creating toolbar actions:', error);
        }
    }

    showStatistics() {
        try {
            if (!this.presenter || !this.presenter.model) return;
            
            const stats = DataManager.getAppStats(this.presenter.model);
            const message = `
Всего курсов: ${stats.total}
Завершено: ${stats.completed}
В процессе: ${stats.inProgress}
Запланировано: ${stats.planned}
Избранных: ${stats.favorites}
Уроков всего: ${stats.totalLessons}
Пройдено уроков: ${stats.completedLessons}
Общий прогресс: ${stats.completionRate}%
            `.trim();

            alert(message);
        } catch (error) {
            console.error('Error showing statistics:', error);
        }
    }

    setupTagSearch() {
        if (!this.searchInput) return;

        try {
            this.searchInput.addEventListener('input', (e) => {
                const value = e.target.value;
                if (value.startsWith('#') && value.length > 1) {
                    this.showTagSuggestions(value);
                } else {
                    this.hideTagSuggestions();
                }
                this.applyFilters();
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.tag-suggestions') && e.target !== this.searchInput) {
                    this.hideTagSuggestions();
                }
            });
        } catch (error) {
            console.error('Error setting up tag search:', error);
        }
    }

    showTagSuggestions(query) {
        this.hideTagSuggestions();

        if (!this.searchInput || !this.presenter || !this.presenter.model) return;

        try {
            const searchTerm = query.slice(1).toLowerCase();
            const allTags = this.presenter.model.getAllTags();
            const matches = allTags.filter(tag => 
                tag.includes(searchTerm)
            ).slice(0, 8);

            if (matches.length === 0) return;

            const suggestions = document.createElement('div');
            suggestions.className = 'tag-suggestions';
            
            matches.forEach(tag => {
                const suggestion = document.createElement('div');
                suggestion.className = 'tag-suggestion';
                suggestion.innerHTML = `<span class="tag-suggestion-tag">#${tag}</span>`;
                suggestion.addEventListener('click', () => {
                    if (this.searchInput) {
                        this.searchInput.value = `#${tag}`;
                        this.hideTagSuggestions();
                        this.applyFilters();
                    }
                });
                suggestions.appendChild(suggestion);
            });

            this.ensureTagSuggestionsStyles();
            if (this.searchInput.parentNode) {
                this.searchInput.parentNode.appendChild(suggestions);
            }
        } catch (error) {
            console.error('Error showing tag suggestions:', error);
        }
    }

    hideTagSuggestions() {
        try {
            const existing = document.querySelector('.tag-suggestions');
            if (existing) existing.remove();
        } catch (error) {
            console.error('Error hiding tag suggestions:', error);
        }
    }

    ensureTagSuggestionsStyles() {
        if (!document.querySelector('#tag-suggestions-styles')) {
            try {
                const styles = document.createElement('style');
                styles.id = 'tag-suggestions-styles';
                styles.textContent = `
                    .tag-suggestions {
                        position: absolute;
                        background: white;
                        border: 1px solid var(--br);
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                        z-index: 100;
                        max-height: 200px;
                        overflow-y: auto;
                        margin-top: 4px;
                        width: 100%;
                        top: 100%;
                    }
                    .tag-suggestion {
                        padding: 8px 12px;
                        cursor: pointer;
                        border-bottom: 1px solid #f3f4f6;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .tag-suggestion:hover {
                        background: #f9fafb;
                    }
                    .tag-suggestion:last-child {
                        border-bottom: none;
                    }
                    .tag-suggestion-tag {
                        font-size: 14px;
                        color: var(--txt);
                    }
                `;
                document.head.appendChild(styles);
            } catch (error) {
                console.error('Error ensuring tag suggestions styles:', error);
            }
        }
    }

    bindEvents() {
        try {
            if (this.searchInput) {
                this.searchInput.addEventListener('input', () => this.applyFilters());
            }
            if (this.sortSelect) {
                this.sortSelect.addEventListener('change', () => this.applyFilters());
            }
            if (this.onlyFavsCheckbox) {
                this.onlyFavsCheckbox.addEventListener('change', () => this.applyFilters());
            }
        } catch (error) {
            console.error('Error binding events:', error);
        }
    }

    applyFilters() {
        try {
            if (!this.presenter) return;

            const filters = {
                search: this.searchInput ? this.searchInput.value.toLowerCase() : '',
                sort: this.sortSelect ? this.sortSelect.value : 'updated_desc',
                onlyFavorites: this.onlyFavsCheckbox ? this.onlyFavsCheckbox.checked : false,
                statuses: this.getSelectedStatuses()
            };
            
            this.presenter.applyFilters(filters);
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    }

    getSelectedStatuses() {
        try {
            if (!this.statusChecksContainer) return [];
            
            const checkboxes = this.statusChecksContainer.querySelectorAll('input[type="checkbox"]');
            return Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
        } catch (error) {
            console.error('Error getting selected statuses:', error);
            return [];
        }
    }
}