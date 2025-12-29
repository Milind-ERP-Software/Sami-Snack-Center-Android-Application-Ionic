import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { business, receipt } from 'ionicons/icons';
import { ProductionItem, ExpenseItem } from '../services/storage.service';

@Component({
  selector: 'app-expense-details-popover',
  standalone: true,
  imports: [CommonModule, IonIcon],
  template: `
    <div class="expense-popover-content">
      <div class="expense-popover-header">
        <h3>Expense Details</h3>
      </div>
      <div class="expense-popover-body">
        <!-- Production Costs -->
        <div class="expense-section">
          <div class="expense-section-header">
            <ion-icon name="business" style="font-size: 14px; color: #0066CC;"></ion-icon>
            <span class="section-title">Production Costs</span>
            <span class="section-total">{{ productionCost | number:'1.2-2' }} ₹</span>
          </div>
          <div class="expense-items-list" *ngIf="productionItems.length > 0">
            <div class="expense-item-row" *ngFor="let item of productionItems">
              <span class="item-name">{{ item.listOfItem || 'N/A' }}</span>
              <span class="item-amount">{{ item.amount | number:'1.2-2' }} ₹</span>
            </div>
          </div>
          <div class="no-items" *ngIf="productionItems.length === 0">
            <span>No production items</span>
          </div>
        </div>

        <!-- Daily Expenses -->
        <div class="expense-section">
          <div class="expense-section-header">
            <ion-icon name="receipt" style="font-size: 14px; color: #f59e0b;"></ion-icon>
            <span class="section-title">Daily Expenses</span>
            <span class="section-total">{{ dailyExpenses | number:'1.2-2' }} ₹</span>
          </div>
          <div class="expense-items-list" *ngIf="expenseItems.length > 0">
            <div class="expense-item-row" *ngFor="let item of expenseItems">
              <span class="item-name">{{ item.listOfItem || 'N/A' }}</span>
              <span class="item-amount">{{ item.amount | number:'1.2-2' }} ₹</span>
            </div>
          </div>
          <div class="no-items" *ngIf="expenseItems.length === 0">
            <span>No expense items</span>
          </div>
        </div>

        <!-- Total -->
        <div class="expense-total">
          <span class="total-label">Total Expense</span>
          <span class="total-value">{{ totalExpense | number:'1.2-2' }} ₹</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .expense-popover-content {
      padding: 0;
      min-width: 260px;
      max-width: 320px;
    }

    .expense-popover-header {
      padding: 8px 12px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .expense-popover-header h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      color: #1f2937;
    }

    .expense-popover-body {
      padding: 8px 12px;
      overflow: visible;
      background: white;
    }

    .expense-section {
      margin-bottom: 10px;
    }

    .expense-section:last-of-type {
      margin-bottom: 8px;
    }

    .expense-section-header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 0;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 6px;
    }

    .expense-section-header ion-icon {
      font-size: 14px !important;
    }

    .section-title {
      flex: 1;
      font-size: 11px;
      font-weight: 600;
      color: #374151;
    }

    .section-total {
      font-size: 11px;
      font-weight: 700;
      color: #1f2937;
    }

    .expense-items-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .expense-item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 6px;
      background: #f9fafb;
      border-radius: 3px;
      font-size: 10px;
    }

    .item-name {
      color: #6b7280;
      flex: 1;
      font-size: 10px;
    }

    .item-amount {
      color: #1f2937;
      font-weight: 600;
      font-size: 10px;
    }

    .no-items {
      padding: 6px;
      text-align: center;
      color: #9ca3af;
      font-size: 10px;
      font-style: italic;
    }

    .expense-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      background: #fef3c7;
      border: 1.5px solid #f59e0b;
      border-radius: 4px;
      margin-top: 8px;
    }

    .total-label {
      font-size: 12px;
      font-weight: 700;
      color: #92400e;
    }

    .total-value {
      font-size: 14px;
      font-weight: 800;
      color: #92400e;
    }

    :host-context(body.dark) .expense-popover-content,
    body.dark .expense-popover-content {
      background: #111827 !important;
    }

    :host-context(body.dark) .expense-popover-header,
    body.dark .expense-popover-header {
      background: #1f2937 !important;
      border-bottom-color: #374151 !important;
    }

    :host-context(body.dark) .expense-popover-header h3,
    body.dark .expense-popover-header h3 {
      color: #ffffff !important;
    }

    :host-context(body.dark) .expense-popover-body,
    body.dark .expense-popover-body {
      background: #111827 !important;
    }

    :host-context(body.dark) .expense-section-header,
    body.dark .expense-section-header {
      border-bottom-color: #374151 !important;
    }

    /* Force white text for section titles in dark mode - multiple selectors for maximum specificity */
    :host-context(body.dark) .expense-section-header .section-title,
    body.dark .expense-section-header .section-title,
    :host-context(body.dark) .expense-section .expense-section-header .section-title,
    body.dark .expense-section .expense-section-header .section-title,
    :host-context(body.dark) .section-title,
    body.dark .section-title {
      color: #ffffff !important;
    }

    :host-context(body.dark) .expense-section-header .section-total,
    body.dark .expense-section-header .section-total,
    :host-context(body.dark) .expense-section .expense-section-header .section-total,
    body.dark .expense-section .expense-section-header .section-total,
    :host-context(body.dark) .section-total,
    body.dark .section-total {
      color: #ffffff !important;
    }

    :host-context(body.dark) .expense-item-row,
    body.dark .expense-item-row {
      background: #1f2937 !important;
    }

    :host-context(body.dark) .item-name,
    body.dark .item-name {
      color: #ffffff !important;
    }

    :host-context(body.dark) .item-amount,
    body.dark .item-amount {
      color: #ffffff !important;
    }

    :host-context(body.dark) .expense-popover-content,
    body.dark .expense-popover-content {
      background: #111827 !important;
    }

    :host-context(body.dark) .no-items,
    body.dark .no-items {
      color: #9ca3af !important;
    }

    :host-context(body.dark) .expense-total,
    body.dark .expense-total {
      background: #1f2937 !important;
      border-color: #f59e0b !important;
    }

    :host-context(body.dark) .total-label,
    :host-context(body.dark) .total-value,
    body.dark .total-label,
    body.dark .total-value {
      color: #f59e0b !important;
    }
  `]
})
export class ExpenseDetailsPopoverComponent {
  @Input() productionCost: number = 0;
  @Input() dailyExpenses: number = 0;
  @Input() totalExpense: number = 0;
  @Input() productionItems: ProductionItem[] = [];
  @Input() expenseItems: ExpenseItem[] = [];

  constructor() {
    addIcons({ business, receipt });
  }
}

