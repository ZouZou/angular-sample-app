# Documentation Standards

Guidelines for writing clear, consistent, and maintainable documentation.

## Documentation Types

### 1. README Files
### 2. API Documentation
### 3. Component Documentation
### 4. User Guides
### 5. Code Comments
### 6. Changelog

## README Structure

Every project and feature module should have a README.

### Standard Template

```markdown
# [Project/Feature Name]

Brief one-line description of what this is.

## Overview

2-3 paragraph overview explaining:
- What problem this solves
- Key features
- Target users

## Installation

```bash
npm install
```

## Quick Start

```typescript
// Minimal working example
import { AccountingModule } from './accounting.module';

// Basic usage here
```

## Usage

### Basic Example

Detailed walkthrough of common use case.

### Advanced Examples

More complex scenarios with code samples.

## API Reference

Link to detailed API docs or inline documentation.

## Configuration

Available options and settings.

## Development

How to set up development environment.

## Testing

How to run tests.

## Contributing

Guidelines for contributors.

## License

License information.
```

### README Best Practices

- Start with what, not how
- Include a table of contents for long docs
- Use code examples liberally
- Keep examples up to date
- Link to related documentation
- Include troubleshooting section
- Add badges for build status, coverage, etc.

## API Documentation

### Endpoint Documentation Template

```markdown
## POST /api/transactions

Create a new transaction entry.

### Request

**Headers**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Body**
```json
{
  "amount": 100.50,
  "type": "DEBIT",
  "date": "2025-01-15",
  "description": "Office supplies",
  "accountId": "acc_123"
}
```

**Parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | number | Yes | Transaction amount (must be positive) |
| type | string | Yes | Transaction type: DEBIT or CREDIT |
| date | string | Yes | Date in ISO format (YYYY-MM-DD) |
| description | string | No | Transaction description (max 255 chars) |
| accountId | string | Yes | Associated account ID |

### Response

**Success (201 Created)**
```json
{
  "id": "txn_456",
  "amount": 100.50,
  "type": "DEBIT",
  "date": "2025-01-15",
  "description": "Office supplies",
  "accountId": "acc_123",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

**Error (400 Bad Request)**
```json
{
  "error": "Invalid request",
  "message": "Amount must be positive",
  "field": "amount"
}
```

### Example

```typescript
const response = await fetch('/api/transactions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 100.50,
    type: 'DEBIT',
    date: '2025-01-15',
    description: 'Office supplies',
    accountId: 'acc_123'
  })
});

const transaction = await response.json();
```

### Notes

- Transactions are immutable once created
- Use the PATCH endpoint to add corrections
- Maximum 1000 transactions per batch operation
```

### API Documentation Best Practices

- Document all endpoints completely
- Include all possible responses
- Provide working code examples
- Explain error codes and messages
- Document rate limits and constraints
- Include authentication requirements
- Version your API docs

## Component Documentation

### Component README Template

```markdown
# TransactionListComponent

Displays a filterable, sortable list of transactions with pagination.

## Usage

```typescript
import { TransactionListComponent } from './transaction-list.component';

@NgModule({
  imports: [TransactionListComponent]
})
```

```html
<app-transaction-list
  [transactions]="transactions"
  [pageSize]="20"
  (transactionClick)="onTransactionClick($event)"
  (filterChange)="onFilterChange($event)">
</app-transaction-list>
```

## Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| transactions | Transaction[] | [] | Array of transactions to display |
| pageSize | number | 10 | Number of items per page |
| showFilters | boolean | true | Whether to show filter controls |
| sortBy | string | 'date' | Default sort field |

## Outputs

| Name | Type | Description |
|------|------|-------------|
| transactionClick | string | Emits transaction ID when clicked |
| filterChange | FilterOptions | Emits when filters are changed |
| pageChange | number | Emits current page number |

## Examples

### Basic List

```html
<app-transaction-list [transactions]="transactions">
</app-transaction-list>
```

### With Custom Page Size

```html
<app-transaction-list
  [transactions]="transactions"
  [pageSize]="50">
</app-transaction-list>
```

### With Event Handlers

```typescript
onTransactionClick(id: string): void {
  this.router.navigate(['/transactions', id]);
}

onFilterChange(filters: FilterOptions): void {
  this.loadTransactions(filters);
}
```

## Styling

### CSS Classes

- `.transaction-list` - Main container
- `.transaction-list__item` - Individual transaction row
- `.transaction-list__filters` - Filter panel
- `.transaction-list__pagination` - Pagination controls

### Customization

```scss
app-transaction-list {
  --transaction-list-spacing: 16px;
  --transaction-list-border-color: #ccc;
}
```

## Accessibility

- Keyboard navigation supported (Tab, Enter, Arrow keys)
- ARIA labels on interactive elements
- Screen reader announcements for state changes
- Focus management for modals and dropdowns

## Related

- [Transaction Model](../models/transaction.model.ts)
- [Transaction Service](../services/transaction.service.ts)
- [Filter Options Interface](../models/filter-options.interface.ts)
```

### JSDoc Comments

**For Classes**
```typescript
/**
 * Service for managing user authentication and authorization
 *
 * Handles login, logout, token refresh, and permission checks.
 * Stores authentication state and provides observables for reactive updates.
 *
 * @example
 * ```typescript
 * constructor(private authService: AuthService) {}
 *
 * login(): void {
 *   this.authService.login(email, password).subscribe({
 *     next: () => this.router.navigate(['/dashboard']),
 *     error: (err) => this.showError(err.message)
 *   });
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  // ...
}
```

**For Methods**
```typescript
/**
 * Calculates the total balance for an account including pending transactions
 *
 * @param accountId - The unique identifier for the account
 * @param includePending - Whether to include pending transactions (default: false)
 * @returns Observable that emits the calculated balance
 *
 * @throws {NotFoundError} If the account does not exist
 * @throws {PermissionError} If user lacks access to the account
 *
 * @example
 * ```typescript
 * this.accountService.getBalance('acc_123', true).subscribe(
 *   balance => console.log(`Balance: $${balance}`)
 * );
 * ```
 */
getBalance(accountId: string, includePending = false): Observable<number> {
  // Implementation
}
```

**For Interfaces**
```typescript
/**
 * Represents a financial transaction in the accounting system
 *
 * @property id - Unique identifier (generated by system)
 * @property amount - Transaction amount in base currency (must be positive)
 * @property type - Transaction type (DEBIT or CREDIT)
 * @property date - Transaction date (ISO 8601 format)
 * @property accountId - Associated account identifier
 * @property description - Optional transaction description (max 255 characters)
 */
export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  date: string;
  accountId: string;
  description?: string;
}
```

## User Guide Documentation

### Structure

```markdown
# [Feature Name] User Guide

