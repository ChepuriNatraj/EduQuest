import React from 'react';
import { Team, formatTimestamp, getElapsedTime } from '../utils/firebase-helpers';

interface TeamCardProps {
    team: Team;
    rank?: number;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, rank }) => {
    const isCompleted = team.completedAt !== null;
    const lastScan = team.scans[team.scans.length - 1];
    const progress = Math.min((team.currentRound - 1) / 4 * 100, 100);

    return (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                    {rank && (
                        <span style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, var(--primary-pink), var(--primary-purple))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginRight: '0.5rem'
                        }}>
                            #{rank}
                        </span>
                    )}
                    <h3 style={{ display: 'inline' }}>{team.teamName}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Code: {team.teamCode}
                    </p>
                </div>

                <span className={`badge ${isCompleted ? 'badge-success' : 'badge-warning'}`}>
                    {isCompleted ? '✓ Completed' : 'In Progress'}
                </span>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '1rem' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)'
                }}>
                    <span>Progress</span>
                    <span>{Math.min(team.currentRound - 1, 4)}/4 Rounds</span>
                </div>
                <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary-pink), var(--primary-purple))',
                        transition: 'width 0.5s ease'
                    }}></div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginTop: '1.5rem'
            }}>
                <div>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        marginBottom: '0.25rem'
                    }}>
                        Current Round
                    </p>
                    <p style={{ fontSize: '1.3rem', fontWeight: '600' }}>
                        {team.currentRound > 4 ? 'Finished' : `Round ${team.currentRound}`}
                    </p>
                </div>

                {lastScan && (
                    <>
                        <div>
                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '0.85rem',
                                marginBottom: '0.25rem'
                            }}>
                                Last Location
                            </p>
                            <p style={{ fontSize: '1.3rem', fontWeight: '600' }}>
                                {lastScan.location}
                            </p>
                        </div>

                        <div>
                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '0.85rem',
                                marginBottom: '0.25rem'
                            }}>
                                Last Scan Time
                            </p>
                            <p style={{ fontSize: '1.3rem', fontWeight: '600' }}>
                                {formatTimestamp(lastScan.timestamp)}
                            </p>
                        </div>
                    </>
                )}

                {isCompleted && team.completedAt && (
                    <div>
                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.85rem',
                            marginBottom: '0.25rem'
                        }}>
                            Completion Time
                        </p>
                        <p style={{ fontSize: '1.3rem', fontWeight: '600', color: 'var(--success)' }}>
                            {getElapsedTime(team.startTime)}
                        </p>
                    </div>
                )}

                {!isCompleted && (
                    <div>
                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.85rem',
                            marginBottom: '0.25rem'
                        }}>
                            Time Elapsed
                        </p>
                        <p style={{ fontSize: '1.3rem', fontWeight: '600' }}>
                            {getElapsedTime(team.startTime)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamCard;
