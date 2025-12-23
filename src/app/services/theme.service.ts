import { Injectable, EventEmitter, OnDestroy } from '@angular/core';

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
  themeChanged = new EventEmitter<boolean>();

  constructor() {
    this.loadTheme();
  }

  loadTheme(): void {
    const savedMode = localStorage.getItem(this.THEME_MODE_KEY) as 'light' | 'dark' | 'system' | null;
    
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

  setThemeMode(mode: 'light' | 'dark' | 'system'): void {
    this.themeMode = mode;
    localStorage.setItem(this.THEME_MODE_KEY, mode);

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
      localStorage.setItem(this.THEME_KEY, theme);
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

