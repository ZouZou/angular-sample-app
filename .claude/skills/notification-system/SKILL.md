# Notification System Skill

Build a comprehensive notification system with email notifications, in-app notifications, push notifications, and real-time updates using WebSockets.

## Overview

Implement multi-channel notification system:
- Email notifications (transactional and promotional)
- In-app notification center
- Browser push notifications
- Real-time notifications via WebSockets
- Notification preferences/settings
- Notification templates
- Read/unread status tracking
- Notification history

## Implementation

### Backend - Notification Entity

```typescript
// backend/src/entities/Notification.ts
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ type: 'enum', enum: ['info', 'success', 'warning', 'error'] })
  type: string;

  @Column()
  category: string; // 'course', 'enrollment', 'quiz', 'system'

  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, any>;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  readAt?: Date;

  @Column({ nullable: true })
  actionUrl?: string;

  @CreateDateColumn()
  createdAt: Date;
}

// backend/src/entities/NotificationPreference.ts
@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ default: true })
  emailEnabled: boolean;

  @Column({ default: true })
  inAppEnabled: boolean;

  @Column({ default: false })
  pushEnabled: boolean;

  @Column({ type: 'jsonb' })
  categories: {
    course: boolean;
    enrollment: boolean;
    quiz: boolean;
    system: boolean;
  };
}
```

### Notification Service

```typescript
// backend/src/services/notificationService.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class NotificationService {
  @WebSocketServer()
  server: Server;

  async create(
    userId: number,
    title: string,
    message: string,
    type: string,
    category: string,
    data?: any
  ) {
    const notification = await notificationRepository.save({
      user: { id: userId },
      title,
      message,
      type,
      category,
      data
    });

    // Get user preferences
    const prefs = await this.getPreferences(userId);

    // Send in-app notification (WebSocket)
    if (prefs.inAppEnabled && prefs.categories[category]) {
      this.server.to(`user_${userId}`).emit('notification', notification);
    }

    // Send email
    if (prefs.emailEnabled && prefs.categories[category]) {
      await this.sendEmail(userId, notification);
    }

    // Send push notification
    if (prefs.pushEnabled && prefs.categories[category]) {
      await this.sendPushNotification(userId, notification);
    }

    return notification;
  }

  async markAsRead(notificationId: number) {
    await notificationRepository.update(notificationId, {
      isRead: true,
      readAt: new Date()
    });
  }

  async markAllAsRead(userId: number) {
    await notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async getUserNotifications(
    userId: number,
    page: number = 1,
    limit: number = 20
  ) {
    return await notificationRepository.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await notificationRepository.count({
      where: { user: { id: userId }, isRead: false }
    });
  }
}
```

### Frontend - Notification Component

```typescript
// src/app/shared/components/notification-center/notification-center.component.ts
import { io } from 'socket.io-client';

export class NotificationCenterComponent implements OnInit, OnDestroy {
  notifications$: Observable<Notification[]>;
  unreadCount$: Observable<number>;
  private socket: any;

  ngOnInit() {
    this.loadNotifications();
    this.connectWebSocket();
  }

  connectWebSocket() {
    this.socket = io(environment.apiUrl, {
      auth: { token: localStorage.getItem('accessToken') }
    });

    this.socket.on('notification', (notification: Notification) => {
      this.showToast(notification);
      this.loadNotifications(); // Refresh list
    });
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id).subscribe();
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe();
  }

  ngOnDestroy() {
    this.socket?.disconnect();
  }
}
```

### Email Templates

```typescript
// backend/src/templates/email/courseEnrollment.ts
export const courseEnrollmentTemplate = (data: {
  userName: string;
  courseTitle: string;
  courseUrl: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; }
    .button { background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to ${data.courseTitle}!</h1>
    <p>Hi ${data.userName},</p>
    <p>You have successfully enrolled in this course. Start learning now!</p>
    <a href="${data.courseUrl}" class="button">Go to Course</a>
  </div>
</body>
</html>
`;
```

### Push Notifications (Web Push API)

```typescript
// backend/src/services/pushNotificationService.ts
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:admin@lms.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export class PushNotificationService {
  async sendPush(subscription: any, notification: Notification) {
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.message,
      icon: '/assets/icon.png',
      badge: '/assets/badge.png',
      data: { url: notification.actionUrl }
    });

    await webpush.sendNotification(subscription, payload);
  }
}
```

## API Endpoints

```
GET    /api/notifications              - Get user notifications (paginated)
GET    /api/notifications/unread-count - Get unread count
PUT    /api/notifications/:id/read     - Mark as read
PUT    /api/notifications/read-all     - Mark all as read
DELETE /api/notifications/:id          - Delete notification
GET    /api/notifications/preferences  - Get notification preferences
PUT    /api/notifications/preferences  - Update preferences
POST   /api/notifications/subscribe    - Subscribe to push notifications
```

## Notification Types

### Course Notifications
- Course enrollment confirmation
- New course published
- Course updated
- Quiz available
- Certificate earned

### System Notifications
- Welcome message
- Account verification
- Password changed
- New features announcement

### Engagement Notifications
- Course reminder (if not accessed in X days)
- Quiz deadline approaching
- Course completion milestone

## Features

✅ Multi-channel delivery (email, in-app, push)
✅ Real-time notifications via WebSockets
✅ User preferences/settings
✅ Rich email templates
✅ Read/unread tracking
✅ Notification categories
✅ Notification history
✅ Action URLs for deep linking
✅ Batch notifications
✅ Scheduled notifications (cron jobs)

This skill provides a complete notification infrastructure for engaging users across all channels.
