<?php include 'includes/header.php'; ?>
<div class="dashboard-content">
    <div class="page-header">
        <h2><i class="ri-movie-line"></i> <?= __('video_player') ?></h2>
    </div>

    <!-- Video Player Section -->
    <div class="player-section">
        <div class="video-player-container">
            <div class="video-wrapper">
                <video id="mainVideoPlayer" poster="/Datahub/assets/img/video-placeholder.jpg">
                    <source src="" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div class="custom-controls">
                    <button id="playPauseBtn"><i class="ri-play-line"></i></button>
                    <div class="time-display">
                        <span id="currentTime">0:00</span> / <span id="duration">0:00</span>
                    </div>
                    <input type="range" id="progressBar" min="0" max="100" value="0">
                    <div class="volume-control-group">
                        <button id="volumeBtn"><i class="ri-volume-up-line"></i></button>
                        <input type="range" id="volumeSlider" min="0" max="1" step="0.01" value="0.8">
                    </div>
                    <select id="playbackSpeed">
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1" selected>1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                    </select>
                    <button id="skipBackward"><i class="ri-replay-5-line"></i></button>
                    <button id="skipForward"><i class="ri-forward-5-line"></i></button>
                    <button id="fullscreenBtn"><i class="ri-fullscreen-line"></i></button>
                </div>
            </div>
        </div>
    </div>

    <!-- User's Video Library -->
    <div class="library-section">
        <h3><i class="ri-video-line"></i><?= __('my_videos') ?></h3>
        <div class="videos-grid" id="videosGrid">
            <!-- Loader -->
            <div class="loader-spinner" style="grid-column:1/-1; margin:2rem auto;"></div>
        </div>
    </div>
</div>


<script>
    window.translations = {
    // Video library
    'no_videos_uploaded': '<?= __('no_videos_uploaded') ?>',
    'error_loading_videos': '<?= __('error_loading_videos') ?>',
};
</script>
<script src="/Datahub/assets/js/players.js"></script>
<?php include 'includes/footer.php'; ?>