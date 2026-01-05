const POINTS_MAP: Record<number, number> = {
    1: 40,
    2: 35,
    3: 31,
    4: 29,
    5: 28,
    6: 27,
    7: 26,
    8: 25,
    9: 24,
    10: 23,
    11: 22,
    12: 21,
    13: 20,
    14: 19,
    15: 18,
    16: 17,
};

const DEFAULT_POINTS = 15;

export function getPointsForRank(rank: number): number {
    return POINTS_MAP[rank] ?? DEFAULT_POINTS;
}
