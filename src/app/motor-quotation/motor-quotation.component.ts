import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

interface QuoteResult {
  premium: number;
  coverageType: string;
  deductible: number;
}

@Component({
  standalone: false,
  selector: 'app-motor-quotation',
  templateUrl: './motor-quotation.component.html',
  styleUrls: ['./motor-quotation.component.css']
})
export class MotorQuotationComponent implements OnInit {
  currentStep = 0;
  isLinear = true;
  isMobile = false;

  vehicleFormGroup!: FormGroup;
  personalFormGroup!: FormGroup;
  coverageFormGroup!: FormGroup;

  quoteResult: QuoteResult | null = null;
  isCalculating = false;

  // Data for dropdowns
  vehicleMakes = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Nissan', 'Mazda', 'Chevrolet'];
  vehicleModels: { [key: string]: string[] } = {
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius'],
    'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot', 'HR-V'],
    'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape', 'Edge'],
    'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'X7'],
    'Mercedes': ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
    'Audi': ['A4', 'A6', 'Q5', 'Q7', 'A3'],
    'Volkswagen': ['Golf', 'Jetta', 'Passat', 'Tiguan', 'Atlas'],
    'Nissan': ['Altima', 'Sentra', 'Rogue', 'Murano', 'Pathfinder'],
    'Mazda': ['Mazda3', 'Mazda6', 'CX-5', 'CX-9', 'MX-5'],
    'Chevrolet': ['Silverado', 'Malibu', 'Equinox', 'Tahoe', 'Corvette']
  };

  currentModels: string[] = [];
  years: number[] = [];
  coverageTypes = [
    { value: 'comprehensive', label: 'Comprehensive', description: 'Full coverage including collision, theft, and natural disasters' },
    { value: 'third-party', label: 'Third Party', description: 'Covers damage to other vehicles and property' },
    { value: 'third-party-fire-theft', label: 'Third Party + Fire & Theft', description: 'Third party coverage plus fire and theft protection' }
  ];

  deductibles = [250, 500, 1000, 2500, 5000];
  parkingTypes = ['Garage', 'Driveway', 'Street', 'Carport', 'Parking Lot'];

  constructor(
    private formBuilder: FormBuilder,
    private breakpointObserver: BreakpointObserver
  ) {
    // Generate years from current year back 25 years
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 25; i--) {
      this.years.push(i);
    }
  }

  ngOnInit(): void {
    // Monitor screen size for responsive behavior
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    // Initialize form groups with validation
    this.vehicleFormGroup = this.formBuilder.group({
      make: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', Validators.required],
      registration: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{2,10}$/)]],
      vehicleValue: ['', [Validators.required, Validators.min(1000), Validators.max(500000)]]
    });

    this.personalFormGroup = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      dateOfBirth: ['', Validators.required],
      licenseNumber: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.coverageFormGroup = this.formBuilder.group({
      coverageType: ['comprehensive', Validators.required],
      deductible: [500, Validators.required],
      annualMileage: ['', [Validators.required, Validators.min(0), Validators.max(100000)]],
      parkingType: ['', Validators.required]
    });

    // Listen to make changes to update model dropdown
    this.vehicleFormGroup.get('make')?.valueChanges.subscribe(make => {
      this.onMakeChange(make);
    });
  }

  onMakeChange(make: string): void {
    this.currentModels = this.vehicleModels[make] || [];
    this.vehicleFormGroup.patchValue({ model: '' });
  }

  getStepIcon(step: number): string {
    if (step < this.currentStep) {
      return 'check_circle';
    }
    switch (step) {
      case 0: return 'directions_car';
      case 1: return 'person';
      case 2: return 'shield';
      case 3: return 'request_quote';
      default: return 'circle';
    }
  }

  getStepLabel(step: number): string {
    switch (step) {
      case 0: return 'Vehicle Info';
      case 1: return 'Personal Details';
      case 2: return 'Coverage Options';
      case 3: return 'Your Quote';
      default: return '';
    }
  }

  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
      if (this.currentStep === 3) {
        this.calculateQuote();
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 0:
        return this.vehicleFormGroup.valid;
      case 1:
        return this.personalFormGroup.valid;
      case 2:
        return this.coverageFormGroup.valid;
      default:
        return false;
    }
  }

  calculateQuote(): void {
    this.isCalculating = true;

    // Simulate API call with setTimeout
    setTimeout(() => {
      const vehicleValue = this.vehicleFormGroup.value.vehicleValue;
      const vehicleYear = this.vehicleFormGroup.value.year;
      const coverageType = this.coverageFormGroup.value.coverageType;
      const deductible = this.coverageFormGroup.value.deductible;
      const annualMileage = this.coverageFormGroup.value.annualMileage;

      // Calculate premium based on various factors
      let basePremium = vehicleValue * 0.05; // 5% of vehicle value

      // Adjust for vehicle age
      const vehicleAge = new Date().getFullYear() - vehicleYear;
      basePremium *= (1 - vehicleAge * 0.02); // 2% discount per year

      // Adjust for coverage type
      if (coverageType === 'third-party') {
        basePremium *= 0.4;
      } else if (coverageType === 'third-party-fire-theft') {
        basePremium *= 0.6;
      }

      // Adjust for deductible (higher deductible = lower premium)
      basePremium *= (1 - deductible / 10000);

      // Adjust for mileage (higher mileage = higher premium)
      basePremium *= (1 + annualMileage / 50000);

      // Round to 2 decimal places
      const premium = Math.round(basePremium * 100) / 100;

      this.quoteResult = {
        premium,
        coverageType: this.getCoverageLabel(coverageType),
        deductible
      };

      this.isCalculating = false;
    }, 1500);
  }

  getCoverageLabel(value: string): string {
    const coverage = this.coverageTypes.find(c => c.value === value);
    return coverage ? coverage.label : value;
  }

  startNewQuote(): void {
    this.currentStep = 0;
    this.quoteResult = null;
    this.vehicleFormGroup.reset();
    this.personalFormGroup.reset();
    this.coverageFormGroup.patchValue({
      coverageType: 'comprehensive',
      deductible: 500
    });
  }

  getErrorMessage(formGroup: FormGroup, field: string): string {
    const control = formGroup.get(field);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }
    if (control.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (control.hasError('pattern')) {
      if (field === 'registration') {
        return 'Please enter a valid registration (alphanumeric, 2-10 characters)';
      }
      if (field === 'phone') {
        return 'Please enter a valid 10-digit phone number';
      }
    }
    if (control.hasError('minlength')) {
      return `Minimum length is ${control.errors?.['minlength'].requiredLength}`;
    }
    if (control.hasError('min')) {
      return `Minimum value is ${control.errors?.['min'].min}`;
    }
    if (control.hasError('max')) {
      return `Maximum value is ${control.errors?.['max'].max}`;
    }
    return '';
  }
}
