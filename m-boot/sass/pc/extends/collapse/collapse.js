+function ($) {
    'use strict';

    var Collapse = function (elem, options) {
        this.options = $.extend({}, Collapse.DEFAULTS, options);
        this.transitioning = false;

        this.$elem = $(elem);
    };

    Collapse.DEFAULTS = {
        dimension: 'height'
    };

    Collapse.prototype.show = function () {
        if (this.transitioning || this.$elem.hasClass('in')) return;
        this.transitioning = true;

        var dimension = this.options.dimension;
        var scrollSize = $.camelCase(['scroll', dimension].join('-'));

        this.$elem[dimension](0)
            .removeClass('collapse')
            .addClass('collapsing');

        // 设置动画目标
        this.$elem[dimension](this.$elem[0][scrollSize]);

        var _complete = function () {
            this.$elem
                .removeClass('collapsing')
                .addClass('collapse in')[dimension]('');
            this.transitioning = false;
            this.$elem.trigger('shown.bs.collapse');

            return false;
        };
        $.support.transition ?
            this.$elem
                .one($.support.transition.end + '.bs.collapse', $.proxy(_complete, this))
                .emulateTransitionEnd(350)
            : _complete.call(this);
    };

    Collapse.prototype.hide = function () {
        if (this.transitioning || !this.$elem.hasClass('in')) return;
        this.transitioning = true;

        var dimension = this.options.dimension;

        // width/height必须先预设，否则tansition无效
        this.$elem[dimension](this.$elem[dimension]())[0].offsetHeight;
        this.$elem
            .removeClass('collapse in')
            .addClass('collapsing');
        this.$elem[dimension](0);

        var complete = function (e) {
            this.transitioning = false;
            this.$elem
                .trigger('hidden.bs.collapse')
                .removeClass('collapsing')
                .addClass('collapse')
                [dimension]('');

            return false;
        };

        $.support.transition ?
            (this.$elem
                .one($.support.transition.end + '.bs.collapse', $.proxy(complete, this))
                .emulateTransitionEnd(350))
            : complete.call(this);
    };

    Collapse.prototype.toggle = function () {
        this[this.$elem.hasClass('in') ? 'hide' : 'show']();
    };

    $.fn.m_collapse = function (options) {
        return this.each(function () {
            var plugin = $(this).data('mbs.collapse');
            plugin || $(this).data('mbs.collapse', plugin = new Collapse(this, options));

            if (typeof options === 'string') {
                plugin[options]();
            }
        });
    }
}(jQuery);
