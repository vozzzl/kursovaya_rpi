class Notification {
    static show(message, type = 'info', duration = 3000) {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">×</button>
            </div>
        `;

        this.ensureStyles();

        container.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hide(notification);
        });

        if (duration > 0) {
            setTimeout(() => this.hide(notification), duration);
        }

        return notification;
    }

    static hide(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    static getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    static ensureStyles() {
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    border-left: 4px solid #e5e7eb;
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                    max-width: 350px;
                    opacity: 0;
                    transition: all 0.3s ease;
                }
                .notification.show {
                    transform: translateX(0);
                    opacity: 1;
                }
                .notification-success { border-left-color: #10b981; }
                .notification-error { border-left-color: #ef4444; }
                .notification-warning { border-left-color: #f59e0b; }
                .notification-info { border-left-color: #3b82f6; }
                .notification-content {
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .notification-icon { 
                    font-size: 16px; 
                    flex-shrink: 0;
                }
                .notification-message { 
                    flex: 1; 
                    font-size: 14px;
                    line-height: 1.4;
                }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6b7280;
                    border-radius: 4px;
                }
                .notification-close:hover {
                    background: #f3f4f6;
                    color: #374151;
                }
            `;
            document.head.appendChild(styles);
        }
    }
}
