import Anthropic from "@anthropic-ai/sdk";

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateFitNarrative(params: {
  student: {
    gpa?: number | null;
    satScore?: number | null;
    actScore?: number | null;
    intendedMajors: string[];
    preferredSize?: string | null;
    state?: string | null;
    extracurriculars?: unknown;
  };
  college: {
    name: string;
    city: string;
    state: string;
    acceptanceRate?: number | null;
    satMid50Low?: number | null;
    satMid50High?: number | null;
    avgNetPrice?: number | null;
    popularMajors: string[];
    size?: string | null;
    setting?: string | null;
  };
  fitScore: number;
}): Promise<string> {
  const { student, college, fitScore } = params;

  const message = await claude.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system:
      "You are a college admissions advisor. Be honest, encouraging, and specific. Write clear, concise paragraphs.",
    messages: [
      {
        role: "user",
        content: `Given this student profile:
- GPA: ${student.gpa ?? "not provided"}
- SAT: ${student.satScore ?? "not provided"}, ACT: ${student.actScore ?? "not provided"}
- Intended majors: ${student.intendedMajors.join(", ") || "undecided"}
- Preferred size: ${student.preferredSize ?? "no preference"}
- Home state: ${student.state ?? "not provided"}

And this college:
- Name: ${college.name}, ${college.city}, ${college.state}
- Acceptance rate: ${college.acceptanceRate ? `${(Number(college.acceptanceRate) * 100).toFixed(0)}%` : "unknown"}
- SAT mid-50%: ${college.satMid50Low && college.satMid50High ? `${college.satMid50Low}–${college.satMid50High}` : "unknown"}
- Average net price: ${college.avgNetPrice ? `$${college.avgNetPrice.toLocaleString()}` : "unknown"}
- Popular majors: ${college.popularMajors.join(", ")}
- Size: ${college.size ?? "unknown"}, Setting: ${college.setting ?? "unknown"}
- Fit score: ${fitScore}/100

Write exactly three short paragraphs (each under 70 words):
1. Overall fit summary
2. Specific strengths of this match
3. Honest risks or considerations

Do not invent statistics not provided above.`,
      },
    ],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}
