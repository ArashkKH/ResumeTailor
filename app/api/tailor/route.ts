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

function cleanJson(raw: string): string {
  return raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '');
}

async function callAnthropic(apiKey: string, model: string, userContent: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    }),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Anthropic error ${res.status}`);
  }
  const data = (await res.json()) as { content: Array<{ text?: string }> };
  return data.content.map(b => b.text ?? '').join('');
}

async function callOpenAICompat(
  baseUrl: string,
  apiKey: string,
  model: string,
  userContent: string
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
    }),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `API error ${res.status}`);
  }
  const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content;
}

async function callGemini(apiKey: string, model: string, userContent: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: userContent }] }],
      generationConfig: {
        maxOutputTokens: 4000,
        responseMimeType: 'application/json',
      },
    }),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Gemini error ${res.status}`);
  }
  const data = (await res.json()) as {
    candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
  };
  return data.candidates[0].content.parts[0].text;
}

export async function POST(req: NextRequest) {
  try {
    const { provider, model, apiKey, resumeText, jobDescription } = (await req.json()) as {
      provider: string;
      model: string;
      apiKey: string;
      resumeText: string;
      jobDescription: string;
    };

    if (!apiKey?.trim()) {
      return NextResponse.json({ error: 'API key is required.' }, { status: 400 });
    }
    if (!resumeText?.trim() || !jobDescription?.trim()) {
      return NextResponse.json(
        { error: 'Resume text and job description are required.' },
        { status: 400 }
      );
    }

    const userContent = `RESUME PARAGRAPHS:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`;
    let rawText: string;

    if (provider === 'anthropic') {
      rawText = await callAnthropic(apiKey.trim(), model, userContent);
    } else if (provider === 'openai') {
      rawText = await callOpenAICompat('https://api.openai.com/v1', apiKey.trim(), model, userContent);
    } else if (provider === 'groq') {
      rawText = await callOpenAICompat('https://api.groq.com/openai/v1', apiKey.trim(), model, userContent);
    } else if (provider === 'gemini') {
      rawText = await callGemini(apiKey.trim(), model, userContent);
    } else {
      return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }

    const result = JSON.parse(cleanJson(rawText));
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
