import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Category } from "@/models/Category";
import { requireAdmin } from "@/lib/auth/require-admin";
import { CategorySchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all");

    await connectToDatabase();
    const query = all ? {} : { isActive: true };
    const categories = await Category.find(query).sort({ displayOrder: 1 }).lean();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const parsed = CategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const existing = await Category.findOne({ slug: parsed.data.slug });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category with this slug already exists" },
        { status: 409 }
      );
    }

    const newCategory = await Category.create(parsed.data);

    await logAudit({
      user: auth.user!.userId,
      userName: auth.user!.name,
      userRole: auth.user!.role,
      action: "CREATE_CATEGORY",
      entity: "Category",
      entityId: newCategory._id.toString(),
      metadata: { name: newCategory.name },
    });

    return NextResponse.json({
      success: true,
      message: "Category created successfully!",
      category: newCategory,
    });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create category" },
      { status: 500 }
    );
  }
}
