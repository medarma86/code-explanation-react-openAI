// src/pages/api/detect-language.ts
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required' });
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Identify the programming language of the following code:\n\n${code}\n\nRespond only with the name of the language.`,
        },
      ],
      temperature: 0,
    });

    const detected = completion.choices[0].message.content?.toLowerCase().trim();

    let normalized = 'javascript'; // fallback

    if (detected?.includes('python')) normalized = 'python';
    else if (detected?.includes('typescript')) normalized = 'typescript';
    else if (detected?.includes('javascript')) normalized = 'javascript';

    res.status(200).json({ language: normalized });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
  console.error(err);
  if (err.status === 429) {
    res.status(429).json({ error: 'You have exceeded your quota. Please check your OpenAI account.' });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
}
}
