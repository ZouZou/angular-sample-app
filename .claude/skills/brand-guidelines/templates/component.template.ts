import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * [Component Description]
 *
 * [Detailed explanation of what this component does and when to use it]
 */
@Component({
  selector: 'app-component-name',
  templateUrl: './component-name.component.html',
  styleUrls: ['./component-name.component.scss']
})
export class ComponentNameComponent implements OnInit, OnDestroy {
  // Inputs
  @Input() exampleInput!: string;
  @Input() optionalInput = 'default value';

  // Outputs
  @Output() exampleEvent = new EventEmitter<string>();

  // Public properties
  isLoading = false;
  errorMessage: string | null = null;

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
   * [Private method description]
   */
  private loadData(): void {
    this.isLoading = true;

    // Example subscription with cleanup
    // this.exampleService.getData()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (data) => {
    //       // Handle success
    //       this.isLoading = false;
    //     },
    //     error: (error) => {
    //       this.errorMessage = 'Failed to load data';
    //       this.isLoading = false;
    //       console.error('Error loading data', error);
    //     }
    //   });
  }
}
