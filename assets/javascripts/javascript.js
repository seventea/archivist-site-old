(function (window, document, undefined) {
    window.onload = function () {
        window.Archivist = {};

        Archivist.Ui = {
            html: document.documentElement,
            body: document.body,
            strip: document.getElementById('strip'),
            nowPlaying: document.getElementById('now_playing'),
            loading: document.getElementById('loading'),
            playButton: document.getElementById('play_button'),
            pauseButton: document.getElementById('pause_button'),
            streamError: document.getElementById('stream_error')
        };

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

        Archivist.AudioStream = function (url, callback) {
            var self = this;

            self.url = url;
            self.playing = false;

            soundManager.setup({
                url: 'assets/flash/',
                preferFlash: true,
                onready: function () {
                    self.sound = self.load(callback);
                },
                ontimeout: function () {
                    Archivist.Ui.streamError.style.display = 'block';
                    Archivist.Ui.loading.style.display = 'none';
                }
            });
        };

        Archivist.AudioStream.prototype.start = function () {
            var self = this;

            self.sound.setVolume(100);
            self.playing = true;
        };

        Archivist.AudioStream.prototype.stop = function () {
            var self = this;

            self.sound.setVolume(0);
            self.playing = false;
        };

        Archivist.AudioStream.prototype.load = function (callback) {
            var self = this;

            return soundManager.createSound({
                url: self.url,
                volume: 0,
                autoPlay: true,
                onload: function () {
                    if (callback) {
                        callback();
                    }
                },
                whileloading: function () {
                    if (!this.loaded && !this.loadinghack && this.bytesLoaded > 300000) {
                        this.loadinghack = true;
                        if (callback) {
                            callback();
                        }
                    }
                }
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

        // Hide pause button on load to fix iepngfix related error
        Archivist.Ui.playButton.style.display = 'none';
        Archivist.Ui.pauseButton.style.display = 'none';

        var stream = new Archivist.AudioStream('http://50.7.76.250:8765/stream', function () {
            Archivist.addEvent(Archivist.Ui.playButton, 'click', function (event) {
                stream.start();
                Archivist.Ui.nowPlaying.style.visibility = '';
                Archivist.Ui.playButton.style.display = 'none';
                Archivist.Ui.pauseButton.style.display = 'block';
                Archivist.preventDefault(event);
            });

            Archivist.addEvent(Archivist.Ui.pauseButton, 'click', function (event) {
                stream.stop();
                Archivist.Ui.nowPlaying.style.visibility = 'hidden';
                Archivist.Ui.pauseButton.style.display = 'none';
                Archivist.Ui.playButton.style.display = 'block';
                Archivist.preventDefault(event);
            });

            Archivist.addEvent(document, 'keydown', function (event) {
                var keyCode = event.keyCode || event.which;

                if (keyCode == 32) {
                    if (stream.playing) {
                        stream.stop();
                        Archivist.Ui.nowPlaying.style.visibility = 'hidden';
                        Archivist.Ui.pauseButton.style.display = 'none';
                        Archivist.Ui.playButton.style.display = 'block';
                        Archivist.preventDefault(event);
                    } else {
                        stream.start();
                        Archivist.Ui.nowPlaying.style.visibility = '';
                        Archivist.Ui.playButton.style.display = 'none';
                        Archivist.Ui.pauseButton.style.display = 'block';
                        Archivist.preventDefault(event);
                    }
                }
            });

            Archivist.Ui.loading.style.display = 'none';
            Archivist.Ui.playButton.style.display = 'block';
        });

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
            Archivist.Ui.html.style.backgroundImage = 'url("' + backgrounds[currentBackground] + '")';
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
            Archivist.Ui.strip.style.height = '';
            Archivist.Ui.strip.style.height =
                Math.max(Archivist.Ui.body.scrollHeight,
                    Archivist.Ui.body.offsetHeight,
                    Archivist.Ui.html.clientHeight,
                    Archivist.Ui.html.scrollHeight,
                    Archivist.Ui.html.offsetHeight)
                + 'px';
        };

        fixStripHeight();
        window.onresize = fixStripHeight;
    };
})(window, document);