## What You'll Learn

- Bullet list of learning objectives

## Prerequisites

- What users need before starting
- Required permissions or setup

## Step-by-Step Instructions

### Step 1: [Action]

Detailed instructions with screenshots.

**Tip:** Helpful tip related to this step.

### Step 2: [Action]

Continue with clear steps.

**Warning:** Important cautionary note.

## Common Tasks

### Task 1: [Name]

Quick instructions for common task.

### Task 2: [Name]

Another common task.

## Troubleshooting

### Problem: [Issue]

**Solution:** Step-by-step resolution.

### Problem: [Another Issue]

**Solution:** How to fix it.

## FAQs

**Q: Common question?**
A: Clear answer.

## Next Steps

What to learn next or related features.
```

### User Guide Best Practices

- Write for your audience (technical level)
- Use screenshots and diagrams
- Break complex tasks into steps
- Include "why" along with "how"
- Anticipate common questions
- Keep language simple and clear
- Test instructions with real users

## Code Comments

### When to Comment

**DO comment:**
- Complex algorithms or business logic
- Non-obvious workarounds
- Performance optimizations
- Security considerations
- External API integrations
- Regular expression patterns
- Magic numbers or constants

**DON'T comment:**
- Obvious code
- What the code does (code shows that)
- Outdated information
- Commented-out code (use version control)

### Good Comment Examples

```typescript
// ✓ Good - Explains WHY
// Cache results for 5 minutes to reduce API calls
// Based on rate limit of 100 requests/hour
private readonly CACHE_DURATION = 300000;

// ✓ Good - Explains complex logic
// Use binary search for better performance on large sorted datasets
// Time complexity: O(log n) vs O(n) for linear search
function binarySearch(arr: number[], target: number): number {
  // Implementation
}

