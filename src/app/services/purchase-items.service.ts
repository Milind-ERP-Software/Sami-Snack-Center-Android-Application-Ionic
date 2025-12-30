import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

export interface PurchaseItemOption {
  name: string;
  id?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseItemsService {
  private readonly STORAGE_KEY = 'purchase_items_list';
  private _storage: Storage | null = null;
  private _items: PurchaseItemOption[] = [];

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    if (this._storage) {
      return;
    }
    const storage = await this.storage.create();
    this._storage = storage;

    const stored = await this._storage.get(this.STORAGE_KEY);
    if (stored) {
      this._items = JSON.parse(stored);
    } else {
      this._items = [];
    }

    await this.initializeDefaultItems();
  }

  private async ensureInitialized() {
    if (!this._storage) {
      await this.init();
    }
  }

  private async initializeDefaultItems(): Promise<void> {
    if (this._items.length === 0) {
      const defaultItems: PurchaseItemOption[] = [
        { name: 'Groceries' },
        { name: 'Vegetables' },
        { name: 'Fruits' },
        { name: 'Dairy Products' },
        { name: 'Spices' },
        { name: 'Oil' },
        { name: 'Rice' },
        { name: 'Lentils' }
      ];
      await this.saveItems(defaultItems);
    }
  }

  async getAllItems(includeDeleted: boolean = false): Promise<PurchaseItemOption[]> {
    await this.ensureInitialized();
    if (includeDeleted) {
      return [...this._items];
    }
    return [...this._items].filter(item => !item.isDeleted);
  }

  async saveItems(items: PurchaseItemOption[]): Promise<void> {
    this._items = items;
    if (this._storage) {
      await this._storage.set(this.STORAGE_KEY, JSON.stringify(items));
    }
  }

  async addItem(name: string): Promise<void> {
    await this.ensureInitialized();
    if (!this._items.some(item => item.name.toLowerCase() === name.toLowerCase())) {
      const newItem: PurchaseItemOption = {
        name: name.trim(),
        id: this.generateId()
      };
      this._items.push(newItem);
      await this.saveItems(this._items);
    }
  }

  async updateItem(oldName: string, newName: string): Promise<void> {
    await this.ensureInitialized();
    const index = this._items.findIndex(item => item.name === oldName);
    if (index !== -1) {
      this._items[index].name = newName.trim();
      await this.saveItems(this._items);
    }
  }

  async deleteItem(name: string): Promise<void> {
    await this.ensureInitialized();
    const item = this._items.find(item => item.name === name);
    if (item) {
      // Soft delete: mark as deleted instead of removing
      item.isDeleted = true;
      item.deletedAt = new Date().toISOString();
      await this.saveItems(this._items);
    }
  }

  async restoreItem(name: string): Promise<void> {
    await this.ensureInitialized();
    const item = this._items.find(item => item.name === name);
    if (item) {
      // Restore: unmark as deleted
      item.isDeleted = false;
      item.deletedAt = undefined;
      await this.saveItems(this._items);
    }
  }

  async permanentDeleteItem(name: string): Promise<void> {
    await this.ensureInitialized();
    // Permanent delete: actually remove from array
    const filtered = this._items.filter(item => item.name !== name);
    await this.saveItems(filtered);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
