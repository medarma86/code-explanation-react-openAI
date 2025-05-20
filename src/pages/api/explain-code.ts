import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: `Explain this code:\n${code}` }],
    });

    res.status(200).json({ explanation: completion.choices[0].message.content });
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
