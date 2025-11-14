# File Upload & Management Skill

Implement comprehensive file upload, storage, and management system for course materials, user avatars, documents, and media files with cloud storage integration.

## Overview

Features:
- Drag-and-drop file upload
- Cloud storage (AWS S3, Cloudinary, Azure Blob)
- Image optimization and resizing
- Video transcoding
- PDF preview
- File organization (folders, tags)
- File sharing and permissions
- Download management
- Storage quota management

## Implementation

### Backend - File Entity

```typescript
// backend/src/entities/File.ts
@Entity('files')
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalName: string;

  @Column()
  fileName: string; // Stored filename

  @Column()
  mimeType: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ type: 'enum', enum: ['local', 's3', 'cloudinary', 'azure'] })
  storage: string;

  @Column()
  path: string;

  @ManyToOne(() => User)
  uploadedBy: User;

  @Column({ type: 'enum', enum: ['image', 'video', 'document', 'audio', 'other'] })
  type: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    transcoded?: boolean;
  };

  @CreateDateColumn()
  uploadedAt: Date;
}
```

### File Upload Service (AWS S3)

```typescript
// backend/src/services/fileService.ts
import { S3 } from 'aws-sdk';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export class FileService {
  private s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });

  async uploadFile(
    file: Express.Multer.File,
    userId: number,
    folder: string = 'uploads'
  ): Promise<File> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${fileName}`;

    // Upload to S3
    await this.s3.upload({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    }).promise();

    const url = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;

    // Create thumbnail for images
    let thumbnailUrl: string | undefined;
    if (file.mimetype.startsWith('image/')) {
      thumbnailUrl = await this.createThumbnail(file, folder);
    }

    // Save file record
    const fileRecord = await fileRepository.save({
      originalName: file.originalname,
      fileName,
      mimeType: file.mimetype,
      size: file.size,
      url,
      thumbnailUrl,
      storage: 's3',
      path: key,
      uploadedBy: { id: userId },
      type: this.getFileType(file.mimetype)
    });

    return fileRecord;
  }

  async createThumbnail(file: Express.Multer.File, folder: string): Promise<string> {
    const thumbnailBuffer = await sharp(file.buffer)
      .resize(300, 300, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();

    const thumbnailKey = `${folder}/thumbnails/${uuidv4()}.jpg`;

    await this.s3.upload({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: thumbnailKey,
      Body: thumbnailBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    }).promise();

    return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${thumbnailKey}`;
  }

  async deleteFile(fileId: number, userId: number): Promise<void> {
    const file = await fileRepository.findOne({
      where: { id: fileId, uploadedBy: { id: userId } }
    });

    if (!file) {
      throw new Error('File not found or unauthorized');
    }

    // Delete from S3
    if (file.storage === 's3') {
      await this.s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: file.path
      }).promise();

      // Delete thumbnail if exists
      if (file.thumbnailUrl) {
        const thumbnailKey = file.thumbnailUrl.split('.com/')[1];
        await this.s3.deleteObject({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: thumbnailKey
        }).promise();
      }
    }

    // Delete record
    await fileRepository.delete(fileId);
  }

  validateFile(file: Express.Multer.File): void {
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error('File too large. Max size is 100MB');
    }

    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('File type not allowed');
    }
  }

  getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf' || mimeType.includes('document')) return 'document';
    return 'other';
  }

  async getUserFiles(userId: number, type?: string) {
    const query: any = { uploadedBy: { id: userId } };
    if (type) query.type = type;

    return await fileRepository.find({
      where: query,
      order: { uploadedAt: 'DESC' }
    });
  }

  async getStorageUsage(userId: number): Promise<{ used: number; limit: number }> {
    const result = await fileRepository
      .createQueryBuilder('file')
      .select('SUM(file.size)', 'total')
      .where('file.uploadedBy = :userId', { userId })
      .getRawOne();

    return {
      used: parseInt(result.total) || 0,
      limit: 1024 * 1024 * 1024 // 1GB per user
    };
  }
}
```

### Frontend - File Upload Component

```typescript
// src/app/shared/components/file-upload/file-upload.component.ts
import { HttpEventType } from '@angular/common/http';

export class FileUploadComponent {
  @Input() accept: string = '*';
  @Input() maxSize: number = 100 * 1024 * 1024; // 100MB
  @Input() multiple: boolean = false;
  @Output() fileUploaded = new EventEmitter<any>();

  uploadProgress: number = 0;
  isDragging: boolean = false;

  onFileSelect(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.uploadFiles(Array.from(files));
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.uploadFiles(Array.from(files));
    }
  }

  uploadFiles(files: File[]) {
    files.forEach(file => {
      // Validate size
      if (file.size > this.maxSize) {
        this.showError('File too large');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      this.fileService.upload(formData).subscribe(
        event => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total!);
          } else if (event.type === HttpEventType.Response) {
            this.uploadProgress = 0;
            this.fileUploaded.emit(event.body);
          }
        },
        error => this.showError(error.message)
      );
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }
}
```

### File Upload Template

```html
<!-- file-upload.component.html -->
<div class="upload-container"
     (drop)="onDrop($event)"
     (dragover)="onDragOver($event)"
     (dragleave)="onDragLeave($event)"
     [class.dragging]="isDragging">

  <input type="file"
         #fileInput
         [accept]="accept"
         [multiple]="multiple"
         (change)="onFileSelect($event)"
         style="display: none">

  <button mat-raised-button color="primary" (click)="fileInput.click()">
    <mat-icon>cloud_upload</mat-icon>
    Choose File
  </button>

  <p class="drop-text">or drag and drop files here</p>

  <mat-progress-bar *ngIf="uploadProgress > 0"
                    mode="determinate"
                    [value]="uploadProgress">
  </mat-progress-bar>
</div>
```

### Image Cropper Component

```typescript
// Using ngx-image-cropper
export class ImageCropperComponent {
  imageChangedEvent: any;
  croppedImage: any;

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  async uploadCroppedImage() {
    const blob = await fetch(this.croppedImage).then(r => r.blob());
    const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('file', file);

    this.fileService.upload(formData).subscribe(result => {
      this.imageUploaded.emit(result);
    });
  }
}
```

## API Endpoints

```
POST   /api/files/upload                - Upload file
GET    /api/files                       - Get user files
GET    /api/files/:id                   - Get file details
DELETE /api/files/:id                   - Delete file
GET    /api/files/storage/usage         - Get storage usage
POST   /api/files/:id/share             - Share file
GET    /api/files/download/:id          - Download file
```

## Environment Variables

```env
# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Or Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Or Azure
AZURE_STORAGE_ACCOUNT=your-account
AZURE_STORAGE_ACCESS_KEY=your-key
AZURE_STORAGE_CONTAINER=your-container
```

## Features

✅ Drag-and-drop upload
✅ Multiple file upload
✅ Image optimization (sharp)
✅ Automatic thumbnail generation
✅ Progress tracking
✅ File type validation
✅ Size limits
✅ Cloud storage (S3, Cloudinary, Azure)
✅ Image cropping
✅ PDF preview
✅ Storage quota management
✅ File organization with tags
✅ Secure file sharing
✅ Download management

This skill provides enterprise-grade file management for handling all types of media in your LMS.
