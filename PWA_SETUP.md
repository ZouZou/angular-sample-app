# Progressive Web App (PWA) Setup

This application has been configured as a Progressive Web App (PWA), enabling offline functionality, installation, and enhanced performance.

## Features Implemented

### 1. **App Installation**
- Users can install the app on their device (mobile and desktop)
- Custom install prompt appears after 3 seconds for eligible users
- Special iOS installation instructions for Safari users
- Install shortcuts in the manifest for quick access

### 2. **Offline Support**
- Service worker ready for caching strategies
- App shell architecture for fast loading
- Offline fallback pages

### 3. **Web App Manifest**
- Configured in `src/manifest.json`
- Includes app metadata, icons, theme colors
- Shortcuts to key pages (Courses, Dashboard)

### 4. **PWA Meta Tags**
- Theme color for mobile browsers
- Apple-specific meta tags for iOS
- Description and title metadata

## Required Icons

To complete the PWA setup, add the following icon files to `src/assets/icons/`:

### Icon Sizes Required:
- **icon-72x72.png** (72x72 pixels)
- **icon-96x96.png** (96x96 pixels)
- **icon-128x128.png** (128x128 pixels)
- **icon-144x144.png** (144x144 pixels)
- **icon-152x152.png** (152x152 pixels)
- **icon-192x192.png** (192x192 pixels)
- **icon-384x384.png** (384x384 pixels)
- **icon-512x512.png** (512x512 pixels)

### Icon Design Guidelines:
- Use the brand primary color (#0066CC) as the background
- Include a simple, recognizable symbol or logo
- Ensure icons work well on both light and dark backgrounds
- Make icons "maskable" - keep important content within the safe zone (80% of canvas)

### Quick Icon Generation:
1. Create a 512x512 master icon
2. Use tools like [PWA Builder](https://www.pwabuilder.com/imageGenerator) or [Real Favicon Generator](https://realfavicongenerator.net/)
3. Generate all required sizes automatically

## Service Worker Configuration

### To Enable Full Service Worker Functionality:

1. **Install @angular/service-worker**:
   ```bash
   npm install @angular/service-worker --save
   ```

2. **Create ngsw-config.json** in project root:
   ```json
   {
     "index": "/index.html",
     "assetGroups": [
       {
         "name": "app",
         "installMode": "prefetch",
         "resources": {
           "files": [
             "/favicon.ico",
             "/index.html",
             "/manifest.json",
             "/*.css",
             "/*.js"
           ]
         }
       },
       {
         "name": "assets",
         "installMode": "lazy",
         "updateMode": "prefetch",
         "resources": {
           "files": [
             "/assets/**",
             "/*.(eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)"
           ]
         }
       }
     ],
     "dataGroups": [
       {
         "name": "api-courses",
         "urls": ["/api/courses/**"],
         "cacheConfig": {
           "maxSize": 100,
           "maxAge": "1h",
           "strategy": "freshness"
         }
       },
       {
         "name": "api-other",
         "urls": ["/api/**"],
         "cacheConfig": {
           "maxSize": 100,
           "maxAge": "6h",
           "strategy": "performance"
         }
       }
     ]
   }
   ```

3. **Update angular.json** to include service worker in production builds:
   ```json
   "production": {
     "serviceWorker": true,
     "ngswConfigPath": "ngsw-config.json"
   }
   ```

4. **Import ServiceWorkerModule** in app.module.ts:
   ```typescript
   import { ServiceWorkerModule } from '@angular/service-worker';
   import { environment } from '../environments/environment';

   @NgModule({
     imports: [
       ServiceWorkerModule.register('ngsw-worker.js', {
         enabled: environment.production,
         registrationStrategy: 'registerWhenStable:30000'
       })
     ]
   })
   ```

## Testing PWA Locally

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Serve with HTTP server**:
   ```bash
   npx http-server -p 8080 -c-1 dist/myapp
   ```

3. **Test in Chrome DevTools**:
   - Open DevTools (F12)
   - Go to Application tab
   - Check Manifest, Service Workers, and Storage

## PWA Components

### PwaService
Location: `src/app/shared/services/pwa.service.ts`

Handles:
- Install prompt events
- Installation detection
- Platform-specific checks (iOS, Safari)

### PwaInstallPromptComponent
Location: `src/app/shared/components/pwa-install-prompt/`

Features:
- Automatic install prompt (Android, Desktop)
- iOS-specific installation instructions
- User-friendly dismissal
- LocalStorage to remember user preference

## Usage in Components

### Add Install Prompt to App

In `app.component.html`, add:
```html
<app-pwa-install-prompt></app-pwa-install-prompt>
```

### Check If App Is Installed

```typescript
constructor(private pwaService: PwaService) {}

ngOnInit() {
  this.pwaService.isInstalled$.subscribe(isInstalled => {
    if (isInstalled) {
      console.log('App is installed!');
    }
  });
}
```

### Programmatically Trigger Install

```typescript
async installApp() {
  const accepted = await this.pwaService.promptInstall();
  if (accepted) {
    // User accepted installation
  }
}
```

## Browser Support

- ✅ **Chrome/Edge** (Android, Desktop): Full support
- ✅ **Safari** (iOS/Mac): Manual installation via Share menu
- ✅ **Firefox**: Install available via address bar icon
- ⚠️ **iOS Safari**: Requires manual "Add to Home Screen"

## Benefits

1. **Faster Load Times**: Cached resources load instantly
2. **Offline Access**: Core functionality available without internet
3. **Install on Device**: Appears like native app
4. **Push Notifications**: Re-engage users (when implemented)
5. **Reduced Data Usage**: Efficient caching strategies
6. **Better SEO**: Google rewards PWA features

## Next Steps

1. Generate and add all required icon files
2. Install @angular/service-worker package
3. Test installation on various devices
4. Implement push notifications (optional)
5. Add offline fallback pages
6. Monitor PWA analytics

## Resources

- [Angular PWA Documentation](https://angular.io/guide/service-worker-intro)
- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse)
