import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/certificates`;

  /**
   * Generate a certificate for a completed enrollment
   */
  generateCertificate(enrollmentId: number): Observable<{ certificateUrl: string }> {
    return this.http.post<{ certificateUrl: string }>(`${this.apiUrl}/${enrollmentId}/generate`, {});
  }

  /**
   * Get the certificate URL for viewing
   */
  getCertificateUrl(enrollmentId: number): string {
    return `${environment.apiUrl}/certificates/${enrollmentId}`;
  }

  /**
   * Get the certificate URL for downloading
   */
  getCertificateDownloadUrl(enrollmentId: number): string {
    return `${environment.apiUrl}/certificates/${enrollmentId}/download`;
  }

  /**
   * Download certificate by opening in new tab
   */
  downloadCertificate(enrollmentId: number): void {
    const downloadUrl = this.getCertificateDownloadUrl(enrollmentId);
    window.open(downloadUrl, '_blank');
  }

  /**
   * View certificate by opening in new tab
   */
  viewCertificate(enrollmentId: number): void {
    const viewUrl = this.getCertificateUrl(enrollmentId);
    window.open(viewUrl, '_blank');
  }

  /**
   * Delete a certificate (admin/instructor only)
   */
  deleteCertificate(enrollmentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${enrollmentId}`);
  }
}
