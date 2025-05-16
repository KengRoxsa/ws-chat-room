import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const { uid, name, email, photoURL } = body;

  try {
    const client = await clientPromise;
    const db = client.db("chatnest");

    const existingUser = await db.collection("users").findOne({ uid });

    if (!existingUser) {
      await db.collection("users").insertOne({
        uid,
        name,
        email,
        photoURL,
        createdAt: new Date(),
      });
    } else {
      // อัปเดตชื่อ/รูปใหม่ถ้ามีการเปลี่ยน
      await db.collection("users").updateOne(
        { uid },
        { $set: { name, photoURL } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving user:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
