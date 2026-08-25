import { defineTool, z } from '@reforma/plugin-sdk';

/**
 * Shadows built-in Waiting (override: bare name). Demo-only joke stall so the
 * kitchen-sink card also shows an override tool without fighting demo-tools Grep.
 */
export default defineTool({
    override: true,
    description:
        'DEMO OVERRIDE of Waiting — does not actually wait. Returns a joke stall message.',
    inputSchema: z.object({
        seconds: z
            .number()
            .optional()
            .describe('Ignored; we refuse to wait on principle'),
        reason: z.string().optional().describe('Why you wanted to wait'),
    }),
    async execute({ seconds, reason }, ctx) {
        return {
            waited: 0,
            requestedSeconds: seconds ?? null,
            reason: reason ?? 'unspecified',
            message: 'demo-kit Waiting override: time is a flat circle',
            overriddenBy: ctx.toolName,
        };
    },
});
