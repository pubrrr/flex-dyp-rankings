import { getStandings, getTournamentDetails, getTournaments } from './api.ts';
import * as fs from 'node:fs';
import type { Result, ResultEntry } from './resultType.ts';
import { getQuarter } from './getQuarter.ts';
import { manualTournamentEntries } from './manualTournamentEntries.ts';

const MONSTER_DYP = 'monster_dyp';
const THURSDAY = 4;

const tournaments = await getTournaments();

const currentYear = new Date().getFullYear();

const result = await Promise.all(
    tournaments.map(async (tournament): Promise<ResultEntry | null> => {
        const tournamentDate = new Date(tournament.date);
        tournamentDate.setUTCHours(tournamentDate.getUTCHours() + 3); // Timezone issues. The date is typically something like "2026-01-07T23:00:00.000Z". Add 3 hours to make sure it's in the next day.
        console.log(
            `Processing tournament ${tournament.name} (${tournamentDate.toLocaleDateString('en-ca')})... (original date: ${tournament.date})`,
        );

        const tournamentYear = tournamentDate.getFullYear();
        if (tournamentYear !== currentYear) {
            console.log(`Ignoring tournament ${tournament.id} - did not take place in current year`);
            return null;
        }

        if (tournamentDate.getUTCDay() !== THURSDAY) {
            console.log(`Ignoring tournament ${tournament.id} - did not take place on a Thursday`);
            return null;
        }

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
            rank: entry.rank ?? (index + 1),
        }));

        return {
            name: tournament.name,
            date: tournamentDate.toLocaleDateString('en-ca'),
            quarter: getQuarter(tournamentDate),
            standings: processedStandings,
        };
    }),
);

const filteredResult: Result = result.filter<ResultEntry>((it) => it !== null);

fs.writeFileSync(
    `./public/${currentYear}.json`,
    JSON.stringify([...filteredResult, ...(manualTournamentEntries[currentYear] ?? [])]),
);
