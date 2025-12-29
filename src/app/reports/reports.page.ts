import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, documentText } from 'ionicons/icons';

interface ReportOption {
  id: string;
  title: string;
  route: string;
  icon?: string;
}

@Component({
  selector: 'app-reports',
  templateUrl: 'reports.page.html',
  styleUrls: ['reports.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    IonButton
  ]
})
export class ReportsPage implements OnInit {
  reportOptions: ReportOption[] = [
    {
      id: 'sales-report',
      title: 'Sales Report',
      route: '/reports/sales-report'
    },
    {
      id: 'purchase-report',
      title: 'Purchase Report',
      route: '/reports/purchase-report'
    },
    {
      id: 'profit-loss-report',
      title: 'Profit and Loss Report',
      route: '/reports/profit-loss-report'
    },
    {
      id: 'expense-report',
      title: 'Expense Report',
      route: '/reports/expense-report'
    },
    {
      id: 'grocery-buy-report',
      title: 'Grocery Buy Report',
      route: '/reports/grocery-buy-report'
    }
  ];

  constructor(private router: Router) {
    addIcons({ arrowBack, documentText });
  }

  ngOnInit() {}

  goToReport(route: string) {
    this.router.navigate([route]);
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}

