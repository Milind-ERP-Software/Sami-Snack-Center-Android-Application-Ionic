import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton, IonInput, IonToggle, IonRefresher, IonRefresherContent, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, calendar, cash, trendingUp, trendingDown, trash, create, documentText, close, search, menu, refresh, settings, logOut, list, receipt, wallet, bag, moon, sunny, grid, calculator } from 'ionicons/icons';
import { StorageService, DailyRecord } from '../services/storage.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    IonButton,
    IonInput,
    IonToggle,
    IonRefresher,
    IonRefresherContent,
    IonSegment,
    IonSegmentButton
  ]
})
export class HomePage implements OnInit, OnDestroy {
  records: DailyRecord[] = [];
  filteredRecords: DailyRecord[] = [];
  searchQuery: string = '';
  fromDate: string = '';
  toDate: string = '';
  totalProfit = 0;
  totalLoss = 0;
  displayedProfit = 0;
  displayedLoss = 0;
  isLoading = true;
  expandedRecords: Set<string> = new Set(); // Track which records have expanded items

  isDrawerOpen = false;
  isDarkMode = false;
  viewMode: 'card' | 'list' = 'card'; // Track current view mode
  private touchStartX = 0;
  private touchEndX = 0;
  private profitAnimationId?: number;
  private lossAnimationId?: number;

  constructor(
    private storageService: StorageService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private themeService: ThemeService
  ) {
    addIcons({ add, calendar, cash, trendingUp, trendingDown, trash, create, documentText, close, search, menu, refresh, settings, logOut, list, receipt, wallet, bag, moon, sunny, grid, calculator });
  }

