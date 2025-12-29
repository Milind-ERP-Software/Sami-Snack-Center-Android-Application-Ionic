import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton, IonBreadcrumb, IonBreadcrumbs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, documentText } from 'ionicons/icons';

@Component({
  selector: 'app-profit-loss-report',
  templateUrl: 'profit-loss-report.page.html',
  styleUrls: ['profit-loss-report.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonButton,
    IonBreadcrumb,
    IonBreadcrumbs
  ]
})
export class ProfitLossReportPage implements OnInit {

  constructor(private router: Router) {
    addIcons({ arrowBack, documentText });
  }

  ngOnInit() {}

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

