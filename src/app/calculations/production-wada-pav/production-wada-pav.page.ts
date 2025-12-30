import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonContent, IonIcon, IonButton, IonInput, IonLabel, IonItem, IonBreadcrumb, IonBreadcrumbs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, calculator } from 'ionicons/icons';

@Component({
  selector: 'app-production-wada-pav',
  templateUrl: 'production-wada-pav.page.html',
  styleUrls: ['production-wada-pav.page.scss'],
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
    IonLabel,
    IonItem,
    IonBreadcrumb,
    IonBreadcrumbs
  ]
})
export class ProductionWadaPavPage implements OnInit {
  qty: number = 0;
  rate: number = 0;
  amount: number = 0;

  constructor(private router: Router) {
    addIcons({ arrowBack, calculator });
  }

  ngOnInit() {}

  calculate() {
    this.amount = this.qty * this.rate;
  }

  goBack() {
    this.router.navigate(['/calculations']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToCalculations() {
    this.router.navigate(['/calculations']);
  }

  selectAllText(event: any) {
    event.target.select();
  }
}

