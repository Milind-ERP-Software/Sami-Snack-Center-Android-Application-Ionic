import { Component, OnInit, OnDestroy, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonInput, IonTextarea, IonButton, IonSelect, IonSelectOption, IonPopover, IonModal, IonButtons } from '@ionic/angular/standalone';
import { AlertController, ToastController, Platform } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, trash, save, calendar, arrowBack, documentText, calculator, trendingDown, trendingUp, close, addCircle, wallet, cash, chevronDown, chevronUp, chevronDownOutline, chevronUpOutline, caretDown, caretUp, receipt, business, share } from 'ionicons/icons';
import { StorageService, DailyRecord, ProductionItem, ExpenseItem, IncomeItem } from '../services/storage.service';
import { ExpenseDetailsPopoverComponent } from './expense-details-popover.component';
import { StatDetailsPopoverComponent } from './stat-details-popover.component';
import { MenduwadaIdaliPage } from '../calculations/menduwada-idali/menduwada-idali.page';
import { MenduwadaIdaliRetailPage } from '../calculations/menduwada-idali-retail/menduwada-idali-retail.page';
import { InvoiceTemplateComponent } from './invoice-template/invoice-template.component';
import { InvoiceTemplate1Component } from './invoice-template1/invoice-template1.component';
import { InvoiceTemplate2Component } from './invoice-template2/invoice-template2.component';
import { InvoiceTemplate3Component } from './invoice-template3/invoice-template3.component';
import { InvoiceTemplate4Component } from './invoice-template4/invoice-template4.component';
import { InvoiceTemplate5Component } from './invoice-template5/invoice-template5.component';
import { InvoiceTemplate6Component } from './invoice-template6/invoice-template6.component';
import { ProductionItemsService, ProductionItemOption } from '../services/production-items.service';
import { ExpenseItemsService, ExpenseItemOption } from '../services/expense-items.service';
import { PurchaseItemsService, PurchaseItemOption } from '../services/purchase-items.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

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
    IonModal,
    IonButtons,
    ExpenseDetailsPopoverComponent,
    StatDetailsPopoverComponent,
    MenduwadaIdaliPage,
    MenduwadaIdaliRetailPage,
    InvoiceTemplateComponent,
    InvoiceTemplate1Component,
    InvoiceTemplate2Component,
    InvoiceTemplate3Component,
    InvoiceTemplate4Component,
    InvoiceTemplate5Component,
    InvoiceTemplate6Component
  ],
})
export class DailyFormPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('invoiceTemplate', { read: ElementRef }) invoiceTemplate?: ElementRef;

  form!: FormGroup;
  recordId: string | null = null;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  isSharingInvoice = false;
  storedProfit: number = 0;
  storedLoss: number = 0;
  isNavigating = false;
  createdAt: string | null = null;
  updatedAt: string | null = null;

  // Invoice data for template
  invoiceData: any = null;

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
  isCalculationsModalOpen = false;
  calculationType: 'wholesale' | 'retail' = 'wholesale';
  showWholesaleButton: boolean = false;
  showRetailButton: boolean = true;
  companyName: string = 'Sami Snack Center';

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
    addIcons({ add, trash, save, calendar, arrowBack, documentText, calculator, trendingDown, trendingUp, close, addCircle, wallet, cash, chevronDown, chevronUp, chevronDownOutline, chevronUpOutline, caretDown, caretUp, receipt, business, share });
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

    // Load calculation buttons settings
    this.loadCalculationButtonsSettings();

    // Load company name from storage
    this.loadCompanyName();

    // Subscribe to company name changes
    this.storageService.companyNameChanged.subscribe((name: string) => {
      this.companyName = name || 'Sami Snack Center';
    });

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
      chains: [300, [Validators.required, Validators.min(0)]],
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
    // Calculate profit as: daily income - daily expense
    const dailyIncome = this.getTotalTodayIncome();
    const dailyExpense = this.getTotalExpense();
    const profit = dailyIncome - dailyExpense;

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
                       (formValue.dailyIncomeAmount?.onDrawer || 0) +
                       (formValue.dailyIncomeAmount?.onOutsideOrder || 0);
    return dailyIncome;
  }

  getTotalExpense(): number {
    // Calculate total expenses
    const totalExpenses = this.getDailyExpenses();

    // Calculate total purchases
    const totalPurchases = this.getPurchaseTotal();

    return totalExpenses + totalPurchases;
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

  getProductionItemsForPopover(): ProductionItem[] {
    return this.productionItems.controls.map((control) => {
      const formGroup = control as FormGroup;
      // Use getRawValue() to get disabled field values
      const rawValue = formGroup.getRawValue();

      return {
        listOfItem: rawValue.listOfItem || '',
        qty: rawValue.qty || 0,
        rate: rawValue.rate || 0,
        amount: Number(rawValue.amount) || 0
      };
    }).filter(item => item.listOfItem); // Only return items with a name
  }

  getExpenseItemsForPopover(): ExpenseItem[] {
    return this.expenseItems.controls.map((control) => {
      const formGroup = control as FormGroup;
      // Use getRawValue() to get disabled field values
      const rawValue = formGroup.getRawValue();

      return {
        listOfItem: rawValue.listOfItem || '',
        qty: rawValue.qty || 0,
        rate: rawValue.rate || 0,
        amount: Number(rawValue.amount) || 0
      };
    }).filter(item => item.listOfItem); // Only return items with a name
  }

  getPurchaseItemsForPopover(): any[] {
    return this.todayPurchases.controls.map((control) => {
      const formGroup = control as FormGroup;
      // Use getRawValue() to get disabled field values
      const rawValue = formGroup.getRawValue();

      return {
        listOfItem: rawValue.listOfItem || '',
        qty: rawValue.qty || 0,
        rate: rawValue.rate || 0,
        amount: Number(rawValue.amount) || 0
      };
    }).filter(item => item.listOfItem); // Only return items with a name
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

  async loadCompanyName() {
    try {
      const name = await this.storageService.get('company_name');
      if (name) {
        this.companyName = name;
      }
    } catch (error) {
      console.error('Error loading company name:', error);
    }
  }

  async loadCalculationButtonsSettings() {
    const showWholesale = await this.storageService.get('show_wholesale_button');
    this.showWholesaleButton = showWholesale === 'true'; // Default to false

    const showRetail = await this.storageService.get('show_retail_button');
    this.showRetailButton = showRetail !== 'false'; // Default to true
  }

  openCalculationsModal(type: 'wholesale' | 'retail' = 'wholesale') {
    this.calculationType = type;
    this.isCalculationsModalOpen = true;
  }

  closeCalculationsModal() {
    this.isCalculationsModalOpen = false;
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

  async shareInvoice() {
    if (!this.form.valid) {
      this.showToast('Please fill all required fields before sharing invoice', 'warning');
      return;
    }

    try {
      this.showToast('Generating invoice...', 'success');

      const formValue = this.form.getRawValue();
      const profitData = this.calculateDailyProfit();
      const totalIncome = this.getTotalTodayIncome();
      const totalExpense = this.getTotalExpense();
      const productionCost = this.getProductionCost();

      // Format date
      const date = new Date(formValue.date);
      const dateStr = date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const timeStr = date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // Set invoice data for component
      this.invoiceData = {
        ...formValue,
        totalIncome,
        totalExpense,
        productionCost,
        profitData,
        dateStr,
        timeStr
      };

      // Get selected template from settings
      const selectedTemplate = await this.getSelectedTemplate();

      // Always use HTML string approach for reliable image generation
      // Component approach doesn't work well when hidden off-screen
      const invoiceHTML = this.generateInvoiceHTML(formValue, profitData, totalIncome, totalExpense, productionCost, dateStr, timeStr, selectedTemplate);

      // Create a visible but off-screen container for html2canvas with margins
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = 'position:fixed;left:-10000px;top:0;width:auto;height:auto;z-index:-9999;visibility:visible;opacity:1;background:#ffffff;padding:20px;';

      // Add font imports for templates that need them
      let fontImports = '';
      if (selectedTemplate === 'template2') {
        fontImports = '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap" rel="stylesheet">';
      } else if (selectedTemplate === 'template3' || selectedTemplate === 'template4' || selectedTemplate === 'template5') {
        fontImports = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">';
      }

      // Wrap invoice in a container with margins
      const wrappedHTML = `<div style="margin: 0 auto; padding: 0 20px; background: #ffffff; display: inline-block;">${invoiceHTML}</div>`;
      tempDiv.innerHTML = fontImports + wrappedHTML;
      document.body.appendChild(tempDiv);

      // Find the wrapper div first (the one with padding)
      let wrapperElement = tempDiv.querySelector('div[style*="padding: 0 20px"]') as HTMLElement;

      // Find the actual invoice element (skip link/style tags)
      let invoiceElement: HTMLElement | null = null;

      // Try to find the main invoice div by class or style attribute within wrapper
      if (wrapperElement) {
        invoiceElement = wrapperElement.querySelector('div[style*="width"]') as HTMLElement ||
                        wrapperElement.querySelector('.invoice-container') as HTMLElement ||
                        wrapperElement.querySelector('.receipt') as HTMLElement ||
                        wrapperElement.querySelector('.receipt-container') as HTMLElement;
      }

      // Fallback: search in entire tempDiv
      if (!invoiceElement) {
        invoiceElement = tempDiv.querySelector('div[style*="width"]') as HTMLElement ||
                        tempDiv.querySelector('.invoice-container') as HTMLElement ||
                        tempDiv.querySelector('.receipt') as HTMLElement ||
                        tempDiv.querySelector('.receipt-container') as HTMLElement;
      }

      // If still not found, get first div element (skip link/style tags)
      if (!invoiceElement) {
        let child = tempDiv.firstElementChild;
        while (child) {
          if (child.tagName === 'DIV' && child instanceof HTMLElement && child !== wrapperElement) {
            invoiceElement = child as HTMLElement;
            break;
          }
          child = child.nextElementSibling;
        }
      }

      // Use wrapper element if found, otherwise use invoice element
      const elementToCapture = wrapperElement || invoiceElement;

      // Ensure element exists and has style property
      if (!elementToCapture || !elementToCapture.style) {
        throw new Error('Could not find valid invoice element in generated HTML');
      }

      // Ensure element is properly sized and visible
      elementToCapture.style.cssText = (elementToCapture.style.cssText || '') + 'display:block !important;visibility:visible !important;opacity:1 !important;position:relative !important;';

      // Update invoiceElement reference for later use (for height calculation)
      if (!invoiceElement) {
        invoiceElement = elementToCapture;
      }

      // Wait for fonts and styles to load (increased for proper rendering)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Force layout recalculation to get accurate dimensions
      void invoiceElement.offsetHeight; // Trigger layout

      // Wait a bit more for layout to settle
      await new Promise(resolve => setTimeout(resolve, 200));

      // Get actual dimensions with multiple fallbacks for accurate height
      // Use wrapper element width if available (includes margins), otherwise use invoice element
      const elementWidth = (wrapperElement ? wrapperElement.offsetWidth : invoiceElement.offsetWidth) ||
                          invoiceElement.scrollWidth ||
                          invoiceElement.clientWidth ||
                          460; // Increased default to account for margins

      // Calculate height more accurately - use scrollHeight for full content
      let elementHeight = elementToCapture.scrollHeight || elementToCapture.offsetHeight;

      // If height is still 0 or too small, calculate from content
      if (!elementHeight || elementHeight < 100) {
        const rect = elementToCapture.getBoundingClientRect();
        elementHeight = rect.height || 800;
      }

      // Ensure we capture the full content - use the maximum of all height measurements
      const allHeights = [
        elementToCapture.scrollHeight,
        elementToCapture.offsetHeight,
        elementToCapture.clientHeight,
        elementToCapture.getBoundingClientRect().height
      ].filter(h => h && h > 0);

      if (allHeights.length > 0) {
        elementHeight = Math.max(...allHeights);
      }

      // Add padding to ensure full content is captured (no cropping)
      elementHeight = Math.ceil(elementHeight * 1.15); // Add 15% padding to prevent any cropping

      console.log('Invoice dimensions:', {
        width: elementWidth,
        height: elementHeight,
        scrollHeight: invoiceElement.scrollHeight,
        offsetHeight: invoiceElement.offsetHeight,
        clientHeight: invoiceElement.clientHeight
      });

      // Generate image using html2canvas with optimized HD quality settings
      // Use wrapper element if available to capture margins, otherwise use invoice element
      const canvas = await html2canvas(elementToCapture, {
        backgroundColor: '#ffffff',
        scale: 3, // Increased to 3x for better HD quality
        logging: false,
        useCORS: true,
        allowTaint: false,
        removeContainer: true,
        imageTimeout: 15000, // Increased timeout for font loading
        width: elementWidth,
        height: elementHeight,
        windowWidth: elementWidth,
        windowHeight: elementHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: false,
        proxy: undefined,
        onclone: (clonedDoc, element) => {
          // Find wrapper element first
          const clonedWrapper = clonedDoc.querySelector('div[style*="padding: 0 20px"]') as HTMLElement;

          // Ensure fonts and styles are properly applied in cloned document
          const clonedElement = clonedWrapper ?
                               (clonedWrapper.querySelector('div[style*="width"]') as HTMLElement ||
                                clonedWrapper.querySelector('.invoice-container, .receipt, .receipt-container') as HTMLElement) :
                               (clonedDoc.querySelector('div[style*="width"]') as HTMLElement ||
                                clonedDoc.querySelector('.invoice-container, .receipt, .receipt-container') as HTMLElement ||
                                clonedDoc.querySelector('div') as HTMLElement);

          // Ensure wrapper has proper styling
          if (clonedWrapper) {
            clonedWrapper.style.display = 'block';
            clonedWrapper.style.visibility = 'visible';
            clonedWrapper.style.opacity = '1';
            clonedWrapper.style.background = '#ffffff';
            clonedWrapper.style.margin = '0 auto';
            clonedWrapper.style.padding = '0 20px';
          }

          if (clonedElement) {
            // Copy computed styles
            const computedStyle = getComputedStyle(invoiceElement);
            clonedElement.style.fontFamily = computedStyle.fontFamily || invoiceElement.style.fontFamily || 'Inter, sans-serif';
            clonedElement.style.color = computedStyle.color || '#000';
            clonedElement.style.backgroundColor = computedStyle.backgroundColor || '#fff';
            // Calculate width - if wrapper exists, use wrapper width, otherwise use invoice width
            const invoiceWidth = wrapperElement ? (elementWidth - 40) : elementWidth;
            clonedElement.style.width = invoiceWidth + 'px';
            clonedElement.style.height = 'auto';
            clonedElement.style.minHeight = elementHeight + 'px';
            clonedElement.style.overflow = 'visible';
            clonedElement.style.position = 'relative';
            clonedElement.style.display = 'block';
          }

          // Ensure all child elements have proper styles and visibility
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el: any) => {
            if (el && el.style) {
              el.style.visibility = 'visible';
              el.style.opacity = '1';
              if (el.tagName === 'DIV' || el.tagName === 'SPAN' || el.tagName === 'P' || el.tagName === 'H1' || el.tagName === 'H2') {
                el.style.display = el.style.display || 'block';
              }
            }
          });

          // Ensure body and html have proper dimensions
          const clonedBody = clonedDoc.body;
          if (clonedBody) {
            clonedBody.style.width = elementWidth + 'px';
            clonedBody.style.height = 'auto';
            clonedBody.style.minHeight = elementHeight + 'px';
            clonedBody.style.overflow = 'visible';
            clonedBody.style.margin = '0';
            clonedBody.style.padding = '0';
          }
        }
      });

      // Verify canvas has content
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas is empty or invalid');
      }

      // Convert canvas to data URL with optimized quality (0.90 for good quality with faster processing)
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.90); // JPEG with 90% quality (still HD, faster encoding)

      // Verify image data is valid
      if (!imageDataUrl || imageDataUrl === 'data:,') {
        throw new Error('Failed to generate image data');
      }

      // Clean up temporary div immediately
      if (tempDiv && tempDiv.parentElement === document.body) {
        document.body.removeChild(tempDiv);
      }

      // Share via WhatsApp with image
      await this.shareInvoiceImage(imageDataUrl, dateStr, totalIncome);
    } catch (error) {
      console.error('Error generating invoice:', error);
      this.showToast('Failed to generate invoice', 'danger');
    } finally {
      this.isSharingInvoice = false;
    }
  }

  async getSelectedTemplate(): Promise<string> {
    const template = await this.storageService.get('invoice_template');
    return template || 'template1'; // Default to template1
  }

  generateInvoiceHTML(formValue: any, profitData: any, totalIncome: number, totalExpense: number, productionCost: number, dateStr: string, timeStr: string, templateType: string = 'template1'): string {
    switch(templateType) {
      case 'template2':
        return this.generateTemplate2(formValue, profitData, totalIncome, totalExpense, productionCost, dateStr, timeStr);
      case 'template3':
        return this.generateTemplate3(formValue, profitData, totalIncome, totalExpense, productionCost, dateStr, timeStr);
      case 'template4':
        return this.generateTemplate4(formValue, profitData, totalIncome, totalExpense, productionCost, dateStr, timeStr);
      case 'template5':
        return this.generateTemplate5(formValue, profitData, totalIncome, totalExpense, productionCost, dateStr, timeStr);
      case 'template6':
        return this.generateTemplate6(formValue, profitData, totalIncome, totalExpense, productionCost, dateStr, timeStr);
      default:
        return this.generateTemplate1(formValue, profitData, totalIncome, totalExpense, productionCost, dateStr, timeStr);
    }
  }

  generateTemplate1(formValue: any, profitData: any, totalIncome: number, totalExpense: number, productionCost: number, dateStr: string, timeStr: string): string {
    // Convert date and time to uppercase format like component
    const dateUpper = dateStr.toUpperCase();
    const timeUpper = timeStr.toUpperCase();

    return `
      <div class="invoice-container" style="width: 420px !important; background: #ffffff !important; padding: 0 !important; border-radius: 0 !important; box-shadow: none !important; overflow: visible !important; border: none !important; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important; color: #000 !important; margin: 0 auto !important; display: block !important;">
        <div class="header" style="background: #1e272e !important; color: white !important; padding: 30px 20px !important; text-align: center !important;">
          <h1 style="margin: 0 !important; font-size: 22px !important; letter-spacing: 1px !important; text-transform: uppercase !important; color: white !important;">${this.companyName.toUpperCase()}</h1>
          <p style="margin: 5px 0 0 !important; font-size: 12px !important; opacity: 0.7 !important; letter-spacing: 2px !important; color: white !important;">Business Tracker</p>
        </div>
        <div class="content" style="padding: 25px !important;">
          <div class="date-row" style="display: flex !important; justify-content: space-between !important; font-size: 11px !important; color: #7f8c8d !important; font-weight: 700 !important; margin-bottom: 25px !important; text-transform: uppercase !important;">
            <span style="color: #7f8c8d !important;">${dateUpper}</span>
            <span style="color: #7f8c8d !important;">${timeUpper}</span>
          </div>
          <div class="section-title" style="font-size: 13px !important; font-weight: 800 !important; color: #1e272e !important; margin-bottom: 15px !important; border-bottom: 2px solid #f0f0f0 !important; padding-bottom: 5px !important; display: inline-block !important;">Revenue & Expenses</div>
          <div class="data-row" style="display: flex !important; justify-content: space-between !important; margin-bottom: 12px !important; font-size: 14px !important;">
            <span class="label" style="color: #555 !important;">Total Income</span>
            <span class="val income" style="font-weight: 700 !important; color: #218c74 !important;">₹${totalIncome.toFixed(2)}</span>
          </div>
          <div class="data-row" style="display: flex !important; justify-content: space-between !important; margin-bottom: 12px !important; font-size: 14px !important;">
            <span class="label" style="color: #555 !important;">Production Cost</span>
            <span class="val" style="font-weight: 700 !important; color: #1e272e !important;">₹${productionCost.toFixed(2)}</span>
          </div>
          ${formValue.chains ? `
          <div class="data-row" style="display: flex !important; justify-content: space-between !important; margin-bottom: 12px !important; font-size: 14px !important;">
            <span class="label" style="color: #555 !important;">Chains / Misc</span>
            <span class="val" style="font-weight: 700 !important; color: #1e272e !important;">₹${(formValue.chains || 0).toFixed(2)}</span>
          </div>
          ` : ''}
          ${formValue.backMoneyInBag ? `
          <div class="data-row" style="display: flex !important; justify-content: space-between !important; margin-bottom: 12px !important; font-size: 14px !important;">
            <span class="label" style="color: #555 !important;">Back Money</span>
            <span class="val" style="font-weight: 700 !important; color: #1e272e !important;">₹${(formValue.backMoneyInBag || 0).toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="divider" style="height: 1px !important; background: #eee !important; margin: 20px 0 !important;"></div>
          <div class="profit-card" style="background: ${profitData.profit > 0 ? '#f1f9f7' : '#fef2f2'} !important; border-radius: 12px !important; padding: 20px !important; text-align: center !important; border: 1px solid ${profitData.profit > 0 ? '#d1e8e2' : '#fee2e2'} !important;">
            <span style="display: block !important; font-size: 11px !important; font-weight: 700 !important; color: ${profitData.profit > 0 ? '#218c74' : '#e74c3c'} !important; margin-bottom: 5px !important; letter-spacing: 1px !important;">${profitData.profit > 0 ? 'TOTAL DAILY PROFIT' : 'TOTAL DAILY LOSS'}</span>
            <h2 style="margin: 0 !important; font-size: 36px !important; color: ${profitData.profit > 0 ? '#218c74' : '#e74c3c'} !important; font-weight: 800 !important;">₹${(profitData.profit > 0 ? profitData.profit : profitData.loss).toFixed(2)}</h2>
          </div>
          ${formValue.notes ? `
          <div class="notes" style="margin-top: 20px !important; font-size: 12px !important; color: #7f8c8d !important; background: #f9f9f9 !important; padding: 10px !important; border-radius: 8px !important; border-left: 4px solid #ddd !important;">
            <strong style="color: #1e272e !important;">Note:</strong> ${formValue.notes}
          </div>
          ` : ''}
        </div>
        <div class="footer-tag" style="text-align: center !important; padding: 20px !important; font-size: 10px !important; color: #bbb !important; letter-spacing: 1px !important; display: block !important; visibility: visible !important; opacity: 1 !important;">POWERED BY ${this.companyName.toUpperCase()} APP</div>
      </div>
    `;
  }

  generateTemplate2(formValue: any, profitData: any, totalIncome: number, totalExpense: number, productionCost: number, dateStr: string, timeStr: string): string {
    return `
      <div class="receipt" style="width: 420px !important; background: #ffffff !important; padding: 45px !important; border-radius: 0 !important; box-shadow: none !important; color: #1a1a1a !important; font-family: 'Outfit', sans-serif !important; display: block !important; overflow: visible !important; margin: 0 auto !important; border: none !important;">
        <div class="brand-section" style="text-align: center !important; margin-bottom: 35px !important;">
          <h1 style="font-size: 26px !important; font-weight: 700 !important; margin: 0 !important; letter-spacing: -0.5px !important; color: #000 !important;">Sami Snack Center</h1>
          <p style="font-size: 13px !important; color: #777 !important; margin: 5px 0 0 0 !important; text-transform: uppercase !important; letter-spacing: 1px !important;">Daily Business Summary</p>
          <div class="meta-info" style="font-size: 12px !important; color: #999 !important; margin-top: 10px !important; display: flex !important; justify-content: center !important; gap: 10px !important;">
            <span style="color: #999 !important;">${dateStr}</span>
            <span style="color: #999 !important;">•</span>
            <span style="color: #999 !important;">${timeStr}</span>
          </div>
        </div>
        <div class="hr-line" style="border-top: 1.5px solid #f0f0f0 !important; margin: 25px 0 !important;"></div>
        <div class="details-grid" style="margin-bottom: 25px !important;">
          <div class="entry" style="display: flex !important; justify-content: space-between !important; margin-bottom: 14px !important; font-size: 15px !important;">
            <span class="entry-label" style="color: #666 !important; font-weight: 400 !important;">Total Income</span>
            <span class="entry-value" style="color: #1a1a1a !important; font-weight: 600 !important;">₹${totalIncome.toFixed(2)}</span>
          </div>
          <div class="entry" style="display: flex !important; justify-content: space-between !important; margin-bottom: 14px !important; font-size: 15px !important;">
            <span class="entry-label" style="color: #666 !important; font-weight: 400 !important;">Total Expense</span>
            <span class="entry-value" style="color: #1a1a1a !important; font-weight: 600 !important;">₹${totalExpense.toFixed(2)}</span>
          </div>
          <div class="entry" style="display: flex !important; justify-content: space-between !important; margin-bottom: 14px !important; font-size: 15px !important;">
            <span class="entry-label" style="color: #666 !important; font-weight: 400 !important;">Production Cost</span>
            <span class="entry-value" style="color: #1a1a1a !important; font-weight: 600 !important;">₹${productionCost.toFixed(2)}</span>
          </div>
          ${formValue.chains ? `
          <div class="entry" style="display: flex !important; justify-content: space-between !important; margin-bottom: 14px !important; font-size: 15px !important;">
            <span class="entry-label" style="color: #666 !important; font-weight: 400 !important;">Chains</span>
            <span class="entry-value" style="color: #1a1a1a !important; font-weight: 600 !important;">₹${(formValue.chains || 0).toFixed(2)}</span>
          </div>
          ` : ''}
          ${formValue.backMoneyInBag ? `
          <div class="entry" style="display: flex !important; justify-content: space-between !important; margin-bottom: 14px !important; font-size: 15px !important;">
            <span class="entry-label" style="color: #666 !important; font-weight: 400 !important;">Back Money</span>
            <span class="entry-value" style="color: #1a1a1a !important; font-weight: 600 !important;">₹${(formValue.backMoneyInBag || 0).toFixed(2)}</span>
          </div>
          ` : ''}
        </div>
        <div class="profit-container" style="background: ${profitData.profit > 0 ? 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'} !important; padding: 20px !important; border-radius: 12px !important; display: flex !important; justify-content: space-between !important; align-items: center !important; border: 1px solid ${profitData.profit > 0 ? '#e2e8f0' : '#fecaca'} !important; margin-bottom: 25px !important;">
          <span class="profit-label" style="font-size: 14px !important; font-weight: 700 !important; color: ${profitData.profit > 0 ? '#475569' : '#991b1b'} !important; text-transform: uppercase !important;">${profitData.profit > 0 ? 'Total Profit' : 'Total Loss'}</span>
          <span class="profit-amount" style="font-size: 22px !important; font-weight: 800 !important; color: ${profitData.profit > 0 ? '#0f172a' : '#dc2626'} !important;">₹${(profitData.profit > 0 ? profitData.profit : profitData.loss).toFixed(2)}</span>
        </div>
        <div class="footer-note" style="text-align: center !important; margin-top: 35px !important; display: block !important; visibility: visible !important; opacity: 1 !important;">
          ${formValue.notes ? `
          <div class="note-box" style="font-size: 13px !important; background: #fff9f0 !important; color: #9a6d1f !important; padding: 8px !important; border-radius: 6px !important; margin-bottom: 20px !important; display: inline-block !important; width: 100% !important;">
            <strong style="color: #9a6d1f !important;">Note:</strong> ${formValue.notes}
          </div>
          ` : ''}
          <div class="thanks-msg" style="font-size: 13px !important; color: #aaa !important; font-weight: 400 !important;">Thank you for your business!</div>
        </div>
      </div>
    `;
  }

  generateTemplate3(formValue: any, profitData: any, totalIncome: number, totalExpense: number, productionCost: number, dateStr: string, timeStr: string): string {
    return `
      <div class="receipt-container" style="width: 400px !important; background-color: #ffffff !important; padding: 55px 45px !important; box-shadow: none !important; position: relative !important; font-family: 'Inter', sans-serif !important; color: #000 !important; display: block !important; overflow: visible !important; margin: 0 auto !important; border: none !important;">
        <div class="header" style="text-align: center !important; margin-bottom: 40px !important;">
          <h1 style="font-size: 24px !important; font-weight: 700 !important; margin: 0 !important; letter-spacing: 1.5px !important; color: #000 !important; text-transform: uppercase !important;">${this.companyName.toUpperCase()}</h1>
          <div class="subtitle" style="font-size: 13px !important; font-weight: 400 !important; color: #555 !important; margin-top: 10px !important; text-transform: uppercase !important; letter-spacing: 1px !important;">Daily Summary Invoice</div>
          <div class="date-time" style="font-size: 13px !important; color: #333 !important; margin-top: 5px !important;">${dateStr} • ${timeStr}</div>
        </div>
        <div class="divider" style="border-top: 1px dashed #ccc !important; margin: 20px 0 !important;"></div>
        <div class="data-section" style="margin-bottom: 30px !important;">
          <div class="row bold-text" style="display: flex !important; justify-content: space-between !important; padding: 8px 0 !important; font-size: 15px !important; font-weight: 600 !important; color: #000 !important;">
            <span style="color: #000 !important;">Total Income</span>
            <span style="color: #000 !important;">₹${totalIncome.toFixed(2)}</span>
          </div>
          <div class="row" style="display: flex !important; justify-content: space-between !important; padding: 8px 0 !important; font-size: 15px !important; color: #333 !important;">
            <span style="color: #333 !important;">Total Expense</span>
            <span style="color: #333 !important;">₹${totalExpense.toFixed(2)}</span>
          </div>
          <div class="row" style="display: flex !important; justify-content: space-between !important; padding: 8px 0 !important; font-size: 15px !important; color: #333 !important;">
            <span style="color: #333 !important;">Production Cost</span>
            <span style="color: #333 !important;">₹${productionCost.toFixed(2)}</span>
          </div>
          ${formValue.chains ? `
          <div class="row" style="display: flex !important; justify-content: space-between !important; padding: 8px 0 !important; font-size: 15px !important; color: #333 !important;">
            <span style="color: #333 !important;">Chains</span>
            <span style="color: #333 !important;">₹${(formValue.chains || 0).toFixed(2)}</span>
          </div>
          ` : ''}
          ${formValue.backMoneyInBag ? `
          <div class="row" style="display: flex !important; justify-content: space-between !important; padding: 8px 0 !important; font-size: 15px !important; color: #333 !important;">
            <span style="color: #333 !important;">Back Money</span>
            <span style="color: #333 !important;">₹${(formValue.backMoneyInBag || 0).toFixed(2)}</span>
          </div>
          ` : ''}
        </div>
        <div class="total-profit-row" style="background-color: ${profitData.profit > 0 ? '#dee7ef' : '#fee2e2'} !important; display: flex !important; justify-content: space-between !important; padding: 12px 15px !important; margin: 25px 0 !important; border-top: 1px dashed ${profitData.profit > 0 ? '#9fb1c1' : '#fecaca'} !important; border-bottom: 1px dashed ${profitData.profit > 0 ? '#9fb1c1' : '#fecaca'} !important;">
          <span style="font-size: 18px !important; font-weight: 800 !important; letter-spacing: 1px !important; color: ${profitData.profit > 0 ? '#213547' : '#991b1b'} !important; text-transform: uppercase !important;">${profitData.profit > 0 ? 'Total Profit' : 'Total Loss'}</span>
          <span style="font-size: 18px !important; font-weight: 800 !important; letter-spacing: 1px !important; color: ${profitData.profit > 0 ? '#213547' : '#991b1b'} !important; text-transform: uppercase !important;">₹${(profitData.profit > 0 ? profitData.profit : profitData.loss).toFixed(2)}</span>
        </div>
        <div class="footer" style="text-align: center !important; font-size: 13px !important; color: #444 !important; line-height: 1.6 !important; display: block !important; visibility: visible !important; opacity: 1 !important;">
          ${formValue.notes ? `
          <div style="color: #444 !important; margin-bottom: 10px !important;">Notes: ${formValue.notes}</div>
          ` : ''}
          <div style="color: #444 !important;">Thank you and see you again!</div>
          <div class="stars" style="letter-spacing: 8px !important; color: #999 !important; margin-top: 15px !important; font-size: 12px !important;">***</div>
        </div>
      </div>
    `;
  }

  generateTemplate4(formValue: any, profitData: any, totalIncome: number, totalExpense: number, productionCost: number, dateStr: string, timeStr: string): string {
    return `
      <div class="receipt" style="width: 380px !important; background: #fff !important; padding: 38px 32px !important; border-radius: 0 !important; box-shadow: none !important; font-family: 'Inter', sans-serif !important; color: #000 !important; display: block !important; overflow: visible !important; margin: 0 auto !important; border: none !important;">
        <div class="header" style="text-align: center !important; margin-bottom: 24px !important;">
          <h1 style="font-size: 20px !important; font-weight: 600 !important; margin: 0 !important; color: #000 !important;">${this.companyName}</h1>
          <p style="font-size: 13px !important; color: #666 !important; margin: 6px 0 0 !important;">Daily Summary • ${dateStr}, ${timeStr}</p>
        </div>
        <div class="divider" style="border-top: 1px solid #eee !important; margin: 20px 0 !important;"></div>
        <div class="row" style="display: flex !important; justify-content: space-between !important; font-size: 14px !important; padding: 6px 0 !important; color: #333 !important;">
          <strong style="font-weight: 600 !important; color: #000 !important;">Total Income</strong>
          <span style="color: #333 !important;">₹${totalIncome.toFixed(2)}</span>
        </div>
        <div class="row" style="display: flex !important; justify-content: space-between !important; font-size: 14px !important; padding: 6px 0 !important; color: #333 !important;">
          <span style="color: #333 !important;">Total Expense</span>
          <span style="color: #333 !important;">₹${totalExpense.toFixed(2)}</span>
        </div>
        <div class="row" style="display: flex !important; justify-content: space-between !important; font-size: 14px !important; padding: 6px 0 !important; color: #333 !important;">
          <span style="color: #333 !important;">Production Cost</span>
          <span style="color: #333 !important;">₹${productionCost.toFixed(2)}</span>
        </div>
        ${formValue.chains ? `
        <div class="row" style="display: flex !important; justify-content: space-between !important; font-size: 14px !important; padding: 6px 0 !important; color: #333 !important;">
          <span style="color: #333 !important;">Chains</span>
          <span style="color: #333 !important;">₹${(formValue.chains || 0).toFixed(2)}</span>
        </div>
        ` : ''}
        ${formValue.backMoneyInBag ? `
        <div class="row" style="display: flex !important; justify-content: space-between !important; font-size: 14px !important; padding: 6px 0 !important; color: #333 !important;">
          <span style="color: #333 !important;">Back Money</span>
          <span style="color: #333 !important;">₹${(formValue.backMoneyInBag || 0).toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="total" style="background: ${profitData.profit > 0 ? '#eef4ff' : '#fee2e2'} !important; padding: 12px 14px !important; margin: 20px 0 !important; border-radius: 6px !important; display: flex !important; justify-content: space-between !important; font-weight: 600 !important; color: ${profitData.profit > 0 ? '#1f3a5f' : '#991b1b'} !important;">
          <span style="color: ${profitData.profit > 0 ? '#1f3a5f' : '#991b1b'} !important;">${profitData.profit > 0 ? 'Total Profit' : 'Total Loss'}</span>
          <span style="color: ${profitData.profit > 0 ? '#1f3a5f' : '#991b1b'} !important;">₹${(profitData.profit > 0 ? profitData.profit : profitData.loss).toFixed(2)}</span>
        </div>
        <div class="footer" style="text-align: center !important; font-size: 12px !important; color: #777 !important; margin-top: 20px !important; display: block !important; visibility: visible !important; opacity: 1 !important;">
          ${formValue.notes ? `<div style="color: #777 !important; margin-bottom: 8px !important;">${formValue.notes}</div>` : ''}
          <div style="color: #777 !important;">Thank you 😊</div>
        </div>
      </div>
    `;
  }

  generateTemplate5(formValue: any, profitData: any, totalIncome: number, totalExpense: number, productionCost: number, dateStr: string, timeStr: string): string {
    return `
      <div class="receipt" style="width: 340px !important; background: #fff !important; padding: 28px !important; border: none !important; font-family: 'Inter', sans-serif !important; color: #000 !important; display: block !important; overflow: visible !important; margin: 0 auto !important; box-shadow: none !important;">
        <div class="header" style="text-align: center !important; margin-bottom: 16px !important;">
          <h1 style="font-size: 16px !important; font-weight: 500 !important; margin: 0 !important; color: #000 !important;">${this.companyName}</h1>
          <p style="font-size: 12px !important; color: #777 !important; margin-top: 4px !important;">${dateStr} · ${timeStr}</p>
        </div>
        <div class="divider" style="border-top: 1px dashed #ddd !important; margin: 14px 0 !important;"></div>
        <div class="row" style="display: flex !important; justify-content: space-between !important; font-size: 13px !important; padding: 4px 0 !important; color: #333 !important;">
          <span style="color: #333 !important;">Total Income</span>
          <span style="color: #333 !important;">₹${totalIncome.toFixed(2)}</span>
        </div>
        <div class="row" style="display: flex !important; justify-content: space-between !important; font-size: 13px !important; padding: 4px 0 !important; color: #333 !important;">
          <span style="color: #333 !important;">Total Expense</span>
          <span style="color: #333 !important;">₹${totalExpense.toFixed(2)}</span>
        </div>
        <div class="row" style="display: flex !important; justify-content: space-between !important; font-size: 13px !important; padding: 4px 0 !important; color: #333 !important;">
          <span style="color: #333 !important;">Production Cost</span>
          <span style="color: #333 !important;">₹${productionCost.toFixed(2)}</span>
        </div>
        ${formValue.chains ? `
        <div class="row" style="display: flex !important; justify-content: space-between !important; font-size: 13px !important; padding: 4px 0 !important; color: #333 !important;">
          <span style="color: #333 !important;">Chains</span>
          <span style="color: #333 !important;">₹${(formValue.chains || 0).toFixed(2)}</span>
        </div>
        ` : ''}
        ${formValue.backMoneyInBag ? `
        <div class="row" style="display: flex !important; justify-content: space-between !important; font-size: 13px !important; padding: 4px 0 !important; color: #333 !important;">
          <span style="color: #333 !important;">Back Money</span>
          <span style="color: #333 !important;">₹${(formValue.backMoneyInBag || 0).toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="row total" style="margin-top: 10px !important; padding-top: 8px !important; border-top: 1px solid #ddd !important; font-weight: 500 !important; display: flex !important; justify-content: space-between !important; font-size: 13px !important; color: ${profitData.profit > 0 ? '#333' : '#dc2626'} !important;">
          <span style="color: ${profitData.profit > 0 ? '#333' : '#dc2626'} !important;">${profitData.profit > 0 ? 'Total Profit' : 'Total Loss'}</span>
          <span style="color: ${profitData.profit > 0 ? '#333' : '#dc2626'} !important;">₹${(profitData.profit > 0 ? profitData.profit : profitData.loss).toFixed(2)}</span>
        </div>
        <div class="footer" style="text-align: center !important; font-size: 11px !important; color: #777 !important; margin-top: 16px !important; display: block !important; visibility: visible !important; opacity: 1 !important;">
          ${formValue.notes ? `<div style="color: #777 !important; margin-bottom: 8px !important;">${formValue.notes}</div>` : ''}
          <div style="color: #777 !important;">Thank you</div>
        </div>
      </div>
    `;
  }

  generateTemplate6(formValue: any, profitData: any, totalIncome: number, totalExpense: number, productionCost: number, dateStr: string, timeStr: string): string {
    return `
      <div class="invoice-container" style="width: 460px !important; background: #ffffff !important; transform: rotate(2deg) !important; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important; border-radius: 8px !important; padding: 32px !important; font-family: system-ui, -apple-system, sans-serif !important; color: #000 !important; position: relative !important; margin: 0 auto !important; display: block !important; overflow: visible !important;">
        <div class="header" style="text-align: center !important; margin-bottom: 24px !important;">
          <div class="header-content" style="display: flex !important; align-items: center !important; justify-content: center !important; gap: 12px !important; margin-bottom: 8px !important;">
            <div class="emoji" style="font-size: 48px !important; line-height: 1 !important;">🌯</div>
            <h1 style="font-size: 28px !important; font-weight: bold !important; margin: 0 !important; color: #000 !important;">${this.companyName.toUpperCase()}</h1>
          </div>
          <p class="subtitle" style="font-size: 18px !important; font-weight: 500 !important; margin: 8px 0 !important; color: #000 !important;">Business Tracker Summary</p>
          <p class="date-time" style="font-size: 14px !important; color: #666 !important; margin-top: 12px !important;">Date: ${dateStr} | Time: ${timeStr}</p>
        </div>
        <div class="divider" style="border-top: 2px dashed #d1d5db !important; margin: 16px 0 !important;"></div>
        <div class="section" style="margin-bottom: 24px !important;">
          <div class="section-header-bar" style="display: table !important; width: 100% !important; margin-bottom: 12px !important; background: #1e3a8a !important; padding: 0 !important; border-radius: 6px !important; box-sizing: border-box !important;">
            <div style="display: table-cell !important; vertical-align: middle !important; padding: 14px 16px !important;">
              <div style="display: flex !important; align-items: center !important; gap: 10px !important;">
                <span class="emoji" style="font-size: 24px !important; line-height: 1 !important; display: inline-block !important; vertical-align: middle !important; margin: 0 !important; padding: 0 !important;">💰</span>
                <h2 style="font-size: 18px !important; font-weight: bold !important; margin: 0 !important; padding: 0 !important; color: #ffffff !important; line-height: 1.2 !important; display: inline-block !important; vertical-align: middle !important;">Revenue Details</h2>
              </div>
            </div>
          </div>
          <div class="data-row" style="display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 1px solid #e5e7eb !important; padding-bottom: 8px !important;">
            <span class="label" style="font-weight: 500 !important; color: #000 !important;">Total Income</span>
            <span class="value" style="font-weight: bold !important; font-size: 18px !important; color: #000 !important;">₹${totalIncome.toFixed(2)}</span>
          </div>
        </div>
        <div class="divider" style="border-top: 2px dashed #d1d5db !important; margin: 16px 0 !important;"></div>
        <div class="section" style="margin-bottom: 24px !important;">
          <div class="section-header-bar" style="display: table !important; width: 100% !important; margin-bottom: 12px !important; position: relative !important; background: #1e3a8a !important; padding: 0 !important; border-radius: 6px !important; box-sizing: border-box !important;">
            <div style="display: table-cell !important; vertical-align: middle !important; padding: 14px 16px !important;">
              <div style="display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 10px !important;">
                <div style="display: flex !important; align-items: center !important; gap: 10px !important;">
                  <span class="emoji" style="font-size: 24px !important; line-height: 1 !important; display: inline-block !important; vertical-align: middle !important; margin: 0 !important; padding: 0 !important;">💵</span>
                  <h2 style="font-size: 18px !important; font-weight: bold !important; margin: 0 !important; padding: 0 !important; color: #ffffff !important; line-height: 1.2 !important; display: inline-block !important; vertical-align: middle !important;">Expenditure Breakdown</h2>
                </div>
                <span class="emoji-right" style="font-size: 24px !important; color: #10b981 !important; line-height: 1 !important; display: inline-block !important; vertical-align: middle !important; margin: 0 !important; padding: 0 !important;">💲</span>
              </div>
            </div>
          </div>
          <div class="data-list" style="display: flex !important; flex-direction: column !important; gap: 12px !important;">
            <div class="data-row" style="display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 1px solid #e5e7eb !important; padding-bottom: 8px !important;">
              <span class="label" style="font-weight: 500 !important; color: #000 !important;">Total Expense</span>
              <span class="value" style="font-weight: bold !important; font-size: 18px !important; color: #000 !important;">₹${totalExpense.toFixed(2)}</span>
            </div>
            <div class="data-row" style="display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 1px solid #e5e7eb !important; padding-bottom: 8px !important;">
              <span class="label" style="font-weight: 500 !important; color: #000 !important;">Production Cost</span>
              <span class="value" style="font-weight: bold !important; font-size: 18px !important; color: #000 !important;">₹${productionCost.toFixed(2)}</span>
            </div>
            ${formValue.chains ? `
            <div class="data-row" style="display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 1px solid #e5e7eb !important; padding-bottom: 8px !important;">
              <span class="label" style="font-weight: 500 !important; color: #000 !important;">Chains</span>
              <span class="value" style="font-weight: bold !important; font-size: 18px !important; color: #000 !important;">₹${(formValue.chains || 0).toFixed(2)}</span>
            </div>
            ` : ''}
            ${formValue.backMoneyInBag ? `
            <div class="data-row" style="display: flex !important; justify-content: space-between !important; align-items: center !important; border-bottom: 1px solid #e5e7eb !important; padding-bottom: 8px !important;">
              <span class="label" style="font-weight: 500 !important; color: #000 !important;">Back Money</span>
              <span class="value" style="font-weight: bold !important; font-size: 18px !important; color: #000 !important;">₹${(formValue.backMoneyInBag || 0).toFixed(2)}</span>
            </div>
            ` : ''}
          </div>
        </div>
        <div class="divider" style="border-top: 2px dashed #d1d5db !important; margin: 16px 0 !important;"></div>
        <div class="summary-section" style="text-align: center !important;">
          <div class="summary-header-bar" style="display: table !important; width: 100% !important; margin-bottom: 12px !important; background: #6b7280 !important; padding: 0 !important; border-radius: 6px !important; box-sizing: border-box !important;">
            <div style="display: table-cell !important; vertical-align: middle !important; padding: 14px 16px !important; text-align: center !important;">
              <div style="display: inline-flex !important; align-items: center !important; gap: 10px !important;">
                <span class="emoji" style="font-size: 24px !important; line-height: 1 !important; display: inline-block !important; vertical-align: middle !important; margin: 0 !important; padding: 0 !important;">📈</span>
                <h2 style="font-size: 18px !important; font-weight: bold !important; margin: 0 !important; padding: 0 !important; color: #ffffff !important; line-height: 1.2 !important; display: inline-block !important; vertical-align: middle !important;">Daily Summary</h2>
              </div>
            </div>
          </div>
          <p class="summary-label" style="font-size: 20px !important; font-weight: bold !important; margin: 8px 0 !important; color: #000 !important;">TOTAL ${profitData.profit > 0 ? 'PROFIT' : 'LOSS'}:</p>
          <p class="summary-amount" style="font-size: 60px !important; font-weight: bold !important; color: ${profitData.profit > 0 ? '#10b981' : '#ef4444'} !important; margin: 16px 0 !important;">₹${(profitData.profit > 0 ? profitData.profit : profitData.loss).toFixed(2)}</p>
          ${formValue.notes ? `
          <p class="notes" style="font-size: 14px !important; color: #374151 !important; margin: 8px 0 !important;">
            Notes: <span class="notes-text" style="font-style: italic !important;">${formValue.notes}</span>
          </p>
          ` : ''}
          <p class="footer-text" style="font-size: 12px !important; color: #6b7280 !important; font-style: italic !important; margin-top: 8px !important;">Powered by ${this.companyName} Business Tracker</p>
        </div>
      </div>
    `;
  }

  // Old method - keeping for reference but not using HTML string anymore
  async shareInvoiceOld() {
    if (!this.form.valid) {
      this.showToast('Please fill all required fields before sharing invoice', 'warning');
      return;
    }

    try {
      this.showToast('Generating invoice...', 'success');

      const formValue = this.form.getRawValue();
      const profitData = this.calculateDailyProfit();
      const totalIncome = this.getTotalTodayIncome();
      const totalExpense = this.getTotalExpense();
      const productionCost = this.getProductionCost();

      // Format date
      const date = new Date(formValue.date);
      const dateStr = date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const timeStr = date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // Create invoice HTML
      const invoiceHTML = `
        <div style="
          width: 400px;
          background: white;
          border: 3px solid #00BAF2;
          border-radius: 12px;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        ">
          <!-- Header with wavy top -->
          <div style="
            background: linear-gradient(135deg, #00BAF2 0%, #0066CC 100%);
            margin: -20px -20px 20px -20px;
            padding: 25px 20px;
            border-radius: 9px 9px 0 0;
            text-align: center;
          ">
            <div style="
              color: white;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 5px;
            ">${this.companyName}</div>
            <div style="
              color: rgba(255,255,255,0.9);
              font-size: 16px;
              font-weight: 500;
            ">Daily Business Invoice</div>
          </div>

          <!-- Success Message -->
          <div style="
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background: #f0fdf4;
            border-radius: 8px;
            border: 2px solid #10b981;
          ">
            <div style="
              font-size: 20px;
              font-weight: bold;
              color: #10b981;
              margin-bottom: 5px;
            ">✓ Record Saved Successfully</div>
            <div style="
              font-size: 32px;
              font-weight: bold;
              color: #1f2937;
              margin-top: 10px;
            ">₹${totalIncome.toFixed(2)}</div>
          </div>

          <!-- Details Section -->
          <div style="margin: 20px 0;">
            <div style="
              border-bottom: 2px dotted #e5e7eb;
              padding: 15px 0;
              margin-bottom: 15px;
            ">
              <div style="
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 8px;
              ">Date & Time</div>
              <div style="
                font-size: 16px;
                font-weight: bold;
                color: #1f2937;
              ">${dateStr}, ${timeStr}</div>
            </div>

            <div style="
              border-bottom: 2px dotted #e5e7eb;
              padding: 15px 0;
              margin-bottom: 15px;
            ">
              <div style="
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 8px;
              ">Total Income</div>
              <div style="
                font-size: 20px;
                font-weight: bold;
                color: #10b981;
              ">₹${totalIncome.toFixed(2)}</div>
            </div>

            <div style="
              border-bottom: 2px dotted #e5e7eb;
              padding: 15px 0;
              margin-bottom: 15px;
            ">
              <div style="
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 8px;
              ">Total Expense</div>
              <div style="
                font-size: 20px;
                font-weight: bold;
                color: #ef4444;
              ">₹${totalExpense.toFixed(2)}</div>
            </div>

            <div style="
              border-bottom: 2px dotted #e5e7eb;
              padding: 15px 0;
              margin-bottom: 15px;
            ">
              <div style="
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 8px;
              ">Production Cost</div>
              <div style="
                font-size: 18px;
                font-weight: bold;
                color: #0066CC;
              ">₹${productionCost.toFixed(2)}</div>
            </div>

            <div style="
              border-bottom: 2px dotted #e5e7eb;
              padding: 15px 0;
              margin-bottom: 15px;
            ">
              <div style="
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 8px;
              ">Chains</div>
              <div style="
                font-size: 16px;
                font-weight: bold;
                color: #1f2937;
              ">₹${(formValue.chains || 0).toFixed(2)}</div>
            </div>

            <div style="
              border-bottom: 2px dotted #e5e7eb;
              padding: 15px 0;
              margin-bottom: 15px;
            ">
              <div style="
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 8px;
              ">Back Money</div>
              <div style="
                font-size: 16px;
                font-weight: bold;
                color: #1f2937;
              ">₹${(formValue.backMoneyInBag || 0).toFixed(2)}</div>
            </div>
          </div>

          <!-- Profit/Loss Section -->
          <div style="
            background: ${profitData.profit > 0 ? '#f0fdf4' : '#fef2f2'};
            border: 2px solid ${profitData.profit > 0 ? '#10b981' : '#ef4444'};
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
          ">
            <div style="
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 8px;
            ">${profitData.profit > 0 ? 'Total Profit' : 'Total Loss'}</div>
            <div style="
              font-size: 28px;
              font-weight: bold;
              color: ${profitData.profit > 0 ? '#10b981' : '#ef4444'};
            ">₹${(profitData.profit > 0 ? profitData.profit : profitData.loss).toFixed(2)}</div>
          </div>

          ${formValue.notes ? `
            <div style="
              border-top: 2px dotted #e5e7eb;
              padding-top: 15px;
              margin-top: 15px;
            ">
              <div style="
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 8px;
              ">Notes</div>
              <div style="
                font-size: 14px;
                color: #1f2937;
                font-style: italic;
              ">${formValue.notes}</div>
            </div>
          ` : ''}

          <!-- Footer -->
          <div style="
            margin-top: 25px;
            padding-top: 15px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          ">
            <div style="margin-bottom: 5px;">Powered by ${this.companyName}</div>
            <div>Business Tracker Application</div>
          </div>
        </div>
      `;

      // Create temporary div for invoice
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = invoiceHTML;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);

      const invoiceElement = tempDiv.firstElementChild as HTMLElement;

      // Generate image using html2canvas
      const canvas = await html2canvas(invoiceElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });

      // Convert canvas to data URL
      const imageDataUrl = canvas.toDataURL('image/png');

      // Share via WhatsApp with image
      await this.shareInvoiceImage(imageDataUrl, dateStr, totalIncome);

      // Clean up
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Error generating invoice:', error);
      this.showToast('Failed to generate invoice', 'danger');
    }
  }

  async shareInvoiceImage(imageDataUrl: string, dateStr: string, totalIncome: number): Promise<void> {
    try {
      // Validate image data
      if (!imageDataUrl || imageDataUrl === 'data:,') {
        throw new Error('Invalid image data');
      }

      // Extract base64 data from data URL
      const base64Data = imageDataUrl.includes(',') ? imageDataUrl.split(',')[1] : imageDataUrl;
      const fileName = `invoice-${dateStr.replace(/\s/g, '-')}.jpg`; // Changed to .jpg for faster processing

      // Check if we're on mobile (Capacitor)
      if (this.platform.is('capacitor') && this.platform.is('mobile')) {
        try {
          // Save file to device storage (use External directory for better WhatsApp sharing)
          const fileUri = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: this.platform.is('android') ? Directory.External : Directory.Data,
            recursive: false
          });

          // Get proper file URI for sharing
          let fileUrl = fileUri.uri;
          console.log('File saved, URI:', fileUrl);

          // For Android, get proper content URI that can be shared with WhatsApp
          if (this.platform.is('android')) {
            try {
              const uriResult = await Filesystem.getUri({
                path: fileName,
                directory: Directory.External
              });
              fileUrl = uriResult.uri;
              console.log('Android content URI for sharing:', fileUrl);

              // Verify file exists
              const fileInfo = await Filesystem.stat({
                path: fileName,
                directory: Directory.External
              });
              console.log('File verified, size:', fileInfo.size);
            } catch (e) {
              console.log('Using default URI:', fileUrl);
            }
          }

          // Share using Capacitor Share plugin
          // IMPORTANT: For WhatsApp image sharing, we need to use url parameter only
          console.log('Attempting to share image file:', fileUrl);

          try {
            // Share with URL only - this should share the image file to WhatsApp
            // Don't include text parameter as it might cause only text to be sent
            // Share with URL only - critical: no text parameter to ensure image is sent
            const shareResult = await Share.share({
              url: fileUrl, // File URI - this should share the image
              dialogTitle: 'Share Invoice'
            });

            console.log('Share result:', shareResult);
            return;
          } catch (shareError2: any) {
            console.error('Share error:', shareError2);
            // If that fails, try with title (for iOS compatibility)
            try {
              if (this.platform.is('ios')) {
                await Share.share({
                  title: `Daily Invoice - ${dateStr}`,
                  url: fileUrl,
                  dialogTitle: 'Share Invoice'
                });
              } else {
                // For Android, try again with just URL
                await Share.share({
                  url: fileUrl,
                  dialogTitle: 'Share Invoice'
                });
              }
              return;
            } catch (shareError3: any) {
              console.error('All share attempts failed:', shareError3);
              throw shareError2; // Re-throw to fall through to Web Share API
            }
          }
        } catch (shareError: any) {
          console.error('Capacitor Share error:', shareError);
          // Fall through to Web Share API
        }
      }

      // For web or if Capacitor share fails, try Web Share API
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], fileName, {
        type: 'image/jpeg' // Changed to match JPEG format
      });

      // Try Web Share API with file (works on mobile browsers and some desktop)
      if (navigator.share) {
        try {
          // Check if files can be shared
          const canShareFiles = navigator.canShare && navigator.canShare({ files: [file] });

          if (canShareFiles) {
            // Share ONLY the file (no text) to ensure image is sent
            await navigator.share({
              files: [file]
            });
            return;
          } else {
            // If files not supported, try with text but download image
            await navigator.share({
              title: `Daily Invoice - ${dateStr}`,
              text: `Daily Business Invoice for ${dateStr}\nTotal Income: ₹${totalIncome.toFixed(2)}`
            });
            // Download image separately
            this.downloadImage(imageDataUrl, fileName);
            this.showToast('Text shared. Image downloaded separately.', 'warning');
            return;
          }
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            console.error('Web Share API error:', error);
            // Fall through to download method
          } else {
            return; // User cancelled
          }
        }
      }

      // Fallback: Download image
      this.downloadImage(imageDataUrl, fileName);
      this.showToast('Image downloaded. Please share it manually via WhatsApp', 'warning');

    } catch (error) {
      console.error('Error sharing invoice:', error);
      throw error; // Re-throw to be caught by shareInvoice
    }
  }

  downloadImage(imageDataUrl: string, fileName: string) {
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = imageDataUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  }

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  downloadAndOpenWhatsApp(imageDataUrl: string, dateStr: string, totalIncome: number, blob: Blob) {
    // Create object URL from blob
    const imageUrl = URL.createObjectURL(blob);

    // Create a temporary link to download
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `invoice-${dateStr.replace(/\s/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up object URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(imageUrl);
    }, 100);

    // Try to open WhatsApp with message
    const message = `Daily Business Invoice for ${dateStr}\nTotal Income: ₹${totalIncome.toFixed(2)}\n\nPlease check the downloaded invoice image.`;

    // For mobile, try WhatsApp app URL
    if (this.platform.is('mobile')) {
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
      window.location.href = whatsappUrl;

      // Fallback to web if app doesn't open
      setTimeout(() => {
        const whatsappWebUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappWebUrl, '_blank');
      }, 1000);
    } else {
      // For web, open WhatsApp Web
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }

    this.showToast('Invoice downloaded! Opening WhatsApp...', 'success');
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

