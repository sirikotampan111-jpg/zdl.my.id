import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { safeParseJson, auditLog } from "@/lib/rate-limit";

// Helper to check admin access
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const role = (session.user as { role?: string })?.role;
  if (role !== "admin" && role !== "super-admin") return null;
  return session;
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const updateProjectSchema = z.object({
  id: z.string().min(1).max(50),
  addMilestone: z.boolean().optional(),
  milestoneTitle: z.string().min(1).max(200).optional(),
  projectName: z.string().max(200).optional(),
  status: z.enum(["planning", "design", "development", "testing", "online"]).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  notes: z.string().max(2000).optional(),
  liveUrl: z.string().max(500).optional(),
  estimatedDone: z.string().max(50).optional(),
});

// GET all projects (admin)
export async function GET() {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    console.error("Admin get projects error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// PATCH update project or add milestone
export async function PATCH(req: NextRequest) {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Safe JSON parse
    const { data: body, error: parseError } = await safeParseJson(req);
    if (parseError) return parseError;

    // Zod validation
    const parseResult = updateProjectSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parseResult.error.issues },
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

    // Update project mode
    const data: Record<string, unknown> = {};

    if (updateFields.projectName !== undefined) data.projectName = updateFields.projectName;
    if (updateFields.status !== undefined) {
      data.status = updateFields.status;
      // If status is online, set completedAt and progress to 100
      if (updateFields.status === "online") {
        data.completedAt = new Date();
        data.progress = 100;
      }
    }
    if (updateFields.progress !== undefined) data.progress = Number(updateFields.progress);
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

    auditLog("ADMIN_PROJECT_UPDATE", { projectId: id, updatedFields: Object.keys(data), adminEmail: session.user?.email });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Admin update project error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE project (super-admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role?: string })?.role;
    if (role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID harus diisi" },
        { status: 400 }
      );
    }

    const project = await db.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json(
        { error: "Project tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete milestones first
    await db.milestone.deleteMany({ where: { projectId: id } });
    // Delete project
    await db.project.delete({ where: { id } });

    auditLog("ADMIN_PROJECT_UPDATE", { action: "delete", projectId: id, adminEmail: session.user?.email });

    return NextResponse.json({ message: "Project berhasil dihapus" });
  } catch (error) {
    console.error("Admin delete project error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
