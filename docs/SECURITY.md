# Security Guide

## Table of Contents

- [Overview](#overview)
- [Authentication Security](#authentication-security)
- [Authorization & Access Control](#authorization--access-control)
- [Input Validation](#input-validation)
- [OWASP Top 10 Protection](#owasp-top-10-protection)
- [API Security](#api-security)
- [Database Security](#database-security)
- [Frontend Security](#frontend-security)
- [Deployment Security](#deployment-security)
- [Security Checklist](#security-checklist)

---

## Overview

This guide outlines security measures implemented in the Angular LMS and best practices for maintaining a secure application.

### Security Principles

1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Users have minimum necessary permissions
3. **Fail Securely**: Errors don't expose sensitive information
4. **Secure by Default**: Security built-in, not bolted-on
5. **Zero Trust**: Verify everything, trust nothing

---

## Authentication Security

### Password Security

#### Password Hashing with bcrypt

```typescript
// backend/src/services/authService.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class AuthService {
  async hashPassword(plainPassword: string): Promise<string> {
    return await bcrypt.hash(plainPassword, SALT_ROUNDS);
  }

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
```

**Security Features:**
- **Salt rounds**: 10 (adjustable for future-proofing)
- **Unique salt**: Generated per password
- **One-way hashing**: Cannot reverse to get plaintext
- **Slow by design**: Prevents brute-force attacks

#### Password Requirements

```typescript
// Implemented in frontend and backend
const passwordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false // Optional
};

function isPasswordStrong(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}
```

### JWT Token Security

#### Token Generation

```typescript
// backend/src/config/jwt.ts
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'lms-api',
      audience: 'lms-app'
    }
  );
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

**Security Features:**
- **Strong secret**: Minimum 32 characters, stored in environment variables
- **Expiration**: Tokens expire after 7 days (configurable)
- **Issuer/Audience**: Prevents token misuse across services
- **Algorithm**: HS256 (HMAC with SHA-256)

#### Token Storage (Frontend)

```typescript
// src/app/course/services/auth.service.ts
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';

  storeToken(token: string): void {
    // ⚠️ localStorage is vulnerable to XSS
    // For production, consider httpOnly cookies
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
```

**Production Recommendation:**
Use **httpOnly cookies** for token storage to prevent XSS attacks:

```typescript
// Backend: Set cookie instead of returning token in body
res.cookie('auth_token', token, {
  httpOnly: true,  // Not accessible via JavaScript
  secure: true,    // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

### Session Management

**Security Measures:**
- Tokens expire after inactivity
- Logout invalidates tokens (server-side tracking optional)
- Automatic logout on token expiration
- Re-authentication for sensitive operations

---

## Authorization & Access Control

### Role-Based Access Control (RBAC)

```typescript
// backend/src/middleware/auth.ts
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Forbidden: Insufficient permissions'
      });
    }

    next();
  };
};

// Usage
router.post('/courses',
  authenticate,
  authorize('instructor', 'admin'),
  courseController.createCourse
);
```

### Frontend Route Guards

```typescript
// src/app/core/guards/admin.guard.ts
@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const user = this.authService.getCurrentUser();

    if (user && user.role === 'admin') {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
```

### Resource-Level Authorization

```typescript
// Verify ownership before allowing actions
async updateCourse(courseId: number, userId: number, updates: any) {
  const course = await this.courseRepository.findOne({
    where: { id: courseId }
  });

  if (!course) {
    throw new Error('Course not found');
  }

  // Check if user is course creator or admin
  if (course.createdBy !== userId && user.role !== 'admin') {
    throw new Error('Unauthorized to modify this course');
  }

  // Proceed with update
  return await this.courseRepository.save({ ...course, ...updates });
}
```

---

## Input Validation

### Backend Validation with class-validator

```typescript
// backend/src/dto/create-course.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max, IsEnum } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @Max(10000)
  price!: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(['Beginner', 'Intermediate', 'Advanced'])
  @IsOptional()
  level?: string;
}

// Controller usage
async createCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = plainToClass(CreateCourseDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.map(e => ({
          field: e.property,
          constraints: e.constraints
        }))
      });
    }

    const course = await this.courseService.create(dto);
    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
}
```

### Frontend Validation

```typescript
// src/app/course/components/course-form/course-form.component.ts
export class CourseFormComponent implements OnInit {
  courseForm!: FormGroup;

  ngOnInit() {
    this.courseForm = this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200)
      ]],
      description: ['', [Validators.maxLength(2000)]],
      price: [0, [
        Validators.required,
        Validators.min(0),
        Validators.max(10000)
      ]],
      category: ['', Validators.required],
      level: ['Beginner', Validators.required]
    });
  }

  // Custom validator example
  forbiddenNameValidator(forbiddenNames: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const forbidden = forbiddenNames.includes(control.value?.toLowerCase());
      return forbidden ? { forbiddenName: { value: control.value } } : null;
    };
  }
}
```

### Sanitization

```typescript
// Sanitize user input to prevent XSS
import DOMPurify from 'dompurify';

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target']
  });
}

// Usage
const userContent = sanitizeInput(req.body.description);
```

---

## OWASP Top 10 Protection

### 1. Injection (SQL Injection)

**Protection:**
- ✅ TypeORM parameterized queries
- ✅ Input validation
- ✅ Least privilege database user

```typescript
// ✅ Safe: Parameterized query
const course = await courseRepository.findOne({
  where: { id: courseId }
});

// ❌ Unsafe: String concatenation (DON'T DO THIS)
const query = `SELECT * FROM courses WHERE id = ${courseId}`;
```

### 2. Broken Authentication

**Protection:**
- ✅ bcrypt password hashing
- ✅ Strong password requirements
- ✅ JWT with expiration
- ✅ Secure token storage
- ✅ Session timeout

### 3. Sensitive Data Exposure

**Protection:**
- ✅ Passwords never returned in API responses
- ✅ HTTPS encryption in production
- ✅ Environment variables for secrets
- ✅ Database credentials not in code

```typescript
// Remove sensitive fields before sending response
async getProfile(userId: number) {
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  // Remove password hash from response
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
```

### 4. XML External Entities (XXE)

**Protection:**
- ✅ JSON used instead of XML
- ✅ If XML parsing needed, use secure parsers

### 5. Broken Access Control

**Protection:**
- ✅ RBAC implementation
- ✅ Server-side authorization checks
- ✅ Resource-level ownership verification
- ✅ Frontend guards (UX only, not security)

### 6. Security Misconfiguration

**Protection:**
- ✅ `synchronize: false` in production
- ✅ Error messages don't expose stack traces
- ✅ CORS configured for specific origins
- ✅ Security headers configured
- ✅ Default credentials changed

```typescript
// Production error handler (don't expose stack traces)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  res.status(500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

### 7. Cross-Site Scripting (XSS)

**Protection:**
- ✅ Angular automatic escaping
- ✅ DOMPurify for rich content
- ✅ Content Security Policy headers
- ✅ Avoid `innerHTML`, use data binding

```typescript
// ✅ Safe: Angular data binding
<div>{{ userInput }}</div>

// ⚠️ Unsafe: Direct HTML insertion
<div [innerHTML]="userInput"></div>

// ✅ Safe: Sanitized HTML
<div [innerHTML]="sanitizedInput"></div>
```

### 8. Insecure Deserialization

**Protection:**
- ✅ JSON.parse with validation
- ✅ Type checking before using deserialized data
- ✅ class-validator for DTOs

### 9. Using Components with Known Vulnerabilities

**Protection:**
- ✅ Regular `npm audit`
- ✅ Automated dependency updates
- ✅ Monitor security advisories

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (may introduce breaking changes)
npm audit fix --force
```

### 10. Insufficient Logging & Monitoring

**Protection:**
- ✅ Request logging
- ✅ Error logging
- ✅ Authentication attempt logging
- ✅ Critical action logging

```typescript
// backend/src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('User logged in', { userId: user.id, email: user.email });
logger.error('Database connection failed', { error: error.message });
logger.warn('Failed login attempt', { email: req.body.email, ip: req.ip });
```

---

## API Security

### Rate Limiting

```typescript
// backend: Install express-rate-limit
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply to all API routes
app.use('/api/', apiLimiter);

// Stricter limit for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.'
});

app.use('/api/auth/login', authLimiter);
```

### CORS Configuration

```typescript
// backend/src/app.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Security Headers

```typescript
// Install helmet
import helmet from 'helmet';

app.use(helmet());

// Or configure manually
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; "
  );

  next();
});
```

---

## Database Security

### Connection Security

```typescript
// Use SSL for database connections in production
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/path/to/ca-certificate.crt').toString()
  } : false
});
```

### Least Privilege Principle

```sql
-- Create limited user for application
CREATE USER lms_app WITH PASSWORD 'strong_password';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE lms_db TO lms_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lms_app;

-- Revoke unnecessary permissions
REVOKE CREATE ON SCHEMA public FROM lms_app;
REVOKE DROP ON ALL TABLES IN SCHEMA public FROM lms_app;
```

### Regular Backups

```bash
# Automated backup script (see DEPLOYMENT.md)
0 2 * * * /usr/local/bin/backup-lms-db.sh
```

---

## Frontend Security

### Avoid Trusting User Input

```typescript
// Don't use user input directly in URLs
// ❌ Unsafe
window.location.href = userInput;

// ✅ Safe: Validate and sanitize
if (isValidUrl(userInput) && isSameDomain(userInput)) {
  window.location.href = sanitizeUrl(userInput);
}
```

### Secure Local Storage Usage

```typescript
// Don't store sensitive data in localStorage
// ❌ Bad
localStorage.setItem('creditCard', cardNumber);
localStorage.setItem('ssn', socialSecurityNumber);

// ✅ Good: Only store non-sensitive data
localStorage.setItem('theme', 'dark');
localStorage.setItem('language', 'en');

// Tokens should ideally be in httpOnly cookies
```

### Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               font-src 'self';
               connect-src 'self' http://localhost:3000;">
```

---

## Deployment Security

### Environment Variables

```bash
# ❌ Never commit .env files
echo ".env" >> .gitignore

# ✅ Use strong, unique values for each environment
JWT_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 24)
```

### HTTPS Configuration

```nginx
# Force HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... rest of configuration
}
```

### Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22   # SSH
sudo ufw allow 80   # HTTP
sudo ufw allow 443  # HTTPS
sudo ufw enable

# Database should only be accessible from application server
# Don't expose port 5432 publicly
```

---

## Security Checklist

### Pre-Deployment

- [ ] All passwords are hashed with bcrypt
- [ ] JWT secret is strong and unique
- [ ] Environment variables are not committed
- [ ] `synchronize: false` in TypeORM config
- [ ] HTTPS/SSL configured
- [ ] CORS restricted to production domain
- [ ] Security headers configured
- [ ] Input validation on all endpoints
- [ ] Rate limiting enabled
- [ ] Error messages don't expose sensitive info
- [ ] Database backups configured
- [ ] Logging and monitoring set up

### Regular Maintenance

- [ ] Run `npm audit` monthly
- [ ] Update dependencies quarterly
- [ ] Review access control quarterly
- [ ] Rotate JWT secret annually
- [ ] Review and update security policies
- [ ] Test backup restoration
- [ ] Review application logs
- [ ] Perform security testing

### Incident Response

- [ ] Have a security incident response plan
- [ ] Know how to revoke compromised tokens
- [ ] Have database rollback procedures
- [ ] Monitor for suspicious activity
- [ ] Have contact for security researchers

---

**Last Updated:** 2024-01-26

**Report Security Issues:** security@yourdomain.com
