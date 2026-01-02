import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-template1',
  templateUrl: './invoice-template1.component.html',
  styleUrls: ['./invoice-template1.component.scss'],
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None
})
export class InvoiceTemplate1Component {
  @Input() recordData: any = null;
  @Input() totalIncome: number = 0;
  @Input() totalExpense: number = 0;
  @Input() productionCost: number = 0;
  @Input() profitData: { profit: number; loss: number } = { profit: 0, loss: 0 };
  @Input() dateStr: string = '';
  @Input() timeStr: string = '';

  constructor() {}
}

