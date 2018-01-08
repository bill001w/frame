+function ($) {
    'use strict';

    var Dropdown = function (elem, options) {
        this.options = $.extend({}, Dropdown.DEFAULTS, options);

        this.$elem = $(elem);
        this.$target = $(this.options.target || $(elem).closest('.dropdown'));

        if (this.options.backdrop && !$(elem).parents('.dropdown').find('.dropdown-backdrop').length) {
            this.$backdrop = $('<div class="dropdown-backdrop"/>')
                .insertAfter(this.$elem)
                .hide();

            this.bind();
        }
    };

    Dropdown.DEFAULTS = {
        backdrop: false
    };

    Dropdown.prototype.bind = function () {
        var self = this;

        this.$backdrop.on('click', function (e) {
            $(this).removeClass('in').hide();

            self.$target.hasClass('open') && self.toggle();

            return false;
        });
    };

    Dropdown.prototype.toggle = function () {
        var $this = $(this);
        if ($this.is('.disabled, :disabled')) return;

        var isActive = this.$target.hasClass('open');

        this.$target.toggleClass('open');

        if (!isActive) {
            this.$target
                .trigger('focus');

            this.$backdrop && this.$backdrop.show().addClass('fade in');
        } else {
            this.$backdrop && this.$backdrop.remove('in');
        }
    };

    $.fn.m_dropDown = function (options) {
        return this.each(function (i) {
            var plugin = $(this).data('mbs.dropdown');
            plugin || $(this).data('mbs.dropdown', plugin = new Dropdown(this, options));

            if (typeof options === 'string') {
                plugin[options]();
            }
        });
    }
}(jQuery);
