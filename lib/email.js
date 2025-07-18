/**
 * Email Notification System
 * 
 * Follows mind-bank principles:
 * - "Free to Run & Operate" - Multiple email provider options
 * - "Secure & Private" - No unnecessary data collection
 * - "Functional Over Flash" - Clear, readable email templates
 */

import { getEmailConfig } from './config.js';

/**
 * Send email notification about new form submission
 */
export async function sendNotification(formData, leadId) {
  const emailConfig = getEmailConfig();
  
  if (!emailConfig.enabled) {
    console.log('📧 Email notifications disabled');
    return;
  }
  
  const emailContent = buildEmailContent(formData, leadId);
  
  // Try Resend first (simpler API), then fallback to SMTP
  if (emailConfig.resend.apiKey) {
    return await sendWithResend(emailConfig, emailContent);
  } else if (emailConfig.smtp.host) {
    return await sendWithSMTP(emailConfig, emailContent);
  } else {
    throw new Error('No email configuration available');
  }
}

/**
 * Send email using Resend API
 */
async function sendWithResend(emailConfig, emailContent) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailConfig.resend.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailConfig.from,
        to: emailConfig.to,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('📧 Email sent via Resend:', result.id);
    return result;
    
  } catch (error) {
    console.error('❌ Resend email error:', error);
    throw error;
  }
}

/**
 * Send email using SMTP (nodemailer)
 */
