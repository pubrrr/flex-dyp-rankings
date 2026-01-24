import { getStandings, getTournamentDetails, getTournaments } from './api.ts';
import * as fs from 'node:fs';
import path from 'node:path';
import type { Result, ResultEntry } from './resultType.ts';
import { tournamentDates } from './tournamentDates.ts';

const MONSTER_DYP = 'monster_dyp';

const allowedMap = new Map<number, number>(tournamentDates.map((d) => [d.date.getTime(), d.quarter]));

const tournaments = await getTournaments();

const currentYear = new Date().getFullYear();

const result = await Promise.all(
    tournaments.map(async (tournament): Promise<ResultEntry | null> => {
        const tournamentDate = new Date(tournament.date);
        // Timezone issues: adjust by +3 hours to ensure late-UTC times count for the next local day
        tournamentDate.setUTCHours(tournamentDate.getUTCHours() + 3);

        // Build UTC-midnight for the tournament's (possibly adjusted) date (use UTC components to avoid local-parse issues)
        const tournamentMidnightUTC = Date.UTC(
            tournamentDate.getUTCFullYear(),
            tournamentDate.getUTCMonth(),
            tournamentDate.getUTCDate(),
        );

        const quarter = allowedMap.get(tournamentMidnightUTC);
        if (quarter === undefined) {
            console.log(
                `Ignoring tournament ${tournament.id} - date ${new Date(tournamentMidnightUTC).toISOString().slice(0, 10)} not in allowed list.`,
            );
            return null;
        }
        console.log(
            `Processing tournament ${tournament.name} (${tournamentDate.toISOString().slice(0,10)})... (original date: ${tournament.date})`,
        );

        const tournamentDetails = await getTournamentDetails(tournament.id);

        const dypDiscipline = tournamentDetails.disciplines.find((discipline) => discipline.entryType === MONSTER_DYP);
        if (dypDiscipline === undefined) {
            console.log(`Ignoring tournament ${tournament.id} - did not find discipline of type ${MONSTER_DYP}`);
            return null;
        }

        const dypGroupId = dypDiscipline.stages[0].groups.find((group) => group.tournamentMode === MONSTER_DYP)?.id;
        if (dypGroupId === undefined) {
            console.log(`Ignoring tournament ${tournament.id} - did not find group of type ${MONSTER_DYP}`);
            return null;
        }

        const standings = await getStandings({ tournamentId: tournament.id, groupId: dypGroupId });
        const processedStandings = standings.map((entry, index) => ({
            playerId: entry.entry.id,
            playerName: entry.entry.name.trim(),
            rank: entry.rank ?? index,
        }));

        return {
            name: tournament.name,
            date: tournamentDate.toISOString().slice(0,10),
            quarter: quarter,
            standings: processedStandings,
        };
    }),
);

const filteredResult: Result = result.filter<ResultEntry>((it) => it !== null);
const publicDir = path.join(process.cwd(), 'public');
fs.writeFileSync(path.join(publicDir, `${currentYear}.json`), JSON.stringify(filteredResult));
