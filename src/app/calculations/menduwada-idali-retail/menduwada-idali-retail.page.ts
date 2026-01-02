import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonContent, IonIcon, IonButton, IonInput, IonCheckbox, IonBreadcrumb, IonBreadcrumbs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, calculator, refresh, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-menduwada-idali-retail',
  templateUrl: 'menduwada-idali-retail.page.html',
  styleUrls: ['menduwada-idali-retail.page.scss'],
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
export class MenduwadaIdaliRetailPage implements OnInit {
  @Input() hideHeader: boolean = false; // Hide header when used in modal
  
  // Checkbox states for enabling/disabling Rate
  menduwadaRateEnabled: boolean = false;
  idaliRateEnabled: boolean = false; // Default unchecked

  // Input fields - Menduwada
  menduwadaPlate: number = 1;
  menduwadaPiecesPerPlate: number = 4;
  menduwadaRate: number = 20;
  
  // Input fields - Idali (1 plate = 4 idali, rate = 20 Rs)
  idaliPlate: number = 1; // Default: 1 plate
  idaliPiecesPerPlate: number = 4; // Default: 4 pieces per plate
  idaliRate: number = 20; // Default: 20 Rs per plate

  // Calculated results - Menduwada
  menduwadaTotalPieces: number = 4; // Initial: 1 plate × 4 pieces = 4
  menduwadaAmount: number = 0;
  
  // Calculated results - Idali
  idaliTotalPieces: number = 4; // Initial: 1 plate × 4 pieces = 4
  idaliAmount: number = 0; // Initial: 1 plate × 20 rate = 20 (will be calculated)
  
  // Total
  totalAmount: number = 0;

  // Card 2 - 1 plate = 3 pieces, rate = 20
  card2MenduwadaPlate: number = 1;
  card2MenduwadaPiecesPerPlate: number = 3;
  card2MenduwadaRate: number = 20;
  card2MenduwadaTotalPieces: number = 3;
  card2MenduwadaAmount: number = 0;
  card2MenduwadaRateEnabled: boolean = false;

  card2IdaliPlate: number = 1;
  card2IdaliPiecesPerPlate: number = 3;
  card2IdaliRate: number = 20;
  card2IdaliTotalPieces: number = 3;
  card2IdaliAmount: number = 0;
  card2IdaliRateEnabled: boolean = false;

  card2TotalAmount: number = 0;

  // Card 3 - 1 plate = 5 pieces, rate = 25
  card3MenduwadaPlate: number = 1;
  card3MenduwadaPiecesPerPlate: number = 5;
  card3MenduwadaRate: number = 25;
  card3MenduwadaTotalPieces: number = 5;
  card3MenduwadaAmount: number = 0;
  card3MenduwadaRateEnabled: boolean = false;

  card3IdaliPlate: number = 1;
  card3IdaliPiecesPerPlate: number = 5;
  card3IdaliRate: number = 25;
  card3IdaliTotalPieces: number = 5;
  card3IdaliAmount: number = 0;
  card3IdaliRateEnabled: boolean = false;

  card3TotalAmount: number = 0;

  constructor(private router: Router) {
    addIcons({ arrowBack, calculator, refresh, trashOutline });
  }

  ngOnInit() {
    // Calculate initial values with default data
    this.calculate();
    this.calculateCard2();
    this.calculateCard3();
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
    this.menduwadaPiecesPerPlate = 4;
    this.menduwadaRate = 20;
    this.calculate();
  }

