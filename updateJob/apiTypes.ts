import { z } from 'zod';

export const tournamentsResponseSchema = z.array(
    z.object({
        id: z.string(),
        name: z.string(),
        date: z.string(),
        state: z.string(),
        numPlayers: z.int(),
        numTeams: z.int(),
        // disciplines: ... add when needed
    }),
);

export const tournamentByIdResponseSchema = z.array(
    z.object({
        id: z.string(),
        // TODO
    }),
);
