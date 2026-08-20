import { todayISODate } from "./dates";
import { labelBodyPart, labelCardio } from "./exercises";
import { completedThisPeriod, currentStreak } from "./habits";
import type { Goal, Habit, HabitLog, Workout } from "./types";

export type ExportInput = {
  displayName: string;
  email: string;
  workouts: Workout[];
  goals: Goal[];
  habits: Habit[];
  habitLogs: HabitLog[];
};

type Column = {
  header: string;
  width: number;
  /** Excel number format, e.g. "0.##" or "yyyy-mm-dd". Text columns leave it unset. */
  numFmt?: string;
};

const INK = "FF0B1220";
const ACCENT = "FF22D3EE";
const BAND = "FFF4F8FB";
const RULE = "FFD8E1EA";

/** Volume is the standard tonnage measure: sets x reps x load. */
function volumeKg(sets: number | null, reps: number | null, weightKg: number | null): number | null {
  if (sets == null || reps == null || weightKg == null) return null;
  const v = sets * reps * weightKg;
  return Number.isFinite(v) ? v : null;
}

function sum(values: (number | null | undefined)[]): number {
  return values.reduce<number>((total, v) => total + (typeof v === "number" && Number.isFinite(v) ? v : 0), 0);
}

/** ISO date string -> a real Date so Excel sorts and filters it as a date. */
function toDate(iso: string): Date | string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Builds the workbook and hands it to the browser as a download.
 * exceljs is imported dynamically: it is a large dependency and nothing but
 * this one action needs it, so it must stay out of the initial bundle.
 */
