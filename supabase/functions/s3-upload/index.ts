import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const generateSignedUrl = async (
  accessKeyId: string,
  secretAccessKey: string,
  bucket: string,
  region: string,
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> => {
  const algorithm = "AWS4-HMAC-SHA256";
  const serviceName = "s3";
  const requestType = "aws4_request";
  const now = new Date();
  const dateStamp = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 8);
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";

  const credentialScope = `${dateStamp}/${region}/${serviceName}/${requestType}`;
  const host = `${bucket}.s3.${region}.amazonaws.com`;

  const queryParams = new URLSearchParams({
    "X-Amz-Algorithm": algorithm,
    "X-Amz-Credential": `${accessKeyId}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": expiresIn.toString(),
    "X-Amz-SignedHeaders": "content-type;host",
  });

  const canonicalRequest = [
    "PUT",
    `/${key}`,
    queryParams.toString(),
    `content-type:${contentType}`,
    `host:${host}`,
    "",
    "content-type;host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const encoder = new TextEncoder();

  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(canonicalRequest));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedCanonicalRequest = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const stringToSign = [algorithm, amzDate, credentialScope, hashedCanonicalRequest].join("\n");

  const getSignatureKey = async (
    key: string,
    dateStamp: string,
    regionName: string,
    serviceName: string
  ) => {
    const kDate = await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey(
        "raw",
        encoder.encode("AWS4" + key),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      ),
      encoder.encode(dateStamp)
    );

    const kRegion = await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey("raw", kDate, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
      encoder.encode(regionName)
    );

    const kService = await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey("raw", kRegion, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
      encoder.encode(serviceName)
    );

    const kSigning = await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey("raw", kService, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
      encoder.encode(requestType)
    );

    return kSigning;
  };

  const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, serviceName);

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey("raw", signingKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
    encoder.encode(stringToSign)
  );

  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  queryParams.append("X-Amz-Signature", signature);

  return `https://${host}/${key}?${queryParams.toString()}`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { fileName, contentType } = await req.json();
    
    if (!fileName || !contentType) {
      return new Response(JSON.stringify({ error: "Missing fileName or contentType" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate file type (only images)
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(contentType)) {
      return new Response(JSON.stringify({ error: "Invalid file type. Only images are allowed." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get AWS credentials
    const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
    const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");
    const bucket = Deno.env.get("AWS_S3_BUCKET");
    const region = Deno.env.get("AWS_REGION");

    if (!accessKeyId || !secretAccessKey || !bucket || !region) {
      console.error("Missing AWS credentials");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate unique key with user folder
    const ext = fileName.split(".").pop() || "jpg";
    const uniqueKey = `profiles/${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    // Generate presigned URL
    const signedUrl = await generateSignedUrl(
      accessKeyId,
      secretAccessKey,
      bucket,
      region,
      uniqueKey,
      contentType,
      3600 // 1 hour expiry
    );

    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${uniqueKey}`;

    console.log(`Generated signed URL for user ${user.id}, key: ${uniqueKey}`);

    return new Response(
      JSON.stringify({
        uploadUrl: signedUrl,
        publicUrl,
        key: uniqueKey,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating signed URL:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
