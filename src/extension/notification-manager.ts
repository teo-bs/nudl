export type NotificationType = 'success' | 'error' | 'info';

export class NotificationManager {
  private static instance: NotificationManager;
  private currentNotification: HTMLElement | null = null;

  constructor() {
    if (NotificationManager.instance) {
      return NotificationManager.instance;
    }
    NotificationManager.instance = this;
  }

  show(message: string, type: NotificationType = 'info', duration: number = 3000): void {
    // Remove existing notification if any
    this.hide();

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `croi-notification ${type}`;
    notification.textContent = message;

    // Add to document
    document.body.appendChild(notification);
    this.currentNotification = notification;

    // Trigger show animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // Auto-hide after duration
    setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide(): void {
    if (this.currentNotification) {
      this.currentNotification.classList.remove('show');
      
      setTimeout(() => {
        if (this.currentNotification && this.currentNotification.parentNode) {
          this.currentNotification.parentNode.removeChild(this.currentNotification);
        }
        this.currentNotification = null;
      }, 300);
    }
  }
}