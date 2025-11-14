import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * [Component Description]
 *
 * [Detailed explanation of what this component does and when to use it]
 *
 * @example
 * <app-component-name
 *   [exampleInput]="'Hello'"
 *   (exampleEvent)="handleEvent($event)">
 * </app-component-name>
 */
@Component({
  selector: 'app-component-name',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './component-name.component.html',
  styleUrls: ['./component-name.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentNameComponent implements OnInit, OnDestroy {
  // Inputs
  @Input() exampleInput!: string;
  @Input() optionalInput = 'default value';

  // Outputs
  @Output() exampleEvent = new EventEmitter<string>();

  // Signals (Angular 16+) - Preferred for reactive state
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  data = signal<any[]>([]);

  // Computed signals - Automatically updated when dependencies change
  hasData = computed(() => this.data().length > 0);
  isReady = computed(() => !this.isLoading() && !this.errorMessage());

  // Private properties
  private destroy$ = new Subject<void>();

  /**
   * Constructor with dependency injection
   */
  constructor(
    // Inject services here
    // private exampleService: ExampleService,
    // private router: Router
  ) { }

  /**
   * Lifecycle hook - Initialize component
   */
  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Lifecycle hook - Cleanup subscriptions
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * [Public method description]
   *
   * @param param - Parameter description
   */
  public onExampleAction(param: string): void {
    this.exampleEvent.emit(param);
  }

  /**
   * TrackBy function for *ngFor optimization
   */
  trackByItemId(index: number, item: any): number {
    return item.id;
  }

  /**
   * [Private method description]
   */
  private loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Example subscription with cleanup
    // this.exampleService.getData()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (data) => {
    //       this.data.set(data);
    //       this.isLoading.set(false);
    //     },
    //     error: (error) => {
    //       this.errorMessage.set('Failed to load data');
    //       this.isLoading.set(false);
    //       console.error('Error loading data:', error);
    //     }
    //   });
  }
}
