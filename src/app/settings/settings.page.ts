import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton, IonToggle } from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack, informationCircle, download, cloudUpload, trash, statsChart, documentText, business, moon, sunny, phonePortrait, code, image, text, add } from 'ionicons/icons';
import { StorageService } from '../services/storage.service';
import { ThemeService } from '../services/theme.service';
import { NotificationService } from '../services/notification.service';

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
    IonToggle
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

  constructor(
    private router: Router,
    private storageService: StorageService,
    private themeService: ThemeService,
    private alertController: AlertController,
    private toastController: ToastController,
    private notificationService: NotificationService
  ) {
    addIcons({ arrowBack, informationCircle, download, cloudUpload, trash, statsChart, documentText, business, moon, sunny, phonePortrait, code, image, text, add });
  }

  ngOnInit() {
    this.loadStatistics();
    this.updateThemeState();
    this.loadDeveloperMode();
    this.loadCompanySettings();
    this.loadSpeedDialSetting();

    // Listen to theme changes
    this.themeService.themeChanged.subscribe(() => {
      this.updateThemeState();
    });
  }

  ngOnDestroy() {
    // Cleanup handled by service
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
      const records = await this.storageService.getAllRecords();
      const data = {
        records: records,
        exportDate: new Date().toISOString(),
        appName: this.appName,
        version: this.appVersion
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nayna-snack-center-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.showToast('Data exported successfully', 'success');
    } catch (error) {
      this.showToast('Error exporting data', 'danger');
      console.error('Export error:', error);
    }
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
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e: any) => {
          try {
            const data = JSON.parse(e.target.result);
            if (data.records && Array.isArray(data.records)) {
              // Save imported records
              await this.storageService.importRecords(data.records);
              this.showToast('Data imported successfully', 'success');
              await this.loadStatistics();
              setTimeout(() => {
                this.router.navigate(['/home']);
              }, 1000);
            } else {
              this.showToast('Invalid file format', 'danger');
            }
          } catch (error) {
            this.showToast('Error reading file', 'danger');
            console.error('Import error:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
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
    this.showToast(
      this.isDeveloperMode ? 'Developer mode enabled' : 'Developer mode disabled',
      'success'
    );
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

