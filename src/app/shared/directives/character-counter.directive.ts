import { Directive, Input, ElementRef, Renderer2, OnInit, OnDestroy, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';

@Directive({
  selector: '[appCharacterCounter]',
  standalone: false
})
export class CharacterCounterDirective implements OnInit, OnDestroy {
  @Input() maxLength!: number;
  @Input() showWarningAt: number = 0.8; // Show warning at 80% of max length

  private counterElement!: HTMLElement;
  private destroy$ = new Subject<void>();
  private logger = inject(LoggerService);

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private ngControl: NgControl
  ) {}

  ngOnInit(): void {
    if (!this.maxLength) {
      this.logger.warn('CharacterCounterDirective: maxLength is required');
      return;
    }

    // Create counter element
    this.createCounterElement();

    // Listen to value changes
    if (this.ngControl.valueChanges) {
      this.ngControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.updateCounter();
        });
    }

    // Initial update
    this.updateCounter();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.counterElement) {
      this.renderer.removeChild(this.el.nativeElement.parentElement, this.counterElement);
    }
  }

  private createCounterElement(): void {
    this.counterElement = this.renderer.createElement('div');
    this.renderer.addClass(this.counterElement, 'character-counter');
    this.renderer.setStyle(this.counterElement, 'font-size', '12px');
    this.renderer.setStyle(this.counterElement, 'color', '#666');
    this.renderer.setStyle(this.counterElement, 'margin-top', '4px');
    this.renderer.setStyle(this.counterElement, 'text-align', 'right');

    // Insert after the input element's parent (usually mat-form-field)
    const parent = this.el.nativeElement.parentElement?.parentElement;
    if (parent) {
      this.renderer.appendChild(parent, this.counterElement);
    }
  }

  private updateCounter(): void {
    const value = this.ngControl.value || '';
    const currentLength = value.length;
    const remaining = this.maxLength - currentLength;
    const percentage = currentLength / this.maxLength;

    // Update text
    let text: string;
    if (remaining < 0) {
      text = `${Math.abs(remaining)} characters over limit`;
    } else {
      text = `${currentLength} / ${this.maxLength} characters`;
    }

    this.renderer.setProperty(this.counterElement, 'textContent', text);

    // Update color based on percentage
    let color: string;
    if (percentage >= 1) {
      color = '#DC3545'; // Error red
    } else if (percentage >= this.showWarningAt) {
      color = '#FFC107'; // Warning yellow
    } else {
      color = '#666'; // Default gray
    }

    this.renderer.setStyle(this.counterElement, 'color', color);
  }
}
