import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { MenuItem } from "@/models/MenuItem";
import { requireAdmin } from "@/lib/auth/require-admin";
import { MenuItemSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const popular = searchParams.get("popular");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const all = searchParams.get("all"); // For admin to view unavailable items as well

    const query: Record<string, unknown> = {};
    if (!all) {
      query.available = true;
    }
    if (category && category !== "All") {
      query.category = category;
    }
    if (popular === "true") {
      query.popular = true;
    }
    if (featured === "true") {
      query.featured = true;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { hindiName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const items = await MenuItem.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Fetch menu error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load menu items" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const parsed = MenuItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check slug collision
    const existing = await MenuItem.findOne({ slug: parsed.data.slug });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A dish with this slug already exists." },
        { status: 409 }
      );
    }

    const newItem = await MenuItem.create(parsed.data);

    await logAudit({
      user: auth.user!.userId,
      userName: auth.user!.name,
      userRole: auth.user!.role,
      action: "CREATE_MENU_ITEM",
      entity: "MenuItem",
      entityId: newItem._id.toString(),
      metadata: { name: newItem.name, price: newItem.basePrice },
    });

    return NextResponse.json({
      success: true,
      message: "Menu item created successfully!",
      item: newItem,
    });
  } catch (error) {
    console.error("Create menu item error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create menu item" },
      { status: 500 }
    );
  }
}
