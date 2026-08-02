import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where = category ? { category } : {};

    const modules = await prisma.module.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: modules,
      meta: { total: modules.length },
    });
  } catch (error) {
    console.error("Failed to fetch modules:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch modules" },
      { status: 500 }
    );
  }
}
