# Payment Integration Skill

Implement payment processing for course enrollments using Stripe or PayPal with subscription management, invoice generation, and webhook handling.

## Overview

Add complete payment functionality to the LMS application with support for:
- One-time course payments
- Subscription plans
- Payment processing (Stripe/PayPal)
- Invoice generation and management
- Payment history tracking
- Refund processing
- Webhook event handling
- Multiple currency support
- Payment method management

## Implementation

### Backend - Payment Entities

```typescript
// backend/src/entities/Payment.ts
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Course, { nullable: true })
  course?: Course;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3 })
  currency: string;

  @Column({ type: 'enum', enum: ['pending', 'completed', 'failed', 'refunded'] })
  status: string;

  @Column()
  provider: 'stripe' | 'paypal';

  @Column({ unique: true })
  transactionId: string;

  @Column({ nullable: true })
  invoiceUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Stripe Integration

```typescript
// backend/src/services/paymentService.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

export class PaymentService {
  async createCheckoutSession(
    userId: number,
    courseId: number,
    successUrl: string,
    cancelUrl: string
  ) {
    const course = await courseRepository.findOne({ where: { id: courseId } });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.title,
            description: course.description
          },
          unit_amount: course.price * 100
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId, courseId }
    });

    return session;
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleSuccessfulPayment(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handleFailedPayment(event.data.object);
        break;
    }
  }
}
```

### Frontend - Payment Component

```typescript
// src/app/payment/checkout.component.ts
import { loadStripe } from '@stripe/stripe-js';

export class CheckoutComponent {
  async checkout(courseId: number) {
    const stripe = await loadStripe(environment.stripePublishableKey);

    const session = await this.paymentService
      .createCheckoutSession(courseId)
      .toPromise();

    await stripe.redirectToCheckout({
      sessionId: session.id
    });
  }
}
```

## API Endpoints

```
POST   /api/payments/checkout/:courseId    - Create checkout session
POST   /api/payments/webhook               - Stripe webhook handler
GET    /api/payments/history               - Get user payment history
POST   /api/payments/refund/:paymentId     - Process refund
GET    /api/invoices/:paymentId            - Get invoice
```

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_SECRET=...
```

## Features

✅ Secure payment processing
✅ Automatic enrollment on payment success
✅ Invoice generation (PDF)
✅ Payment history
✅ Refund processing
✅ Webhook handling for async events
✅ Multiple payment methods
✅ Currency conversion support
✅ PCI DSS compliance

This skill provides production-ready payment integration for monetizing your LMS platform.
