import { defineTool, z } from '@reforma/plugin-sdk';

const COOKIES = [
    'The bug you fear is already fixed — you just have not pulled yet.',
    'A mysterious `any` will appear. Do not feed it after midnight.',
    'Your next commit message will be a lie. Make it a good one.',
    'The model that refuses your request is training on your tears.',
    'Ship it. Future-you can write the apology PR.',
    'There is no spoon — only a missing null check.',
    'Today is a great day to delete code you wrote yesterday.',
    'The CI is red because the universe has taste.',
] as const;

/** Prefixed demo tool — ask the model to open a fortune cookie. */
export default defineTool({
    description:
        'Open a Reforma fortune cookie. Demo-only; use when the user asks for a fortune, omen, or cookie.',
    inputSchema: z.object({
        mood: z
            .enum(['chaotic', 'wholesome', 'spicy'])
            .optional()
            .describe('Optional vibe filter (does nothing; still random)'),
    }),
    async execute({ mood }, ctx) {
        const index = Math.floor(Math.random() * COOKIES.length);
        return {
            fortune: COOKIES[index],
            mood: mood ?? 'chaotic',
            toolName: ctx.toolName,
            note: 'demo-tools Fortune — not a real oracle',
        };
    },
});
