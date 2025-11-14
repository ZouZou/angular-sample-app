# Advanced Search & Filtering Skill

Implement full-text search with advanced filtering, facets, autocomplete, and search analytics using PostgreSQL Full-Text Search or Elasticsearch.

## Overview

Features:
- Full-text search across courses, lessons, content
- Advanced multi-criteria filtering
- Faceted search with aggregations
- Autocomplete and suggestions
- Search history
- Saved searches
- Search analytics
- Fuzzy matching
- Relevance ranking

## Implementation

### Backend - PostgreSQL Full-Text Search

```typescript
// backend/src/services/searchService.ts
export class SearchService {
  async searchCourses(query: {
    q: string;
    category?: string[];
    level?: string[];
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    duration?: { min: number; max: number };
    instructor?: string;
    sort?: 'relevance' | 'price' | 'rating' | 'newest';
    page?: number;
    limit?: number;
  }) {
    const qb = courseRepository.createQueryBuilder('course');

    // Full-text search
    if (query.q) {
      qb.addSelect(
        `ts_rank(
          to_tsvector('english', course.title || ' ' || course.description),
          plainto_tsquery('english', :searchQuery)
        )`,
        'rank'
      );

      qb.where(
        `to_tsvector('english', course.title || ' ' || course.description) @@ plainto_tsquery('english', :searchQuery)`,
        { searchQuery: query.q }
      );
    }

    // Filters
    if (query.category?.length) {
      qb.andWhere('course.category IN (:...categories)', {
        categories: query.category
      });
    }

    if (query.level?.length) {
      qb.andWhere('course.level IN (:...levels)', { levels: query.level });
    }

    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      if (query.priceMin) {
        qb.andWhere('course.price >= :priceMin', { priceMin: query.priceMin });
      }
      if (query.priceMax) {
        qb.andWhere('course.price <= :priceMax', { priceMax: query.priceMax });
      }
    }

    if (query.rating) {
      qb.andWhere('course.rating >= :rating', { rating: query.rating });
    }

    if (query.duration) {
      qb.andWhere('course.duration BETWEEN :durationMin AND :durationMax', {
        durationMin: query.duration.min,
        durationMax: query.duration.max
      });
    }

    if (query.instructor) {
      qb.andWhere('course.instructor ILIKE :instructor', {
        instructor: `%${query.instructor}%`
      });
    }

    // Sorting
    switch (query.sort) {
      case 'relevance':
        qb.orderBy('rank', 'DESC');
        break;
      case 'price':
        qb.orderBy('course.price', 'ASC');
        break;
      case 'rating':
        qb.orderBy('course.rating', 'DESC');
        break;
      case 'newest':
        qb.orderBy('course.createdAt', 'DESC');
        break;
      default:
        qb.orderBy(query.q ? 'rank' : 'course.createdAt', 'DESC');
    }

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    qb.skip((page - 1) * limit).take(limit);

    const [results, total] = await qb.getManyAndCount();

    // Get facets
    const facets = await this.getFacets(query.q);

    return {
      results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      facets
    };
  }

  async getFacets(searchQuery?: string) {
    const qb = courseRepository.createQueryBuilder('course');

    if (searchQuery) {
      qb.where(
        `to_tsvector('english', course.title || ' ' || course.description) @@ plainto_tsquery('english', :searchQuery)`,
        { searchQuery }
      );
    }

    const [categories, levels, priceRanges] = await Promise.all([
      // Categories facet
      qb
        .clone()
        .select('course.category', 'category')
        .addSelect('COUNT(*)', 'count')
        .groupBy('course.category')
        .getRawMany(),

      // Levels facet
      qb
        .clone()
        .select('course.level', 'level')
        .addSelect('COUNT(*)', 'count')
        .groupBy('course.level')
        .getRawMany(),

      // Price ranges facet
      this.getPriceRangeFacets(qb)
    ]);

    return {
      categories: categories.map(c => ({ value: c.category, count: parseInt(c.count) })),
      levels: levels.map(l => ({ value: l.level, count: parseInt(l.count) })),
      priceRanges
    };
  }

  async autocomplete(prefix: string, limit: number = 5) {
    const courses = await courseRepository
      .createQueryBuilder('course')
      .select(['course.id', 'course.title'])
      .where('course.title ILIKE :prefix', { prefix: `${prefix}%` })
      .orWhere(
        `to_tsvector('english', course.title) @@ to_tsquery('english', :tsQuery)`,
        { tsQuery: `${prefix}:*` }
      )
      .limit(limit)
      .getMany();

    const instructors = await courseRepository
      .createQueryBuilder('course')
      .select('DISTINCT course.instructor', 'instructor')
      .where('course.instructor ILIKE :prefix', { prefix: `${prefix}%` })
      .limit(limit)
      .getRawMany();

    return {
      courses: courses.map(c => ({ id: c.id, text: c.title, type: 'course' })),
      instructors: instructors.map(i => ({ text: i.instructor, type: 'instructor' }))
    };
  }

  async saveSearch(userId: number, query: string, filters: any) {
    await searchHistoryRepository.save({
      user: { id: userId },
      query,
      filters
    });
  }

  async getSavedSearches(userId: number) {
    return await savedSearchRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' }
    });
  }

  async getSearchHistory(userId: number, limit: number = 10) {
    return await searchHistoryRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

  async getPopularSearches(limit: number = 10) {
    return await searchHistoryRepository
      .createQueryBuilder('search')
      .select('search.query', 'query')
      .addSelect('COUNT(*)', 'count')
      .groupBy('search.query')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
```

