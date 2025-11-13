import { Directive, ElementRef, Input, OnInit, Renderer2, OnDestroy } from '@angular/core';

/**
 * Lazy Load Image Directive
 * Uses Intersection Observer API to lazy load images when they enter viewport
 * Improves initial page load performance by deferring off-screen images
 *
 * Usage:
 * <img [appLazyLoadImage]="imageUrl" alt="Description">
 */
@Directive({
  selector: '[appLazyLoadImage]'
})
export class LazyLoadImageDirective implements OnInit, OnDestroy {
  @Input() appLazyLoadImage: string = '';
  @Input() placeholder: string = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3ELoading...%3C/text%3E%3C/svg%3E';

  private observer: IntersectionObserver | null = null;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Set placeholder immediately
    this.renderer.setAttribute(this.el.nativeElement, 'src', this.placeholder);
    this.renderer.addClass(this.el.nativeElement, 'lazy-loading');

    // Check if Intersection Observer is supported
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    } else {
      // Fallback for browsers that don't support Intersection Observer
      this.loadImage();
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupIntersectionObserver(): void {
    const options = {
      root: null, // viewport
      rootMargin: '50px', // Start loading 50px before entering viewport
      threshold: 0.01 // Trigger when 1% of image is visible
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage();
          this.observer?.unobserve(this.el.nativeElement);
        }
      });
    }, options);

    this.observer.observe(this.el.nativeElement);
  }

  private loadImage(): void {
    const img = new Image();

    img.onload = () => {
      // Image loaded successfully
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.appLazyLoadImage);
      this.renderer.removeClass(this.el.nativeElement, 'lazy-loading');
      this.renderer.addClass(this.el.nativeElement, 'lazy-loaded');

      // Add fade-in animation
      this.renderer.setStyle(this.el.nativeElement, 'animation', 'fadeIn 0.3s ease-in');
    };

    img.onerror = () => {
      // Error loading image, use fallback
      console.error(`Failed to load image: ${this.appLazyLoadImage}`);
      this.renderer.setAttribute(
        this.el.nativeElement,
        'src',
        'https://via.placeholder.com/400x300?text=Image+Not+Found'
      );
      this.renderer.removeClass(this.el.nativeElement, 'lazy-loading');
    };

    // Start loading the image
    img.src = this.appLazyLoadImage;
  }
}
