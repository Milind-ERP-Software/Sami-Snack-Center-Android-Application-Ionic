import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'daily-form',
    loadComponent: () => import('./daily-form/daily-form.page').then((m) => m.DailyFormPage),
  },
  {
    path: 'daily-form/:id',
    loadComponent: () => import('./daily-form/daily-form.page').then((m) => m.DailyFormPage),
  },
  {
    path: 'production-items',
    loadComponent: () => import('./production-items/production-items.page').then((m) => m.ProductionItemsPage),
  },
  {
    path: 'expense-items',
    loadComponent: () => import('./expense-items/expense-items.page').then((m) => m.ExpenseItemsPage),
  },
  {
    path: 'income-items',
    loadComponent: () => import('./income-items/income-items.page').then((m) => m.IncomeItemsPage),
  },
  {
    path: 'purchase-items',
    loadComponent: () => import('./purchase-items/purchase-items.page').then((m) => m.PurchaseItemsPage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: 'calculations',
    loadComponent: () => import('./calculations/calculations.page').then((m) => m.CalculationsPage),
  },
  {
    path: 'reports',
    loadComponent: () => import('./reports/reports.page').then((m) => m.ReportsPage),
  },
  {
    path: 'reports/sales-report',
    loadComponent: () => import('./reports/sales-report/sales-report.page').then((m) => m.SalesReportPage),
  },
  {
    path: 'reports/purchase-report',
    loadComponent: () => import('./reports/purchase-report/purchase-report.page').then((m) => m.PurchaseReportPage),
  },
  {
    path: 'reports/profit-loss-report',
    loadComponent: () => import('./reports/profit-loss-report/profit-loss-report.page').then((m) => m.ProfitLossReportPage),
  },
  {
    path: 'reports/expense-report',
    loadComponent: () => import('./reports/expense-report/expense-report.page').then((m) => m.ExpenseReportPage),
  },
  {
    path: 'reports/grocery-buy-report',
    loadComponent: () => import('./reports/grocery-buy-report/grocery-buy-report.page').then((m) => m.GroceryBuyReportPage),
  },
  {
    path: 'notifications',
    loadComponent: () => import('./notifications/notifications.page').then((m) => m.NotificationsPage),
  },
  {
    path: 'calculations/menduwada-idali',
    loadComponent: () => import('./calculations/menduwada-idali/menduwada-idali.page').then((m) => m.MenduwadaIdaliPage),
  },
  {
    path: 'calculations/menduwada-idali-retail',
    loadComponent: () => import('./calculations/menduwada-idali-retail/menduwada-idali-retail.page').then((m) => m.MenduwadaIdaliRetailPage),
  },
  {
    path: 'calculations/production-menduwada',
    loadComponent: () => import('./calculations/production-menduwada/production-menduwada.page').then((m) => m.ProductionMenduwadaPage),
  },
  {
    path: 'calculations/production-idali',
    loadComponent: () => import('./calculations/production-idali/production-idali.page').then((m) => m.ProductionIdaliPage),
  },
  {
    path: 'calculations/production-dosa',
    loadComponent: () => import('./calculations/production-dosa/production-dosa.page').then((m) => m.ProductionDosaPage),
  },
  {
    path: 'calculations/production-dal-wada',
    loadComponent: () => import('./calculations/production-dal-wada/production-dal-wada.page').then((m) => m.ProductionDalWadaPage),
  },
  {
    path: 'calculations/production-poha',
    loadComponent: () => import('./calculations/production-poha/production-poha.page').then((m) => m.ProductionPohaPage),
  },
  {
    path: 'calculations/production-upma',
    loadComponent: () => import('./calculations/production-upma/production-upma.page').then((m) => m.ProductionUpmaPage),
  },
  {
    path: 'calculations/production-samosa',
    loadComponent: () => import('./calculations/production-samosa/production-samosa.page').then((m) => m.ProductionSamosaPage),
  },
  {
    path: 'calculations/production-dokla',
    loadComponent: () => import('./calculations/production-dokla/production-dokla.page').then((m) => m.ProductionDoklaPage),
  },
  {
    path: 'calculations/production-wada-pav',
    loadComponent: () => import('./calculations/production-wada-pav/production-wada-pav.page').then((m) => m.ProductionWadaPavPage),
  },
  {
    path: 'calculations/production-sambhar',
    loadComponent: () => import('./calculations/production-sambhar/production-sambhar.page').then((m) => m.ProductionSambharPage),
  },
  {
    path: 'calculations/production-white-chatni',
    loadComponent: () => import('./calculations/production-white-chatni/production-white-chatni.page').then((m) => m.ProductionWhiteChatniPage),
  },
  {
    path: 'calculations/production-sabudana-khichadi',
    loadComponent: () => import('./calculations/production-sabudana-khichadi/production-sabudana-khichadi.page').then((m) => m.ProductionSabudanaKhichadiPage),
  },
  {
    path: 'calculations/production-sabudana-wada',
    loadComponent: () => import('./calculations/production-sabudana-wada/production-sabudana-wada.page').then((m) => m.ProductionSabudanaWadaPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
