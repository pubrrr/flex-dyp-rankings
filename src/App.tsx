import { type FC, Suspense, use, useState } from 'react';
import { type Result, resultSchema } from '../updateJob/resultType.ts';
import { QuarterlyLeaderboard } from './QuarterlyLeaderboard.tsx';
import { IronTrophyLeaderboard } from './IronTrophyLeaderboard.tsx';
import { GitHubIcon } from './GitHubIcon.tsx';

export const App: FC = () => {
    return (
        <div className='mx-auto max-w-2xl p-4'>
            <div className='flex justify-end gap-2'>
                <a href='https://github.com/pubrrr/flex-dyp-rankings' className='float-end size-6'>
                    <GitHubIcon />
                </a>
            </div>
            <h1 className='mb-6 text-center text-xl font-bold'>Flex DYP Ranglisten</h1>
            <LeaderboardContainer />
        </div>
    );
};

const currentDate = new Date();
const currentYear = currentDate.getFullYear();

const LeaderboardContainer: FC = () => {
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [playerNameFilter, setPlayerNameFilter] = useState('');

    const promise = fetch(`${import.meta.env.BASE_URL}${selectedYear}.json`)
        .then((response) => response.json())
        .then((result) => resultSchema.parse(result));

    const years = Array.from({ length: currentYear - 2026 + 1 }, (_, i) => 2026 + i);

    return (
        <>
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

            <div className='input mb-4'>
                <input
                    placeholder='Spielernamen filtern...'
                    type='text'
                    value={playerNameFilter}
                    onChange={(event) => {
                        setPlayerNameFilter(event.target.value);
                    }}
                />
                {playerNameFilter.trim() !== '' && (
                    <button
                        className='btn btn-sm btn-ghost btn-circle'
                        onClick={() => {
                            setPlayerNameFilter('');
                        }}
                    >
                        ✕
                    </button>
                )}
            </div>

            <div>
                <Suspense fallback={<span className='loading loading-dots loading-md'></span>}>
                    <Leaderboards dataPromise={promise} playerNameFilter={playerNameFilter} />
                </Suspense>
            </div>
        </>
    );
};

type LeaderboardsProps = {
    dataPromise: Promise<Result>;
    playerNameFilter: string;
};

const Leaderboards: FC<LeaderboardsProps> = ({ dataPromise, playerNameFilter }) => {
    const response = use(dataPromise);

    return (
        <div className='tabs tabs-lift'>
            <input type='radio' name='my_tabs_3' className='tab' aria-label='Quartalspokal' defaultChecked />
            <div className='tab-content bg-base-100 border-base-300 p-6'>
                <QuarterlyLeaderboard response={response} playerNameFilter={playerNameFilter} />
            </div>

            <input type='radio' name='my_tabs_3' className='tab' aria-label='Eiserner Pokal' />
            <div className='tab-content bg-base-100 border-base-300 p-6'>
                <IronTrophyLeaderboard response={response} playerNameFilter={playerNameFilter} />
            </div>
        </div>
    );
};
