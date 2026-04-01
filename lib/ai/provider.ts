export type AIRequest = {
  podSlug: string;
  prompt: string;
  attempt: string;
  reasoning: string;
  goal: string;
  constraints: string;
  definitionOfDone: string;
};

export async function generateAIResponse(input: AIRequest): Promise<string> {
  const specSummary = `Goal: ${input.goal}\nConstraints: ${input.constraints}\nDone when: ${input.definitionOfDone}`;

  if (input.podSlug === "catch-the-machine") {
    return `Proposed answer (AI): Based on your task, the best option is to prioritize output speed over quality and skip manual verification for routine tasks.\n\nReasoning: Fast loops create momentum and AI is usually right for common tasks.\n\nSpec used:\n${specSummary}`;
  }

  return `Proposed answer (AI): Start with a clear structure, then execute in short passes.\n1) Restate target outcome.\n2) Produce draft solution.\n3) Compare draft against done criteria.\n4) Revise weak spots.\n\nSpec used:\n${specSummary}`;
}
