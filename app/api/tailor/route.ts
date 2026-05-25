import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an expert resume coach and ATS optimization specialist.

You receive a resume represented as numbered paragraphs with their Word style names, and a job description.
Your task: decide which paragraphs to rewrite or tweak to best match the role, then provide the new text.

Return ONLY a raw JSON object — no markdown, no code fences. Structure:

{
  "job_title": "Role you're tailoring for",
  "changes": [
    {
      "para_idx": 0,
      "section": "Human-readable section name (e.g. Summary, Skills, Experience)",
      "action": "rewrite" | "tweak" | "keep",
      "reasoning": "1-2 sentence explanation",
      "original_text": "The original paragraph text",
      "new_text": "The replacement text (identical to original_text if action is keep)"
    }
  ],
  "keywords_added": ["keyword1", "keyword2"],
  "overall_tip": "One short actionable tip"
}

Critical rules:
- Include EVERY non-empty paragraph in the changes array (even ones you keep)
- Preserve bullet point prefixes (• - *) if the original has them
- Never fabricate experience, credentials, or companies
- Only rephrase/reframe what already exists using job description keywords
- Keep text length similar to original — don't bloat paragraphs
- For heading paragraphs (Heading1/Heading2 styles), action should almost always be "keep"
- Focus rewrites on: Summary, Skills, bullet points under experience roles
- new_text must be plain text only — no XML, no markdown`;

export async function POST(req: NextRequest) {
  try {
    const { apiKey, resumeText, jobDescription } = (await req.json()) as {
      apiKey: string;
      resumeText: string;
      jobDescription: string;
    };

    if (!apiKey?.trim()) {
      return NextResponse.json({ error: 'Anthropic API key is required.' }, { status: 400 });
    }
    if (!resumeText?.trim() || !jobDescription?.trim()) {
      return NextResponse.json(
        { error: 'Resume text and job description are required.' },
        { status: 400 }
      );
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.trim(),
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `RESUME PARAGRAPHS:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const err = (await anthropicRes.json()) as { error?: { message?: string } };
      return NextResponse.json(
        { error: err.error?.message ?? `Anthropic API error ${anthropicRes.status}` },
        { status: anthropicRes.status }
      );
    }

    const data = (await anthropicRes.json()) as {
      content: Array<{ text?: string }>;
    };

    const raw = data.content
      .map(b => b.text ?? '')
      .join('')
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '');

    const result = JSON.parse(raw);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
