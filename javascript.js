(function (window, document, undefined) {
    window.onload = function () {
        window.Archivist = {};

        Archivist.AudioStream = function (url) {
            this.url = url;
            this.sound = null;
        };

        Archivist.AudioStream.prototype.start = function () {
            var self = this;

            if (!self.sound) {
                self.sound = soundManager.createSound({
                    url: self.url
                });
                self.sound.play();
            }
        };

        Archivist.AudioStream.prototype.stop = function () {
            var self = this;

            if (self.sound) {
                self.sound.unload();
                self.sound = null;
            }
        };

        Archivist.preloadedImages = {};
        Archivist.preloadImage = function (url, callback) {
            var self = this, image;

            if (!self.preloadedImages[url]) {
                image = document.createElement('img');
                image.addEventListener('load', function () {
                    self.preloadedImages[url] = image;
                    if (callback) {
                        callback();
                    }
                });
                image.src = url;
            } else {
                if (callback) {
                    callback();
                }
            }
        };

        Archivist.preloadImages = function (images) {
            var self = this;

            for (var i = 0; i < images.length; i++) {
                self.preloadImage(images[i]);
            }
        };

        var html = document.getElementById('html'),
            nowPlaying = document.getElementById('now_playing'),
            playButton = document.getElementById('play_button'),
            pauseButton = document.getElementById('pause_button'),
            stream = new Archivist.AudioStream('http://192.240.102.195:8689/stream');

        soundManager.setup({
            // where to find flash audio SWFs, as needed
            url: 'assets/flash/',
            preferFlash: true,
            onready: function () {
                playButton.addEventListener('click', function (event) {
                    stream.start();
                    nowPlaying.style.visibility = '';
                    nowPlaying.className = nowPlaying.className + ' flash';
                    event.preventDefault();
                });

                pauseButton.addEventListener('click', function (event) {
                    stream.stop();
                    nowPlaying.style.visibility = 'hidden';
                    nowPlaying.className = nowPlaying.className.replace(' flash', '');
                    event.preventDefault();
                });
            },
            ontimeout: function () {
                // Hrmm, SM2 could not start. Missing SWF? Flash blocked? Show an error, etc.?
            }
        });

        var backgrounds = [
                'assets/images/backgrounds/microphone.png',
                'assets/images/backgrounds/truck.png',
                'assets/images/backgrounds/vinyl.png'
            ],
            currentBackground = -1;

        var nextBackground = function () {
            currentBackground = currentBackground + 1;
            if (currentBackground > backgrounds.length - 1) {
                currentBackground = 0;
            }
            html.style.backgroundImage = 'url("' + backgrounds[currentBackground] + '")';
        };

        window.setTimeout(function () {
            nextBackground();

            Archivist.preloadImage(backgrounds[0], function () {
                Archivist.preloadImages(backgrounds);
            });
        }, 10);

        window.setInterval(function () {
            nextBackground();
        }, 30 * 1000);
    };
})(window, document);
