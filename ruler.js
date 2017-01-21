class Ruler {
    constructor(canvas, side, font = 'Arial', fontSize = 10, rulerHeight = 15) {
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

        if(this.side == 'left') {
            this._rotate(90);
            this.canvas.style.top = rulerHeight + 'px';
        }
        this.parent = $('#rulerArea')[0];
        this._initTracker();
    }

    /*
     * positon: The top and left position without any transformation of the object inside the main canvas where the Zero should start.
     *          
     * scale: The scale that has been assigned to the main canvas.
     */
    update(position, scale) {
        this._setPosition(position);
        this._setScale(scale);
    }

    updateMousePosition(position) {
        if(this.side == 'top') {
            this.tracker.css('left', ((position.x - this.parent.offsetLeft) * this.scale)  + 'px');
        }else {
            this.tracker.css('top', ((position.y + this.parent.offsetTop) * this.scale) + 'px');
        }
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.beginPath();
        this._drawPixel(); //DONE
        //this._drawMM(); //DONE
        //this._drawInch(); //DONE
        this.context.stroke();
    }

    _drawPixel() {
        var pointLength = 0;
        var pos = -this._getPosition();
        var downScale = this.scale < 1 ? (1 / this.scale) : 1;
        var length = this.canvas.width * downScale
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
        var pos = this._getPosition();
        var downScale = this.scale < 1 ? (1 / this.scale) : 1;
        var length = this.canvas.width * downScale
        var pointLengths = [this.longPoint, this.smallPoint, this.smallPoint, this.smallPoint, this.smallPoint, this.mediumPoint, this.smallPoint, this.smallPoint, this.smallPoint, this.smallPoint];

        /*
         * For simplicity we draw forwards and backwards from the Zero position
        */
        for(var i = 0; i < length; i++) {
            var x = (i * dpmm) + pos;
            var x2 = pos - (i * dpmm);
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
        var pos = this._getPosition();
        var downScale = this.scale < 1 ? (1 / this.scale) : 1;
        var length = this.canvas.width * downScale
        var pointLengths = [this.longPoint, this.smallPoint, this.smallPoint, this.smallPoint, this.smallPoint, this.mediumPoint, this.smallPoint, this.smallPoint, this.smallPoint, this.smallPoint];

        /*
         * For simplicity we draw forwards and backwards from the Zero position
        */
        for(var i = 0; i < length; i++) {
            var x = i * tenthInch + pos;
            var x2 = pos - i * tenthInch;
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
        this.context.scale(scale, 1);
        
        var downScale = (1 / scale);

        this.context.lineWidth = this.orgLineWidth * downScale;
    }

    _drawPoint(x1, y1, x2, y2) {
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
    }

    _drawText(x, y, text) {
        /*
         * In order to keep the text the same size all the time
         * we save the context change the transform and then restore the context.
         */
        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.fillText(text, x * this.scale, y);
        this.context.restore();
    }

    _rotate(angle) {
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
    }

    _initTracker() {
        this.guideID = this.side + '_guide';
        var s = this.side == 'top' ? 'height' : 'width';
        if(this.side == 'top') {
            s = 'height:' + this.pointThickness + 'px;' + ' top: 0px';
        }else {
            s = 'width:' + this.pointThickness + 'px;' + ' left: 0px';
        }
        this.tracker = $('<div id="' + this.guideID + '" class="ruler_guide" style="' + s + '"></div>').appendTo(this.parent);
    }
}