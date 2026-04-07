// Email Notification Service
// In production, integrate with SendGrid, AWS SES, or similar service

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

interface LoadBookingEmailData {
  loadId: string;
  carrierName: string;
  carrierEmail: string;
  carrierPhone: string;
  vehicleInfo: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  price: number;
}

export async function sendEmail({ to, subject, html }: EmailParams): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // In production, use a real email service:
    // const response = await fetch('YOUR_EMAIL_API_ENDPOINT', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ to, subject, html })
    // });

    // For demo purposes, log the email
    console.log('📧 EMAIL SENT:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML:', html);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: 'Failed to send email notification',
    };
  }
}

export async function sendLoadBookingRequestEmail(
  brokerEmail: string,
  data: LoadBookingEmailData
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; }
        .button { 
          display: inline-block; 
          background-color: #2563eb; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 6px; 
          margin-top: 20px; 
        }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚚 New Load Booking Request</h1>
        </div>
        <div class="content">
          <p>You have received a new booking request for your load:</p>
          
          <div class="detail-row">
            <span class="label">Load ID:</span> ${data.loadId}
          </div>
          <div class="detail-row">
            <span class="label">Vehicle:</span> ${data.vehicleInfo}
          </div>
          <div class="detail-row">
            <span class="label">Pickup:</span> ${data.pickupLocation}
          </div>
          <div class="detail-row">
            <span class="label">Delivery:</span> ${data.deliveryLocation}
          </div>
          <div class="detail-row">
            <span class="label">Pickup Date:</span> ${data.pickupDate}
          </div>
          <div class="detail-row">
            <span class="label">Price:</span> $${data.price.toLocaleString()}
          </div>
          
          <hr style="margin: 20px 0;" />
          
          <h3>Carrier Information:</h3>
          <div class="detail-row">
            <span class="label">Company:</span> ${data.carrierName}
          </div>
          <div class="detail-row">
            <span class="label">Email:</span> ${data.carrierEmail}
          </div>
          <div class="detail-row">
            <span class="label">Phone:</span> ${data.carrierPhone}
          </div>
          
          <p style="margin-top: 30px;">
            Log in to your dashboard to review and approve this booking request.
          </p>
        </div>
        <div class="footer">
          <p>This is an automated notification from LoadBoard Pro</p>
          <p>© 2026 LoadBoard Pro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: brokerEmail,
    subject: `New Booking Request for Load #${data.loadId}`,
    html,
  });
}

export async function sendBookingConfirmationEmail(
  carrierEmail: string,
  data: LoadBookingEmailData & { status: string }
): Promise<{ success: boolean; error?: string }> {
  const isApproved = data.status === 'booked';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${isApproved ? '#10b981' : '#ef4444'}; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${isApproved ? '✅ Booking Approved!' : '❌ Booking Declined'}</h1>
        </div>
        <div class="content">
          <p>${isApproved 
            ? 'Great news! Your booking request has been approved.' 
            : 'Your booking request has been declined by the broker.'}</p>
          
          <div class="detail-row">
            <span class="label">Load ID:</span> ${data.loadId}
          </div>
          <div class="detail-row">
            <span class="label">Vehicle:</span> ${data.vehicleInfo}
          </div>
          <div class="detail-row">
            <span class="label">Pickup:</span> ${data.pickupLocation}
          </div>
          <div class="detail-row">
            <span class="label">Delivery:</span> ${data.deliveryLocation}
          </div>
          <div class="detail-row">
            <span class="label">Pickup Date:</span> ${data.pickupDate}
          </div>
          <div class="detail-row">
            <span class="label">Price:</span> $${data.price.toLocaleString()}
          </div>
          
          ${isApproved ? `
            <p style="margin-top: 30px;">
              <strong>Next Steps:</strong><br>
              1. Review load details in your dashboard<br>
              2. Confirm pickup arrangements<br>
              3. Update status as you progress
            </p>
          ` : ''}
        </div>
        <div class="footer">
          <p>This is an automated notification from LoadBoard Pro</p>
          <p>© 2026 LoadBoard Pro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: carrierEmail,
    subject: isApproved 
      ? `Booking Approved - Load #${data.loadId}` 
      : `Booking Declined - Load #${data.loadId}`,
    html,
  });
}

export async function sendStatusUpdateEmail(
  email: string,
  data: {
    loadId: string;
    vehicleInfo: string;
    newStatus: string;
    recipientType: 'broker' | 'carrier';
  }
): Promise<{ success: boolean; error?: string }> {
  const statusEmojis: Record<string, string> = {
    'requested': '📋',
    'booked': '✅',
    'picked-up': '🚛',
    'in-transit': '🛣️',
    'delivered': '📦',
    'paid': '💰',
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; }
        .status { 
          background-color: #10b981; 
          color: white; 
          padding: 8px 16px; 
          border-radius: 20px; 
          display: inline-block; 
          margin-top: 10px; 
        }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusEmojis[data.newStatus] || '📬'} Load Status Update</h1>
        </div>
        <div class="content">
          <p>The status of your load has been updated:</p>
          
          <div class="detail-row">
            <span class="label">Load ID:</span> ${data.loadId}
          </div>
          <div class="detail-row">
            <span class="label">Vehicle:</span> ${data.vehicleInfo}
          </div>
          <div class="detail-row">
            <span class="label">New Status:</span>
            <span class="status">${data.newStatus.toUpperCase()}</span>
          </div>
          
          <p style="margin-top: 30px;">
            Check your dashboard for complete details and next actions.
          </p>
        </div>
        <div class="footer">
          <p>This is an automated notification from LoadBoard Pro</p>
          <p>© 2026 LoadBoard Pro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Load Status Update: ${data.newStatus.toUpperCase()} - Load #${data.loadId}`,
    html,
  });
}
