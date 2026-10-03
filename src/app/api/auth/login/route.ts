import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { User } from "@/models/User";
import { LoginSchema } from "@/lib/validation";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth/jwt";
import { sanitizeIndianPhone } from "@/lib/utils";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { identifier, password } = parsed.data;
    await connectToDatabase();

    const cleanPhone = sanitizeIndianPhone(identifier);
    const cleanEmail = identifier.toLowerCase().trim();

    const user = await User.findOne({
      $or: [{ phone: cleanPhone }, { phone: identifier }, { email: cleanEmail }],
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials. Please check phone/email and password." },
        { status: 401 }
      );
    }

    const passwordMatch = await comparePassword(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials. Please check phone/email and password." },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
    });

    if (user.role === "ADMIN") {
      await logAudit({
        user: user._id.toString(),
        userName: user.name,
        userRole: user.role,
        action: "ADMIN_LOGIN",
        entity: "User",
        entityId: user._id.toString(),
      });
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful!",
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