  ngOnInit() {
    this.setDefaultDateRange();
    this.loadRecords();
    this.setupSwipeGesture();
    this.isDarkMode = this.themeService.isDarkMode();
    this.themeService.themeChanged.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });
  }

  setDefaultDateRange() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // First day of current month
    const firstDay = new Date(year, month, 1);
    this.fromDate = firstDay.toISOString().split('T')[0];

    // Last day of current month
    const lastDay = new Date(year, month + 1, 0);
    this.toDate = lastDay.toISOString().split('T')[0];
  }

  ionViewWillEnter() {
    this.loadRecords();
  }

  loadRecords() {
    this.isLoading = true;
    // Reset displayed values to 0 for smooth animation on load
    this.displayedProfit = 0;
    this.displayedLoss = 0;
    setTimeout(() => {
      this.records = this.storageService.getAllRecords();
      this.filterRecords();
      this.calculateTotals();
      this.isLoading = false;
    }, 800); // Increased delay to show skeleton animation
  }

  handleRefresh(event: any) {
    // Full page reload like browser refresh (href)
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  filterRecords() {
    let filtered = [...this.records];

    // Date filter
    if (this.fromDate || this.toDate) {
      filtered = filtered.filter(record => {
        // Convert record date to YYYY-MM-DD format for comparison
        const recordDateStr = record.date.split('T')[0]; // Get date part only (YYYY-MM-DD)

        if (this.fromDate) {
          // Compare date strings directly (YYYY-MM-DD format)
          if (recordDateStr < this.fromDate) return false;
        }

        if (this.toDate) {
          // Compare date strings directly (YYYY-MM-DD format)
          if (recordDateStr > this.toDate) return false;
        }

        return true;
      });
    }

    // Text search filter
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(record => {
        // Search in date
        const dateStr = this.formatDate(record.date).toLowerCase();
        if (dateStr.includes(query)) return true;

        // Search in notes
        if (record.notes && record.notes.toLowerCase().includes(query)) return true;

        // Search in production items
        if (record.production && record.production.some(item =>
          item.listOfItem.toLowerCase().includes(query)
        )) return true;

        // Search in expense items
        if (record.dailyExpenseList && record.dailyExpenseList.some(item =>
          item.listOfItem.toLowerCase().includes(query)
        )) return true;

        // Search in income items
        if (record.incomeItems && record.incomeItems.some(item =>
          item.listOfItem.toLowerCase().includes(query)
        )) return true;

        // Search in waste materials
        if (record.todayWasteMaterialList &&
            record.todayWasteMaterialList.toLowerCase().includes(query)) return true;

        // Search in amounts (chains, expected income, etc.)
        if (record.chains.toString().includes(query)) return true;
        if (record.expectedIncome.toString().includes(query)) return true;
        if (record.backMoneyInBag.toString().includes(query)) return true;

        return false;
      });
    }

    this.filteredRecords = filtered;
    // Recalculate totals based on filtered records
    this.calculateTotals();
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value || '';
    this.filterRecords();
  }

  onDateFilterChange() {
    this.filterRecords();
  }

  clearSearch() {
    this.searchQuery = '';
    this.filterRecords();
  }

  clearDateFilter() {
    this.fromDate = '';
    this.toDate = '';
    this.filterRecords();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.fromDate || this.toDate);
  }

  clearAllFilters() {
    this.searchQuery = '';
    this.setDefaultDateRange(); // Reset to default date range (current month)
    this.filterRecords();
  }

  trackByRecordId(index: number, record: DailyRecord): string {
    return record.id || index.toString();
  }

  calculateTotals() {
    // Calculate totals based on filtered records only
    const newProfit = this.filteredRecords.reduce((sum, record) => sum + (record.dailyProfit?.profit || 0), 0);
    const newLoss = this.filteredRecords.reduce((sum, record) => sum + (record.dailyProfit?.loss || 0), 0);

    // Store the new values
    this.totalProfit = newProfit;
    this.totalLoss = newLoss;

    // Animate from current displayed values to new values
    this.animateCounter('profit', this.displayedProfit, newProfit);
    this.animateCounter('loss', this.displayedLoss, newLoss);
  }

  animateCounter(type: 'profit' | 'loss', start: number, end: number) {
    // If start and end are the same, no need to animate
    if (Math.abs(start - end) < 0.01) {
      if (type === 'profit') {
        this.displayedProfit = end;
      } else {
        this.displayedLoss = end;
      }
      return;
    }

    // Cancel any existing animation for this type
    if (type === 'profit' && this.profitAnimationId) {
      cancelAnimationFrame(this.profitAnimationId);
    }
    if (type === 'loss' && this.lossAnimationId) {
      cancelAnimationFrame(this.lossAnimationId);
    }

    const duration = 600; // milliseconds - shorter animation duration
    const startTime = performance.now();
    
    // Easing function for smooth animation (ease-out cubic for natural feel)
    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1); // 0 to 1
      
      // Apply easing for smooth deceleration
      const easedProgress = easeOutCubic(progress);
      
      // Calculate current value with smooth interpolation
      const currentValue = start + (end - start) * easedProgress;
      
      // Update displayed value (round to 2 decimal places for display)
      if (type === 'profit') {
        this.displayedProfit = Math.round(currentValue * 100) / 100;
      } else {
        this.displayedLoss = Math.round(currentValue * 100) / 100;
      }

      // Continue animation if not complete
      if (progress < 1) {
        if (type === 'profit') {
          this.profitAnimationId = requestAnimationFrame(animate);
        } else {
          this.lossAnimationId = requestAnimationFrame(animate);
        }
      } else {
        // Ensure final value is exact
        if (type === 'profit') {
          this.displayedProfit = Math.round(end * 100) / 100;
        } else {
          this.displayedLoss = Math.round(end * 100) / 100;
        }
      }
    };

    // Start animation immediately
    if (type === 'profit') {
      this.profitAnimationId = requestAnimationFrame(animate);
    } else {
      this.lossAnimationId = requestAnimationFrame(animate);
    }
  }

  addNewRecord() {
    this.router.navigate(['/daily-form']);
  }

  editRecord(id: string | undefined) {
    if (id) {
      this.router.navigate(['/daily-form', id]);
    }
  }

  async deleteRecord(id: string | undefined) {
    if (!id) return;

    const alert = await this.alertController.create({
      header: 'Delete Record',
      message: 'Are you sure you want to delete this record? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Delete',
          role: 'destructive',
          cssClass: 'danger',
          handler: () => {
            this.storageService.deleteRecord(id);
            this.loadRecords();
            this.showToast('Record deleted successfully', 'danger');
          }
        }
      ]
    });

    await alert.present();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getDayOfWeek(dateString: string): number {
    const date = new Date(dateString);
    return date.getDay(); // 0 = Sunday, 6 = Saturday
  }

  isSaturday(dateString: string): boolean {
    return this.getDayOfWeek(dateString) === 6;
  }

  isSunday(dateString: string): boolean {
    return this.getDayOfWeek(dateString) === 0;
  }

  getTotalIncome(record: DailyRecord): number {
    const incomeItems = record.incomeItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const dailyIncome = (record.dailyIncomeAmount?.gpay || 0) +
                       (record.dailyIncomeAmount?.paytm || 0) +
                       (record.dailyIncomeAmount?.cash || 0) +
                       (record.dailyIncomeAmount?.onDrawer || 0) +
                       (record.dailyIncomeAmount?.onOutsideOrder || 0);
    return incomeItems + dailyIncome;
  }

  getTotalExpense(record: DailyRecord): number {
    // Calculate total production cost
    const totalProductionCost = record.production?.reduce((sum, item) =>
      sum + (item.amount || 0), 0) || 0;

    // Calculate total expenses
    const totalExpenses = record.dailyExpenseList?.reduce((sum, item) =>
      sum + (item.amount || 0), 0) || 0;

    return totalProductionCost + totalExpenses;
  }

  // Show toast notification
  async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color,
      cssClass: `custom-toast toast-${color}`,
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  // Drawer methods
  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  openDrawer() {
    this.isDrawerOpen = true;
  }

  closeDrawer() {
    this.isDrawerOpen = false;
  }

  // Swipe gesture handling
  onSwipe(event: any) {
    // This will be handled via touch events
  }

  setupSwipeGesture() {
    const content = document.querySelector('ion-content');
    if (content) {
      let touchStartX = 0;
      let touchEndX = 0;

      content.addEventListener('touchstart', (e: TouchEvent) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      content.addEventListener('touchend', (e: TouchEvent) => {
        touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe(touchStartX, touchEndX);
      }, { passive: true });
    }
  }

  handleSwipe(startX: number, endX: number) {
    const swipeThreshold = 50;
    const diff = startX - endX;

    // Swipe left (from right to left) - open drawer
    if (diff < -swipeThreshold && !this.isDrawerOpen) {
      this.openDrawer();
    }
    // Swipe right (from left to right) - close drawer
    else if (diff > swipeThreshold && this.isDrawerOpen) {
      this.closeDrawer();
    }
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      message: 'Are you sure you want to logout? All your data will remain saved.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.closeDrawer();
          }
        },
        {
          text: 'Logout',
          role: 'destructive',
          cssClass: 'danger',
          handler: () => {
            // Clear any session data if needed
            // localStorage data will remain as per user requirement
            this.showToast('Logged out successfully', 'success');
            this.closeDrawer();
            // Optionally navigate to login page or reload
            // this.router.navigate(['/login']);
          }
        }
      ]
    });

    await alert.present();
  }

  toggleItemsExpansion(recordId: string) {
    if (this.expandedRecords.has(recordId)) {
      this.expandedRecords.delete(recordId);
    } else {
      this.expandedRecords.add(recordId);
    }
  }

  async clearLocalStorage() {
    const alert = await this.alertController.create({
      header: 'Clear LocalStorage',
      message: '⚠️ WARNING: This will delete ALL your records permanently! This action cannot be undone. Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.closeDrawer();
          }
        },
        {
          text: 'Clear All Data',
          role: 'destructive',
          cssClass: 'danger',
          handler: () => {
            try {
              // Cancel any running animations
              if (this.profitAnimationId) {
                cancelAnimationFrame(this.profitAnimationId);
                this.profitAnimationId = undefined;
              }
              if (this.lossAnimationId) {
                cancelAnimationFrame(this.lossAnimationId);
                this.lossAnimationId = undefined;
              }
              
              localStorage.clear();
              this.records = [];
              this.filteredRecords = [];
              this.totalProfit = 0;
              this.totalLoss = 0;
              this.displayedProfit = 0;
              this.displayedLoss = 0;
              this.searchQuery = '';
              this.fromDate = '';
              this.toDate = '';
              this.setDefaultDateRange();
              this.showToast('LocalStorage cleared successfully', 'success');
              this.closeDrawer();
              // Reload records to show empty state
              setTimeout(() => {
                this.loadRecords();
              }, 500);
            } catch (error) {
              this.showToast('Error clearing LocalStorage', 'danger');
              console.error('Error clearing LocalStorage:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  goToProductionItems() {
    this.router.navigate(['/production-items']);
  }

  goToExpenseItems() {
    this.router.navigate(['/expense-items']);
  }

  goToPurchaseItems() {
    this.router.navigate(['/purchase-items']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  goToCalculations() {
    this.router.navigate(['/calculations']);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDarkMode();
  }

  ngOnDestroy() {
    // Cancel any running animations
    if (this.profitAnimationId) {
      cancelAnimationFrame(this.profitAnimationId);
    }
    if (this.lossAnimationId) {
      cancelAnimationFrame(this.lossAnimationId);
    }
  }
}
