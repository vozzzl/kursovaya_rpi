class CourseCardTags {
    constructor(course) {
        this.course = course;
    }

    createTags() {
        const container = document.createElement('div');
        container.className = 'tags';
        
        this.course.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            container.appendChild(tagElement);
        });
        
        return container;
    }

    updateTags(container) {
        container.innerHTML = '';
        
        this.course.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            container.appendChild(tagElement);
        });
    }
}