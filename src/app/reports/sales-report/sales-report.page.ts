import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonContent, IonIcon, IonButton, IonInput, IonItem, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, documentText, calendar, cash, trendingUp, trendingDown, statsChart, card, wallet, bag } from 'ionicons/icons';
import { StorageService, DailyRecord } from '../../services/storage.service';

interface SalesSummary {
  totalSales: number;
  totalIncomeItems: number;
  totalDailyIncome: number;
  totalGPay: number;
  totalPaytm: number;
  totalCash: number;
  totalDrawer: number;
  totalOutsideOrder: number;
  totalRecords: number;
  averageDailySales: number;
  highestSalesDay: { date: string; amount: number };
  lowestSalesDay: { date: string; amount: number };
}

@Component({
  selector: 'app-sales-report',
  templateUrl: 'sales-report.page.html',
  styleUrls: ['sales-report.page.scss'],
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
    IonItem,
    IonLabel
  ]
})
export class SalesReportPage implements OnInit {
  records: DailyRecord[] = [];
  filteredRecords: DailyRecord[] = [];
  salesSummary: SalesSummary = {
    totalSales: 0,
    totalIncomeItems: 0,
    totalDailyIncome: 0,
    totalGPay: 0,
    totalPaytm: 0,
    totalCash: 0,
    totalDrawer: 0,
    totalOutsideOrder: 0,
    totalRecords: 0,
    averageDailySales: 0,
    highestSalesDay: { date: '', amount: 0 },
    lowestSalesDay: { date: '', amount: 0 }
  };

  fromDate: string = '';
  toDate: string = '';
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private storageService: StorageService
  ) {
    addIcons({ arrowBack, documentText, calendar, cash, trendingUp, trendingDown, statsChart, card, wallet, bag });
  }

  async ngOnInit() {
    this.setDefaultDateRange();
    await this.loadRecords();
    this.calculateSalesSummary();
  }

  setDefaultDateRange() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    this.toDate = today.toISOString().split('T')[0];
    this.fromDate = firstDayOfMonth.toISOString().split('T')[0];
  }

  async loadRecords() {
    try {
      this.isLoading = true;
      this.records = await this.storageService.getAllRecords();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters() {
    let filtered = [...this.records];

    // Date filter
    if (this.fromDate || this.toDate) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date).toISOString().split('T')[0];
        if (this.fromDate && recordDate < this.fromDate) return false;
        if (this.toDate && recordDate > this.toDate) return false;
        return true;
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    this.filteredRecords = filtered;
    this.calculateSalesSummary();
  }

  onDateFilterChange() {
    this.applyFilters();
  }

  calculateSalesSummary() {
    if (this.filteredRecords.length === 0) {
      this.salesSummary = {
        totalSales: 0,
        totalIncomeItems: 0,
        totalDailyIncome: 0,
        totalGPay: 0,
        totalPaytm: 0,
        totalCash: 0,
        totalDrawer: 0,
        totalOutsideOrder: 0,
        totalRecords: 0,
        averageDailySales: 0,
        highestSalesDay: { date: '', amount: 0 },
        lowestSalesDay: { date: '', amount: 0 }
      };
      return;
    }

    let totalSales = 0;
    let totalIncomeItems = 0;
    let totalDailyIncome = 0;
    let totalGPay = 0;
    let totalPaytm = 0;
    let totalCash = 0;
    let totalDrawer = 0;
    let totalOutsideOrder = 0;
    let highestSales = 0;
    let lowestSales = Infinity;
    let highestDate = '';
    let lowestDate = '';

    this.filteredRecords.forEach(record => {
      // Calculate income from income items
      const incomeItems = record.incomeItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
      totalIncomeItems += incomeItems;

      // Calculate daily income
      const dailyIncome = (record.dailyIncomeAmount?.gpay || 0) +
                         (record.dailyIncomeAmount?.paytm || 0) +
                         (record.dailyIncomeAmount?.cash || 0) +
                         (record.dailyIncomeAmount?.onDrawer || 0) +
                         (record.dailyIncomeAmount?.onOutsideOrder || 0);

      totalDailyIncome += dailyIncome;
      totalGPay += record.dailyIncomeAmount?.gpay || 0;
      totalPaytm += record.dailyIncomeAmount?.paytm || 0;
      totalCash += record.dailyIncomeAmount?.cash || 0;
      totalDrawer += record.dailyIncomeAmount?.onDrawer || 0;
      totalOutsideOrder += record.dailyIncomeAmount?.onOutsideOrder || 0;

      const totalSalesForDay = incomeItems + dailyIncome;
      totalSales += totalSalesForDay;

      // Track highest and lowest sales days
      if (totalSalesForDay > highestSales) {
        highestSales = totalSalesForDay;
        highestDate = record.date;
      }
      if (totalSalesForDay < lowestSales) {
        lowestSales = totalSalesForDay;
        lowestDate = record.date;
      }
    });

    this.salesSummary = {
      totalSales,
      totalIncomeItems,
      totalDailyIncome,
      totalGPay,
      totalPaytm,
      totalCash,
      totalDrawer,
      totalOutsideOrder,
      totalRecords: this.filteredRecords.length,
      averageDailySales: this.filteredRecords.length > 0 ? totalSales / this.filteredRecords.length : 0,
      highestSalesDay: { date: highestDate, amount: highestSales },
      lowestSalesDay: { date: lowestDate, amount: lowestSales }
    };
  }

  getTotalSalesForRecord(record: DailyRecord): number {
    const incomeItems = this.getIncomeItemsTotal(record);
    const dailyIncome = (record.dailyIncomeAmount?.gpay || 0) +
                       (record.dailyIncomeAmount?.paytm || 0) +
                       (record.dailyIncomeAmount?.cash || 0) +
                       (record.dailyIncomeAmount?.onDrawer || 0) +
                       (record.dailyIncomeAmount?.onOutsideOrder || 0);
    return incomeItems + dailyIncome;
  }

  getIncomeItemsTotal(record: DailyRecord): number {
    return record.incomeItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  goBack() {
    this.router.navigate(['/reports']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToReports() {
    this.router.navigate(['/reports']);
  }
}
