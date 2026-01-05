import { type FC, Suspense, use } from 'react';
import { type Result, resultSchema } from '../updateJob/resultType.ts';
import { getPointsForRank } from './getPointsForRank.ts';

export const App: FC = () => {
    const promise = fetch(`${import.meta.env.BASE_URL}/2026.json`)
        .then((response) => response.json())
        .then((result) => resultSchema.parse(result));

    return (
        <Suspense fallback={'Loading...'}>
            <YearDisplay dataPromise={promise} />
        </Suspense>
    );
};

type YearDisplayProps = {
    dataPromise: Promise<Result>;
};

const YearDisplay: FC<YearDisplayProps> = ({ dataPromise }) => {
    const response = use(dataPromise);

    const pointsByPlayerId = new Map<string, { playerName: string; points: number }>();

    for (const tournament of response) {
        for (const standingsEntry of tournament.standings) {
            let pointsEntry = pointsByPlayerId.get(standingsEntry.playerId);
            if (pointsEntry === undefined) {
                pointsEntry = {
                    playerName: standingsEntry.playerName,
                    points: 0,
                };
            }
            pointsEntry.points += getPointsForRank(standingsEntry.rank);
            pointsByPlayerId.set(standingsEntry.playerId, pointsEntry);
        }
    }

    return <Leaderboard data={[...pointsByPlayerId.values()]} />;
};

type LeaderboardProps = {
    data: { playerName: string; points: number }[];
};

const Leaderboard: FC<LeaderboardProps> = ({ data }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Player</th>
                    <th>Points</th>
                </tr>
            </thead>
            <tbody>
                {data
                    .sort((a, b) => b.points - a.points)
                    .map((item) => (
                        <tr key={item.playerName}>
                            <td>{item.playerName}</td>
                            <td>{item.points}</td>
                        </tr>
                    ))}
            </tbody>
        </table>
    );
};
