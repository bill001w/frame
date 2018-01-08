(function ($) {
    $.zoomOutCarousel = function (config) {
        this.setting = {
            root: null,
            imgs: [],
            speed: 400,
            interval: 3000,
            curIndex: 1,
            pause: 'hover',
            auto: true
        };

        $.extend(this.setting, config);

        this.root = $(this.setting.root);
        this.CarouselContent = null;
        this.CarouselContentUl = null;
        this.CarouselContentItem = null;
        this.CarouselIndicators = null;
        this.ControlLeft = null;
        this.ControlRight = null;

        this.curIndex = this.setting.curIndex - 2;

        this.timer = null;
        this.paused = false;
        this.moving = false;

        return this;
    };

    $.zoomOutCarousel.prototype = {
        init: function () {
            var Carousel = this;

            Carousel.CarouselContent = Carousel.root.find('.carousel-content');
            Carousel.CarouselContentUl = Carousel.root.find('.carousel-content>ul');
            Carousel.CarouselContentItem = Carousel.root.find('.carousel-content>ul>li');
            Carousel.CarouselIndicators = Carousel.root.find('.carousel-indicators');
            Carousel.ControlLeft = Carousel.root.find('.carousel-control .left');
            Carousel.ControlRight = Carousel.root.find('.carousel-control .right');

            _init(Carousel);

            return this;
        },
        buildDomAndInit: function () {
            var Carousel = this,
                _buildDom = function () {
                    Carousel.CarouselContent = $('<div class="carousel-content"></div>');
                    Carousel.CarouselContentUl = $('<ul/>');
                    Carousel.CarouselIndicators = $('<ul class="carousel-indicators"/>');
                    Carousel.ControlLeft = $('<a class="carousel-control left"><span class="icon-prev">＜</span></a>');
                    Carousel.ControlRight = $('<a class="carousel-control right"><span class="icon-next">＞</span></a>');

                    Carousel.root.append(Carousel.CarouselContent.append(Carousel.CarouselContentUl), Carousel.CarouselIndicators, Carousel.ControlLeft, Carousel.ControlRight);
                },
                _buildCarouselImg = function (deferred) {
                    var num = 0,
                        imgs = Carousel.setting.imgs;

                    $.each(imgs, function (i, img) {
                        var _img = $('<img src="' + img.src + '" alt="' + img.alt + '" />');

                        Carousel.CarouselContentUl.append($('<li></li>').append($('<a href="' + (img.url || 'javascript:;') + '"></a>').append(_img)));
                        Carousel.CarouselIndicators.append($('<li/>'));

                        _img.load(function (evt) {
                            num++;

                            if (num === imgs.length) {
                                var imgLoadedEvent = $.Event('imgLoadedEvent');
                                Carousel.root.trigger(imgLoadedEvent);

                                deferred.resolve('imgs were loaded.');
                            }
                        });
                    });
                };

            (function () {
                var deferred = new $.Deferred();

                _buildDom();
                _buildCarouselImg(deferred);

                return deferred.promise();
            })()
                .then(function () {
                    _init(Carousel);
                });

            return Carousel;
        },
        bind: function () {
            var Carousel = this;
            var prev, next;

            Carousel.CarouselIndicators.find('li').on('click', function (e) {
                Carousel.to($(this).index());

                e.stopPropagation();
                e.preventDefault();
            });
            Carousel.ControlLeft.on('click', function (e) {
                Carousel.prev();

                e.stopPropagation();
                e.preventDefault();
            });
            Carousel.ControlRight.on('click', function (e) {
                Carousel.next();

                e.stopPropagation();
                e.preventDefault();
            });
            Carousel.CarouselContentUl
                .on('mouseenter', $.proxy(this.pause, this))
                .on('mouseleave', $.proxy(this.auto, this));

            if ($.mobile.support.touch) {
                $(Carousel.root).on('swipeleft', function (e) {
                    Carousel.next();

                    e.stopPropagation();
                    e.preventDefault();
                });

                $(Carousel.root).on('swiperight', function (e) {
                    Carousel.prev();

                    e.stopPropagation();
                    e.preventDefault();
                });
            }

            return this;
        },
        prev: function () {
            if (this.moving) return false;

            this.curIndex = _getIndex(this.curIndex - 1, this.CarouselContentItem.length);
            this.prevIndex = _getIndex(this.curIndex - 1, this.CarouselContentItem.length);
            this.nextIndex = _getIndex(this.curIndex + 1, this.CarouselContentItem.length);

            this.move();

            return this;
        },
        next: function () {
            if (this.moving) return false;

            this.curIndex = _getIndex(this.curIndex + 1, this.CarouselContentItem.length);
            this.prevIndex = _getIndex(this.curIndex - 1, this.CarouselContentItem.length);
            this.nextIndex = _getIndex(this.curIndex + 1, this.CarouselContentItem.length);

            this.move();

            return this;
        },
        to: function (pos) {
            var Carousel = this;

            if (Carousel.moving) return;

            this.curIndex = _getIndex(pos, this.CarouselContentItem.length);
            this.prevIndex = _getIndex(this.curIndex - 1, this.CarouselContentItem.length);
            this.nextIndex = _getIndex(this.curIndex + 1, this.CarouselContentItem.length);

            Carousel.move();

            return Carousel;
        },
        move: function () {
            var that = this;

            this.moving = true;
            this.pause();

            this.CarouselContentItem.removeClass('carousel-zoomout-current carousel-zoomout-pre carousel-zoomout-next');
            $(this.CarouselContentItem[this.curIndex]).addClass('carousel-zoomout-current');
            $(this.CarouselContentItem[this.prevIndex]).addClass('carousel-zoomout-pre');
            $(this.CarouselContentItem[this.nextIndex]).addClass('carousel-zoomout-next');

            this.CarouselIndicators.find('li').removeClass('active').eq(this.curIndex).addClass('active');

            if ($.support.transition) {
                $(this.CarouselContentItem[this.curIndex])
                    .one($.support.transition.end, function () {
                        that.moving = false;
                        that.auto();
                    })
                    .emulateTransitionEnd(500)
            } else {
                that.moving = false;
                that.auto();
            }

            return this;
        },
        auto: function () {
            this.timer && clearInterval(this.timer);
            this.paused = false;

            this.setting.auto
            && (this.timer = setInterval($.proxy(this.next, this), this.setting.interval));

            return this;
        },
        pause: function () {
            this.timer = clearInterval(this.timer);
            this.paused = true;

            return this
        }
    };

    function _init(Carousel) {
        Carousel.root.addClass('carousel-zoomout');
        Carousel.CarouselContentItem = Carousel.CarouselContentUl.find('li');
        Carousel.CarouselIndicators.find('li').eq(Carousel.curPage).addClass('active');

        Carousel.bind();
        Carousel.next();
    }

    function _getIndex(index, length) {
        return index <= length - 1
            ? index < 0
                ? length - 1
                : index
            : 0;
    }

    $.fn.extend({
        zoomOutCarousel: function (options) {
            options.root = $(this);

            new $.zoomOutCarousel(options);
        }
    });
})(jQuery);
