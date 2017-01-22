

var rulermodel = Backbone.Model.extend({
    constructor: function(parent, canvas, side, font = 'Arial', fontSize = 10, rulerHeight = 15) {
        this.side = side;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.canvas.style.left = this.side == 'top' ? rulerHeight + 'px' : -rulerHeight + 'px';
        this.pointThickness = rulerHeight;
        this.scale = 1;
        this.longPoint = 0;
        this.mediumPoint = this.pointThickness * 0.25;
        this.smallPoint = this.pointThickness * 0.5;
        this.context.font = fontSize + 'px ' + font;
        this.lineWidth = 1;
        this.orgLineWidth = 1;
        this.zeroPositions = {x: 0, y: 0};
        this.unit = 'dots'; //dots, mm, inch

        if(this.side == 'left') {
            this._rotate(90);
            this.canvas.style.top = rulerHeight + 'px';
        }
        this.parent = parent;
        this.tracker = this._createTracker();
    },

    _rotate: function(angle) {
        var rotation = 'rotate(' + angle + 'deg)';
        var origin = Math.abs(parseInt(this.canvas.style.left)) + 'px' + ' 100%';
        this.canvas.style.webkitTransform = rotation;
        this.canvas.style.MozTransform = rotation;
        this.canvas.style.OTransform = rotation;
        this.canvas.style.msTransform = rotation;
        this.canvas.style.transform = rotation;
        this.canvas.style.webkitTransformOrigin = origin;
        this.canvas.style.MozTransformOrigin = origin;
        this.canvas.style.OTransformOrigin = origin;
        this.canvas.style.msTransformOrigin = origin;
        this.canvas.style.transformOrigin = origin;
    },

     createObjectTrackers: function() {
        if(this.objTracker1 === undefined || this.objTracker1 === null || this.objTracker2 === undefined || this.objTracker2 === null) {
            this.removeObjectTracker();
            this.objTracker1 = this._createTracker();
            this.objTracker2 = this._createTracker();
        }
    },

    removeObjectTracker: function() {
        if(this.objTracker1 !== undefined && this.objTracker1 !== null) {
            this.objTracker1.remove();
            this.objTracker1 = null;
        }

        if(this.objTracker2 !== undefined && this.objTracker2 !== null) {
            this.objTracker2.remove();
            this.objTracker2 = null;
        }
    },

    createTracker: function() {
        var s = this.side == 'top' ? 'height' : 'width';
        if(this.side == 'top') {
            s = 'height:' + this.pointThickness + 'px;' + ' top: 0px';
        }else {
            s = 'width:' + this.pointThickness + 'px;' + ' left: 0px';
        }

        return $('<div class="ruler_guide" style="' + s + '"></div>').appendTo(this.parent);
    }
});