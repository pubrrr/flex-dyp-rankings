import { tournamentsResponseSchema } from './apiTypes.ts';

const API_TOKEN = process.env.API_TOKEN;
const API_URL = 'https://api.tournament.io/v1/public';

const response = await fetch(`${API_URL}/tournaments`, {
    headers: { Authorization: API_TOKEN }
});

const tournaments = tournamentsResponseSchema.parse(await response.json());

const currentYear = new Date().getFullYear();
const currentYearTournaments = tournaments.filter(tournament => {
    const tournamentYear = new Date(tournament.date).getFullYear();
    return tournamentYear === currentYear;
});

console.log(`Found ${currentYearTournaments.length} tournaments in ${currentYear}`);

const tournamentDetails = await Promise.all(
    currentYearTournaments.map(async (tournament) => {
        const detailResponse = await fetch(`${API_URL}/tournaments/${tournament.id}`, {
            headers: { Authorization: API_TOKEN }
        });
        return await detailResponse.json();
    })
);

console.log(JSON.stringify(tournamentDetails, null, 2));