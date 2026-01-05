import { z } from 'zod';

export const resultEntrySchema = z.object({
    name: z.string(),
    date: z.string(),
    quarter: z.number(),
    standings: z.array(
        z.object({
            playerId: z.string(),
            playerName: z.string(),
            rank: z.int(),
        }),
    ),
});

export type ResultEntry = z.infer<typeof resultEntrySchema>;

export const resultSchema = z.array(resultEntrySchema);

export type Result = z.infer<typeof resultSchema>;
