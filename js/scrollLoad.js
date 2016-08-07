/**
 * Created by lingc on 2016/8/6.
 */
;(function ($, window, document) {
    'use strict';
    //插件意图版本1：滚动到页面底部时，自动ajax，返回数据后插入到dom容器中，在loader上依次显示状态
    // Define the default settings
    var defaults = {
        binder: $(window), //在哪个dom上添加滚动监听
        container: $(document), //将返回的数据append到哪个容器中,默认是文档
        loader: '', //状态承载容器
        callback: false,
        bufferPx: 200, //缓冲像素
        preFill: true,//预加载填充数据 第一屏数据无需滚动就应加载
        maxPage: undefined,
        currPage: 1,
        url: './js/demoData.js'
    };
    var state = {
        isDuringAjax: false
    };

    // Constructor
    var ScrollLoad = function ($element, options) {
        this.$element = $element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this.state = state;
        this.init();
    };


    ScrollLoad.prototype = {
        //插件初始化
        init: function () {
            this.addScrollListen();
        },
        //请求ajax
        getData: function () {
            var self = this;
            self.state.isDuringAjax = true;
            $.ajax({
                type: 'GET',
                url: self.settings.url,
                dataType: 'json',
                success: function (res) {
                    //res应该包括 状态码 结果集
                    if (res.code === 0 || parseInt(res.code) === 0) {
                        if (res.items.length <= 0) {
                            return self.noMoreData();
                        }
                        self.appendData(res.items);
                        self.finishLoad();
                    } else {
                        //打印出错代码
                        console.log(res.code);
                    }
                }
            });

        },
        //插入数据
        appendData: function (data) {
            console.log(data);
        },
        //绑定监听事件
        addScrollListen: function () {
            var self = this;
            self.settings.binder.on('scroll', self.deBounce(self.doScroll, 500));
        },
        //滚动处理函数
        doScroll: function () {
            //检查状态
            var self = this;
            if (!self.nearBottom()) {
                return;
            }
            if (self.state.isDuringAjax) {
                return;
            }
            self.getData();
        },
        //滚动事件优化的防抖动函数
        deBounce: function (func, wait) {
            var timeout,
                context = this;
            return function () {
                var later = function () {
                    timeout = null;
                    func.apply(context);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        //检查是否接近页面底部
        nearBottom: function () {
            //几个高度的对比 如果默认是文档，则 文档整体高度 = 窗口高度 + 滚动条顶部位置
            var self = this;
            var containerHeight = self.settings.container.height(),
                scrollTop = $(document).scrollTop(), //获取垂直滚动条到顶部的距离
                viewHeight = $(window).height();//浏览器窗口的高度
            return viewHeight + scrollTop + self.settings.bufferPx >= containerHeight;
        },
        //完成加载
        finishLoad: function () {
            setTimeout(function () {
                self.state.isDuringAjax = false;
            }, 300);
        },
        //没有更多数据
        noMoreData: function () {
            //解除scroll事件
            self.settings.binder.off('scroll');

        },
        //loader状态改变
        changeLoader: function () {

        }

    };


// Define the scrollLoad plugin method and loop
    $.fn.scrollLoad = function (m) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('scrollLoad');

            if (data) {
                return;
            }

            var scrollLoad = new ScrollLoad($this, m);
        });
    };

})(jQuery, window, document);