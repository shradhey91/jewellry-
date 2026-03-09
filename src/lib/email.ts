

"use server";

import nodemailer from 'nodemailer';
import type { Order } from './types';
import { formatCurrency } from './utils';
import { getSettings } from './server/api';

async function getTransporter() {
    const settings = await getSettings();
    if (settings.smtp_host && settings.smtp_port && settings.smtp_user && settings.smtp_pass) {
        return nodemailer.createTransport({
            host: settings.smtp_host,
            port: settings.smtp_port,
            secure: settings.smtp_port === 465, // true for 465, false for other ports
            auth: {
                user: settings.smtp_user,
                pass: settings.smtp_pass,
            },
        });
    }
    return null;
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
    const transporter = await getTransporter();
    const settings = await getSettings();
    const fromAddress = settings.smtp_from || 'noreply@aparra.com';
    const subject = 'Reset Your Aparra Admin Password';
    const textBody = `
Hello,

You requested a password reset for your Aparra admin account.

Please click the link below to set a new password:
${resetLink}

If you did not request this, you can safely ignore this email.

Thanks,
The Aparra Team
  `;
    if (!transporter) {
      console.log(`\n==== MOCK PASSWORD RESET EMAIL (NO SMTP) ====`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:${textBody}`);
      console.log(`========================\n`);
      return;
    }
    try {
        await transporter.sendMail({
            from: `"Aparra" <${fromAddress}>`,
            to: to,
            subject: subject,
            text: textBody,
        });
        console.log(`Password reset email sent to ${to}`);
    } catch (error) {
        console.error(`Failed to send password reset email to ${to}:`, error);
    }
}


export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationLink: string
) {
  const transporter = await getTransporter();
  if (!transporter) {
      console.log(`[Email Mock - No SMTP Config] Verification email to ${to}. Link: ${verificationLink}`);
      return;
  }
  // In a real app, you would add the mail sending logic here.
}

export async function sendOrderConfirmationEmail(to: string, order: Order) {
  const transporter = await getTransporter();
  const settings = await getSettings();
  const fromAddress = settings.smtp_from || 'noreply@aparra.com';

  const subject = `Your Aparra Order #${order.id.split('-')[1]} is confirmed!`;
  const orderTotal = order.items.reduce((acc, item) => acc + item.price_snapshot.total * item.quantity, 0);

  const textBody = `
Dear ${order.shippingAddress.name},

Thank you for your order! We've received it and are getting it ready for shipment.

Order ID: #${order.id.split('-')[1]}
Date: ${new Date(order.created_at).toLocaleDateString("en-GB")}

Items:
${order.items.map(item => `- ${item.quantity} x ${item.product_name} (${item.variant_label})`).join('\n')}

Total: ${formatCurrency(orderTotal)}

Shipping to:
${order.shippingAddress.name}
${order.shippingAddress.address}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}

We'll notify you again once your order has shipped.

Thanks,
The Aparra Team
  `;
  
  if (!transporter) {
      console.log(`\n==== MOCK EMAIL SENT (NO SMTP CONFIG) ====`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:${textBody}`);
      console.log(`========================\n`);
      return;
  }
  
  try {
      await transporter.sendMail({
          from: `"Aparra" <${fromAddress}>`,
          to: to,
          subject: subject,
          text: textBody,
          // html: "..." // You can add an HTML version here later
      });
      console.log(`Order confirmation email sent to ${to}`);
  } catch (error) {
      console.error(`Failed to send order confirmation email to ${to}:`, error);
  }
}
