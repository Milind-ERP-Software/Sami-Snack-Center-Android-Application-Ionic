import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, calculator } from 'ionicons/icons';

interface CalculationOption {
  id: string;
  title: string;
  route: string;
  icon?: string;
}

@Component({
  selector: 'app-calculations',
  templateUrl: 'calculations.page.html',
  styleUrls: ['calculations.page.scss'],
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
export class CalculationsPage implements OnInit {
  calculationOptions: CalculationOption[] = [
    {
      id: 'menduwada-idali',
      title: 'Menduwada/Idali Calculation',
      route: '/calculations/menduwada-idali'
    },
    {
      id: 'production-menduwada',
      title: 'Production of Menduwada',
      route: '/calculations/production-menduwada'
    },
    {
      id: 'production-idali',
      title: 'Production of Idali',
      route: '/calculations/production-idali'
    },
    {
      id: 'production-dosa',
      title: 'Production of Dosa',
      route: '/calculations/production-dosa'
    },
    {
      id: 'production-dal-wada',
      title: 'Production of Dal Wada',
      route: '/calculations/production-dal-wada'
    },
    {
      id: 'production-poha',
      title: 'Production of Poha',
      route: '/calculations/production-poha'
    },
    {
      id: 'production-upma',
      title: 'Production of Upma',
      route: '/calculations/production-upma'
    },
    {
      id: 'production-samosa',
      title: 'Production of Samosa',
      route: '/calculations/production-samosa'
    }
  ];

  constructor(private router: Router) {
    addIcons({ arrowBack, calculator });
  }

  ngOnInit() {}

  goToCalculation(route: string) {
    this.router.navigate([route]);
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}

