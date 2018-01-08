(function (jQuery) {
    jQuery.Album = function (config) {
        var album = this;

        album.setting = {
            album: {
                root: null,
                imgs: [],
                speed: 400,
                interval: 3000,
                itemsPerPage: 1,
                curPage: 1,
                direction: 'H',
                pause: 'hover',
                auto: true
            },
            carousel: {
                root: null,
                imgs: [],
                speed: 400,
                interval: 3000,
                itemsPerPage: 4,
                curPage: 1,
                direction: 'H',
                pause: 'hover',
                auto: false
            }
        };
        $.extend(album.setting, config);

        album.album = new $.Carousel(this.setting.album).buildDomAndInit();
        album.carousel = new $.Carousel(this.setting.carousel).buildDomAndInit();

        var imgEventNum = 0;
        $(document).on('imgLoadedEvent', function (e) {
            imgEventNum++;
            if (imgEventNum === 2) {
                // 非常重要，setTimeout可以让本段代码最后执行
                setTimeout(function () {
                    _carousel_move($(album.album.CarouselContentItem[album.album.curPage * album.album.setting.itemsPerPage]));
                }, 0);
            }
        });

        // 重写prev/next方法,在原方法基础上,增加移动对应轮播位置的方法
        // 因为相册默认隐藏指示栏,因此不用改写to方法
        album.album.next = function () {
            var Carousel = this;

            if (Carousel.moving) return;

            Carousel.curPage = Carousel.curPage + 1;

            _carousel_move($(Carousel.CarouselContentItem[Carousel.curPage * Carousel.setting.itemsPerPage]));

            Carousel.move();

            return Carousel;
        };
        album.album.prev = function () {
            var Carousel = this;

            if (Carousel.moving) return;

            Carousel.curPage = Carousel.curPage - 1;

            _carousel_move($(Carousel.CarouselContentItem[Carousel.curPage * Carousel.setting.itemsPerPage]));

            Carousel.move();

            return Carousel;
        };

        // 添加轮播图图片点击事件,显示相册对应的图片
        album.carousel.root.on('click', 'div.carousel-content li', function (e) {
            if (!$(this).hasClass('active')) {
                _album_move($(album.carousel.CarouselContentItem[$(this).index()]));
                album.carousel.CarouselContentItem.eq($(this).index()).addClass('active').siblings().removeClass('active');
            }
        });

        function _carousel_move(item) {
            var album_index = item.index();
            var album_clone_len = album.album.CarouselContentItem.filter('.clone').length;
            var album_origin_len = album.album.CarouselContentItem.length - album_clone_len;
            var origin_index, carousel_index, carousel_page;

            // 如果是clone元素,找到对应的那个被clone元素的index
            origin_index = item.hasClass('clone')
                ? album_index <= album_clone_len / 2
                    ? (album_origin_len - album_clone_len / 2 + album_index)
                    : (album_index - album_clone_len / 2 - album_origin_len)
                : album_index - album_clone_len / 2;

            // 计算相册对应的图片index和页码
            carousel_index = origin_index + album.carousel.CarouselContentItem.filter('.clone').length / 2;
            carousel_page = Math.floor(carousel_index / album.carousel.setting.itemsPerPage);

            album.carousel.CarouselContentItem.eq(carousel_index).addClass('active').siblings().removeClass('active');

            if (carousel_page !== album.carousel.curPage) {
                album.carousel.curPage = carousel_page;

                album.carousel.move();
            }
        }

        function _album_move(item) {
            var carousel_clone_len = album.carousel.CarouselContentItem.filter('.clone').length;
            var carousel_origin_len = album.carousel.CarouselContentItem.length - carousel_clone_len;
            var carousel_index = item.index();
            var origin_index, album_index, album_page;

            if (item.hasClass('clone')) {
                origin_index = carousel_index <= carousel_clone_len / 2 ? (carousel_origin_len - carousel_clone_len / 2 + carousel_index) : (carousel_index - carousel_clone_len / 2 - carousel_origin_len);
            }

            origin_index = carousel_index - carousel_clone_len / 2;

            album_index = origin_index + album.album.CarouselContentItem.filter('.clone').length / 2;
            album_page = Math.floor(album_index / album.album.setting.itemsPerPage);

            if (album_page !== album.album.curPage) {
                album.album.curPage = album_page;

                album.album.move();
            }
        }

        return album;
    };

    jQuery.Carousel = function (config) {
        this.setting = {
            root: null,
            imgs: [],
            speed: 400,
            interval: 3000,
            itemsPerPage: 2,
            curPage: 1,
            direction: 'H',
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
        this.ControlTop = null;
        this.ControlBottom = null;

        this.itemWidth = 0;
        this.itemHeight = 0;

        this.curPage = this.setting.curPage;
        this.maxPages = 1;

        this.timer = null;
        this.paused = false;
        this.moving = false;

        return this;
    };

    jQuery.Carousel.prototype = {
        // 普通初始化
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
        // 由js生成dom和图片
        buildDomAndInit: function () {
            var Carousel = this,
                _buildDom = function () {
                    Carousel.CarouselContent = $('<div class="carousel-content"></div>');
                    Carousel.CarouselContentUl = $('<ul/>');

                    if (Carousel.setting.direction.toUpperCase() === 'H') {
                        Carousel.CarouselIndicators = $('<ul class="carousel-indicators"/>');

                        Carousel.ControlLeft = $('<a class="carousel-control left"><span class="icon-prev">＜</span></a>');
                        Carousel.ControlRight = $('<a class="carousel-control right"><span class="icon-next">＞</span></a>');

                        Carousel.root.append(Carousel.CarouselContent.append(Carousel.CarouselContentUl), Carousel.CarouselIndicators, Carousel.ControlLeft, Carousel.ControlRight);
                    }

                    if (Carousel.setting.direction.toUpperCase() === 'V') {
                        Carousel.CarouselIndicators = $('<ul class="carousel-indicators"/>');

                        Carousel.ControlTop = $('<a class="carousel-control top"><span class="icon-prev">↑</span></a>');
                        Carousel.ControlBottom = $('<a class="carousel-control bottom"><span class="icon-next">↓</span></a>');

                        Carousel.root.append(Carousel.CarouselContent.append(Carousel.CarouselContentUl), Carousel.CarouselIndicators, Carousel.ControlTop, Carousel.ControlBottom);
                    }
                },
                _buildCarouselImg = function (deferred) {
                    var num = 0,
                        imgs = Carousel.setting.imgs;

                    $.each(imgs, function (i, img) {
                        var _img = $('<img src="' + img.src + '" alt="' + img.alt + '" />');

                        Carousel.CarouselContentUl.append($('<li></li>').append($('<a href="' + (img.url || 'javascript:;') + '"></a>').append(_img)));

                        if (i < Math.ceil(imgs.length / Carousel.setting.itemsPerPage)) {
                            Carousel.CarouselIndicators.append($('<li/>'));
                        }

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
                Carousel.to($(this).index() + 1);

                e.stopPropagation();
                e.preventDefault();
            });

            if (Carousel.setting.direction.toUpperCase() === 'H') {
                prev = Carousel.ControlLeft;
                next = Carousel.ControlRight;
            }

            if (Carousel.setting.direction.toUpperCase() === 'V') {
                prev = Carousel.ControlTop;
                next = Carousel.ControlBottom;
            }

            prev.on('click', function (e) {
                Carousel.prev();

                e.stopPropagation();
                e.preventDefault();
            });
            next.on('click', function (e) {
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
            var Carousel = this;

            if (Carousel.moving) return;

            Carousel.curPage = Carousel.curPage - 1;
            Carousel.move();

            return Carousel;
        },
        next: function () {
            var Carousel = this;

            if (Carousel.moving) return;

            Carousel.curPage = Carousel.curPage + 1;
            Carousel.move();

            return Carousel;
        },
        to: function (pos) {
            var Carousel = this;

            if (Carousel.moving) return;

            if (pos > Carousel.maxPages - 1) {
                pos = Carousel.maxPages - 1;
            }
            if (pos < 0) {
                pos = 0;
            }

            Carousel.curPage = pos;
            Carousel.move();

            return Carousel;
        },
        move: function (direction) {
            var scrollValue,
                Carousel = this,
                setting = Carousel.setting;

            this.moving = true;
            this.pause();

            if (setting.direction.toUpperCase() === 'H') {
                scrollValue = Carousel.curPage * setting.itemsPerPage * Carousel.itemWidth;

                Carousel.CarouselContentUl.animate({
                    'left': '-' + scrollValue + 'px'
                }, setting.speed, function () {
                    if (Carousel.curPage === 0) {
                        Carousel.curPage = Carousel.maxPages - 2;

                        Carousel.CarouselContentUl.css({
                            'left': -Carousel.curPage * setting.itemsPerPage * Carousel.itemWidth
                        });
                    }

                    if (Carousel.curPage === Carousel.maxPages - 1) {
                        Carousel.curPage = 1;

                        Carousel.CarouselContentUl.css({
                            'left': -Carousel.curPage * setting.itemsPerPage * Carousel.itemWidth
                        });
                    }



                    Carousel.moving = false;
                    Carousel.auto();
                });
            }

            if (setting.direction.toUpperCase() === 'V') {
                scrollValue = Carousel.curPage * setting.itemsPerPage * Carousel.itemHeight;

                Carousel.CarouselContentUl.animate({
                    'top': '-' + scrollValue + 'px'
                }, setting.speed, function () {
                    if (Carousel.curPage === 0) {
                        Carousel.curPage = Carousel.maxPages - 2;
                    }

                    if (Carousel.curPage === Carousel.maxPages - 1) {
                        Carousel.curPage = 1;
                    }

                    Carousel.CarouselContentUl.css({
                        'top': -Carousel.curPage * setting.itemsPerPage * Carousel.itemHeight
                    });

                    Carousel.moving = false;
                    Carousel.auto();
                });
            }

            Carousel.CarouselIndicators.find('li').removeClass('active').eq(Carousel.curPage === Carousel.maxPages - 1 ? 0 : Carousel.curPage - 1).addClass('active');

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
        var setting = Carousel.setting;

        setting.direction.toUpperCase() === 'V' ? Carousel.root.addClass('carousel vertical') : Carousel.root.addClass('carousel');

        var first = Carousel.CarouselContentUl.find('li').slice(0, setting.itemsPerPage).clone();
        var last = Carousel.CarouselContentUl.find('li').slice(-setting.itemsPerPage).clone();
        Carousel.CarouselContentUl.append(first.addClass('clone'));
        Carousel.CarouselContentUl.prepend(last.addClass('clone'));

        Carousel.CarouselContentItem = Carousel.CarouselContentUl.find('li');
        Carousel.maxPages = Math.ceil(Carousel.CarouselContentItem.length / setting.itemsPerPage);
        Carousel.CarouselIndicators.find('li').eq(Carousel.curPage).addClass('active');

        // 设置图片宽/高
        if (setting.direction === 'H') {
            Carousel.itemWidth = Carousel.CarouselContent.width() / setting.itemsPerPage;
            Carousel.CarouselContentItem.find('img').width(Carousel.itemWidth);
            Carousel.CarouselContentUl.width(Carousel.itemWidth * Carousel.CarouselContentItem.length);
            // CarouselContentUl是绝对定位，但里面的li不是，会撑开它，从而获取其中图片的最大高度
            Carousel.itemHeight = Carousel.CarouselContentUl.height();
            Carousel.CarouselContent.height(Carousel.itemHeight);
        }
        if (setting.direction === 'V') {
            // 垂直方向，不能使用图片自适应，必须事先设计好图片容器的宽度、图片高宽比
            Carousel.itemWidth = Carousel.CarouselContent.width();
            Carousel.CarouselContent.css('height', '100%');
            Carousel.itemHeight = Carousel.CarouselContent.height() / setting.itemsPerPage;
            Carousel.CarouselContentItem.find('img').width(Carousel.itemWidth).height(Carousel.itemHeight);
            Carousel.CarouselContentUl.height(Carousel.itemHeight * Carousel.CarouselContentItem.length);
        }

        Carousel.bind();
        Carousel.move();
    }

    function Plugin(option) {
        return this.each(function () {
            new jQuery.Carousel($.extend(true, option, {root: this}));
        })
    }

    $.fn.Carousel = Plugin;
})(jQuery);