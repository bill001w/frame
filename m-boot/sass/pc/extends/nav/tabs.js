+function ($) {
    'use strict';

    var Tab = function (element, options) {
        this.options = $.extend({}, Tab.DEFAULTS, typeof options === 'object' && options);
        this.element = $(element);
        this.$target = $(this.options.target);

        this.bind();
    };

    Tab.DEFAULTS = {
        target: ''
    };

    Tab.prototype.bind = function () {
        var self = this;

        this.element.on('click.m_tabs', function (e) {
            self.activite();

            return false;
        });
    };

    Tab.prototype.activite = function () {
        if (this.element.parent('li').hasClass('active')) return;

        var $ul = this.element.closest('ul:not(.dropdown-menu)');
        $ul.find('>.active')
            .removeClass('active')
            .end()
            .find('> .dropdown > .dropdown-menu > .active')
            .removeClass('active');
        $ul.find('>.dropdown').removeClass('open');

        this.element.parent().addClass('active');
        if (this.element.parents('.dropdown-menu')) {
            this.element.closest('li.dropdown').addClass('active');
        }

        var $target = this.$target.find(this.element.attr('href'));
        var transition = $.support.transition && $target.hasClass('fade');
        if (!$target.length) {
            $target = this.$target.children().eq(this.element.index());
        }

        if (transition) {
            $target.siblings().removeClass('in').hide()
                .end()
                .show().addClass('in');
            $target
                .one($.support.transition.end, $.proxy(next, this))
                .emulateTransitionEnd(150);
        } else {
            $target.siblings().removeClass('in').hide()
                .end()
                .show().addClass('in');
            $.proxy(next, this);
        }

        function next() {
            if (transition) {
                this.element[0].offsetWidth;
            } else {
                $target.removeClass('fade');
            }
        }
    };

    $.fn.m_tabs = function (options) {
        return this.each(function () {
            var plugin = $(this).data('mbs.tab');
            plugin || $(this).data('mbs.tab', plugin = new Tab(this, options));

            if (typeof options === 'string') {
                plugin[options]();
            }
        });
    }
}(jQuery);
