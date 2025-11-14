import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { take } from 'rxjs/operators';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private promptEvent: any;
  private installPromptSubject = new BehaviorSubject<boolean>(false);
  public canInstall$ = this.installPromptSubject.asObservable();

  private isInstalledSubject = new BehaviorSubject<boolean>(this.checkIfInstalled());
  public isInstalled$ = this.isInstalledSubject.asObservable();

  constructor(private logger: LoggerService) {
    this.initPwaPrompt();
    this.listenForInstallation();
  }

  /**
   * Initialize PWA install prompt listener
   */
  private initPwaPrompt(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (event: any) => {
        event.preventDefault();
        this.promptEvent = event;
        this.installPromptSubject.next(true);
      });
    }
  }

  /**
   * Listen for app installation
   */
  private listenForInstallation(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('appinstalled', () => {
        this.promptEvent = null;
        this.installPromptSubject.next(false);
        this.isInstalledSubject.next(true);
        this.logger.debug('PWA installed successfully');
      });
    }
  }

  /**
   * Check if app is already installed
   */
  private checkIfInstalled(): boolean {
    if (typeof window === 'undefined') return false;

    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebApp = (window.navigator as any).standalone === true;

    return isStandalone || isInWebApp;
  }

  /**
   * Prompt user to install the app
   */
  public async promptInstall(): Promise<boolean> {
    if (!this.promptEvent) {
      this.logger.warn('Install prompt not available');
      return false;
    }

    // Show the install prompt
    this.promptEvent.prompt();

    // Wait for user response
    const result = await this.promptEvent.userChoice;

    if (result.outcome === 'accepted') {
      this.logger.debug('User accepted the install prompt');
      return true;
    } else {
      this.logger.debug('User dismissed the install prompt');
      return false;
    }
  }

  /**
   * Check if PWA installation is supported
   */
  public isInstallSupported(): boolean {
    return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
  }

  /**
   * Check if device is iOS
   */
  public isIOS(): boolean {
    if (typeof window === 'undefined') return false;

    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }

  /**
   * Check if device is running in Safari (iOS)
   */
  public isInSafari(): boolean {
    if (typeof window === 'undefined') return false;

    const userAgent = window.navigator.userAgent.toLowerCase();
    return this.isIOS() && userAgent.includes('safari') && !userAgent.includes('chrome');
  }
}
