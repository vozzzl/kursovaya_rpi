class CourseCardHeader {
    constructor(course, presenter) {
        this.course = course;
        this.presenter = presenter;
    }

    createHeader() {
        const header = document.createElement('div');
        header.className = 'course-head';
        
        const leftPart = document.createElement('div');
        
        const title = document.createElement('h3');
        title.className = 'title course-title';
        title.textContent = this.course.title;
        
        const statusRow = document.createElement('div');
        statusRow.className = 'row';
        
        const statusBadge = document.createElement('span');
        statusBadge.className = `badge status ${this.getStatusClass(this.course.status)}`;
        statusBadge.textContent = this.getStatusText(this.course.status);
        
        const favLabel = document.createElement('span');
        favLabel.className = 'favLabel muted fav-color';
        favLabel.textContent = '★ Избранное';
        favLabel.hidden = !this.course.favorite;
        
        statusRow.appendChild(statusBadge);
        statusRow.appendChild(favLabel);
        
        leftPart.appendChild(title);
        leftPart.appendChild(statusRow);
        
        const rightPart = document.createElement('div');
        rightPart.className = 'course-actions';
        
        const favBtn = document.createElement('button');
        favBtn.className = `favBtn ${this.course.favorite ? 'fav' : ''}`;
        favBtn.textContent = this.course.favorite ? '★' : '☆';
        favBtn.title = 'В избранное';
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.presenter && this.presenter.toggleFavorite) {
                this.presenter.toggleFavorite(this.course.id);
            }
        });
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn editBtn course-action-btn';
        editBtn.textContent = '✏️ Редакт.';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.presenter && this.presenter.editCourse) {
                this.presenter.editCourse(this.course.id);
            }
        });
        
        const delBtn = document.createElement('button');
        delBtn.className = 'btn delBtn course-action-btn delete-color';
        delBtn.textContent = '🗑️ Удалить';
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.presenter && this.presenter.deleteCourse) {
                this.presenter.deleteCourse(this.course.id);
            }
        });
        
        rightPart.appendChild(favBtn);
        rightPart.appendChild(editBtn);
        rightPart.appendChild(delBtn);
        
        header.appendChild(leftPart);
        header.appendChild(rightPart);
        
        return header;
    }

    getStatusText(status) {
        const statusMap = {
            'planned': 'Запланирован',
            'in_progress': 'В процессе',
            'completed': 'Завершен'
        };
        return statusMap[status] || status;
    }

    getStatusClass(status) {
        const classMap = {
            'planned': 'b-planned',
            'in_progress': 'b-in_progress',
            'completed': 'b-completed'
        };
        return classMap[status] || '';
    }

    updateHeader(header) {
        const favBtn = header.querySelector('.favBtn');
        const favLabel = header.querySelector('.favLabel');
        const statusBadge = header.querySelector('.status');
        
        if (favBtn) {
            favBtn.textContent = this.course.favorite ? '★' : '☆';
            favBtn.classList.toggle('fav', this.course.favorite);
        }
        
        if (favLabel) {
            favLabel.hidden = !this.course.favorite;
        }
        
        if (statusBadge) {
            statusBadge.textContent = this.getStatusText(this.course.status);
            statusBadge.className = `badge status ${this.getStatusClass(this.course.status)}`;
        }
    }
}