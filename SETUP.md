# Compound Detailing Website Setup Guide

## Deployment on Railway.app

### 1. Railway Deployment
1. **Connect Repository**: Link your GitHub repository to Railway.app
2. **Domain Setup**: Configure your custom domain `compounddetailing.co.uk` in Railway dashboard
3. **Environment Variables**: Set up the required environment variables (see below)
4. **Deploy**: Railway will automatically deploy using the included `package.json` and `railway.json`

### 2. Domain Configuration
- In Railway dashboard, go to Settings > Domains
- Add custom domain: `compounddetailing.co.uk`
- Update your DNS provider with Railway's provided CNAME record
- SSL certificate will be automatically provisioned

## Supabase Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from Settings > API

### 2. Database Schema Setup
1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `database-schema.sql`
3. Run the SQL to create tables, policies, and sample data

### 3. Authentication Setup
1. In Supabase dashboard, go to Authentication > Settings
2. Enable email authentication
3. Create an admin user account:
   - Email: `admin@compounddetailing.co.uk` (or your preferred email)
   - Password: Choose a secure password
4. Note: The admin login will use email/password instead of username

### 4. Configure Application
1. Open `supabase-config.js`
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'your-actual-supabase-project-url';
   const SUPABASE_ANON_KEY = 'your-actual-supabase-anon-key';
   ```

## Environment Variables (Optional - for production)
Instead of hardcoding in `supabase-config.js`, you can use environment variables:

```javascript
const SUPABASE_URL = process.env.SUPABASE_URL || 'your-fallback-url';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-fallback-key';
```

In Railway dashboard, add these environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key

## Features Included

### 🌐 Frontend
- Modern responsive design with dark theme
- Interactive animations and effects
- Image gallery with lightbox
- Quote generator with WhatsApp integration
- Mobile-optimized navigation

### 🛠 Admin Dashboard
- Secure authentication via Supabase
- Real-time job management
- Status tracking (pending → assigned → completed)
- Staff assignment with click-to-edit
- Revenue tracking and statistics
- Responsive design for mobile/tablet

### 📊 Database Features
- PostgreSQL database via Supabase
- Row Level Security (RLS) enabled
- Real-time updates
- Automatic timestamps
- Data validation constraints
- Performance indexes

### 🔐 Security
- Supabase authentication
- Row Level Security policies
- Secure API endpoints
- Environment variable support

## Testing the Setup

### 1. Test Website
- Visit your deployed site
- Test quote generator
- Verify WhatsApp integration
- Check image gallery functionality

### 2. Test Admin Dashboard
1. Go to `/login.html`
2. Use your Supabase admin credentials
3. Test adding/editing/deleting jobs
4. Verify real-time updates
5. Check statistics display

### 3. Test Database
- Check Supabase dashboard for new data
- Verify RLS policies are working
- Test real-time subscriptions

## Troubleshooting

### Common Issues
1. **Supabase Connection**: Verify URL and anon key are correct
2. **Authentication**: Ensure admin user exists in Supabase Auth
3. **RLS Policies**: Check Row Level Security is properly configured
4. **Domain**: DNS propagation can take up to 24 hours

### Support
- Railway documentation: [docs.railway.app](https://docs.railway.app)
- Supabase documentation: [supabase.com/docs](https://supabase.com/docs)

## File Structure
```
├── index.html              # Main landing page
├── login.html             # Admin login
├── admin.html             # Admin dashboard
├── styles.css             # Main styles
├── admin.css              # Admin styles
├── script.js              # Frontend JavaScript
├── admin.js               # Admin dashboard logic
├── supabase-config.js     # Database configuration
├── database-schema.sql    # Database setup
├── package.json           # Node.js dependencies
├── railway.json           # Railway deployment config
└── [1-9]/                 # Image directories
``` 