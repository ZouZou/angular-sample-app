import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface VideoProgressData {
  currentPosition: number;
  duration: number;
  playbackSpeed: number;
  sessionId: string;
  pausedCount?: number;
  seekedCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/videos`;

  uploadVideo(
    lessonId: number,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload/${lessonId}`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress?.(progress);
        } else if (event.type === HttpEventType.Response) {
          return event.body;
        }
        return null;
      })
    );
  }

  saveEmbedUrl(lessonId: number, embedUrl: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/embed/${lessonId}`, { embedUrl });
  }

  getVideoUrl(lessonId: number): string {
    return `${this.apiUrl}/stream/${lessonId}`;
  }

  getTranscriptUrl(lessonId: number): string {
    return `${this.apiUrl}/transcript/${lessonId}`;
  }

  updateProgress(
    enrollmentId: number,
    lessonId: number,
    progressData: VideoProgressData
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/progress`, {
      enrollmentId,
      lessonId,
      ...progressData
    });
  }

  getVideoAnalytics(
    lessonId: number,
    startDate?: Date,
    endDate?: Date
  ): Observable<any> {
    let url = `${this.apiUrl}/analytics/${lessonId}`;
    const params: string[] = [];

    if (startDate) {
      params.push(`startDate=${startDate.toISOString()}`);
    }
    if (endDate) {
      params.push(`endDate=${endDate.toISOString()}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get(url);
  }

  deleteVideo(lessonId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${lessonId}`);
  }
}