### Alternative: Elasticsearch Integration

```typescript
// backend/src/services/elasticsearchService.ts
import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});

export class ElasticsearchService {
  async indexCourse(course: Course) {
    await client.index({
      index: 'courses',
      id: course.id.toString(),
      document: {
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        price: course.price,
        rating: course.rating,
        instructor: course.instructor,
        duration: course.duration
      }
    });
  }

  async search(query: string, filters: any) {
    const must: any[] = [];

    // Full-text search
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['title^3', 'description', 'instructor^2'],
          fuzziness: 'AUTO'
        }
      });
    }

    // Filters
    const filter: any[] = [];

    if (filters.category?.length) {
      filter.push({ terms: { category: filters.category } });
    }

    if (filters.level?.length) {
      filter.push({ terms: { level: filters.level } });
    }

    if (filters.priceMin || filters.priceMax) {
      filter.push({
        range: {
          price: {
            gte: filters.priceMin || 0,
            lte: filters.priceMax || 1000000
          }
        }
      });
    }

    const result = await client.search({
      index: 'courses',
      body: {
        query: {
          bool: { must, filter }
        },
        aggs: {
          categories: {
            terms: { field: 'category.keyword' }
          },
          levels: {
            terms: { field: 'level.keyword' }
          },
          price_ranges: {
            range: {
              field: 'price',
              ranges: [
                { key: 'Free', to: 1 },
                { key: '$1-$50', from: 1, to: 50 },
                { key: '$50-$100', from: 50, to: 100 },
                { key: '$100+', from: 100 }
              ]
            }
          }
        },
        from: (filters.page - 1) * filters.limit,
        size: filters.limit
      }
    });

    return {
      results: result.hits.hits.map(hit => hit._source),
      total: result.hits.total,
      facets: result.aggregations
    };
  }
}
```

### Frontend - Search Component

```typescript
// src/app/search/search.component.ts
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

export class SearchComponent implements OnInit {
  searchQuery$ = new Subject<string>();
  suggestions$: Observable<any[]>;
  results$: Observable<any>;

  filters = {
    category: [],
    level: [],
    priceMin: null,
    priceMax: null,
    rating: null
  };

  ngOnInit() {
    // Autocomplete
    this.suggestions$ = this.searchQuery$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.searchService.autocomplete(query))
    );

    // Search results
    this.results$ = this.searchForm.valueChanges.pipe(
      debounceTime(500),
      switchMap(value => this.searchService.search(value.query, this.filters))
    );
  }

  onSearchInput(query: string) {
    this.searchQuery$.next(query);
  }

  search() {
    this.results$ = this.searchService.search(
      this.searchForm.value.query,
      this.filters
    );
  }

  applyFilter(filterType: string, value: any) {
    this.filters[filterType] = value;
    this.search();
  }

  clearFilters() {
    this.filters = {
      category: [],
      level: [],
      priceMin: null,
      priceMax: null,
      rating: null
    };
    this.search();
  }

  saveSearch() {
    this.searchService.saveSearch(
      this.searchForm.value.query,
      this.filters
    ).subscribe();
  }
}
```

