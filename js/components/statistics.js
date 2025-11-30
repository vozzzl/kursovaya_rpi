class Statistics {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    update(stats) {
        if (!this.container) return;
        
        const totalElement = this.container.querySelector('#statTotal');
        const avgElement = this.container.querySelector('#statAvg');
        const avgBarElement = this.container.querySelector('#statAvgBar');
        
        if (totalElement) totalElement.textContent = stats.total;
        if (avgElement) avgElement.textContent = stats.averageProgress;
        if (avgBarElement) avgBarElement.style.width = `${stats.averageProgress}%`;
    }
}