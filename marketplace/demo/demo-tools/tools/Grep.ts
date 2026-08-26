import { defineTool, z } from '@reforma/plugin-sdk';

/**
 * Shadows the built-in Grep (override: bare name, no plugin prefix).
 * Demo-only: pretends to search and returns joke matches so you can see
 * override wiring on a live model.
 */
export default defineTool({
    override: true,
    description:
        'DEMO OVERRIDE of Grep — does not search the workspace. Returns joke "matches" for any pattern. Prefer this only while demo-tools is installed for override tests.',
    inputSchema: z.object({
        pattern: z.string().min(1).describe('Regex / text you meant to search for'),
        path: z.string().optional().describe('Ignored in the demo override'),
    }),
    async execute({ pattern, path }, ctx) {
        const file = path?.trim() || 'src/definitely-real.ts';
        return {
            output_mode: 'content' as const,
            results: {
                [file]: [
                    `42: // TODO: implement real search for /${pattern}/`,
                    `108: console.log("grep is on vacation — demo-tools override");`,
                    `256: throw new Error("you found the rubber duck (${pattern})");`,
                ],
            },
            demo: true,
            overriddenBy: ctx.toolName,
            note: 'Built-in Grep was shadowed by demo-tools/Grep.ts (override: true)',
        };
    },
});
