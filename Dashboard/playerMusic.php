<?php include 'includes/header.php'; ?>
<div class="dashboard-content">
    <div class="page-header">
        <h2><i class="ri-headphone-line"></i> <?= __('music_player') ?></h2>
    </div>

        <!-- Music Player Section -->
        <div class="player-section">
            <div class="music-player-container">
                <div class="album-art" id="albumArt">
                    <i class="ri-music-2-line"></i>
                </div>
                <div class="track-info">
                <h3 id="trackTitle"><?= __('no_track_selected') ?></h3>
                <p id="trackArtist"><?= __('select_from_library') ?></p>
            </div>
            <div class="player-controls">
                <button id="prevTrack" disabled><i class="ri-skip-back-line"></i></button>
                <button id="skipBack10" title="<?= __('back_10_seconds') ?>" onclick="skipBackward10()"><i class="ri-replay-10-line"></i></button>
                <button id="playPauseMusic"><i class="ri-play-line"></i></button>
                <button id="skipForward10" title="<?= __('forward_10_seconds') ?>" onclick="skipForward10()"><i class="ri-forward-10-line"></i></button>
                <button id="nextTrack" disabled><i class="ri-skip-forward-line"></i></button>
                <button id="volumeMusicBtn"><i class="ri-volume-up-line"></i></button>
                <input type="range" id="volumeMusicSlider" min="0" max="1" step="0.01" value="0.8">
                <select id="playbackSpeedMusic">
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1" selected>1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                </select>
            </div>
        <div class="progress-container">
            <span id="currentMusicTime">0:00</span>
            <input type="range" id="musicProgress" min="0" max="100" value="0">
            <span id="musicDuration">0:00</span>
        </div>
    </div>

    <!-- User's Music Library -->
    <div class="library-section">
        <h3><i class="ri-music-line"></i> My Music</h3>
        <div class="music-grid" id="musicGrid">
            <div class="loader-spinner" style="grid-column:1/-1; margin:2rem auto;"></div>
        </div>
    </div>
</div>

<script>
    window.translations = {
    'no_music_uploaded': '<?= __('no_music_uploaded') ?>',
    'error_loading_music': '<?= __('error_loading_music') ?>',
};
</script>
<script src="/Datahub/assets/js/musicPlayer.js"></script>
<?php include 'includes/footer.php'; ?>