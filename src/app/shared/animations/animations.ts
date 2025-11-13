import { trigger, transition, style, animate, query, stagger, keyframes, state } from '@angular/animations';

/**
 * Fade In Animation
 * Usage: [@fadeIn]
 */
export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 }))
  ])
]);

/**
 * Fade In Up Animation
 * Usage: [@fadeInUp]
 */
export const fadeInUp = trigger('fadeInUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

/**
 * Slide In From Left
 * Usage: [@slideInLeft]
 */
export const slideInLeft = trigger('slideInLeft', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)', opacity: 0 }),
    animate('400ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
  ])
]);

/**
 * Slide In From Right
 * Usage: [@slideInRight]
 */
export const slideInRight = trigger('slideInRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('400ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
  ])
]);

/**
 * Scale In Animation
 * Usage: [@scaleIn]
 */
export const scaleIn = trigger('scaleIn', [
  transition(':enter', [
    style({ transform: 'scale(0.8)', opacity: 0 }),
    animate('300ms cubic-bezier(0.35, 0, 0.25, 1)', style({ transform: 'scale(1)', opacity: 1 }))
  ])
]);

/**
 * Stagger Animation for Lists
 * Usage: [@staggerList]
 */
export const staggerList = trigger('staggerList', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger('100ms', [
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

/**
 * Bounce In Animation
 * Usage: [@bounceIn]
 */
export const bounceIn = trigger('bounceIn', [
  transition(':enter', [
    animate('600ms ease-out', keyframes([
      style({ opacity: 0, transform: 'scale(0.3)', offset: 0 }),
      style({ opacity: 1, transform: 'scale(1.05)', offset: 0.5 }),
      style({ transform: 'scale(0.95)', offset: 0.7 }),
      style({ transform: 'scale(1)', offset: 1 })
    ]))
  ])
]);

/**
 * Flip In X Animation
 * Usage: [@flipInX]
 */
export const flipInX = trigger('flipInX', [
  transition(':enter', [
    style({ opacity: 0, transform: 'perspective(400px) rotateX(90deg)' }),
    animate('600ms ease-out', keyframes([
      style({ transform: 'perspective(400px) rotateX(-20deg)', offset: 0.4 }),
      style({ transform: 'perspective(400px) rotateX(10deg)', offset: 0.6 }),
      style({ opacity: 1, transform: 'perspective(400px) rotateX(-5deg)', offset: 0.8 }),
      style({ transform: 'perspective(400px) rotateX(0deg)', offset: 1 })
    ]))
  ])
]);

/**
 * Expand/Collapse Animation
 * Usage: [@expandCollapse]
 */
export const expandCollapse = trigger('expandCollapse', [
  state('collapsed', style({
    height: '0',
    opacity: '0',
    overflow: 'hidden',
    padding: '0'
  })),
  state('expanded', style({
    height: '*',
    opacity: '1',
    overflow: 'visible',
    padding: '*'
  })),
  transition('collapsed <=> expanded', animate('300ms ease-in-out'))
]);

/**
 * Shake Animation (for errors)
 * Usage: [@shake]
 */
export const shake = trigger('shake', [
  transition('* => *', [
    animate('500ms', keyframes([
      style({ transform: 'translateX(0)', offset: 0 }),
      style({ transform: 'translateX(-10px)', offset: 0.1 }),
      style({ transform: 'translateX(10px)', offset: 0.2 }),
      style({ transform: 'translateX(-10px)', offset: 0.3 }),
      style({ transform: 'translateX(10px)', offset: 0.4 }),
      style({ transform: 'translateX(-10px)', offset: 0.5 }),
      style({ transform: 'translateX(10px)', offset: 0.6 }),
      style({ transform: 'translateX(-10px)', offset: 0.7 }),
      style({ transform: 'translateX(10px)', offset: 0.8 }),
      style({ transform: 'translateX(-10px)', offset: 0.9 }),
      style({ transform: 'translateX(0)', offset: 1 })
    ]))
  ])
]);

/**
 * Pulse Animation
 * Usage: [@pulse]
 */
export const pulse = trigger('pulse', [
  transition('* => *', [
    animate('1000ms', keyframes([
      style({ transform: 'scale(1)', offset: 0 }),
      style({ transform: 'scale(1.05)', offset: 0.5 }),
      style({ transform: 'scale(1)', offset: 1 })
    ]))
  ])
]);

/**
 * Rotate In Animation
 * Usage: [@rotateIn]
 */
export const rotateIn = trigger('rotateIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'rotate(-180deg) scale(0.5)' }),
    animate('500ms ease-out', style({ opacity: 1, transform: 'rotate(0deg) scale(1)' }))
  ])
]);

/**
 * Zoom In Animation
 * Usage: [@zoomIn]
 */
export const zoomIn = trigger('zoomIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.5)' }),
    animate('300ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'scale(1)' }))
  ])
]);

/**
 * Slide Animation (for routing)
 * Usage: [@slideAnimation]
 */
export const slideAnimation = trigger('slideAnimation', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        width: '100%',
        opacity: 0
      })
    ], { optional: true }),
    query(':enter', [
      animate('400ms ease-out', style({ opacity: 1 }))
    ], { optional: true })
  ])
]);

/**
 * List Animation with Stagger
 * Usage: [@listAnimation]
 */
export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(-15px)' }),
      stagger('50ms', [
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true }),
    query(':leave', [
      stagger('50ms', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ], { optional: true })
  ])
]);

/**
 * Card Flip Animation
 * Usage: [@cardFlip]
 */
export const cardFlip = trigger('cardFlip', [
  state('default', style({ transform: 'rotateY(0)' })),
  state('flipped', style({ transform: 'rotateY(180deg)' })),
  transition('default <=> flipped', animate('600ms ease-in-out'))
]);

/**
 * Success Checkmark Animation
 * Usage: [@successCheck]
 */
export const successCheck = trigger('successCheck', [
  transition(':enter', [
    animate('800ms ease-out', keyframes([
      style({ opacity: 0, transform: 'scale(0) rotate(-45deg)', offset: 0 }),
      style({ opacity: 1, transform: 'scale(1.2) rotate(10deg)', offset: 0.6 }),
      style({ transform: 'scale(1) rotate(0deg)', offset: 1 })
    ]))
  ])
]);
