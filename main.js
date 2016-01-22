$(function() {
    var Workspace = Backbone.Router.extend({
        routes: {
            "adda": "add", //进入增加页面
            "list": "listf", //进入展示列表
            "(:index)": "indexp", //进入首页
            "run/:ajaxname": "runf" //进入run ajax页面
        },
        add: function() {
            addView.render();
        },
        indexp: function() {
            app.render();
        },
        listf: function() {
            listView.render();
        },
        runf: function(ajaxname) {
            runView.model = ajaxLoopList.get(ajaxname);
            runView.render();
        }
    });
    var AjaxLoop = Backbone.Model.extend({
        idAttribute: "ajaxname"
    });

    var AjaxLoopList = Backbone.Collection.extend({
        localStorage: new Backbone.LocalStorage("AjaxLoopList"),
        model: AjaxLoop
    });
    var AddView = Backbone.View.extend({
        el: $("#content"),
        initialize: function() {
            //this.listenTo(ajaxLoopList, 'add', this.showCode);
            this.args = [];
        },
        render: function() {
            this.args = [];
            var that = this;
            $.get(
                'view/add.mst',
            function(template) {
                var rendered = Mustache.render(template, {});
                 that.$el.html(rendered);
            });
            return this;
        },
        events: {
            "keypress #args": "addArgs",
            "click #addModel": "addModels"
        },

        addArgs: function(event) {
            event.stopPropagation();
            if(event.keyCode != 13) return;
            this.args.push(this.$("#args").val());
            this.$("#placeArgs").append("&nbsp;<span class='label label-info'>"+this.$("#args").val()+"</span>");
            this.$("input[name=args]").val(this.args.join(","));
            this.$("#args").val('');
        },

        addModels: function() {
            //console.log(getFormValues(this.$("#addajaxForm")));
            console.log('addModels', this.$("#addModel").length);
            ajaxLoopList.create(getFormValues(this.$("#addajaxForm")));
        },
        showCode: function() {
            console.log("add success");
            //workspace.navigate('list', {trigger: true});
        }
    });

    var ListView = Backbone.View.extend({
        el: $("#content"),
        initialize: function() {
        },
        events: {
          "click .runInList": "runInList"
        },
        render: function() {
            var that = this;
            $.get('view/list.mst', function(template) {
                var rendered = Mustache.render(template, {ajaxs: ajaxLoopList.toJSON()});
                that.$el.html(rendered);
            });
        },

        runInList: function(e) {
            console.log(this.$(e.target).data('ajaxname'));
            workspace.navigate('run/' + this.$(e.target).data('ajaxname'), {trigger: true});
        }
    });

    var RunView = Backbone.View.extend({
        el: $("#content"),
        initialize: function() {
            this.listenTo(RunJs, 'success', this.runSuccess);
        },
        events: {
            "click #run": "run"
        },
        render: function() {
            var that = this;
            $.get('view/run.mst', function(template) {
                var rendered = Mustache.render(template, that.model.toJSON());
                that.$el.html(rendered);
            });
        },
        runSuccess: function(data) {
            console.log(data);
        },
        run: function() {
            runJs.run(this.model);
        }
    });

    var IndexView = Backbone.View.extend({
        el: $("#content"),
        initialize: function () {
        },
        events: {
          "click #addLoop": "addLoop"
        },
        render: function() {
            var that = this;
            $.get(
                'view/index.mst',
            function(template) {
                var rendered = Mustache.render(template, {author: '朱雷'});
                 that.$el.html(rendered);
            });
            return this;
        },
        addLoop: function() {
        }
    });

    var RunJs = function() {
    };

    RunJs.prototype.run = function(model) {
        var that = this;
        $.getJSON(model.get('url')).done(function(data) {
            console.log(data);
            RunJs.trigger('success', data);
        }).fail(function(data) {

        });
    };
    _.extend(RunJs, Backbone.Events);
    var app = new IndexView;
    var workspace = new Workspace();
    var ajaxLoopList = new AjaxLoopList;
    var addView = new AddView();
    var listView = new ListView;
    var runView = new RunView;
    ajaxLoopList.fetch();
    Backbone.history.start();

    var runJs = new RunJs();
});

function getFormValues(jq) {
    var obj = {};
    var values = jq.serializeArray();
    values.forEach(function(v, i) {
        obj[v.name] = v.value;
    });
    return obj;
}
