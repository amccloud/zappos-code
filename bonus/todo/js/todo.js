var completedClassTransformer = function(value) {
    return (value) ? 'completed' : 'todo';
};

var priorityTransformer = function(value) {
    return 'hsl(' + (value * 5) + ', 95%, 55%)';
};

var Todo = Backbone.Model.extend({
    defaults: {
        title: "",
        position: 0,
        complete: false
    },
    validate: function(attrs) {
        if (!attrs.title || attrs.title === "")
            return "error";
    }
});

var Todos = Backbone.Collection.extend({
    localStorage: new Backbone.LocalStorage('Todos'),
    model: Todo,

    comparator: function(todo) {
        return -todo.get('position');
    }
});

var TodoView = Backbone.View.extend({
    tagName: 'li',
    bindings: {
        'data-id': 'id',
        'class': ['completed', completedClassTransformer],
        'checked input[name="completed"]': 'completed',
        'readonly input[name="title"]': 'completed',
        'value input[name="title"]': 'title',
        'background-color': ['position', priorityTransformer]
    },
    events: {
        'click button.remove': 'remove',
        'keydown input[name="title"]': 'saveOnEnter'
    },

    initialize: function() {
        _.bindAll(this, 'saveOnEnter', 'save', 'remove', 'destroy', 'template', 'render');
        this.model.on('change', this.save);
        this.model.on('remove', this.destroy);
    },
    saveOnEnter: function(event) {
        if (event.which != 13)
            return;

        $(event.currentTarget).blur();

        this.save();
    },
    save: function() {
        this.model.save();
    },
    remove: function() {
        this.model.destroy();
    },
    destroy: function() {
        this.$el.addClass('destroyed').slideUp(200, function() {
            $(this).remove();
        });
    },
    template: function() {
        return $('#todo-view').html();
    },
    render: function() {
        this.$el.html(this.template());
        return this.bindModel();
    }
});

var TodoListView = Backbone.View.extend({
    tagName: 'ul',
    className: 'todo-list',
    events: {
        'sortupdate': 'savePositions'
    },

    initialize: function() {
        _.bindAll(this, 'savePositions', 'addOne', 'addAll', 'render');
        this.collection.on('add', this.addOne);
        this.collection.on('reset', this.addAll);
        this.collection.on('add remove', this.savePositions);
    },
    savePositions: function(event) {
        this.$('li').each(_.bind(function(i, el) {
            var $el = $(el),
                todoId = $el.attr('data-id'),
                model = this.collection.get(todoId);

            if (!model)
                return;

            model.set('position', $el.index());
            model.save();
        }, this));
    },
    addOne: function(todo) {
        var todoView = new TodoView({
            model: todo
        });

        this.$el.prepend(todoView.render().$el);
    },
    addAll: function() {
        this.collection.each(this.addOne);
    },
    render: function() {
        this.$el.sortable({
            axis: 'y',
            opacity: 0.8,
            forcePlaceholderSize: true
        });

        return this;
    }
});

var TodoAppView = Backbone.View.extend({
    events: {
        'keydown input#create-todo': 'createOnEnter'
    },

    initialize: function() {
        _.bindAll(this, 'createTodo', 'render');

        this.$todoInput = this.$('input#create-todo');

        this.todos = new Todos();
        this.todoListView = new TodoListView({
            collection: this.todos
        });

        this.todos.fetch();
    },
    createOnEnter: function(event) {
        if (event.which != 13)
            return;

        this.createTodo();
    },
    createTodo: function(event) {
        var todo = this.todos.create({
            title: this.$todoInput.val()
        });

        this.$todoInput.val("");

        return (!event) ? todo : false;
    },
    render: function() {
        this.$el.append(this.todoListView.render().$el);
        return this;
    }
});

Backbone.View.Binders['background-color'] = function(model, attribute, property) {
    return {
        set: function(value) {
            this.css('background-color', value);
        }
    };
};

$(function() {
    var appView = new TodoAppView({
        el: $('div#todo')
    });

    if (appView.todos.isEmpty()) {
        appView.todos.create({title: "Do a barrel roll"});
        appView.todos.create({title: "Press 'x' to delete"});
        appView.todos.create({title: "Drag to prioritize"});
        appView.todos.create({title: "Click to edit"});
        appView.todos.create({title: "Check to mark done"});
        appView.todos.create({title: "Add a todo"});
        appView.todos.create({title: "This is something I have to do"});
    }

    appView.render();
});
