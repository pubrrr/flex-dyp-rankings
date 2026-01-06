import { type FC, Suspense, use, useState } from 'react';
import { type Result, resultSchema } from '../updateJob/resultType.ts';
import { getPointsForRank } from './getPointsForRank.ts';
import { PointsPerRankDisplay } from './PointsPerRankDisplay.tsx';

export const App: FC = () => {
    return (
        <div className='m-4'>
            <PointsPerRankDisplay />
            <LeaderboardContainer />
        </div>
    );
};

const currentYear = new Date().getFullYear();

const LeaderboardContainer: FC = () => {
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());

    const promise = fetch(`${import.meta.env.BASE_URL}${selectedYear}.json`)
        .then((response) => response.json())
        .then((result) => resultSchema.parse(result));

    const years = Array.from({ length: currentYear - 2026 + 1 }, (_, i) => 2026 + i);

    return (
        <>
            <h2 className='my-4 text-xl font-semibold'>Rangliste</h2>
            <select
                className='select my-4'
                value={selectedYear}
                onChange={(event) => {
                    setSelectedYear(event.target.value);
                }}
            >
                <option disabled>Wähle ein Jahr</option>
                {years.map((year) => (
                    <option key={year} value={year.toString()}>
                        {year}
                    </option>
                ))}
            </select>
            <div>
                <Suspense fallback={<span className='loading loading-dots loading-md'></span>}>
                    <YearDisplay dataPromise={promise} />
                </Suspense>
            </div>
        </>
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

    return <LeaderboardTable data={[...pointsByPlayerId.values()]} />;
};

type LeaderboardProps = {
    data: { playerName: string; points: number }[];
};

const LeaderboardTable: FC<LeaderboardProps> = ({ data }) => {
    return (
        <div className='rounded-box shadow-neutral border-base-300 max-w-xl overflow-x-auto border shadow'>
            <table className='table'>
                <thead>
                    <tr className='bg-primary/50'>
                        <th>Rang</th>
                        <th>Spieler</th>
                        <th>Punkte</th>
                    </tr>
                </thead>
                <tbody>
                    {data
                        .sort((a, b) => b.points - a.points)
                        .map((item, index) => (
                            <tr key={item.playerName} className='hover:bg-base-200'>
                                <td className='text-base-content/40'>#{index + 1}</td>
                                <td>{item.playerName}</td>
                                <td>{item.points}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};
