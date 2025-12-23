import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonPopover, IonList, IonItem, IonLabel, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trendingDown, trendingUp, wallet, cash, business, receipt, card, phonePortrait, storefront } from 'ionicons/icons';
import { ProductionItem, ExpenseItem } from '../services/storage.service';

export type StatType = 'loss' | 'profit' | 'expected' | 'income' | 'expense';

@Component({
  selector: 'app-stat-details-popover',
  standalone: true,
  imports: [CommonModule, IonPopover, IonList, IonItem, IonLabel, IonIcon],
  template: `
    <div class="stat-popover-content">
      <div class="stat-popover-header">
        <ion-icon [name]="getHeaderIcon()" [style.color]="getHeaderColor()" style="font-size: 16px;"></ion-icon>
        <h3>{{ getHeaderTitle() }}</h3>
      </div>
      <div class="stat-popover-body">
        <ng-container [ngSwitch]="statType">
          <!-- Loss Details -->
          <div *ngSwitchCase="'loss'" class="stat-details">
            <div class="stat-summary">
              <div class="summary-row">
                <span class="summary-label">Total Revenue</span>
                <span class="summary-value revenue">{{ totalRevenue | number:'1.2-2' }} ₹</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Total Costs</span>
                <span class="summary-value cost">{{ totalCosts | number:'1.2-2' }} ₹</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row total-row loss-row">
                <span class="summary-label">Loss</span>
                <span class="summary-value loss-value">{{ loss | number:'1.2-2' }} ₹</span>
              </div>
            </div>
            <div class="breakdown-section">
              <h4>Revenue Breakdown</h4>
              <div class="breakdown-list">
                <div class="breakdown-item">
                  <ion-icon name="phonePortrait" style="font-size: 12px; color: #0066CC;"></ion-icon>
                  <span class="breakdown-label">GPay</span>
                  <span class="breakdown-amount">{{ gpay | number:'1.2-2' }} ₹</span>
                </div>
                <div class="breakdown-item">
                  <ion-icon name="card" style="font-size: 12px; color: #0066CC;"></ion-icon>
                  <span class="breakdown-label">Paytm</span>
                  <span class="breakdown-amount">{{ paytm | number:'1.2-2' }} ₹</span>
                </div>
                <div class="breakdown-item">
                  <ion-icon name="cash" style="font-size: 12px; color: #10b981;"></ion-icon>
                  <span class="breakdown-label">Cash</span>
                  <span class="breakdown-amount">{{ cash | number:'1.2-2' }} ₹</span>
                </div>
                <div class="breakdown-item">
                  <ion-icon name="storefront" style="font-size: 12px; color: #8b5cf6;"></ion-icon>
                  <span class="breakdown-label">On Drawer</span>
                  <span class="breakdown-amount">{{ onDrawer | number:'1.2-2' }} ₹</span>
                </div>
                <div class="breakdown-item">
                  <ion-icon name="business" style="font-size: 12px; color: #8b5cf6;"></ion-icon>
                  <span class="breakdown-label">On Outside Order</span>
                  <span class="breakdown-amount">{{ onOutsideOrder | number:'1.2-2' }} ₹</span>
                </div>
              </div>
            </div>
            <div class="breakdown-section">
              <h4>Cost Breakdown</h4>
              <div class="breakdown-list">
                <div class="breakdown-item">
                  <ion-icon name="business" style="font-size: 12px; color: #0066CC;"></ion-icon>
                  <span class="breakdown-label">Production Costs</span>
                  <span class="breakdown-amount">{{ productionCost | number:'1.2-2' }} ₹</span>
                </div>
                <div class="breakdown-item">
                  <ion-icon name="receipt" style="font-size: 12px; color: #f59e0b;"></ion-icon>
                  <span class="breakdown-label">Daily Expenses</span>
                  <span class="breakdown-amount">{{ dailyExpenses | number:'1.2-2' }} ₹</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Profit Details -->
          <div *ngSwitchCase="'profit'" class="stat-details">
            <div class="stat-summary">
              <div class="summary-row">
                <span class="summary-label">Total Revenue</span>
                <span class="summary-value revenue">{{ totalRevenue | number:'1.2-2' }} ₹</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Total Costs</span>
                <span class="summary-value cost">{{ totalCosts | number:'1.2-2' }} ₹</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row total-row profit-row">
                <span class="summary-label">Profit</span>
                <span class="summary-value profit-value">{{ profit | number:'1.2-2' }} ₹</span>
              </div>
            </div>
            <div class="breakdown-section">
              <h4>Revenue Breakdown</h4>
              <div class="breakdown-list">
                <div class="breakdown-item">
                  <ion-icon name="phonePortrait" style="font-size: 12px; color: #0066CC;"></ion-icon>
                  <span class="breakdown-label">GPay</span>
                  <span class="breakdown-amount">{{ gpay | number:'1.2-2' }} ₹</span>
                </div>
                <div class="breakdown-item">
                  <ion-icon name="card" style="font-size: 12px; color: #0066CC;"></ion-icon>
                  <span class="breakdown-label">Paytm</span>
                  <span class="breakdown-amount">{{ paytm | number:'1.2-2' }} ₹</span>
                </div>
                <div class="breakdown-item">
                  <ion-icon name="cash" style="font-size: 12px; color: #10b981;"></ion-icon>
                  <span class="breakdown-label">Cash</span>
                  <span class="breakdown-amount">{{ cash | number:'1.2-2' }} ₹</span>
                </div>
                <div class="breakdown-item">
                  <ion-icon name="storefront" style="font-size: 12px; color: #8b5cf6;"></ion-icon>
                  <span class="breakdown-label">On Drawer</span>
                  <span class="breakdown-amount">{{ onDrawer | number:'1.2-2' }} ₹</span>
                </div>
                <div class="breakdown-item">
                  <ion-icon name="business" style="font-size: 12px; color: #8b5cf6;"></ion-icon>
                  <span class="breakdown-label">On Outside Order</span>
                  <span class="breakdown-amount">{{ onOutsideOrder | number:'1.2-2' }} ₹</span>
                </div>
              </div>
            </div>
            <div class="breakdown-section">
              <h4>Cost Breakdown</h4>
              <div class="breakdown-list">
                <div class="breakdown-item">
                  <ion-icon name="business" style="font-size: 12px; color: #0066CC;"></ion-icon>
                  <span class="breakdown-label">Production Costs</span>
                  <span class="breakdown-amount">{{ productionCost | number:'1.2-2' }} ₹</span>
                </div>
                <div class="breakdown-item">
                  <ion-icon name="receipt" style="font-size: 12px; color: #f59e0b;"></ion-icon>
                  <span class="breakdown-label">Daily Expenses</span>
                  <span class="breakdown-amount">{{ dailyExpenses | number:'1.2-2' }} ₹</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Expected Income Details -->
          <div *ngSwitchCase="'expected'" class="stat-details">
            <div class="stat-summary">
              <div class="summary-row total-row expected-row">
                <span class="summary-label">Expected Income</span>
                <span class="summary-value expected-value">{{ expectedIncome | number:'1.2-2' }} ₹</span>
              </div>
            </div>
            <div class="info-message">
              <p>This is the expected income amount you set for today. It helps you track your target vs actual income.</p>
            </div>
          </div>

          <!-- Total Income Details -->
          <div *ngSwitchCase="'income'" class="stat-details">
            <div class="stat-summary">
              <div class="summary-row total-row income-row">
                <span class="summary-label">Total Today Income</span>
                <span class="summary-value income-value">{{ totalIncome | number:'1.2-2' }} ₹</span>
              </div>
            </div>
            <div class="breakdown-section">
              <h4>Income Breakdown</h4>
              <div class="breakdown-list">
                <div class="breakdown-item">
                  <ion-icon name="phonePortrait" style="font-size: 12px; color: #0066CC;"></ion-icon>
                  <span class="breakdown-label">GPay</span>
                  <span class="breakdown-amount">{{ gpay | number:'1.2-2' }} ₹</span>
                </div>
                <div class="breakdown-item">
                  <ion-icon name="card" style="font-size: 12px; color: #0066CC;"></ion-icon>
                  <span class="breakdown-label">Paytm</span>
                  <span class="breakdown-amount">{{ paytm | number:'1.2-2' }} ₹</span>
                </div>
                <div class="breakdown-item">
                  <ion-icon name="cash" style="font-size: 12px; color: #10b981;"></ion-icon>
                  <span class="breakdown-label">Cash</span>
                  <span class="breakdown-amount">{{ cash | number:'1.2-2' }} ₹</span>
                </div>
                <div class="breakdown-item">
                  <ion-icon name="storefront" style="font-size: 12px; color: #8b5cf6;"></ion-icon>
                  <span class="breakdown-label">On Drawer</span>
                  <span class="breakdown-amount">{{ onDrawer | number:'1.2-2' }} ₹</span>
                </div>
                <div class="breakdown-item">
                  <ion-icon name="business" style="font-size: 12px; color: #8b5cf6;"></ion-icon>
                  <span class="breakdown-label">On Outside Order</span>
                  <span class="breakdown-amount">{{ onOutsideOrder | number:'1.2-2' }} ₹</span>
                </div>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .stat-popover-content {
      padding: 0;
      min-width: 260px;
      max-width: 320px;
    }

    .stat-popover-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .stat-popover-header h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      color: #1f2937;
    }

    .stat-popover-body {
      padding: 8px 12px;
      overflow: visible;
      background: white;
    }

    .stat-summary {
      margin-bottom: 10px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      font-size: 12px;
    }

    .summary-label {
      color: #6b7280;
      font-weight: 500;
      font-size: 11px;
    }

    .summary-value {
      font-weight: 700;
      font-size: 12px;
    }

    .summary-value.revenue {
      color: #10b981;
    }

    .summary-value.cost {
      color: #ef4444;
    }

    .summary-divider {
      height: 1px;
      background: #e5e7eb;
      margin: 4px 0;
    }

    .total-row {
      padding: 6px 8px;
      border-radius: 4px;
      margin-top: 2px;
    }

    .loss-row {
      background: #fee2e2;
      border: 1.5px solid #ef4444;
    }

    .loss-value {
      color: #dc2626;
      font-size: 14px;
    }

    .profit-row {
      background: #d1fae5;
      border: 1.5px solid #10b981;
    }

    .profit-value {
      color: #059669;
      font-size: 14px;
    }

    .expected-row {
      background: #dbeafe;
      border: 1.5px solid #0066CC;
    }

    .expected-value {
      color: #0066CC;
      font-size: 14px;
    }

    .income-row {
      background: #d1fae5;
      border: 1.5px solid #10b981;
    }

    .income-value {
      color: #059669;
      font-size: 14px;
    }

    .breakdown-section {
      margin-top: 10px;
    }

    .breakdown-section h4 {
      margin: 0 0 6px 0;
      font-size: 11px;
      font-weight: 600;
      color: #374151;
    }

    .breakdown-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .breakdown-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 6px;
      background: #f9fafb;
      border-radius: 3px;
      font-size: 11px;
    }

    .breakdown-item ion-icon {
      font-size: 12px !important;
    }

    .breakdown-label {
      flex: 1;
      color: #6b7280;
      font-size: 10px;
    }

    .breakdown-amount {
      color: #1f2937;
      font-weight: 600;
      font-size: 10px;
    }

    .info-message {
      padding: 8px 10px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 4px;
      margin-top: 8px;
    }

    .info-message p {
      margin: 0;
      font-size: 10px;
      color: #1e40af;
      line-height: 1.4;
    }

    /* Dark Mode */
    :host-context(body.dark) .stat-popover-content,
    body.dark .stat-popover-content {
      background: #111827 !important;
    }

    :host-context(body.dark) .stat-popover-header,
    body.dark .stat-popover-header {
      background: #1f2937 !important;
      border-bottom-color: #374151 !important;
    }

    :host-context(body.dark) .stat-popover-header h3,
    body.dark .stat-popover-header h3 {
      color: #ffffff !important;
    }

    :host-context(body.dark) .stat-popover-body,
    body.dark .stat-popover-body {
      background: #111827 !important;
    }

    :host-context(body.dark) .summary-label,
    body.dark .summary-label {
      color: #ffffff !important;
    }

    :host-context(body.dark) .summary-value,
    body.dark .summary-value {
      color: #ffffff !important;
    }

    :host-context(body.dark) .summary-value.revenue,
    body.dark .summary-value.revenue {
      color: #34d399 !important;
    }

    :host-context(body.dark) .summary-value.cost,
    body.dark .summary-value.cost {
      color: #f87171 !important;
    }

    :host-context(body.dark) .summary-divider,
    body.dark .summary-divider {
      background: #374151 !important;
    }

    :host-context(body.dark) .loss-row,
    body.dark .loss-row {
      background: #7f1d1d !important;
      border-color: #ef4444 !important;
    }

    :host-context(body.dark) .loss-value,
    body.dark .loss-value {
      color: #fca5a5 !important;
    }

    :host-context(body.dark) .profit-row,
    body.dark .profit-row {
      background: #064e3b !important;
      border-color: #10b981 !important;
    }

    :host-context(body.dark) .profit-value,
    body.dark .profit-value {
      color: #6ee7b7 !important;
    }

    :host-context(body.dark) .expected-row,
    body.dark .expected-row {
      background: #1e3a8a !important;
      border-color: #3b82f6 !important;
    }

    :host-context(body.dark) .expected-value,
    body.dark .expected-value {
      color: #93c5fd !important;
    }

    :host-context(body.dark) .income-row,
    body.dark .income-row {
      background: #064e3b !important;
      border-color: #10b981 !important;
    }

    :host-context(body.dark) .income-value,
    body.dark .income-value {
      color: #6ee7b7 !important;
    }

    :host-context(body.dark) .breakdown-item,
    body.dark .breakdown-item {
      background: #1f2937 !important;
    }

    :host-context(body.dark) .breakdown-label,
    body.dark .breakdown-label {
      color: #ffffff !important;
    }

    :host-context(body.dark) .breakdown-amount,
    body.dark .breakdown-amount {
      color: #ffffff !important;
    }

    :host-context(body.dark) .breakdown-section h4,
    body.dark .breakdown-section h4 {
      color: #ffffff !important;
    }

    :host-context(body.dark) .info-message,
    body.dark .info-message {
      background: #1e3a8a !important;
      border-color: #3b82f6 !important;
    }

    :host-context(body.dark) .info-message p,
    body.dark .info-message p {
      color: #93c5fd !important;
    }
  `]
})
export class StatDetailsPopoverComponent {
  @Input() statType: StatType = 'income';
  @Input() loss: number = 0;
  @Input() profit: number = 0;
  @Input() expectedIncome: number = 0;
  @Input() totalIncome: number = 0;
  @Input() totalRevenue: number = 0;
  @Input() totalCosts: number = 0;
  @Input() productionCost: number = 0;
  @Input() dailyExpenses: number = 0;
  @Input() gpay: number = 0;
  @Input() paytm: number = 0;
  @Input() cash: number = 0;
  @Input() onDrawer: number = 0;
  @Input() onOutsideOrder: number = 0;

  constructor() {
    addIcons({ trendingDown, trendingUp, wallet, cash, business, receipt, card, phonePortrait, storefront });
  }

  getHeaderIcon(): string {
    switch (this.statType) {
      case 'loss': return 'trendingDown';
      case 'profit': return 'trendingUp';
      case 'expected': return 'wallet';
      case 'income': return 'cash';
      default: return 'cash';
    }
  }

  getHeaderColor(): string {
    switch (this.statType) {
      case 'loss': return '#ef4444';
      case 'profit': return '#10b981';
      case 'expected': return '#0066CC';
      case 'income': return '#10b981';
      default: return '#6b7280';
    }
  }

  getHeaderTitle(): string {
    switch (this.statType) {
      case 'loss': return 'Loss Details';
      case 'profit': return 'Profit Details';
      case 'expected': return 'Expected Income';
      case 'income': return 'Total Income Details';
      default: return 'Details';
    }
  }
}

