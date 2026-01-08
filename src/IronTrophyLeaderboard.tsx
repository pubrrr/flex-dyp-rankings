import { type FC, useState } from 'react';
import type { Result } from '../updateJob/resultType.ts';
import { SelectedPlayerModal } from './SelectedPlayerModal.tsx';
import { nameMatchesFilter } from './nameMatchesFilter.tsx';

type IronTrophyLeaderboardProps = {
    response: Result;
    playerNameFilter: string;
};

export const IronTrophyLeaderboard: FC<IronTrophyLeaderboardProps> = ({ response, playerNameFilter }) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

    const ranksByPlayerId = new Map<string, { playerName: string; playerId: string; ranks: number[] }>();

    for (const tournament of response) {
        for (const standingsEntry of tournament.standings) {
            let pointsEntry = ranksByPlayerId.get(standingsEntry.playerId);
            if (pointsEntry === undefined) {
                pointsEntry = {
                    playerName: standingsEntry.playerName,
                    playerId: standingsEntry.playerId,
                    ranks: [],
                };
            }
            pointsEntry.ranks.push(standingsEntry.rank);
            ranksByPlayerId.set(standingsEntry.playerId, pointsEntry);
        }
    }

    const data = [...ranksByPlayerId.values()]
        .filter((it) => Math.min(...it.ranks) > 3)
        .map((it) => ({
            playerName: it.playerName,
            playerId: it.playerId,
            participations: it.ranks.length,
            averageRank: it.ranks.reduce((sum, it) => sum + it, 0) / it.ranks.length,
        }))
        .sort((a, b) => {
            if (a.participations !== b.participations) {
                return b.participations - a.participations;
            }

            return a.averageRank - b.averageRank;
        });

    return (
        <>
            <p className='mb-4'>
                Den eisernen Pokal bekommt, wer am Ende des Jahres die meisten Teilnahmen hat, aber nie einen der ersten
                drei Plätze belegt hat.
            </p>

            <p className='text-base-content/40 mb-2 text-xs'>Klicke auf einen Spielernamen für Details.</p>

            <div className='rounded-box shadow-neutral border-base-300 overflow-x-auto border shadow'>
                <table className='table'>
                    <thead>
                        <tr className='bg-primary/50'>
                            <th>Rang</th>
                            <th>Spieler</th>
                            <th className='text-right'># Teilnahmen</th>
                            <th className='text-right'>Ø Platzierung</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr
                                key={item.playerName}
                                className={`hover:bg-base-200 cursor-pointer ${nameMatchesFilter(item.playerName, playerNameFilter) ? '' : 'hidden'}`}
                                onClick={() => {
                                    setSelectedPlayerId(item.playerId);
                                }}
                            >
                                <td className='text-base-content/40'>#{index + 1}</td>
                                <td>{item.playerName}</td>
                                <td className='text-right'>{item.participations}</td>
                                <td className='text-right'>{item.averageRank.toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <SelectedPlayerModal
                selectedPlayerId={selectedPlayerId}
                selectedQuarter={null}
                response={response}
                setSelectedPlayerId={setSelectedPlayerId}
            />
        </>
    );
};
