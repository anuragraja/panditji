import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { User } from "@/models/User";
import { RegisterSchema } from "@/lib/validation";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth/jwt";
import { sanitizeIndianPhone } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, phone, email, password } = parsed.data;
    const sanitizedPhone = sanitizeIndianPhone(phone);

    await connectToDatabase();

    // Check if phone or email is already registered
    const existing = await User.findOne({
      $or: [
        { phone: sanitizedPhone },
        ...(email ? [{ email: email.toLowerCase() }] : []),
      ],
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this phone number or email already exists.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      phone: sanitizedPhone,
      email: email ? email.toLowerCase() : undefined,
      passwordHash,
      role: "CUSTOMER",
      addresses: [],
    });

    const token = signToken({
      userId: user._id.toString(),
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Registration successful!",
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
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
