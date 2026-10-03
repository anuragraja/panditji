import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Review } from "@/models/Review";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAudit } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response!;

  try {
    const { id } = await params;
    const body = await req.json();
    const { approved } = body;

    await connectToDatabase();
    const review = await Review.findByIdAndUpdate(
      id,
      { approved },
      { new: true }
    );

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    await logAudit({
      user: auth.user!.userId,
      userName: auth.user!.name,
      userRole: auth.user!.role,
      action: approved ? "APPROVE_REVIEW" : "REJECT_REVIEW",
      entity: "Review",
      entityId: id,
      metadata: { reviewerName: review.name },
    });

    return NextResponse.json({
      success: true,
      message: `Review ${approved ? "approved" : "rejected"} successfully!`,
      review,
    });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update review" },
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

    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully!",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete review" },
      { status: 500 }
    );
  }
}
