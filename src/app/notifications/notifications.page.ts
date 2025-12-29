import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, notifications, notificationsOutline, checkmarkDone, trash, refresh, alertCircle, statsChart, time, checkmarkCircle, closeCircle, arrowForward, calendarOutline, trophyOutline, cashOutline, warningOutline, addCircleOutline, createOutline, documentTextOutline } from 'ionicons/icons';
import { NotificationService, Notification, NotificationCategory } from '../services/notification.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-notifications',
  templateUrl: 'notifications.page.html',
  styleUrls: ['notifications.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonButton,
    IonRefresher,
    IonRefresherContent
  ]
})
export class NotificationsPage implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  selectedCategory: NotificationCategory | 'All' = 'All';
  unreadCount = 0;
  isLoading = true;
  isDarkMode = false;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private themeService: ThemeService
  ) {
    addIcons({ arrowBack, notifications, notificationsOutline, checkmarkDone, trash, refresh, alertCircle, statsChart, time, checkmarkCircle, closeCircle, arrowForward, calendarOutline, trophyOutline, cashOutline, warningOutline, addCircleOutline, createOutline, documentTextOutline });
  }

  async ngOnInit() {
    this.isDarkMode = this.themeService.isDarkMode();
    this.themeService.themeChanged.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });
    await this.loadNotifications();
  }

  ngOnDestroy() {}

  async loadNotifications() {
    this.isLoading = true;
    try {
      await this.notificationService.generateNotifications();
      this.notifications = await this.notificationService.getAllNotifications();
      this.unreadCount = await this.notificationService.getUnreadCount();
      this.filterNotifications();
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async handleRefresh(event: any) {
    await this.loadNotifications();
    event.target.complete();
  }

  filterNotifications() {
    // Show all notifications (no filtering needed since tabs are removed)
    this.filteredNotifications = this.notifications;
  }

  async markAsRead(notification: Notification) {
    if (!notification.isRead) {
      await this.notificationService.markAsRead(notification.id);
      notification.isRead = true;
      this.unreadCount = await this.notificationService.getUnreadCount();
    }
  }

  async markAllAsRead() {
    await this.notificationService.markAllAsRead();
    this.notifications.forEach(n => n.isRead = true);
    this.filteredNotifications.forEach(n => n.isRead = true);
    this.unreadCount = 0;
  }

  async deleteNotification(notification: Notification, event: Event) {
    event.stopPropagation();
    await this.notificationService.deleteNotification(notification.id);
    this.notifications = this.notifications.filter(n => n.id !== notification.id);
    this.filterNotifications();
    this.unreadCount = await this.notificationService.getUnreadCount();
  }

  async deleteAllNotifications() {
    await this.notificationService.deleteAllNotifications();
    this.notifications = [];
    this.filteredNotifications = [];
    this.unreadCount = 0;
  }

  async deleteReadNotifications() {
    await this.notificationService.deleteReadNotifications();
    await this.loadNotifications();
  }

  handleNotificationClick(notification: Notification) {
    this.markAsRead(notification);
    if (notification.actionRoute) {
      this.router.navigate([notification.actionRoute]);
    }
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  getIconBackground(color: string): string {
    const colors: { [key: string]: string } = {
      'danger': '#fee2e2',
      'warning': '#fef3c7',
      'success': '#d1fae5',
      'primary': '#dbeafe',
      'info': '#e0e7ff'
    };
    return colors[color] || '#f3f4f6';
  }

  getIconColor(color: string): string {
    const colors: { [key: string]: string } = {
      'danger': '#dc2626',
      'warning': '#d97706',
      'success': '#059669',
      'primary': '#2563eb',
      'info': '#6366f1'
    };
    return colors[color] || '#6b7280';
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}

