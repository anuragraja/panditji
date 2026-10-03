import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { RestaurantSettings } from "@/models/RestaurantSettings";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAudit } from "@/lib/audit";
import { fallbackSettings } from "@/services/restaurant";

export async function GET() {
  try {
    await connectToDatabase();
    const existing = await RestaurantSettings.findOne().lean();
    if (existing) {
      return NextResponse.json({ success: true, settings: existing });
    }
    const created = await RestaurantSettings.create(fallbackSettings);
    return NextResponse.json({ success: true, settings: created.toObject() });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ success: true, settings: fallbackSettings });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    await connectToDatabase();

    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create(body);
    } else {
      Object.assign(settings, body);
      await settings.save();
    }

    await logAudit({
      user: auth.user!.userId,
      userName: auth.user!.name,
      userRole: auth.user!.role,
      action: "UPDATE_RESTAURANT_SETTINGS",
      entity: "RestaurantSettings",
      entityId: settings._id.toString(),
      metadata: { whatsappNumber: settings.whatsappNumber },
    });

    return NextResponse.json({
      success: true,
      message: "Restaurant settings updated successfully!",
      settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update settings" },
      { status: 500 }
    );
  }
}
