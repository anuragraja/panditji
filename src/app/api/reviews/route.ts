import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Review } from "@/models/Review";
import { ReviewSchema } from "@/lib/validation";
import { getUserFromRequest } from "@/lib/auth/jwt";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const user = getUserFromRequest(req);
    await connectToDatabase();

    const review = await Review.create({
      ...parsed.data,
      customer: user?.userId,
      approved: false, // Moderated by admin before appearing publicly
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for your review! It will appear once approved.",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit review" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all");

    await connectToDatabase();

    if (all === "true") {
      const auth = requireAdmin(req);
      if (!auth.authorized) return auth.response!;
      const reviews = await Review.find().sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, reviews });
    }

    const reviews = await Review.find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
