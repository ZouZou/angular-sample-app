import { Directive, HostListener, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appPhoneMask]',
  standalone: false
})
export class PhoneMaskDirective {
  constructor(
    private el: ElementRef,
    private ngControl: NgControl
  ) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove all non-digits

    // Limit to 10 digits
    if (value.length > 10) {
      value = value.substring(0, 10);
    }

    // Format as (XXX) XXX-XXXX
    let formatted = '';
    if (value.length > 0) {
      formatted = '(' + value.substring(0, 3);
      if (value.length > 3) {
        formatted += ') ' + value.substring(3, 6);
        if (value.length > 6) {
          formatted += '-' + value.substring(6, 10);
        }
      }
    }

    // Update the control value (unformatted for form validation)
    if (this.ngControl.control) {
      this.ngControl.control.setValue(value, { emitEvent: false });
    }

    // Update the displayed value (formatted)
    input.value = formatted;
  }

  @HostListener('blur')
  onBlur(): void {
    // Optional: Add additional formatting on blur
  }
}
