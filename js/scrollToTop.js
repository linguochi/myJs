/**
 * 滚到顶部部件
 * Created by lingc on 2016/8/10.
 * https://github.com/linguochi/myJs
 */
(function ($, window) {
    var defaults = {
        offset: 300,
        offset_opacity: 1200,
        scroll_top_duration: 700, //滑动时间
        $back_to_top: $('.cd-top')
    };
    var ScrollToTop = function ($element, options) {
        this.$element = $element;
        this.settings = $.extend({}, defaults, options);
        this.init();
    };
    ScrollToTop.prototype = {
        init: function () {
            this.bindListener();
        },
        bindListener: function () {
            var self = this;
            //hide or show the "back to top" link
            $(window).scroll(function () {
                ( $(this).scrollTop() > self.settings.offset ) ? self.settings.$back_to_top.addClass('cd-is-visible') : self.settings.$back_to_top.removeClass('cd-is-visible cd-fade-out');
                if ($(this).scrollTop() > self.settings.offset_opacity) {
                    self.settings.$back_to_top.addClass('cd-fade-out');
                }
            });
            //滑动更顺滑~~~~~
            self.settings.$back_to_top.on('click', function (event) {
                event.preventDefault();
                $('body,html').animate({
                        scrollTop: 0,
                    }, self.settings.scroll_top_duration
                );
            });
        }
    };
    $.fn.scrollToTop = function (m) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('scrollToToper');
            if (data && data.scrollToToper) {
                return;
            }
            data = $this.data('scrollToToper', true);
            var scrollToTop = new ScrollToTop($this, m);
        });
    };
})(jQuery, window);