export async function exportToExcel(input: ExportInput): Promise<void> {
  const { default: ExcelJS } = await import("exceljs");

  const wb = new ExcelJS.Workbook();
  wb.creator = "IronLog";
  wb.created = new Date();

  /** Applies the shared look: styled header, frozen pane, filter, widths, banding. */
  function sheet(name: string, columns: Column[], rows: (string | number | Date | null)[][]) {
    const ws = wb.addWorksheet(name, {
      views: [{ state: "frozen", ySplit: 1 }],
      properties: { defaultRowHeight: 18 },
    });

    ws.columns = columns.map((c) => ({ width: c.width }));

    const header = ws.addRow(columns.map((c) => c.header));
    header.height = 24;
    header.eachCell((cell) => {
      cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" }, name: "Calibri" };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: INK } };
      cell.alignment = { vertical: "middle", horizontal: "left" };
      cell.border = { bottom: { style: "thin", color: { argb: ACCENT } } };
    });

    rows.forEach((values, i) => {
      const row = ws.addRow(values);
      row.eachCell({ includeEmpty: true }, (cell, col) => {
        const spec = columns[col - 1];
        if (spec?.numFmt) cell.numFmt = spec.numFmt;
        cell.alignment = { vertical: "middle", wrapText: false };
        cell.border = { bottom: { style: "hair", color: { argb: RULE } } };
        if (i % 2 === 1) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BAND } };
        }
      });
    });

    if (rows.length > 0) {
      ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
    }
    return ws;
  }

  const today = todayISODate();
  const weights = input.workouts.filter((w) => w.kind === "weights");
  const cardio = input.workouts.filter((w) => w.kind === "cardio");
  const items = input.workouts.flatMap((w) => w.items);
  const dates = input.workouts.map((w) => w.performedOn).sort();

  // ── Summary ────────────────────────────────────────────────────────────
  const summary = wb.addWorksheet("Summary", { properties: { defaultRowHeight: 18 } });
  summary.columns = [{ width: 30 }, { width: 30 }];

  const title = summary.addRow(["IronLog export"]);
  title.height = 30;
  title.getCell(1).font = { bold: true, size: 18, color: { argb: INK }, name: "Calibri" };

  summary.addRow([]);
  const meta: [string, string | number | Date][] = [
    ["Athlete", input.displayName],
    ["Account", input.email],
    ["Generated", new Date()],
    ["First session", dates[0] ? toDate(dates[0]) : "—"],
    ["Latest session", dates.at(-1) ? toDate(dates.at(-1)!) : "—"],
  ];
  const totals: [string, string | number][] = [
    ["Sessions logged", input.workouts.length],
    ["Weights sessions", weights.length],
    ["Cardio sessions", cardio.length],
    ["Exercises recorded", items.length],
    ["Total volume (kg)", Math.round(sum(items.map((i) => volumeKg(i.sets, i.reps, i.weightKg))))],
    ["Total distance (km)", Number(sum(items.map((i) => i.distanceKm)).toFixed(2))],
    ["Total time (min)", sum(input.workouts.map((w) => w.durationMinutes))],
    ["Active goals", input.goals.filter((g) => g.status === "active").length],
    ["Habits tracked", input.habits.length],
    ["Habit check-ins", input.habitLogs.length],
  ];

  function block(heading: string, entries: [string, string | number | Date][]) {
    const h = summary.addRow([heading]);
    h.getCell(1).font = { bold: true, size: 11, color: { argb: "FF5A6B7D" }, name: "Calibri" };
    h.getCell(1).border = { bottom: { style: "thin", color: { argb: RULE } } };
    summary.mergeCells(`A${h.number}:B${h.number}`);
    entries.forEach(([label, value]) => {
      const r = summary.addRow([label, value]);
      r.getCell(1).font = { color: { argb: "FF5A6B7D" }, name: "Calibri" };
      r.getCell(2).font = { bold: true, name: "Calibri" };
      if (value instanceof Date) r.getCell(2).numFmt = "yyyy-mm-dd hh:mm";
      else if (typeof value === "number") r.getCell(2).numFmt = "#,##0.##";
    });
    summary.addRow([]);
  }
  block("Details", meta);
  block("Totals", totals);

  // ── Workouts ───────────────────────────────────────────────────────────
  sheet(
    "Workouts",
    [
      { header: "Date", width: 12, numFmt: "yyyy-mm-dd" },
      { header: "Type", width: 10 },
      { header: "Session", width: 26 },
      { header: "Focus", width: 16 },
      { header: "Exercises", width: 11, numFmt: "0" },
      { header: "Duration (min)", width: 15, numFmt: "0" },
      { header: "Volume (kg)", width: 13, numFmt: "#,##0.##" },
      { header: "Distance (km)", width: 14, numFmt: "0.##" },
      { header: "Notes", width: 46 },
    ],
    input.workouts.map((w) => {
      const first = w.items[0];
      return [
        toDate(w.performedOn),
        w.kind === "weights" ? "Weights" : "Cardio",
        w.title,
        first?.bodyPart ? labelBodyPart(first.bodyPart) : first?.cardioType ? labelCardio(first.cardioType) : "—",
        w.items.length,
        w.durationMinutes,
        Math.round(sum(w.items.map((i) => volumeKg(i.sets, i.reps, i.weightKg)))) || null,
        Number(sum(w.items.map((i) => i.distanceKm)).toFixed(2)) || null,
        w.notes || "",
      ];
    }),
  );

  // ── Exercises: one row per set-group, the sheet you pivot on ───────────
  sheet(
    "Exercises",
    [
      { header: "Date", width: 12, numFmt: "yyyy-mm-dd" },
      { header: "Session", width: 24 },
      { header: "Exercise", width: 28 },
      { header: "Body part", width: 14 },
      { header: "Cardio type", width: 14 },
      { header: "Sets", width: 8, numFmt: "0" },
      { header: "Reps", width: 8, numFmt: "0" },
      { header: "Weight (kg)", width: 12, numFmt: "0.##" },
      { header: "Volume (kg)", width: 13, numFmt: "#,##0.##" },
      { header: "Distance (km)", width: 14, numFmt: "0.##" },
      { header: "Minutes", width: 10, numFmt: "0" },
      { header: "Calories", width: 10, numFmt: "0" },
      { header: "Intensity", width: 12 },
      { header: "Video", width: 42 },
    ],
    input.workouts.flatMap((w) =>
      w.items.map((i) => [
        toDate(w.performedOn),
        w.title,
        i.exerciseName,
        i.bodyPart ? labelBodyPart(i.bodyPart) : "—",
        i.cardioType ? labelCardio(i.cardioType) : "—",
        i.sets,
        i.reps,
        i.weightKg,
        volumeKg(i.sets, i.reps, i.weightKg),
        i.distanceKm,
        i.durationMinutes,
        i.calories,
        i.intensity ?? "—",
        i.youtubeUrl || "",
      ]),
    ),
  );

  // ── Goals ──────────────────────────────────────────────────────────────
  sheet(
    "Goals",
    [
      { header: "Goal", width: 30 },
      { header: "Category", width: 12 },
      { header: "Current", width: 11, numFmt: "0.##" },
      { header: "Target", width: 11, numFmt: "0.##" },
      { header: "Unit", width: 10 },
      { header: "Progress", width: 11, numFmt: "0%" },
      { header: "Status", width: 12 },
      { header: "Deadline", width: 12, numFmt: "yyyy-mm-dd" },
      { header: "Created", width: 12, numFmt: "yyyy-mm-dd" },
    ],
    input.goals.map((g) => [
      g.title,
      g.category,
      g.currentValue,
      g.targetValue,
      g.unit,
      // A real fraction, so Excel's percent format and charts both work.
      g.targetValue > 0 ? Math.min(1, g.currentValue / g.targetValue) : 0,
      g.status,
      g.deadline ? toDate(g.deadline) : "—",
      toDate(g.createdAt.slice(0, 10)),
    ]),
  );

  // ── Habits ─────────────────────────────────────────────────────────────
  sheet(
    "Habits",
    [
      { header: "Habit", width: 28 },
      { header: "Cadence", width: 11 },
      { header: "Target / period", width: 15, numFmt: "0" },
      { header: "This period", width: 13, numFmt: "0" },
      { header: "Streak", width: 10, numFmt: "0" },
      { header: "Total check-ins", width: 16, numFmt: "0" },
      { header: "Created", width: 12, numFmt: "yyyy-mm-dd" },
    ],
    input.habits.map((h) => [
      h.name,
      h.cadence,
      h.targetPerPeriod,
      completedThisPeriod(input.habitLogs, h, today),
      currentStreak(input.habitLogs, h, today),
      input.habitLogs.filter((l) => l.habitId === h.id).length,
      toDate(h.createdAt.slice(0, 10)),
    ]),
  );

  // ── Habit log ──────────────────────────────────────────────────────────
  const habitName = new Map(input.habits.map((h) => [h.id, h.name]));
  sheet(
    "Habit log",
    [
      { header: "Date", width: 12, numFmt: "yyyy-mm-dd" },
      { header: "Habit", width: 28 },
    ],
    [...input.habitLogs]
      .sort((a, b) => b.loggedOn.localeCompare(a.loggedOn))
      .map((l) => [toDate(l.loggedOn), habitName.get(l.habitId) ?? "(archived habit)"]),
  );

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ironlog-${today}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
