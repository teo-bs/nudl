
export class NotificationManager {
  private currentNotification: HTMLElement | null = null;

  show(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Remove existing notification
    if (this.currentNotification) {
      this.currentNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `croi-notification ${type}`;
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);
    this.currentNotification = notification;

    // Show notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Hide after 4 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (this.currentNotification === notification) {
          notification.remove();
          this.currentNotification = null;
        }
      }, 300);
    }, 4000);
  }
}
