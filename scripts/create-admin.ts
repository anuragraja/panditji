import mongoose from "mongoose";
import readline from "readline";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pandit_ji_ka_dhaba";

function askQuestion(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createAdmin() {
  console.log("\n========================================");
  console.log("  PANDIT JI KA DHABA - ADMIN CREATION  ");
  console.log("========================================\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const envName = process.env.ADMIN_NAME;
    const envPhone = process.env.ADMIN_PHONE;
    const envEmail = process.env.ADMIN_EMAIL;
    const envPassword = process.env.ADMIN_PASSWORD;

    const name = envName || (await askQuestion(rl, "Admin Name (e.g. Pandit Ji Admin): ")) || "Pandit Ji Admin";
    const phone = envPhone || (await askQuestion(rl, "Admin Phone Number (10 digits): ")) || "9876543210";
    const email = envEmail || (await askQuestion(rl, "Admin Email: ")) || "admin@panditjikadhaba.com";
    const password = envPassword || (await askQuestion(rl, "Admin Password (min 6 characters): "));

    if (!password || password.length < 6) {
      console.error("Error: Password must be at least 6 characters.");
      process.exit(1);
    }

    console.log("\nConnecting to database...");
    await mongoose.connect(MONGODB_URI);

    const { User } = await import("../src/models/User");
    const { hashPassword } = await import("../src/lib/auth/jwt");

    const passwordHash = await hashPassword(password);

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      existingUser.role = "ADMIN";
      existingUser.name = name;
      existingUser.email = email;
      existingUser.passwordHash = passwordHash;
      await existingUser.save();
      console.log(`\nExisting user with phone ${phone} upgraded to ADMIN successfully! ✅`);
    } else {
      await User.create({
        name,
        phone,
        email,
        passwordHash,
        role: "ADMIN",
        addresses: [],
      });
      console.log(`\nAdmin account created successfully for ${name} (${phone})! ✅`);
    }

    console.log("You can now login at /admin/login\n");
  } catch (error) {
    console.error("Failed to create admin:", error);
  } finally {
    rl.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
