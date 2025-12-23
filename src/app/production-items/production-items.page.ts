import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton, IonInput, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack, add, create, trash, checkmark, close } from 'ionicons/icons';
import { ProductionItemsService, ProductionItemOption } from '../services/production-items.service';

@Component({
  selector: 'app-production-items',
  templateUrl: 'production-items.page.html',
  styleUrls: ['production-items.page.scss'],
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
    IonList
  ]
})
export class ProductionItemsPage implements OnInit {
  items: ProductionItemOption[] = [];
  filteredItems: ProductionItemOption[] = [];
  searchQuery: string = '';
  editingItem: ProductionItemOption | null = null;
  newItemName: string = '';
  isAdding: boolean = false;
  returnUrl: string | null = null;
  isLoading: boolean = true;

  constructor(
    private productionItemsService: ProductionItemsService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ arrowBack, add, create, trash, checkmark, close });
  }

  ngOnInit() {
    this.loadItems();
    // Get return URL from navigation state (if available)
    // Check both history state and route state
    if (history.state && history.state.returnUrl) {
      this.returnUrl = history.state.returnUrl;
    }
  }

  loadItems() {
    this.isLoading = true;
    // Simulate loading delay for better UX
    setTimeout(() => {
      this.items = this.productionItemsService.getAllItems();
      this.filteredItems = [...this.items];
      this.isLoading = false;
    }, 300);
  }

  goToHome() {
    // First try to use returnUrl if available (from navigation state)
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }
    
    // Otherwise, use Location.back() to go back to previous page in history
    // This will automatically go back to wherever the user came from
    // (daily-form, home, or any other page)
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
    if (!this.searchQuery.trim()) {
      this.filteredItems = [...this.items];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredItems = this.items.filter(item =>
      item.name.toLowerCase().includes(query)
    );
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

    this.productionItemsService.addItem(this.newItemName);
    this.showToast('Item added successfully', 'success');
    this.loadItems();
    this.cancelAdding();
  }

  startEditing(item: ProductionItemOption) {
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
      this.productionItemsService.updateItem(originalName, this.editingItem.name);
      this.showToast('Item updated successfully', 'success');
      this.loadItems();
      this.cancelEditing();
    }
  }

  async deleteItem(item: ProductionItemOption) {
    const alert = await this.alertController.create({
      header: 'Delete Item',
      message: `Are you sure you want to delete "${item.name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.productionItemsService.deleteItem(item.name);
            this.showToast('Item deleted successfully', 'success');
            this.loadItems();
          }
        }
      ]
    });

    await alert.present();
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

