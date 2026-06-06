// Video player
const video = document.getElementById('mainVideoPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');
const volumeBtn = document.getElementById('volumeBtn');
const volumeSlider = document.getElementById('volumeSlider');
const playbackSpeed = document.getElementById('playbackSpeed');
const skipBackward = document.getElementById('skipBackward');
const skipForward = document.getElementById('skipForward');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// Load user's videos from backend
function loadUserVideos() {
    const grid = document.getElementById('videosGrid');
    grid.innerHTML = '<div class="loader-spinner" style="grid-column:1/-1; margin:2rem auto;"></div>';
    
    // Example API call – replace with your actual endpoint
    fetch('/Datahub/Handlers/UploadHandler.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
        body: 'action=get_user_videos'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.videos.length) {
            renderVideoLibrary(data.videos);
        } else {
            grid.innerHTML = '<div class="empty-message" style="grid-column:1/-1;">No videos uploaded yet.</div>';
        }
    })
    .catch(err => {
        console.error(err);
        grid.innerHTML = '<div class="empty-message" style="grid-column:1/-1;">Error loading videos.</div>';
    });
}

function renderVideoLibrary(videos) {
    const grid = document.getElementById('videosGrid');
    let html = '';
    videos.forEach(videoItem => {
        const fileName = videoItem.name || videoItem.filename;
        const filePath = videoItem.path || videoItem.filepath;
        // thumbnail can be generated from server if available
        html += `
            <div class="video-card" data-path="${filePath}">
                <div class="video-thumb">
                    <i class="ri-video-line"></i>
                </div>
                <div class="video-title">${escapeHtml(fileName)}</div>
            </div>
        `;
    });
    grid.innerHTML = html;
    
    // Attach click events to cards
    document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', () => {
            const path = card.dataset.path;
            playVideo(path);
        });
    });
}

function playVideo(filePath) {
    const videoUrl = `/Datahub/Handlers/UploadHandler.php?preview=1&path=${encodeURIComponent(filePath)}`;
    video.src = videoUrl;
    video.load();
    video.play();
    playPauseBtn.innerHTML = '<i class="ri-pause-line"></i>';
}

// Helper functions (formatTime, etc.)
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Video event listeners
video.addEventListener('loadedmetadata', () => {
    durationSpan.textContent = formatTime(video.duration);
});
video.addEventListener('timeupdate', () => {
    if (video.duration) {
        progressBar.value = (video.currentTime / video.duration) * 100;
        currentTimeSpan.textContent = formatTime(video.currentTime);
    }
});
progressBar.addEventListener('input', () => {
    const seekTime = (progressBar.value / 100) * video.duration;
    video.currentTime = seekTime;
});
playPauseBtn.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        playPauseBtn.innerHTML = '<i class="ri-pause-line"></i>';
    } else {
        video.pause();
        playPauseBtn.innerHTML = '<i class="ri-play-line"></i>';
    }
});
volumeSlider.addEventListener('input', () => {
    video.volume = volumeSlider.value;
    volumeBtn.innerHTML = video.volume === 0 ? '<i class="ri-volume-mute-line"></i>' : '<i class="ri-volume-up-line"></i>';
});
volumeBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    volumeBtn.innerHTML = video.muted ? '<i class="ri-volume-mute-line"></i>' : '<i class="ri-volume-up-line"></i>';
});
playbackSpeed.addEventListener('change', () => {
    video.playbackRate = parseFloat(playbackSpeed.value);
});
skipBackward.addEventListener('click', () => {
    video.currentTime = Math.max(0, video.currentTime - 5);
});
skipForward.addEventListener('click', () => {
    video.currentTime = Math.min(video.duration, video.currentTime + 5);
});
fullscreenBtn.addEventListener('click', () => {
    if (video.requestFullscreen) video.requestFullscreen();
});

document.addEventListener('DOMContentLoaded', () => {
    loadUserVideos();
});

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}


//Music player

const audio = new Audio();
let currentTrack = null;

const playPauseMusic = document.getElementById('playPauseMusic');
const musicProgress = document.getElementById('musicProgress');
const currentMusicTime = document.getElementById('currentMusicTime');
const musicDurationSpan = document.getElementById('musicDuration');
const volumeMusicSlider = document.getElementById('volumeMusicSlider');
const volumeMusicBtn = document.getElementById('volumeMusicBtn');
const playbackSpeedMusic = document.getElementById('playbackSpeedMusic');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');

// Load user's music
function loadUserMusic() {
    const grid = document.getElementById('musicGrid');
    grid.innerHTML = '<div class="loader-spinner" style="grid-column:1/-1; margin:2rem auto;"></div>';
    
    fetch('/Datahub/Handlers/UploadHandler.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
        body: 'action=get_user_music'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.music.length) {
            renderMusicLibrary(data.music);
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
    let html = '';
    tracks.forEach(track => {
        const fileName = track.name || track.filename;
        const filePath = track.path || track.filepath;
        html += `
            <div class="music-card" data-path="${filePath}" data-name="${escapeHtml(fileName)}">
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
            const path = card.dataset.path;
            const name = card.dataset.name;
            playMusic(path, name);
        });
    });
}

function playMusic(filePath, title) {
    const audioUrl = `/Datahub/Handlers/UploadHandler.php?preview=1&path=${encodeURIComponent(filePath)}`;
    audio.src = audioUrl;
    audio.load();
    audio.play();
    playPauseMusic.innerHTML = '<i class="ri-pause-line"></i>';
    trackTitle.textContent = title;
    trackArtist.textContent = 'Local file';
    currentTrack = filePath;
}

function formatMusicTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

audio.addEventListener('loadedmetadata', () => {
    musicDurationSpan.textContent = formatMusicTime(audio.duration);
});
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        musicProgress.value = (audio.currentTime / audio.duration) * 100;
        currentMusicTime.textContent = formatMusicTime(audio.currentTime);
    }
});
musicProgress.addEventListener('input', () => {
    const seekTime = (musicProgress.value / 100) * audio.duration;
    audio.currentTime = seekTime;
});
playPauseMusic.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playPauseMusic.innerHTML = '<i class="ri-pause-line"></i>';
    } else {
        audio.pause();
        playPauseMusic.innerHTML = '<i class="ri-play-line"></i>';
    }
});
volumeMusicSlider.addEventListener('input', () => {
    audio.volume = volumeMusicSlider.value;
    volumeMusicBtn.innerHTML = audio.volume === 0 ? '<i class="ri-volume-mute-line"></i>' : '<i class="ri-volume-up-line"></i>';
});
volumeMusicBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    volumeMusicBtn.innerHTML = audio.muted ? '<i class="ri-volume-mute-line"></i>' : '<i class="ri-volume-up-line"></i>';
});
playbackSpeedMusic.addEventListener('change', () => {
    audio.playbackRate = parseFloat(playbackSpeedMusic.value);
});
audio.addEventListener('ended', () => {
    playPauseMusic.innerHTML = '<i class="ri-play-line"></i>';
    musicProgress.value = 0;
    currentMusicTime.textContent = '0:00';
});

document.addEventListener('DOMContentLoaded', loadUserMusic);