import { describe, it, expect } from "vitest";
// fit-score imports from constants (no Prisma), safe to test in isolation
import { computeFitScore } from "../fit-score";
import type { StudentSnapshot, CollegeSnapshot } from "../fit-score";

const baseStudent: StudentSnapshot = {
  satScore: 1450,
  actScore: null,
  gpa: 3.8,
  intendedMajors: ["Computer Science", "Mathematics"],
  preferredSize: "MEDIUM",
  preferredRegion: ["Northeast"],
  maxTuition: 30000,
  prefersCampus: "URBAN",
};

const baseCollege: CollegeSnapshot = {
  id: "test-1",
  name: "Test University",
  satMid50Low: 1400,
  satMid50High: 1550,
  actMid50Low: 32,
  actMid50High: 35,
  acceptanceRate: 0.15,
  avgNetPrice: 25000,
  size: "MEDIUM",
  setting: "URBAN",
  state: "NY",
  popularMajors: ["Computer Science", "Engineering", "Mathematics"],
};

describe("computeFitScore", () => {
  it("returns a total score between 0 and 100", () => {
    const result = computeFitScore(baseStudent, baseCollege);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(100);
  });

  it("returns higher score when student is well above mid-50 range", () => {
    const highStudent = { ...baseStudent, satScore: 1580 };
    const lowStudent = { ...baseStudent, satScore: 1100 };
    const high = computeFitScore(highStudent, baseCollege);
    const low = computeFitScore(lowStudent, baseCollege);
    expect(high.breakdown.academic).toBeGreaterThan(low.breakdown.academic);
  });

  it("gives max financial score when college is under student budget", () => {
    const richStudent = { ...baseStudent, maxTuition: 50000 };
    const result = computeFitScore(richStudent, {
      ...baseCollege,
      avgNetPrice: 20000,
    });
    expect(result.breakdown.financial).toBe(20);
  });

  it("gives 0 financial score when college far exceeds budget", () => {
    const poorStudent = { ...baseStudent, maxTuition: 10000 };
    const result = computeFitScore(poorStudent, {
      ...baseCollege,
      avgNetPrice: 60000,
    });
    expect(result.breakdown.financial).toBe(0);
  });

  it("gives neutral financial score when maxTuition is not set", () => {
    const noTuition = { ...baseStudent, maxTuition: null };
    const result = computeFitScore(noTuition, baseCollege);
    expect(result.breakdown.financial).toBe(10);
  });

  it("gives full size score when sizes match exactly", () => {
    const result = computeFitScore(baseStudent, baseCollege); // both MEDIUM
    expect(result.breakdown.size).toBe(10);
  });

  it("gives half size score for adjacent size", () => {
    const student = { ...baseStudent, preferredSize: "SMALL" as const };
    const college = { ...baseCollege, size: "MEDIUM" as const };
    const result = computeFitScore(student, college);
    expect(result.breakdown.size).toBe(5);
  });

  it("gives 0 size score when sizes are far apart", () => {
    const student = { ...baseStudent, preferredSize: "SMALL" as const };
    const college = { ...baseCollege, size: "LARGE" as const };
    const result = computeFitScore(student, college);
    expect(result.breakdown.size).toBe(0);
  });

  it("gives full setting score for exact match", () => {
    const result = computeFitScore(baseStudent, baseCollege); // both URBAN
    expect(result.breakdown.setting).toBe(5);
  });

  it("gives 0 setting score for mismatch", () => {
    const student = { ...baseStudent, prefersCampus: "RURAL" as const };
    const result = computeFitScore(student, baseCollege);
    expect(result.breakdown.setting).toBe(0);
  });

  it("gives full location score when region matches", () => {
    // NY → Northeast, student prefers Northeast
    const result = computeFitScore(baseStudent, baseCollege);
    expect(result.breakdown.location).toBe(10);
  });

  it("gives 0 location score for non-matching region", () => {
    const student = { ...baseStudent, preferredRegion: ["West"] };
    const result = computeFitScore(student, baseCollege); // NY = Northeast
    expect(result.breakdown.location).toBe(0);
  });

  it("gives full major score when all intended majors match college offerings", () => {
    const result = computeFitScore(baseStudent, baseCollege);
    // CS and Mathematics both in popularMajors
    expect(result.breakdown.majors).toBe(10);
  });

  it("gives partial major score for partial overlap", () => {
    const student = { ...baseStudent, intendedMajors: ["Computer Science", "History"] };
    const result = computeFitScore(student, baseCollege);
    // 1/2 match = 5
    expect(result.breakdown.majors).toBe(5);
  });

  it("gives neutral major score when no intended majors set", () => {
    const student = { ...baseStudent, intendedMajors: [] };
    const result = computeFitScore(student, baseCollege);
    expect(result.breakdown.majors).toBe(5);
  });

  it("uses ACT when SAT is not provided", () => {
    const studentACT = { ...baseStudent, satScore: null, actScore: 34 };
    const result = computeFitScore(studentACT, baseCollege);
    expect(result.breakdown.academic).toBeGreaterThan(0);
  });

  it("handles missing college test score data gracefully", () => {
    const noScoreCollege = {
      ...baseCollege,
      satMid50Low: null,
      satMid50High: null,
    };
    const result = computeFitScore(baseStudent, noScoreCollege);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(100);
  });

  it("breakdown categories sum to total", () => {
    const result = computeFitScore(baseStudent, baseCollege);
    const sum = Object.values(result.breakdown).reduce((a, b) => a + b, 0);
    expect(sum).toBe(result.total);
  });
});
