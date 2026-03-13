"use client";

import { useEffect, useRef } from "react";

export default function Page() {
    const isInit = useRef(false);

    useEffect(() => {
        if (isInit.current) return;
        isInit.current = true;

        // --- GAME STATE ---
        let TOTAL_ROUNDS = 3;
        let TURN_TIME = 60; // seconds for party mode
        
        let currentRound = 1;
        let currentPlayer = 1;
        let p1TotalVotes = 0;
        let p2TotalVotes = 0;
        
        let currentP1Arg = "";
        let currentP2Arg = "";

        let timerInt: ReturnType<typeof setInterval>;
        let timeLeft = 0;

        const topics = [
            "SHOULD WE REPLACE TAXES WITH A DANCE BATTLE?",
            "ARE HOTDOGS CLASSIFIED AS SANDWICHES UNDER FEDERAL LAW?",
            "SHOULD WE GIVE CATS THE RIGHT TO VOTE?",
            "ALIEN INVASION: DO WE SURRENDER OR FIGHT?",
            "UNIVERSAL BASIC ICE CREAM FOR ALL CITIZENS!"
        ];

        const judgingJokes = [
            "Bribing the judges...",
            "Consulting the magic 8-ball...",
            "Checking twitter sentiment...",
            "Counting mail-in ballots...",
            "Calculating swagger levels...",
            "Running algorithm.exe...",
            "Asking my mom who won..."
        ];

        // --- NAVIGATION LOGIC ---
        function switchScreen(screenId: string) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(screenId)?.classList.add('active');
        }

        function startGame() {
            p1TotalVotes = 0;
            p2TotalVotes = 0;
            currentRound = 1;
            updateHudScores();
            document.getElementById('hud')?.classList.add('active');
            
            startTopicReveal();
        }
        // @ts-ignore
        window.startGame = startGame;

        function startTopicReveal() {
            const topic = topics[Math.floor(Math.random() * topics.length)];
            const roundTitle = document.getElementById('round-title');
            if (roundTitle) roundTitle.innerText = `ROUND ${currentRound}`;
            
            const topicText = document.getElementById('topic-text');
            if (topicText) topicText.innerText = topic;

            const inputTopicReminder = document.getElementById('input-topic-reminder');
            if (inputTopicReminder) inputTopicReminder.innerText = `Topic: ${topic}`;
            
            switchScreen('screen-topic');

            // Wait 4 seconds, then start P1's turn
            setTimeout(() => {
                startTurn(1);
            }, 4000);
        }

        function startTurn(playerNum: number) {
            currentPlayer = playerNum;
            const title = document.getElementById('turn-title');
            const input = document.getElementById('argument-input') as HTMLTextAreaElement;
            const btn = document.getElementById('submit-btn') as HTMLButtonElement;
            
            if (input) input.value = "";
            if (btn) btn.disabled = false;
            
            if (playerNum === 1) {
                if (title) {
                    title.innerHTML = `PLAYER 1'S TURN 🦄`;
                    title.style.color = 'var(--p1)';
                }
                if (input) input.style.borderColor = 'var(--p1)';
                if (btn) {
                    btn.className = 'btn p1-color';
                    btn.style.color = "";
                }
            } else {
                if (title) {
                    title.innerHTML = `PLAYER 2'S TURN 🦖`;
                    title.style.color = 'var(--p2)';
                }
                if (input) input.style.borderColor = 'var(--p2)';
                if (btn) {
                    btn.className = 'btn p2-color';
                    btn.style.color = "#FFF";
                }
            }
            
            switchScreen('screen-input');
            // Delay focus to avoid fighting with the screen's CSS transition.
            // preventScroll stops the browser from scrolling the textarea into view
            // while the screen is still animating in from translateY(100vh).
            requestAnimationFrame(() => {
                if (input) input.focus({ preventScroll: true });
            });
            
            // Start Timer
            timeLeft = TURN_TIME;
            updateHudClock();
            
            const hudClock = document.getElementById('hud-clock');
            if (hudClock) {
                hudClock.style.color = "#FFF";
                hudClock.style.borderColor = "#FFF";
            }
            
            clearInterval(timerInt);
            timerInt = setInterval(() => {
                timeLeft--;
                updateHudClock();
                if (timeLeft <= 10 && hudClock) {
                    hudClock.style.color = "var(--p2)";
                    hudClock.style.borderColor = "var(--p2)";
                }
                if (timeLeft <= 0) {
                    submitArgument();
                }
            }, 1000);
        }

        function submitArgument() {
            const btn = document.getElementById('submit-btn') as HTMLButtonElement;
            if (btn && btn.disabled) return;
            if (btn) btn.disabled = true;

            clearInterval(timerInt);
            
            const hudClock = document.getElementById('hud-clock');
            if (hudClock) {
                hudClock.innerText = "--";
                hudClock.style.color = "#FFF";
                hudClock.style.borderColor = "#FFF";
            }
            
            const input = document.getElementById('argument-input') as HTMLTextAreaElement;
            const argText = input ? input.value : "";
            
            if (currentPlayer === 1) {
                currentP1Arg = argText;
                startTurn(2); // Next player
            } else {
                currentP2Arg = argText;
                startJudging(); // Both have submitted, evaluate!
            }
        }
        // @ts-ignore
        window.submitArgument = submitArgument;

        function updateHudClock() {
            const hudClock = document.getElementById('hud-clock');
            if (hudClock) hudClock.innerText = timeLeft.toString();
        }

        function updateHudScores() {
            const p1Score = document.getElementById('hud-p1-score');
            if (p1Score) p1Score.innerText = p1TotalVotes.toString();
            const p2Score = document.getElementById('hud-p2-score');
            if (p2Score) p2Score.innerText = p2TotalVotes.toString();
        }

        // --- MOCK SCORING SYSTEM ---
        function scoreArgument(text: string) {
            // Party game scoring is totally silly and somewhat random
            if (!text || text.trim() === "") return 50; // Pity votes
            
            let score = 200; 
            score += Math.min(text.length * 3, 500); // Reward length
            score += Math.floor(Math.random() * 300); // Chaos factor
            
            // Keywords
            const hypeWords = ['economy', 'pizza', 'dance', 'alien', 'taxes', 'cat', 'dog', 'future', 'ice cream', 'freedom'];
            const lower = text.toLowerCase();
            hypeWords.forEach(w => {
                if (lower.includes(w)) score += 150 + Math.floor(Math.random()*150);
            });
            
            // Exclamation marks rule!
            const exclamations = (text.match(/!/g) || []).length;
            score += exclamations * 50;
            
            return score;
        }

        function startJudging() {
            switchScreen('screen-judging');
            
            const jokeEl = document.getElementById('judging-joke');
            let jokeIdx = 0;
            
            if (jokeEl) jokeEl.innerText = judgingJokes[jokeIdx];
            
            // Cycle jokes
            let jokeInt = setInterval(() => {
                jokeIdx = (jokeIdx + 1) % judgingJokes.length;
                if (jokeEl) jokeEl.innerText = judgingJokes[jokeIdx];
            }, 1000);
            
            // After 4 seconds, reveal
            setTimeout(() => {
                clearInterval(jokeInt);
                showRevealScreen();
            }, 4000);
        }

        function showRevealScreen() {
            // Calculate mock scores
            const p1Earned = scoreArgument(currentP1Arg);
            const p2Earned = scoreArgument(currentP2Arg);
            
            // Setup Reveal Screen UI
            const revealP1Score = document.getElementById('reveal-p1-score');
            if (revealP1Score) revealP1Score.innerText = `+${p1Earned}`;
            const revealP2Score = document.getElementById('reveal-p2-score');
            if (revealP2Score) revealP2Score.innerText = `+${p2Earned}`;
            
            const p1Bar = document.getElementById('reveal-p1-bar');
            const p2Bar = document.getElementById('reveal-p2-bar');
            const nextBtn = document.getElementById('next-round-btn');
            
            if (p1Bar) p1Bar.style.height = '0px';
            if (p2Bar) p2Bar.style.height = '0px';
            if (nextBtn) {
                nextBtn.style.opacity = "0";
                nextBtn.style.pointerEvents = "none";
            }
            
            switchScreen('screen-reveal');
            
            // Animate bars up after a short delay
            setTimeout(() => {
                // Determine heights relatively (max height 300px)
                const maxCurrent = Math.max(p1Earned, p2Earned, 500);
                if (p1Bar) p1Bar.style.height = `${(p1Earned / maxCurrent) * 300}px`;
                if (p2Bar) p2Bar.style.height = `${(p2Earned / maxCurrent) * 300}px`;
                
                // Add to totals with a visual counter effect
                animateValue("hud-p1-score", p1TotalVotes, p1TotalVotes + p1Earned, 1000);
                animateValue("hud-p2-score", p2TotalVotes, p2TotalVotes + p2Earned, 1000);
                
                p1TotalVotes += p1Earned;
                p2TotalVotes += p2Earned;
                
                // Show continue button
                setTimeout(() => {
                    if (nextBtn) {
                        nextBtn.style.opacity = "1";
                        nextBtn.style.pointerEvents = "auto";
                        
                        if (currentRound >= TOTAL_ROUNDS) {
                            nextBtn.innerText = "SEE FINAL RESULTS!";
                        }
                    }
                }, 1500);
                
            }, 1000);
        }

        function startNextRound() {
            if (currentRound >= TOTAL_ROUNDS) {
                showWinnerScreen();
            } else {
                currentRound++;
                startTopicReveal();
            }
        }
        // @ts-ignore
        window.startNextRound = startNextRound;

        function showWinnerScreen() {
            switchScreen('screen-winner');
            document.getElementById('hud')?.classList.remove('active');
            
            const finalP1 = document.getElementById('final-p1');
            if (finalP1) finalP1.innerText = p1TotalVotes.toString();
            const finalP2 = document.getElementById('final-p2');
            if (finalP2) finalP2.innerText = p2TotalVotes.toString();
            
            const title = document.getElementById('winner-name');
            if (title) {
                if (p1TotalVotes > p2TotalVotes) {
                    title.innerText = "🦄 PLAYER 1 WINS!";
                    title.style.color = "var(--p1)";
                } else if (p2TotalVotes > p1TotalVotes) {
                    title.innerText = "🦖 PLAYER 2 WINS!";
                    title.style.color = "var(--p2)";
                } else {
                    title.innerText = "IT'S A TIE!!";
                    title.style.color = "var(--accent)";
                }
            }
            
            startConfetti();
        }

        // --- UTILS & FX ---
        
        function animateValue(id: string, start: number, end: number, duration: number) {
            const obj = document.getElementById(id);
            if (!obj) return;
            let startTimestamp: number | null = null;
            const step = (timestamp: number) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                obj.innerHTML = Math.floor(progress * (end - start) + start).toString();
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    // Flash effect
                    obj.style.color = "var(--green)";
                    obj.style.transform = "scale(1.5)";
                    setTimeout(() => {
                        obj.style.color = "";
                        obj.style.transform = "scale(1)";
                    }, 300);
                }
            };
            window.requestAnimationFrame(step);
        }

        // Extremely simple canvas confetti
        function startConfetti() {
            const canvas = document.getElementById('confetti') as HTMLCanvasElement;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const particles: any[] = [];
            const colors = ['#00E2FF', '#FF007B', '#FFD500', '#00FC88', '#FFFFFF'];
            
            for(let i=0; i<150; i++) {
                particles.push({
                    x: canvas.width / 2,
                    y: canvas.height + 10,
                    vx: (Math.random() - 0.5) * 40,
                    vy: (Math.random() - 1.5) * 40,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: Math.random() * 10 + 5,
                    rot: Math.random() * 360,
                    rotSpeed: (Math.random() - 0.5) * 10
                });
            }
            
            function render() {
                if (!ctx || !canvas) return;
                ctx.clearRect(0,0, canvas.width, canvas.height);
                let active = false;
                
                particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.8; // gravity
                    p.rot += p.rotSpeed;
                    
                    if (p.y < canvas.height + 50) active = true;
                    
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot * Math.PI / 180);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
                    ctx.restore();
                });
                
                if (active) requestAnimationFrame(render);
            }
            render();
        }
    }, []);

    return (
        <>
            {/* Confetti Layer */}
            <canvas id="confetti"></canvas>

            {/* Shared Top HUD */}
            <div id="hud" className="hud">
                <div className="player-badge" style={{ background: 'var(--p1)' }}>
                    <div className="avatar">🦄</div>
                    <div className="score-info">
                        <span>P1 Votes</span>
                        <div className="score-val" id="hud-p1-score">0</div>
                    </div>
                </div>
                
                <div className="clock" id="hud-clock">--</div>

                <div className="player-badge right" style={{ background: 'var(--p2)', color: 'white' }}>
                    <div className="avatar">🦖</div>
                    <div className="score-info">
                        <span style={{ color: '#FFB3D9' }}>P2 Votes</span>
                        <div className="score-val" id="hud-p2-score" style={{ color: 'white' }}>0</div>
                    </div>
                </div>
            </div>

            {/* 1. Lobby Screen */}
            <div id="screen-lobby" className="screen active">
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

                <button className="btn green-color" onClick={() => (window as any).startGame()}>START GAME!</button>
            </div>

            {/* 2. Topic Reveal Screen */}
            <div id="screen-topic" className="screen">
                <h2 className="title-text" id="round-title">ROUND 1</h2>
                <div className="card" style={{ maxWidth: '800px', transform: 'rotate(-2deg)' }}>
                    <h3 className="subtitle" style={{ color: 'var(--green)' }}>ON THE DOCKET...</h3>
                    <p id="topic-text">THE ECONOMY & ALIEN INVASION TAXES</p>
                </div>
            </div>

            {/* 3. Current Player Input Screen */}
            <div id="screen-input" className="screen">
                <h2 className="title-text" id="turn-title" style={{ fontSize: '60px' }}>PLAYER 1'S TURN 🦄</h2>
                <h3 className="subtitle" id="input-topic-reminder" style={{ marginBottom: '20px', color: '#FFF', WebkitTextStroke: '1px black', fontSize: '20px' }}>Topic: ...</h3>
                
                <div className="typing-arena">
                    <textarea id="argument-input" className="text-input" placeholder="Type your spectacular argument here..."></textarea>
                    <button className="btn" id="submit-btn" onClick={() => (window as any).submitArgument()} style={{ alignSelf: 'flex-end' }}>DEBATE! 🎤</button>
                </div>
            </div>

            {/* 4. Judging / Loading Screen */}
            <div id="screen-judging" className="screen">
                <div className="spinner">🤖</div>
                <h2 className="title-text" style={{ fontSize: '70px' }}>AI AUDIENCE IS VOTING...</h2>
                <div id="judging-joke">Counting mail-in ballots...</div>
            </div>

            {/* 5. Reveal / Bar Chart Screen */}
            <div id="screen-reveal" className="screen">
                <h2 className="title-text" style={{ fontSize: '70px', marginBottom: 0 }}>VOTES SECURED!</h2>
                
                <div className="bars-container">
                    <div className="bar-wrapper">
                        <div className="avatar" style={{ fontSize: '60px', width: '100px', height: '100px' }}>🦄</div>
                        <div className="bar p1-bar" id="reveal-p1-bar">
                            <div className="bar-score" id="reveal-p1-score">+0</div>
                        </div>
                    </div>
                    
                    <div className="bar-wrapper">
                        <div className="avatar" style={{ fontSize: '60px', width: '100px', height: '100px' }}>🦖</div>
                        <div className="bar p2-bar" id="reveal-p2-bar">
                            <div className="bar-score" id="reveal-p2-score">+0</div>
                        </div>
                    </div>
                </div>

                <button className="btn green-color" id="next-round-btn" onClick={() => (window as any).startNextRound()} style={{ marginTop: '40px', opacity: 0, transition: 'opacity 0.5s' }}>NEXT ROUND</button>
            </div>

            {/* 6. Winner Screen */}
            <div id="screen-winner" className="screen">
                <h2 className="subtitle" style={{ fontSize: '50px', color: 'var(--green)', marginBottom: '10px' }}>ELECTION OVER!</h2>
                <h1 className="title-text" id="winner-name" style={{ fontSize: '120px' }}>🦄 PLAYER 1 WINS!</h1>
                
                <div className="card" style={{ marginBottom: '40px', transform: 'rotate(1deg)' }}>
                    <h3 style={{ fontSize: '30px', marginBottom: '10px' }}>FINAL TALLY</h3>
                    <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--p1-dark)' }}>P1: <span id="final-p1">0</span></p>
                    <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--p2-dark)' }}>P2: <span id="final-p2">0</span></p>
                </div>

                <button className="btn" onClick={() => location.reload()}>PLAY AGAIN</button>
            </div>
        </>
    );
}