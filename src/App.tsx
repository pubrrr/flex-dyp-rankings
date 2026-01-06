import { type Dispatch, type FC, type SetStateAction, Suspense, use, useState } from 'react';
import { type Result, resultSchema } from '../updateJob/resultType.ts';
import { getPointsForRank } from './getPointsForRank.ts';
import { PointsPerRankDisplay } from './PointsPerRankDisplay.tsx';
import { getQuarter } from '../updateJob/getQuarter.ts';

export const App: FC = () => {
    return (
        <div className='mx-auto max-w-2xl p-4'>
            <PointsPerRankDisplay />
            <LeaderboardContainer />
        </div>
    );
};

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentQuarter = getQuarter(currentDate);

const LeaderboardContainer: FC = () => {
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter);
    const [playerNameFilter, setPlayerNameFilter] = useState('');

    const promise = fetch(`${import.meta.env.BASE_URL}${selectedYear}.json`)
        .then((response) => response.json())
        .then((result) => resultSchema.parse(result));

    const years = Array.from({ length: currentYear - 2026 + 1 }, (_, i) => 2026 + i);

    return (
        <>
            <h2 className='my-4 text-xl font-semibold'>Rangliste</h2>
            <div>
                <select
                    className='select mb-4'
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
            </div>
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
            <input
                className='input mb-4'
                placeholder='Spielernamen filtern...'
                type='text'
                value={playerNameFilter}
                onChange={(event) => {
                    setPlayerNameFilter(event.target.value);
                }}
            />
            <div>
                <Suspense fallback={<span className='loading loading-dots loading-md'></span>}>
                    <YearDisplay
                        dataPromise={promise}
                        selectedQuarter={selectedQuarter}
                        playerNameFilter={playerNameFilter}
                    />
                </Suspense>
            </div>
        </>
    );
};

type YearDisplayProps = {
    dataPromise: Promise<Result>;
    selectedQuarter: number;
    playerNameFilter: string;
};

const YearDisplay: FC<YearDisplayProps> = ({ dataPromise, selectedQuarter, playerNameFilter }) => {
    const response = use(dataPromise);

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

function nameMatchesFilter(playerName: string, playerNameFilter: string) {
    if (playerNameFilter.trim() === '') {
        return true;
    }

    return playerName.toLocaleLowerCase('en-us').includes(playerNameFilter.trim().toLocaleLowerCase('en-us'));
}

type SelectedPlayerModalProps = {
    selectedPlayerId: string | null;
    selectedQuarter: number;
    response: Result;
    setSelectedPlayerId: Dispatch<SetStateAction<string | null>>;
};

const SelectedPlayerModal: FC<SelectedPlayerModalProps> = ({
    selectedPlayerId,
    selectedQuarter,
    response,
    setSelectedPlayerId,
}) => {
    if (selectedPlayerId === null) {
        return null;
    }

    const tournamentRanks = response
        .filter((tournament) => tournament.quarter === selectedQuarter)
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
                name: tournament.name,
                playerName: standingsEntry.playerName,
            };
        })
        .filter((it) => it !== null);

    const playerName = tournamentRanks[0]?.playerName ?? '';

    return (
        <dialog
            className='modal modal-open'
            onClose={() => {
                console.log('closed');
            }}
        >
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
                <p className='text-base-content/50 mb-2 overflow-x-scroll text-sm whitespace-nowrap'>
                    Spieler ID: {selectedPlayerId}
                </p>
                <div className='rounded-box border-base-300 overflow-x-auto border'>
                    <table className='table'>
                        <thead>
                            <tr className='bg-primary/50'>
                                <th>Datum</th>
                                <th className='hidden sm:block'>Turnier</th>
                                <th className='text-right'>Platz</th>
                                <th className='text-right'>Punkte</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tournamentRanks.map((item) => (
                                <tr key={item.name} className='hover:bg-base-200'>
                                    <td>{item.date}</td>
                                    <td className='hidden sm:block'>{item.name}</td>
                                    <td className='text-right'>{item.rank}</td>
                                    <td className='text-right'>{getPointsForRank(item.rank)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
