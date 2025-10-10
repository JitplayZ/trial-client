# Welcome to tRIAL - cLIENTS

## Project info

**URL**: https://lovable.dev/projects/f3a9940b-3ce7-403f-b434-4589e0d4c41a

## Feature Flags

This project uses feature flags for toggling certain features during development and production:

### Environment Variables (Frontend)

Add these to your `.env` file or configure in localStorage:

```bash
# Show/hide ad slots (use localStorage for quick toggle)
# Set to 'true' to enable ads, 'false' to hide
FF_SHOW_ADS=false

# Use mock API responses for quota management
# Set to 'true' during development
FF_USE_MOCK_ME=true

# Enable gamification features
FF_GAMIFY=true
```

### LocalStorage Feature Flags

For quick development toggles without rebuilding:

```javascript
// Show ads
localStorage.setItem('FF_SHOW_ADS', 'true');

// Set mock user plan (free, pro, proplus)
localStorage.setItem('MOCK_USER_PLAN', 'free');

// Reload to apply changes
window.location.reload();
```

### Plan Quotas (Frontend Mock)

The following quota limits are implemented in the frontend UI:

**Free Plan:**
- Beginner: Unlimited
- Intermediate: 2 per month
- Veteran: Locked

**Pro Plan:**
- Beginner: Unlimited
- Intermediate: Unlimited
- Veteran: 4 per month

**Pro+ Plan:**
- Beginner: Unlimited
- Intermediate: Unlimited
- Veteran: 20 per month

### Switching to Real Backend

When ready to connect real backend APIs:

1. **Replace mock API calls in:**
   - `src/hooks/useQuotaManagement.ts` - Replace localStorage mock with actual `GET /api/me` endpoint
   - `src/components/modals/ProjectDetailModal.tsx` - Update `POST /api/generate-project` endpoint

2. **API Contract:**

```typescript
// GET /api/me
{
  id: string;
  email: string;
  plan: 'free' | 'pro' | 'proplus';
  quotas: {
    beginnerLeft: number;      // -1 = unlimited
    intermediateLeft: number;  // -1 = unlimited
    veteranLeft: number;       // -1 = unlimited, 0 = locked
    resetAt: string;           // ISO date string
  };
}

// POST /api/generate-project
Request: {
  userId: string;
  level: 'beginner' | 'intermediate' | 'veteran';
  projectType: string;
  industry: string;
}
Response: {
  ok: boolean;
  id?: string;
  brief?: object;
  error?: 'quota_exceeded' | string;
  requiredPlan?: 'pro' | 'proplus';
}
```

3. **Remove feature flags:**
   - Set `FF_USE_MOCK_ME=false`
   - Remove localStorage overrides

### SEO Features

- **Structured Data:** JSON-LD implemented on landing page, help/FAQ page
- **Sitemap:** Available at `/sitemap.xml` route (download to deploy as static file)
- **Meta Tags:** Comprehensive OpenGraph, Twitter, and canonical tags on all pages
- **Blog:** 12 SEO-optimized blog post stubs at `/blog`
- **Content Plan:** See `docs/content-plan.md` for keyword strategy

### Ad Slots

Non-intrusive ad placeholders are implemented with CLS prevention:

- Landing: Leaderboard (desktop), sidebar (desktop), native mobile
- Dashboard: Right rail (desktop)
- Toggle visibility with `FF_SHOW_ADS` flag

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/f3a9940b-3ce7-403f-b434-4589e0d4c41a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/f3a9940b-3ce7-403f-b434-4589e0d4c41a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
