import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton, IonToggle, IonModal, IonButtons } from '@ionic/angular/standalone';
import { AlertController, ToastController, Platform } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack, informationCircle, download, cloudUpload, trash, statsChart, documentText, business, moon, sunny, phonePortrait, code, image, text, add, calculator, checkmarkCircle, close } from 'ionicons/icons';
import { StorageService } from '../services/storage.service';
import { ThemeService } from '../services/theme.service';
import { NotificationService } from '../services/notification.service';
import { ProductionItemsService } from '../services/production-items.service';
import { ExpenseItemsService } from '../services/expense-items.service';
import { PurchaseItemsService } from '../services/purchase-items.service';
import JSZip from 'jszip';
import { InvoiceTemplate1Component } from '../daily-form/invoice-template1/invoice-template1.component';
import { InvoiceTemplate2Component } from '../daily-form/invoice-template2/invoice-template2.component';
import { InvoiceTemplate3Component } from '../daily-form/invoice-template3/invoice-template3.component';
import { InvoiceTemplate4Component } from '../daily-form/invoice-template4/invoice-template4.component';
import { InvoiceTemplate5Component } from '../daily-form/invoice-template5/invoice-template5.component';
import { InvoiceTemplate6Component } from '../daily-form/invoice-template6/invoice-template6.component';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonButton,
    IonToggle,
    IonModal,
    IonButtons,
    InvoiceTemplate1Component,
    InvoiceTemplate2Component,
    InvoiceTemplate3Component,
    InvoiceTemplate4Component,
    InvoiceTemplate5Component,
    InvoiceTemplate6Component
  ]
})
export class SettingsPage implements OnInit, OnDestroy {
  totalRecords: number = 0;
  appVersion: string = '1.0.0';
  appName: string = 'Sami Snack Center';
  isDarkMode: boolean = false;
  themeMode: 'light' | 'dark' | 'system' = 'system';
  isDeveloperMode: boolean = false;
  companyName: string = 'Sami Snack Center';
  companyLogo: string | null = null;
  showSpeedDial: boolean = true;
  showDeveloperSection: boolean = false;
  showDeveloperToggleInHeader: boolean = false;
  showWholesaleButton: boolean = false;
  showRetailButton: boolean = true;
  selectedInvoiceTemplate: string = 'template1';
  isPreviewModalOpen: boolean = false;
  previewTemplate: string = 'template1';
  private developerModeTimer?: any;

  // Sample data for preview
  previewData: any = {
    recordData: {
      chains: 250,
      backMoneyInBag: 50,
      notes: 'Normal business day'
    },
    totalIncome: 720,
    totalExpense: 450,
    productionCost: 570,
    profitData: {
      profit: 270,
      loss: 0
    },
    dateStr: '21 Dec 2025',
    timeStr: '05:30 am'
  };

  constructor(
    private router: Router,
    private storageService: StorageService,
    private themeService: ThemeService,
    private alertController: AlertController,
    private toastController: ToastController,
    private notificationService: NotificationService,
    private sanitizer: DomSanitizer,
    private productionItemsService: ProductionItemsService,
    private expenseItemsService: ExpenseItemsService,
    private purchaseItemsService: PurchaseItemsService,
    private platform: Platform
  ) {
    addIcons({ arrowBack, informationCircle, download, cloudUpload, trash, statsChart, documentText, business, moon, sunny, phonePortrait, code, image, text, add, calculator, checkmarkCircle, close });
  }

  ngOnInit() {
    // Reset developer section visibility when entering settings page
    this.showDeveloperSection = false;
    
    this.loadStatistics();
    this.updateThemeState();
    this.loadDeveloperMode();
    this.loadCompanySettings();
    this.loadSpeedDialSetting();
    this.loadCalculationButtonsSettings();
    this.loadInvoiceTemplate();

    // Listen to theme changes
    this.themeService.themeChanged.subscribe(() => {
      this.updateThemeState();
    });
  }

  ngOnDestroy() {
    // Reset developer section visibility when leaving settings page
    this.showDeveloperSection = false;
    
    // Clear developer mode timer if it exists
    if (this.developerModeTimer) {
      clearTimeout(this.developerModeTimer);
      this.developerModeTimer = undefined;
    }
  }

  onSettingsTitleDoubleClick() {
    this.showDeveloperSection = true;
  }

