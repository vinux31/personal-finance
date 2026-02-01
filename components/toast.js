// Toast notification component

export class Toast {
    constructor() {
        this.container = document.getElementById('toastContainer');
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast';

        const icon = this.getIcon(type);
        const color = this.getColor(type);

        toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: var(--space-sm);">
        <span style="font-size: var(--font-size-xl);">${icon}</span>
        <div style="flex: 1;">
          <div style="font-weight: 600; color: ${color};">${this.getTitle(type)}</div>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">${message}</div>
        </div>
      </div>
    `;

        this.container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideOut var(--transition-base)';
            setTimeout(() => {
                toast.remove();
            }, 200);
        }, duration);
    }

    success(message, duration) {
        this.show(message, 'success', duration);
    }

    error(message, duration) {
        this.show(message, 'error', duration);
    }

    warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    info(message, duration) {
        this.show(message, 'info', duration);
    }

    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    getColor(type) {
        const colors = {
            success: 'var(--color-success)',
            error: 'var(--color-danger)',
            warning: 'var(--color-warning)',
            info: 'var(--color-info)'
        };
        return colors[type] || colors.info;
    }

    getTitle(type) {
        const titles = {
            success: 'Berhasil',
            error: 'Error',
            warning: 'Peringatan',
            info: 'Info'
        };
        return titles[type] || titles.info;
    }
}

// Add slideOut animation to CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

export const toast = new Toast();
