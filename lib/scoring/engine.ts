import type { VerificationDecision } from "@prisma/client";

const wc = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;

export function scoreThinking(attempt: string, reasoning: string) {
  let points = 0;
  if (wc(attempt) >= 40) points += 8;
  if (wc(reasoning) >= 35) points += 8;
  if (attempt.length > 0 && reasoning.length > 0) points += 4;
  return { category: "THINKING" as const, value: points };
}

export function scoreSpecification(goal: string, constraints: string, done: string) {
  let points = 0;
  if (wc(goal) >= 10) points += 6;
  if (wc(constraints) >= 12) points += 7;
  if (wc(done) >= 10) points += 7;
  return { category: "SPECIFICATION" as const, value: points };
}

export function scoreVerification(
  decision: VerificationDecision,
  explanation: string,
  finalAnswer: string,
  aiOutput: string,
) {
  let points = wc(explanation) >= 20 ? 8 : 3;
  if (decision !== "ACCEPT") points += 6;
  if (finalAnswer.trim() && finalAnswer.trim() !== aiOutput.trim()) points += 6;
  return { category: "VERIFICATION" as const, value: points };
}
