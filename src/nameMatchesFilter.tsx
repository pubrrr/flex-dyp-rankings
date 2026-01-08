export function nameMatchesFilter(playerName: string, playerNameFilter: string) {
    if (playerNameFilter.trim() === '') {
        return true;
    }

    return playerName.toLocaleLowerCase('en-us').includes(playerNameFilter.trim().toLocaleLowerCase('en-us'));
}
