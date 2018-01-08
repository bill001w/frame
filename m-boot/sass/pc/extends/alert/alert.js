+function ($) {
    'use strict';

    var Alert = function (elem, options) {
        this.options = $.extend({}, Alert.DEFAULTS, options);

        this.$elem = $(elem);
        this.$target = $(this.options.target || this.$elem.closest('.alert-dismissable'));

        this.$elem.on('click.bs.alert', $.proxy(this.close, this));
    };

    Alert.DEFAULTS = {};

    Alert.prototype.close = function () {
        var $parent = this.$target;

        $parent.removeClass('in');

        function removeElement() {
            // 先移除父元素，触发事件，再清除数据缓存等
            $parent.detach().trigger('closed.bs.alert').remove();
        }

        $.support.transition && $parent.hasClass('fade') ?
            $parent
                .one($.support.transition.end, removeElement)
                .emulateTransitionEnd(150) :
            removeElement();

        return false;
    };

    $.fn.m_alert = function (options) {
        return this.each(function () {
            var plugin = $(this).data('mbs.alert');
            plugin || $(this).data('mbs.alert', plugin = new Alert(this, options));

            if (typeof options === 'string') {
                plugin[options]();
            }
        });
    }
}(jQuery);
