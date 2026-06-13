import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, requireSuperAdmin, safeErrorResponse } from "@/lib/auth-guard";
import { adminUpdateProjectSchema, adminDeleteSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

// GET all projects (admin)
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Rate limiting
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`admin-projects:${ip}`, RATE_LIMITS.admin);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Terlalu banyak request" }, { status: 429 });
    }

    const projects = await db.project.findMany({
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
        order: {
          select: {
            orderId: true,
            packageName: true,
            packagePrice: true,
            status: true,
          },
        },
        milestones: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}

// PATCH update project or add milestone
export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const rawBody = await req.json();

    // Validate with Zod — prevents mass assignment
    const parseResult = adminUpdateProjectSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parseResult.error.errors.map((e) => e.message) },
        { status: 400 }
      );
    }

    const { id, addMilestone, milestoneTitle, ...updateFields } = parseResult.data;

    const existingProject = await db.project.findUnique({ where: { id } });
    if (!existingProject) {
      return NextResponse.json(
        { error: "Project tidak ditemukan" },
        { status: 404 }
      );
    }

    // Add milestone mode
    if (addMilestone && milestoneTitle) {
      const milestone = await db.milestone.create({
        data: {
          projectId: id,
          title: milestoneTitle,
          status: "pending",
        },
      });

      return NextResponse.json({ project: existingProject, milestone });
    }

    // Update project — only allow whitelisted fields
    const data: Record<string, unknown> = {};

    if (updateFields.projectName !== undefined) data.projectName = updateFields.projectName;
    if (updateFields.status !== undefined) {
      data.status = updateFields.status;
      if (updateFields.status === "online") {
        data.completedAt = new Date();
        data.progress = 100;
      }
    }
    if (updateFields.progress !== undefined) data.progress = updateFields.progress;
    if (updateFields.notes !== undefined) data.notes = updateFields.notes || null;
    if (updateFields.liveUrl !== undefined) data.liveUrl = updateFields.liveUrl || null;
    if (updateFields.estimatedDone !== undefined) {
      data.estimatedDone = updateFields.estimatedDone ? new Date(updateFields.estimatedDone) : null;
    }

    const project = await db.project.update({
      where: { id },
      data,
      include: {
        milestones: { orderBy: { createdAt: "asc" } },
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}

// DELETE project (super-admin only)
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireSuperAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const parseResult = adminDeleteSchema.safeParse({ id });
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "ID tidak valid" },
        { status: 400 }
      );
    }

    const project = await db.project.findUnique({ where: { id: parseResult.data.id } });
    if (!project) {
      return NextResponse.json(
        { error: "Project tidak ditemukan" },
        { status: 404 }
      );
    }

    await db.milestone.deleteMany({ where: { projectId: parseResult.data.id } });
    await db.project.delete({ where: { id: parseResult.data.id } });

    return NextResponse.json({ message: "Project berhasil dihapus" });
  } catch (error) {
    const err = safeErrorResponse(error);
    return NextResponse.json(err, { status: 500 });
  }
}
