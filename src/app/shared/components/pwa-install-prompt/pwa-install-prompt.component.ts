import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PwaService } from '../../services/pwa.service';

@Component({
  selector: 'app-pwa-install-prompt',
  templateUrl: './pwa-install-prompt.component.html',
  styleUrls: ['./pwa-install-prompt.component.css'],
  standalone: false
})
export class PwaInstallPromptComponent implements OnInit, OnDestroy {
  showPrompt = false;
  showIOSInstructions = false;
  private destroy$ = new Subject<void>();

  constructor(public pwaService: PwaService) {}

  ngOnInit(): void {
    // Check if iOS and in Safari (needs manual installation instructions)
    if (this.pwaService.isIOS() && this.pwaService.isInSafari()) {
      this.pwaService.isInstalled$
        .pipe(takeUntil(this.destroy$))
        .subscribe(isInstalled => {
          if (!isInstalled) {
            // Show iOS instructions after a delay
            setTimeout(() => {
              const hasSeenPrompt = localStorage.getItem('ios-install-prompt-dismissed');
              if (!hasSeenPrompt) {
                this.showIOSInstructions = true;
              }
            }, 3000);
          }
        });
    } else {
      // For other platforms, use the beforeinstallprompt event
      this.pwaService.canInstall$
        .pipe(takeUntil(this.destroy$))
        .subscribe(canInstall => {
          if (canInstall) {
            // Show install prompt after a delay
            setTimeout(() => {
              const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
              if (!hasSeenPrompt) {
                this.showPrompt = true;
              }
            }, 3000);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async install(): Promise<void> {
    const accepted = await this.pwaService.promptInstall();
    if (accepted) {
      this.showPrompt = false;
    }
  }

  dismiss(): void {
    this.showPrompt = false;
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
  }

  dismissIOSInstructions(): void {
    this.showIOSInstructions = false;
    localStorage.setItem('ios-install-prompt-dismissed', 'true');
  }
}
