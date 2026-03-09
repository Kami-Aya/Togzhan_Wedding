document.addEventListener('DOMContentLoaded', () => {
    // --- 1. МУЗЫКА ЛОГИКАСЫ ---
    const music = document.getElementById("bg-music");
    const musicBtn = document.getElementById("music-btn");
    const icon = document.getElementById("music-icon");
    let isPlaying = false;

    if (musicBtn && music) {
        musicBtn.addEventListener('click', () => {
            if (isPlaying) {
                music.pause();
                icon.innerText = "▶";
            } else {
                music.play().catch(e => console.error("Музыка қатесі:", e));
                icon.innerText = "II";
            }
            isPlaying = !isPlaying;
        });
    }

    // --- 2. ТАЙМЕР ЛОГИКАСЫ ---
    function updateTimer() {
        const target = new Date("August 5, 2026 18:00:00").getTime();
        const now = new Date().getTime();
        const diff = target - now;

        const elements = {
            d: document.getElementById("days"),
            h: document.getElementById("hours"),
            m: document.getElementById("minutes"),
            s: document.getElementById("seconds")
        };

        if (diff > 0) {
            const time = {
                d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((diff % (1000 * 60)) / 1000)
            };

            Object.keys(elements).forEach(key => {
                if (elements[key]) elements[key].innerText = time[key].toString().padStart(2, '0');
            });
        }
    }
    setInterval(updateTimer, 1000);
    updateTimer();

    // --- 3. RSVP (TELEGRAM & GOOGLE SHEETS) ---
    const rsvpForm = document.getElementById('rsvp-form');
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwsTGP5-QP4ue9ltMwnDO3a48axlJvsktS2yH_T-xkZDEpD7WrLLarEOASwWzKhLl7tmw/exec';

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', e => {
            e.preventDefault();
            const status = document.getElementById('form-status');
            status.innerHTML = "⌛ Жіберілуде...";

            const name = document.getElementById('name').value;
            const attendance = document.querySelector('input[name="attendance"]:checked').value;
            const guests = document.getElementById('guests')?.value || "1";

            // A. Google Sheets-ке жіберу
            const sheetPromise = fetch(scriptURL, { method: 'POST', body: new FormData(rsvpForm) });

            // B. Telegram-ға жіберу
            const token = '8784948066:AAGG0z7R0iBa0CQO74deRq_7RecqyeltXmM';
            const chatId = '565766719';
            const message = `<b>🔔 Жаңа жауап!</b>\n<b>👤 Есімі:</b> ${name}\n<b>✅ Таңдауы:</b> ${attendance}\n<b>👥 Адам саны:</b> ${guests}`;
            const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}&parse_mode=html`;
            const telegramPromise = fetch(telegramUrl);

            // Екеуі де біткенде нәтижені көрсету
            Promise.all([sheetPromise, telegramPromise])
                .then(() => {
                    status.innerHTML = "✅ Жауабыңыз қабылданды! Рақмет.";
                    rsvpForm.reset();
                    document.getElementById('person-count-group').style.display = 'none';
                })
                .catch(() => {
                    status.innerHTML = "❌ Қате кетті. Қайта көріңіз.";
                });
        });

        // "Келемін/Келмеймін" таңдауын бақылау
        document.querySelectorAll('input[name="attendance"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const guestGroup = document.getElementById('person-count-group');
                if (guestGroup) {
                    guestGroup.style.display = (this.value === 'Келемін') ? 'block' : 'none';
                }
            });
        });
    }
});

