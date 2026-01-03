import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

export interface IncomeItemOption {
  name: string;
  id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IncomeItemsService {
  private readonly STORAGE_KEY = 'income_items_list';
  private _storage: Storage | null = null;
  private _items: IncomeItemOption[] = [];

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
      const defaultItems: IncomeItemOption[] = [
        { name: 'Catering', id: this.generateId() },
        { name: 'Delivery', id: this.generateId() },
        { name: 'Takeaway', id: this.generateId() },
        { name: 'Dine-in', id: this.generateId() },
        { name: 'Online Order', id: this.generateId() },
        { name: 'Special Event', id: this.generateId() },
        { name: 'Party Order', id: this.generateId() },
        { name: 'Bulk Order', id: this.generateId() }
      ];
      await this.saveItems(defaultItems);
    } else {
      // Ensure all existing items have IDs
      let needsUpdate = false;
      this._items = this._items.map(item => {
        if (!item.id) {
          needsUpdate = true;
          return { ...item, id: this.generateId() };
        }
        return item;
      });
      if (needsUpdate) {
        await this.saveItems(this._items);
      }
    }
  }

  async getAllItems(): Promise<IncomeItemOption[]> {
    await this.ensureInitialized();
    // Ensure all items have IDs before returning
    // First, update _items if any are missing IDs
    let needsUpdate = false;
    const updatedItems = this._items.map(item => {
      if (!item.id) {
        needsUpdate = true;
        return { ...item, id: this.generateId() };
      }
      return item;
    });
    if (needsUpdate) {
      this._items = updatedItems;
      await this.saveItems(this._items);
    }
    return [...this._items];
  }

  async saveItems(items: IncomeItemOption[]): Promise<void> {
    this._items = items;
    if (this._storage) {
      await this._storage.set(this.STORAGE_KEY, JSON.stringify(items));
    }
  }

  async addItem(name: string): Promise<void> {
    await this.ensureInitialized();
    // Check if item already exists
    if (!this._items.some(item => item.name.toLowerCase() === name.toLowerCase())) {
      const newItem: IncomeItemOption = {
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
    const filtered = this._items.filter(item => item.name !== name);
    await this.saveItems(filtered);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

