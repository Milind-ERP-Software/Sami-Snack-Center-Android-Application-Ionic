import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton, IonInput, IonToggle, IonRefresher, IonRefresherContent, IonSegment, IonSegmentButton, IonFab, IonFabButton, IonFabList, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, calendar, cash, trendingUp, trendingDown, trash, create, documentText, close, search, menu, refresh, settings, logOut, list, receipt, wallet, bag, moon, sunny, grid, calculator, notifications, share, refreshCircleOutline, chevronDown, chevronUp, checkmark } from 'ionicons/icons';
import { StorageService, DailyRecord } from '../services/storage.service';
import { ThemeService } from '../services/theme.service';
import { NotificationService } from '../services/notification.service';

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
    IonSegmentButton,
    IonFab,
    IonFabButton,
    IonFabList,
    IonSelect,
    IonSelectOption
  ]
})
export class HomePage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('scrollableRecords', { read: ElementRef }) scrollableRecords?: ElementRef;
  
  records: DailyRecord[] = [];
  filteredRecords: DailyRecord[] = [];
  searchQuery: string = '';
  fromDate: string = '';
  toDate: string = '';
  selectedMonth: number = 0;
  selectedYear: number = 0;
  showDeleted: boolean = false;
  totalProfit = 0;
  totalLoss = 0;
  displayedProfit = 0;
  displayedLoss = 0;
  isLoading = true;
  expandedRecords: Set<string> = new Set(); // Track which records have expanded items

  isDrawerOpen = false;
  isDarkMode = false;
  isDeveloperMode = false;
  isItemsAccordionOpen = false;
  viewMode: 'card' | 'list' = 'card'; // Track current view mode
  companyName: string = 'Sami Snack Center';
  companyLogo: string | null = null;
  notificationCount = 0;
  isSpeedDialOpen = false;
  showSpeedDial = true;
  isMultiSelectMode = false; // Track multi-select mode
  selectedRecords: Set<string> = new Set(); // Track selected record IDs
  private touchStartX = 0;
  private touchEndX = 0;
  private longPressTimer?: any;
  private longPressDuration = 500; // 500ms for long press
  private profitAnimationId?: number;
  private lossAnimationId?: number;
  private scrollTimeout?: any;
  private scrollListener?: () => void;
  private notificationCheckInterval?: any;

  constructor(
    private storageService: StorageService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private themeService: ThemeService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ add, calendar, cash, trendingUp, trendingDown, trash, create, documentText, close, search, menu, refresh, settings, logOut, list, receipt, wallet, bag, moon, sunny, grid, calculator, notifications, share, refreshCircleOutline, chevronDown, chevronUp, checkmark });
  }

  ngOnInit() {
    this.setDefaultDateRange();
    this.loadRecords();
    this.loadDeveloperMode();
    this.setupSwipeGesture();
    this.isDarkMode = this.themeService.isDarkMode();
    this.themeService.themeChanged.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });
    
    // Listen to developer mode changes
    this.storageService.developerModeChanged.subscribe((isEnabled: boolean) => {
      this.isDeveloperMode = isEnabled;
    });
    
    // Listen to company settings changes
    this.storageService.companyNameChanged.subscribe((name: string) => {
      this.companyName = name;
    });
    
    this.storageService.companyLogoChanged.subscribe((logo: string) => {
      this.companyLogo = logo;
    });
    
    // Load company settings
    this.loadCompanySettings();
    
    // Load speed dial setting
    this.loadSpeedDialSetting();
    
    // Check notifications
    this.checkNotifications();
    // Check notifications every 5 minutes
    this.notificationCheckInterval = setInterval(() => {
      this.checkNotifications();
    }, 5 * 60 * 1000);
  }
  
  ngAfterViewInit() {
    // Setup scroll detection after view is initialized
    setTimeout(() => {
      this.setupScrollDetection();
    }, 100);
  }
  
  setupScrollDetection() {
    if (!this.scrollableRecords?.nativeElement) return;
    
    const element = this.scrollableRecords.nativeElement;
    
    this.scrollListener = () => {
      // Add scrolling class when user scrolls
      element.classList.add('scrolling');
      
      // Clear existing timeout
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      
      // Remove scrolling class after scrolling stops
      this.scrollTimeout = setTimeout(() => {
        element.classList.remove('scrolling');
      }, 500);
    };
    
    element.addEventListener('scroll', this.scrollListener, { passive: true });
  }
  
  async loadSpeedDialSetting() {
    const speedDialVisible = await this.storageService.get('show_speed_dial');
    this.showSpeedDial = speedDialVisible !== 'false'; // Default to true if not set
  }

  async loadCompanySettings() {
    const name = await this.storageService.get('company_name');
    if (name) {
      this.companyName = name;
    }
    
    const logo = await this.storageService.get('company_logo');
    if (logo) {
      this.companyLogo = logo;
    }
  }

  setDefaultDateRange() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    this.selectedYear = year;
    this.selectedMonth = month;
    this.updateDateRangeFromMonthYear();
  }

  updateDateRangeFromMonthYear() {
    // Format date as YYYY-MM-DD to avoid timezone issues
    const formatDate = (year: number, month: number, day: number): string => {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      return `${year}-${monthStr}-${dayStr}`;
    };

    // First day of selected month
    this.fromDate = formatDate(this.selectedYear, this.selectedMonth, 1);

    // Last day of selected month (day 0 of next month gives last day of current month)
    const lastDay = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
    this.toDate = formatDate(this.selectedYear, this.selectedMonth, lastDay);
    
    this.filterRecords();
  }

  onMonthYearChange() {
    // Auto-fill dates if both month and year are selected
    if (this.selectedMonth !== null && this.selectedMonth !== undefined && 
        this.selectedYear !== null && this.selectedYear !== undefined && 
        this.selectedYear > 0 && this.selectedMonth >= 0) {
      this.updateDateRangeFromMonthYear();
    }
  }

  getSelectedMonthName(): string {
    if (this.selectedMonth === null || this.selectedMonth === undefined) {
      return 'Month';
    }
    const months = this.getMonths();
    const month = months.find(m => m.value === this.selectedMonth);
    return month ? month.label.toUpperCase() : 'MONTH';
  }

  getMonths(): Array<{value: number, label: string}> {
    return [
      { value: 0, label: 'January' },
      { value: 1, label: 'February' },
      { value: 2, label: 'March' },
      { value: 3, label: 'April' },
      { value: 4, label: 'May' },
      { value: 5, label: 'June' },
      { value: 6, label: 'July' },
      { value: 7, label: 'August' },
      { value: 8, label: 'September' },
      { value: 9, label: 'October' },
      { value: 10, label: 'November' },
      { value: 11, label: 'December' }
    ];
  }

  getYears(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    // Generate years from 2020 to current year + 1
    for (let year = 2020; year <= currentYear + 1; year++) {
      years.push(year);
    }
    return years.reverse(); // Show most recent years first
  }

  ionViewWillEnter() {
    this.loadRecords();
    this.loadSpeedDialSetting();
  }

  async loadRecords() {
    this.isLoading = true;
    this.cdr.detectChanges(); // Force UI update immediately
    
    // Reset displayed values to 0 for smooth animation on load
    this.displayedProfit = 0;
    this.displayedLoss = 0;

    // Safety timeout: Ensure isLoading is always set to false, even if storage hangs
    const safetyTimeout = setTimeout(() => {
      console.warn('loadRecords: Safety timeout triggered - forcing isLoading to false');
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 5000); // 5 second maximum timeout

    // Ensure minimum loading time for better UX
    const startTime = Date.now();

    try {
      this.records = await this.storageService.getAllRecords(this.showDeleted);
      this.filterRecords();
      this.calculateTotals();
      // Refresh notifications when records are loaded
      await this.checkNotifications();
    } catch (error) {
      console.error('Error loading records:', error);
      // On error, still show empty state instead of stuck loading
      this.records = [];
      this.filteredRecords = [];
    } finally {
      clearTimeout(safetyTimeout); // Clear safety timeout if we got here normally
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 800 - elapsedTime);

      setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges(); // Force UI update
      }, remainingTime);
    }
  }

  handleRefresh(event: any) {
    // Full page reload like browser refresh (href)
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  filterRecords() {
    let filtered = [...this.records];

    // Filter based on showDeleted toggle
    if (this.showDeleted) {
      // Show only deleted records
      filtered = filtered.filter(record => record.isDeleted);
    } else {
      // Show only non-deleted records
      filtered = filtered.filter(record => !record.isDeleted);
    }

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

  onShowDeletedChange() {
    this.loadRecords();
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
    // filterRecords is already called in setDefaultDateRange via updateDateRangeFromMonthYear
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

    // Skip countdown if in developer mode
    if (this.isDeveloperMode) {
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
              return true;
            }
          }
        ]
      });

      await alert.present();
      return;
    }

    let countdown = 10;
    let countdownInterval: any;
    let deleteButton: any;

    const alert = await this.alertController.create({
      header: 'Delete Record',
      message: 'Are you sure you want to delete this record? This action cannot be undone. Please wait 10 seconds before confirming.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            if (countdownInterval) {
              clearInterval(countdownInterval);
            }
          }
        },
        {
          text: `Delete (${countdown})`,
          role: 'destructive',
          cssClass: 'danger',
          handler: () => {
            if (countdown > 0) {
              return false; // Prevent deletion if countdown not finished
            }
            if (countdownInterval) {
              clearInterval(countdownInterval);
            }
            this.storageService.deleteRecord(id);
            this.loadRecords();
            this.showToast('Record deleted successfully', 'danger');
            return true;
          }
        }
      ]
    });

    await alert.present();

    // Get the delete button element
    const alertElement = document.querySelector('ion-alert');
    if (alertElement) {
      const buttons = alertElement.querySelectorAll('.alert-button');
      if (buttons.length > 1) {
        deleteButton = buttons[1] as HTMLElement;
        const buttonInner = deleteButton.querySelector('.alert-button-inner') as HTMLElement;
        
        // Initially disable the button
        deleteButton.setAttribute('disabled', 'true');
        deleteButton.style.opacity = '0.5';
        deleteButton.style.pointerEvents = 'none';

        // Start countdown
        countdownInterval = setInterval(() => {
          countdown--;
          
          if (buttonInner) {
            buttonInner.textContent = `Delete (${countdown})`;
          }

          if (countdown <= 0) {
            clearInterval(countdownInterval);
            if (buttonInner) {
              buttonInner.textContent = 'Delete';
            }
            deleteButton.removeAttribute('disabled');
            deleteButton.style.opacity = '1';
            deleteButton.style.pointerEvents = 'auto';
          }
        }, 1000);
      }
    }

    // Clean up interval when alert is dismissed
    alert.onDidDismiss().then(() => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    });
  }

  async restoreRecord(id: string | undefined) {
    if (!id) return;

    const alert = await this.alertController.create({
      header: 'Restore Record',
      message: 'Are you sure you want to restore this record?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Restore',
          handler: async () => {
            await this.storageService.restoreRecord(id);
            this.loadRecords();
            this.showToast('Record restored successfully', 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  async permanentDeleteRecord(id: string | undefined) {
    if (!id) return;

    // Skip countdown if in developer mode
    if (this.isDeveloperMode) {
      const alert = await this.alertController.create({
        header: 'Permanent Delete',
        message: 'Are you sure you want to permanently delete this record? This action cannot be undone.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary'
          },
          {
            text: 'Permanent Delete',
            role: 'destructive',
            cssClass: 'danger',
            handler: () => {
              this.storageService.permanentDeleteRecord(id);
              this.loadRecords();
              this.showToast('Record permanently deleted', 'danger');
              return true;
            }
          }
        ]
      });

      await alert.present();
      return;
    }

    let countdown = 10;
    let countdownInterval: any;
    let deleteButton: any;

    const alert = await this.alertController.create({
      header: 'Permanent Delete',
      message: 'Are you sure you want to permanently delete this record? This action cannot be undone. Please wait 10 seconds before confirming.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            if (countdownInterval) {
              clearInterval(countdownInterval);
            }
          }
        },
        {
          text: `Permanent Delete (${countdown})`,
          role: 'destructive',
          cssClass: 'danger',
          handler: () => {
            if (countdown > 0) {
              return false; // Prevent deletion if countdown not finished
            }
            if (countdownInterval) {
              clearInterval(countdownInterval);
            }
            this.storageService.permanentDeleteRecord(id);
            this.loadRecords();
            this.showToast('Record permanently deleted', 'danger');
            return true;
          }
        }
      ]
    });

    await alert.present();

    // Get the delete button element
    const alertElement = document.querySelector('ion-alert');
    if (alertElement) {
      const buttons = alertElement.querySelectorAll('.alert-button');
      if (buttons.length > 1) {
        deleteButton = buttons[1] as HTMLElement;
        const buttonInner = deleteButton.querySelector('.alert-button-inner') as HTMLElement;
        
        // Initially disable the button
        deleteButton.setAttribute('disabled', 'true');
        deleteButton.style.opacity = '0.5';
        deleteButton.style.pointerEvents = 'none';

        // Start countdown
        countdownInterval = setInterval(() => {
          countdown--;
          
          if (buttonInner) {
            buttonInner.textContent = `Permanent Delete (${countdown})`;
          }

          if (countdown <= 0) {
            clearInterval(countdownInterval);
            if (buttonInner) {
              buttonInner.textContent = 'Permanent Delete';
            }
            deleteButton.removeAttribute('disabled');
            deleteButton.style.opacity = '1';
            deleteButton.style.pointerEvents = 'auto';
          }
        }, 1000);
      }
    }

    // Clean up interval when alert is dismissed
    alert.onDidDismiss().then(() => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    });
  }

  async shareRecord(record: DailyRecord) {
    const expense = this.getTotalExpense(record);
    const income = this.getTotalIncome(record);
    const expected = this.getProductionCost(record);
    const back = record.backMoneyInBag || 0;

    const shareText = `📊 Daily Record - ${this.formatDate(record.date)}

💰 Summary:
• Expense: ${expense} ₹
• Income: ${income} ₹
• Expected: ${expected} ₹
• Back: ${back} ₹
• Chains: ${record.chains} ₹

${record.notes ? `📝 Notes: ${record.notes}` : ''}`;

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Daily Record - ${this.formatDate(record.date)}`,
          text: shareText
        });
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          this.showToast('Failed to share record', 'warning');
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        this.showToast('Record details copied to clipboard', 'success');
      } catch (error) {
        this.showToast('Failed to copy to clipboard', 'warning');
      }
    }
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

  formatDateShort(dateString: string): string {
    if (!dateString) return '';
    // Parse YYYY-MM-DD format directly to avoid timezone issues
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[2], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayStr = String(day).padStart(2, '0');
      const monthStr = months[monthIndex];
      return `${dayStr}-${monthStr}-${year}`;
    }
    // Fallback to Date object if format is different
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getDateRangeText(): string {
    if (this.fromDate && this.toDate) {
      return `(${this.formatDateShort(this.fromDate)} to ${this.formatDateShort(this.toDate)})`;
    } else if (this.fromDate) {
      return `(from ${this.formatDateShort(this.fromDate)})`;
    } else if (this.toDate) {
      return `(to ${this.formatDateShort(this.toDate)})`;
    }
    return '';
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
    // Match getOverallIncomeTotal() from daily-form: gpay + paytm + onDrawer + onOutsideOrder
    // This excludes cash and incomeItems to match the "Income Detailed" section's "Overall Total"
    const gpay = record.dailyIncomeAmount?.gpay || 0;
    const paytm = record.dailyIncomeAmount?.paytm || 0;
    const onDrawer = record.dailyIncomeAmount?.onDrawer || 0;
    const onOutsideOrder = record.dailyIncomeAmount?.onOutsideOrder || 0;
    return gpay + paytm + onDrawer + onOutsideOrder;
  }

  getProductionCost(record: DailyRecord): number {
    // Calculate total production cost
    return record.production?.reduce((sum, item) =>
      sum + (item.amount || 0), 0) || 0;
  }

  getTotalExpense(record: DailyRecord): number {
    // Calculate total expenses (Daily Expenses section)
    const totalExpenses = record.dailyExpenseList?.reduce((sum, item) =>
      sum + (item.amount || 0), 0) || 0;

    // Calculate total purchases (What buy from today Income section)
    const totalPurchases = record.todayPurchases?.reduce((sum, item) =>
      sum + (item.amount || 0), 0) || 0;

    // Return sum of expenses and purchases (excluding production cost)
    return totalExpenses + totalPurchases;
  }

  getPaidExpense(record: DailyRecord): number {
    // Calculate only paid expenses (Daily Expenses section)
    const paidExpenses = record.dailyExpenseList?.reduce((sum, item) => {
      const isPaid = item.paid !== undefined ? item.paid : true; // Default to paid for backward compatibility
      return sum + (isPaid ? (item.amount || 0) : 0);
    }, 0) || 0;

    // Calculate only paid purchases (What buy from today Income section)
    const paidPurchases = record.todayPurchases?.reduce((sum, item) => {
      const isPaid = item.paid !== undefined ? item.paid : true; // Default to paid for backward compatibility
      return sum + (isPaid ? (item.amount || 0) : 0);
    }, 0) || 0;

    // Return sum of paid expenses and purchases
    return paidExpenses + paidPurchases;
  }

  getMonthlyBalance(): number {
    // Monthly balance calculation:
    // Starts from 0 on 1st of selected month
    // Credit: All income (gpay + paytm + onDrawer + onOutsideOrder)
    // Debit: Only paid expenses and purchases
    
    let balance = 0;
    
    // Get records for selected month
    const monthStartDate = `${this.selectedYear}-${String(this.selectedMonth + 1).padStart(2, '0')}-01`;
    
    // Filter records for the selected month
    const monthRecords = this.filteredRecords.filter(record => {
      const recordDate = record.date;
      const recordYear = parseInt(recordDate.split('-')[0], 10);
      const recordMonth = parseInt(recordDate.split('-')[1], 10) - 1; // 0-indexed month
      return recordYear === this.selectedYear && recordMonth === this.selectedMonth;
    });
    
    // Calculate balance: income (credit) - paid expenses (debit)
    monthRecords.forEach(record => {
      // Add income (credit)
      const income = this.getTotalIncome(record);
      balance += income;
      
      // Subtract paid expenses (debit)
      const paidExpense = this.getPaidExpense(record);
      balance -= paidExpense;
    });
    
    return balance;
  }

  getExpensesByLabel(record: DailyRecord): { label: string; total: number }[] {
    const grouped: { [key: string]: number } = {};
    let unlabeledTotal = 0;

    // Group expenses by label
    record.dailyExpenseList?.forEach(item => {
      const label = item.label || '';
      const amount = item.amount || 0;
      
      if (label) {
        if (!grouped[label]) {
          grouped[label] = 0;
        }
        grouped[label] += amount;
      } else {
        unlabeledTotal += amount;
      }
    });

    // Convert to array: unlabeled first, then labeled (alphabetically sorted)
    const result: { label: string; total: number }[] = [];
    
    if (unlabeledTotal > 0) {
      result.push({ label: '', total: unlabeledTotal });
    }

    Object.keys(grouped).sort().forEach(label => {
      if (grouped[label] > 0) {
        result.push({ label: label, total: grouped[label] });
      }
    });

    return result;
  }

  // Get all unique expense categories from all filtered records
  getAllExpenseCategories(): string[] {
    const categories = new Set<string>();
    
    this.filteredRecords.forEach(record => {
      record.dailyExpenseList?.forEach(item => {
        const label = item.label || '';
        if (label) {
          categories.add(label);
        } else {
          categories.add('Other');
        }
      });
    });
    
    // Convert to array: 'Other' first, then sorted alphabetically
    const result: string[] = [];
    const sortedCategories = Array.from(categories).sort();
    
    if (sortedCategories.includes('Other')) {
      result.push('Other');
      sortedCategories.forEach(cat => {
        if (cat !== 'Other') {
          result.push(cat);
        }
      });
    } else {
      result.push(...sortedCategories);
    }
    
    return result;
  }

  // Get expense amount for a specific category in a record
  getExpenseAmountForCategory(record: DailyRecord, category: string): number {
    const expenses = this.getExpensesByLabel(record);
    const categoryLabel = category === 'Other' ? '' : category;
    const found = expenses.find(exp => {
      if (category === 'Other') {
        return !exp.label || exp.label === '';
      }
      return exp.label === category;
    });
    return found ? found.total : 0;
  }

  // Get total expense for a specific category across all filtered records
  getTotalExpenseForCategory(category: string): number {
    return this.filteredRecords.reduce((sum, record) => {
      return sum + this.getExpenseAmountForCategory(record, category);
    }, 0);
  }

  // Totals for list view footer
  getTotalChains(): number {
    return this.filteredRecords.reduce((sum, record) => sum + (record.chains || 0), 0);
  }

  getTotalExpenses(): number {
    return this.filteredRecords.reduce((sum, record) => sum + this.getTotalExpense(record), 0);
  }

  getTotalIncomes(): number {
    return this.filteredRecords.reduce((sum, record) => sum + this.getTotalIncome(record), 0);
  }

  getTotalExpected(): number {
    return this.filteredRecords.reduce((sum, record) => sum + this.getProductionCost(record), 0);
  }

  getTotalBack(): number {
    return this.filteredRecords.reduce((sum, record) => sum + (record.backMoneyInBag || 0), 0);
  }

  getTotalNet(): number {
    return this.filteredRecords.reduce((sum, record) => {
      const profit = (record.dailyProfit?.profit || 0) - (record.dailyProfit?.loss || 0);
      return sum + profit;
    }, 0);
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
  async toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
    // Refresh developer mode when drawer opens
    if (this.isDrawerOpen) {
      await this.loadDeveloperMode();
    }
  }

  async openDrawer() {
    this.isDrawerOpen = true;
    // Refresh developer mode when drawer opens
    await this.loadDeveloperMode();
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

  // Multi-select functionality (Developer Mode only)
  onRecordCardTouchStart(event: TouchEvent | MouseEvent, recordId: string | undefined) {
    if (!this.isDeveloperMode || !recordId) return;

    const touchTarget = event.target as HTMLElement;
    // Don't trigger if clicking on buttons or links
    if (touchTarget.closest('ion-button') || touchTarget.closest('a')) return;

    // If already in multi-select mode, don't start another long press
    if (this.isMultiSelectMode) return;

    this.longPressTimer = setTimeout(() => {
      this.enterMultiSelectMode(recordId);
    }, this.longPressDuration);
  }

  onRecordCardTouchEnd(event: TouchEvent | MouseEvent, recordId: string | undefined) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
    }
  }

  onRecordCardTouchMove() {
    // Cancel long press if user moves finger
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
    }
  }

  onRecordCardClick(event: Event, recordId: string | undefined) {
    // Only handle selection if in multi-select mode
    if (!this.isMultiSelectMode || !recordId || !this.isDeveloperMode) return;

    const target = event.target as HTMLElement;
    // Don't trigger if clicking on buttons
    if (target.closest('ion-button')) return;

    this.toggleRecordSelection(recordId);
  }

  enterMultiSelectMode(firstRecordId: string) {
    this.isMultiSelectMode = true;
    this.isSpeedDialOpen = false; // Close speed dial when entering multi-select mode
    this.selectedRecords.clear();
    this.selectedRecords.add(firstRecordId);
    // Toast message removed as per user request
    this.cdr.detectChanges();
  }

  exitMultiSelectMode() {
    this.isMultiSelectMode = false;
    this.selectedRecords.clear();
    this.cdr.detectChanges();
  }

  toggleRecordSelection(recordId: string | undefined) {
    if (!this.isMultiSelectMode || !recordId) return;

    if (this.selectedRecords.has(recordId)) {
      this.selectedRecords.delete(recordId);
    } else {
      this.selectedRecords.add(recordId);
    }
    this.cdr.detectChanges();
  }

  isRecordSelected(recordId: string | undefined): boolean {
    if (!recordId) return false;
    return this.selectedRecords.has(recordId);
  }

  async deleteSelectedRecords() {
    if (this.selectedRecords.size === 0) return;

    const count = this.selectedRecords.size;
    const confirmAlert = await this.alertController.create({
      header: 'Delete Multiple Records',
      message: `Kya aap ${count} record(s) delete karna chahte hain? (Do you want to delete ${count} record(s)?)`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Delete',
          cssClass: 'danger',
          handler: async () => {
            await this.performBulkDelete();
          }
        }
      ]
    });

    await confirmAlert.present();
  }

  private async performBulkDelete() {
    const recordIds = Array.from(this.selectedRecords).filter(id => id); // Filter out undefined/null
    
    if (recordIds.length === 0) {
      this.exitMultiSelectMode();
      return;
    }

    // Store selected IDs before clearing (for UI update)
    const selectedIds = new Set(this.selectedRecords);

    try {
      // Exit multi-select mode immediately for better UX
      this.exitMultiSelectMode();
      
      // Update UI optimistically (before actual delete) - instant feedback
      this.filteredRecords = this.filteredRecords.filter(record => !selectedIds.has(record.id || ''));
      this.records = this.records.map(record => {
        if (selectedIds.has(record.id || '')) {
          return { ...record, isDeleted: true };
        }
        return record;
      });
      
      // Recalculate totals immediately
      this.calculateTotals();
      this.cdr.detectChanges(); // Force UI update
      
      // Perform actual delete in background (optimized - single save operation)
      const deletedCount = await this.storageService.bulkDeleteRecords(recordIds);
      
      if (deletedCount > 0) {
        this.showToast(`${deletedCount} record(s) deleted successfully`, 'success');
      } else {
        // If delete failed, reload to restore state
        await this.loadRecords();
        this.showToast('No records were deleted', 'warning');
      }
      
    } catch (error) {
      console.error('Error during bulk delete:', error);
      // Reload on error to restore correct state
      await this.loadRecords();
      this.showToast('Error deleting records. Please try again.', 'danger');
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
          handler: async () => {
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

              await this.storageService.clearAll();
              // Clear notifications as well
              await this.notificationService.clearAllNotifications();
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
              this.notificationCount = 0;
              this.showToast('All data cleared successfully', 'success');
              this.closeDrawer();
              // Reload records to show empty state
              setTimeout(() => {
                this.loadRecords();
              }, 500);
            } catch (error) {
              this.showToast('Error clearing data', 'danger');
              console.error('Error clearing data:', error);
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

  goToReports() {
    this.router.navigate(['/reports']);
  }

  async checkNotifications() {
    try {
      await this.notificationService.generateNotifications();
      this.notificationCount = await this.notificationService.getUnreadCount();
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }

  goToNotifications() {
    this.router.navigate(['/notifications']);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDarkMode();
  }

  toggleSpeedDial() {
    this.isSpeedDialOpen = !this.isSpeedDialOpen;
    // Force change detection to ensure Ionic properly detects the state change on first click
    this.cdr.detectChanges();
  }

  handleContentClick(event: Event) {
    // Close speed dial if clicking outside the FAB
    const target = event.target as HTMLElement;
    const fab = target.closest('ion-fab');
    const fabButton = target.closest('ion-fab-button');
    // Don't close if clicking on FAB or FAB button (let the toggle handle it)
    if (!fab && !fabButton && this.isSpeedDialOpen) {
      this.isSpeedDialOpen = false;
    }
  }

  speedDialAction(action: string) {
    this.isSpeedDialOpen = false;
    switch(action) {
      case 'add':
        this.addNewRecord();
        break;
      case 'calculator':
        this.goToCalculations();
        break;
      case 'document-text':
        this.goToReports();
        break;
      case 'settings':
        this.goToSettings();
        break;
    }
  }

  async loadDeveloperMode() {
    const developerMode = await this.storageService.get('developer_mode');
    this.isDeveloperMode = developerMode === 'true';
  }

  ngOnDestroy() {
    // Cancel any running animations
    if (this.profitAnimationId) {
      cancelAnimationFrame(this.profitAnimationId);
    }
    if (this.lossAnimationId) {
      cancelAnimationFrame(this.lossAnimationId);
    }
    
    // Clear notification check interval
    if (this.notificationCheckInterval) {
      clearInterval(this.notificationCheckInterval);
    }
    
    // Clean up scroll listener
    if (this.scrollableRecords?.nativeElement && this.scrollListener) {
      this.scrollableRecords.nativeElement.removeEventListener('scroll', this.scrollListener);
    }
    
    // Clear scroll timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }
}

