import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

export interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
  standalone: false
})
export class FileUploadComponent {
  @Input() accept: string = '*';
  @Input() multiple: boolean = false;
  @Input() maxSize: number = 5 * 1024 * 1024; // 5MB default
  @Input() maxFiles: number = 5;
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() fileRemoved = new EventEmitter<File>();

  uploadedFiles: UploadedFile[] = [];
  isDragOver = false;

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]): void {
    // Validate file count
    if (!this.multiple && files.length > 1) {
      alert('Only one file is allowed');
      return;
    }

    if (this.uploadedFiles.length + files.length > this.maxFiles) {
      alert(`Maximum ${this.maxFiles} files allowed`);
      return;
    }

    // Validate and add files
    const validFiles: File[] = [];

    files.forEach(file => {
      // Validate file size
      if (file.size > this.maxSize) {
        alert(`File "${file.name}" exceeds maximum size of ${this.formatFileSize(this.maxSize)}`);
        return;
      }

      validFiles.push(file);

      const uploadedFile: UploadedFile = {
        file,
        progress: 0,
        status: 'pending'
      };

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        this.generatePreview(file, uploadedFile);
      }

      this.uploadedFiles.push(uploadedFile);
    });

    if (validFiles.length > 0) {
      this.filesSelected.emit(validFiles);
    }
  }

  private generatePreview(file: File, uploadedFile: UploadedFile): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      uploadedFile.preview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeFile(uploadedFile: UploadedFile): void {
    const index = this.uploadedFiles.indexOf(uploadedFile);
    if (index > -1) {
      this.uploadedFiles.splice(index, 1);
      this.fileRemoved.emit(uploadedFile.file);
    }
  }

  clearAll(): void {
    this.uploadedFiles = [];
  }

  /**
   * Simulate file upload with progress
   * In production, replace with actual HTTP upload
   */
  simulateUpload(uploadedFile: UploadedFile): void {
    uploadedFile.status = 'uploading';
    uploadedFile.progress = 0;

    const interval = setInterval(() => {
      uploadedFile.progress += 10;

      if (uploadedFile.progress >= 100) {
        clearInterval(interval);
        uploadedFile.status = 'success';
      }
    }, 200);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getFileIcon(file: File): string {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video_file';
    if (file.type.startsWith('audio/')) return 'audio_file';
    if (file.type.includes('pdf')) return 'picture_as_pdf';
    if (file.type.includes('word')) return 'description';
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) return 'table_chart';
    if (file.type.includes('zip') || file.type.includes('rar')) return 'folder_zip';
    return 'insert_drive_file';
  }
}
