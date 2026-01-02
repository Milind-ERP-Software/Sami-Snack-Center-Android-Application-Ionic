import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-template6',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-template6.component.html',
  styleUrls: ['./invoice-template6.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InvoiceTemplate6Component {
  @Input() recordData: any;
  @Input() totalIncome: number = 0;
  @Input() totalExpense: number = 0;
  @Input() productionCost: number = 0;
  @Input() profitData: { profit: number; loss: number } = { profit: 0, loss: 0 };
  @Input() dateStr: string = '';
  @Input() timeStr: string = '';
}

