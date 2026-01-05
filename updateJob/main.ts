import { getStandings, getTournamentDetails, getTournaments } from './api.ts';
import * as fs from 'node:fs';
import type { Result, ResultEntry } from './resultType.ts';

const MONSTER_DYP = 'monster_dyp';

const tournaments = await getTournaments();

const currentYear = new Date().getFullYear();

const result = await Promise.all(
    tournaments.map(async (tournament): Promise<ResultEntry | null> => {
        const tournamentDate = new Date(tournament.date);

        const tournamentYear = tournamentDate.getFullYear();
        if (tournamentYear !== currentYear) {
            return null;
        }

        console.log(`Processing tournament ${tournament.name} (${tournamentDate.toLocaleDateString('en-ca')})...`);

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
            playerName: entry.entry.name,
            rank: entry.rank ?? index,
        }));

        return {
            name: tournament.name,
            date: tournamentDate.toISOString(),
            quarter: Math.floor(tournamentDate.getMonth() / 4) + 1,
            standings: processedStandings,
        };
    }),
);

const filteredResult: Result = result.filter<ResultEntry>((it) => it !== null);

fs.writeFileSync(`../public/${currentYear}.json`, JSON.stringify(filteredResult));
