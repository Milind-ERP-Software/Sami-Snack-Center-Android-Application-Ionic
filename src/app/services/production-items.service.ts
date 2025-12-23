import { Injectable } from '@angular/core';

export interface ProductionItemOption {
  name: string;
  id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductionItemsService {
  private readonly STORAGE_KEY = 'production_items_list';

  constructor() {
    try {
      this.initializeDefaultItems();
    } catch (error) {
      console.error('Error initializing production items:', error);
    }
  }

  private initializeDefaultItems(): void {
    try {
      const items = this.getAllItems();
      if (items.length === 0) {
        const defaultItems: ProductionItemOption[] = [
          { name: 'Idali' },
          { name: 'Menduwada (40 plate)' },
          { name: 'Dosa' },
          { name: 'Vada' },
          { name: 'Sambhar' },
          { name: 'Uttapam' },
          { name: 'Poha' },
          { name: 'Upma' }
        ];
        this.saveItems(defaultItems);
      }
    } catch (error) {
      console.error('Error in initializeDefaultItems:', error);
    }
  }

  getAllItems(): ProductionItemOption[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error getting production items:', error);
    }
    return [];
  }

  saveItems(items: ProductionItemOption[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  addItem(name: string): void {
    const items = this.getAllItems();
    // Check if item already exists
    if (!items.some(item => item.name.toLowerCase() === name.toLowerCase())) {
      const newItem: ProductionItemOption = {
        name: name.trim(),
        id: this.generateId()
      };
      items.push(newItem);
      this.saveItems(items);
    }
  }

  updateItem(oldName: string, newName: string): void {
    const items = this.getAllItems();
    const index = items.findIndex(item => item.name === oldName);
    if (index !== -1) {
      items[index].name = newName.trim();
      this.saveItems(items);
    }
  }

  deleteItem(name: string): void {
    const items = this.getAllItems();
    const filtered = items.filter(item => item.name !== name);
    this.saveItems(filtered);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

