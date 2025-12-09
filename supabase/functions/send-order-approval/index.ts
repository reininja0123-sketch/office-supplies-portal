import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ItemApproval {
  order_item_id: string;
  approved_quantity: number;
  product_name: string;
  requested_quantity: number;
  available_stock: number;
}

interface OrderApprovalRequest {
  orderId: string;
  userEmail: string;
  userName: string;
  totalAmount: number;
  status: string;
  itemApprovals?: ItemApproval[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, userEmail, userName, totalAmount, status, itemApprovals }: OrderApprovalRequest = await req.json();

    console.log("Sending order approval email for order:", orderId);

    let statusText = "Processed";
    let statusColor = "#3b82f6";
    let statusMessage = "";

    if (status === "rejected") {
      statusText = "Rejected";
      statusColor = "#dc2626";
      statusMessage = "Unfortunately, your order has been rejected due to stock unavailability.";
    } else if (status === "partial") {
      statusText = "Partially Approved";
      statusColor = "#f59e0b";
      statusMessage = "Some items in your order were reduced or removed due to stock availability. Please see the details below.";
    } else if (status === "processing") {
      statusText = "Approved";
      statusColor = "#16a34a";
      statusMessage = "Your order has been approved and is being processed.";
    }

    // Generate item details HTML if itemApprovals provided
    let itemsHtml = "";
    if (itemApprovals && itemApprovals.length > 0) {
      itemsHtml = `
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 15px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background-color: #f1f5f9;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e2e8f0;">Product</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e2e8f0;">Requested</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e2e8f0;">Approved</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e2e8f0;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${itemApprovals.map(item => {
                let itemStatus = "Approved";
                let itemStatusColor = "#16a34a";
                if (item.approved_quantity === 0) {
                  itemStatus = "Rejected";
                  itemStatusColor = "#dc2626";
                } else if (item.approved_quantity < item.requested_quantity) {
                  itemStatus = "Reduced";
                  itemStatusColor = "#f59e0b";
                }
                return `
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.product_name}</td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e2e8f0;">${item.requested_quantity}</td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${item.approved_quantity}</td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e2e8f0;">
                      <span style="background-color: ${itemStatusColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                        ${itemStatus}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Government Procurement <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Order ${statusText} - Order #${orderId.substring(0, 8)}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
              <h1 style="color: ${statusColor}; margin-bottom: 10px;">Order ${statusText}!</h1>
              <p style="font-size: 16px; margin-bottom: 20px;">Dear ${userName},</p>
              
              ${statusMessage ? `
                <div style="background-color: ${status === 'rejected' ? '#fef2f2' : status === 'partial' ? '#fffbeb' : '#f0fdf4'}; padding: 15px; border-left: 4px solid ${statusColor}; border-radius: 4px; margin-bottom: 20px;">
                  <p style="margin: 0; font-size: 14px;">${statusMessage}</p>
                </div>
              ` : ''}

              <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #1e293b; margin-top: 0;">Order Summary</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;"><strong>Order ID:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">#${orderId.substring(0, 8)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;"><strong>Status:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                      <span style="background-color: ${statusColor}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 14px;">
                        ${statusText}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;"><strong>Approved Total:</strong></td>
                    <td style="padding: 10px 0; text-align: right; font-size: 18px; color: ${statusColor};">
                      <strong>₱${totalAmount.toFixed(2)}</strong>
                    </td>
                  </tr>
                </table>
              </div>

              ${itemsHtml}

              ${status !== 'rejected' ? `
                <div style="background-color: #e0f2fe; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px; margin-bottom: 20px;">
                  <p style="margin: 0; font-size: 14px;">
                    <strong>What's next?</strong><br>
                    Your order is now being processed. You will receive another email once your order has been shipped.
                  </p>
                </div>
              ` : ''}

              <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
                Thank you for using our procurement service.<br>
                <strong>Government Procurement Service</strong>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;">
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-approval function:", error);
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
