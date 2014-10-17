(function (window, document, undefined) {
    window.onload = function () {
        window.Archivist = {};

        // Wrapper for addEventListener vs attachEvent
        // Shamelessly stolen from http://ejohn.org/projects/flexible-javascript-events/
        Archivist.addEvent = function (object, eventType, handler) {
            if (object.attachEvent) {
                object['e' + eventType + handler] = handler;
                object[eventType + handler] = function () {
                    object['e' + eventType + handler](window.event);
                };
                object.attachEvent('on' + eventType, object[eventType + handler]);
            } else {
                object.addEventListener(eventType, handler, false);
            }
        };

        // Wrapper for event.preventDefault vs event.returnValue = false
        Archivist.preventDefault = function (event) {
            event.returnValue = false;
            if (event.preventDefault) {
                event.preventDefault();
            }
        };

        Archivist.AudioStream = function (url) {
            var self = this;

            self.url = url;
            self.reloadInterval = 30 * 60 * 1000;

            soundManager.setup({
                url: 'assets/flash/',
                preferFlash: true,
                onready: function () {
                    self.sound = self.load();

                    window.setInterval(function () {
                        self.reload();
                    }, self.reloadInterval);
                },
                ontimeout: function () {
                    // Hrmm, SM2 could not start. Missing SWF? Flash blocked? Show an error, etc.?
                }
            });
        };

        Archivist.AudioStream.prototype.start = function () {
            var self = this;

            self.sound.setVolume(100);
        };

        Archivist.AudioStream.prototype.stop = function () {
            var self = this;

            self.sound.setVolume(0);
        };

        Archivist.AudioStream.prototype.load = function (callback) {
            var self = this;

            return soundManager.createSound({
                url: self.url,
                volume: 0,
                autoPlay: true,
                onload: function() {
                    if (callback) {
                        callback();
                    }
                }
            });
        };

        Archivist.AudioStream.prototype.reload = function () {
            var self = this;

            var replacement = self.load(function () {
                var originalSound = self.sound,
                    originalVolume = self.sound.volume;

                originalSound.setVolume(0);
                self.sound = replacement;
                self.sound.setVolume(originalVolume);

                originalSound.stop();
                originalSound.unload();
                originalSound = null;
            });
        };

        Archivist.preloadedImages = {};
        Archivist.preloadImage = function (url, callback) {
            var self = this, image;

            if (!self.preloadedImages[url]) {
                image = document.createElement('img');
                Archivist.addEvent(image, 'load', function () {
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

        var html = document.documentElement,
            body = document.body,
            strip = document.getElementById('strip'),
            nowPlaying = document.getElementById('now_playing'),
            playButton = document.getElementById('play_button'),
            pauseButton = document.getElementById('pause_button'),
            stream = new Archivist.AudioStream('http://50.7.76.250:8765/stream');

        Archivist.addEvent(playButton, 'click', function (event) {
            stream.start();
            nowPlaying.style.visibility = '';
            playButton.style.display = 'none';
            pauseButton.style.display = 'block';
            Archivist.preventDefault(event);
        });

        Archivist.addEvent(pauseButton, 'click', function (event) {
            stream.stop();
            nowPlaying.style.visibility = 'hidden';
            pauseButton.style.display = 'none';
            playButton.style.display = 'block';
            Archivist.preventDefault(event);
        });

        // Hide pause button on load to fix iepngfix related error
        pauseButton.style.display = 'none';

        var backgrounds = [
                'assets/images/backgrounds/microphone.jpg',
                'assets/images/backgrounds/truck.jpg',
                'assets/images/backgrounds/vinyl.jpg'
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

        var fixStripHeight = function () {
            strip.style.height = '';
            strip.style.height =
                Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
                + 'px';
        };

        fixStripHeight();
        window.onresize = fixStripHeight;
    };
})(window, document);
