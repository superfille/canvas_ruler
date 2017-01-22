
class Ruler {
    constructor(parent, canvas, side, font = 'Arial', fontSize = 10, rulerHeight = 15) {
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
    }

    /*
     * positon: The top and left position without any transformation of the object inside the main canvas where the Zero should start.
     *          
     * scale: The scale that has been assigned to the main canvas.
     */
    update(position = null, scale = null) {
        if(position != null) {
            this._setPosition(position);
        }

        if(scale != null){
            this._setScale(scale);
        }

        this._draw();
    }

    updateMousePosition(position) {
        if(this.side == 'top') {
            this.tracker.css('left', ((position.x - this.parent.offsetLeft))  + 'px');
        }else {
            this.tracker.css('top', ((position.y - this.parent.offsetTop + this.pointThickness)) + 'px');
        }
    }

    updateObjectPosition(position = null) {
        if(position === null) {
            this._removeObjectTracker();
            return;
        }

        this._createObjectTrackers();

        if(this.side == 'top') {
            this.objTracker1.style.left = 
            this.objTracker1.css('left', ((position.x * this.scale + this.pointThickness))  + 'px');
            this.objTracker2.css('left', ((position.x2 * this.scale + this.pointThickness))  + 'px');
        }else {
            this.objTracker1.css('top', ((position.y * this.scale  + this.pointThickness)) + 'px');
            this.objTracker2.css('top', ((position.y2 * this.scale + this.pointThickness)) + 'px');
        }
    }

    _draw() {
        var downScale = this._downScale(this.scale);
        this.context.clearRect(0, 0, this.canvas.width * downScale, this.canvas.height * downScale);
        this.context.beginPath();
        
        switch(this.unit) {
            case 'dots':
                this._drawPixel();
                break;
            case 'mm':
                this._drawMM();
                break;
            case 'inch':
                this._drawInch();
                break;
        }

        this.context.stroke();
    }

    setUnit(unit){
        this.unit = unit;
    }

    _drawPixel() {
        var pointLength = 0;
        var pos = -this._getPosition();
        var length = this.canvas.width * this._downScale(1);
        var multiple = 1

        if(this.scale <= .3)      multiple = 4;
        else if(this.scale <= .5) multiple = 3;
        else if(this.scale <= .8) multiple = 2;
        else if(this.scale >= 4)  multiple = 0.5

        var f  = 50 * multiple;
        var f2 = 25 * multiple;
        var f3 = 5 * multiple;
        
        for(var i = 0; i < length; i++, pos++) {
            var draw = false;
            var label = '';
    
            if (pos % f === 0) {
                label = pos.toString();
                pointLength = this.longPoint;
                draw = true;
            }
            else if (pos % f2 === 0) {
                pointLength = this.mediumPoint;
                draw = true;
            }
            else if (pos % f3 === 0) {
                pointLength = this.smallPoint;
                draw = true;
            }

            if (draw) {
                this._drawPoint(i + 0.5, this.pointThickness + 0.5, i + 0.5, pointLength + 0.5);
                if(label != '') {
                    this._drawText(i + 1.5, this.pointThickness * 0.5, label);
                }
            }
        }
    }
    
    _drawMM() {
        var dpmm = 12;
        this._drawUnit(dpmm);
    }

    _drawUnit(increment) {
        var pos = this._getPosition();
        var length = this.canvas.width * this._downScale(1);
        var pointLengths = [this.longPoint, this.smallPoint, this.smallPoint, this.smallPoint, this.smallPoint, this.mediumPoint, this.smallPoint, this.smallPoint, this.smallPoint, this.smallPoint];

        /*
         * For simplicity we draw forwards and backwards from the Zero position
        */
        for(var i = 0; i < length; i++) {
            var x = i * increment + pos;
            var x2 = pos - i * increment;
            var y = pointLengths[i % pointLengths.length];

             this._drawPoint(x + 0.5, this.pointThickness + 0.5, x + 0.5, y + 0.5);
             this._drawPoint(x2 + 0.5, this.pointThickness + 0.5, x2 + 0.5, y + 0.5);

            if(i % pointLengths.length == 0){
                var label = i / pointLengths.length;
                this._drawText(x + 1.5, this.pointThickness * 0.5, label);
                this._drawText(x2 + 1.5, this.pointThickness * 0.5, -label);
            }
        }
    }

    _drawInch() {
        var dpmm = 12;
        var dpi = 25.4;
        var tenthInch = (1/ (1 /dpmm / dpi)) / 10
        this._drawUnit(tenthInch);
    }

    _setPosition(position) {
        this.zeroPositions = {
            x: position.x,
            y: position.y
        }
    }

    _getPosition(position = null) {
        if(position != null){
            return this.side == 'top' ? Math.round((position.x)) : Math.round((position.y));
        }
        return this.side == 'top' ? Math.round((this.zeroPositions.x)) : Math.round((this.zeroPositions.y));
    }

    _setScale(scale) {
        this.scale = scale;
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.scale(scale, 1);
        
        var downScale = (1 / scale);

        this.context.lineWidth = this.orgLineWidth * downScale;
    }

    _drawPoint(x1, y1, x2, y2) {
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
    }

    _drawText(x, y, text) {
        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.fillText(text, x * this.scale, y);
        this.context.restore();
    }

    _downScale(value) {
        return this.scale < 1 ? (1 / this.scale) : value;
    }

    _pixelize(value) {
        return value + 'px';
    }
}