import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton, IonInput, IonItem, IonLabel, IonList, IonToggle } from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack, add, create, trash, checkmark, close, refreshCircleOutline } from 'ionicons/icons';
import { ExpenseItemsService, ExpenseItemOption } from '../services/expense-items.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-expense-items',
  templateUrl: 'expense-items.page.html',
  styleUrls: ['expense-items.page.scss'],
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
    IonInput,
    IonItem,
    IonList,
    IonToggle
  ]
})
export class ExpenseItemsPage implements OnInit {
  items: ExpenseItemOption[] = [];
  filteredItems: ExpenseItemOption[] = [];
  searchQuery: string = '';
  showDeleted: boolean = false;
  isDeveloperMode: boolean = false;
  editingItem: ExpenseItemOption | null = null;
  newItemName: string = '';
  isAdding: boolean = false;
  returnUrl: string | null = null;
  isLoading: boolean = true;

  constructor(
    private expenseItemsService: ExpenseItemsService,
    private storageService: StorageService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ arrowBack, add, create, trash, checkmark, close, refreshCircleOutline });
  }

  ngOnInit() {
    this.loadItems();
    this.loadDeveloperMode();
    // Listen to developer mode changes
    this.storageService.developerModeChanged.subscribe((isEnabled: boolean) => {
      this.isDeveloperMode = isEnabled;
    });
    // Get return URL from navigation state (if available)
    if (history.state && history.state.returnUrl) {
      this.returnUrl = history.state.returnUrl;
    }
  }

  async loadDeveloperMode() {
    const developerMode = await this.storageService.get('developer_mode');
    this.isDeveloperMode = developerMode === 'true';
  }

  async loadItems() {
    this.isLoading = true;
    try {
      this.items = await this.expenseItemsService.getAllItems(this.showDeleted);
      this.filterItems();
    } catch (error) {
      console.error('Error loading items:', error);
      this.showToast('Error loading items', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  goToHome() {
    // First try to use returnUrl if available (from navigation state)
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    // Otherwise, use Location.back() to go back to previous page in history
    const canGoBack = window.history.length > 1;
    if (canGoBack) {
      this.location.back();
    } else {
      // Fallback: if no history, go to home
      this.router.navigate(['/home']);
    }
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value || '';
    this.filterItems();
  }

  filterItems() {
    let filtered = [...this.items];
    
    // Filter based on showDeleted toggle
    if (this.showDeleted) {
      // Show only deleted items
      filtered = filtered.filter(item => item.isDeleted);
    } else {
      // Show only non-deleted items
      filtered = filtered.filter(item => !item.isDeleted);
    }
    
    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query)
      );
    }
    
    this.filteredItems = filtered;
  }

  onShowDeletedChange() {
    this.loadItems();
  }

  startAdding() {
    this.isAdding = true;
    this.newItemName = '';
    this.editingItem = null;
  }

  cancelAdding() {
    this.isAdding = false;
    this.newItemName = '';
  }

  async saveNewItem() {
    if (!this.newItemName.trim()) {
      this.showToast('Please enter item name', 'warning');
      return;
    }

    await this.expenseItemsService.addItem(this.newItemName);
    this.showToast('Item added successfully', 'success');
    await this.loadItems();
    this.cancelAdding();
  }

  startEditing(item: ExpenseItemOption) {
    this.editingItem = { ...item };
    this.isAdding = false;
  }

  cancelEditing() {
    this.editingItem = null;
  }

  async saveEdit() {
    if (!this.editingItem || !this.editingItem.name.trim()) {
      this.showToast('Please enter item name', 'warning');
      return;
    }

    const originalName = this.items.find(item => item.id === this.editingItem?.id)?.name;
    if (originalName) {
      await this.expenseItemsService.updateItem(originalName, this.editingItem.name);
      this.showToast('Item updated successfully', 'success');
      await this.loadItems();
      this.cancelEditing();
    }
  }

  async deleteItem(item: ExpenseItemOption) {
    let countdown = 10;
    let countdownInterval: any;
    let deleteButton: any;

    const alert = await this.alertController.create({
      header: 'Delete Item',
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone. Please wait 10 seconds before confirming.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            if (countdownInterval) {
              clearInterval(countdownInterval);
            }
          }
        },
        {
          text: `Delete (${countdown})`,
          role: 'destructive',
          cssClass: 'danger',
          handler: async () => {
            if (countdown > 0) {
              return false; // Prevent deletion if countdown not finished
            }
            if (countdownInterval) {
              clearInterval(countdownInterval);
            }
            await this.expenseItemsService.deleteItem(item.name);
            this.showToast('Item deleted successfully', 'success');
            await this.loadItems();
            return true;
          }
        }
      ]
    });

    await alert.present();

    // Get the delete button element
    const alertElement = document.querySelector('ion-alert');
    if (alertElement) {
      const buttons = alertElement.querySelectorAll('.alert-button');
      if (buttons.length > 1) {
        deleteButton = buttons[1] as HTMLElement;
        const buttonInner = deleteButton.querySelector('.alert-button-inner') as HTMLElement;
        
        // Initially disable the button
        deleteButton.setAttribute('disabled', 'true');
        deleteButton.style.opacity = '0.5';
        deleteButton.style.pointerEvents = 'none';

        // Start countdown
        countdownInterval = setInterval(() => {
          countdown--;
          
          if (buttonInner) {
            buttonInner.textContent = `Delete (${countdown})`;
          }

          if (countdown <= 0) {
            clearInterval(countdownInterval);
            if (buttonInner) {
              buttonInner.textContent = 'Delete';
            }
            deleteButton.removeAttribute('disabled');
            deleteButton.style.opacity = '1';
            deleteButton.style.pointerEvents = 'auto';
          }
        }, 1000);
      }
    }

    // Clean up interval when alert is dismissed
    alert.onDidDismiss().then(() => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    });
  }

  async restoreItem(item: ExpenseItemOption) {
    const alert = await this.alertController.create({
      header: 'Restore Item',
      message: `Are you sure you want to restore "${item.name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Restore',
          handler: async () => {
            await this.expenseItemsService.restoreItem(item.name);
            this.showToast('Item restored successfully', 'success');
            await this.loadItems();
          }
        }
      ]
    });

    await alert.present();
  }

  async permanentDeleteItem(item: ExpenseItemOption) {
    let countdown = 10;
    let countdownInterval: any;
    let deleteButton: any;

    const alert = await this.alertController.create({
      header: 'Permanent Delete',
      message: `Are you sure you want to permanently delete "${item.name}"? This action cannot be undone. Please wait 10 seconds before confirming.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            if (countdownInterval) {
              clearInterval(countdownInterval);
            }
          }
        },
        {
          text: `Permanent Delete (${countdown})`,
          role: 'destructive',
          cssClass: 'danger',
          handler: async () => {
            if (countdown > 0) {
              return false;
            }
            if (countdownInterval) {
              clearInterval(countdownInterval);
            }
            await this.expenseItemsService.permanentDeleteItem(item.name);
            this.showToast('Item permanently deleted', 'danger');
            await this.loadItems();
            return true;
          }
        }
      ]
    });

    await alert.present();

    const alertElement = document.querySelector('ion-alert');
    if (alertElement) {
      const buttons = alertElement.querySelectorAll('.alert-button');
      if (buttons.length > 1) {
        deleteButton = buttons[1] as HTMLElement;
        const buttonInner = deleteButton.querySelector('.alert-button-inner') as HTMLElement;
        
        deleteButton.setAttribute('disabled', 'true');
        deleteButton.style.opacity = '0.5';
        deleteButton.style.pointerEvents = 'none';

        countdownInterval = setInterval(() => {
          countdown--;
          
          if (buttonInner) {
            buttonInner.textContent = `Permanent Delete (${countdown})`;
          }

          if (countdown <= 0) {
            clearInterval(countdownInterval);
            if (buttonInner) {
              buttonInner.textContent = 'Permanent Delete';
            }
            deleteButton.removeAttribute('disabled');
            deleteButton.style.opacity = '1';
            deleteButton.style.pointerEvents = 'auto';
          }
        }, 1000);
      }
    }

    alert.onDidDismiss().then(() => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    });
  }

  async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}

