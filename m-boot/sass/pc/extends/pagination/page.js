+(function (jQuery) {
    jQuery.fn.pagination = function (options) {
        return this.each(function () {
            var $this = $(this);

            this.options = $.extend({
                items_total: 0,
                items_per_page: 10,
                display_pages_num: 10,				// 展示的页码个数
                current_page: 0,
                prev_text: "Prev",
                next_text: "Next",
                link_to: "#",
                ellipse_text: "...",
                prev_show_always: true,
                next_show_always: true,
                first_show_always: true,
                last_show_always: true,
                callback: function () {
                    return false;
                }
            }, options);
            this.options.callback($this, this.options, callback);

            /*
             * 计算总页数
             *
             * */
            function getPages(options) {
                return Math.ceil(options.items_total / options.items_per_page);
            }

            /*
             * 计算起始页码和结束页码
             *
             * */
            function getInterval(current_page, options) {
                var half_entry = Math.ceil(options.display_pages_num / 2);
                var pages = getPages(options);

                var start_page = current_page > half_entry ? Math.max(Math.min(current_page - half_entry, pages - options.display_pages_num), 0) : 0;
                var end_page = current_page > half_entry ? Math.min(current_page + half_entry, pages) : Math.min(options.display_pages_num, pages);

                return [start_page, end_page];
            }

            /*
             * 绘制分页
             *
             * */
            function drawPages($this, options) {
                var pages = getPages(options);
                var current_page = options.current_page;
                var interval = getInterval(current_page, options);
                var appendItem = function (page_id, appendices) {
                    var lnk;

                    page_id = page_id < 0 ? 0 : (page_id < pages ? page_id : pages - 1);
                    appendices = $.extend({text: page_id + 1, classes: ""}, appendices || {});

                    if (page_id == current_page) {
                        lnk = $("<span class='active'>" + (appendices.text) + "</span>");
                    } else {
                        lnk = $("<a>" + (appendices.text) + "</a>")
                            .bind("click", function (e) {
                                e.stopPropagation();
                                e.preventDefault();

                                options.current_page = page_id;
                                options.callback($this, $this[0].options, callback);
                            })
                            .attr('href', options.link_to.replace(/__id__/, page_id));
                    }
                    if (appendices.classes) {
                        lnk.addClass(appendices.classes);
                    }

                    $this.append(lnk);
                };

                if (options.prev_text && (options.prev_show_always || current_page > 0)) {
                    appendItem(current_page - 1, {text: options.prev_text, classes: "prev"});
                }
                if (options.first_show_always && interval[0] > 0) {
                    appendItem(0);
                }
                if (options.ellipse_text && interval[0] > 1) {
                    $("<span>" + options.ellipse_text + "</span>").appendTo($this);
                }

                for (var i = interval[0]; i < interval[1]; i++) {
                    appendItem(i);
                }

                if (options.ellipse_text && interval[1] < pages - 1) {
                    $("<span>" + options.ellipse_text + "</span>").appendTo($this);
                }
                if (options.last_show_always && interval[1] < pages) {
                    appendItem(pages - 1);
                }
                if (options.next_text && (options.next_show_always || current_page < pages)) {
                    appendItem(current_page + 1, {text: options.next_text, classes: "next"});
                }
            }

            function callback(items_total) {
                $this.empty();
                $this[0].options.items_total = items_total;

                drawPages($this, $this[0].options);
            }
        });
    };
})(jQuery);