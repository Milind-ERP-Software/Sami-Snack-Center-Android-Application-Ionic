import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private themeService: ThemeService
  ) {}

  async ngOnInit() {
    // Initialize theme - automatically detect system preference
    this.themeService.loadTheme();
    
    // Listen to theme changes to update status bar
    this.themeService.themeChanged.subscribe((isDark: boolean) => {
      if (Capacitor.isNativePlatform()) {
        this.updateStatusBar(isDark);
      }
    });
    
    if (Capacitor.isNativePlatform()) {
      try {
        const isDark = this.themeService.isDarkMode();
        await this.updateStatusBar(isDark);
      } catch (error) {
        console.log('StatusBar not available:', error);
      }
    }
  }

  private async updateStatusBar(isDark: boolean) {
    try {
      await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
      await StatusBar.setBackgroundColor({ color: '#0066CC' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (error) {
      console.log('StatusBar update error:', error);
    }
  }
}