  toggleDeveloperToggleVisibility() {
    this.showDeveloperToggleInHeader = !this.showDeveloperToggleInHeader;
  }

  async loadStatistics() {
    const records = await this.storageService.getAllRecords();
    this.totalRecords = records.length;
  }

  updateThemeState() {
    this.isDarkMode = this.themeService.isDarkMode();
    this.themeMode = this.themeService.getThemeMode();
  }

  setThemeMode(mode: 'light' | 'dark' | 'system') {
    this.themeService.setThemeMode(mode);
    this.updateThemeState();
  }

  onThemeModeChange(event: any) {
    const mode = event.detail.value as 'light' | 'dark' | 'system';
    this.setThemeMode(mode);
  }

  toggleTheme(event: any) {
    this.themeService.toggleTheme();
    this.updateThemeState();
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  async exportData() {
    try {
      this.showToast('Exporting data...', 'success');
      
      // Get all data
      const records = await this.storageService.getAllRecords(true); // Include deleted
      const productionItems = await this.productionItemsService.getAllItems(true); // Include deleted
      const expenseItems = await this.expenseItemsService.getAllItems(true); // Include deleted
      const purchaseItems = await this.purchaseItemsService.getAllItems(true); // Include deleted

      // Create data object
      const data = {
        records: records,
        productionItems: productionItems,
        expenseItems: expenseItems,
        purchaseItems: purchaseItems,
        exportDate: new Date().toISOString(),
        appName: this.appName,
        version: this.appVersion
      };

      // Create ZIP file
      const zip = new JSZip();
      const dataStr = JSON.stringify(data, null, 2);
      zip.file('backup-data.json', dataStr);
      
      // Generate ZIP blob
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Try to use Capacitor Share for mobile, fallback to download for web
      if (this.platform.is('capacitor') && this.platform.is('mobile')) {
        try {
          // Convert blob to base64 for Capacitor
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            const dateStr = new Date().toISOString().split('T')[0];
            const fileName = `sami-snack-center-backup-${dateStr}.zip`;
            
            // Save to filesystem
            const { Filesystem } = await import('@capacitor/filesystem');
            const { Directory } = await import('@capacitor/filesystem');
            const { Share } = await import('@capacitor/share');
            
            await Filesystem.writeFile({
              path: fileName,
              data: base64Data,
              directory: Directory.External,
              recursive: false
            });
            
            const fileUri = await Filesystem.getUri({
              path: fileName,
              directory: Directory.External
            });
            
            await Share.share({
              url: fileUri.uri,
              title: 'Sami Snack Center Backup'
            });
            
            this.showToast('Data exported successfully as ZIP', 'success');
          };
          reader.readAsDataURL(zipBlob);
        } catch (error) {
          console.error('Capacitor share error:', error);
          // Fallback to download
          this.downloadZipFile(zipBlob);
        }
      } else {
        // Web fallback - download file
        this.downloadZipFile(zipBlob);
      }
    } catch (error) {
      this.showToast('Error exporting data', 'danger');
      console.error('Export error:', error);
    }
  }

