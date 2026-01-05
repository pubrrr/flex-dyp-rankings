import { getStandings, getTournamentDetails, getTournaments } from './api.ts';
import * as fs from 'node:fs';

const MONSTER_DYP = 'monster_dyp';

const tournaments = await getTournaments();

const currentYear = new Date().getFullYear();

const result = await Promise.all(
    tournaments.flatMap(async (tournament) => {
        const tournamentDate = new Date(tournament.date);

        const tournamentYear = tournamentDate.getFullYear();
        if (tournamentYear !== currentYear) {
            return [];
        }

        console.log(`Processing tournament ${tournament.name} (${tournamentDate.toLocaleDateString('en-ca')})...`);

        const tournamentDetails = await getTournamentDetails(tournament.id);

        const dypDiscipline = tournamentDetails.disciplines.find((discipline) => discipline.entryType === MONSTER_DYP);
        if (dypDiscipline === undefined) {
            console.log(`Ignoring tournament ${tournament.id} - did not find discipline of type ${MONSTER_DYP}`);
            return [];
        }

        const dypGroupId = dypDiscipline.stages[0].groups.find((group) => group.tournamentMode === MONSTER_DYP)?.id;
        if (dypGroupId === undefined) {
            console.log(`Ignoring tournament ${tournament.id} - did not find group of type ${MONSTER_DYP}`);
            return [];
        }

        const standings = await getStandings({ tournamentId: tournament.id, groupId: dypGroupId });
        const processedStandings = standings.map((entry, index) => ({
            playerId: entry.entry.id,
            playerName: entry.entry.name,
            rank: entry.rank ?? index,
        }));

        return {
            name: tournament.name,
            date: tournamentDate,
            quarter: tournamentDate.getMonth() / 4 + 1,
            standings: processedStandings,
        };
    }),
);

fs.writeFileSync(`../public/${currentYear}.json`, JSON.stringify(result));
