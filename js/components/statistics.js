class Statistics {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    update(stats) {
        console.log('Statistics.update called with:', stats);
        
        if (!this.container) {
            console.error('Statistics container not found');
            return;
        }
        
        const totalElement = this.container.querySelector('#statTotal') || 
                           document.getElementById('statTotal');
        const avgElement = document.getElementById('statAvg');
        const avgBarElement = document.getElementById('statAvgBar');
        
        console.log('Found elements:', {
            totalElement, avgElement, avgBarElement
        });
        
        if (totalElement) {
            console.log('Setting total to:', stats.total);
            totalElement.textContent = stats.total;
        }
        
        if (avgElement) {
            console.log('Setting average to:', stats.averageProgress + '%');
            avgElement.textContent = stats.averageProgress;
        }
        
        if (avgBarElement) {
            console.log('Setting average bar to:', stats.averageProgress + '%');
            avgBarElement.style.width = `${stats.averageProgress}%`;
        }
    }
}