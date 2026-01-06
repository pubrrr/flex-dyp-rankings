export function getQuarter(tournamentDate: Date) {
    return Math.floor(tournamentDate.getMonth() / 3) + 1;
}
