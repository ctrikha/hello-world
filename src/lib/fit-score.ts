import { STATE_TO_REGION } from "@/lib/constants";
import type { CollegeSize, CampusSetting } from "@prisma/client";

export interface StudentSnapshot {
  satScore?: number | null;
  actScore?: number | null;
  gpa?: number | null;
  intendedMajors: string[];
  preferredSize?: CollegeSize | null;
  preferredRegion: string[];
  maxTuition?: number | null;
  prefersCampus?: CampusSetting | null;
}

export interface CollegeSnapshot {
  id: string;
  name: string;
  satMid50Low?: number | null;
  satMid50High?: number | null;
  actMid50Low?: number | null;
  actMid50High?: number | null;
  acceptanceRate?: number | null;
  avgNetPrice?: number | null;
  size?: CollegeSize | null;
  setting?: CampusSetting | null;
  state: string;
  popularMajors: string[];
}

export interface FitScoreResult {
  total: number;
  breakdown: {
    academic: number;
    selectivity: number;
    financial: number;
    size: number;
    location: number;
    setting: number;
    majors: number;
  };
}

// Convert ACT to SAT equivalent using concordance
function actToSat(act: number): number {
  const table: [number, number][] = [
    [36, 1590], [35, 1540], [34, 1500], [33, 1460], [32, 1430],
    [31, 1400], [30, 1370], [29, 1340], [28, 1310], [27, 1280],
    [26, 1240], [25, 1210], [24, 1180], [23, 1140], [22, 1110],
    [21, 1080], [20, 1040], [19, 1010], [18, 970],  [17, 930],
    [16, 890],  [15, 850],  [14, 800],  [13, 760],
  ];
  const entry = table.find(([a]) => a <= act);
  return entry ? entry[1] : 760;
}

function scoreAcademic(student: StudentSnapshot, college: CollegeSnapshot): number {
  // Use SAT directly, or convert ACT; if neither, estimate from GPA
  let score: number | null = null;

  if (student.satScore) {
    score = student.satScore;
  } else if (student.actScore) {
    score = actToSat(student.actScore);
  }

  if (score !== null && college.satMid50Low && college.satMid50High) {
    const mid = (college.satMid50Low + college.satMid50High) / 2;
    const range = college.satMid50High - college.satMid50Low;
    // Normalize: distance above/below midpoint as fraction of half-range
    const delta = (score - mid) / (range / 2 + 1);
    const raw = 0.5 + delta * 0.35; // centers at 0.5, ±0.35 for being above/below
    return Math.round(Math.max(0, Math.min(1, raw)) * 30);
  }

  // Fallback to GPA estimate if no test scores or college data
  if (student.gpa && college.acceptanceRate) {
    const rate = Number(college.acceptanceRate);
    // More selective schools need higher GPAs
    const threshold = 4.0 - rate * 1.5;
    const delta = (Number(student.gpa) - threshold) / 0.5;
    const raw = 0.5 + delta * 0.3;
    return Math.round(Math.max(0, Math.min(1, raw)) * 30);
  }

  return 15; // neutral when no data
}

function scoreSelectivity(student: StudentSnapshot, college: CollegeSnapshot): number {
  if (!college.acceptanceRate) return 8;

  // Determine student tier from their academic strength
  let studentScore: number | null = null;
  if (student.satScore) studentScore = student.satScore;
  else if (student.actScore) studentScore = actToSat(student.actScore);

  const rate = Number(college.acceptanceRate);

  if (studentScore !== null) {
    // Map SAT to tier: 1500+ = elite, 1400+ = strong, 1300+ = solid, 1200+ = moderate, else lower
    const tier =
      studentScore >= 1500 ? 4
      : studentScore >= 1400 ? 3
      : studentScore >= 1300 ? 2
      : studentScore >= 1200 ? 1
      : 0;

    // Map acceptance rate to difficulty: <5% = elite, <15% = highly selective, <30% = selective, etc.
    const difficulty =
      rate < 0.05 ? 4
      : rate < 0.15 ? 3
      : rate < 0.30 ? 2
      : rate < 0.50 ? 1
      : 0;

    const diff = Math.abs(tier - difficulty);
    if (diff === 0) return 15;
    if (diff === 1) return 12;
    if (diff === 2) return 8;
    return 4;
  }

  return 8; // neutral
}

function scoreFinancial(student: StudentSnapshot, college: CollegeSnapshot): number {
  if (!student.maxTuition || !college.avgNetPrice) return 10; // neutral

  const netPrice = college.avgNetPrice;
  const budget = student.maxTuition;

  if (netPrice <= budget) return 20;
  const overBudgetRatio = (netPrice - budget) / budget;
  const raw = 1 - overBudgetRatio;
  return Math.round(Math.max(0, Math.min(1, raw)) * 20);
}

function scoreSize(student: StudentSnapshot, college: CollegeSnapshot): number {
  if (!student.preferredSize || !college.size) return 5;

  const sizes: CollegeSize[] = ["SMALL", "MEDIUM", "LARGE"];
  const pref = sizes.indexOf(student.preferredSize);
  const actual = sizes.indexOf(college.size);
  const diff = Math.abs(pref - actual);

  if (diff === 0) return 10;
  if (diff === 1) return 5;
  return 0;
}

function scoreLocation(student: StudentSnapshot, college: CollegeSnapshot): number {
  if (student.preferredRegion.length === 0) return 5;

  const collegeRegion = STATE_TO_REGION[college.state];
  if (!collegeRegion) return 5;

  return student.preferredRegion.includes(collegeRegion) ? 10 : 0;
}

function scoreSetting(student: StudentSnapshot, college: CollegeSnapshot): number {
  if (!student.prefersCampus || !college.setting) return 3;
  return student.prefersCampus === college.setting ? 5 : 0;
}

function scoreMajors(student: StudentSnapshot, college: CollegeSnapshot): number {
  if (student.intendedMajors.length === 0 || college.popularMajors.length === 0) return 5;

  const studentMajorsLower = student.intendedMajors.map((m) => m.toLowerCase());
  const collegeMajorsLower = college.popularMajors.map((m) => m.toLowerCase());

  const matches = studentMajorsLower.filter((m) =>
    collegeMajorsLower.some((cm) => cm.includes(m) || m.includes(cm))
  );

  const ratio = matches.length / student.intendedMajors.length;
  return Math.round(ratio * 10);
}

export function computeFitScore(
  student: StudentSnapshot,
  college: CollegeSnapshot
): FitScoreResult {
  const academic = scoreAcademic(student, college);
  const selectivity = scoreSelectivity(student, college);
  const financial = scoreFinancial(student, college);
  const size = scoreSize(student, college);
  const location = scoreLocation(student, college);
  const setting = scoreSetting(student, college);
  const majors = scoreMajors(student, college);

  const total = academic + selectivity + financial + size + location + setting + majors;

  return {
    total,
    breakdown: { academic, selectivity, financial, size, location, setting, majors },
  };
}