### Search Template with Facets

```html
<!-- search.component.html -->
<div class="search-container">
  <!-- Search Bar -->
  <mat-form-field class="search-input">
    <input matInput
           placeholder="Search courses..."
           [formControl]="searchControl"
           (input)="onSearchInput($event.target.value)"
           [matAutocomplete]="auto">

    <mat-autocomplete #auto="matAutocomplete">
      <mat-option *ngFor="let suggestion of suggestions$ | async"
                  [value]="suggestion.text">
        <mat-icon>{{ suggestion.type === 'course' ? 'book' : 'person' }}</mat-icon>
        {{ suggestion.text }}
      </mat-option>
    </mat-autocomplete>
  </mat-form-field>

  <div class="search-content">
    <!-- Filters Sidebar -->
    <aside class="filters-sidebar">
      <h3>Filters</h3>

      <!-- Category Filter -->
      <div class="filter-group">
        <h4>Category</h4>
        <mat-checkbox *ngFor="let cat of facets?.categories"
                      [checked]="filters.category.includes(cat.value)"
                      (change)="toggleFilter('category', cat.value)">
          {{ cat.value }} ({{ cat.count }})
        </mat-checkbox>
      </div>

      <!-- Level Filter -->
      <div class="filter-group">
        <h4>Level</h4>
        <mat-radio-group [(ngModel)]="filters.level">
          <mat-radio-button *ngFor="let level of facets?.levels"
                            [value]="level.value">
            {{ level.value }} ({{ level.count }})
          </mat-radio-button>
        </mat-radio-group>
      </div>

      <!-- Price Range -->
      <div class="filter-group">
        <h4>Price Range</h4>
        <mat-slider min="0" max="500" step="10"
                    [(ngModel)]="filters.priceMax">
        </mat-slider>
        <span>Up to ${{ filters.priceMax }}</span>
      </div>

      <!-- Rating Filter -->
      <div class="filter-group">
        <h4>Minimum Rating</h4>
        <mat-button-toggle-group [(ngModel)]="filters.rating">
          <mat-button-toggle [value]="4">4+ ⭐</mat-button-toggle>
          <mat-button-toggle [value]="3">3+ ⭐</mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <button mat-stroked-button (click)="clearFilters()">
        Clear All Filters
      </button>
    </aside>

    <!-- Search Results -->
    <main class="search-results">
      <div class="results-header">
        <span *ngIf="results$ | async as results">
          {{ results.total }} courses found
        </span>

        <mat-form-field>
          <mat-select [(ngModel)]="sortBy" (selectionChange)="search()">
            <mat-option value="relevance">Most Relevant</mat-option>
            <mat-option value="rating">Highest Rated</mat-option>
            <mat-option value="price">Price: Low to High</mat-option>
            <mat-option value="newest">Newest</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div *ngIf="results$ | async as results">
        <app-course-card *ngFor="let course of results.results"
                         [course]="course">
        </app-course-card>

        <mat-paginator [length]="results.total"
                       [pageSize]="20"
                       (page)="onPageChange($event)">
        </mat-paginator>
      </div>
    </main>
  </div>
</div>
```

## API Endpoints

```
GET  /api/search/courses        - Search courses with filters
GET  /api/search/autocomplete   - Autocomplete suggestions
GET  /api/search/history         - User search history
POST /api/search/save            - Save search
GET  /api/search/saved           - Get saved searches
GET  /api/search/popular         - Popular searches
```

## Database Indexes

```sql
-- PostgreSQL Full-Text Search indexes
CREATE INDEX idx_course_fts ON courses
USING gin(to_tsvector('english', title || ' ' || description));

CREATE INDEX idx_course_category ON courses(category);
CREATE INDEX idx_course_level ON courses(level);
CREATE INDEX idx_course_price ON courses(price);
CREATE INDEX idx_course_rating ON courses(rating);
```

## Features

✅ Full-text search with relevance ranking
✅ Multi-criteria filtering
✅ Faceted search with aggregations
✅ Autocomplete and suggestions
✅ Search history
✅ Saved searches
✅ Fuzzy matching
✅ Real-time search (as you type)
✅ Advanced sorting options
✅ Pagination
✅ Search analytics
✅ Popular searches
✅ Highlight search terms in results

This skill provides enterprise-grade search functionality for finding courses quickly and efficiently.
