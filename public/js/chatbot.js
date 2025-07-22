/* Chatbot Selection and Interface JavaScript */

document.addEventListener('DOMContentLoaded', function() {
  
  // Handle chatbot card clicks
  const chatbotCards = document.querySelectorAll('.chatbot-card');
  
  chatbotCards.forEach(card => {
    const button = card.querySelector('.cta-button');
    const botType = card.dataset.bot;
    
    // Add click handlers to both card and button
    [card, button].forEach(element => {
      element.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Add loading state
        button.textContent = 'Loading...';
        button.disabled = true;
        
        // Navigate to specific chatbot page
        window.location.href = `chatbot-${botType}.html`;
        
        // Track analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'chatbot_selected', {
            'event_category': 'chatbot',
            'event_label': botType,
            'value': 1
          });
        }
      });
    });
    
    // Prevent button click from triggering card click
    button.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  });

  // Add hover effects with better performance
  chatbotCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.willChange = 'transform, box-shadow';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.willChange = 'auto';
    });
  });
});


/* Chat Interface Functions */
class ChatInterface {
  constructor(botType, systemPrompt) {
    this.botType = botType;
    this.systemPrompt = systemPrompt;
    this.messages = [];
    this.isTyping = false;
    
    this.initializeElements();
    this.setupEventListeners();
    this.addWelcomeMessage();
  }
  
  initializeElements() {
    this.messagesContainer = document.querySelector('.chat-messages');
    this.inputField = document.querySelector('.chat-input');
    this.sendButton = document.querySelector('.chat-send');
    
    if (!this.messagesContainer || !this.inputField || !this.sendButton) {
      console.error('Chat interface elements not found');
      return;
    }
  }
  
  setupEventListeners() {
    // Send button click
    this.sendButton.addEventListener('click', () => this.sendMessage());
    
    // Enter key in input (shift+enter for new line)
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // Auto-resize input
    this.inputField.addEventListener('input', () => {
      this.inputField.style.height = 'auto';
      this.inputField.style.height = this.inputField.scrollHeight + 'px';
    });
  }
  
  addWelcomeMessage() {
    const welcomeMessages = {
      'creative-director': "Hello! I'm your Creative Director assistant. I can help with brand strategy, visual direction, creative problem-solving, and design systems. What creative challenge are you working on?",
      'automation-consultant': "Hi there! I'm your Automation Consultant. I specialize in workflow optimization, process automation, and technical integration. How can I help streamline your operations?",
      'portfolio-assistant': "Welcome! I'm your Portfolio Assistant. I can provide insights on your creative work, help with portfolio development, and offer project analysis. What would you like to explore?"
    };
    
    const welcomeText = welcomeMessages[this.botType] || "Hello! How can I assist you today?";
    this.addMessage('bot', welcomeText);
  }
  
  async sendMessage() {
    const message = this.inputField.value.trim();
    if (!message || this.isTyping) return;
    
    console.log('💬 Sending message:', message);
    
    // Add user message
    this.addMessage('user', message);
    this.inputField.value = '';
    this.inputField.style.height = 'auto';
    
    // Show typing indicator
    this.showTypingIndicator();
    
    try {
      // Send to API
      console.log('🔄 Calling chat API...');
      const response = await this.callChatAPI(message);
      console.log('✅ Got response:', response);
      this.hideTypingIndicator();
      this.addMessage('bot', response);
      
      // Track conversation
      if (typeof gtag !== 'undefined') {
        gtag('event', 'chat_message_sent', {
          'event_category': 'chatbot',
          'event_label': this.botType,
          'value': this.messages.length
        });
      }
      
    } catch (error) {
      console.error('❌ Chat API error:', error);
      this.hideTypingIndicator();
      this.addMessage('bot', "I apologize, but I'm having trouble responding right now. Please try again in a moment, or feel free to contact our human team directly.");
    }
  }
  
  async callChatAPI(message) {
    // Add message to conversation history
    this.messages.push({
      role: 'user',
      content: message
    });
    
    const requestData = {
      messages: [
        { role: 'system', content: this.systemPrompt },
        ...this.messages
      ],
      botType: this.botType
    };
    
    console.log('📤 Sending API request:', requestData);
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    console.log('📥 API response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📋 API response data:', data);
    
    // Add bot response to history
    this.messages.push({
      role: 'assistant',
      content: data.message
    });
    
    return data.message;
  }
  
  addMessage(sender, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'user' ? '👤' : this.getBotEmoji();
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }
  
  getBotEmoji() {
    const emojis = {
      'creative-director': '🎨',
      'automation-consultant': '⚡',
      'portfolio-assistant': '📸'
    };
    return emojis[this.botType] || '🤖';
  }
  
  showTypingIndicator() {
    this.isTyping = true;
    this.sendButton.disabled = true;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing-indicator';
    typingDiv.innerHTML = `
      <div class="message-avatar">${this.getBotEmoji()}</div>
      <div class="message-content">
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    
    this.messagesContainer.appendChild(typingDiv);
    this.scrollToBottom();
  }
  
  hideTypingIndicator() {
    this.isTyping = false;
    this.sendButton.disabled = false;
    
    const typingIndicator = this.messagesContainer.querySelector('.typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}

// Initialize chat interface if on a chatbot page
if (window.location.pathname.includes('chatbot-')) {
  document.addEventListener('DOMContentLoaded', function() {
    // Extract bot type from URL
    const botType = window.location.pathname.match(/chatbot-(.+)\.html/)?.[1];
    
    if (botType) {
      // System prompts for each bot type
      const systemPrompts = {
        'creative-director': `You are the Creative Director assistant for Homme Made, a creative agency specializing in human-in-the-loop creative systems. You help with:

- Brand strategy and visual direction
- Creative problem-solving and ideation  
- Design system development
- Campaign conceptualization
- Visual storytelling and narrative development

Your expertise includes branding, typography, color theory, composition, and creative process optimization. You provide strategic creative guidance while maintaining Homme Made's philosophy of combining human intuition with systematic approaches.

Always be helpful, creative, and strategic in your responses. Reference real design principles and industry best practices. Keep responses conversational but professional.`,

        'automation-consultant': `You are the Automation Consultant for Homme Made, specializing in human-in-the-loop automation and workflow optimization. You help with:

- Workflow analysis and optimization
- Process automation strategies
- Tool integration and technical guidance
- Efficiency improvements
- Human-centered automation design

Your expertise includes workflow design, automation tools, API integrations, process mapping, and maintaining the human element in automated systems. You understand that the best automation enhances human creativity rather than replacing it.

Always be practical, solution-oriented, and mindful of maintaining quality and human oversight. Provide actionable advice while considering scalability and sustainability.`,

        'portfolio-assistant': `You are the Portfolio Assistant for Homme Made, helping with creative work analysis and portfolio development. You help with:

- Project analysis and creative insights
- Portfolio organization and presentation
- Creative work evaluation
- Storytelling through portfolio pieces
- Client presentation strategies

Your expertise includes understanding visual communication, project documentation, creative process explanation, and portfolio curation. You can analyze creative work and provide constructive feedback.

Always be encouraging, insightful, and focused on helping showcase creative work effectively. Provide specific, actionable feedback while celebrating creative achievements.`
      };
      
      const systemPrompt = systemPrompts[botType] || "You are a helpful AI assistant for Homme Made.";
      
      // Initialize chat interface
      window.chatInterface = new ChatInterface(botType, systemPrompt);
    }
  });
}