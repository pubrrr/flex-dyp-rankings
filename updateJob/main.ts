import { getStandings, getTournamentDetails, getTournaments } from './api.ts';

const MONSTER_DYP = 'monster_dyp';

const tournaments = await getTournaments();

const currentYear = new Date().getFullYear();
const currentYearTournaments = tournaments.filter((tournament) => {
    const tournamentYear = new Date(tournament.date).getFullYear();
    return tournamentYear === currentYear;
});

console.log(`Found ${currentYearTournaments.length} tournaments in ${currentYear}`);

const tournamentDetails = await Promise.all(
    currentYearTournaments.map(async (tournament) => getTournamentDetails(tournament.id)),
);

const tournamentAndGroupIds = tournamentDetails
    .map((tournament) => {
        const dypDiscipline = tournament.disciplines.find((discipline) => discipline.entryType === MONSTER_DYP);
        if (dypDiscipline === undefined) {
            console.log(`Ignoring tournament ${tournament.id} - did not find discipline of type ${MONSTER_DYP}`)
            return undefined;
        }

        const dypGroupId = dypDiscipline.stages[0].groups.find((group) => group.tournamentMode === MONSTER_DYP)?.id;
        if (dypGroupId === undefined) {
            console.log(`Ignoring tournament ${tournament.id} - did not find group of type ${MONSTER_DYP}`)
            return undefined;
        }

        return [tournament.id, dypGroupId] as const;
    })
    .filter((tournamentAndGroup) => tournamentAndGroup !== undefined);

const standings = await Promise.all(
    tournamentAndGroupIds.map(async ([tournamentId, groupId]) => getStandings({ tournamentId, groupId })),
);

console.log(JSON.stringify(standings, null, 2));
