import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product: {
    name: string;
    price: number;
    sku: string;
  };
  quantity: number;
}

interface OrderConfirmationRequest {
  orderId: string;
  email: string;
  name: string;
  items: OrderItem[];
  total: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, email, name, items, total }: OrderConfirmationRequest = await req.json();

    console.log("Processing order confirmation for:", { orderId, email, name });

    // Generate order items HTML
    const itemsHtml = items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 0;">${item.product.name}</td>
        <td style="padding: 12px 0; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 0; text-align: right;">₱${item.product.price.toFixed(2)}</td>
        <td style="padding: 12px 0; text-align: right; font-weight: bold;">₱${(item.product.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmation</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Dear ${name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">Thank you for your order! We're pleased to confirm that we've received your order and it's being processed.</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 25px 0;">
              <h2 style="margin: 0 0 10px 0; font-size: 16px; color: #666;">Order ID</h2>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #667eea;">${orderId}</p>
            </div>

            <h2 style="font-size: 20px; margin: 30px 0 15px 0; color: #333;">Order Details</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                  <th style="padding: 12px 0; text-align: left;">Item</th>
                  <th style="padding: 12px 0; text-align: center;">Qty</th>
                  <th style="padding: 12px 0; text-align: right;">Price</th>
                  <th style="padding: 12px 0; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="border-top: 2px solid #dee2e6;">
                  <td colspan="3" style="padding: 15px 0; text-align: right; font-size: 18px; font-weight: bold;">Total:</td>
                  <td style="padding: 15px 0; text-align: right; font-size: 18px; font-weight: bold; color: #667eea;">₱${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div style="background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #1565C0;"><strong>📦 What's Next?</strong></p>
              <p style="margin: 10px 0 0 0; color: #1565C0;">Your order is being processed and will be prepared for delivery. You will receive another email once your order has been shipped.</p>
            </div>

            <p style="font-size: 14px; color: #666; margin-top: 30px;">If you have any questions about your order, please don't hesitate to contact our support team.</p>
            
            <p style="font-size: 16px; margin-top: 30px;">Best regards,<br><strong>Procurement Store Team</strong></p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 5px 0;">This is an automated email. Please do not reply to this message.</p>
            <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Procurement Store. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Procurement Store <onboarding@resend.dev>",
      to: [email],
      subject: `Order Confirmation - #${orderId.slice(0, 8)}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-order-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
