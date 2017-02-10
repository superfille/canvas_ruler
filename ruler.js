class Ruler {
	constructor(canvas, side, font = 'Arial', fontSize = 10, rulerHeight = 15) {
		this.side = side;
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.canvas.style.left = this.side == 'top' ? this._pixelize(rulerHeight) : this._pixelize(-rulerHeight);
		this.pointThickness = rulerHeight;
		this.scale = 1;
		this.longPoint = 0;
		this.mediumPoint = this.pointThickness * 0.25;
		this.smallPoint = this.pointThickness * 0.5;
		this.context.font = this._pixelize(fontSize) + ' ' + font;
		this.lineWidth = 1;
		this.orgLineWidth = 1;
		this.zeroPositions = {x: 0, y: 0};
		this.unit = 'dots'; //dots, mm, inch changed

		if(this.side == 'left') {
			this._rotate(90);
			this.canvas.style.top = this._pixelize(rulerHeight);
		}
		this.parent = $('#rulerArea')[0];
		this.tracker = this._createTracker();
	}

	/*
	* positon: The top and left position without any transformation of the object inside the main canvas where the Zero should start.
	*          
	* scale: The scale that has been assigned to the main canvas.
	*/
	update(position = null, scale = null, transform = null) {
		if(position != null) {
			this._setPosition(position);
		}

		if(scale != null){
			this._setScale(scale);
		}

		if(transform != null) {
			this._setTransform(transform);
		}

		this._draw();
	}

	updateMousePosition(position) {
		if(this.side == 'top') {
			this.tracker.css('left', this._pixelize((position.x - this.parent.offsetLeft)));
		}else {
			this.tracker.css('top', this._pixelize((position.y - this.parent.offsetTop + this.pointThickness)));
		}
	}

	updateObjectPosition(position = null) {
		if(position === null) {
			this._removeObjectTracker();
			return;
		}

		this._createObjectTrackers();

		if(this.side == 'top') {
			this.objTracker1.css('left', this._pixelize((position.x * this.scale + this.pointThickness)));
			this.objTracker2.css('left', this._pixelize((position.x2 * this.scale + this.pointThickness)));
		}else {
			this.objTracker1.css('top', this._pixelize((position.y * this.scale  + this.pointThickness)));
			this.objTracker2.css('top', this._pixelize((position.y2 * this.scale + this.pointThickness)));
		}
	}

	_draw() {
		this.context.clearRect(0, 0, this.canvas.width * 100, this.canvas.height * 100);
		this.context.beginPath();
		
		switch(this.unit) {
			case 'dots':
				this.drawPixel();
				break;
			case 'mm':
				this.drawMM();
				break;
			case 'inch':
				this.drawInch();
				break;
		}

		this.context.stroke();
	}

	setUnit(unit){
		this.unit = unit;
	}

	drawPixel() {
		var pointLengths = [this.longPoint, this.smallPoint, this.smallPoint, this.smallPoint, this.smallPoint, this.mediumPoint, this.smallPoint, this.smallPoint, this.smallPoint, this.smallPoint];
		var increment = 10;
		var multi = 10


		if (this.scale <= 2) {
			increment = 10;
			multi = 10;
		}
		else if(this.scale <= 4) {
			increment = 5;
			multi = 5
		} 

		
		this.drawRuler(increment, pointLengths, multi);
	}
	
	drawMM() {
		var dpmm = 12;
		var pointLengths = [this.longPoint, this.smallPoint, this.smallPoint, this.smallPoint, this.smallPoint, this.mediumPoint, this.smallPoint, this.smallPoint, this.smallPoint, this.smallPoint];
	
		this.drawRuler(dpmm, pointLengths);
	}

	drawInch() {
		var dpmm = 12;
		var dpi = 25.4;
		var tenthInch = (1/ (1 /dpmm / dpi)) / 10
		this.drawRuler(tenthInch);
	}

	drawRuler(increment, pointLengths, multi) {
		var pos = this._getPosition();
		var length = this.canvas.width * this._downScale(1);

		for(var i = 0; i < length; i++) {
			var x = i * increment + pos;
			var x2 = pos - i * increment;
			var y = pointLengths[i % pointLengths.length];

			if(pos !== 0)
				this._drawPoint(x + 0.5, this.pointThickness + 0.5, x + 0.5, y + 0.5);
			this._drawPoint(x2 + 0.5, this.pointThickness + 0.5, x2 + 0.5, y + 0.5);

			if(i % pointLengths.length == 0){
				var label = i * multi;
				if(i !== 0)
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

	_setScale(scale, transform) {
		this.scale = scale;
		var downScale = (1 / scale);
		this.context.lineWidth = this.orgLineWidth * downScale;
	}

	_setTransform(transform) {
		this.transform = transform;
		if(this.side == 'top') {
			this.context.setTransform(transform[0], 0, 0, 1, transform[4], 0);
		}else {
			this.context.setTransform(transform[0], 0, 0, 1, transform[5], 0);
		}
	}

	_drawPoint(x1, y1, x2, y2) {
		this.context.moveTo(x1, y1);
		this.context.lineTo(x2, y2);
	}

	_drawText(x, y, text) {
		this.context.save();
		if(this.side == 'top') {
			this.context.setTransform(1, 0, 0, 1, this.transform[4], 0);
		}else {
			this.context.setTransform(1, 0, 0, 1, this.transform[5], 0);
		}
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

	_downScale(value) {
		return this.scale < 1 ? (1 / this.scale) : value;
	}

	_createObjectTrackers() {
		if(this.objTracker1 === undefined || this.objTracker1 === null || this.objTracker2 === undefined || this.objTracker2 === null) {
			this._removeObjectTracker();
			this.objTracker1 = this._createTracker();
			this.objTracker2 = this._createTracker();
		}
	}

	_removeObjectTracker() {
		if(this.objTracker1 !== undefined && this.objTracker1 !== null) {
			this.objTracker1.remove();
			this.objTracker1 = null;
		}

		if(this.objTracker2 !== undefined && this.objTracker2 !== null) {
			this.objTracker2.remove();
			this.objTracker2 = null;
		}
	}

	_createTracker() {
		var s = this.side == 'top' ? 'height' : 'width';
		if(this.side == 'top') {
			s = 'height:' + this.pointThickness + 'px;' + ' top: 0px';
		}else {
			s = 'width:' + this.pointThickness + 'px;' + ' left: 0px';
		}

		return $('<div class="ruler_guide" style="' + s + '"></div>').appendTo(this.parent);
	}

	_pixelize(value) {
		return value + 'px';
	}
}
