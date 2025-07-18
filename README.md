# Homme Made Onboarding System

A comprehensive onboarding form system with Vercel Blob storage, admin dashboard, and email notifications. Built following the mind-bank philosophy of Open Source, Free to Operate, and Secure & Private.

## Features

- **Progressive Multi-Step Form**: 5-section onboarding flow with glassmorphism design
- **File Upload**: Secure file upload to Vercel Blob storage
- **Admin Dashboard**: Beautiful admin interface to view and export submissions
- **CSV Export**: One-click export of all form submissions
- **Email Notifications**: Automated email notifications with Resend/SMTP fallback
- **Analytics**: Built-in Google Analytics 4 tracking
- **Responsive Design**: Mobile-optimized glassmorphism interface
- **Form Validation**: Client and server-side validation with sanitization
- **Rate Limiting**: Spam protection with configurable limits
- **Basic Auth**: Simple admin authentication for security

## Architecture

### Backend (API Routes)
- `/api/submit` - Form submission with validation and blob storage
- `/api/upload` - File upload to Vercel Blob
- `/api/admin/submissions` - Admin API to list submissions
- `/api/admin/export-csv` - CSV export functionality

### Libraries
- `/lib/config.js` - Environment configuration management
- `/lib/validation.js` - Form validation and sanitization
- `/lib/email.js` - Email notification system
- `/lib/auth.js` - Basic authentication middleware
- `/lib/rateLimit.js` - Rate limiting for spam protection

### Frontend
- `onboarding-form.html` - Main onboarding form with progressive enhancement
- `admin.html` - Admin dashboard with glassmorphism design
- `styles/main.css` - Glassmorphism design system
- Analytics integration with Google Analytics 4

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `BLOB_READ_WRITE_TOKEN=your-vercel-blob-token`
- `ADMIN_USERNAME=admin` (optional)
- `ADMIN_PASSWORD=your-secure-password` (optional)
- `RESEND_API_KEY=your-resend-api-key` (optional)
- `EMAIL_FROM=noreply@yourdomain.com`
- `EMAIL_TO=admin@yourdomain.com`

### 3. Vercel Blob Setup

1. Create Vercel account and project
2. Go to your project → Storage → Connect Database → Blob store
3. Copy the `BLOB_READ_WRITE_TOKEN` to your environment variables
4. Run `vercel env pull` to sync environment variables locally

### 4. Admin Authentication (Optional)

1. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in your environment
2. These credentials will be required to access `/admin.html`
3. If not set, admin dashboard will be unprotected (development only)

### 5. Email Setup

**Option A: Resend (Recommended)**
1. Sign up for Resend account
2. Add API key to environment variables

**Option B: SMTP**
1. Configure SMTP settings in environment variables
2. For Gmail: use App Passwords

### 6. Deploy

```bash
npm run deploy
```

## Development

### Local Development

```bash
npm run dev
```

### Testing

The system includes comprehensive validation and error handling:

1. **Form Validation**: Client and server-side validation
2. **File Upload**: Type and size validation
3. **Rate Limiting**: Spam protection with configurable limits
4. **Admin Authentication**: Basic auth for dashboard access
5. **Email Notifications**: Fallback systems for reliability

### Admin Dashboard

Access the admin dashboard at `/admin.html` to:
- View all form submissions in a beautiful interface
- Export submissions as CSV for spreadsheet analysis
- Export submissions as JSON for data processing
- Search and filter submissions
- View detailed submission information including files
- Monitor submission statistics and trends

### Data Storage

All submissions are stored as JSON files in Vercel Blob storage:
- **Submissions**: `submissions/YYYY-MM-DDTHH-MM-SS-000Z.json`
- **Uploaded Files**: `uploads/SUBMISSION-ID-filename.ext`
- **Private Access**: All files are stored with private access
- **Your Data**: Everything stays in your Vercel account

### Security Features

- **Rate Limiting**: 5 submissions per 15 minutes per IP
- **Input Validation**: All form data is validated and sanitized
- **File Validation**: File type and size restrictions
- **Basic Auth**: Admin dashboard protection
- **Private Storage**: All files stored with private access
- **No External Dependencies**: No third-party CRM or databases required

## Mind-Bank Principles

This system follows the mind-bank philosophy:

- **Open Source by Default**: All code is transparent and modular
- **Free to Run & Operate**: Uses open-source CRM and free/low-cost services
- **Functional Over Flash**: Clean, readable code with clear purposes
- **Secure & Private**: No unnecessary data collection, private file storage
- **Community-Aligned**: User-focused experience with no dark patterns

## File Structure

```
/
├── api/
│   ├── submit.js              # Form submission handler
│   ├── upload.js              # File upload handler
│   └── admin/
│       ├── submissions.js     # Admin API to list submissions
│       └── export-csv.js      # CSV export functionality
├── lib/
│   ├── config.js             # Environment configuration
│   ├── validation.js         # Form validation
│   ├── email.js              # Email notifications
│   ├── auth.js               # Basic authentication
│   └── rateLimit.js          # Rate limiting
├── styles/
│   └── main.css              # Glassmorphism design system
├── onboarding-form.html      # Main onboarding form
├── admin.html                # Admin dashboard
├── package.json              # Dependencies
├── .env.example              # Environment template
└── README.md                 # This file
```

## Analytics

The system tracks:
- Form section progression
- Field interactions
- Validation errors
- File uploads
- Form completions
- Conversion funnel

## Security Features

- Input validation and sanitization
- File type and size restrictions
- Private file storage
- No sensitive data logging
- Environment-based secrets
- CORS protection

## Troubleshooting

### Common Issues

1. **Admin Dashboard Not Loading**
   - Check if admin credentials are set in environment
   - Verify basic auth credentials
   - Check browser console for JavaScript errors

2. **Form Submissions Not Appearing**
   - Verify `BLOB_READ_WRITE_TOKEN` is set correctly
   - Check API route responses in browser network tab
   - Ensure submissions are being stored in Vercel Blob

3. **File Upload Failed**
   - Verify Vercel Blob token
   - Check file size limits (default 10MB)
   - Confirm allowed file types

4. **Email Notifications Not Working**
   - Check email provider configuration
   - Verify API keys
   - Test SMTP settings

5. **Rate Limiting Issues**
   - Check if IP is being rate limited (5 submissions per 15 minutes)
   - Clear rate limit data if needed
   - Adjust rate limit settings in `rateLimit.js`

### Debug Mode

Enable debug logging:
```bash
DEBUG=true
```

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
1. Check this documentation
2. Review environment configuration
3. Check server logs with debug mode enabled
4. Contact the development team