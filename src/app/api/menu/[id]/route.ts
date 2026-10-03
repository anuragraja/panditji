import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { MenuItem } from "@/models/MenuItem";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAudit } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    // Find by ID or by slug
    const item = await MenuItem.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { slug: id }],
    }).lean();

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Dish not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Get dish error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch dish" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response!;

  try {
    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();
    const updated = await MenuItem.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Menu item not found" },
        { status: 404 }
      );
    }

    await logAudit({
      user: auth.user!.userId,
      userName: auth.user!.name,
      userRole: auth.user!.role,
      action: "UPDATE_MENU_ITEM",
      entity: "MenuItem",
      entityId: id,
      metadata: { name: updated.name },
    });

    return NextResponse.json({
      success: true,
      message: "Menu item updated successfully!",
      item: updated,
    });
  } catch (error) {
    console.error("Update menu error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response!;

  try {
    const { id } = await params;
    await connectToDatabase();

    const deleted = await MenuItem.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Menu item not found" },
        { status: 404 }
      );
    }

    await logAudit({
      user: auth.user!.userId,
      userName: auth.user!.name,
      userRole: auth.user!.role,
      action: "DELETE_MENU_ITEM",
      entity: "MenuItem",
      entityId: id,
      metadata: { name: deleted.name },
    });

    return NextResponse.json({
      success: true,
      message: "Menu item deleted successfully!",
    });
  } catch (error) {
    console.error("Delete menu error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