  private downloadZipFile(zipBlob: Blob) {
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `sami-snack-center-backup-${dateStr}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showToast('Data exported successfully as ZIP', 'success');
  }

  async importData() {
    const alert = await this.alertController.create({
      header: 'Import Data',
      message: '⚠️ WARNING: This will replace all existing data! Make sure you have a backup. Continue?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Import',
          handler: () => {
            this.handleFileImport();
          }
        }
      ]
    });
    await alert.present();
  }

  handleFileImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip,.json';
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        try {
          this.showToast('Importing data...', 'success');
          
          // Check if it's a ZIP file or JSON file
          if (file.name.endsWith('.zip')) {
            await this.importZipFile(file);
          } else {
            await this.importJsonFile(file);
          }
        } catch (error) {
          this.showToast('Error importing file', 'danger');
          console.error('Import error:', error);
        }
      }
    };
    input.click();
  }

  async importZipFile(file: File) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = new JSZip();
      const zipData = await zip.loadAsync(arrayBuffer);
      
      // Find the JSON file in the ZIP
      const jsonFile = Object.keys(zipData.files).find(name => name.endsWith('.json'));
      
      if (!jsonFile) {
        this.showToast('No JSON file found in ZIP', 'danger');
        return;
      }
      
      const jsonContent = await zipData.files[jsonFile].async('string');
      const data = JSON.parse(jsonContent);
      
      await this.importDataFromObject(data);
    } catch (error) {
      this.showToast('Error reading ZIP file', 'danger');
      console.error('ZIP import error:', error);
    }
  }

  async importJsonFile(file: File) {
    try {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        try {
          const data = JSON.parse(e.target.result);
          await this.importDataFromObject(data);
        } catch (error) {
          this.showToast('Error reading JSON file', 'danger');
          console.error('JSON import error:', error);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      this.showToast('Error reading file', 'danger');
      console.error('File import error:', error);
    }
  }

  async importDataFromObject(data: any) {
    try {
      // Import records
      if (data.records && Array.isArray(data.records)) {
        await this.storageService.importRecords(data.records);
      }
      
      // Import production items
      if (data.productionItems && Array.isArray(data.productionItems)) {
        await this.productionItemsService.saveItems(data.productionItems);
      }
      
      // Import expense items
      if (data.expenseItems && Array.isArray(data.expenseItems)) {
        await this.expenseItemsService.saveItems(data.expenseItems);
      }
      
      // Import purchase items
      if (data.purchaseItems && Array.isArray(data.purchaseItems)) {
        await this.purchaseItemsService.saveItems(data.purchaseItems);
      }
      
      this.showToast('Data imported successfully', 'success');
      await this.loadStatistics();
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1000);
    } catch (error) {
      this.showToast('Error importing data', 'danger');
      console.error('Import data error:', error);
    }
  }

  async clearAllData() {
    const alert = await this.alertController.create({
      header: 'Clear All Data',
      message: '⚠️ WARNING: This will delete ALL your records permanently! This action cannot be undone. Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Clear All Data',
          role: 'destructive',
          cssClass: 'danger',
          handler: async () => {
            try {
              await this.storageService.clearAll();
              // Clear notifications as well
              await this.notificationService.clearAllNotifications();
              this.showToast('All data cleared successfully', 'success');
              await this.loadStatistics();
              setTimeout(() => {
                this.router.navigate(['/home']);
              }, 1000);
            } catch (error) {
              this.showToast('Error clearing data', 'danger');
              console.error('Clear error:', error);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async loadDeveloperMode() {
    const developerMode = await this.storageService.get('developer_mode');
    this.isDeveloperMode = developerMode === 'true';
  }

  async toggleDeveloperMode() {
    this.isDeveloperMode = !this.isDeveloperMode;
    await this.storageService.set('developer_mode', this.isDeveloperMode.toString());
    
    if (this.isDeveloperMode) {
      // Developer mode turned ON - set timer to auto-disable after 1 minute
      this.developerModeTimer = setTimeout(async () => {
        this.isDeveloperMode = false;
        await this.storageService.set('developer_mode', 'false');
        this.showToast('Developer mode automatically disabled after 1 minute', 'warning');
        // Clear the timer reference
        this.developerModeTimer = undefined;
      }, 60000); // 1 minute = 60000 milliseconds
    } else {
      // Developer mode turned OFF manually - clear the timer if it exists
      if (this.developerModeTimer) {
        clearTimeout(this.developerModeTimer);
        this.developerModeTimer = undefined;
      }
      this.showToast('Developer mode disabled', 'success');
    }
    
    if (this.isDeveloperMode) {
      this.showToast('Developer mode enabled (will auto-disable in 1 minute)', 'success');
    }
  }

  async loadCompanySettings() {
    const name = await this.storageService.get('company_name');
    if (name) {
      this.companyName = name;
    }
    
    const logo = await this.storageService.get('company_logo');
    if (logo) {
      this.companyLogo = logo;
    }
  }

  async saveCompanyName() {
    if (this.companyName.trim()) {
      await this.storageService.set('company_name', this.companyName.trim());
      this.storageService.companyNameChanged.emit(this.companyName.trim());
      this.showToast('Company name saved', 'success');
    }
  }

  selectCompanyLogo() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e: any) => {
          try {
            const base64 = e.target.result as string;
            this.companyLogo = base64;
            await this.storageService.set('company_logo', base64);
            this.storageService.companyLogoChanged.emit(base64);
            this.showToast('Company logo saved', 'success');
          } catch (error) {
            this.showToast('Error saving logo', 'danger');
            console.error('Logo save error:', error);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  async removeCompanyLogo() {
    this.companyLogo = null;
    await this.storageService.set('company_logo', '');
    this.storageService.companyLogoChanged.emit('');
    this.showToast('Company logo removed', 'success');
  }

  async loadSpeedDialSetting() {
    const speedDialVisible = await this.storageService.get('show_speed_dial');
    this.showSpeedDial = speedDialVisible !== 'false'; // Default to true if not set
  }

  async toggleSpeedDial() {
    this.showSpeedDial = !this.showSpeedDial;
    await this.storageService.set('show_speed_dial', this.showSpeedDial.toString());
    this.showToast(
      this.showSpeedDial ? 'Speed dial enabled' : 'Speed dial disabled',
      'success'
    );
  }

  async loadCalculationButtonsSettings() {
    const showWholesale = await this.storageService.get('show_wholesale_button');
    this.showWholesaleButton = showWholesale === 'true'; // Default to false
    
    const showRetail = await this.storageService.get('show_retail_button');
    this.showRetailButton = showRetail !== 'false'; // Default to true
  }

  async toggleWholesaleButton() {
    this.showWholesaleButton = !this.showWholesaleButton;
    await this.storageService.set('show_wholesale_button', this.showWholesaleButton.toString());
    this.showToast(
      this.showWholesaleButton ? 'Wholesale button enabled' : 'Wholesale button disabled',
      'success'
    );
  }

  async loadInvoiceTemplate() {
    const template = await this.storageService.get('invoice_template');
    this.selectedInvoiceTemplate = template || 'template1';
  }

  async selectInvoiceTemplate(template: string) {
    this.selectedInvoiceTemplate = template;
    await this.storageService.set('invoice_template', template);
    this.showToast('Invoice template updated', 'success');
  }

  openPreviewModal(template: string) {
    this.previewTemplate = template;
    this.isPreviewModalOpen = true;
  }

  closePreviewModal() {
    this.isPreviewModalOpen = false;
  }

  async selectTemplateFromPreview(template: string) {
    await this.selectInvoiceTemplate(template);
    this.closePreviewModal();
  }

  getPreviewHTML(template: string): SafeHtml {
    const sampleData = {
      dateStr: '21 Dec 2025',
      timeStr: '05:30 am',
      totalIncome: 720.00,
      totalExpense: 450.00,
      productionCost: 570.00,
      chains: 250.00,
      backMoneyInBag: 50.00,
      profitData: { profit: 270.00, loss: 0 },
      notes: 'Normal business day'
    };

    let html = '';
    switch(template) {
      case 'template2':
        html = this.getTemplate2Preview(sampleData);
        break;
      case 'template3':
        html = this.getTemplate3Preview(sampleData);
        break;
      default:
        html = this.getTemplate1Preview(sampleData);
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getTemplate1Preview(data: any): string {
    return `
      <div style="width: 320px; max-width: 100%; background: white; border: 1px solid #000; padding: 16px; font-family: 'Courier New', monospace; margin: 0 auto; overflow: hidden;">
        <div style="text-align: center; margin-bottom: 12px;">
          <div style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">${this.companyName}</div>
          <div style="border-top: 2px dashed #000; border-bottom: 2px dashed #000; padding: 8px 0; margin: 8px 0;">
            <div style="font-size: 18px; font-weight: bold;">INVOICE</div>
          </div>
        </div>
        <div style="border-top: 2px dashed #000; border-bottom: 2px dashed #000; padding: 8px 0; margin: 12px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <div style="font-size: 11px; font-weight: bold;">Date:</div>
            <div style="font-size: 11px;">${data.dateStr}, ${data.timeStr}</div>
          </div>
        </div>
        <div style="border-top: 2px dashed #000; border-bottom: 2px dashed #000; padding: 8px 0; margin: 12px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <div style="font-size: 11px; font-weight: bold;">Total Income:</div>
            <div style="font-size: 11px;">₹${data.totalIncome.toFixed(2)}</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <div style="font-size: 11px; font-weight: bold;">Total Expense:</div>
            <div style="font-size: 11px;">₹${data.totalExpense.toFixed(2)}</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <div style="font-size: 11px; font-weight: bold;">Production Cost:</div>
            <div style="font-size: 11px;">₹${data.productionCost.toFixed(2)}</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <div style="font-size: 11px; font-weight: bold;">Chains:</div>
            <div style="font-size: 11px;">₹${data.chains.toFixed(2)}</div>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <div style="font-size: 11px; font-weight: bold;">Back Money:</div>
            <div style="font-size: 11px;">₹${data.backMoneyInBag.toFixed(2)}</div>
          </div>
        </div>
        <div style="border-top: 2px dashed #000; padding-top: 8px; margin-top: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: bold;">${data.profitData.profit > 0 ? 'Total Profit' : 'Total Loss'}:</div>
            <div style="font-size: 14px; font-weight: bold;">₹${(data.profitData.profit > 0 ? data.profitData.profit : data.profitData.loss).toFixed(2)}</div>
          </div>
        </div>
        ${data.notes ? `
          <div style="border-top: 2px dashed #000; padding-top: 8px; margin-top: 12px;">
            <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px;">Notes:</div>
            <div style="font-size: 11px;">${data.notes}</div>
          </div>
        ` : ''}
        <div style="border-top: 2px dashed #000; padding-top: 8px; margin-top: 12px; text-align: center; font-size: 9px;">
          <div>Powered by ${this.companyName}</div>
          <div>Business Tracker Application</div>
        </div>
      </div>
    `;
  }

  getTemplate2Preview(data: any): string {
    return `
      <div style="width: 380px; max-width: 100%; background: white; border: 1px solid #ddd; padding: 16px; font-family: 'Courier New', monospace; margin: 0 auto; overflow: hidden;">
        <div style="text-align: center; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px;">
          <div style="font-size: 22px; font-weight: bold; margin-bottom: 4px;">${this.companyName}</div>
          <div style="font-size: 10px; margin-bottom: 4px;">Daily Business Invoice</div>
          <div style="font-size: 9px;">Date: ${data.dateStr} | Time: ${data.timeStr}</div>
        </div>
        <div style="margin: 12px 0;">
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dotted #000;">
            <div style="font-size: 11px;">Total Income</div>
            <div style="font-size: 11px; font-weight: bold;">₹${data.totalIncome.toFixed(2)}</div>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dotted #000;">
            <div style="font-size: 11px;">Total Expense</div>
            <div style="font-size: 11px; font-weight: bold;">₹${data.totalExpense.toFixed(2)}</div>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dotted #000;">
            <div style="font-size: 11px;">Production Cost</div>
            <div style="font-size: 11px; font-weight: bold;">₹${data.productionCost.toFixed(2)}</div>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dotted #000;">
            <div style="font-size: 11px;">Chains</div>
            <div style="font-size: 11px; font-weight: bold;">₹${data.chains.toFixed(2)}</div>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dotted #000;">
            <div style="font-size: 11px;">Back Money</div>
            <div style="font-size: 11px; font-weight: bold;">₹${data.backMoneyInBag.toFixed(2)}</div>
          </div>
        </div>
        <div style="border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 8px 0; margin: 12px 0;">
          <div style="display: flex; justify-content: space-between;">
            <div style="font-size: 12px; font-weight: bold;">${data.profitData.profit > 0 ? 'Total Profit' : 'Total Loss'}</div>
            <div style="font-size: 14px; font-weight: bold;">₹${(data.profitData.profit > 0 ? data.profitData.profit : data.profitData.loss).toFixed(2)}</div>
          </div>
        </div>
        ${data.notes ? `
          <div style="margin-top: 12px; padding-top: 8px; border-top: 1px dotted #000;">
            <div style="font-size: 10px; font-weight: bold; margin-bottom: 4px;">Notes:</div>
            <div style="font-size: 10px;">${data.notes}</div>
          </div>
        ` : ''}
        <div style="margin-top: 16px; padding-top: 8px; border-top: 2px solid #000; text-align: center; font-size: 9px;">
          <div>Thank you and see you again!</div>
          <div style="margin-top: 4px;">Powered by Sami Snack Center</div>
        </div>
      </div>
    `;
  }

  getTemplate3Preview(data: any): string {
    return `
      <div style="width: 340px; max-width: 100%; background: white; border: 2px solid #0066CC; padding: 14px; font-family: 'Arial', sans-serif; margin: 0 auto; overflow: hidden;">
        <div style="background: #0066CC; color: white; padding: 12px; margin: -14px -14px 12px -14px; text-align: center;">
          <div style="font-size: 20px; font-weight: bold; margin-bottom: 4px;">${this.companyName}</div>
          <div style="font-size: 14px; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 6px; margin-top: 6px;">TAX INVOICE</div>
        </div>
        <div style="background: #e6f2ff; padding: 10px; margin: 12px 0; border-left: 4px solid #0066CC;">
          <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px;">Amount Due:</div>
          <div style="font-size: 18px; font-weight: bold; color: #0066CC;">₹${data.totalIncome.toFixed(2)}</div>
        </div>
        <div style="border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 8px 0; margin: 12px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <div style="font-size: 10px; color: #666;">Issue Date:</div>
            <div style="font-size: 10px; font-weight: bold;">${data.dateStr}</div>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <div style="font-size: 10px; color: #666;">Time:</div>
            <div style="font-size: 10px; font-weight: bold;">${data.timeStr}</div>
          </div>
        </div>
        <div style="margin: 12px 0;">
          <div style="background: #f5f5f5; padding: 8px; border-left: 3px solid #0066CC; margin-bottom: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 2px;">Total Income</div>
            <div style="font-size: 14px; font-weight: bold; color: #0066CC;">₹${data.totalIncome.toFixed(2)}</div>
          </div>
          <div style="background: #f5f5f5; padding: 8px; border-left: 3px solid #ef4444; margin-bottom: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 2px;">Total Expense</div>
            <div style="font-size: 14px; font-weight: bold; color: #ef4444;">₹${data.totalExpense.toFixed(2)}</div>
          </div>
          <div style="background: #f5f5f5; padding: 8px; border-left: 3px solid #0066CC; margin-bottom: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 2px;">Production Cost</div>
            <div style="font-size: 13px; font-weight: bold; color: #0066CC;">₹${data.productionCost.toFixed(2)}</div>
          </div>
          <div style="background: #f5f5f5; padding: 8px; border-left: 3px solid #999; margin-bottom: 8px;">
            <div style="font-size: 10px; color: #666; margin-bottom: 2px;">Chains</div>
            <div style="font-size: 12px; font-weight: bold;">₹${data.chains.toFixed(2)}</div>
          </div>
          <div style="background: #f5f5f5; padding: 8px; border-left: 3px solid #999;">
            <div style="font-size: 10px; color: #666; margin-bottom: 2px;">Back Money</div>
            <div style="font-size: 12px; font-weight: bold;">₹${data.backMoneyInBag.toFixed(2)}</div>
          </div>
        </div>
        <div style="background: ${data.profitData.profit > 0 ? '#e6f7e6' : '#ffe6e6'}; border: 2px solid ${data.profitData.profit > 0 ? '#10b981' : '#ef4444'}; padding: 12px; margin: 12px 0; text-align: center;">
          <div style="font-size: 11px; color: #666; margin-bottom: 4px;">${data.profitData.profit > 0 ? 'Total Profit' : 'Total Loss'}</div>
          <div style="font-size: 22px; font-weight: bold; color: ${data.profitData.profit > 0 ? '#10b981' : '#ef4444'};">
            ₹${(data.profitData.profit > 0 ? data.profitData.profit : data.profitData.loss).toFixed(2)}
          </div>
        </div>
        ${data.notes ? `
          <div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 12px;">
            <div style="font-size: 10px; font-weight: bold; margin-bottom: 4px;">Notes:</div>
            <div style="font-size: 10px; color: #666;">${data.notes}</div>
          </div>
        ` : ''}
        <div style="border-top: 2px solid #0066CC; padding-top: 10px; margin-top: 12px; text-align: center; font-size: 9px; color: #666;">
          <div>Powered by ${this.companyName}</div>
          <div>Business Tracker Application</div>
        </div>
      </div>
    `;
  }

  async toggleRetailButton() {
    this.showRetailButton = !this.showRetailButton;
    await this.storageService.set('show_retail_button', this.showRetailButton.toString());
    this.showToast(
      this.showRetailButton ? 'Retail button enabled' : 'Retail button disabled',
      'success'
    );
  }

  async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }
}

