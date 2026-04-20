document.addEventListener('DOMContentLoaded', () => {
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    const heading = document.getElementById('heading');
    const questionContainer = document.getElementById('question-container');
    const successContainer = document.getElementById('success-container');
    const heartsContainer = document.getElementById('hearts-container');
    const musicToggle = document.getElementById('music-toggle');

    const noMessages = [
        "Are you sure?",
        "Can't you reconsider?",
        "Are you really sure? 🥺",
        "Think again! 😌",
        "You might regret this 😏",
        "Pookie please? 🥺",
        "Don't do this to me! 💔",
        "You're breaking my heart! 😭",
        "Is that your final answer? 🤔",
        "I'm going to cry! 😿",
        "Give it another thought! 💫"
    ];

    let noClickCount = 0;
    let currentTranslateX = 0;
    let currentTranslateY = 0;
    let escapeEnabled = false;

    function enableEscapeTrick() {
        if (escapeEnabled) return;
        escapeEnabled = true;

        noBtn.addEventListener('mouseenter', () => {
            // Move smoothly in a random direction
            const dirs = [
                { x: 120, y: 0 },
                { x: -120, y: 0 },
                { x: 0, y: 100 },
                { x: 0, y: -100 },
                { x: 90, y: 90 },
                { x: -90, y: -90 }
            ];
            const move = dirs[Math.floor(Math.random() * dirs.length)];

            currentTranslateX += move.x;
            currentTranslateY += move.y;

            // Limit bounds so it doesn't go too far off
            const maxDistX = window.innerWidth < 600 ? 100 : 300;
            const maxDistY = window.innerHeight < 600 ? 100 : 200;
            currentTranslateX = Math.max(-maxDistX, Math.min(maxDistX, currentTranslateX));
            currentTranslateY = Math.max(-maxDistY, Math.min(maxDistY, currentTranslateY));

            const noScale = Math.max(0.7, 1 - (noClickCount * 0.05));
            noBtn.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px) scale(${noScale})`;
        });
    }

    // Audio Context Setup for simple sounds
    let audioCtx = null;
    let isSoundMuted = false;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playTone(freq, type, duration, vol) {
        if (!audioCtx || isSoundMuted) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(vol, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.log("Audio play failed:", e);
        }
    }

    // Toggle Sound Button
    musicToggle.addEventListener('click', () => {
        initAudio();
        isSoundMuted = !isSoundMuted;
        musicToggle.innerHTML = isSoundMuted ? '🔇' : '🔊';
        if (!isSoundMuted) {
            playTone(880, 'sine', 0.1, 0.05); // test beep
        }
    });

    // Create a floating ambient heart
    function createHeart() {
        const heart = document.createElement('div');
        heart.classList.add('heart');

        // Random horizontal position across the width
        heart.style.left = Math.random() * 100 + 'vw';
        // Random float duration
        heart.style.animationDuration = (Math.random() * 4 + 4) + 's';

        // Random romantic colors mapping to color property so currentColor inherits it
        const colors = ['#ff4d4d', '#ff7eb3', '#ff9472', '#ff5493', '#ff6b81'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        heart.style.color = randomColor;

        heartsContainer.appendChild(heart);

        // Remove after animation completes
        setTimeout(() => {
            heart.remove();
        }, 8000);
    }

    // Spawn hearts continuously
    setInterval(createHeart, 800);

    // Initial scattered hearts
    for (let i = 0; i < 8; i++) {
        setTimeout(createHeart, Math.random() * 3000);
    }

    // When No is clicked
    function handleNo(e) {
        e.preventDefault();
        initAudio();

        // Sound effect: pitch drops slightly each time
        playTone(300 - (noClickCount * 20), 'square', 0.15, 0.05);

        noClickCount++;

        // Update No button text
        const msgIndex = Math.min(noClickCount - 1, noMessages.length - 1);
        noBtn.innerHTML = `<span>❌</span> ${noMessages[msgIndex]}`;

        // Shake the heading playfully
        heading.classList.add('shake');
        setTimeout(() => heading.classList.remove('shake'), 500);

        // Making the Yes button physically bigger on every iteration
        const currentSize = 1 + (noClickCount * 0.4);
        yesBtn.style.fontSize = `${1.25 * currentSize}rem`;
        yesBtn.style.padding = `${1 * currentSize}rem ${2.5 * currentSize}rem`;

        // Slightly shrink No button to make Yes look even grander
        const noScale = Math.max(0.7, 1 - (noClickCount * 0.05));
        noBtn.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px) scale(${noScale})`;

        // After the 7th iteration, start the teasing sliding escape trick
        if (noClickCount >= 7) {
            enableEscapeTrick();
        }
    }

    noBtn.addEventListener('click', handleNo);

    // When Yes is clicked
    yesBtn.addEventListener('click', () => {
        initAudio();

        // Happy arpeggio sound
        const baseFreq = 440;
        playTone(baseFreq, 'sine', 0.1, 0.1);
        setTimeout(() => playTone(baseFreq * 1.25, 'sine', 0.1, 0.1), 100);
        setTimeout(() => playTone(baseFreq * 1.5, 'sine', 0.1, 0.1), 200);
        setTimeout(() => playTone(baseFreq * 2, 'sine', 0.4, 0.15), 300);

        // Transition UI
        questionContainer.classList.add('hidden');
        successContainer.classList.remove('hidden');

        // Ensure No button disappears from screen
        noBtn.style.display = 'none';

        // Triger confetti storm
        createConfetti();
    });

    function createConfetti() {
        const colors = ['#ff4d4d', '#ffdf00', '#00ff00', '#33ccff', '#ff00ff', '#ff7eb3'];

        for (let i = 0; i < 120; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');

            // Randomize position
            confetti.style.left = Math.random() * 100 + 'vw';

            // Randomize styling
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.animationDelay = (Math.random() * 1) + 's';

            // Varied sizes
            const size = Math.random() * 10 + 5;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;

            // 50% chance to be circular
            if (Math.random() > 0.5) {
                confetti.style.borderRadius = '50%';
            }

            heartsContainer.appendChild(confetti);

            // Clean up DOM after fall
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }

    // Attempt init audio on first user interaction natively
    document.body.addEventListener('click', initAudio, { once: true });
});
