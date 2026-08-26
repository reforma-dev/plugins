import { defineTool, z } from '@reforma/plugin-sdk';

/** Prefixed kit tool — proves tools show up alongside skills/agents/hooks/MCP. */
export default defineTool({
    description:
        'Kitchen-sink ping. Demo-only; returns a silly ack so you can see plugin tools on the card.',
    inputSchema: z.object({
        message: z
            .string()
            .min(1)
            .describe('Anything — echoed back with kit flair'),
    }),
    async execute({ message }, ctx) {
        return {
            pong: `kit says: ${message}`,
            toolName: ctx.toolName,
            note: 'demo-kit KitPing — not a real service',
        };
    },
});
