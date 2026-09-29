// prisma/seed.ts
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import prismaClient from "@/app/lib/prisma/prismaClient";
import { UserRole } from "@/app/generated/prisma/enums";

const scrypt = promisify(crypto.scrypt);

interface Fixture {
  event: { id: string; name: string; submissions_close: string };
  tracks: { id: string; name: string }[];
  judges: { id: string; name: string; email: string; tracks: string[] }[];
  teams: { id: string; name: string; members: string[] }[];
  projects: {
    id: string;
    team: string;
    track: string;
    title: string;
    summary: string;
    repo_url: string;
    submitted_at: string;
  }[];
}

const DEMO_PASSWORD = "demo-password-123";
const DAY = 24 * 60 * 60 * 1000;

// Same format as registerUser: "salt:hexKey"
const hashPassword = async (password: string) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
};

const sha256 = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

// Fixed demo tokens, so .dogfood.toml stays valid across reseeds
const demoToken = (role: string) => sha256(`dogfood-demo:${role}`);

async function main() {
  const file = path.join(process.cwd(), "data", "fixtures.json");
  const fx: Fixture = JSON.parse(fs.readFileSync(file, "utf8"));

  const password_hash = await hashPassword(DEMO_PASSWORD); // one hash, reused for every demo user

  const upsertUser = async (
    email: string,
    name: string,
    role: UserRole = "PARTICIPANT",
    is_organizer = false,
  ) => {
    const user = await prismaClient.user.upsert({
      where: { email },
      create: { email, name, phone: "0000000000", password_hash, is_organizer },
      update: { name, is_organizer },
      select: { id: true },
    });
    return user.id;
  };

  // Re-runnable: drop the previous seeded event (cascades to tracks, teams, projects...)
  await prismaClient.hackathon.deleteMany({ where: { title: fx.event.name } });

  const organizerId = await upsertUser(
    "organizer@example.org",
    "Demo Organizer",
    "PARTICIPANT",
    true,
  );
  const participantId = await upsertUser(
    "participant@example.org",
    "Demo Participant",
    "PARTICIPANT"
  );
  const adminId = await upsertUser("admin@example.org", "Demo Admin", "ADMIN", false);
  // The fixture only gives the close date. Every date is in the past, so the event is
  // already closed and submissions must be refused.
  const close = new Date(fx.event.submissions_close);
  const hackathon = await prismaClient.hackathon.create({
    data: {
      title: fx.event.name,
      description: "Seeded from fixtures.json",
      phase: "COMPLETED",
      organizer_id: organizerId,
      registration_start: new Date(close.getTime() - 30 * DAY),
      registration_end: new Date(close.getTime() - 14 * DAY),
      submission_deadline: close,
      judging_start: new Date(close.getTime() + 1 * DAY),
      judging_end: new Date(close.getTime() + 9 * DAY),
    },
    select: { id: true },
  });

  // Tracks (fixture id -> db id)
  const trackIds = new Map<string, string>();
  for (const t of fx.tracks) {
    const track = await prismaClient.hackathonTrack.create({
      data: { hackathon_id: hackathon.id, name: t.name },
      select: { id: true },
    });
    trackIds.set(t.id, track.id);
  }

  // Judges: accepted, with their tracks
  const judgeUserIds = new Map<string, string>();
  for (const j of fx.judges) {
    const userId = await upsertUser(j.email, j.name);
    judgeUserIds.set(j.id, userId);

    const judge = await prismaClient.hackathonJudge.create({
      data: {
        user_id: userId,
        hackathon_id: hackathon.id,
        status: "ACCEPTED",
        responded_at: new Date(close.getTime() - 20 * DAY),
      },
      select: { id: true },
    });

    await prismaClient.hackathonJudgeTrack.createMany({
      data: j.tracks.map((trackKey) => ({
        judge_id: judge.id,
        track_id: trackIds.get(trackKey)!,
      })),
    });
  }

  // Teams: the fixture reuses names (StillTrail x3, AmberSwitch x2, OpenSignal x2), and
  // Team is unique on (hackathon_id, name), so repeats get a suffix.
  const nameCount = new Map<string, number>();
  const teamIds = new Map<string, string>();

  for (const t of fx.teams) {
    const seen = nameCount.get(t.name) ?? 0;
    nameCount.set(t.name, seen + 1);
    const name = seen === 0 ? t.name : `${t.name} (${seen + 1})`;

    const team = await prismaClient.team.create({
      data: {
        hackathon_id: hackathon.id,
        name,
        invite_token: crypto.randomBytes(32).toString("hex"),
      },
      select: { id: true },
    });
    teamIds.set(t.id, team.id);

    // First member is the leader
    for (let i = 0; i < t.members.length; i++) {
      const email = t.members[i];
      const userId = await upsertUser(email, email.split("@")[0]);
      await prismaClient.hackathonParticipant.create({
        data: {
          user_id: userId,
          hackathon_id: hackathon.id,
          team_id: team.id,
          is_team_leader: i === 0,
        },
      });
    }
  }

  // The demo participant is registered but has no team
  await prismaClient.hackathonParticipant.create({
    data: { user_id: participantId, hackathon_id: hackathon.id },
  });

  // Projects: Project.team_id is unique, and the fixture has a duplicate submission
  // (prj_41 on the same team as prj_07). Keep the latest per team.
  const latestByTeam = new Map<string, Fixture["projects"][number]>();
  for (const p of fx.projects) {
    const current = latestByTeam.get(p.team);
    if (!current || p.submitted_at > current.submitted_at) {
      if (current)
        console.log(`seed: dropping duplicate ${current.id} for ${p.team}`);
      latestByTeam.set(p.team, p);
    } else {
      console.log(`seed: dropping duplicate ${p.id} for ${p.team}`);
    }
  }

  for (const p of latestByTeam.values()) {
    await prismaClient.project.create({
      data: {
        hackathon_id: hackathon.id,
        team_id: teamIds.get(p.team)!,
        track_id: trackIds.get(p.track) ?? null,
        title: p.title,
        description: p.summary,
        repository_url: p.repo_url,
        status: "SUBMITTED",
        submitted_at: new Date(p.submitted_at),
      },
    });
  }

  // Sessions for the checker, which never logs in
  const sessionUsers: Record<string, string> = {
    organizer: organizerId,
    participant: participantId,
    judge_a: judgeUserIds.get("jdg_01")!,
    judge_b: judgeUserIds.get("jdg_02")!,
  };
  const expires = new Date("2099-01-01T00:00:00Z");

  console.log("\nPaste into .dogfood.toml under [auth]:");
  for (const [role, userId] of Object.entries(sessionUsers)) {
    const token = demoToken(role);
    await prismaClient.session.upsert({
      where: { token_hash: sha256(token) },
      create: {
        user_id: userId,
        token_hash: sha256(token),
        expires_at: expires,
      },
      update: { user_id: userId, expires_at: expires },
    });
    console.log(`${role.padEnd(11)} = "Cookie: session_token=${token}"`);
  }

  console.log(
    `\nSeeded ${fx.tracks.length} tracks, ${fx.judges.length} judges, ` +
      `${fx.teams.length} teams, ${latestByTeam.size} projects.`,
  );
  console.log(`Demo users share the password: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prismaClient.$disconnect());
