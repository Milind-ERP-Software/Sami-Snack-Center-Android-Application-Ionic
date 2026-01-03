import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-template5',
  templateUrl: './invoice-template5.component.html',
  styleUrls: ['./invoice-template5.component.scss'],
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None
})
export class InvoiceTemplate5Component {
  @Input() recordData: any = null;
  @Input() totalIncome: number = 0;
  @Input() totalExpense: number = 0;
  @Input() productionCost: number = 0;
  @Input() profitData: { profit: number; loss: number } = { profit: 0, loss: 0 };
  @Input() dateStr: string = '';
  @Input() timeStr: string = '';
  @Input() companyName: string = 'Sami Snack Center';

  constructor() {}
}

