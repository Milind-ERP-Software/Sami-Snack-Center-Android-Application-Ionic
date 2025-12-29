import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonContent, IonIcon, IonButton, IonInput, IonCheckbox, IonBreadcrumb, IonBreadcrumbs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, calculator, refresh } from 'ionicons/icons';

@Component({
  selector: 'app-menduwada-idali',
  templateUrl: 'menduwada-idali.page.html',
  styleUrls: ['menduwada-idali.page.scss'],
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
    IonCheckbox,
    IonBreadcrumb,
    IonBreadcrumbs
  ]
})
export class MenduwadaIdaliPage implements OnInit {
  // Checkbox states for enabling/disabling Rate
  menduwadaRateEnabled: boolean = false;
  idaliRateEnabled: boolean = false; // Default unchecked

  // Input fields - Menduwada
  menduwadaPlate: number = 1;
  menduwadaPiecesPerPlate: number = 3;
  menduwadaRate: number = 10;
  
  // Input fields - Idali (1 plate = 6 idali, rate = 10 Rs)
  idaliPlate: number = 1; // Default: 1 plate
  idaliPiecesPerPlate: number = 6; // Default: 6 pieces per plate
  idaliRate: number = 10; // Default: 10 Rs per plate

  // Calculated results - Menduwada
  menduwadaTotalPieces: number = 3; // Initial: 1 plate × 3 pieces = 3
  menduwadaAmount: number = 0;
  
  // Calculated results - Idali
  idaliTotalPieces: number = 6; // Initial: 1 plate × 6 pieces = 6
  idaliAmount: number = 10; // Initial: 1 plate × 10 rate = 10
  
  // Total
  totalAmount: number = 0;

  constructor(private router: Router) {
    addIcons({ arrowBack, calculator, refresh });
  }

  ngOnInit() {
    // Calculate initial values with default data
    this.calculate();
  }

  calculate() {
    // Menduwada calculation: Plate × Rate = Amount (calculate if Rate has value)
    this.menduwadaTotalPieces = this.menduwadaPlate * this.menduwadaPiecesPerPlate;
    if (this.menduwadaRate > 0) {
      this.menduwadaAmount = this.menduwadaPlate * this.menduwadaRate;
    } else {
      this.menduwadaAmount = 0;
    }
    
    // Idali calculation: Plate × Rate = Amount (calculate if Rate has value)
    this.idaliTotalPieces = this.idaliPlate * this.idaliPiecesPerPlate;
    if (this.idaliRate > 0) {
      this.idaliAmount = this.idaliPlate * this.idaliRate;
    } else {
      this.idaliAmount = 0;
    }
    
    // Total
    this.totalAmount = this.menduwadaAmount + this.idaliAmount;
  }

  onMenduwadaPiecesChange() {
    // If pieces are entered, calculate plate: Plate = Pieces / Pieces per Plate
    // Allow decimal values
    if (this.menduwadaTotalPieces > 0 && this.menduwadaPiecesPerPlate > 0) {
      this.menduwadaPlate = this.menduwadaTotalPieces / this.menduwadaPiecesPerPlate;
    }
    this.calculate();
  }

  onMenduwadaPlateChange() {
    // If plate is entered, calculate pieces: Pieces = Plate × Pieces per Plate
    this.calculate();
  }

  onMenduwadaAmountChange() {
    // If amount is entered, calculate plate: Plate = Amount / Rate
    // Then calculate pieces: Pieces = Plate × Pieces per Plate
    // Allow decimal values - check Rate value directly (not checkbox state)
    if (this.menduwadaAmount > 0 && this.menduwadaRate > 0) {
      this.menduwadaPlate = this.menduwadaAmount / this.menduwadaRate;
      this.menduwadaTotalPieces = this.menduwadaPlate * this.menduwadaPiecesPerPlate;
      // Auto-enable Rate checkbox if it has a value
      if (this.menduwadaRate > 0) {
        this.menduwadaRateEnabled = true;
      }
    } else if (this.menduwadaAmount === 0 || !this.menduwadaAmount) {
      this.menduwadaPlate = 0;
      this.menduwadaTotalPieces = 0;
    }
    this.calculate();
  }

  onIdaliPiecesChange() {
    // If pieces are entered, calculate plate: Plate = Pieces / Pieces per Plate
    // Allow decimal values
    if (this.idaliTotalPieces > 0 && this.idaliPiecesPerPlate > 0) {
      this.idaliPlate = this.idaliTotalPieces / this.idaliPiecesPerPlate;
    }
    this.calculate();
  }

  onIdaliPlateChange() {
    // If plate is entered, calculate pieces: Pieces = Plate × Pieces per Plate
    this.calculate();
  }

  onIdaliAmountChange() {
    // If amount is entered, calculate plate: Plate = Amount / Rate
    // Then calculate pieces: Pieces = Plate × Pieces per Plate
    // Allow decimal values - check Rate value directly (not checkbox state)
    if (this.idaliAmount > 0 && this.idaliRate > 0) {
      this.idaliPlate = this.idaliAmount / this.idaliRate;
      this.idaliTotalPieces = this.idaliPlate * this.idaliPiecesPerPlate;
      // Auto-enable Rate checkbox if it has a value
      if (this.idaliRate > 0) {
        this.idaliRateEnabled = true;
      }
    } else if (this.idaliAmount === 0 || !this.idaliAmount) {
      this.idaliPlate = 0;
      this.idaliTotalPieces = 0;
    }
    this.calculate();
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

  resetMenduwada() {
    this.menduwadaPlate = 1;
    this.menduwadaPiecesPerPlate = 3;
    this.menduwadaRate = 10;
    this.calculate();
  }

  resetIdali() {
    this.idaliPlate = 1;
    this.idaliPiecesPerPlate = 6;
    this.idaliRate = 10;
    this.idaliRateEnabled = true;
    this.calculate();
  }

  selectAllText(event: any) {
    const input = event.target;
    if (input && input.getInputElement) {
      input.getInputElement().then((nativeInput: HTMLInputElement | HTMLTextAreaElement) => {
        if (nativeInput) {
          setTimeout(() => {
            nativeInput.select();
          }, 0);
        }
      });
    } else if (input && input.select) {
      setTimeout(() => {
        input.select();
      }, 0);
    }
  }
}

