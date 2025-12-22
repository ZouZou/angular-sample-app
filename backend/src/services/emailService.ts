import nodemailer from 'nodemailer';
import { User } from '../entities/User';
import { Course } from '../entities/Course';
import { Enrollment } from '../entities/Enrollment';
import { QuizAttempt } from '../entities/QuizAttempt';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private emailEnabled: boolean;

  constructor() {
    // Check if email is configured
    this.emailEnabled = !!(
      process.env.EMAIL_HOST &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASSWORD
    );

    if (this.emailEnabled) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } else {
      console.warn('Email service is not configured. Emails will not be sent.');
    }
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.emailEnabled) {
      console.log(`[Email Disabled] Would send email to ${options.to}: ${options.subject}`);
      return;
    }

    try {
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'LMS Platform'} <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      // Don't throw error to prevent breaking the application flow
    }
  }

  private getEmailTemplate(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 3px solid #3f51b5;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #3f51b5;
              margin: 0;
              font-size: 28px;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #3f51b5;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .button:hover {
              background-color: #303f9f;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              color: #666;
              font-size: 14px;
            }
            .badge {
              display: inline-block;
              padding: 5px 15px;
              background-color: #4caf50;
              color: white;
              border-radius: 20px;
              font-size: 14px;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 LMS Platform</h1>
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p>This is an automated email from LMS Platform. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Send enrollment confirmation email
   */
  async sendEnrollmentConfirmation(user: User, course: Course, enrollment: Enrollment): Promise<void> {
    const content = `
      <h2>Welcome to ${course.title}! 🎉</h2>
      <p>Hi ${user.name},</p>
      <p>Congratulations! You have successfully enrolled in <strong>${course.title}</strong>.</p>
      <p><strong>Course Details:</strong></p>
      <ul>
        <li><strong>Instructor:</strong> ${course.instructor}</li>
        <li><strong>Level:</strong> ${course.level}</li>
        <li><strong>Duration:</strong> ${course.duration || 'Self-paced'}</li>
      </ul>
      <p>${course.description}</p>
      <p>
        <a href="${process.env.CORS_ORIGIN}/courses/${course.id}/learn" class="button">
          Start Learning Now
        </a>
      </p>
      <p>We're excited to have you on this learning journey!</p>
      <p>Best regards,<br>The LMS Team</p>
    `;

    await this.sendEmail({
      to: user.email,
      subject: `Enrolled in ${course.title}`,
      html: this.getEmailTemplate(content)
    });
  }

  /**
   * Send course completion email with certificate
   */
  async sendCourseCompletion(user: User, course: Course, enrollment: Enrollment): Promise<void> {
    const certificateUrl = enrollment.certificateUrl
      ? `${process.env.CORS_ORIGIN}${enrollment.certificateUrl}`
      : null;

    const content = `
      <h2>🎓 Congratulations! You've Completed ${course.title}!</h2>
      <p>Hi ${user.name},</p>
      <p>We're thrilled to inform you that you have successfully completed <strong>${course.title}</strong>!</p>
      <div style="text-align: center; margin: 30px 0;">
        <span class="badge">✅ Course Completed</span>
      </div>
      <p><strong>Your Achievement:</strong></p>
      <ul>
        <li>Course: ${course.title}</li>
        <li>Instructor: ${course.instructor}</li>
        <li>Completion Date: ${enrollment.completedAt ? new Date(enrollment.completedAt).toLocaleDateString() : 'Today'}</li>
        <li>Progress: 100%</li>
      </ul>
      ${certificateUrl ? `
        <p>Your certificate of completion is ready!</p>
        <p style="text-align: center;">
          <a href="${certificateUrl}" class="button">
            📜 View Your Certificate
          </a>
        </p>
      ` : ''}
      <p>Keep up the great work and continue your learning journey!</p>
      <p>Best regards,<br>The LMS Team</p>
    `;

    await this.sendEmail({
      to: user.email,
      subject: `🎉 Course Completed: ${course.title}`,
      html: this.getEmailTemplate(content)
    });
  }

  /**
   * Send quiz score notification
   */
  async sendQuizScoreNotification(
    user: User,
    quizTitle: string,
    attempt: QuizAttempt,
    passingScore: number,
    courseName?: string
  ): Promise<void> {
    const passed = attempt.passed;
    const emoji = passed ? '✅' : '📝';
    const statusBadge = passed
      ? '<span class="badge" style="background-color: #4caf50;">Passed</span>'
      : '<span class="badge" style="background-color: #ff9800;">Not Passed</span>';

    const content = `
      <h2>${emoji} Quiz Results: ${quizTitle}</h2>
      <p>Hi ${user.name},</p>
      <p>You have completed the quiz <strong>${quizTitle}</strong>${courseName ? ` in ${courseName}` : ''}.</p>
      <div style="text-align: center; margin: 30px 0;">
        ${statusBadge}
      </div>
      <p><strong>Your Results:</strong></p>
      <ul>
        <li><strong>Score:</strong> ${attempt.percentage}%</li>
        <li><strong>Points Earned:</strong> ${attempt.score} out of ${attempt.totalPoints}</li>
        <li><strong>Status:</strong> ${passed ? 'Passed' : 'Not Passed'}</li>
        <li><strong>Passing Score:</strong> ${passingScore}%</li>
      </ul>
      ${!passed ? `
        <p>Don't worry! You can retake the quiz to improve your score. Review the course materials and try again when you're ready.</p>
      ` : `
        <p>Great job! Keep up the excellent work!</p>
      `}
      <p>Best regards,<br>The LMS Team</p>
    `;

    await this.sendEmail({
      to: user.email,
      subject: `Quiz ${passed ? 'Passed' : 'Completed'}: ${quizTitle}`,
      html: this.getEmailTemplate(content)
    });
  }

  /**
   * Send new lesson notification to enrolled students
   */
  async sendNewLessonNotification(
    user: User,
    course: Course,
    lessonTitle: string
  ): Promise<void> {
    const content = `
      <h2>📚 New Lesson Added to ${course.title}</h2>
      <p>Hi ${user.name},</p>
      <p>Great news! A new lesson has been added to <strong>${course.title}</strong>.</p>
      <p><strong>New Lesson:</strong> ${lessonTitle}</p>
      <p>Continue your learning journey and check out the new content!</p>
      <p>
        <a href="${process.env.CORS_ORIGIN}/courses/${course.id}/learn" class="button">
          View New Lesson
        </a>
      </p>
      <p>Happy learning!</p>
      <p>Best regards,<br>The LMS Team</p>
    `;

    await this.sendEmail({
      to: user.email,
      subject: `New Lesson: ${lessonTitle} - ${course.title}`,
      html: this.getEmailTemplate(content)
    });
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(user: User): Promise<void> {
    const content = `
      <h2>Welcome to LMS Platform! 🎉</h2>
      <p>Hi ${user.name},</p>
      <p>Thank you for joining LMS Platform! We're excited to have you as part of our learning community.</p>
      <p><strong>Your Account Details:</strong></p>
      <ul>
        <li><strong>Name:</strong> ${user.name}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Role:</strong> ${user.role}</li>
      </ul>
      <p>
        <a href="${process.env.CORS_ORIGIN}/courses" class="button">
          Browse Courses
        </a>
      </p>
      <p>Start exploring our courses and begin your learning journey today!</p>
      <p>Best regards,<br>The LMS Team</p>
    `;

    await this.sendEmail({
      to: user.email,
      subject: 'Welcome to LMS Platform!',
      html: this.getEmailTemplate(content)
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password?token=${resetToken}`;

    const content = `
      <h2>Password Reset Request</h2>
      <p>Hi ${user.name},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <p>
        <a href="${resetUrl}" class="button">
          Reset Password
        </a>
      </p>
      <p>This link will expire in 1 hour.</p>
      <p><strong>If you didn't request this password reset, please ignore this email.</strong></p>
      <p>Best regards,<br>The LMS Team</p>
    `;

    await this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: this.getEmailTemplate(content)
    });
  }
}
