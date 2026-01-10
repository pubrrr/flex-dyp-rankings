import { type FC, Suspense, use, useState } from 'react';
import { type Result, resultSchema } from '../updateJob/resultType.ts';
import { QuarterlyLeaderboard } from './QuarterlyLeaderboard.tsx';
import { IronTrophyLeaderboard } from './IronTrophyLeaderboard.tsx';
import { PointsPerRankDisplay } from './PointsPerRankDisplay.tsx';

export const App: FC = () => {
    return (
        <div className='mx-auto max-w-2xl p-4'>
            <div className='flex justify-end gap-2'>
                <a href='https://github.com/pubrrr/flex-dyp-rankings' className='float-end'>
                    <span className='icon-[mdi--github] size-6'></span>
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
            <div className='mb-4 flex gap-2'>
                <select
                    className='select w-20 shrink-0'
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

                <div className='input grow'>
                    <input
                        placeholder='Spieler filtern...'
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
            <input type='radio' name='tabs' className='tab' aria-label='Quartalspokal' defaultChecked />
            <div className='tab-content bg-base-100 border-base-300'>
                <QuarterlyLeaderboard response={response} playerNameFilter={playerNameFilter} />
            </div>

            <input type='radio' name='tabs' className='tab' aria-label='Eiserner Pokal' />
            <div className='tab-content bg-base-100 border-base-300'>
                <IronTrophyLeaderboard response={response} playerNameFilter={playerNameFilter} />
            </div>

            <label className='tab flex flex-row items-center'>
                <input type='radio' name='tabs' />
                <span className='icon-[mdi--information-outline] mr-1 size-5'></span>
                Wertung
            </label>
            <div className='tab-content bg-base-100 border-base-300'>
                <RatingExplanation />
            </div>
        </div>
    );
};

const RatingExplanation: FC = () => {
    return (
        <div className='p-4'>
            <p className='mb-4'>
                Den Quartalspokal bekommt, wer am Ende eines Quartals die meisten Punkte gesammelt hat.
            </p>
            <PointsPerRankDisplay />
            <p>
                Den eisernen Pokal bekommt, wer am Ende des Jahres die meisten Teilnahmen hat, aber nie einen der ersten
                drei Plätze belegt hat.
            </p>
        </div>
    );
};
