# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website project for "Homme Made" - a creative agency that specializes in human-in-the-loop creative systems. The project consists of:

- **index.html**: Main landing page with hero section, services overview, philosophy, and contact information
- **pricing-menu.html**: Comprehensive pricing and services menu page with subscription plans and detailed service offerings
- **vercel.json**: Vercel deployment configuration with clean URLs enabled

## Architecture

This is a pure HTML/CSS static website with no build process or JavaScript framework. The architecture is:

- **Frontend**: Pure HTML with embedded CSS styling
- **Deployment**: Configured for Vercel hosting with clean URLs
- **Styling**: CSS custom properties (variables) for consistent theming
- **Layout**: CSS Grid and Flexbox for responsive design

## Design System

Both pages follow a consistent design system:

### Color Palette
- Primary dark backgrounds (#1a1a1a, #2d2d2d, #0a0a0a)
- Accent lime green (#D3FF00, #d3ff00)
- Text colors (white, light gray, muted gray)
- Glass morphism effects with backdrop blur

### Typography
- **Main**: 'Space Mono' (monospace) for body text
- **Headers**: 'DM Serif Display' (serif) for main page, 'Inter' for pricing page
- **Brand**: Consistent "Homme Made" branding

### Layout Patterns
- Fixed header with backdrop blur
- Hero sections with centered content
- Grid-based service/content layouts
- Glass morphism cards with border radius and shadows

## Development Workflow

### Local Development
No build process required - open HTML files directly in browser or serve with a simple HTTP server.

### Testing
Test responsive design across different viewport sizes. Key breakpoints:
- Mobile: 480px and below
- Tablet: 768px and below
- Desktop: 1200px max-width containers

### Deployment
The site is configured for Vercel deployment with:
- Clean URLs enabled (removes .html extensions)
- Automatic deployment from git commits

## Content Strategy

The site positions Homme Made as a premium creative agency that bridges the gap between handcrafted design and automated systems. Key messaging:
- "Human in the loop" automation
- Craft over churn philosophy
- Premium subscription-based services
- Technical expertise with creative soul

## File Structure

```
/
├── index.html           # Main landing page
├── pricing-menu.html    # Detailed pricing and services
├── vercel.json         # Deployment configuration
├── LICENSE             # Project license
└── .gitignore          # Git ignore rules
```

## Making Changes

When editing content:
1. Maintain the established design system and color palette
2. Keep the glass morphism aesthetic consistent
3. Ensure responsive design works across all breakpoints
4. Update both pages if making brand or style changes
5. Test locally before committing

When adding new pages:
1. Follow the established HTML structure and CSS patterns
2. Maintain consistent navigation and branding
3. Use the same CSS custom properties for colors and spacing
4. Ensure responsive design implementation