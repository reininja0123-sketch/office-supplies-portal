import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderApprovalRequest {
  orderId: string;
  userEmail: string;
  userName: string;
  totalAmount: number;
  status: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, userEmail, userName, totalAmount, status }: OrderApprovalRequest = await req.json();

    console.log("Sending order approval email for order:", orderId);

    const statusText = status === "approved" ? "Approved" : "Processed";
    const statusColor = status === "approved" ? "#16a34a" : "#3b82f6";

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
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #1e293b; margin-top: 0;">Order Details</h2>
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
                    <td style="padding: 10px 0;"><strong>Total Amount:</strong></td>
                    <td style="padding: 10px 0; text-align: right; font-size: 18px; color: ${statusColor};">
                      <strong>₱${totalAmount.toFixed(2)}</strong>
                    </td>
                  </tr>
                </table>
              </div>

              <div style="background-color: #e0f2fe; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px;">
                  <strong>What's next?</strong><br>
                  Your order has been ${status === "approved" ? "approved and is being processed" : "processed"}. 
                  You will receive another email once your order has been shipped.
                </p>
              </div>

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
