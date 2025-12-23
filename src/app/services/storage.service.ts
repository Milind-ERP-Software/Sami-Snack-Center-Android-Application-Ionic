import { Injectable } from '@angular/core';

export interface ProductionItem {
  listOfItem: string;
  qty: number;
  rate?: number;
  amount: number;
}

export interface ExpenseItem {
  listOfItem: string;
  qty: number;
  rate?: number;
  amount: number;
}

export interface IncomeItem {
  listOfItem: string;
  amount: number;
}

export interface DailyRecord {
  id?: string;
  date: string;
  chains: number;
  production: ProductionItem[];
  dailyExpenseList: ExpenseItem[];
  incomeItems: IncomeItem[];
  expectedIncome: number;
  dailyIncomeAmount: {
    gpay: number;
    paytm: number;
    cash: number;
    onDrawer: number;
    onOutsideOrder: number;
  };
  backMoneyInBag: number;
  todayWasteMaterialList: string;
  notes: string;
  todayPurchases?: {
    listOfItem: string;
    qty?: number;
    rate?: number;
    amount: number;
  }[];
  dailyProfit: {
    loss: number;
    profit: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_KEY = 'daily_records';
  private sampleDataInitialized = false;

  constructor() {
    this.fixDuplicateIds();
    this.initializeSampleData();
    this.createSeventhRecord();
  }

  // Fix any records with duplicate or missing IDs - reassign all IDs sequentially from 1
  private fixDuplicateIds(): void {
    const records = this.getAllRecords();
    if (records.length === 0) return;

    const idSet = new Set<string>();
    let hasDuplicates = false;
    let hasMissingIds = false;

    // Check for duplicates or missing IDs
    records.forEach(record => {
      if (!record.id) {
        hasMissingIds = true;
        hasDuplicates = true;
      } else if (idSet.has(record.id)) {
        hasDuplicates = true;
      } else {
        idSet.add(record.id);
      }
    });

    // If duplicates or missing IDs found, reassign all IDs sequentially starting from 1
    if (hasDuplicates || hasMissingIds) {
      let nextId = 1;
      records.forEach((record, index) => {
        record.id = nextId.toString();
        nextId++;
      });
      
      // Save fixed records
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    }
  }

  // Initialize sample data if no records exist
  private initializeSampleData(): void {
    const records = this.getAllRecords();
    if (records.length === 0 && !this.sampleDataInitialized) {
      const now = new Date().toISOString();
      let recordId = 1; // Start from 1 for sequential IDs
      const sampleRecords: DailyRecord[] = [
        {
          id: (recordId++).toString(),
          date: new Date().toISOString().split('T')[0],
          chains: 300,
          production: [
            { listOfItem: 'Idali', qty: 92, amount: 120 },
            { listOfItem: 'Menduwada (40 plate)', qty: 40, amount: 400 },
            { listOfItem: 'Dosa', qty: 50, amount: 300 }
          ],
          dailyExpenseList: [
            { listOfItem: 'Vegetables', qty: 5, amount: 200 },
            { listOfItem: 'Oil', qty: 2, amount: 300 }
          ],
          incomeItems: [
            { listOfItem: 'Dosa Kaka', amount: 30 },
            { listOfItem: 'Auto Dosa', amount: 37 },
            { listOfItem: 'Coconut Water', amount: 2 }
          ],
          expectedIncome: 1400,
          dailyIncomeAmount: {
            gpay: 400,
            paytm: 300,
            cash: 600,
            onDrawer: 100,
            onOutsideOrder: 50
          },
          backMoneyInBag: 60,
          todayWasteMaterialList: 'Rice, Lentils',
          notes: 'Good day with high sales',
          todayPurchases: [
            { listOfItem: 'Groceries', amount: 500 },
            { listOfItem: 'Vegetables', amount: 200 }
          ],
          dailyProfit: {
            loss: 100,
            profit: 1450
          },
          createdAt: now,
          updatedAt: now
        },
        {
          id: (recordId++).toString(),
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          chains: 250,
          production: [
            { listOfItem: 'Vada', qty: 60, amount: 180 },
            { listOfItem: 'Sambhar', qty: 30, amount: 150 },
            { listOfItem: 'Dosa', qty: 40, amount: 240 }
          ],
          dailyExpenseList: [
            { listOfItem: 'Oil', qty: 2, amount: 200 },
            { listOfItem: 'Vegetables', qty: 5, amount: 150 },
            { listOfItem: 'Spices', qty: 1, amount: 100 }
          ],
          incomeItems: [
            { listOfItem: 'Breakfast Combo', amount: 50 }
          ],
          expectedIncome: 1200,
          dailyIncomeAmount: {
            gpay: 350,
            paytm: 250,
            cash: 500,
            onDrawer: 80,
            onOutsideOrder: 40
          },
          backMoneyInBag: 50,
          todayWasteMaterialList: 'Oil residue',
          notes: 'Normal business day',
          todayPurchases: [
            { listOfItem: 'Spices', amount: 150 }
          ],
          dailyProfit: {
            loss: 350,
            profit: 1220
          },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: (recordId++).toString(),
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          chains: 400,
          production: [
            { listOfItem: 'Idali', qty: 120, amount: 150 },
            { listOfItem: 'Dosa', qty: 80, amount: 480 },
            { listOfItem: 'Uttapam', qty: 25, amount: 200 }
          ],
          dailyExpenseList: [
            { listOfItem: 'Vegetables', qty: 8, amount: 300 },
            { listOfItem: 'Spices', qty: 3, amount: 150 },
            { listOfItem: 'Gas', qty: 1, amount: 200 }
          ],
          incomeItems: [
            { listOfItem: 'Special Dosa', amount: 80 },
            { listOfItem: 'Masala Dosa', amount: 60 }
          ],
          expectedIncome: 1800,
          dailyIncomeAmount: {
            gpay: 600,
            paytm: 400,
            cash: 700,
            onDrawer: 150,
            onOutsideOrder: 100
          },
          backMoneyInBag: 100,
          todayWasteMaterialList: 'Extra batter',
          notes: 'Weekend rush - excellent sales',
          todayPurchases: [
            { listOfItem: 'Coconut', amount: 300 },
            { listOfItem: 'Rice', amount: 400 }
          ],
          dailyProfit: {
            loss: 400,
            profit: 1950
          },
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: (recordId++).toString(),
          date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
          chains: 350,
          production: [
            { listOfItem: 'Poha', qty: 45, amount: 225 },
            { listOfItem: 'Upma', qty: 35, amount: 175 },
            { listOfItem: 'Dosa', qty: 55, amount: 330 }
          ],
          dailyExpenseList: [
            { listOfItem: 'Vegetables', qty: 10, amount: 250 },
            { listOfItem: 'Spices', qty: 2, amount: 100 },
            { listOfItem: 'Oil', qty: 1, amount: 150 }
          ],
          incomeItems: [
            { listOfItem: 'Breakfast Plate', amount: 45 },
            { listOfItem: 'Tea', amount: 20 }
          ],
          expectedIncome: 1500,
          dailyIncomeAmount: {
            gpay: 500,
            paytm: 350,
            cash: 550,
            onDrawer: 120,
            onOutsideOrder: 60
          },
          backMoneyInBag: 75,
          todayWasteMaterialList: 'Leftover vegetables',
          notes: 'Steady morning business',
          todayPurchases: [
            { listOfItem: 'Lentils', amount: 250 }
          ],
          dailyProfit: {
            loss: 240,
            profit: 1580
          },
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          updatedAt: new Date(Date.now() - 259200000).toISOString()
        },
        {
          id: (recordId++).toString(),
          date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
          chains: 280,
          production: [
            { listOfItem: 'Idali', qty: 75, amount: 90 },
            { listOfItem: 'Vada', qty: 50, amount: 150 },
            { listOfItem: 'Sambhar', qty: 40, amount: 200 }
          ],
          dailyExpenseList: [
            { listOfItem: 'Vegetables', qty: 6, amount: 180 },
            { listOfItem: 'Spices', qty: 1, amount: 80 },
            { listOfItem: 'Gas', qty: 1, amount: 150 }
          ],
          incomeItems: [
            { listOfItem: 'Idali Vada Combo', amount: 55 },
            { listOfItem: 'Sambhar Bowl', amount: 40 }
          ],
          expectedIncome: 1100,
          dailyIncomeAmount: {
            gpay: 300,
            paytm: 250,
            cash: 450,
            onDrawer: 70,
            onOutsideOrder: 30
          },
          backMoneyInBag: 45,
          todayWasteMaterialList: 'Dal residue',
          notes: 'Regular weekday sales',
          todayPurchases: [
            { listOfItem: 'Dal', amount: 180 }
          ],
          dailyProfit: {
            loss: 240,
            profit: 1150
          },
          createdAt: new Date(Date.now() - 345600000).toISOString(),
          updatedAt: new Date(Date.now() - 345600000).toISOString()
        },
        {
          id: (recordId++).toString(),
          date: new Date(Date.now() - 432000000).toISOString().split('T')[0],
          chains: 450,
          production: [
            { listOfItem: 'Dosa', qty: 100, amount: 600 },
            { listOfItem: 'Uttapam', qty: 40, amount: 320 },
            { listOfItem: 'Rava Dosa', qty: 30, amount: 270 }
          ],
          dailyExpenseList: [
            { listOfItem: 'Oil', qty: 3, amount: 300 },
            { listOfItem: 'Vegetables', qty: 5, amount: 200 },
            { listOfItem: 'Spices', qty: 2, amount: 150 },
            { listOfItem: 'Gas', qty: 1, amount: 250 }
          ],
          incomeItems: [
            { listOfItem: 'Rava Dosa Special', amount: 90 },
            { listOfItem: 'Onion Uttapam', amount: 70 },
            { listOfItem: 'Plain Dosa', amount: 50 }
          ],
          expectedIncome: 2000,
          dailyIncomeAmount: {
            gpay: 700,
            paytm: 500,
            cash: 700,
            onDrawer: 180,
            onOutsideOrder: 120
          },
          backMoneyInBag: 120,
          todayWasteMaterialList: 'Extra rava, coconut shells',
          notes: 'High demand day - all items sold out',
          todayPurchases: [
            { listOfItem: 'Rava', amount: 200 },
            { listOfItem: 'Oil', amount: 350 }
          ],
          dailyProfit: {
            loss: 575,
            profit: 2200
          },
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          updatedAt: new Date(Date.now() - 432000000).toISOString()
        }
      ];

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sampleRecords));
      this.sampleDataInitialized = true;
    }
  }

  // Save a record
  saveRecord(record: DailyRecord): void {
    const records = this.getAllRecords();
    const now = new Date().toISOString();
    
    // Ensure record has a unique ID
    let recordWithId: DailyRecord;
    if (record.id) {
      // Record has ID - check if it exists
      const existingIndex = records.findIndex(r => r.id === record.id);
    if (existingIndex >= 0) {
      // Update existing record - keep createdAt, update updatedAt
        recordWithId = {
          ...record,
          createdAt: records[existingIndex].createdAt || now,
          updatedAt: now
        };
      records[existingIndex] = recordWithId;
      } else {
        // ID exists but record not found - might be new, generate new unique ID to be safe
        recordWithId = {
          ...record,
          id: this.generateId(),
          createdAt: now,
          updatedAt: now
        };
        records.push(recordWithId);
      }
    } else {
      // New record - generate unique ID
      recordWithId = {
        ...record,
        id: this.generateId(),
        createdAt: now,
        updatedAt: now
      };
      records.push(recordWithId);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
  }

  // Get all records - ensure IDs are fixed
  getAllRecords(): DailyRecord[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const records = data ? JSON.parse(data) : [];
    
    // Quick check for duplicates - if found, fix them
    const idSet = new Set<string>();
    let hasDuplicates = false;
    records.forEach((record: DailyRecord) => {
      if (!record.id || idSet.has(record.id)) {
        hasDuplicates = true;
      } else {
        idSet.add(record.id);
      }
    });
    
    // If duplicates found, fix them
    if (hasDuplicates) {
      this.fixDuplicateIds();
      return this.getAllRecords(); // Recursive call to get fixed records
    }
    
    return records;
  }

  // Get record by ID
  getRecordById(id: string): DailyRecord | null {
    const records = this.getAllRecords();
    return records.find(r => r.id === id) || null;
  }

  // Delete a record
  deleteRecord(id: string): void {
    const records = this.getAllRecords();
    const filtered = records.filter(r => r.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  // Clear all records
  clearAllRecords(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Create 7th record with all fields for patchValue testing
  private createSeventhRecord(): void {
    const records = this.getAllRecords();
    // Check if 7th record already exists
    if (records.length >= 7) {
      return;
    }

    // Create a comprehensive 7th record with all fields filled
    const seventhRecordDate = new Date(Date.now() - 518400000).toISOString().split('T')[0];
    const seventhRecordTimestamp = new Date(Date.now() - 518400000).toISOString();
    // Get next sequential ID
    let maxId = 0;
    records.forEach(record => {
      if (record.id) {
        const idNum = parseInt(record.id.toString(), 10);
        if (!isNaN(idNum) && idNum > maxId) {
          maxId = idNum;
        }
      }
    });
    const seventhRecord: DailyRecord = {
      id: (maxId + 1).toString(),
      date: seventhRecordDate, // 6 days ago
      chains: 500,
      production: [
        { listOfItem: 'Idali', qty: 100, amount: 130 },
        { listOfItem: 'Dosa', qty: 80, amount: 480 },
        { listOfItem: 'Vada', qty: 60, amount: 180 },
        { listOfItem: 'Uttapam', qty: 35, amount: 280 },
        { listOfItem: 'Sambhar', qty: 50, amount: 250 }
      ],
      dailyExpenseList: [
        { listOfItem: 'Vegetables', qty: 10, amount: 200 },
        { listOfItem: 'Oil', qty: 5, amount: 500 },
        { listOfItem: 'Spices', qty: 3, amount: 150 },
        { listOfItem: 'Gas', qty: 2, amount: 300 }
      ],
      incomeItems: [
        { listOfItem: 'Catering', amount: 500 },
        { listOfItem: 'Delivery', amount: 300 },
        { listOfItem: 'Takeaway', amount: 200 },
        { listOfItem: 'Dine-in', amount: 400 }
      ],
      expectedIncome: 2500,
      dailyIncomeAmount: {
        gpay: 800,
        paytm: 600,
        cash: 900,
        onDrawer: 200,
        onOutsideOrder: 150
      },
      backMoneyInBag: 150,
      todayWasteMaterialList: 'Rice, Lentils, Vegetables, Oil residue, Spice containers',
      notes: 'Complete test record with all fields filled for patchValue testing. This record contains multiple production items, expense items, and income items to test dropdown value patching functionality.',
      todayPurchases: [
        { listOfItem: 'Groceries', amount: 600 },
        { listOfItem: 'Vegetables', amount: 300 },
        { listOfItem: 'Spices', amount: 200 }
      ],
      dailyProfit: {
        loss: 1150,
        profit: 2650
      },
      createdAt: seventhRecordTimestamp,
      updatedAt: seventhRecordTimestamp
    };

    records.push(seventhRecord);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
  }

  // Generate unique sequential ID (1, 2, 3, 4...)
  private generateId(): string {
    const records = this.getAllRecords();
    
    // Find the highest numeric ID
    let maxId = 0;
    records.forEach(record => {
      if (record.id) {
        // Try to parse ID as number, handle both string and number IDs
        const idNum = parseInt(record.id.toString(), 10);
        if (!isNaN(idNum) && idNum > maxId) {
          maxId = idNum;
        }
      }
    });
    
    // Return next sequential ID as string
    return (maxId + 1).toString();
  }
}

