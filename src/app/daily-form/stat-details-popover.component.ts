import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trendingDown, trendingUp, wallet, cash, business, receipt, card, phonePortrait, storefront } from 'ionicons/icons';
import { ProductionItem, ExpenseItem } from '../services/storage.service';

export type StatType = 'loss' | 'profit' | 'expected' | 'income' | 'expense';

@Component({
  selector: 'app-stat-details-popover',
  standalone: true,
  imports: [CommonModule, IonIcon],
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
              <div class="calculation-section">
                <div class="calculation-row">
                  <span class="calculation-label">Daily Income</span>
                  <span class="calculation-value revenue">{{ totalRevenue | number:'1.2-2' }} ₹</span>
                </div>
                <div class="calculation-row">
                  <span class="calculation-label">Daily Expense</span>
                  <span class="calculation-value cost">- {{ totalCosts | number:'1.2-2' }} ₹</span>
              </div>
                <div class="calculation-separator"></div>
                <div class="calculation-row total-row loss-row">
                  <span class="calculation-label">Total Loss</span>
                  <span class="calculation-value loss-value">{{ loss | number:'1.2-2' }} ₹</span>
              </div>
              </div>
            </div>
            <div class="breakdown-section">
              <h4>Daily Income</h4>
              <div class="breakdown-list">
                <div class="breakdown-item">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 123.84 104.9" style="width: 12px; height: 12px; display: inline-block;" xml:space="preserve">
                    <style type="text/css">.st0{clip-path:url(#SVGID_3_);}.st1{clip-path:url(#SVGID_4_);}.st2{clip-path:url(#SVGID_9_);}.st3{fill:#2DA94F;}.st4{fill:#FDBD00;}.st5{clip-path:url(#SVGID_10_);}</style>
                    <g><g><defs><path id="SVGID_1_" d="M65.7,63.18l30.4-52.66l16.56,9.56c10.69,6.17,14.36,19.85,8.18,30.54l-17.12,29.65 c-3.86,6.68-12.4,8.97-19.09,5.12l-15.37-8.87C64.6,73.81,63,67.84,65.7,63.18L65.7,63.18z"/></defs><defs><rect id="SVGID_2_" y="0.02" width="123.84" height="104.88"/></defs><clipPath id="SVGID_3_"><use xlink:href="#SVGID_1_" style="overflow:visible"/></clipPath><clipPath id="SVGID_4_" class="st0"><use xlink:href="#SVGID_2_" style="overflow:visible"/></clipPath><g class="st1"><defs><rect id="SVGID_5_" x="64.32" y="10.34" width="59.52" height="77.04"/></defs><clipPath id="SVGID_6_"><use xlink:href="#SVGID_5_" style="overflow:visible"/></clipPath><g style="clip-path:url(#SVGID_6_)"><image style="overflow:visible" width="132" height="164" xlink:href="data:image/jpeg;base64,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" transform="matrix(0.48 0 0 -0.48 63.3027 88.1797)"/></g></g></g><path class="st4" d="M62.46,26.62l-37.82,65.5l16.56,9.56c10.69,6.17,24.37,2.51,30.54-8.18l24.53-42.49 c3.86-6.68,1.57-15.23-5.12-19.09l-15.37-8.87C71.12,20.35,65.16,21.95,62.46,26.62L62.46,26.62z"/><path class="st3" d="M96.1,10.51L84.38,3.75C71.02-3.97,53.93,0.61,46.21,13.98L24.47,51.62c-3.86,6.68-1.57,15.23,5.12,19.09 l11.72,6.76c6.68,3.86,15.23,1.57,19.09-5.12l25.95-44.95l0,0c5.39-9.34,17.33-12.53,26.66-7.14L96.1,10.51L96.1,10.51z M96.1,10.51L96.1,10.51L96.1,10.51L96.1,10.51z"/><g><defs><path id="SVGID_7_" d="M49.58,25.01l-12.93-7.45c-5.76-3.32-13.13-1.35-16.46,4.4L4.67,48.77c-7.64,13.2-3.11,30.08,10.12,37.7 l9.85,5.67l11.94,6.88l5.18,2.98c-9.2-6.16-12.12-18.5-6.5-28.21l4.02-6.94l14.71-25.42C57.32,35.69,55.35,28.33,49.58,25.01 L49.58,25.01z"/></defs><defs><rect id="SVGID_8_" y="0.02" width="123.84" height="104.88"/></defs><clipPath id="SVGID_9_"><use xlink:href="#SVGID_7_" style="overflow:visible"/></clipPath><clipPath id="SVGID_10_" class="st2"><use xlink:href="#SVGID_8_" style="overflow:visible"/></clipPath><g class="st5"><defs><rect id="SVGID_11_" x="0.96" y="15.86" width="54.72" height="86.16"/></defs><clipPath id="SVGID_12_"><use xlink:href="#SVGID_11_" style="overflow:visible"/></clipPath><g style="clip-path:url(#SVGID_12_)"><image style="overflow:visible" width="120" height="182" xlink:href="data:image/jpeg;base64,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 ZtD6Qoy/9k=" transform="matrix(0.48 0 0 -0.48 0.3071 102.542)"/></g></g></g></g></svg>
                  <span class="breakdown-label">GPay</span>
                  <span class="breakdown-amount">{{ gpay | number:'1.2-2' }} ₹</span>
                </div>
                <div class="breakdown-item">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="12" height="12" viewBox="0 0 48 48" style="display: inline-block;">
                    <path fill="#0d47a1" d="M5.446 18.01H.548c-.277 0-.502.167-.503.502L0 30.519c-.001.3.196.45.465.45.735 0 1.335 0 2.07 0C2.79 30.969 3 30.844 3 30.594 3 29.483 3 28.111 3 27l2.126.009c1.399-.092 2.335-.742 2.725-2.052.117-.393.14-.733.14-1.137l.11-2.862C7.999 18.946 6.949 18.181 5.446 18.01zM4.995 23.465C4.995 23.759 4.754 24 4.461 24H3v-3h1.461c.293 0 .534.24.534.535V23.465zM13.938 18h-3.423c-.26 0-.483.08-.483.351 0 .706 0 1.495 0 2.201C10.06 20.846 10.263 21 10.552 21h2.855c.594 0 .532.972 0 1H11.84C10.101 22 9 23.562 9 25.137c0 .42.005 1.406 0 1.863-.008.651-.014 1.311.112 1.899C9.336 29.939 10.235 31 11.597 31h4.228c.541 0 1.173-.474 1.173-1.101v-8.274C17.026 19.443 15.942 18.117 13.938 18zM14 27.55c0 .248-.202.45-.448.45h-1.105C12.201 28 12 27.798 12 27.55v-2.101C12 25.202 12.201 25 12.447 25h1.105C13.798 25 14 25.202 14 25.449V27.55zM18 18.594v5.608c.124 1.6 1.608 2.798 3.171 2.798h1.414c.597 0 .561.969 0 .969H19.49c-.339 0-.462.177-.462.476v2.152c0 .226.183.396.422.396h2.959c2.416 0 3.592-1.159 3.591-3.757v-8.84c0-.276-.175-.383-.342-.383h-2.302c-.224 0-.355.243-.355.422v5.218c0 .199-.111.316-.29.316H21.41c-.264 0-.409-.143-.409-.396v-5.058C21 18.218 20.88 18 20.552 18c-.778 0-1.442 0-2.22 0C18.067 18 18 18.263 18 18.594L18 18.594z"></path>
                    <path fill="#00adee" d="M27.038 20.569v-2.138c0-.237.194-.431.43-.431H28c1.368-.285 1.851-.62 2.688-1.522.514-.557.966-.704 1.298-.113L32 18h1.569C33.807 18 34 18.194 34 18.431v2.138C34 20.805 33.806 21 33.569 21H32v9.569C32 30.807 31.806 31 31.57 31h-2.14C29.193 31 29 30.807 29 30.569V21h-1.531C27.234 21 27.038 20.806 27.038 20.569L27.038 20.569zM42.991 30.465c0 .294-.244.535-.539.535h-1.91c-.297 0-.54-.241-.54-.535v-6.623-1.871c0-1.284-2.002-1.284-2.002 0v8.494C38 30.759 37.758 31 37.461 31H35.54C35.243 31 35 30.759 35 30.465V18.537C35 18.241 35.243 18 35.54 18h1.976c.297 0 .539.241.539.537v.292c1.32-1.266 3.302-.973 4.416.228 2.097-2.405 5.69-.262 5.523 2.375 0 2.916-.026 6.093-.026 9.033 0 .294-.244.535-.538.535h-1.891C45.242 31 45 30.759 45 30.465c0-2.786 0-5.701 0-8.44 0-1.307-2-1.37-2 0v8.44H42.991z"></path>
                  </svg>
                  <span class="breakdown-label">Paytm</span>
                  <span class="breakdown-amount">{{ paytm | number:'1.2-2' }} ₹</span>
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
              <h4>Daily Cost</h4>
              <div class="breakdown-list">
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
              <div class="calculation-section">
                <div class="calculation-row">
                  <span class="calculation-label">Daily Income</span>
                  <span class="calculation-value revenue">{{ totalRevenue | number:'1.2-2' }} ₹</span>
                </div>
                <div class="calculation-row">
                  <span class="calculation-label">Daily Expense</span>
                  <span class="calculation-value cost">- {{ totalCosts | number:'1.2-2' }} ₹</span>
              </div>
                <div class="calculation-separator"></div>
                <div class="calculation-row total-row profit-row">
                  <span class="calculation-label">Total Profit</span>
                  <span class="calculation-value profit-value">{{ profit | number:'1.2-2' }} ₹</span>
              </div>
              </div>
            </div>
            <div class="breakdown-section">
              <h4>Daily Income</h4>
              <div class="breakdown-list">
                <div class="breakdown-item">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 123.84 104.9" style="width: 12px; height: 12px; display: inline-block;" xml:space="preserve">
                    <style type="text/css">.st0{clip-path:url(#SVGID_3_);}.st1{clip-path:url(#SVGID_4_);}.st2{clip-path:url(#SVGID_9_);}.st3{fill:#2DA94F;}.st4{fill:#FDBD00;}.st5{clip-path:url(#SVGID_10_);}</style>
                    <g><g><defs><path id="SVGID_1_" d="M65.7,63.18l30.4-52.66l16.56,9.56c10.69,6.17,14.36,19.85,8.18,30.54l-17.12,29.65 c-3.86,6.68-12.4,8.97-19.09,5.12l-15.37-8.87C64.6,73.81,63,67.84,65.7,63.18L65.7,63.18z"/></defs><defs><rect id="SVGID_2_" y="0.02" width="123.84" height="104.88"/></defs><clipPath id="SVGID_3_"><use xlink:href="#SVGID_1_" style="overflow:visible"/></clipPath><clipPath id="SVGID_4_" class="st0"><use xlink:href="#SVGID_2_" style="overflow:visible"/></clipPath><g class="st1"><defs><rect id="SVGID_5_" x="64.32" y="10.34" width="59.52" height="77.04"/></defs><clipPath id="SVGID_6_"><use xlink:href="#SVGID_5_" style="overflow:visible"/></clipPath><g style="clip-path:url(#SVGID_6_)"><image style="overflow:visible" width="132" height="164" xlink:href="data:image/jpeg;base64,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" transform="matrix(0.48 0 0 -0.48 63.3027 88.1797)"/></g></g></g><path class="st4" d="M62.46,26.62l-37.82,65.5l16.56,9.56c10.69,6.17,24.37,2.51,30.54-8.18l24.53-42.49 c3.86-6.68,1.57-15.23-5.12-19.09l-15.37-8.87C71.12,20.35,65.16,21.95,62.46,26.62L62.46,26.62z"/><path class="st3" d="M96.1,10.51L84.38,3.75C71.02-3.97,53.93,0.61,46.21,13.98L24.47,51.62c-3.86,6.68-1.57,15.23,5.12,19.09 l11.72,6.76c6.68,3.86,15.23,1.57,19.09-5.12l25.95-44.95l0,0c5.39-9.34,17.33-12.53,26.66-7.14L96.1,10.51L96.1,10.51z M96.1,10.51L96.1,10.51L96.1,10.51L96.1,10.51z"/><g><defs><path id="SVGID_7_" d="M49.58,25.01l-12.93-7.45c-5.76-3.32-13.13-1.35-16.46,4.4L4.67,48.77c-7.64,13.2-3.11,30.08,10.12,37.7 l9.85,5.67l11.94,6.88l5.18,2.98c-9.2-6.16-12.12-18.5-6.5-28.21l4.02-6.94l14.71-25.42C57.32,35.69,55.35,28.33,49.58,25.01 L49.58,25.01z"/></defs><defs><rect id="SVGID_8_" y="0.02" width="123.84" height="104.88"/></defs><clipPath id="SVGID_9_"><use xlink:href="#SVGID_7_" style="overflow:visible"/></clipPath><clipPath id="SVGID_10_" class="st2"><use xlink:href="#SVGID_8_" style="overflow:visible"/></clipPath><g class="st5"><defs><rect id="SVGID_11_" x="0.96" y="15.86" width="54.72" height="86.16"/></defs><clipPath id="SVGID_12_"><use xlink:href="#SVGID_11_" style="overflow:visible"/></clipPath><g style="clip-path:url(#SVGID_12_)"><image style="overflow:visible" width="120" height="182" xlink:href="data:image/jpeg;base64,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 ZtD6Qoy/9k=" transform="matrix(0.48 0 0 -0.48 0.3071 102.542)"/></g></g></g></g></svg>
                  <span class="breakdown-label">GPay</span>
                  <span class="breakdown-amount">{{ gpay | number:'1.2-2' }} ₹</span>
                </div>
                <div class="breakdown-item">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="12" height="12" viewBox="0 0 48 48" style="display: inline-block;">
                    <path fill="#0d47a1" d="M5.446 18.01H.548c-.277 0-.502.167-.503.502L0 30.519c-.001.3.196.45.465.45.735 0 1.335 0 2.07 0C2.79 30.969 3 30.844 3 30.594 3 29.483 3 28.111 3 27l2.126.009c1.399-.092 2.335-.742 2.725-2.052.117-.393.14-.733.14-1.137l.11-2.862C7.999 18.946 6.949 18.181 5.446 18.01zM4.995 23.465C4.995 23.759 4.754 24 4.461 24H3v-3h1.461c.293 0 .534.24.534.535V23.465zM13.938 18h-3.423c-.26 0-.483.08-.483.351 0 .706 0 1.495 0 2.201C10.06 20.846 10.263 21 10.552 21h2.855c.594 0 .532.972 0 1H11.84C10.101 22 9 23.562 9 25.137c0 .42.005 1.406 0 1.863-.008.651-.014 1.311.112 1.899C9.336 29.939 10.235 31 11.597 31h4.228c.541 0 1.173-.474 1.173-1.101v-8.274C17.026 19.443 15.942 18.117 13.938 18zM14 27.55c0 .248-.202.45-.448.45h-1.105C12.201 28 12 27.798 12 27.55v-2.101C12 25.202 12.201 25 12.447 25h1.105C13.798 25 14 25.202 14 25.449V27.55zM18 18.594v5.608c.124 1.6 1.608 2.798 3.171 2.798h1.414c.597 0 .561.969 0 .969H19.49c-.339 0-.462.177-.462.476v2.152c0 .226.183.396.422.396h2.959c2.416 0 3.592-1.159 3.591-3.757v-8.84c0-.276-.175-.383-.342-.383h-2.302c-.224 0-.355.243-.355.422v5.218c0 .199-.111.316-.29.316H21.41c-.264 0-.409-.143-.409-.396v-5.058C21 18.218 20.88 18 20.552 18c-.778 0-1.442 0-2.22 0C18.067 18 18 18.263 18 18.594L18 18.594z"></path>
                    <path fill="#00adee" d="M27.038 20.569v-2.138c0-.237.194-.431.43-.431H28c1.368-.285 1.851-.62 2.688-1.522.514-.557.966-.704 1.298-.113L32 18h1.569C33.807 18 34 18.194 34 18.431v2.138C34 20.805 33.806 21 33.569 21H32v9.569C32 30.807 31.806 31 31.57 31h-2.14C29.193 31 29 30.807 29 30.569V21h-1.531C27.234 21 27.038 20.806 27.038 20.569L27.038 20.569zM42.991 30.465c0 .294-.244.535-.539.535h-1.91c-.297 0-.54-.241-.54-.535v-6.623-1.871c0-1.284-2.002-1.284-2.002 0v8.494C38 30.759 37.758 31 37.461 31H35.54C35.243 31 35 30.759 35 30.465V18.537C35 18.241 35.243 18 35.54 18h1.976c.297 0 .539.241.539.537v.292c1.32-1.266 3.302-.973 4.416.228 2.097-2.405 5.69-.262 5.523 2.375 0 2.916-.026 6.093-.026 9.033 0 .294-.244.535-.538.535h-1.891C45.242 31 45 30.759 45 30.465c0-2.786 0-5.701 0-8.44 0-1.307-2-1.37-2 0v8.44H42.991z"></path>
                  </svg>
                  <span class="breakdown-label">Paytm</span>
                  <span class="breakdown-amount">{{ paytm | number:'1.2-2' }} ₹</span>
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
              <h4>Daily Cost</h4>
              <div class="breakdown-list">
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
                <span class="summary-value expected-value">{{ productionCost | number:'1.2-2' }} ₹</span>
              </div>
            </div>
            <div class="breakdown-section" *ngIf="productionItems && productionItems.length > 0">
              <h4>Production Costs</h4>
              <div class="breakdown-list">
                <div class="breakdown-item" *ngFor="let item of productionItems">
                  <ion-icon name="business" style="font-size: 12px; color: #0066CC;"></ion-icon>
                  <span class="breakdown-label">{{ item.listOfItem || 'N/A' }}</span>
                  <span class="breakdown-amount">{{ item.amount | number:'1.2-2' }} ₹</span>
                </div>
                <div class="breakdown-item" style="margin-top: 4px; padding-top: 6px; border-top: 1px solid #e5e7eb;">
                  <ion-icon name="business" style="font-size: 12px; color: #0066CC;"></ion-icon>
                  <span class="breakdown-label" style="font-weight: 700;">Total Production Cost</span>
                  <span class="breakdown-amount" style="font-weight: 700;">{{ productionCost | number:'1.2-2' }} ₹</span>
                </div>
              </div>
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
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 123.84 104.9" style="width: 12px; height: 12px; display: inline-block;" xml:space="preserve">
                    <style type="text/css">.st0{clip-path:url(#SVGID_3_);}.st1{clip-path:url(#SVGID_4_);}.st2{clip-path:url(#SVGID_9_);}.st3{fill:#2DA94F;}.st4{fill:#FDBD00;}.st5{clip-path:url(#SVGID_10_);}</style>
                    <g><g><defs><path id="SVGID_1_" d="M65.7,63.18l30.4-52.66l16.56,9.56c10.69,6.17,14.36,19.85,8.18,30.54l-17.12,29.65 c-3.86,6.68-12.4,8.97-19.09,5.12l-15.37-8.87C64.6,73.81,63,67.84,65.7,63.18L65.7,63.18z"/></defs><defs><rect id="SVGID_2_" y="0.02" width="123.84" height="104.88"/></defs><clipPath id="SVGID_3_"><use xlink:href="#SVGID_1_" style="overflow:visible"/></clipPath><clipPath id="SVGID_4_" class="st0"><use xlink:href="#SVGID_2_" style="overflow:visible"/></clipPath><g class="st1"><defs><rect id="SVGID_5_" x="64.32" y="10.34" width="59.52" height="77.04"/></defs><clipPath id="SVGID_6_"><use xlink:href="#SVGID_5_" style="overflow:visible"/></clipPath><g style="clip-path:url(#SVGID_6_)"><image style="overflow:visible" width="132" height="164" xlink:href="data:image/jpeg;base64,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" transform="matrix(0.48 0 0 -0.48 63.3027 88.1797)"/></g></g></g><path class="st4" d="M62.46,26.62l-37.82,65.5l16.56,9.56c10.69,6.17,24.37,2.51,30.54-8.18l24.53-42.49 c3.86-6.68,1.57-15.23-5.12-19.09l-15.37-8.87C71.12,20.35,65.16,21.95,62.46,26.62L62.46,26.62z"/><path class="st3" d="M96.1,10.51L84.38,3.75C71.02-3.97,53.93,0.61,46.21,13.98L24.47,51.62c-3.86,6.68-1.57,15.23,5.12,19.09 l11.72,6.76c6.68,3.86,15.23,1.57,19.09-5.12l25.95-44.95l0,0c5.39-9.34,17.33-12.53,26.66-7.14L96.1,10.51L96.1,10.51z M96.1,10.51L96.1,10.51L96.1,10.51L96.1,10.51z"/><g><defs><path id="SVGID_7_" d="M49.58,25.01l-12.93-7.45c-5.76-3.32-13.13-1.35-16.46,4.4L4.67,48.77c-7.64,13.2-3.11,30.08,10.12,37.7 l9.85,5.67l11.94,6.88l5.18,2.98c-9.2-6.16-12.12-18.5-6.5-28.21l4.02-6.94l14.71-25.42C57.32,35.69,55.35,28.33,49.58,25.01 L49.58,25.01z"/></defs><defs><rect id="SVGID_8_" y="0.02" width="123.84" height="104.88"/></defs><clipPath id="SVGID_9_"><use xlink:href="#SVGID_7_" style="overflow:visible"/></clipPath><clipPath id="SVGID_10_" class="st2"><use xlink:href="#SVGID_8_" style="overflow:visible"/></clipPath><g class="st5"><defs><rect id="SVGID_11_" x="0.96" y="15.86" width="54.72" height="86.16"/></defs><clipPath id="SVGID_12_"><use xlink:href="#SVGID_11_" style="overflow:visible"/></clipPath><g style="clip-path:url(#SVGID_12_)"><image style="overflow:visible" width="120" height="182" xlink:href="data:image/jpeg;base64,/9j/4AAQSkZJRgABAgEAlgCWAAD/7AARRHVja3kAAQAEAAAAHgAA/+4AIUFkb2JlAGTAAAAAAQMA EAMCAwYAAAN8AAAEtwAABu3/2wCEABALCwsMCxAMDBAXDw0PFxsUEBAUGx8XFxcXFx8eFxoaGhoX Hh4jJSclIx4vLzMzLy9AQEBAQEBAQEBAQEBAQEABEQ8PERMRFRISFRQRFBEUGhQWFhQaJhoaHBoa JjAjHh4eHiMwKy4nJycuKzU1MDA1NUBAP0BAQEBAQEBAQEBAQP/CABEIALcAeQMBIgACEQEDEQH/ xACmAAADAQEBAQAAAAAAAAAAAAAAAQIGBAUDAQADAQEBAAAAAAAAAAAAAAAAAQIEAwUQAAIAAwUJ AQEAAAAAAAAAAAABIAMFAjRENQYQEjITIzMEFBUkMBEAAQICCwACAwAAAAAAAAAAAQIDABAwcTKS ssLSc5MENBFBMRIiEgABAQYFAwUAAwAAAAAAAAAAAiABwTJyghGRobESMUJDIUFRYYEiohP/2gAM AwEAAhEDEQAAAPU4vtwe153QuaenPpXNLXSuVNdZxsOs4wOw4wNNp8jrsWnGcHfwauaml05wqlqZ uSUAwTQAAe/rsjrsOrGcPdw94U0ukTNJzCqWpVIQAxAB7+uyOuw6sbwd/B3gml0iZuWpmpcyqkSY MQ0Hv67I67DqxnF28XeEmdIlVLUzcihUmpBNNNB7+uyOuw6sZxdvD3gGukpVIpVS1M0nMpoQAz3t dkddh1Yzh7uHvDQ+kpNCU0mom5amaRKAZ72uyOuw6sZw93D3gafSUAJTSCZqXMqpalUmve12R12H VjOHu4e8AHSWmgJpCmblqFUuZVSL3tdkddi1Yzh7uHvAB0kaYJMFKqWpm5FCqWve1uS1uHTjOHu4 dEAHSRoAGgSqRTNy5maTXua3J6zDpyPEFgBaABNAAgBSDSkBe1qAyd//2gAIAQIAAQUAlWLHL5dg 5dg5cs5cs5cs5cs3LPuye1FjpXaix0rtRY6T2osdJ7UWOldqLHSu1FjpXaix0rtRY6V2osdL5/L/ AEH6D9B+g/QfoOr7f//aAAgBAwABBQCZatb+/aN+0b9s37Zv2zftm9a9WZxxYWZxxYW3xxYWZxxY WZxxYWZxxYW3xxYW3xxYW3xxYW3xxYW3y97pHSOkdI6R0Tp+v//aAAgBAQABBQCr1DzZVRdUqI6r Uh1WpDq1TPrVM+vVD69UPr1Q+vVD69UPr1Q+vVD69UNL+d5nk+WVvNGMYxj/AIaQvxW80GMYxjj0 hfit5oMYxjHHpC/FbzQYxjGMcWkL8VrNNjGMYxxaQvxWs02MYxjHFpC/FazTaxjGMcOkL8VrNNrG MYxw6QvxWs02sYxjGODSF+K1mkDGMYxwaQvxW80gYxjGODSF+K3mkLGMYx7dIX4reaQsYxjHt0hf it5pCxjGMY9mkL6VvNImMYxj2aQvpW80iYxjGPZpC+lbzSNjGMYzSF+K3mkbGMYxmkL8VvNI2MYx jNIX4reafwYxjGaRvpW80/gxjGM0jfSsePMt1L1Zp6s09WaerNPVmnqzT1Zp6s09SaPxJo/Emj8S aPw5ppaRbleYf//aAAgBAgIGPwBH8UyJ9volTkSJyJE5EicnEiciRORhxdhw6YenQRQnZuyAihOz dkBFCdm7ICKE7N2QEUJ2bsgIoTs3ZARQnZuyAihOzdkBFCdm7ICKE7N2QEYf5YcXYY4/B4tTxani 1PFqeLU8X9js58fvj0P/2gAIAQMCBj8AV6vmf7kysyZWZMrMmVmTKzJlZmOL8eXX9FVPbuiKqe3d EVU9u6Iqp7d0RVT27oiqnt3RFVPbuiKqe3dEVU9u6Iqp7d0RWPOZ/wAHfod+h36Hfod+h5NDu48v 0//aAAgBAQEGPwB9tp9aEJI+EhRAH8iPS5eMely8Y9Tt4x6nbxj1O3jHqdvGPW7eMet28Y9Tt4x6 3bxj1u3jHrdvGPW7eMOo7Dy3Uhv5AUSQD+wl2KxhFM/tZky7FYwimf2syZdisYRTP7WZMuxWMIpn 9rMmXYrGEUz+1mTLsVjCKZ/azJl2KxhFM/tZky7FYwimf2syZdisYRTP7WZMuxWMIpn9rMmXYrGE Uz+1mTLsVjCKZ/azJl2KxhFM9tZky7FYwime2syZdisYRTPbWZMuxWMIpntrMmXYrGEUz+1mTLsV jCKZ7azJl2KxhFM9tZky7FYwime2syZdisYRTPbWZMn1AoAJH5cQk2R9KUDFpvlb1xab5W9cWm+Vv XFpvlb1xab5W9cWm+VvXFpvlb1xab5W9cWm+VvXFpvlb1xab5W9cWmuVvXFprma1w8VFBBb+P5Wh ZtD6Qoy/9k=" transform="matrix(0.48 0 0 -0.48 0.3071 102.542)"/></g></g></g></g></svg>
                  <span class="breakdown-label">GPay</span>
                  <span class="breakdown-amount">{{ gpay | number:'1.2-2' }} ₹</span>
                </div>
                <div class="breakdown-item">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="12" height="12" viewBox="0 0 48 48" style="display: inline-block;">
                    <path fill="#0d47a1" d="M5.446 18.01H.548c-.277 0-.502.167-.503.502L0 30.519c-.001.3.196.45.465.45.735 0 1.335 0 2.07 0C2.79 30.969 3 30.844 3 30.594 3 29.483 3 28.111 3 27l2.126.009c1.399-.092 2.335-.742 2.725-2.052.117-.393.14-.733.14-1.137l.11-2.862C7.999 18.946 6.949 18.181 5.446 18.01zM4.995 23.465C4.995 23.759 4.754 24 4.461 24H3v-3h1.461c.293 0 .534.24.534.535V23.465zM13.938 18h-3.423c-.26 0-.483.08-.483.351 0 .706 0 1.495 0 2.201C10.06 20.846 10.263 21 10.552 21h2.855c.594 0 .532.972 0 1H11.84C10.101 22 9 23.562 9 25.137c0 .42.005 1.406 0 1.863-.008.651-.014 1.311.112 1.899C9.336 29.939 10.235 31 11.597 31h4.228c.541 0 1.173-.474 1.173-1.101v-8.274C17.026 19.443 15.942 18.117 13.938 18zM14 27.55c0 .248-.202.45-.448.45h-1.105C12.201 28 12 27.798 12 27.55v-2.101C12 25.202 12.201 25 12.447 25h1.105C13.798 25 14 25.202 14 25.449V27.55zM18 18.594v5.608c.124 1.6 1.608 2.798 3.171 2.798h1.414c.597 0 .561.969 0 .969H19.49c-.339 0-.462.177-.462.476v2.152c0 .226.183.396.422.396h2.959c2.416 0 3.592-1.159 3.591-3.757v-8.84c0-.276-.175-.383-.342-.383h-2.302c-.224 0-.355.243-.355.422v5.218c0 .199-.111.316-.29.316H21.41c-.264 0-.409-.143-.409-.396v-5.058C21 18.218 20.88 18 20.552 18c-.778 0-1.442 0-2.22 0C18.067 18 18 18.263 18 18.594L18 18.594z"></path>
                    <path fill="#00adee" d="M27.038 20.569v-2.138c0-.237.194-.431.43-.431H28c1.368-.285 1.851-.62 2.688-1.522.514-.557.966-.704 1.298-.113L32 18h1.569C33.807 18 34 18.194 34 18.431v2.138C34 20.805 33.806 21 33.569 21H32v9.569C32 30.807 31.806 31 31.57 31h-2.14C29.193 31 29 30.807 29 30.569V21h-1.531C27.234 21 27.038 20.806 27.038 20.569L27.038 20.569zM42.991 30.465c0 .294-.244.535-.539.535h-1.91c-.297 0-.54-.241-.54-.535v-6.623-1.871c0-1.284-2.002-1.284-2.002 0v8.494C38 30.759 37.758 31 37.461 31H35.54C35.243 31 35 30.759 35 30.465V18.537C35 18.241 35.243 18 35.54 18h1.976c.297 0 .539.241.539.537v.292c1.32-1.266 3.302-.973 4.416.228 2.097-2.405 5.69-.262 5.523 2.375 0 2.916-.026 6.093-.026 9.033 0 .294-.244.535-.538.535h-1.891C45.242 31 45 30.759 45 30.465c0-2.786 0-5.701 0-8.44 0-1.307-2-1.37-2 0v8.44H42.991z"></path>
                  </svg>
                  <span class="breakdown-label">Paytm</span>
                  <span class="breakdown-amount">{{ paytm | number:'1.2-2' }} ₹</span>
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
      margin-bottom: 8px;
    }

    .calculation-section {
      padding: 8px 10px;
      background: #ffffff;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .calculation-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 0;
      font-size: 12px;
    }

    .calculation-label {
      color: #374151;
      font-weight: 500;
      font-size: 12px;
    }

    .calculation-value {
      font-weight: 600;
      font-size: 13px;
      text-align: right;
    }

    .calculation-value.revenue {
      color: #10b981;
    }

    .calculation-value.cost {
      color: #ef4444;
    }

    .calculation-separator {
      height: 1px;
      background: #e5e7eb;
      margin: 5px 0;
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
      padding: 7px 10px;
      border-radius: 5px;
      margin-top: 3px;
    }

    .loss-row {
      background: #fee2e2;
      border: 1.5px solid #ef4444;
    }

    .loss-row .calculation-label,
    .loss-row .calculation-value {
      color: #dc2626;
      font-weight: 700;
      font-size: 13px;
    }

    .loss-value {
      color: #dc2626;
      font-size: 14px;
    }

    .profit-row {
      background: #10b981;
      border: 1.5px solid #059669;
    }

    .profit-row .calculation-label,
    .profit-row .calculation-value {
      color: #ffffff;
      font-weight: 700;
      font-size: 13px;
    }

    .profit-value {
      color: #ffffff;
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
      background: #059669 !important;
      border-color: #10b981 !important;
    }

    :host-context(body.dark) .profit-value,
    body.dark .profit-value {
      color: #ffffff !important;
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

    :host-context(body.dark) .calculation-section,
    body.dark .calculation-section {
      background: #1f2937 !important;
      border-color: #374151 !important;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
    }

    :host-context(body.dark) .calculation-label,
    body.dark .calculation-label {
      color: #e5e7eb !important;
    }

    :host-context(body.dark) .calculation-value.revenue,
    body.dark .calculation-value.revenue {
      color: #34d399 !important;
    }

    :host-context(body.dark) .calculation-value.cost,
    body.dark .calculation-value.cost {
      color: #f87171 !important;
    }

    :host-context(body.dark) .calculation-separator,
    body.dark .calculation-separator {
      background: #374151 !important;
    }

    :host-context(body.dark) .loss-row,
    body.dark .loss-row {
      background: #7f1d1d !important;
      border-color: #ef4444 !important;
    }

    :host-context(body.dark) .loss-row .calculation-label,
    body.dark .loss-row .calculation-label,
    :host-context(body.dark) .loss-row .calculation-value,
    body.dark .loss-row .calculation-value {
      color: #fca5a5 !important;
    }

    :host-context(body.dark) .profit-row,
    body.dark .profit-row {
      background: #059669 !important;
      border-color: #10b981 !important;
    }

    :host-context(body.dark) .profit-row .calculation-label,
    body.dark .profit-row .calculation-label,
    :host-context(body.dark) .profit-row .calculation-value,
    body.dark .profit-row .calculation-value {
      color: #ffffff !important;
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
  @Input() productionItems: ProductionItem[] = [];
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

