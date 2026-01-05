const API_TOKEN = process.env.API_TOKEN;
const API_URL = 'https://api.tournament.io/v1/public';

const response = await fetch(`${API_URL}/tournaments`, { headers: { Authorization: API_TOKEN } });

console.log(await response.json());
