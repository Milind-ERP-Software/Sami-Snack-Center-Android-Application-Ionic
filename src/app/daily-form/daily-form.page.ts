import { Component, OnInit, OnDestroy, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonInput, IonTextarea, IonButton, IonSelect, IonSelectOption, IonPopover } from '@ionic/angular/standalone';
import { AlertController, ToastController, Platform } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, trash, save, calendar, arrowBack, documentText, calculator, trendingDown, trendingUp, close, addCircle, wallet, cash, chevronDown, chevronUp, chevronDownOutline, chevronUpOutline, caretDown, caretUp, receipt, business } from 'ionicons/icons';
import { StorageService, DailyRecord, ProductionItem, ExpenseItem, IncomeItem } from '../services/storage.service';
import { ExpenseDetailsPopoverComponent } from './expense-details-popover.component';
import { StatDetailsPopoverComponent } from './stat-details-popover.component';
import { ProductionItemsService, ProductionItemOption } from '../services/production-items.service';
import { ExpenseItemsService, ExpenseItemOption } from '../services/expense-items.service';
import { PurchaseItemsService, PurchaseItemOption } from '../services/purchase-items.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-daily-form',
  templateUrl: 'daily-form.page.html',
  styleUrls: ['daily-form.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonInput,
    IonTextarea,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonPopover,
    ExpenseDetailsPopoverComponent,
    StatDetailsPopoverComponent
  ],
})
export class DailyFormPage implements OnInit, OnDestroy, AfterViewInit {
  form!: FormGroup;
  recordId: string | null = null;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  storedProfit: number = 0;
  storedLoss: number = 0;
  isNavigating = false;
  createdAt: string | null = null;
  updatedAt: string | null = null;

  // Accordion states
  isProductionExpanded = true;
  isExpensesExpanded = true;
  isPurchaseExpanded = true;
  isIncomeDetailsExpanded = true;
  isAdditionalInfoExpanded = true;
  isDarkMode = false;
  isExpensePopoverOpen = false;
  expensePopoverEvent?: Event;
  isLossPopoverOpen = false;
  lossPopoverEvent?: Event;
  isProfitPopoverOpen = false;
  profitPopoverEvent?: Event;
  isExpectedPopoverOpen = false;
  expectedPopoverEvent?: Event;
  isIncomePopoverOpen = false;
  incomePopoverEvent?: Event;

  // Options for dropdowns
  productionItemOptions: ProductionItemOption[] = [];
  expenseItemOptions: ExpenseItemOption[] = [];
  purchaseItemOptions: PurchaseItemOption[] = [];

  private backButtonSubscription?: any;
  private browserBackHandler?: (event: PopStateEvent) => void;

  constructor(
    private fb: FormBuilder,
    private storageService: StorageService,
    private productionItemsService: ProductionItemsService,
    private expenseItemsService: ExpenseItemsService,
    private purchaseItemsService: PurchaseItemsService,
    private route: ActivatedRoute,
    private _router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private platform: Platform,
    private cdr: ChangeDetectorRef,
    private themeService: ThemeService
  ) {
    addIcons({ add, trash, save, calendar, arrowBack, documentText, calculator, trendingDown, trendingUp, close, addCircle, wallet, cash, chevronDown, chevronUp, chevronDownOutline, chevronUpOutline, caretDown, caretUp, receipt, business });
  }

