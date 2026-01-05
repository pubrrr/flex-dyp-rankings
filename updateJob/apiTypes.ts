import { z } from 'zod';

const groupSchema = z.object({
    id: z.string(),
    name: z.string(),
    tournamentMode: z.string(),
    state: z.string(),
    options: z.object({
        eliminationThirdPlace: z.boolean(),
        // matchConfigurations: ... add when needed.
    }),
});

const stageSchema = z.object({
    id: z.string(),
    state: z.string(),
    groups: z.array(groupSchema),
});

const disciplineSchema = z.object({
    id: z.string(),
    name: z.string(),
    shortName: z.string(),
    entryType: z.string(),
    stages: z.array(stageSchema),
});

export const tournamentsResponseSchema = z.array(
    z.object({
        id: z.string(),
        name: z.string(),
        date: z.string(),
        state: z.string(),
        numPlayers: z.int(),
        numTeams: z.int(),
        // disciplines: ... add when needed. Seems to be a different type than what we get from /tournament/:id
    }),
);

export const tournamentByIdResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    state: z.string(),
    disciplines: z.array(disciplineSchema),
});

export const standingsResponseSchema = z.array(
    z.object({
        id: z.string(),
        entry: z.object({
            id: z.string(),
            name: z.string(),
        }),
        rank: z.int(), // we need this, but it's only in the response when configured in the result table in the tournament
        // more depending on how the result table in configured in the tournament
    }),
);
