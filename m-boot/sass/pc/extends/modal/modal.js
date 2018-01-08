+function ($) {
    'use strict';

    var Modal = function (element, options) {
        this.options = $.extend({}, Modal.DEFAULTS, typeof options === 'object' && options);
        this.$body = $(document.body);
        this.$element = $(element);
        this.$backdrop = null;
        this.isShown = null;
        this.scrollbarWidth = 0;

        this.bind();
    };

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    };

    // 绑定的事件只是点击屏幕时的keyboard和backdrop的事件，不会是toggle
    Modal.prototype.bind = function () {
        if (this.options.keyboard) {
            this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
                e.which == 27 && this.hide()
            }, this));
        }

        $(document)
            .on('focusin.bs.modal', $.proxy(function (e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.trigger('focus');
                }
            }, this));

        // backdrop的z-index小于modal，modal也是铺满屏幕，所以是点击不到backdrop的
        // 所以通过点击modal来模拟点击backdrop
        this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
            // 如果点击是.modal-dialog，则不会后面的操作
            if (e.target !== e.currentTarget) return;

            this.options.backdrop == 'static'
                ? this.$element[0].focus.call(this.$element[0])
                : this.hide.call(this);
        }, this));
    };

    Modal.prototype.show = function () {
        var that = this;

        if (this.isShown) return;
        this.isShown = true;

        this.checkScrollbar();
        this.$body.addClass('modal-open');
        this.setScrollbar();

        // backdrop动画结束才执行传入回调
        this.backdrop(function () {
            var transition = $.support.transition && that.$element.hasClass('fade');

            if (!that.$element.parent().length) {
                that.$element.appendTo(that.$body);
            }

            that.$element
                .show()
                .scrollTop(0);

            // force reflow
            if (transition) that.$element[0].offsetWidth;

            that.$element.addClass('in');

            var e = $.Event('shown.bs.modal');

            transition ?
                // 等待modal-dialog动画结束（只有它有动画）
                that.$element.find('.modal-dialog')
                    .one($.support.transition.end, function () {
                        that.$element.trigger('focus').trigger(e);
                    })
                    .emulateTransitionEnd(300) :
                that.$element.trigger('focus').trigger(e);
        })
    };

    Modal.prototype.hide = function () {
        if (!this.isShown) return;
        this.isShown = false;

        this.$body.removeClass('modal-open');

        this.resetScrollbar();

        this.$element.removeClass('in');

        function hideModal() {
            var that = this;

            this.$element.hide();
            this.backdrop(function () {
                that.$element.trigger('hidden.bs.modal');
            });
        }

        $.support.transition && this.$element.hasClass('fade') ?
            this.$element
                .one($.support.transition.end, $.proxy(hideModal, this))
                .emulateTransitionEnd(300) :
            hideModal();
    };

    Modal.prototype.toggle = function () {
        return this.isShown ? this.hide() : this.show();
    };

    Modal.prototype.backdrop = function (callback) {
        var that = this;
        var animate = this.$element.hasClass('fade') ? 'fade' : '';
        var doAnimate = $.support.transition && animate;

        // 生成backdrop
        if (this.isShown && this.options.backdrop) {
            this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
                .appendTo(this.$body);

            // force reflow
            if (doAnimate) this.$backdrop[0].offsetWidth;

            this.$backdrop.addClass('in');

            if (!callback) return;

            doAnimate ?
                this.$backdrop
                    .one($.support.transition.end, callback)
                    .emulateTransitionEnd(150) :
                callback();

            // 移除dropback
        } else if (!this.isShown && this.$backdrop) {
            var callbackRemove = function () {
                that.$backdrop && that.$backdrop.remove();
                that.$backdrop = null;

                callback && callback();
            };

            this.$backdrop.removeClass('in');

            doAnimate ?
                this.$backdrop
                    .one($.support.transition.end, callbackRemove)
                    .emulateTransitionEnd(150) :
                callbackRemove();

        } else if (callback) {
            callback();
        }
    };

    Modal.prototype.checkScrollbar = function () {
        // window.innerWidth和document.body.clientWidth差别在于如果有滚动条，前者大于后者
        // 这里的意思是，如果没有滚动条，就给body设置padding-right
        if (document.body.clientWidth >= window.innerWidth) return;
        this.scrollbarWidth = this.scrollbarWidth || this.measureScrollbar();

        var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
        if (this.scrollbarWidth) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
    };

    Modal.prototype.resetScrollbar = function () {
        this.$body.css('padding-right', '')
    };

    Modal.prototype.setScrollbar = function () {
        var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10);
        if (this.scrollbarWidth) this.$body.css('padding-right', bodyPad + this.scrollbarWidth);
    };

    Modal.prototype.measureScrollbar = function () {
        var scrollDiv = document.createElement('div')
        scrollDiv.className = 'modal-scrollbar-measure'
        this.$body.append(scrollDiv)
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
        this.$body[0].removeChild(scrollDiv)
        return scrollbarWidth
    };

    $.fn.m_modal = function (options) {
        return this.each(function (i) {
            var plugin = $(this).data('mbs.modal');
            plugin || $(this).data('mbs.modal', plugin = new Modal(this, options));

            if (typeof options === 'string') {
                plugin[options]();
            }
        });
    }
}(jQuery);
