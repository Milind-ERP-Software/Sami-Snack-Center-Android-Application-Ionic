import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { StorageService, DailyRecord } from './storage.service';

export enum NotificationType {
  ALERT = 'alert',
  INSIGHT = 'insight',
  ACTIVITY = 'activity',
  REMINDER = 'reminder'
}

export enum NotificationCategory {
  ALERTS = 'Alerts',
  INSIGHTS = 'Insights',
  ACTIVITIES = 'Activities'
}

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  icon: string;
  color: string;
  timestamp: string;
  isRead: boolean;
  actionRoute?: string;
  actionLabel?: string;
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly STORAGE_KEY = 'notifications';
  private _storage: Storage | null = null;
  private notifications: Notification[] = [];

  constructor(
    private storage: Storage,
    private storageService: StorageService
  ) {
    this.init();
  }

  async init() {
    if (this._storage) return;
    this._storage = await this.storage.create();
    await this.loadNotifications();
  }

  private async ensureInitialized() {
    if (!this._storage) {
      await this.init();
    }
  }

  private async loadNotifications() {
    await this.ensureInitialized();
    const stored = await this._storage?.get(this.STORAGE_KEY);
    if (stored) {
      this.notifications = JSON.parse(stored);
    } else {
      this.notifications = [];
    }
  }

  private async saveNotifications() {
    await this.ensureInitialized();
    await this._storage?.set(this.STORAGE_KEY, JSON.stringify(this.notifications));
  }

  async generateNotifications(): Promise<void> {
    await this.ensureInitialized();
    const records = await this.storageService.getAllRecords();
    
    // If no records exist, clear all notifications
    if (records.length === 0) {
      this.notifications = [];
      await this.saveNotifications();
      return;
    }
    
    // Clear old notifications (keep only last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    this.notifications = this.notifications.filter(n => 
      new Date(n.timestamp) > sevenDaysAgo
    );

    // Generate new notifications - Only Daily Entry Reminder
    // Remove all other notifications except daily reminder
    this.notifications = this.notifications.filter(n => 
      n.id.startsWith('daily-reminder-') || n.id === 'daily-reminder'
    );
    
    // Only generate daily reminder
    await this.checkDailyReminder(records);

    await this.saveNotifications();
  }

  private async checkMissingRecords(records: DailyRecord[]): Promise<void> {
    if (records.length === 0) return;

    const today = new Date();
    const recordDates = new Set(records.map(r => r.date));
    const missingDays: string[] = [];

    // Check last 7 days
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (!recordDates.has(dateStr)) {
        missingDays.push(dateStr);
      }
    }

    if (missingDays.length > 0) {
      // Format missing dates for display
      const formattedDates = missingDays
        .map(dateStr => {
          const date = new Date(dateStr);
          return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        })
        .join(', ');
      
      const notification: Notification = {
        id: 'missing-records', // Fixed ID so it updates instead of creating duplicate
        type: NotificationType.ALERT,
        category: NotificationCategory.ALERTS,
        title: 'Missing Records Detected',
        message: `${missingDays.length} day(s) missing: ${formattedDates}. Please add records.`,
        icon: 'calendar-outline',
        color: 'danger',
        timestamp: new Date().toISOString(),
        isRead: false,
        metadata: { missingDays }
      };
      this.addOrUpdateNotification(notification);
    } else {
      // Remove missing records notification if no days are missing
      this.notifications = this.notifications.filter(n => n.id !== 'missing-records');
    }
  }

  private async checkDailyReminder(records: DailyRecord[]): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = records.find(r => r.date === today);

    // If today's record exists, remove all daily reminders
    if (todayRecord) {
      this.notifications = this.notifications.filter(n => 
        !n.id.startsWith('daily-reminder-')
      );
      return;
    }

    // Define reminder time slots: [hour, minute]
    const reminderTimes = [
      { hour: 8, minute: 0, id: 'daily-reminder-8am', label: '8:00 AM' },
      { hour: 12, minute: 0, id: 'daily-reminder-12pm', label: '12:00 PM' },
      { hour: 16, minute: 0, id: 'daily-reminder-4pm', label: '4:00 PM' },
      { hour: 19, minute: 0, id: 'daily-reminder-7pm', label: '7:00 PM' },
      { hour: 21, minute: 0, id: 'daily-reminder-9pm', label: '9:00 PM' }
    ];

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Check each reminder time slot
    for (const reminder of reminderTimes) {
      const reminderTimeInMinutes = reminder.hour * 60 + reminder.minute;
      
      // If current time has passed this reminder time, show the reminder
      if (currentTimeInMinutes >= reminderTimeInMinutes) {
        // Check if this reminder already exists for today
        const existingReminder = this.notifications.find(n => 
          n.id === reminder.id && 
          new Date(n.timestamp).toISOString().split('T')[0] === today
        );

        // If reminder doesn't exist for today, create it
        if (!existingReminder) {
          const notification: Notification = {
            id: reminder.id,
            type: NotificationType.REMINDER,
            category: NotificationCategory.ALERTS,
            title: 'Daily Entry Reminder',
            message: `It's ${reminder.label} and today's record has not been added yet. Don't forget to add it!`,
            icon: 'notifications-outline',
            color: 'warning',
            timestamp: new Date().toISOString(),
            isRead: false,
            actionRoute: '/daily-form',
            actionLabel: 'Add Record'
          };
          this.addOrUpdateNotification(notification);
        }
      }
    }
  }

  private async generateWeeklySummary(records: DailyRecord[]): Promise<void> {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    
    const weekRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= weekStart && recordDate <= today;
    });

    if (weekRecords.length === 0) return;

    const weekProfit = weekRecords.reduce((sum, r) => sum + (r.dailyProfit?.profit || 0), 0);
    const weekLoss = weekRecords.reduce((sum, r) => sum + (r.dailyProfit?.loss || 0), 0);
    const weekIncome = weekRecords.reduce((sum, r) => {
      const income = r.dailyIncomeAmount || {};
      return sum + (income.gpay || 0) + (income.paytm || 0) + (income.onDrawer || 0) + (income.onOutsideOrder || 0);
    }, 0);

    // Get today's date string for unique ID per day
    const todayStr = new Date().toISOString().split('T')[0];
    const notification: Notification = {
      id: `weekly-summary-${todayStr}`, // Same ID for same day
      type: NotificationType.INSIGHT,
      category: NotificationCategory.INSIGHTS,
      title: 'Weekly Summary',
      message: `Last 7 days: Profit ₹${weekProfit.toFixed(2)}, Loss ₹${weekLoss.toFixed(2)}, Income ₹${weekIncome.toFixed(2)}`,
      icon: 'stats-chart-outline',
      color: 'success',
      timestamp: new Date().toISOString(),
      isRead: false,
      metadata: { weekProfit, weekLoss, weekIncome, recordCount: weekRecords.length }
    };
    this.addOrUpdateNotification(notification);
  }

  private async generateMonthlySummary(records: DailyRecord[]): Promise<void> {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= monthStart && recordDate <= today;
    });

    if (monthRecords.length === 0) return;

    const monthProfit = monthRecords.reduce((sum, r) => sum + (r.dailyProfit?.profit || 0), 0);
    const monthLoss = monthRecords.reduce((sum, r) => sum + (r.dailyProfit?.loss || 0), 0);

    // Get today's date string for unique ID per day
    const todayStr = new Date().toISOString().split('T')[0];
    const notification: Notification = {
      id: `monthly-summary-${todayStr}`, // Same ID for same day
      type: NotificationType.INSIGHT,
      category: NotificationCategory.INSIGHTS,
      title: 'Monthly Summary',
      message: `This month: Profit ₹${monthProfit.toFixed(2)}, Loss ₹${monthLoss.toFixed(2)} from ${monthRecords.length} records`,
      icon: 'calendar-outline',
      color: 'primary',
      timestamp: new Date().toISOString(),
      isRead: false,
      metadata: { monthProfit, monthLoss, recordCount: monthRecords.length }
    };
    this.addOrUpdateNotification(notification);
  }

  private async findBestPerformingDays(records: DailyRecord[]): Promise<void> {
    if (records.length < 3) return;

    const sortedByProfit = [...records]
      .sort((a, b) => (b.dailyProfit?.profit || 0) - (a.dailyProfit?.profit || 0))
      .slice(0, 3);

    const bestDays = sortedByProfit.map(r => ({
      date: r.date,
      profit: r.dailyProfit?.profit || 0
    }));

    const todayStr = new Date().toISOString().split('T')[0];
    const notification: Notification = {
      id: `best-days-${todayStr}`, // Same ID for same day
      type: NotificationType.INSIGHT,
      category: NotificationCategory.INSIGHTS,
      title: 'Best Performing Days',
      message: `Top 3 days: ${bestDays.map(d => `${new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} (₹${d.profit.toFixed(2)})`).join(', ')}`,
      icon: 'trophy-outline',
      color: 'success',
      timestamp: new Date().toISOString(),
      isRead: false,
      metadata: { bestDays }
    };
    this.addOrUpdateNotification(notification);
  }

  private async compareIncomeExpense(records: DailyRecord[]): Promise<void> {
    if (records.length < 7) return;

    const last7Days = records.slice(-7);
    const totalIncome = last7Days.reduce((sum, r) => {
      const income = r.dailyIncomeAmount || {};
      return sum + (income.gpay || 0) + (income.paytm || 0) + (income.onDrawer || 0) + (income.onOutsideOrder || 0);
    }, 0);

    const totalExpense = last7Days.reduce((sum, r) => {
      const prodCost = r.production?.reduce((s, p) => s + (p.amount || 0), 0) || 0;
      const dailyExp = r.dailyExpenseList?.reduce((s, e) => s + (e.amount || 0), 0) || 0;
      return sum + prodCost + dailyExp;
    }, 0);

    const ratio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

    let message = '';
    let color = 'success';
    if (ratio > 80) {
      message = `High expense ratio: ${ratio.toFixed(1)}% (₹${totalExpense.toFixed(2)} expenses vs ₹${totalIncome.toFixed(2)} income)`;
      color = 'warning';
    } else {
      message = `Good balance: ${ratio.toFixed(1)}% expense ratio (₹${totalIncome.toFixed(2)} income, ₹${totalExpense.toFixed(2)} expenses)`;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const notification: Notification = {
      id: `income-expense-${todayStr}`, // Same ID for same day
      type: NotificationType.INSIGHT,
      category: NotificationCategory.INSIGHTS,
      title: 'Income vs Expense',
      message: message,
      icon: 'cash-outline',
      color: color,
      timestamp: new Date().toISOString(),
      isRead: false,
      metadata: { totalIncome, totalExpense, ratio }
    };
    this.addOrUpdateNotification(notification);
  }

  private async checkStorageWarnings(): Promise<void> {
    try {
      const storage = await navigator.storage?.estimate();
      if (storage) {
        const used = storage.usage || 0;
        const quota = storage.quota || 0;
        const percentage = (used / quota) * 100;

        if (percentage > 80) {
          const notification: Notification = {
            id: `storage-warning-${Date.now()}`,
            type: NotificationType.ALERT,
            category: NotificationCategory.ALERTS,
            title: 'Storage Warning',
            message: `Storage is ${percentage.toFixed(1)}% full. Consider exporting data.`,
            icon: 'warning-outline',
            color: 'warning',
            timestamp: new Date().toISOString(),
            isRead: false,
            actionRoute: '/settings',
            actionLabel: 'Export Data'
          };
          this.addNotification(notification);
        }
      }
    } catch (error) {
      console.error('Storage check error:', error);
    }
  }

  private async generateActivityNotifications(records: DailyRecord[]): Promise<void> {
    if (records.length === 0) return;

    // Get recent records (last 5 records)
    const recentRecords = records
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || a.date);
        const dateB = new Date(b.updatedAt || b.createdAt || b.date);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);

    // Check for recently created records (within last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentCreated = recentRecords.filter(r => {
      const createdDate = new Date(r.createdAt || r.date);
      return createdDate > oneDayAgo;
    });

    if (recentCreated.length > 0) {
      const notification: Notification = {
        id: `recent-activity-${Date.now()}`,
        type: NotificationType.ACTIVITY,
        category: NotificationCategory.ACTIVITIES,
        title: 'Recent Activity',
        message: `${recentCreated.length} new record(s) added in the last 24 hours.`,
        icon: 'add-circle-outline',
        color: 'primary',
        timestamp: new Date().toISOString(),
        isRead: false,
        actionRoute: '/home',
        actionLabel: 'View Records'
      };
      this.addNotification(notification);
    }

    // Check for recently updated records
    const recentUpdated = recentRecords.filter(r => {
      if (!r.updatedAt) return false;
      const updatedDate = new Date(r.updatedAt);
      return updatedDate > oneDayAgo && updatedDate.getTime() !== new Date(r.createdAt || r.date).getTime();
    });

    if (recentUpdated.length > 0) {
      const notification: Notification = {
        id: `updated-activity-${Date.now()}`,
        type: NotificationType.ACTIVITY,
        category: NotificationCategory.ACTIVITIES,
        title: 'Records Updated',
        message: `${recentUpdated.length} record(s) updated recently.`,
        icon: 'create-outline',
        color: 'primary',
        timestamp: new Date().toISOString(),
        isRead: false,
        actionRoute: '/home',
        actionLabel: 'View Records'
      };
      this.addNotification(notification);
    }

    // Show total records count as activity (update existing or create new)
    // This shows the total count of ALL records in database (not filtered)
    if (records.length > 0) {
      const notification: Notification = {
        id: 'total-records-activity', // Fixed ID so it updates instead of creating duplicate
        type: NotificationType.ACTIVITY,
        category: NotificationCategory.ACTIVITIES,
        title: 'Total Records',
        message: `You have ${records.length} total record(s) in your database.`,
        icon: 'document-text-outline',
        color: 'info',
        timestamp: new Date().toISOString(),
        isRead: false,
        metadata: { totalRecords: records.length }
      };
      this.addOrUpdateNotification(notification);
    }
  }

  private addNotification(notification: Notification): void {
    // Check if similar notification already exists
    const exists = this.notifications.some(n => 
      n.type === notification.type && 
      n.title === notification.title &&
      new Date(n.timestamp).toDateString() === new Date(notification.timestamp).toDateString()
    );

    if (!exists) {
      this.notifications.unshift(notification);
      // Keep only last 100 notifications
      if (this.notifications.length > 100) {
        this.notifications = this.notifications.slice(0, 100);
      }
    }
  }

  private addOrUpdateNotification(notification: Notification): void {
    // Find existing notification with exact same ID
    const existingIndex = this.notifications.findIndex(n => n.id === notification.id);

    if (existingIndex !== -1) {
      // Update existing notification - preserve read status and original timestamp
      const existing = this.notifications[existingIndex];
      this.notifications[existingIndex] = {
        ...notification,
        isRead: existing.isRead, // Preserve read status
        timestamp: existing.timestamp // Keep original timestamp
      };
    } else {
      // Add new notification
      this.notifications.unshift(notification);
      // Keep only last 100 notifications
      if (this.notifications.length > 100) {
        this.notifications = this.notifications.slice(0, 100);
      }
    }
  }

  async getAllNotifications(): Promise<Notification[]> {
    await this.loadNotifications();
    return this.notifications;
  }

  async getUnreadCount(): Promise<number> {
    await this.loadNotifications();
    return this.notifications.filter(n => !n.isRead).length;
  }

  async getNotificationsByCategory(category?: NotificationCategory): Promise<Notification[]> {
    await this.loadNotifications();
    if (category) {
      return this.notifications.filter(n => n.category === category);
    }
    return this.notifications;
  }

  async markAsRead(id: string): Promise<void> {
    await this.loadNotifications();
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
      await this.saveNotifications();
    }
  }

  async markAllAsRead(): Promise<void> {
    await this.loadNotifications();
    this.notifications.forEach(n => n.isRead = true);
    await this.saveNotifications();
  }

  async deleteNotification(id: string): Promise<void> {
    await this.loadNotifications();
    this.notifications = this.notifications.filter(n => n.id !== id);
    await this.saveNotifications();
  }

  async deleteAllNotifications(): Promise<void> {
    this.notifications = [];
    await this.saveNotifications();
  }

  async deleteReadNotifications(): Promise<void> {
    await this.loadNotifications();
    this.notifications = this.notifications.filter(n => !n.isRead);
    await this.saveNotifications();
  }

  async clearAllNotifications(): Promise<void> {
    this.notifications = [];
    await this.saveNotifications();
  }
}

