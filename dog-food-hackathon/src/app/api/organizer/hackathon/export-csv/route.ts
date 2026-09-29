import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import prismaClient from "@/app/lib/prisma/prismaClient";

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Session missing or expired" } },
        { status: 401 },
      );
    }

    const hackathonId = request.nextUrl.searchParams.get("hackathon_id")?.trim() || null;

    const hackathon = hackathonId
      ? await prismaClient.hackathon.findFirst({
          where: { id: hackathonId, organizer_id: user.id },
          select: { id: true, organizer_id: true },
        })
      : await prismaClient.hackathon.findFirst({
          where: { organizer_id: user.id },
          orderBy: { created_at: "desc" },
          select: { id: true, organizer_id: true },
        });

    // With organizer_id already in the where clause, a null result means
    // "not found or not yours" for both branches - same response either way,
    // so a caller can't tell which case it is.
    if (!hackathon) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "HACKATHON_NOT_FOUND",
            message: "No hackathon found for this organizer",
          },
        },
        { status: 404 },
      );
    }

    const rows = await prismaClient.reviewScore.findMany({
      where: { review: { project: { hackathon_id: hackathon.id } } },
      select: {
        value: true,
        criterion: { select: { name: true, weight: true } },
        review: {
          select: {
            status: true,
            comment: true,
            submitted_at: true,
            judge: { select: { user: { select: { name: true, email: true } } } },
            project: {
              select: {
                title: true,
                team: { select: { name: true } },
                track: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: [
        { review: { project: { title: "asc" } } },
        { criterion: { position: "asc" } },
      ],
    });

    const header = [
      "project_title",
      "team_name",
      "track",
      "judge_name",
      "judge_email",
      "review_status",
      "criterion_name",
      "criterion_weight",
      "score",
      "comment",
      "submitted_at",
    ];

    const lines = [header.join(",")];

    for (const r of rows) {
      lines.push(
        [
          csvEscape(r.review.project.title),
          csvEscape(r.review.project.team.name),
          csvEscape(r.review.project.track?.name ?? ""),
          csvEscape(r.review.judge.user.name),
          csvEscape(r.review.judge.user.email),
          csvEscape(r.review.status),
          csvEscape(r.criterion.name),
          csvEscape(r.criterion.weight),
          csvEscape(r.value),
          csvEscape(r.review.comment ?? ""),
          csvEscape(r.review.submitted_at?.toISOString() ?? ""),
        ].join(","),
      );
    }

    const csv = lines.join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${hackathon.id}-reviews.csv"`,
      },
    });
  } catch (error) {
    console.error("export csv ::: Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to export data" } },
      { status: 500 },
    );
  }
}