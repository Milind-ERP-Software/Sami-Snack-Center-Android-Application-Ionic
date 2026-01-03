import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyRecord } from '../../services/storage.service';

@Component({
  selector: 'app-invoice-template',
  templateUrl: './invoice-template.component.html',
  styleUrls: ['./invoice-template.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class InvoiceTemplateComponent {
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


