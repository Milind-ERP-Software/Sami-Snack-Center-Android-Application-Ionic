import { Injectable, EventEmitter } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

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
  label?: string;
  paid?: boolean; // true if paid, false if unpaid (default: true for backward compatibility)
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
    paid?: boolean; // true if paid, false if unpaid (default: true for backward compatibility)
  }[];
  dailyProfit: {
    loss: number;
    profit: number;
  };
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_KEY = 'daily_records';
  private _storage: Storage | null = null;
  private _records: DailyRecord[] = []; // In-memory cache
  developerModeChanged = new EventEmitter<boolean>();
  companyNameChanged = new EventEmitter<string>();
  companyLogoChanged = new EventEmitter<string>();

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/1ee2aeda-2639-4067-92ed-c7bc42374a29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.service.ts:73',message:'init START',data:{_storageExists:!!this._storage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // If already initialized, return
    if (this._storage) {
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/1ee2aeda-2639-4067-92ed-c7bc42374a29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.service.ts:76',message:'init EARLY RETURN - already initialized',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return;
    }

    try {
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/1ee2aeda-2639-4067-92ed-c7bc42374a29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.service.ts:79',message:'BEFORE storage.create()',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Add timeout to prevent hanging on Android
      const storage = await Promise.race([
        this.storage.create(),
        new Promise<Storage>((_, reject) => 
          setTimeout(() => reject(new Error('Storage.create() timeout after 8 seconds')), 8000)
        )
      ]);
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/1ee2aeda-2639-4067-92ed-c7bc42374a29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.service.ts:80',message:'AFTER storage.create()',data:{storageCreated:!!storage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      this._storage = storage;

      // Load records into memory
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/1ee2aeda-2639-4067-92ed-c7bc42374a29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.service.ts:83',message:'BEFORE _storage.get()',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const stored = await Promise.race([
        this._storage.get(this.STORAGE_KEY),
        new Promise<string | null>((_, reject) => 
          setTimeout(() => reject(new Error('Storage.get() timeout after 5 seconds')), 5000)
        )
      ]).catch(() => null); // Return null on timeout instead of throwing
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/1ee2aeda-2639-4067-92ed-c7bc42374a29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.service.ts:84',message:'AFTER _storage.get()',data:{storedExists:!!stored,storedLength:stored?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      if (stored) {
        try {
          this._records = JSON.parse(stored);
        } catch (parseError) {
          console.error('Error parsing stored records:', parseError);
          this._records = [];
        }
      } else {
        this._records = [];
      }
      
      // Perform initial checks with timeout protection
      try {
        await Promise.race([
          this.fixDuplicateIds(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('fixDuplicateIds timeout')), 3000))
        ]).catch((err) => console.warn('fixDuplicateIds error:', err));
      } catch (error) {
        console.warn('fixDuplicateIds failed:', error);
      }
      
      try {
        await Promise.race([
          this.initializeSampleData(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('initializeSampleData timeout')), 5000))
        ]).catch((err) => console.warn('initializeSampleData error:', err));
      } catch (error) {
        console.warn('initializeSampleData failed:', error);
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/1ee2aeda-2639-4067-92ed-c7bc42374a29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.service.ts:91',message:'init COMPLETED',data:{recordsCount:this._records.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/1ee2aeda-2639-4067-92ed-c7bc42374a29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.service.ts:93',message:'ERROR in init',data:{errorMessage:error instanceof Error?error.message:String(error),errorStack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.error('Storage init error:', error);
      // Initialize with empty records instead of throwing
      this._records = [];
      // Don't throw - allow app to continue with empty storage
    }
  }

  // Ensure storage is ready before any operation
  private async ensureInitialized() {
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/1ee2aeda-2639-4067-92ed-c7bc42374a29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.service.ts:96',message:'ensureInitialized START',data:{_storageExists:!!this._storage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!this._storage) {
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/1ee2aeda-2639-4067-92ed-c7bc42374a29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.service.ts:98',message:'ensureInitialized calling init',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Add timeout to prevent hanging
      await Promise.race([
        this.init(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Storage initialization timeout')), 10000)
        )
      ]).catch((error) => {
        console.error('Storage initialization error:', error);
        // Continue with empty storage if init fails
        if (!this._storage) {
          this._records = [];
        }
      });
    }
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/1ee2aeda-2639-4067-92ed-c7bc42374a29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.service.ts:100',message:'ensureInitialized COMPLETED',data:{_storageExists:!!this._storage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
  }

  // Fix any records with duplicate or missing IDs - reassign all IDs sequentially from 1
  private async fixDuplicateIds(): Promise<void> {
    if (this._records.length === 0) return;

    const idSet = new Set<string>();
    let hasDuplicates = false;
    let hasMissingIds = false;

    // Check for duplicates or missing IDs
    this._records.forEach(record => {
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
      this._records.forEach((record) => {
        record.id = nextId.toString();
        nextId++;
      });
      
      // Save fixed records
      await this.saveRecordsToStorage();
    }
  }

  // Initialize sample data if no records exist or less than 33 records
  private async initializeSampleData(): Promise<void> {
    const targetRecords = 33;
    if (this._records.length < targetRecords) {
      const now = new Date().toISOString();
      // Get the highest existing ID or start from 1
      let maxId = 0;
      if (this._records.length > 0) {
        maxId = Math.max(...this._records.map(r => parseInt(r.id || '0', 10)));
      }
      let recordId = maxId + 1;
      const sampleRecords: DailyRecord[] = [...this._records]; // Keep existing records
      const recordsToAdd = targetRecords - this._records.length;
      
      // Production items variations
      const productionVariations = [
        [
          { listOfItem: 'Idali', qty: 92, amount: 120 },
          { listOfItem: 'Menduwada (40 plate)', qty: 40, amount: 400 },
          { listOfItem: 'Dosa', qty: 50, amount: 300 }
        ],
        [
          { listOfItem: 'Vada', qty: 60, amount: 180 },
          { listOfItem: 'Sambhar', qty: 30, amount: 150 },
          { listOfItem: 'Dosa', qty: 40, amount: 240 }
        ],
        [
          { listOfItem: 'Idali', qty: 80, amount: 100 },
          { listOfItem: 'Dosa', qty: 60, amount: 360 },
          { listOfItem: 'Uttapam', qty: 25, amount: 250 }
        ],
        [
          { listOfItem: 'Poha', qty: 50, amount: 200 },
          { listOfItem: 'Upma', qty: 40, amount: 160 },
          { listOfItem: 'Dosa', qty: 45, amount: 270 }
        ],
        [
          { listOfItem: 'Menduwada (40 plate)', qty: 35, amount: 350 },
          { listOfItem: 'Sambhar', qty: 40, amount: 200 },
          { listOfItem: 'Idali', qty: 75, amount: 90 }
        ]
      ];
      
      // Expense variations
      const expenseVariations = [
        [
          { listOfItem: 'Vegetables', qty: 5, amount: 200 },
          { listOfItem: 'Oil', qty: 2, amount: 300 }
        ],
        [
          { listOfItem: 'Oil', qty: 2, amount: 200 },
          { listOfItem: 'Vegetables', qty: 5, amount: 150 },
          { listOfItem: 'Spices', qty: 1, amount: 100 }
        ],
        [
          { listOfItem: 'Gas', qty: 1, amount: 500 },
          { listOfItem: 'Electricity', qty: 1, amount: 300 }
        ],
        [
          { listOfItem: 'Vegetables', qty: 6, amount: 250 },
          { listOfItem: 'Oil', qty: 3, amount: 450 }
        ],
        [
          { listOfItem: 'Spices', qty: 2, amount: 200 },
          { listOfItem: 'Rice', qty: 10, amount: 400 }
        ]
      ];
      
      // Income item variations
      const incomeVariations = [
        [
          { listOfItem: 'Dosa Kaka', amount: 30 },
          { listOfItem: 'Auto Dosa', amount: 37 },
          { listOfItem: 'Coconut Water', amount: 2 }
        ],
        [
          { listOfItem: 'Breakfast Combo', amount: 50 }
        ],
        [
          { listOfItem: 'Dosa Kaka', amount: 25 },
          { listOfItem: 'Auto Dosa', amount: 30 }
        ],
        [
          { listOfItem: 'Coconut Water', amount: 5 },
          { listOfItem: 'Tea', amount: 20 }
        ],
        [
          { listOfItem: 'Dosa Kaka', amount: 40 },
          { listOfItem: 'Auto Dosa', amount: 45 },
          { listOfItem: 'Coconut Water', amount: 3 }
        ]
      ];
      
      // Notes variations
      const notesVariations = [
        'Good day with high sales',
        'Normal business day',
        'Busy day, good sales',
        'Average day',
        'Slow day',
        'Excellent sales today',
        'Holiday rush',
        'Regular business',
        'High customer turnout',
        'Steady sales'
      ];
      
      // Generate records for the past days (starting from the oldest existing record date or today)
      const startDate = this._records.length > 0 
        ? new Date(this._records[this._records.length - 1].date)
        : new Date();
      
      for (let i = 0; i < recordsToAdd; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() - (i + 1)); // Go back one day from the last record
        const dateStr = date.toISOString().split('T')[0];
        const dateObj = new Date(dateStr);
        
        // Vary the data
        const prodIndex = i % productionVariations.length;
        const expIndex = i % expenseVariations.length;
        const incIndex = i % incomeVariations.length;
        const noteIndex = i % notesVariations.length;
        
        // Vary chains (200-400)
        const chains = 200 + (i % 201);
        
        // Vary expected income (1000-1500)
        const expectedIncome = 1000 + (i % 501);
        
        // Calculate income amounts
        const totalIncome = expectedIncome + (i % 200) - 50; // Vary around expected
        const gpay = Math.floor(totalIncome * 0.3);
        const paytm = Math.floor(totalIncome * 0.25);
        const cash = Math.floor(totalIncome * 0.35);
        const onDrawer = Math.floor(totalIncome * 0.05);
        const onOutsideOrder = Math.floor(totalIncome * 0.05);
        
        // Calculate expenses
        const totalExpense = expenseVariations[expIndex].reduce((sum, item) => sum + item.amount, 0);
        
        // Calculate profit
        const profit = totalIncome - totalExpense;
        const loss = profit < 0 ? Math.abs(profit) : 0;
        const netProfit = profit > 0 ? profit : 0;
        
        // Back money (40-80)
        const backMoney = 40 + (i % 41);
        
        const record: DailyRecord = {
          id: (recordId++).toString(),
          date: dateStr,
          chains: chains,
          production: productionVariations[prodIndex],
          dailyExpenseList: expenseVariations[expIndex],
          incomeItems: incomeVariations[incIndex],
          expectedIncome: expectedIncome,
          dailyIncomeAmount: {
            gpay: gpay,
            paytm: paytm,
            cash: cash,
            onDrawer: onDrawer,
            onOutsideOrder: onOutsideOrder
          },
          backMoneyInBag: backMoney,
          todayWasteMaterialList: i % 3 === 0 ? 'Rice, Lentils' : i % 3 === 1 ? 'Oil residue' : '',
          notes: notesVariations[noteIndex],
          todayPurchases: i % 2 === 0 ? [
            { listOfItem: 'Groceries', amount: 300 + (i % 300) },
            { listOfItem: 'Vegetables', amount: 150 + (i % 150) }
          ] : [
            { listOfItem: 'Spices', amount: 100 + (i % 100) }
          ],
          dailyProfit: {
            loss: loss,
            profit: netProfit
          },
          createdAt: dateObj.toISOString(),
          updatedAt: dateObj.toISOString()
        };
        
        sampleRecords.push(record);
      }

      // Sort by date (newest first)
      sampleRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      this._records = sampleRecords;
      await this.saveRecordsToStorage();
    }
  }

  // Helper to save current in-memory records to storage
  private async saveRecordsToStorage(): Promise<void> {
    if (this._storage) {
      await this._storage.set(this.STORAGE_KEY, JSON.stringify(this._records));
    }
  }

  // Public API - Now Async

  async getAllRecords(includeDeleted: boolean = false): Promise<DailyRecord[]> {
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/1ee2aeda-2639-4067-92ed-c7bc42374a29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.service.ts:336',message:'getAllRecords START',data:{includeDeleted},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      await Promise.race([
        this.ensureInitialized(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('ensureInitialized timeout')), 10000)
        )
      ]);
    } catch (error) {
      console.error('getAllRecords: ensureInitialized failed:', error);
      // Return empty array if initialization fails
      return [];
    }
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/1ee2aeda-2639-4067-92ed-c7bc42374a29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.service.ts:338',message:'getAllRecords after ensureInitialized',data:{_recordsCount:this._records.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Return a copy to prevent direct mutation
    const result = includeDeleted ? [...this._records] : [...this._records].filter(record => !record.isDeleted);
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/1ee2aeda-2639-4067-92ed-c7bc42374a29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.service.ts:342',message:'getAllRecords COMPLETED',data:{resultCount:result.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return result;
  }

  async getRecordById(id: string): Promise<DailyRecord | undefined> {
    await this.ensureInitialized();
    return this._records.find(record => record.id === id);
  }

  async saveRecord(record: DailyRecord): Promise<void> {
    await this.ensureInitialized();
    
    // Assign new ID if not present (using sequential logic)
    if (!record.id) {
      const maxId = this._records.reduce((max, r) => {
        const idNum = parseInt(r.id || '0', 10);
        return idNum > max ? idNum : max;
      }, 0);
      record.id = (maxId + 1).toString();
      record.createdAt = new Date().toISOString();
    }
    
    record.updatedAt = new Date().toISOString();
    
    this._records.unshift(record); // Add to beginning
    await this.saveRecordsToStorage();
  }

  async updateRecord(updatedRecord: DailyRecord): Promise<void> {
    await this.ensureInitialized();
    
    const index = this._records.findIndex(r => r.id === updatedRecord.id);
    if (index !== -1) {
      updatedRecord.updatedAt = new Date().toISOString();
      this._records[index] = updatedRecord;
      await this.saveRecordsToStorage();
    }
  }

  async deleteRecord(id: string): Promise<void> {
    await this.ensureInitialized();
    
    const index = this._records.findIndex(r => r.id === id);
    if (index !== -1) {
      // Soft delete: mark as deleted instead of removing
      this._records[index].isDeleted = true;
      this._records[index].deletedAt = new Date().toISOString();
      this._records[index].updatedAt = new Date().toISOString();
      await this.saveRecordsToStorage();
    }
  }

  async restoreRecord(id: string): Promise<void> {
    await this.ensureInitialized();
    
    const index = this._records.findIndex(r => r.id === id);
    if (index !== -1) {
      // Restore: unmark as deleted
      this._records[index].isDeleted = false;
      this._records[index].deletedAt = undefined;
      this._records[index].updatedAt = new Date().toISOString();
      await this.saveRecordsToStorage();
    }
  }

  async permanentDeleteRecord(id: string): Promise<void> {
    await this.ensureInitialized();
    
    const index = this._records.findIndex(r => r.id === id);
    if (index !== -1) {
      // Permanent delete: actually remove from array
      this._records.splice(index, 1);
      await this.saveRecordsToStorage();
    }
  }

  // Optimized bulk delete - updates all records in memory, then saves once
  async bulkDeleteRecords(ids: string[]): Promise<number> {
    await this.ensureInitialized();
    
    if (ids.length === 0) return 0;
    
    const idSet = new Set(ids);
    const now = new Date().toISOString();
    let deletedCount = 0;
    
    // Update all records in memory first (single pass)
    for (let i = 0; i < this._records.length; i++) {
      if (idSet.has(this._records[i].id || '')) {
        this._records[i].isDeleted = true;
        this._records[i].deletedAt = now;
        this._records[i].updatedAt = now;
        deletedCount++;
      }
    }
    
    // Save to storage only once
    if (deletedCount > 0) {
      await this.saveRecordsToStorage();
    }
    
    return deletedCount;
  }

  async clearAll(): Promise<void> {
    await this.ensureInitialized();
    if (this._storage) {
      await this._storage.clear();
      // Also clear notifications explicitly
      await this._storage.remove('notifications');
    }
    this._records = [];
  }

  async importRecords(records: DailyRecord[]): Promise<void> {
    await this.ensureInitialized();
    this._records = records;
    await this.saveRecordsToStorage();
  }

  // Generic storage methods for key-value pairs
  async get(key: string): Promise<string | null> {
    await this.ensureInitialized();
    if (this._storage) {
      return await this._storage.get(key);
    }
    return null;
  }

  async set(key: string, value: string): Promise<void> {
    await this.ensureInitialized();
    if (this._storage) {
      await this._storage.set(key, value);
      // Emit events when settings change
      if (key === 'developer_mode') {
        this.developerModeChanged.emit(value === 'true');
      } else if (key === 'company_name') {
        this.companyNameChanged.emit(value);
      } else if (key === 'company_logo') {
        this.companyLogoChanged.emit(value);
      }
    }
  }
}
