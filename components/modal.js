// Modal component

export class Modal {
    constructor() {
        this.container = document.getElementById('modalContainer');
        this.currentModal = null;
    }

    show(options) {
        const { title, content, buttons = [], onClose } = options;

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                this.close();
                if (onClose) onClose();
            }
        };

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';

        // Header
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `<h3 class="modal-title">${title}</h3>`;

        // Body
        const body = document.createElement('div');
        body.className = 'modal-body';
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else {
            body.appendChild(content);
        }

        // Footer
        const footer = document.createElement('div');
        footer.className = 'modal-footer';

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `btn ${btn.className || 'btn-outline'}`;
            button.textContent = btn.text;
            button.onclick = () => {
                if (btn.onClick) btn.onClick();
                if (!btn.keepOpen) this.close();
            };
            footer.appendChild(button);
        });

        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(body);
        if (buttons.length > 0) {
            modal.appendChild(footer);
        }

        overlay.appendChild(modal);
        this.container.appendChild(overlay);
        this.currentModal = overlay;

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    close() {
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
            document.body.style.overflow = '';
        }
    }

    confirm(title, message, onConfirm) {
        this.show({
            title,
            content: `<p>${message}</p>`,
            buttons: [
                {
                    text: 'Batal',
                    className: 'btn-outline'
                },
                {
                    text: 'Ya',
                    className: 'btn-primary',
                    onClick: onConfirm
                }
            ]
        });
    }

    alert(title, message) {
        this.show({
            title,
            content: `<p>${message}</p>`,
            buttons: [
                {
                    text: 'OK',
                    className: 'btn-primary'
                }
            ]
        });
    }
}

export const modal = new Modal();