  resetIdali() {
    this.idaliPlate = 1;
    this.idaliPiecesPerPlate = 4;
    this.idaliRate = 20;
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

  // Card 2 Calculation Methods
  calculateCard2() {
    this.card2MenduwadaTotalPieces = this.card2MenduwadaPlate * this.card2MenduwadaPiecesPerPlate;
    if (this.card2MenduwadaRate > 0) {
      this.card2MenduwadaAmount = this.card2MenduwadaPlate * this.card2MenduwadaRate;
    } else {
      this.card2MenduwadaAmount = 0;
    }
    
    this.card2IdaliTotalPieces = this.card2IdaliPlate * this.card2IdaliPiecesPerPlate;
    if (this.card2IdaliRate > 0) {
      this.card2IdaliAmount = this.card2IdaliPlate * this.card2IdaliRate;
    } else {
      this.card2IdaliAmount = 0;
    }
    
    this.card2TotalAmount = this.card2MenduwadaAmount + this.card2IdaliAmount;
  }

  onCard2MenduwadaPiecesChange() {
    if (this.card2MenduwadaTotalPieces > 0 && this.card2MenduwadaPiecesPerPlate > 0) {
      this.card2MenduwadaPlate = this.card2MenduwadaTotalPieces / this.card2MenduwadaPiecesPerPlate;
    }
    this.calculateCard2();
  }

  onCard2MenduwadaPlateChange() {
    this.calculateCard2();
  }

  onCard2MenduwadaAmountChange() {
    if (this.card2MenduwadaAmount > 0 && this.card2MenduwadaRate > 0) {
      this.card2MenduwadaPlate = this.card2MenduwadaAmount / this.card2MenduwadaRate;
      this.card2MenduwadaTotalPieces = this.card2MenduwadaPlate * this.card2MenduwadaPiecesPerPlate;
      if (this.card2MenduwadaRate > 0) {
        this.card2MenduwadaRateEnabled = true;
      }
    } else if (this.card2MenduwadaAmount === 0 || !this.card2MenduwadaAmount) {
      this.card2MenduwadaPlate = 0;
      this.card2MenduwadaTotalPieces = 0;
    }
    this.calculateCard2();
  }

  onCard2IdaliPiecesChange() {
    if (this.card2IdaliTotalPieces > 0 && this.card2IdaliPiecesPerPlate > 0) {
      this.card2IdaliPlate = this.card2IdaliTotalPieces / this.card2IdaliPiecesPerPlate;
    }
    this.calculateCard2();
  }

  onCard2IdaliPlateChange() {
    this.calculateCard2();
  }

  onCard2IdaliAmountChange() {
    if (this.card2IdaliAmount > 0 && this.card2IdaliRate > 0) {
      this.card2IdaliPlate = this.card2IdaliAmount / this.card2IdaliRate;
      this.card2IdaliTotalPieces = this.card2IdaliPlate * this.card2IdaliPiecesPerPlate;
      if (this.card2IdaliRate > 0) {
        this.card2IdaliRateEnabled = true;
      }
    } else if (this.card2IdaliAmount === 0 || !this.card2IdaliAmount) {
      this.card2IdaliPlate = 0;
      this.card2IdaliTotalPieces = 0;
    }
    this.calculateCard2();
  }

  resetCard2Menduwada() {
    this.card2MenduwadaPlate = 1;
    this.card2MenduwadaPiecesPerPlate = 3;
    this.card2MenduwadaRate = 20;
    this.calculateCard2();
  }

  resetCard2Idali() {
    this.card2IdaliPlate = 1;
    this.card2IdaliPiecesPerPlate = 3;
    this.card2IdaliRate = 20;
    this.card2IdaliRateEnabled = true;
    this.calculateCard2();
  }

  // Card 3 Calculation Methods
  calculateCard3() {
    this.card3MenduwadaTotalPieces = this.card3MenduwadaPlate * this.card3MenduwadaPiecesPerPlate;
    if (this.card3MenduwadaRate > 0) {
      this.card3MenduwadaAmount = this.card3MenduwadaPlate * this.card3MenduwadaRate;
    } else {
      this.card3MenduwadaAmount = 0;
    }
    
    this.card3IdaliTotalPieces = this.card3IdaliPlate * this.card3IdaliPiecesPerPlate;
    if (this.card3IdaliRate > 0) {
      this.card3IdaliAmount = this.card3IdaliPlate * this.card3IdaliRate;
    } else {
      this.card3IdaliAmount = 0;
    }
    
    this.card3TotalAmount = this.card3MenduwadaAmount + this.card3IdaliAmount;
  }

  onCard3MenduwadaPiecesChange() {
    if (this.card3MenduwadaTotalPieces > 0 && this.card3MenduwadaPiecesPerPlate > 0) {
      this.card3MenduwadaPlate = this.card3MenduwadaTotalPieces / this.card3MenduwadaPiecesPerPlate;
    }
    this.calculateCard3();
  }

  onCard3MenduwadaPlateChange() {
    this.calculateCard3();
  }

  onCard3MenduwadaAmountChange() {
    if (this.card3MenduwadaAmount > 0 && this.card3MenduwadaRate > 0) {
      this.card3MenduwadaPlate = this.card3MenduwadaAmount / this.card3MenduwadaRate;
      this.card3MenduwadaTotalPieces = this.card3MenduwadaPlate * this.card3MenduwadaPiecesPerPlate;
      if (this.card3MenduwadaRate > 0) {
        this.card3MenduwadaRateEnabled = true;
      }
    } else if (this.card3MenduwadaAmount === 0 || !this.card3MenduwadaAmount) {
      this.card3MenduwadaPlate = 0;
      this.card3MenduwadaTotalPieces = 0;
    }
    this.calculateCard3();
  }

  onCard3IdaliPiecesChange() {
    if (this.card3IdaliTotalPieces > 0 && this.card3IdaliPiecesPerPlate > 0) {
      this.card3IdaliPlate = this.card3IdaliTotalPieces / this.card3IdaliPiecesPerPlate;
    }
    this.calculateCard3();
  }

  onCard3IdaliPlateChange() {
    this.calculateCard3();
  }

  onCard3IdaliAmountChange() {
    if (this.card3IdaliAmount > 0 && this.card3IdaliRate > 0) {
      this.card3IdaliPlate = this.card3IdaliAmount / this.card3IdaliRate;
      this.card3IdaliTotalPieces = this.card3IdaliPlate * this.card3IdaliPiecesPerPlate;
      if (this.card3IdaliRate > 0) {
        this.card3IdaliRateEnabled = true;
      }
    } else if (this.card3IdaliAmount === 0 || !this.card3IdaliAmount) {
      this.card3IdaliPlate = 0;
      this.card3IdaliTotalPieces = 0;
    }
    this.calculateCard3();
  }

  resetCard3Menduwada() {
    this.card3MenduwadaPlate = 1;
    this.card3MenduwadaPiecesPerPlate = 5;
    this.card3MenduwadaRate = 25;
    this.calculateCard3();
  }

  resetCard3Idali() {
    this.card3IdaliPlate = 1;
    this.card3IdaliPiecesPerPlate = 5;
    this.card3IdaliRate = 25;
    this.card3IdaliRateEnabled = true;
    this.calculateCard3();
  }

  // Clear all cards
  clearAllCards() {
    // Reset Card 1
    this.menduwadaPlate = 1;
    this.menduwadaPiecesPerPlate = 4;
    this.menduwadaRate = 20;
    this.menduwadaRateEnabled = false;
    this.idaliPlate = 1;
    this.idaliPiecesPerPlate = 4;
    this.idaliRate = 20;
    this.idaliRateEnabled = false;
    this.calculate();

    // Reset Card 2
    this.card2MenduwadaPlate = 1;
    this.card2MenduwadaPiecesPerPlate = 3;
    this.card2MenduwadaRate = 20;
    this.card2MenduwadaRateEnabled = false;
    this.card2IdaliPlate = 1;
    this.card2IdaliPiecesPerPlate = 3;
    this.card2IdaliRate = 20;
    this.card2IdaliRateEnabled = false;
    this.calculateCard2();

    // Reset Card 3
    this.card3MenduwadaPlate = 1;
    this.card3MenduwadaPiecesPerPlate = 5;
    this.card3MenduwadaRate = 25;
    this.card3MenduwadaRateEnabled = false;
    this.card3IdaliPlate = 1;
    this.card3IdaliPiecesPerPlate = 5;
    this.card3IdaliRate = 25;
    this.card3IdaliRateEnabled = false;
    this.calculateCard3();
  }
}

