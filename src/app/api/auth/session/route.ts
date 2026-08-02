import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ loggedIn: false });
  }

  return NextResponse.json({
    loggedIn: true,
    user: {
      id: (session.user as any).id,
      name: session.user.name,
      phone: (session.user as any).phone,
      memberLevel: (session.user as any).memberLevel,
    },
  });
}
