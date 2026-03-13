"use client";

import { useState, useEffect } from "react";
import Confetti from "./components/Confetti";
import { useGameState } from "./hooks/useGameState";

export default function Page() {
    const {
        screen,
        currentRound,
        currentPlayer,
        p1TotalVotes,
        p2TotalVotes,
        timeLeft,
        currentTopic,
        p1Earned,
        p2Earned,
        judgingJoke,
        winnerLabel,
        startGame,
        submitArgument,
        startNextRound,
        resetGame
    } = useGameState();

    const [argText, setArgText] = useState("");

    // When the screen becomes 'input', focus the textarea
    useEffect(() => {
        if (screen === 'input') {
            const el = document.getElementById('argument-input');
            if (el) {
                // minor delay to allow CSS transition
                setTimeout(() => el.focus({ preventScroll: true }), 50);
            }
        }
    }, [screen]);

    const handleSubmitArgument = (text: string) => {
        submitArgument(text);
        setArgText("");
    };

    // Used for the reveal bars animation
    const [revealBarsHeight, setRevealBarsHeight] = useState({ p1: 0, p2: 0 });
    const [showNextBtn, setShowNextBtn] = useState(false);
    
    // Animate display values for scores to mimic animateValue
    const [animatingP1Votes, setAnimatingP1Votes] = useState(0);
    const [animatingP2Votes, setAnimatingP2Votes] = useState(0);

    // Sync display votes when screen is NOT reveal (i.e. instant update)
    // and animate them when in reveal screen
    useEffect(() => {
        if (screen === 'reveal') {
            const startP1 = p1TotalVotes; // Hook hasn't added earned yet (it waits 1s)
            const startP2 = p2TotalVotes;
            setAnimatingP1Votes(startP1);
            setAnimatingP2Votes(startP2);

            // Screen IS reveal. Let's do the animation logic
            const timer1 = setTimeout(() => {
                const maxCurrent = Math.max(p1Earned, p2Earned, 500);
                setRevealBarsHeight({
                    p1: (p1Earned / maxCurrent) * 300,
                    p2: (p2Earned / maxCurrent) * 300
                });

                // animate numeric values over 1s (simplified vs original, but close enough for React state)
                let startTS: number | null = null;
                const duration = 1000;
                
                const step = (timestamp: number) => {
                    if (!startTS) startTS = timestamp;
                    const progress = Math.min((timestamp - startTS) / duration, 1);
                    setAnimatingP1Votes(Math.floor(progress * p1Earned + startP1));
                    setAnimatingP2Votes(Math.floor(progress * p2Earned + startP2));
                    
                    if (progress < 1) {
                        requestAnimationFrame(step);
                    }
                };
                requestAnimationFrame(step);
                
            }, 1000);

            const timer2 = setTimeout(() => {
                setShowNextBtn(true);
            }, 2500);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                setRevealBarsHeight({ p1: 0, p2: 0 });
                setShowNextBtn(false);
            };
        }
    }, [screen, p1Earned, p2Earned, p1TotalVotes, p2TotalVotes]);

    const displayP1Votes = screen === 'reveal' ? animatingP1Votes : p1TotalVotes;
    const displayP2Votes = screen === 'reveal' ? animatingP2Votes : p2TotalVotes;
    const currentBarsHeight = screen === 'reveal' ? revealBarsHeight : { p1: 0, p2: 0 };
    const isNextBtnVisible = screen === 'reveal' ? showNextBtn : false;


    return (
        <>
            <Confetti active={screen === 'winner'} />

            {/* Shared Top HUD */}
            <div id="hud" className={`hud ${screen !== 'lobby' && screen !== 'winner' ? 'active' : ''}`}>
                <div className="player-badge" style={{ background: 'var(--p1)' }}>
                    <div className="avatar">🦄</div>
                    <div className="score-info">
                        <span>P1 Votes</span>
                        <div className="score-val">{displayP1Votes}</div>
                    </div>
                </div>
                
                <div className="clock" style={{
                    color: timeLeft <= 10 ? 'var(--p2)' : '#FFF',
                    borderColor: timeLeft <= 10 ? 'var(--p2)' : '#FFF'
                }}>
                    {screen === 'input' ? timeLeft : '--'}
                </div>

                <div className="player-badge right" style={{ background: 'var(--p2)', color: 'white' }}>
                    <div className="avatar">🦖</div>
                    <div className="score-info">
                        <span style={{ color: '#FFB3D9' }}>P2 Votes</span>
                        <div className="score-val" style={{ color: 'white' }}>{displayP2Votes}</div>
                    </div>
                </div>
            </div>

            {/* 1. Lobby Screen */}
            <div id="screen-lobby" className={`screen ${screen === 'lobby' ? 'active' : ''}`}>
                <h1 className="title-text bouncing">ELECTION<br/>SHOWDOWN</h1>
                
                <div className="character-select">
                    <div className="char-card" style={{ borderColor: 'var(--p1)', boxShadow: '8px 8px 0px var(--p1)' }}>
                        <div className="avatar-preview">🦄</div>
                        <h3 style={{ color: 'var(--p1-dark)' }}>PLAYER 1</h3>
                    </div>
                    <h1 style={{ color: 'var(--accent)', alignSelf: 'center', WebkitTextStroke: '3px var(--dark)', textShadow: '4px 4px 0 var(--dark)' }}>VS</h1>
                    <div className="char-card" style={{ borderColor: 'var(--p2)', boxShadow: '8px 8px 0px var(--p2)' }}>
                        <div className="avatar-preview">🦖</div>
                        <h3 style={{ color: 'var(--p2-dark)' }}>PLAYER 2</h3>
                    </div>
                </div>

                <button className="btn green-color" onClick={startGame}>START GAME!</button>
            </div>

            {/* 2. Topic Reveal Screen */}
            <div id="screen-topic" className={`screen ${screen === 'topic' ? 'active' : ''}`}>
                <h2 className="title-text">ROUND {currentRound}</h2>
                <div className="card" style={{ maxWidth: '800px', transform: 'rotate(-2deg)' }}>
                    <h3 className="subtitle" style={{ color: 'var(--green)' }}>ON THE DOCKET...</h3>
                    <p id="topic-text">{currentTopic}</p>
                </div>
            </div>

            {/* 3. Current Player Input Screen */}
            <div id="screen-input" className={`screen ${screen === 'input' ? 'active' : ''}`}>
                <h2 className="title-text" style={{ 
                    fontSize: '60px',
                    color: currentPlayer === 1 ? 'var(--p1)' : 'var(--p2)'
                }}>
                    {currentPlayer === 1 ? "PLAYER 1'S TURN 🦄" : "PLAYER 2'S TURN 🦖"}
                </h2>
                <h3 className="subtitle" style={{ marginBottom: '20px', color: '#FFF', WebkitTextStroke: '1px black', fontSize: '20px' }}>
                    Topic: {currentTopic}
                </h3>
                
                <div className="typing-arena">
                    <textarea 
                        id="argument-input" 
                        className="text-input" 
                        placeholder="Type your spectacular argument here..."
                        style={{ borderColor: currentPlayer === 1 ? 'var(--p1)' : 'var(--p2)' }}
                        value={argText}
                        onChange={(e) => setArgText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitArgument(argText);
                            }
                        }}
                    />
                    <button 
                        className={`btn ${currentPlayer === 1 ? 'p1-color' : 'p2-color'}`}
                        style={{ 
                            alignSelf: 'flex-end',
                            color: currentPlayer === 1 ? "" : "#FFF" 
                        }}
                        onClick={() => handleSubmitArgument(argText)}
                    >
                        DEBATE! 🎤
                    </button>
                </div>
            </div>

            {/* 4. Judging / Loading Screen */}
            <div id="screen-judging" className={`screen ${screen === 'judging' ? 'active' : ''}`}>
                <div className="spinner">🤖</div>
                <h2 className="title-text" style={{ fontSize: '70px' }}>AI AUDIENCE IS VOTING...</h2>
                <div id="judging-joke">{judgingJoke}</div>
            </div>

            {/* 5. Reveal / Bar Chart Screen */}
            <div id="screen-reveal" className={`screen ${screen === 'reveal' ? 'active' : ''}`}>
                <h2 className="title-text" style={{ fontSize: '70px', marginBottom: 0 }}>VOTES SECURED!</h2>
                
                <div className="bars-container">
                    <div className="bar-wrapper">
                        <div className="avatar" style={{ fontSize: '60px', width: '100px', height: '100px' }}>🦄</div>
                        <div className="bar p1-bar" style={{ height: `${currentBarsHeight.p1}px` }}>
                            <div className="bar-score">+{p1Earned}</div>
                        </div>
                    </div>
                    
                    <div className="bar-wrapper">
                        <div className="avatar" style={{ fontSize: '60px', width: '100px', height: '100px' }}>🦖</div>
                        <div className="bar p2-bar" style={{ height: `${currentBarsHeight.p2}px` }}>
                            <div className="bar-score">+{p2Earned}</div>
                        </div>
                    </div>
                </div>

                <button 
                    className="btn green-color" 
                    onClick={startNextRound} 
                    style={{ 
                        marginTop: '40px', 
                        opacity: isNextBtnVisible ? 1 : 0, 
                        pointerEvents: isNextBtnVisible ? 'auto' : 'none',
                        transition: 'opacity 0.5s' 
                    }}
                >
                    {currentRound >= 3 ? "SEE FINAL RESULTS!" : "NEXT ROUND"}
                </button>
            </div>

            {/* 6. Winner Screen */}
            <div id="screen-winner" className={`screen ${screen === 'winner' ? 'active' : ''}`}>
                <h2 className="subtitle" style={{ fontSize: '50px', color: 'var(--green)', marginBottom: '10px' }}>ELECTION OVER!</h2>
                <h1 className="title-text" style={{ 
                    fontSize: '120px',
                    color: p1TotalVotes > p2TotalVotes ? 'var(--p1)' : (p2TotalVotes > p1TotalVotes ? 'var(--p2)' : 'var(--accent)')
                }}>
                    {winnerLabel}
                </h1>
                
                <div className="card" style={{ marginBottom: '40px', transform: 'rotate(1deg)' }}>
                    <h3 style={{ fontSize: '30px', marginBottom: '10px' }}>FINAL TALLY</h3>
                    <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--p1-dark)' }}>P1: <span>{p1TotalVotes}</span></p>
                    <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--p2-dark)' }}>P2: <span>{p2TotalVotes}</span></p>
                </div>

                <button className="btn" onClick={resetGame}>PLAY AGAIN</button>
            </div>
        </>
    );
}