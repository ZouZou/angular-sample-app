import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() { }

  /**
   * Search for images based on query
   * Uses Unsplash Source for demo purposes
   */
  searchImages(query: string, count: number = 6): Observable<string[]> {
    const baseUrl = 'https://source.unsplash.com/800x600/?';
    const images: string[] = [];

    for (let i = 1; i <= count; i++) {
      images.push(`${baseUrl}${query},${i}`);
    }

    return of(images);
  }

  /**
   * Get a placeholder image for a category
   * Uses Lorem Picsum for consistent placeholders
   */
  getPlaceholderImage(category: string, width: number = 800, height: number = 600): string {
    const seed = category.toLowerCase().replace(/\s+/g, '-');
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
  }

  /**
   * Get course thumbnail image
   */
  getCourseThumbna(category: string): string {
    return this.getPlaceholderImage(category, 400, 300);
  }

  /**
   * Get course banner image
   */
  getCourseBanner(category: string): string {
    return this.getPlaceholderImage(category, 1200, 400);
  }

  /**
   * Get images from Unsplash for specific topics
   */
  getTopicImage(topic: string, width: number = 800, height: number = 600): string {
    return `https://source.unsplash.com/${width}x${height}/?${topic}`;
  }
}
