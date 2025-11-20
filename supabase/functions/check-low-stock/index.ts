import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Checking for low stock products...");

    // Get low stock products
    const { data: lowStockProducts, error: productsError } = await supabase
      .rpc("check_low_stock_products");

    if (productsError) {
      console.error("Error fetching low stock products:", productsError);
      throw productsError;
    }

    if (!lowStockProducts || lowStockProducts.length === 0) {
      console.log("No low stock products found");
      return new Response(
        JSON.stringify({ message: "No low stock alerts needed" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${lowStockProducts.length} low stock products`);

    // Get admin emails
    const { data: adminEmails, error: adminsError } = await supabase
      .rpc("get_admin_emails");

    if (adminsError) {
      console.error("Error fetching admin emails:", adminsError);
      throw adminsError;
    }

    if (!adminEmails || adminEmails.length === 0) {
      console.log("No admin emails found");
      return new Response(
        JSON.stringify({ 
          message: "Low stock products found but no admins to notify",
          products: lowStockProducts 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email alerts to admins
    const emailPromises = adminEmails.map((admin: { email: string }) => {
      return supabase.functions.invoke("send-low-stock-alert", {
        body: {
          email: admin.email,
          products: lowStockProducts,
        },
      });
    });

    await Promise.all(emailPromises);

    console.log(`Sent low stock alerts to ${adminEmails.length} admins`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent alerts for ${lowStockProducts.length} products to ${adminEmails.length} admins`,
        products: lowStockProducts,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in check-low-stock function:", error);
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
