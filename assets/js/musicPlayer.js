// Music Player Variables
const audio = new Audio();
let currentTrack = null;
let currentPlaylist = [];
let currentTrackIndex = -1;

// DOM Elements
const playPauseMusic = document.getElementById('playPauseMusic');
const musicProgress = document.getElementById('musicProgress');
const currentMusicTime = document.getElementById('currentMusicTime');
const musicDurationSpan = document.getElementById('musicDuration');
const volumeMusicSlider = document.getElementById('volumeMusicSlider');
const volumeMusicBtn = document.getElementById('volumeMusicBtn');
const playbackSpeedMusic = document.getElementById('playbackSpeedMusic');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const prevTrackBtn = document.getElementById('prevTrack');
const nextTrackBtn = document.getElementById('nextTrack');

// Helper Functions
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatMusicTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateMusicNavigationButtons() {
    if (prevTrackBtn) {
        prevTrackBtn.disabled = currentPlaylist.length === 0;
    }
    if (nextTrackBtn) {
        nextTrackBtn.disabled = currentPlaylist.length === 0;
    }
}

// Load user's music
function loadUserMusic() {
    const grid = document.getElementById('musicGrid');
    if (!grid) return;
    
    grid.innerHTML = '<div class="loader-spinner" style="grid-column:1/-1; margin:2rem auto;"></div>';
    
    fetch('/Datahub/Handlers/UploadHandler.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
        body: 'action=get_user_music'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.music && data.music.length) {
            currentPlaylist = data.music;
            renderMusicLibrary(currentPlaylist);
            updateMusicNavigationButtons();
        } else {
            grid.innerHTML = '<div class="empty-message" style="grid-column:1/-1;">No music uploaded yet.</div>';
        }
    })
    .catch(err => {
        console.error(err);
        grid.innerHTML = '<div class="empty-message" style="grid-column:1/-1;">Error loading music.</div>';
    });
}

function renderMusicLibrary(tracks) {
    const grid = document.getElementById('musicGrid');
    if (!grid) return;
    
    let html = '';
    tracks.forEach((track, index) => {
        const fileName = track.name || track.filename;
        const filePath = track.path || track.filepath;
        const isPlaying = currentTrackIndex === index ? 'now-playing' : '';
        html += `
            <div class="music-card ${isPlaying}" data-path="${filePath}" data-name="${escapeHtml(fileName)}" data-index="${index}">
                <div class="music-icon"><i class="ri-music-line"></i></div>
                <div class="music-info">
                    <div class="music-title">${escapeHtml(fileName)}</div>
                </div>
            </div>
        `;
    });
    grid.innerHTML = html;
    
    document.querySelectorAll('.music-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = parseInt(card.dataset.index);
            playMusicByIndex(index);
        });
    });
}

function playMusicByIndex(index) {
    if (!currentPlaylist[index]) return;
    
    const track = currentPlaylist[index];
    const filePath = track.path || track.filepath;
    const fileName = track.name || track.filename;
    
    currentTrackIndex = index;
    playMusic(filePath, fileName);
    updateMusicNavigationButtons();
    
    // Update now playing highlight
    document.querySelectorAll('.music-card').forEach((card, idx) => {
        if (idx === index) {
            card.classList.add('now-playing');
        } else {
            card.classList.remove('now-playing');
        }
    });
}

function playMusic(filePath, title) {
    const audioUrl = `/Datahub/Handlers/UploadHandler.php?download=1&path=${encodeURIComponent(filePath)}`;
    audio.src = audioUrl;
    audio.load();
    audio.play();
    playPauseMusic.innerHTML = '<i class="ri-pause-line"></i>';
    trackTitle.textContent = title;
    trackArtist.textContent = 'Local file';
    currentTrack = filePath;
}

function playNextTrack() {
    if (currentPlaylist.length === 0) return;
    
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= currentPlaylist.length) {
        nextIndex = 0; // Loop to first
    }
    playMusicByIndex(nextIndex);
}

function playPrevTrack() {
    if (currentPlaylist.length === 0) return;
    
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) {
        prevIndex = currentPlaylist.length - 1; // Loop to last
    }
    playMusicByIndex(prevIndex);
}

function skipBackward10() {
    audio.currentTime = Math.max(0, audio.currentTime - 10);
}

function skipForward10() {
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
}

// Audio Event Listeners
audio.addEventListener('loadedmetadata', () => {
    musicDurationSpan.textContent = formatMusicTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        musicProgress.value = (audio.currentTime / audio.duration) * 100;
        currentMusicTime.textContent = formatMusicTime(audio.currentTime);
    }
});

audio.addEventListener('ended', () => {
    playNextTrack();
});

// Control Event Listeners
if (musicProgress) {
    musicProgress.addEventListener('input', () => {
        const seekTime = (musicProgress.value / 100) * audio.duration;
        audio.currentTime = seekTime;
    });
}

if (playPauseMusic) {
    playPauseMusic.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playPauseMusic.innerHTML = '<i class="ri-pause-line"></i>';
        } else {
            audio.pause();
            playPauseMusic.innerHTML = '<i class="ri-play-line"></i>';
        }
    });
}

if (prevTrackBtn) {
    prevTrackBtn.addEventListener('click', playPrevTrack);
}

if (nextTrackBtn) {
    nextTrackBtn.addEventListener('click', playNextTrack);
}

if (volumeMusicSlider) {
    volumeMusicSlider.addEventListener('input', () => {
        audio.volume = volumeMusicSlider.value;
        if (volumeMusicBtn) {
            volumeMusicBtn.innerHTML = audio.volume === 0 ? '<i class="ri-volume-mute-line"></i>' : '<i class="ri-volume-up-line"></i>';
        }
    });
}

if (volumeMusicBtn) {
    volumeMusicBtn.addEventListener('click', () => {
        audio.muted = !audio.muted;
        volumeMusicBtn.innerHTML = audio.muted ? '<i class="ri-volume-mute-line"></i>' : '<i class="ri-volume-up-line"></i>';
    });
}

if (playbackSpeedMusic) {
    playbackSpeedMusic.addEventListener('change', () => {
        audio.playbackRate = parseFloat(playbackSpeedMusic.value);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUserMusic();
});