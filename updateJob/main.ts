import { tournamentByIdResponseSchema, tournamentsResponseSchema } from './apiTypes.ts';

const API_TOKEN = process.env.API_TOKEN;
const API_URL = 'https://api.tournament.io/v1/public';

const response = await fetch(`${API_URL}/tournaments`, {
    headers: { Authorization: API_TOKEN },
});

const tournaments = tournamentsResponseSchema.parse(await response.json());

const currentYear = new Date().getFullYear();
const currentYearTournaments = tournaments.filter((tournament) => {
    const tournamentYear = new Date(tournament.date).getFullYear();
    return tournamentYear === currentYear;
});

console.log(`Found ${currentYearTournaments.length} tournaments in ${currentYear}`);

const tournamentDetails = await Promise.all(
    currentYearTournaments.map(async (tournament) => {
        const detailResponse = await fetch(`${API_URL}/tournaments/${tournament.id}`, {
            headers: { Authorization: API_TOKEN },
        });
        return tournamentByIdResponseSchema.parse(await detailResponse.json());
    }),
);

console.log(JSON.stringify(tournamentDetails, null, 2));

const tournamentAndGroupIds = tournamentDetails
    .map((tournament) => {
        const dypDiscipline = tournament.disciplines.find((discipline) => discipline.entryType === 'monster_dyp');
        if (dypDiscipline === undefined) {
            return undefined;
        }

        const dypGroupId = dypDiscipline.stages[0].groups.find((group) => group.tournamentMode === 'monster_dyp')?.id;
        if (dypGroupId === undefined) {
            return undefined;
        }

        return [tournament.id, dypGroupId] as const;
    })
    .filter((tournamentAndGroup) => tournamentAndGroup !== undefined);


const standings = await Promise.all(
    tournamentAndGroupIds.map(async ([tournamentId, groupId]) => {
        const detailResponse = await fetch(`${API_URL}/tournaments/${tournamentId}/groups/${groupId}/standings`, {
            headers: { Authorization: API_TOKEN },
        });
        return await detailResponse.json();
    }),
)

console.log(JSON.stringify(standings, null, 2));

