import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton, IonToggle, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack, informationCircle, download, cloudUpload, trash, statsChart, documentText, business, moon, sunny, phonePortrait } from 'ionicons/icons';
import { StorageService } from '../services/storage.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonButton,
    IonToggle,
    IonSelect,
    IonSelectOption
  ]
})
export class SettingsPage implements OnInit, OnDestroy {
  totalRecords: number = 0;
  appVersion: string = '1.0.0';
  appName: string = 'Sami Snack Center';
  isDarkMode: boolean = false;
  themeMode: 'light' | 'dark' | 'system' = 'system';

  constructor(
    private router: Router,
    private storageService: StorageService,
    private themeService: ThemeService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ arrowBack, informationCircle, download, cloudUpload, trash, statsChart, documentText, business, moon, sunny, phonePortrait });
  }

  ngOnInit() {
    this.loadStatistics();
    this.updateThemeState();
    
    // Listen to theme changes
    this.themeService.themeChanged.subscribe(() => {
      this.updateThemeState();
    });
  }

  ngOnDestroy() {
    // Cleanup handled by service
  }

  loadStatistics() {
    const records = this.storageService.getAllRecords();
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
      const records = this.storageService.getAllRecords();
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
        reader.onload = (e: any) => {
          try {
            const data = JSON.parse(e.target.result);
            if (data.records && Array.isArray(data.records)) {
              // Save imported records
              localStorage.setItem('daily_records', JSON.stringify(data.records));
              this.showToast('Data imported successfully', 'success');
              this.loadStatistics();
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
          handler: () => {
            try {
              localStorage.clear();
              this.showToast('All data cleared successfully', 'success');
              this.loadStatistics();
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

