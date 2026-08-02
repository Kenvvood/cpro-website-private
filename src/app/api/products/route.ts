import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products - 获取所有产品
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { downloadCount: "desc" },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("获取产品列表错误:", error);
    return NextResponse.json(
      { error: "获取产品列表失败" },
      { status: 500 }
    );
  }
}
