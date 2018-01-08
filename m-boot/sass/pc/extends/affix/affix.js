+function ($) {
    'use strict';

    var Affix = function (elem, options) {
        this.options = $.extend({}, Affix.DEFAULTS, options);
        this.$element = $(elem);
        this.affixed = null;
        this.elementOriginTop = this.$element.offset().top;

        this.bind();
        this.checkPosition();
    };

    Affix.RESET = 'affix affix-top affix-bottom';
    Affix.DEFAULTS = {
        offset: 0
    };

    Affix.prototype.bind = function () {
        // 对滚动参考目标绑定事件
        $(document)
            .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
            // 因为点击浮标内的导航，最终会冒泡到window上
            .on('click.bs.affix.data-api', $.proxy(this.checkPositionWithEventLoop, this));
    };

    Affix.prototype.checkPosition = function () {
        // 如果浮标为不可见元素，不做进一步处理
        if (!this.$element.is(':visible')) return;

        // 浮标的位置坐标
        var element_position = this.$element.offset();
        // 参考目标滚动条位置
        var reference_scrollHeight = $(document).height();
        var reference_scrollTop = $(document).scrollTop();
        // 滚动方向
        var direction = reference_scrollTop >= this.lastPosition;
        this.lastPosition = reference_scrollTop;
        // 获取用户设置的top/bottom值
        var offsetTop = this.options.offset.top;
        var offsetBottom = this.options.offset.bottom;
        if (typeof this.options.offset != 'object') offsetBottom = offsetTop = this.options.offset;
        if (typeof offsetTop == 'function') offsetTop = this.options.offset.top();
        if (typeof offsetBottom == 'function') offsetBottom = this.options.offset.bottom();

        // 如果用户设置了bottom
        var affix = offsetBottom != null && (
            // 当满足bottom条件
            (element_position.top + this.$element.height() >= reference_scrollHeight - offsetBottom) &&
            // 如果向下滚动（向下滚动又满足bottom条件，那么肯定优先bottom）
            (direction ||
            // 或向上滚动且浮标顶部位置小于top（回位）
            reference_scrollTop + offsetTop + this.$element.height() > reference_scrollHeight - offsetBottom)
            // 返回bottom
        ) ? 'bottom' :
            // 用户设置的top要求，如果“没有满足”这个要求，返回top。否则（满足top条件），返回false（后面会附加样式）
            offsetTop != null && (element_position.top - reference_scrollTop <= offsetTop &&
                // 如果向下滚动，不存在退出fix问题
                (direction ||
                // 或向上滚动且浮标顶部位置小于top（回位）
                element_position.top >= this.elementOriginTop)
            ) ? false : 'top';

        // 本次和上次浮标类型相同，不做进一步处理
        if (this.affixed === affix) return;
        this.affixed = affix;

        // 样式类名，如果affix为false，样式就是affix
        var affixType = 'affix' + (affix ? '-' + affix : '');

        var e = $.Event(affixType + '.bs.affix');
        this.$element.trigger(e);
        if (e.isDefaultPrevented()) return;

        this.$element
            .removeClass(Affix.RESET)
            // 功能核心，添加样式，事实上只有affix一个样式，但不影响
            .addClass(affixType)
            .trigger($.Event(affixType.replace('affix', 'affixed')));

        // 如果上次浮标类型为bottom，这次不是（上面判断），则清除top。
        if (!this.affix) this.$element.css({
            'position': '',
            'top': offsetTop
        });
        // 如果满足bottom条件，通过offset.top设置定位（offset方法会自动设置浮标为相对定位）
        if (affix === 'bottom') {
            this.$element.offset({
                top: reference_scrollHeight - this.$element.height() - offsetBottom
            });
        }
        // 如果满足top条件，去掉top样式
        if (affix === 'top') {
            this.$element.css('top', '');
        }
    };

    Affix.prototype.checkPositionWithEventLoop = function () {
        setTimeout($.proxy(this.checkPosition, this), 1);
    };

    $.fn.m_affix = function (options) {
        this.each(function () {
            return new Affix(this, options);
        });
    }
}(jQuery);
