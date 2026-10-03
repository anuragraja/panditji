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
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const urlInput = formData.get("url") as string | null;

    if (urlInput) {
      return NextResponse.json({ success: true, url: urlInput });
    }

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const uploadRes = await cloudinary.uploader.upload(base64Data, {
        folder: "pandit_ji_ka_dhaba",
      });
      return NextResponse.json({ success: true, url: uploadRes.secure_url });
    } else {
      // In local mode without Cloudinary credentials configured yet, return data URI
      return NextResponse.json({
        success: true,
        url: base64Data,
        message: "Uploaded locally (configure Cloudinary in .env for CDN hosting)",
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
