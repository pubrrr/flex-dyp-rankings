import { type Dispatch, type FC, type SetStateAction, useState } from 'react';
import { type Result } from '../updateJob/resultType.ts';
import { getPointsForRank } from './getPointsForRank.ts';
import { SelectedPlayerModal } from './SelectedPlayerModal.tsx';
import { getQuarter } from '../updateJob/getQuarter.ts';
import { PointsPerRankDisplay } from './PointsPerRankDisplay.tsx';
import { nameMatchesFilter } from './nameMatchesFilter.tsx';

type QuarterlyLeaderboardProps = {
    response: Result;
    playerNameFilter: string;
};

const currentQuarter = getQuarter(new Date());

export const QuarterlyLeaderboard: FC<QuarterlyLeaderboardProps> = ({ response, playerNameFilter }) => {
    const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

    const pointsByPlayerId = new Map<string, { playerName: string; playerId: string; points: number }>();

    for (const tournament of response) {
        if (tournament.quarter !== selectedQuarter) {
            continue;
        }
        for (const standingsEntry of tournament.standings) {
            let pointsEntry = pointsByPlayerId.get(standingsEntry.playerId);
            if (pointsEntry === undefined) {
                pointsEntry = {
                    playerName: standingsEntry.playerName,
                    playerId: standingsEntry.playerId,
                    points: 0,
                };
            }
            pointsEntry.points += getPointsForRank(standingsEntry.rank);
            pointsByPlayerId.set(standingsEntry.playerId, pointsEntry);
        }
    }

    return (
        <>
            <div>
                <select
                    className='select mb-4'
                    value={selectedQuarter}
                    onChange={(event) => {
                        setSelectedQuarter(Number(event.target.value));
                    }}
                >
                    <option value='1'>1. Quartal</option>
                    <option value='2'>2. Quartal</option>
                    <option value='3'>3. Quartal</option>
                    <option value='4'>4. Quartal</option>
                </select>
            </div>

            <p className='text-base-content/40 mb-2 text-xs'>Klicke auf einen Spielernamen für Details.</p>

            <LeaderboardTable
                data={[...pointsByPlayerId.values()]}
                setSelectedPlayerId={setSelectedPlayerId}
                playerNameFilter={playerNameFilter}
            />
            <SelectedPlayerModal
                selectedPlayerId={selectedPlayerId}
                selectedQuarter={selectedQuarter}
                response={response}
                setSelectedPlayerId={setSelectedPlayerId}
            />
        </>
    );
};

type LeaderboardProps = {
    data: { playerName: string; playerId: string; points: number }[];
    setSelectedPlayerId: Dispatch<SetStateAction<string | null>>;
    playerNameFilter: string;
};

const LeaderboardTable: FC<LeaderboardProps> = ({ data, setSelectedPlayerId, playerNameFilter }) => {
    return (
        <div className='rounded-box shadow-neutral border-base-300 overflow-x-auto border shadow'>
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
                            <tr
                                key={item.playerId}
                                className={`hover:bg-base-200 cursor-pointer ${nameMatchesFilter(item.playerName, playerNameFilter) ? '' : 'hidden'}`}
                                onClick={() => {
                                    setSelectedPlayerId(item.playerId);
                                }}
                            >
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