  ngOnInit() {
    this.isLoading = true;
    this.isDarkMode = this.themeService.isDarkMode();

    // Ensure services are initialized with default items
    // This ensures dropdowns have options available
    this.ensureDefaultItems();

    // Initialize form immediately to prevent undefined errors
    this.initializeForm();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.recordId = params['id'];
        this.isEditMode = true;
      }
    });

    setTimeout(() => {
      if (this.recordId) {
        this.loadRecord(this.recordId);
      }
      this.isLoading = false;
    }, 300);

    // Register back button handler to close action sheets
    this.setupBackButtonHandler();

    // Also handle browser back button for web
    this.browserBackHandler = this.handleBrowserBack.bind(this);
    window.addEventListener('popstate', this.browserBackHandler);
  }

  private async ensureDefaultItems(): Promise<void> {
    // Ensure all services have default items initialized
    // This is a safety check to ensure dropdowns always have options
    try {
      this.productionItemOptions = await this.productionItemsService.getAllItems();
      if (this.productionItemOptions.length === 0) {
        // Force initialization if empty
        await this.productionItemsService.addItem('Idali');
        await this.productionItemsService.addItem('Dosa');
        await this.productionItemsService.addItem('Vada');
        this.productionItemOptions = await this.productionItemsService.getAllItems();
      }

      this.expenseItemOptions = await this.expenseItemsService.getAllItems();
      if (this.expenseItemOptions.length === 0) {
        // Force initialization if empty
        await this.expenseItemsService.addItem('Vegetables');
        await this.expenseItemsService.addItem('Oil');
        await this.expenseItemsService.addItem('Gas');
        this.expenseItemOptions = await this.expenseItemsService.getAllItems();
      }

      this.purchaseItemOptions = await this.purchaseItemsService.getAllItems();
      if (this.purchaseItemOptions.length === 0) {
        // Force initialization if empty
        await this.purchaseItemsService.addItem('Groceries');
        await this.purchaseItemsService.addItem('Vegetables');
        await this.purchaseItemsService.addItem('Fruits');
        this.purchaseItemOptions = await this.purchaseItemsService.getAllItems();
      }
    } catch (error) {
      console.error('Error ensuring default items:', error);
    }
  }

  private handleBrowserBack(event: PopStateEvent) {
    // Check if any action sheet is open
    const actionSheetBackdrop = document.querySelector('.action-sheet-backdrop');
    const actionSheetContainer = document.querySelector('.action-sheet-container');
    const actionSheet = document.querySelector('ion-action-sheet');

    if (actionSheetBackdrop || (actionSheetContainer && actionSheet)) {
      // Push state back to prevent navigation
      window.history.pushState(null, '', window.location.href);

      // Close the action sheet
      this.closeActionSheet();
    }
  }

  private closeActionSheet() {
    const actionSheet = document.querySelector('ion-action-sheet');
    const actionSheetBackdrop = document.querySelector('.action-sheet-backdrop');
    const actionSheetContainer = document.querySelector('.action-sheet-container');

    // First try: Click the cancel button if it exists
    const cancelButton = document.querySelector('.action-sheet-button[role="cancel"]') ||
                         document.querySelector('.action-sheet-button:last-child');
    if (cancelButton) {
      (cancelButton as HTMLElement).click();
      return;
    }

    // Second try: Click the backdrop to dismiss
    if (actionSheetBackdrop) {
      (actionSheetBackdrop as HTMLElement).click();
      // Also try dismiss method
      setTimeout(() => {
        if (this.isActionSheetOpen()) {
          this.forceCloseActionSheet();
        }
      }, 100);
      return;
    }

    // Third try: Use dismiss method
    if (actionSheet) {
      const actionSheetElement = actionSheet as any;
      if (typeof actionSheetElement.dismiss === 'function') {
        actionSheetElement.dismiss();
        return;
      }
    }

    // Final fallback: Force remove
    this.forceCloseActionSheet();
  }

  private forceCloseActionSheet() {
    const actionSheet = document.querySelector('ion-action-sheet');
    const actionSheetBackdrop = document.querySelector('.action-sheet-backdrop');
    const actionSheetContainer = document.querySelector('.action-sheet-container');
    const actionSheetWrapper = document.querySelector('.action-sheet-wrapper');

    // Remove all action sheet related elements
    if (actionSheetBackdrop) {
      actionSheetBackdrop.remove();
    }
    if (actionSheetContainer) {
      actionSheetContainer.remove();
    }
    if (actionSheetWrapper) {
      actionSheetWrapper.remove();
    }
    if (actionSheet) {
      actionSheet.remove();
    }

    // Also remove any backdrop
    const backdrop = document.querySelector('ion-backdrop');
    if (backdrop) {
      backdrop.remove();
    }

    // Remove any overlay classes from body
    document.body.classList.remove('action-sheet-open', 'overlay-hidden');
  }

  ngOnDestroy() {
    // Unregister back button handler
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
    // Remove browser back button listener
    if (this.browserBackHandler) {
      window.removeEventListener('popstate', this.browserBackHandler);
    }
  }

  private setupBackButtonHandler() {
    // Handle back button for both mobile and web
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () => {
      // Check if any action sheet is open
      if (this.isActionSheetOpen()) {
        this.closeActionSheet();
        return;
      }

      // Check if any modal/overlay is open
      const modal = document.querySelector('ion-modal');
      if (modal) {
        const modalElement = modal as any;
        if (typeof modalElement.dismiss === 'function') {
          modalElement.dismiss();
          return;
        }
      }

      // Check for any other overlays (alerts, popovers, etc.)
      const overlays = document.querySelectorAll('ion-alert, ion-popover, ion-loading');
      for (let overlay of Array.from(overlays)) {
        const overlayElement = overlay as any;
        if (typeof overlayElement.dismiss === 'function') {
          overlayElement.dismiss();
          return;
        }
      }

      // If no overlays are open, navigate back
      if (!this.isNavigating) {
        this.goToHome();
      }
    });
  }

  private isActionSheetOpen(): boolean {
    const actionSheetBackdrop = document.querySelector('.action-sheet-backdrop');
    const actionSheetContainer = document.querySelector('.action-sheet-container');
    const actionSheet = document.querySelector('ion-action-sheet');

    return !!(actionSheetBackdrop || (actionSheetContainer && actionSheet));
  }

  initializeForm() {
    this.form = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      chains: [0, [Validators.required, Validators.min(0)]],
      production: this.fb.array([]),
      dailyExpenseList: this.fb.array([]),
      expectedIncome: [0, [Validators.required, Validators.min(0)]],
      dailyIncomeAmount: this.fb.group({
        gpay: [0, [Validators.min(0)]],
        paytm: [0, [Validators.min(0)]],
        cash: [0, [Validators.min(0)]],
        onDrawer: [0, [Validators.min(0)]],
        onOutsideOrder: [0, [Validators.min(0)]]
      }),
      backMoneyInBag: [0, [Validators.required, Validators.min(0)]],
      todayWasteMaterialList: [''],
      notes: [''],
      todayPurchases: this.fb.array([])
    });

    // Reset dates for new records
    if (!this.isEditMode) {
      this.createdAt = null;
      this.updatedAt = null;
    }

    // Add initial empty items
    this.addProductionItem();
    this.addExpenseItem();
    this.addTodayPurchase();
  }

  // Production Items
  get productionItems(): FormArray {
    return this.form.get('production') as FormArray;
  }

  addProductionItem() {
    const item = this.fb.group({
      listOfItem: ['', Validators.required],
      qty: [0, [Validators.required, Validators.min(0)]],
      rate: [0, [Validators.required, Validators.min(0)]],
      amount: [{value: 0, disabled: true}, [Validators.required, Validators.min(0)]]
    });

    // Subscribe to qty and rate changes to calculate amount
    const qtyControl = item.get('qty');
    const rateControl = item.get('rate');
    const amountControl = item.get('amount');

    if (qtyControl && rateControl && amountControl) {
      qtyControl.valueChanges.subscribe(() => this.calculateAmount(item));
      rateControl.valueChanges.subscribe(() => this.calculateAmount(item));
      // Calculate initial amount
      this.calculateAmount(item);
    }

    this.productionItems.push(item);
  }

  private calculateAmount(itemGroup: any) {
    const qty = itemGroup.get('qty')?.value || 0;
    const rate = itemGroup.get('rate')?.value || 0;
    const amount = qty * rate;
    itemGroup.get('amount')?.setValue(amount, { emitEvent: false });
  }

  async removeProductionItem(index: number) {
    if (this.productionItems.length <= 1) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Delete Production Item',
      message: 'Are you sure you want to delete this production item?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.productionItems.removeAt(index);
          }
        }
      ]
    });

    await alert.present();
  }

  // Expense Items
  get expenseItems(): FormArray {
    return this.form.get('dailyExpenseList') as FormArray;
  }

  addExpenseItem() {
    const item = this.fb.group({
      listOfItem: ['', Validators.required],
      qty: [0, [Validators.required, Validators.min(0)]],
      rate: [0, [Validators.required, Validators.min(0)]],
      amount: [{value: 0, disabled: true}, [Validators.required, Validators.min(0)]]
    });

    // Subscribe to qty and rate changes to calculate amount
    const qtyControl = item.get('qty');
    const rateControl = item.get('rate');
    const amountControl = item.get('amount');

    if (qtyControl && rateControl && amountControl) {
      qtyControl.valueChanges.subscribe(() => this.calculateAmount(item));
      rateControl.valueChanges.subscribe(() => this.calculateAmount(item));
      // Calculate initial amount
      this.calculateAmount(item);
    }

    this.expenseItems.push(item);
  }

  async removeExpenseItem(index: number) {
    if (this.expenseItems.length <= 1) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Delete Expense Item',
      message: 'Are you sure you want to delete this expense item?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.expenseItems.removeAt(index);
          }
        }
      ]
    });

    await alert.present();
  }

  // Today Purchases (What buy from today Income)
  get todayPurchases(): FormArray {
    return this.form.get('todayPurchases') as FormArray;
  }

  addTodayPurchase() {
    const item = this.fb.group({
      listOfItem: ['', Validators.required],
      qty: [0, [Validators.required, Validators.min(0)]],
      rate: [0, [Validators.required, Validators.min(0)]],
      amount: [{value: 0, disabled: true}, [Validators.required, Validators.min(0)]]
    });

    // Subscribe to qty and rate changes to calculate amount
    const qtyControl = item.get('qty');
    const rateControl = item.get('rate');
    const amountControl = item.get('amount');

    if (qtyControl && rateControl && amountControl) {
      qtyControl.valueChanges.subscribe(() => this.calculateAmount(item));
      rateControl.valueChanges.subscribe(() => this.calculateAmount(item));
      // Calculate initial amount
      this.calculateAmount(item);
    }

    this.todayPurchases.push(item);
  }

  async removeTodayPurchase(index: number) {
    if (this.todayPurchases.length <= 1) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Delete Purchase Item',
      message: 'Are you sure you want to delete this purchase item?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.todayPurchases.removeAt(index);
          }
        }
      ]
    });

    await alert.present();
  }

  calculateDailyProfit(): { loss: number; profit: number } {
    const formValue = this.form.value;

    // Calculate total production cost
    const totalProductionCost = formValue.production.reduce((sum: number, item: ProductionItem) =>
      sum + (item.amount || 0), 0);

    // Calculate total expenses
    const totalExpenses = formValue.dailyExpenseList.reduce((sum: number, item: ExpenseItem) =>
      sum + (item.amount || 0), 0);

    const dailyIncome = formValue.dailyIncomeAmount.gpay +
                       formValue.dailyIncomeAmount.paytm +
                       formValue.dailyIncomeAmount.cash +
                       formValue.dailyIncomeAmount.onDrawer +
                       formValue.dailyIncomeAmount.onOutsideOrder;

    const totalRevenue = dailyIncome;
    const totalCost = totalProductionCost + totalExpenses;
    const profit = totalRevenue - totalCost;

    return {
      loss: profit < 0 ? Math.abs(profit) : 0,
      profit: profit >= 0 ? profit : 0
    };
  }

  getOnlineTotal(): number {
    const formValue = this.form.value;
    const gpay = formValue.dailyIncomeAmount?.gpay || 0;
    const paytm = formValue.dailyIncomeAmount?.paytm || 0;
    return gpay + paytm;
  }

  getOfflineTotal(): number {
    const formValue = this.form.value;
    const onDrawer = formValue.dailyIncomeAmount?.onDrawer || 0;
    const onOutsideOrder = formValue.dailyIncomeAmount?.onOutsideOrder || 0;
    return onDrawer + onOutsideOrder;
  }

  getOverallIncomeTotal(): number {
    return this.getOnlineTotal() + this.getOfflineTotal();
  }

  getCurrentProfit(): number {
    if (this.isEditMode && this.storedProfit > 0) {
      return this.storedProfit;
    }
    const profitData = this.calculateDailyProfit();
    return profitData.profit;
  }

  getCurrentLoss(): number {
    if (this.isEditMode && this.storedLoss > 0) {
      return this.storedLoss;
    }
    const profitData = this.calculateDailyProfit();
    return profitData.loss;
  }

  getExpectedIncome(): number {
    return this.form.get('expectedIncome')?.value || 0;
  }

  getTotalTodayIncome(): number {
    const formValue = this.form.value;
    const dailyIncome = (formValue.dailyIncomeAmount?.gpay || 0) +
                       (formValue.dailyIncomeAmount?.paytm || 0) +
                       (formValue.dailyIncomeAmount?.cash || 0) +
                       (formValue.dailyIncomeAmount?.onDrawer || 0) +
                       (formValue.dailyIncomeAmount?.onOutsideOrder || 0);
    return dailyIncome;
  }

  getTotalExpense(): number {
    const formValue = this.form.value;

    // Calculate total production cost
    const totalProductionCost = formValue.production?.reduce((sum: number, item: ProductionItem) =>
      sum + (item.amount || 0), 0) || 0;

    // Calculate total expenses
    const totalExpenses = formValue.dailyExpenseList?.reduce((sum: number, item: ExpenseItem) =>
      sum + (item.amount || 0), 0) || 0;

    return totalProductionCost + totalExpenses;
  }

  getProductionCost(): number {
    let total = 0;
    this.productionItems.controls.forEach((control) => {
      const amount = control.get('amount')?.value || 0;
      total += amount;
    });
    return total;
  }

  getDailyExpenses(): number {
    let total = 0;
    this.expenseItems.controls.forEach((control) => {
      const amount = control.get('amount')?.value || 0;
      total += amount;
    });
    return total;
  }

  getPurchaseTotal(): number {
    let total = 0;
    this.todayPurchases.controls.forEach((control) => {
      const amount = control.get('amount')?.value || 0;
      total += amount;
    });
    return total;
  }

  showExpenseDetailsPopover(event: Event) {
    event.stopPropagation();
    this.expensePopoverEvent = event;
    this.isExpensePopoverOpen = true;
  }

  closeExpensePopover() {
    this.isExpensePopoverOpen = false;
    this.expensePopoverEvent = undefined;
  }

  showLossDetailsPopover(event: Event) {
    event.stopPropagation();
    this.lossPopoverEvent = event;
    this.isLossPopoverOpen = true;
  }

  closeLossPopover() {
    this.isLossPopoverOpen = false;
    this.lossPopoverEvent = undefined;
  }

  showProfitDetailsPopover(event: Event) {
    event.stopPropagation();
    this.profitPopoverEvent = event;
    this.isProfitPopoverOpen = true;
  }

  closeProfitPopover() {
    this.isProfitPopoverOpen = false;
    this.profitPopoverEvent = undefined;
  }

  showExpectedDetailsPopover(event: Event) {
    event.stopPropagation();
    this.expectedPopoverEvent = event;
    this.isExpectedPopoverOpen = true;
  }

  closeExpectedPopover() {
    this.isExpectedPopoverOpen = false;
    this.expectedPopoverEvent = undefined;
  }

  showIncomeDetailsPopover(event: Event) {
    event.stopPropagation();
    this.incomePopoverEvent = event;
    this.isIncomePopoverOpen = true;
  }

  closeIncomePopover() {
    this.isIncomePopoverOpen = false;
    this.incomePopoverEvent = undefined;
  }

  getTotalRevenue(): number {
    return this.getTotalTodayIncome();
  }

  getTotalCosts(): number {
    return this.getTotalExpense();
  }

  getGpay(): number {
    return this.form.value.dailyIncomeAmount?.gpay || 0;
  }

  getPaytm(): number {
    return this.form.value.dailyIncomeAmount?.paytm || 0;
  }

  getCash(): number {
    return this.form.value.dailyIncomeAmount?.cash || 0;
  }

  getOnDrawer(): number {
    return this.form.value.dailyIncomeAmount?.onDrawer || 0;
  }

  getOnOutsideOrder(): number {
    return this.form.value.dailyIncomeAmount?.onOutsideOrder || 0;
  }

  async onSubmit() {
    if (this.form.valid) {
      this.isSaving = true;
      const profitData = this.calculateDailyProfit();

      // Get form value including disabled fields
      const formValue = this.form.getRawValue();

      const record: DailyRecord = {
        ...formValue,
        dailyProfit: profitData,
        id: this.recordId || undefined
      };

      try {
        if (this.recordId) {
          await this.storageService.updateRecord(record);
        } else {
          await this.storageService.saveRecord(record);
        }

        // Reload the record to get updated createdAt/updatedAt
        if (this.recordId) {
          const updatedRecord = await this.storageService.getRecordById(this.recordId);
          if (updatedRecord) {
            this.createdAt = updatedRecord.createdAt || null;
            this.updatedAt = updatedRecord.updatedAt || null;
          }
        } else {
          // For new records, get the saved record ID and load dates
          const allRecords = await this.storageService.getAllRecords();
          // Find the record we just saved (most recent one matching date)
          // Since saveRecord unshifts (adds to top), it should be the first one with matching date
          const savedRecord = allRecords.find(r => r.date === record.date);
          if (savedRecord) {
            this.createdAt = savedRecord.createdAt || null;
            this.updatedAt = savedRecord.updatedAt || null;
            this.recordId = savedRecord.id || null;
          }
        }

        this.showToast(
          this.isEditMode ? 'Record updated successfully!' : 'Record saved successfully!',
          'success'
        );
        setTimeout(() => {
          this.navigateToHome();
        }, 500);
      } catch (error) {
        console.error('Error saving record:', error);
        this.showToast('Error saving record', 'danger');
      } finally {
        this.isSaving = false;
      }
    } else {
      this.form.markAllAsTouched();
      this.showToast('Please fill all required fields', 'warning');
    }
  }

  async loadRecord(id: string) {
    const record = await this.storageService.getRecordById(id);
    if (record) {
      // Store the original profit/loss values
      this.storedProfit = record.dailyProfit?.profit || 0;
      this.storedLoss = record.dailyProfit?.loss || 0;

      // Store createdAt and updatedAt
      this.createdAt = record.createdAt || null;
      this.updatedAt = record.updatedAt || null;

      // Clear existing arrays
      while (this.productionItems.length !== 0) {
        this.productionItems.removeAt(0);
      }
      while (this.expenseItems.length !== 0) {
        this.expenseItems.removeAt(0);
      }
      while (this.todayPurchases.length !== 0) {
        this.todayPurchases.removeAt(0);
      }

      // Populate form
      this.form.patchValue({
        date: record.date,
        chains: record.chains,
        expectedIncome: record.expectedIncome,
        dailyIncomeAmount: record.dailyIncomeAmount,
        backMoneyInBag: record.backMoneyInBag,
        todayWasteMaterialList: record.todayWasteMaterialList,
        notes: record.notes
      });

      // Add production items
      record.production.forEach(item => {
        // Calculate rate from existing data if not present (for backward compatibility)
        const rate = item.rate !== undefined ? item.rate : (item.qty > 0 ? item.amount / item.qty : 0);
        const itemGroup = this.fb.group({
          listOfItem: [item.listOfItem, Validators.required],
          qty: [item.qty, [Validators.required, Validators.min(0)]],
          rate: [rate, [Validators.required, Validators.min(0)]],
          amount: [{value: item.amount, disabled: true}, [Validators.required, Validators.min(0)]]
        });

        // Subscribe to qty and rate changes to calculate amount
        const qtyControl = itemGroup.get('qty');
        const rateControl = itemGroup.get('rate');
        if (qtyControl && rateControl) {
          qtyControl.valueChanges.subscribe(() => this.calculateAmount(itemGroup));
          rateControl.valueChanges.subscribe(() => this.calculateAmount(itemGroup));
          // Calculate initial amount
          this.calculateAmount(itemGroup);
        }

        this.productionItems.push(itemGroup);
      });

      // Add expense items
      if (record.dailyExpenseList && record.dailyExpenseList.length > 0) {
        record.dailyExpenseList.forEach((item, index) => {
          // Calculate rate from existing data if not present (for backward compatibility)
          const rate = item.rate !== undefined ? item.rate : (item.qty > 0 ? item.amount / item.qty : 0);
        const itemGroup = this.fb.group({
            listOfItem: [item.listOfItem || '', Validators.required],
            qty: [item.qty || 0, [Validators.required, Validators.min(0)]],
            rate: [rate, [Validators.required, Validators.min(0)]],
            amount: [{value: item.amount || 0, disabled: true}, [Validators.required, Validators.min(0)]]
        });

          // Subscribe to qty and rate changes to calculate amount
          const qtyControl = itemGroup.get('qty');
          const rateControl = itemGroup.get('rate');
          if (qtyControl && rateControl) {
            qtyControl.valueChanges.subscribe(() => this.calculateAmount(itemGroup));
            rateControl.valueChanges.subscribe(() => this.calculateAmount(itemGroup));
            // Calculate initial amount
            this.calculateAmount(itemGroup);
          }

        this.expenseItems.push(itemGroup);
      });
      } else {
        // Ensure at least one empty expense item
        this.addExpenseItem();
      }

      // Add today purchases
        if (record.todayPurchases && record.todayPurchases.length > 0) {
          record.todayPurchases.forEach((item: any) => {
            // Calculate rate from existing data if not present (for backward compatibility)
            const rate = item.rate !== undefined ? item.rate : (item.qty > 0 ? item.amount / item.qty : 0);
            const qty = item.qty !== undefined ? item.qty : 0;
        const itemGroup = this.fb.group({
              listOfItem: [item.listOfItem || '', Validators.required],
              qty: [qty, [Validators.required, Validators.min(0)]],
              rate: [rate, [Validators.required, Validators.min(0)]],
              amount: [{value: item.amount || 0, disabled: true}, [Validators.required, Validators.min(0)]]
        });

            // Subscribe to qty and rate changes to calculate amount
            const qtyControl = itemGroup.get('qty');
            const rateControl = itemGroup.get('rate');
            if (qtyControl && rateControl) {
              qtyControl.valueChanges.subscribe(() => this.calculateAmount(itemGroup));
              rateControl.valueChanges.subscribe(() => this.calculateAmount(itemGroup));
              // Calculate initial amount
              this.calculateAmount(itemGroup);
            }

            this.todayPurchases.push(itemGroup);
          });
        } else {
          this.addTodayPurchase();
        }

        // Use setTimeout to ensure form values are properly set after view update
      // This ensures ion-select components have their options loaded
      setTimeout(() => {
        // Explicitly set values using setValue to ensure ion-select recognizes them
        // Production items
        if (record.production && record.production.length > 0) {
          record.production.forEach((item, index) => {
            if (item.listOfItem && this.productionItems.at(index)) {
              const control = this.productionItems.at(index).get('listOfItem');
              if (control) {
                control.setValue(item.listOfItem, { emitEvent: false });
              }
            }
          });
        }

        // Expense items
        if (record.dailyExpenseList && record.dailyExpenseList.length > 0) {
          record.dailyExpenseList.forEach((item, index) => {
            if (item.listOfItem && this.expenseItems.at(index)) {
              const control = this.expenseItems.at(index).get('listOfItem');
              if (control) {
                control.setValue(item.listOfItem, { emitEvent: false });
              }
            }
          });
        }

        // Purchase items
        if (record.todayPurchases && record.todayPurchases.length > 0) {
          record.todayPurchases.forEach((item, index) => {
            if (item.listOfItem && this.todayPurchases.at(index)) {
              const control = this.todayPurchases.at(index).get('listOfItem');
              if (control) {
                control.setValue(item.listOfItem, { emitEvent: false });
              }
            }
          });
        }

        // Force form to update and recognize the values
        this.form.updateValueAndValidity();
        // Trigger change detection to update the view
        this.cdr.detectChanges();
      }, 400);
    }
  }

  ngAfterViewInit() {
    // If we're in edit mode, ensure values are set after view is initialized
    if (this.isEditMode && this.recordId) {
      const recordId = this.recordId; // Store in local variable to avoid null check issue
      setTimeout(async () => {
        const record = await this.storageService.getRecordById(recordId);
        if (record) {
          // Explicitly set production item values
          if (record.production && record.production.length > 0) {
            record.production.forEach((item: ProductionItem, index: number) => {
              if (item.listOfItem && this.productionItems.at(index)) {
                const control = this.productionItems.at(index).get('listOfItem');
                if (control) {
                  control.setValue(item.listOfItem, { emitEvent: false });
                }
              }
            });
          }

          // Explicitly set expense item values
          if (record.dailyExpenseList && record.dailyExpenseList.length > 0) {
            record.dailyExpenseList.forEach((item: ExpenseItem, index: number) => {
              if (item.listOfItem && this.expenseItems.at(index)) {
                const control = this.expenseItems.at(index).get('listOfItem');
                if (control) {
                  control.setValue(item.listOfItem, { emitEvent: false });
                }
              }
            });
          }

          // Purchase items
          if (record.todayPurchases && record.todayPurchases.length > 0) {
            record.todayPurchases.forEach((item: any, index: number) => {
              if (item.listOfItem && this.todayPurchases.at(index)) {
                const control = this.todayPurchases.at(index).get('listOfItem');
                if (control) {
                  control.setValue(item.listOfItem, { emitEvent: false });
                }
              }
            });
          }

          this.cdr.detectChanges();
        }
      }, 200);
    }
  }

  goToHome() {
    this.navigateToHome();
  }

  getProductionItems() {
    return this.productionItemOptions;
  }

  getExpenseItems() {
    return this.expenseItemOptions;
  }

  getPurchaseItems() {
    return this.purchaseItemOptions;
  }

  async onPurchaseItemSelect(event: any, index: number) {
    const value = event.detail.value;
    if (value === '__CREATE_NEW__') {
      // Reset the select to prevent __CREATE_NEW__ from being saved
      this.todayPurchases.at(index).patchValue({ listOfItem: '' });
      // Open purchase items page to create new item
      // Pass current route as state so we can navigate back
      const navigationExtras: NavigationExtras = {
        state: { returnUrl: this._router.url }
      };
      this._router.navigate(['/purchase-items'], navigationExtras);
    } else {
      // Explicitly set the value to ensure form control updates
      this.todayPurchases.at(index).patchValue({ listOfItem: value });
    }
  }

  async onProductionItemSelect(event: any, index: number) {
    const value = event.detail.value;
    if (value === '__CREATE_NEW__') {
      // Reset the select to prevent __CREATE_NEW__ from being saved
      this.productionItems.at(index).patchValue({ listOfItem: '' });
      // Open production items page to create new item
      // Pass current route as state so we can navigate back
      const navigationExtras: NavigationExtras = {
        state: { returnUrl: this._router.url }
      };
      this._router.navigate(['/production-items'], navigationExtras);
    }
    // For normal selections, the form control will automatically update via formControlName binding
  }

  async onExpenseItemSelect(event: any, index: number) {
    const value = event.detail.value;
    if (value === '__CREATE_NEW__') {
      // Reset the select to prevent __CREATE_NEW__ from being saved
      this.expenseItems.at(index).patchValue({ listOfItem: '' });
      // Open expense items page to create new item
      // Pass current route as state so we can navigate back
      const navigationExtras: NavigationExtras = {
        state: { returnUrl: this._router.url }
      };
      this._router.navigate(['/expense-items'], navigationExtras);
    } else {
      // Explicitly set the value to ensure form control updates
      this.expenseItems.at(index).patchValue({ listOfItem: value });
    }
  }

  private navigateToHome() {
    if (this.isNavigating) {
      return;
    }

    // Check if we're already on the home route
    const currentUrl = this._router.url;
    if (currentUrl === '/home' || currentUrl.startsWith('/home')) {
      return;
    }

    this.isNavigating = true;
    this._router.navigate(['/home'], { replaceUrl: true }).then(() => {
      this.isNavigating = false;
    }).catch((error) => {
      console.error('Navigation error:', error);
      this.isNavigating = false;
    });
  }

  // Select all text on focus
  formatDisplayDate(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateTime(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  selectAllText(event: any) {
    const input = event.target;
    if (input && input.getInputElement) {
      input.getInputElement().then((nativeInput: HTMLInputElement | HTMLTextAreaElement) => {
        if (nativeInput) {
          nativeInput.select();
        }
      });
    }
  }

  // Accordion toggle methods
  toggleProduction() {
    this.isProductionExpanded = !this.isProductionExpanded;
  }

  toggleExpenses() {
    this.isExpensesExpanded = !this.isExpensesExpanded;
  }

  togglePurchase() {
    this.isPurchaseExpanded = !this.isPurchaseExpanded;
  }

  toggleIncomeDetails() {
    this.isIncomeDetailsExpanded = !this.isIncomeDetailsExpanded;
  }

  toggleAdditionalInfo() {
    this.isAdditionalInfoExpanded = !this.isAdditionalInfoExpanded;
  }

  // Show toast notification
  async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color,
      cssClass: `custom-toast toast-${color}`,
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}

