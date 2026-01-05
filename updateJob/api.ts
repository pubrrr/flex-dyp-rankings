import { standingsResponseSchema, tournamentByIdResponseSchema, tournamentsResponseSchema } from './apiTypes.ts';

const API_TOKEN = process.env.API_TOKEN;
const API_URL = 'https://api.tournament.io/v1/public';

const AUTH_HEADERS = { headers: { Authorization: API_TOKEN } };

export async function getTournaments() {
    const response = await fetch(`${API_URL}/tournaments`, AUTH_HEADERS);

    return tournamentsResponseSchema.parse(await response.json());
}

export async function getTournamentDetails(tournamentId: string) {
    const detailResponse = await fetch(`${API_URL}/tournaments/${tournamentId}`, AUTH_HEADERS);

    return tournamentByIdResponseSchema.parse(await detailResponse.json());
}

export async function getStandings({ tournamentId, groupId }: { tournamentId: string; groupId: string }) {
    const detailResponse = await fetch(
        `${API_URL}/tournaments/${tournamentId}/groups/${groupId}/standings`,
        AUTH_HEADERS,
    );
    return standingsResponseSchema.parse(await detailResponse.json());
}
