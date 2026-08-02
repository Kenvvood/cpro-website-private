import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, modules } = body;

    if (!name || !modules || !Array.isArray(modules)) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Create EA Config
    const configJson = JSON.stringify({
      modules: modules.map((m: { moduleId: string; parameters: Record<string, unknown> }) => ({
        moduleId: m.moduleId,
        parameters: m.parameters,
      })),
      version: 1,
    });

    const eaConfig = await prisma.eAConfig.create({
      data: {
        userId: "anonymous", // TODO: Get from auth
        name,
        description: description || "",
        configJson,
        version: 1,
        isPublished: false,
        isTemplate: false,
      },
    });

    // Create module associations
    await prisma.eAConfigModule.createMany({
      data: modules.map((m: { moduleId: string; parameters: Record<string, unknown>; enabled?: boolean }, index: number) => ({
        eaConfigId: eaConfig.id,
        moduleId: m.moduleId,
        parameters: JSON.stringify(m.parameters),
        enabled: m.enabled !== false,
        priority: index,
      })),
    });

    // Update module usage counts
    const moduleIds = modules.map((m: { moduleId: string }) => m.moduleId);
    await prisma.module.updateMany({
      where: { id: { in: moduleIds } },
      data: { usageCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: eaConfig.id,
        name: eaConfig.name,
        moduleCount: modules.length,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to save EA config:", errorMessage);
    return NextResponse.json(
      { success: false, error: `保存失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "anonymous";

    const configs = await prisma.eAConfig.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        modules: {
          include: { module: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: configs,
    });
  } catch (error) {
    console.error("Failed to fetch EA configs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch configurations" },
      { status: 500 }
    );
  }
}
