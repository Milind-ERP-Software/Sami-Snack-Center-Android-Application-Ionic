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
  image?: string;
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
      title: 'Menduwada/Idali Wholesale Calculation',
      route: '/calculations/menduwada-idali',
      image: 'assets/stuff/Menduwada-Idali.png'
    },
    {
      id: 'menduwada-idali-retail',
      title: 'Menduwada/Idali Retail Calculation',
      route: '/calculations/menduwada-idali-retail',
      image: 'assets/stuff/Menduwada-Idali.png'
    },
    {
      id: 'production-menduwada',
      title: 'Production of Menduwada',
      route: '/calculations/production-menduwada',
      image: 'assets/stuff/menduwada.png'
    },
    {
      id: 'production-idali',
      title: 'Production of Idali',
      route: '/calculations/production-idali',
      image: 'assets/stuff/idali.png'
    },
    {
      id: 'production-dosa',
      title: 'Production of Dosa',
      route: '/calculations/production-dosa',
      image: 'assets/stuff/dosa.png'
    },
    {
      id: 'production-dal-wada',
      title: 'Production of Dal Wada',
      route: '/calculations/production-dal-wada',
      image: 'assets/stuff/dal-wada.png'
    },
    {
      id: 'production-poha',
      title: 'Production of Poha',
      route: '/calculations/production-poha',
      image: 'assets/stuff/poha.png'
    },
    {
      id: 'production-upma',
      title: 'Production of Upma',
      route: '/calculations/production-upma',
      image: 'assets/stuff/upma.png'
    },
    {
      id: 'production-samosa',
      title: 'Production of Samosa',
      route: '/calculations/production-samosa',
      image: 'assets/stuff/samosa.png'
    },
    {
      id: 'production-dokla',
      title: 'Production of Dokla',
      route: '/calculations/production-dokla',
      image: 'assets/stuff/dokla.png'
    },
    {
      id: 'production-wada-pav',
      title: 'Production of Wada Pav',
      route: '/calculations/production-wada-pav',
      image: 'assets/stuff/wada-pav.png'
    },
    {
      id: 'production-sambhar',
      title: 'Production of Sambhar',
      route: '/calculations/production-sambhar',
      image: 'assets/stuff/sambhar.webp'
    },
    {
      id: 'production-white-chatni',
      title: 'Production of White Chatni',
      route: '/calculations/production-white-chatni',
      image: 'assets/stuff/white-chatni.webp'
    },
    {
      id: 'production-sabudana-khichadi',
      title: 'Production of Sabudana Khichadi',
      route: '/calculations/production-sabudana-khichadi',
      image: 'assets/stuff/sabhudana-khichadi.png'
    },
    {
      id: 'production-sabudana-wada',
      title: 'Production of Sabudana Wada',
      route: '/calculations/production-sabudana-wada',
      image: 'assets/stuff/sabhudana-wada.jpg'
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