async function sendWithSMTP(emailConfig, emailContent) {
  try {
    // Dynamic import to avoid issues if nodemailer isn't installed
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.createTransporter(emailConfig.smtp);
    
    const result = await transporter.sendMail({
      from: emailConfig.from,
      to: emailConfig.to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
    
    console.log('📧 Email sent via SMTP:', result.messageId);
    return result;
    
  } catch (error) {
    console.error('❌ SMTP email error:', error);
    throw error;
  }
}

/**
 * Build email content from form data
 */
function buildEmailContent(formData, leadId) {
  const subject = `New Onboarding Form Submission - ${formData.name}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Onboarding Form Submission</title>
      <style>
        body { font-family: 'Space Mono', monospace; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0a0a0a; color: #d3ff00; padding: 20px; border-radius: 8px; text-align: center; }
        .section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; }
        .section h3 { color: #0a0a0a; margin-top: 0; }
        .field { margin: 10px 0; }
        .field strong { color: #E2725B; }
        .files { background: #fff; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 New Onboarding Form Submission</h1>
          <p>Lead ID: ${leadId}</p>
        </div>
        
        <div class="section">
          <h3>📋 Contact Information</h3>
          <div class="field"><strong>Name:</strong> ${formData.name}</div>
          <div class="field"><strong>Email:</strong> ${formData.email}</div>
          ${formData.phone ? `<div class="field"><strong>Phone:</strong> ${formData.phone}</div>` : ''}
          <div class="field"><strong>Brand/Business:</strong> ${formData.brandName}</div>
          ${formData.industry ? `<div class="field"><strong>Industry:</strong> ${formData.industry}</div>` : ''}
        </div>
        
        ${formData.onlinePresence ? `
        <div class="section">
          <h3>🌐 Online Presence</h3>
          <div class="field">${formData.onlinePresence}</div>
        </div>
        ` : ''}
        
        <div class="section">
          <h3>🎯 Project Goals</h3>
          <div class="field"><strong>Why Now:</strong> ${formData.whyNow}</div>
          <div class="field"><strong>Success Metrics:</strong> ${formData.successMetrics}</div>
          <div class="field"><strong>Main Struggles:</strong> ${formData.struggles?.join(', ')}</div>
          ${formData.otherStruggle ? `<div class="field"><strong>Other Struggle:</strong> ${formData.otherStruggle}</div>` : ''}
        </div>
        
        ${(formData.brandVoice || formData.brandTone || formData.avoidances || formData.aestheticReferences) ? `
        <div class="section">
          <h3>🎨 Brand Vibe</h3>
          ${formData.brandVoice ? `<div class="field"><strong>Brand Voice:</strong> ${formData.brandVoice}</div>` : ''}
          ${formData.brandTone ? `<div class="field"><strong>Brand Tone:</strong> ${formData.brandTone}</div>` : ''}
          ${formData.avoidances ? `<div class="field"><strong>Avoidances:</strong> ${formData.avoidances}</div>` : ''}
          ${formData.aestheticReferences ? `<div class="field"><strong>Aesthetic References:</strong> ${formData.aestheticReferences}</div>` : ''}
        </div>
        ` : ''}
        
        ${(formData.offering || formData.valueProvision || formData.dreamAudience || formData.feedback) ? `
        <div class="section">
          <h3>👥 Business Details</h3>
          ${formData.offering ? `<div class="field"><strong>Offering:</strong> ${formData.offering}</div>` : ''}
          ${formData.valueProvision ? `<div class="field"><strong>Value Provision:</strong> ${formData.valueProvision}</div>` : ''}
          ${formData.dreamAudience ? `<div class="field"><strong>Dream Audience:</strong> ${formData.dreamAudience}</div>` : ''}
          ${formData.feedback ? `<div class="field"><strong>Feedback:</strong> ${formData.feedback}</div>` : ''}
        </div>
        ` : ''}
        
        <div class="section">
          <h3>📞 Communication</h3>
          <div class="field"><strong>Preferred Method:</strong> ${formData.communication}</div>
          ${formData.additionalInfo ? `<div class="field"><strong>Additional Info:</strong> ${formData.additionalInfo}</div>` : ''}
        </div>
        
        ${formData.files && formData.files.length > 0 ? `
        <div class="section">
          <h3>📎 Uploaded Files</h3>
          <div class="files">
            ${formData.files.map(file => `
              <div class="field">
                <strong>${file.fileName}</strong><br>
                <a href="${file.url}" target="_blank">View File</a> 
                (${file.size ? Math.round(file.size / 1024) + 'KB' : 'Unknown size'})
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <div class="footer">
          <p>Submitted on ${new Date().toLocaleString()}</p>
          <p>🚀 Homme Made - Human in the Loop Creative Systems</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
New Onboarding Form Submission - ${formData.name}
Lead ID: ${leadId}

CONTACT INFORMATION
Name: ${formData.name}
Email: ${formData.email}
${formData.phone ? `Phone: ${formData.phone}` : ''}
Brand/Business: ${formData.brandName}
${formData.industry ? `Industry: ${formData.industry}` : ''}

${formData.onlinePresence ? `ONLINE PRESENCE\n${formData.onlinePresence}\n` : ''}

PROJECT GOALS
Why Now: ${formData.whyNow}
Success Metrics: ${formData.successMetrics}
Main Struggles: ${formData.struggles?.join(', ')}
${formData.otherStruggle ? `Other Struggle: ${formData.otherStruggle}` : ''}

${formData.brandVoice || formData.brandTone || formData.avoidances || formData.aestheticReferences ? `
BRAND VIBE
${formData.brandVoice ? `Brand Voice: ${formData.brandVoice}` : ''}
${formData.brandTone ? `Brand Tone: ${formData.brandTone}` : ''}
${formData.avoidances ? `Avoidances: ${formData.avoidances}` : ''}
${formData.aestheticReferences ? `Aesthetic References: ${formData.aestheticReferences}` : ''}
` : ''}

${formData.offering || formData.valueProvision || formData.dreamAudience || formData.feedback ? `
BUSINESS DETAILS
${formData.offering ? `Offering: ${formData.offering}` : ''}
${formData.valueProvision ? `Value Provision: ${formData.valueProvision}` : ''}
${formData.dreamAudience ? `Dream Audience: ${formData.dreamAudience}` : ''}
${formData.feedback ? `Feedback: ${formData.feedback}` : ''}
` : ''}

COMMUNICATION
Preferred Method: ${formData.communication}
${formData.additionalInfo ? `Additional Info: ${formData.additionalInfo}` : ''}

${formData.files && formData.files.length > 0 ? `
UPLOADED FILES
${formData.files.map(file => `${file.fileName}: ${file.url}`).join('\n')}
` : ''}

Submitted on ${new Date().toLocaleString()}
🚀 Homme Made - Human in the Loop Creative Systems
  `.trim();
  
  return { subject, html, text };
}