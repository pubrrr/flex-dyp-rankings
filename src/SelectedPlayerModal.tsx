import type { Dispatch, FC, SetStateAction } from 'react';
import { getPointsForRank } from './getPointsForRank.ts';
import type { Result } from '../updateJob/resultType.ts';

type SelectedPlayerModalProps = {
    selectedPlayerId: string | null;
    selectedQuarter: number | null;
    response: Result;
    setSelectedPlayerId: Dispatch<SetStateAction<string | null>>;
};
export const SelectedPlayerModal: FC<SelectedPlayerModalProps> = ({
    selectedPlayerId,
    selectedQuarter,
    response,
    setSelectedPlayerId,
}) => {
    if (selectedPlayerId === null) {
        return null;
    }

    const tournamentRanks = response
        .filter((tournament) => selectedQuarter === null || tournament.quarter === selectedQuarter)
        .map((tournament) => {
            const standingsEntry = tournament.standings.find(
                (standingsEntry) => standingsEntry.playerId === selectedPlayerId,
            );
            if (standingsEntry === undefined) {
                return null;
            }

            return {
                rank: standingsEntry.rank,
                date: tournament.date,
                playerName: standingsEntry.playerName,
            };
        })
        .filter((it) => it !== null);

    const playerName = tournamentRanks[0]?.playerName ?? '';

    return (
        <dialog className='modal modal-open'>
            <div className='modal-box'>
                <button
                    className='btn btn-sm btn-circle btn-ghost absolute top-4 right-4'
                    onClick={() => {
                        setSelectedPlayerId(null);
                    }}
                >
                    ✕
                </button>
                <h3 className='mb-2 text-lg font-bold'>{playerName}</h3>
                {selectedQuarter !== null && <p className='mb-2'>{selectedQuarter}. Quartal</p>}

                <div className='rounded-box border-base-300 mb-2 overflow-x-auto border'>
                    <table className='table'>
                        <thead>
                            <tr className='bg-primary/50'>
                                <th>Datum</th>
                                <th className='text-right'>Platz</th>
                                <th className='text-right'>Punkte</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tournamentRanks.map((item) => (
                                <tr key={item.date} className='hover:bg-base-200'>
                                    <td>{item.date}</td>
                                    <td className='text-right'>{item.rank}</td>
                                    <td className='text-right'>{getPointsForRank(item.rank)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p className='text-base-content/50 overflow-x-scroll text-xs whitespace-nowrap'>
                    Spieler ID: {selectedPlayerId}
                </p>
            </div>
            <div className='modal-backdrop'>
                <button
                    onClick={() => {
                        setSelectedPlayerId(null);
                    }}
                >
                    close modal
                </button>
            </div>
        </dialog>
    );
};