// ✓ Good - Explains workaround
// WORKAROUND: Angular CDK has a bug with virtual scrolling in Firefox
// See: https://github.com/angular/components/issues/12345
// TODO: Remove once bug is fixed in v17
this.viewport.scrollToIndex(index);
```

### Bad Comment Examples

```typescript
// ✗ Bad - States the obvious
// Set loading to true
this.isLoading = true;

// ✗ Bad - Outdated
// TODO: Fix this before production (code is already in production)

// ✗ Bad - Commented code
// this.oldFunction();
// this.anotherOldFunction();

// ✗ Bad - Vague
// Fix for the bug
this.value = null;
```

## Changelog

### Format (Keep a Changelog)

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New feature in development

## [1.2.0] - 2025-01-15

### Added
- Transaction export to CSV and Excel formats
- Bulk transaction import from CSV
- Advanced filtering with date ranges

### Changed
- Improved performance of transaction list (50% faster)
- Updated UI for transaction details page

### Deprecated
- `getTransactionsOld()` method - use `getTransactions()` instead

### Removed
- Legacy PDF export (replaced with new report system)

### Fixed
- Transaction dates now respect user timezone
- Resolved memory leak in transaction service
- Fixed pagination bug with filtered results

### Security
- Updated dependencies to patch vulnerabilities
- Enhanced input validation for transaction amounts

## [1.1.0] - 2025-01-01

Previous release notes...

## [1.0.0] - 2024-12-15

Initial release.
```

### Changelog Best Practices

- Keep it updated with every release
- Group changes by type (Added, Changed, etc.)
- Write for users, not developers
- Link to issues/PRs when relevant
- Date each release
- Follow semantic versioning

## Markdown Style Guide

### Headings

```markdown
# H1 - Document Title (only one per document)

## H2 - Major Sections

### H3 - Subsections

#### H4 - Detailed Points
```

### Code Blocks

Always specify language for syntax highlighting:

````markdown
```typescript
const example = 'code here';
```

```bash
npm install
```

```json
{
  "key": "value"
}
```
````

### Lists

```markdown
**Unordered lists**
- First item
- Second item
  - Nested item
  - Another nested item

**Ordered lists**
1. First step
2. Second step
   1. Sub-step
   2. Another sub-step
```

### Links

```markdown
[Link text](https://example.com)
[Internal link](./other-doc.md)
[Link with title](https://example.com "Hover text")
```

### Tables

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |
| Value 4  | Value 5  | Value 6  |
```

### Emphasis

```markdown
*Italic text* or _italic text_
**Bold text** or __bold text__
***Bold and italic*** or ___bold and italic___
`Inline code`
```

### Admonitions

```markdown
**Note:** Additional information

**Tip:** Helpful suggestion

**Warning:** Important caution

**Important:** Critical information
```

## Documentation Checklist

Before finalizing documentation:

- [ ] Spelling and grammar checked
- [ ] Code examples tested and working
- [ ] Links verified (no broken links)
- [ ] Screenshots up to date
- [ ] Consistent terminology used
- [ ] Appropriate heading hierarchy
- [ ] Table of contents for long docs
- [ ] Examples follow brand guidelines
- [ ] Accessible to target audience
- [ ] Version information included
- [ ] Date of last update noted
- [ ] Related docs linked

## Documentation Maintenance

### Review Schedule

- **Monthly**: Review and update getting started guides
- **Quarterly**: Audit all documentation for accuracy
- **Per Release**: Update changelog, API docs, version numbers
- **As Needed**: Update after major feature changes

### Deprecation Notices

When deprecating features:

```markdown
## Deprecated: `oldFunction()`

**Deprecated in:** v1.2.0
**Will be removed in:** v2.0.0
**Replacement:** Use `newFunction()` instead

### Migration Guide

```typescript
// Old way (deprecated)
this.service.oldFunction(param);

// New way
this.service.newFunction({ param });
```

**Reason for deprecation:** The new function provides better type safety and supports additional options.
```

## Writing Tips

### Be Clear
- Use simple words
- Short sentences
- Active voice
- Specific examples

### Be Consistent
- Same terms throughout
- Consistent formatting
- Standard structure
- Unified voice

### Be Complete
- Cover all scenarios
- Include edge cases
- Provide context
- Answer "why" not just "how"

### Be Accurate
- Test all examples
- Verify links
- Check versions
- Update regularly
