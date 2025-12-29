import { Injectable, EventEmitter, OnDestroy } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class ThemeService implements OnDestroy {
  private readonly THEME_KEY = 'app_theme';
  private readonly THEME_MODE_KEY = 'app_theme_mode';
  private currentTheme: 'light' | 'dark' = 'light';
  private themeMode: 'light' | 'dark' | 'system' = 'system';
  private systemPreferenceQuery?: MediaQueryList;
  private systemPreferenceListener?: (e: MediaQueryListEvent) => void;
  private _storage: Storage | null = null;
  themeChanged = new EventEmitter<boolean>();

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    if (this._storage) {
      return;
    }
    const storage = await this.storage.create();
    this._storage = storage;
    
    await this.loadTheme();
  }

  private async ensureInitialized() {
    if (!this._storage) {
      await this.init();
    }
  }

  async loadTheme(): Promise<void> {
    if (!this._storage) return;

    const savedMode = await this._storage.get(this.THEME_MODE_KEY) as 'light' | 'dark' | 'system' | null;
    
    if (savedMode === 'light' || savedMode === 'dark') {
      // Manual mode - use saved preference
      this.themeMode = savedMode;
      this.setTheme(savedMode);
    } else {
      // System mode (default) - automatically detect
      this.themeMode = 'system';
      this.listenToSystemPreference();
    }
  }

  private listenToSystemPreference(): void {
    // Remove existing listener if any
    if (this.systemPreferenceListener && this.systemPreferenceQuery) {
      this.systemPreferenceQuery.removeEventListener('change', this.systemPreferenceListener);
    }

    // Check if matchMedia is supported
    if (typeof window !== 'undefined' && window.matchMedia) {
      // Check system preference
      this.systemPreferenceQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const prefersDark = this.systemPreferenceQuery.matches;
      
      // Apply theme immediately based on system preference
      this.setTheme(prefersDark ? 'dark' : 'light');

      // Listen for system preference changes in real-time
      this.systemPreferenceListener = (e: MediaQueryListEvent) => {
        if (this.themeMode === 'system') {
          // Automatically update theme when system preference changes
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      };
      
      // Use addEventListener for modern browsers, addListener for older browsers
      if (this.systemPreferenceQuery.addEventListener) {
        this.systemPreferenceQuery.addEventListener('change', this.systemPreferenceListener);
      } else if (this.systemPreferenceQuery.addListener) {
        // Fallback for older browsers
        this.systemPreferenceQuery.addListener(this.systemPreferenceListener);
      }
    } else {
      // Fallback if matchMedia is not supported - default to light
      this.setTheme('light');
    }
  }

  async setThemeMode(mode: 'light' | 'dark' | 'system'): Promise<void> {
    await this.ensureInitialized();
    this.themeMode = mode;
    if (this._storage) {
      await this._storage.set(this.THEME_MODE_KEY, mode);
    }

    if (mode === 'system') {
      // Enable automatic detection
      this.listenToSystemPreference();
    } else {
      // Remove system listener when in manual mode
      if (this.systemPreferenceListener && this.systemPreferenceQuery) {
        if (this.systemPreferenceQuery.removeEventListener) {
          this.systemPreferenceQuery.removeEventListener('change', this.systemPreferenceListener);
        } else if (this.systemPreferenceQuery.removeListener) {
          // Fallback for older browsers
          this.systemPreferenceQuery.removeListener(this.systemPreferenceListener);
        }
      }
      // Set manual theme
      this.setTheme(mode);
    }
  }

  getThemeMode(): 'light' | 'dark' | 'system' {
    return this.themeMode;
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme = theme;
    const body = document.body;
    
    if (theme === 'dark') {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
    
    // Only save theme if in manual mode
    if (this.themeMode !== 'system') {
      // We don't await here to avoid UI blocking, just fire and forget
      if (this._storage) {
        this._storage.set(this.THEME_KEY, theme);
      }
    }
    
    this.themeChanged.emit(theme === 'dark');
  }

  toggleTheme(): void {
    if (this.themeMode === 'system') {
      // If in system mode, switch to manual dark mode
      this.setThemeMode('dark');
    } else {
      // Toggle between light and dark
      const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      this.setThemeMode(newTheme);
    }
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  isDarkMode(): boolean {
    return this.currentTheme === 'dark';
  }

  ngOnDestroy(): void {
    if (this.systemPreferenceListener && this.systemPreferenceQuery) {
      this.systemPreferenceQuery.removeEventListener('change', this.systemPreferenceListener);
    }
  }
}
