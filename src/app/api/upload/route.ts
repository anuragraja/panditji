import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { v2 as cloudinary } from "cloudinary";

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response!;

  try {
    const contentType = req.headers.get("content-type") || "";
    let base64Data: string | null = null;
    let urlInput: string | null = null;

    if (contentType.includes("application/json")) {
      const json = await req.json();
      base64Data = json.imageBase64 || null;
      urlInput = json.url || null;
    } else {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      urlInput = formData.get("url") as string | null;

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        base64Data = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
      }
    }

    if (urlInput) {
      return NextResponse.json({ success: true, url: urlInput });
    }

    if (!base64Data) {
      return NextResponse.json(
        { success: false, message: "No image file or URL received" },
        { status: 400 }
      );
    }

    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        const uploadRes = await cloudinary.uploader.upload(base64Data, {
          folder: "pandit_ji_ka_dhaba",
        });
        return NextResponse.json({ success: true, url: uploadRes.secure_url });
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, falling back to data URI:", cloudErr);
        return NextResponse.json({
          success: true,
          url: base64Data,
          message: "Uploaded locally (Cloudinary unavailable)",
        });
      }
    } else {
      // In local/fallback mode without Cloudinary credentials configured
      return NextResponse.json({
        success: true,
        url: base64Data,
        message: "Uploaded locally",
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload image" },
      { status: 500 }
    );
  }
}
