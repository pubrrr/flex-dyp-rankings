import type { FC } from 'react';
import { DEFAULT_POINTS, POINTS_MAP } from './getPointsForRank.ts';

export const PointsPerRankDisplay: FC = () => {
    return (
        <details className='border-base-300 collapse-arrow shadow-neutral collapse mb-4 border shadow'>
            <summary className='collapse-title px-4 py-3 text-sm font-semibold'>Punkteschlüssel</summary>
            <div className='collapse-content'>
                <span className='text-sm'>
                    Die Tabelle zeigt wie viele Punkte man bei einer Teilnahme für welche Platzierung bekommt.
                </span>
                <PointsPerRankTable />
            </div>
        </details>
    );
};

const PointsPerRankTable: FC = () => {
    return (
        <div className='rounded-box border-base-300 m-4 max-w-sm overflow-x-auto border'>
            <table className='table'>
                <thead>
                    <tr className='bg-primary/50'>
                        <th>Platzierung</th>
                        <th>Punkte</th>
                    </tr>
                </thead>
                <tbody>
                    {[...POINTS_MAP.entries()].map(([rank, points]) => (
                        <tr key={rank} className='hover:bg-base-200'>
                            <td>{rank}</td>
                            <td>{points}</td>
                        </tr>
                    ))}
                    <tr className='hover:bg-base-200'>
                        <td>&ge;{Math.max(...POINTS_MAP.keys()) + 1}</td>
                        <td>{DEFAULT_POINTS}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
