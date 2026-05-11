// Email Notification Service — stub for frontend-side email triggers.
// All real sending is handled by the Spring Boot backend (Spring Mail + Gmail SMTP).

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

export async function sendEmail(_params: EmailParams): Promise<{
  success: boolean;
  error?: string;
}> {
  // Email sending is handled server-side; this stub exists for type compatibility.
  return { success: true };
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
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>New Load Booking Request</h1></div>
        <div class="content">
          <p>You have received a new booking request for your load:</p>
          <div class="detail-row"><span class="label">Load ID:</span> ${data.loadId}</div>
          <div class="detail-row"><span class="label">Vehicle:</span> ${data.vehicleInfo}</div>
          <div class="detail-row"><span class="label">Pickup:</span> ${data.pickupLocation}</div>
          <div class="detail-row"><span class="label">Delivery:</span> ${data.deliveryLocation}</div>
          <div class="detail-row"><span class="label">Pickup Date:</span> ${data.pickupDate}</div>
          <div class="detail-row"><span class="label">Price:</span> $${data.price.toLocaleString()}</div>
          <hr style="margin: 20px 0;" />
          <h3>Carrier Information:</h3>
          <div class="detail-row"><span class="label">Company:</span> ${data.carrierName}</div>
          <div class="detail-row"><span class="label">Email:</span> ${data.carrierEmail}</div>
          <div class="detail-row"><span class="label">Phone:</span> ${data.carrierPhone}</div>
        </div>
        <div class="footer"><p>Automated notification from LoadBoard</p></div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: brokerEmail, subject: `New Booking Request for Load #${data.loadId}`, html });
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
        <div class="header"><h1>${isApproved ? 'Booking Approved!' : 'Booking Declined'}</h1></div>
        <div class="content">
          <p>${isApproved ? 'Your booking request has been approved.' : 'Your booking request has been declined by the broker.'}</p>
          <div class="detail-row"><span class="label">Load ID:</span> ${data.loadId}</div>
          <div class="detail-row"><span class="label">Vehicle:</span> ${data.vehicleInfo}</div>
          <div class="detail-row"><span class="label">Pickup:</span> ${data.pickupLocation}</div>
          <div class="detail-row"><span class="label">Delivery:</span> ${data.deliveryLocation}</div>
          <div class="detail-row"><span class="label">Price:</span> $${data.price.toLocaleString()}</div>
        </div>
        <div class="footer"><p>Automated notification from LoadBoard</p></div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({
    to: carrierEmail,
    subject: isApproved ? `Booking Approved - Load #${data.loadId}` : `Booking Declined - Load #${data.loadId}`,
    html,
  });
}

export async function sendStatusUpdateEmail(
  email: string,
  data: { loadId: string; vehicleInfo: string; newStatus: string; recipientType: 'broker' | 'carrier' }
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
        .status { background-color: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 10px; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>Load Status Update</h1></div>
        <div class="content">
          <div class="detail-row"><span class="label">Load ID:</span> ${data.loadId}</div>
          <div class="detail-row"><span class="label">Vehicle:</span> ${data.vehicleInfo}</div>
          <div class="detail-row"><span class="label">New Status:</span><span class="status">${data.newStatus.toUpperCase()}</span></div>
        </div>
        <div class="footer"><p>Automated notification from LoadBoard</p></div>
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
