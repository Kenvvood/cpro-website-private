import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const module = await prisma.module.findUnique({
      where: { id },
    });

    if (!module) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: module,
    });
  } catch (error) {
    console.error("Failed to fetch module:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch module" },
      { status: 500 }
    );
  }
}
