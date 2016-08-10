/**
 * Created by lingc on 2016/8/6.
 * https://github.com/linguochi/myJs
 */
;(function ($, window, document) {
    'use strict';
    //插件意图版本1：滚动到页面底部时，自动ajax，返回数据后插入到dom容器中，在loader上依次显示状态
    // Define the default settings
    var defaults = {
        binder: $(window), //在哪个dom上添加滚动监听
        loader: $('#load-more-btn'), //状态承载容器
        callback: false, //暂未使用
        bufferPx: 400, //缓冲像素
        preFill: true,//todo 预加载填充数据 第一屏数据无需滚动就应加载
        maxPage: undefined,
        numPerPage: 12, // 每一页显示多少数据
        url: './js/demo-data.json', // 自定义url接口
        paras: {  // 自定义传输参数
            page: 1
        }
    };
    var state = {
        isDuringAjax: false
    };

    /**
     *
     * @param $element 需要请求数据的容器
     * @param options 传递自定义参数
     * @constructor
     */
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
            //todo 先加载两页数据
            this.addScrollListen();
        },
        //请求ajax
        getData: function () {
            var self = this;
            self.state.isDuringAjax = true;
            self.changeLoader('加载中，请稍后...');
            $.ajax({
                type: 'GET',
                url: self.settings.url,
                data: self.settings.paras, // pageStart: self.settings.currPage
                dataType: 'json',
                success: function (res) {
                    //res应该包括 状态码 结果集
                    if (res.code === 0 || parseInt(res.code) === 0) {
                        if (res.items.length <= 0) {
                            return self.noMoreData();
                        }
                        self.settings.paras.page++;
                        self.appendData(res.items);
                        self.finishLoad();
                    } else {
                        //打印出错代码
                        console.log(res.code);
                    }
                },
                error: function () {
                    console.log('ajax req error');
                }
            });
        },
        //插入数据
        appendData: function (data) {
            var self = this;
            $.each(data, function (index, dataVal) {
                var itemHtml =
                    '<div class="col-sm-3 book-item">' +
                    '<div class="thumbnail">' +
                    '<a href="#">' +
                    '<img class="thumbnail-img" src="/static/files/index/book-img.jpg" alt="">' +
                    '</a>' +
                    '<div class="caption">' +
                    '<div class="book-name"><a href="#">程序员的自我修养</a></div>' +
                    '<span class="book-tags">前端必备</span>' +
                    '<div class="borrow-info">已被 <span class="borrow-times">3</span> 人借阅过</div>' +
                    '<p><a href="#" class="btn btn-primary" role="button">借阅</a>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                self.$element.append(itemHtml);
            })
        },
        //绑定监听事件
        addScrollListen: function () {
            var self = this;
            self.settings.binder.on('scroll', self.deBounce(self.doScroll, 300));
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
            var containerHeight = $(document).height(),
                scrollTop = $(document).scrollTop(), //获取垂直滚动条到顶部的距离
                viewHeight = $(window).height();//浏览器窗口的高度
            return viewHeight + scrollTop + self.settings.bufferPx >= containerHeight;
        },
        //完成加载
        finishLoad: function () {
            var self = this;
            setTimeout(function () {
                self.state.isDuringAjax = false;
                self.changeLoader('下滑加载更多');
            }, 300);
        },
        //没有更多数据
        noMoreData: function () {
            //解除scroll事件
            var self = this;
            self.settings.binder.off('scroll');
            self.changeLoader('没有更多数据了！');
        },
        //loader状态改变
        changeLoader: function (messageHtml) {
            var self = this;
            this.settings.loader.html(messageHtml);
        }

    };


// Define the scrollLoad plugin method and loop
    $.fn.scrollLoad = function (m) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('scrollLoader');

            if (data && data.scrollLoader) {
                return;
            }
            data = $this.data('scrollLoader', true);
            var scrollLoad = new ScrollLoad($this, m);
        });
    };

})(jQuery, window, document);