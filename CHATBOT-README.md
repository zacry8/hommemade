# Homme Made AI Assistants

## Overview

Professional AI chatbot system integrated with the Homme Made website, featuring three specialized AI assistants that embody our human-in-the-loop philosophy.

## Features

### 🎨 Creative Director Assistant
- Brand strategy and visual direction
- Creative problem-solving and ideation
- Design system development
- Campaign conceptualization

### ⚡ Automation Consultant
- Workflow optimization and process automation
- Human-in-the-loop system design
- Technical integration guidance
- Efficiency improvements

### 📸 Portfolio Assistant
- Project insights and creative analysis
- Portfolio development and organization
- Work presentation strategies
- Creative showcase expertise

## Architecture

### Frontend
- **Pages**: Pure HTML with integrated design system
- **Styling**: Glass morphism with Homme Made brand colors
- **JavaScript**: Vanilla JS with modern ES6+ features
- **Responsive**: Mobile-first design approach

### Backend
- **API**: Vercel serverless functions
- **Primary Provider**: OpenRouter (free Qwen3 235B model)
- **Fallback Provider**: Groq (free Llama 3 models)
- **Security**: Environment variables, rate limiting

### Design Integration
- **Fonts**: Space Mono (body), Instrument Serif (headers)
- **Colors**: Lime green accents, terracotta highlights
- **Effects**: 33px border radius, glass morphism, backdrop blur
- **Navigation**: Integrated with existing floating nav system

## Deployment Setup

### 1. Environment Variables (Vercel Dashboard)

```bash
# Required - Get free API key from OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional - Fallback provider
GROQ_API_KEY=your_groq_api_key_here

# Auto-configured
VERCEL_URL=your-site-url.vercel.app
```

### 2. Get API Keys

#### OpenRouter (Primary - Free Qwen3 235B)
1. Visit [openrouter.ai](https://openrouter.ai)
2. Sign up for free account
3. Generate API key
4. Add to Vercel environment variables

#### Groq (Fallback - Optional)
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for free account
3. Generate API key
4. Add to Vercel environment variables

### 3. Deploy
```bash
# Push to GitHub (auto-deploys via Vercel)
git add .
git commit -m "Add AI chatbot system"
git push origin main
```

## File Structure

```
/public/
├── chatbot.html                 # Main chatbot selector
├── chatbot-creative-director.html
├── chatbot-automation-consultant.html
├── chatbot-portfolio-assistant.html
├── styles/chatbot.css          # Chatbot-specific styles
└── js/chatbot.js               # Frontend chat logic

/api/
└── chat.js                     # Serverless function for AI API

/
├── vercel.json                 # Updated with API config
├── .env.example                # Environment template
└── CHATBOT-README.md           # This file
```

## Usage Analytics

The system tracks:
- Chatbot selection events
- Message counts per conversation
- User engagement patterns
- Error rates and performance

Analytics are sent to the existing Google Analytics setup.

## Customization

### Adding New Personalities
1. Create new HTML page in `/public/`
2. Add system prompt in `/public/js/chatbot.js`
3. Update navigation in all pages
4. Add to header-nav.js active states

### Modifying AI Behavior
Update system prompts in `/public/js/chatbot.js`:
- `creative-director`
- `automation-consultant`
- `portfolio-assistant`

### Styling Changes
All styles inherit from existing design system variables in `/public/styles/main.css`.

## Performance

### Optimization Features
- Groq API for fast responses (typically <2s)
- Fallback to OpenRouter if primary fails
- Rate limiting to prevent abuse
- Efficient caching for static assets
- Mobile-optimized interface

### Cost Structure
- **Development**: 100% free (OpenRouter free tier with Qwen3 235B)
- **Production**: Scales with usage
  - OpenRouter: Free tier covers most small business needs
  - Vercel: Free hosting for reasonable traffic
  - Groq: Free fallback provider

## Maintenance

### Monitoring
- Check Vercel function logs for errors
- Monitor API usage in provider dashboards
- Track user engagement via Google Analytics

### Updates
- System prompts can be updated in JavaScript
- UI changes follow existing design system
- API providers can be swapped in `/api/chat.js`

## Integration Points

### Existing Site Features
- ✅ Navigation system (floating pill nav)
- ✅ Design system (glass morphism, colors, fonts)
- ✅ Analytics (Google Analytics integration)
- ✅ Mobile responsiveness
- ✅ SEO optimization

### Future Enhancements
- RAG integration with portfolio data
- Voice chat capabilities
- Conversation history persistence
- Advanced personalization
- Multi-language support

## Support

For technical issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test API keys in provider dashboards
4. Review browser console for frontend errors

The chatbot system is designed to enhance rather than replace human interaction, aligning with Homme Made's human-in-the-loop philosophy.