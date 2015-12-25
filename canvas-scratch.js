(function(Scratch) {
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return Scratch;
        });
    } else if (typeof exports !== 'undefined') {
        exports.scratch = Scratch;
    } else {
        window.scratch = Scratch;
    }
})(function() {

    function getLocalCoords(elem, ev) {
        var ox = 0;
        var oy = 0;
        var first;
        var pageX
        var pageY;

        while (elem != null) {
            ox += elem.offsetLeft;
            oy += elem.offsetTop;
            elem = elem.offsetParent;
        }

        if (ev.hasOwnProperty('changedTouches')) {
            first = ev.changedTouches[0];
            pageX = first.pageX;
            pageY = first.pageY;
        } else {
            pageX = ev.pageX;
            pageY = ev.pageY;
        }

        return {
            x: pageX - ox,
            y: pageY - oy
        };
    }

    function Scratch(config) {
        if (!(this instanceof Scratch)) {
            return new Scratch(config);
        }

        this.wrapper         = config.wrapper;
        this.imageUrl       = config.imageUrl;
        this.lineWidth      = config.lineWidth;
        this.onImagesLoaded = config.onImagesLoaded;
        this.onScratch      = config.onScratch;
        this.onComplete     = config.onComplete;
        this.mode           = config.mode || Scratch.MODE_WITHOUT_MOUSEDOWN;
        
        this.loadImage();
    }

    Scratch.MODE_WITH_MOUSEDOWN    = 1;
    Scratch.MODE_WITHOUT_MOUSEDOWN = 2;

    Scratch.prototype = {};

    Scratch.prototype.loadImage = function() {
        function imageLoaded(e) {
            this.init();
        }

        this.image = document.createElement('img');
        this.image.setAttribute('crossOrigin', '');
        this.image.addEventListener('load', imageLoaded.bind(this), false);
        this.image.src = this.imageUrl;
    };

    Scratch.prototype.init = function() {
        var c = this.maincanvas = document.createElement('canvas');
        c.width = this.image.width;
        c.height = this.image.height;

        this.wrapper.appendChild(c);

        this.drawcanvas = document.createElement('canvas');
        this.drawcanvas.width = c.width;
        this.drawcanvas.height = c.height;

        this.render();

        function mousedown_handler(e) {
            if (this.completed || (this.mode === Scratch.MODE_WITHOUT_MOUSEDOWN)) {
                return true;
            }
            this.mouseDown = true;

            var local = getLocalCoords(c, e);

            this.scratchPoint(local.x, local.y, true);
            
            this.render();

            if (e.cancelable) {
                e.preventDefault();
            } 
            return false;
        };

        function mousemove_handler(e) {
            if (
                this.completed ||
                ((this.mode === Scratch.MODE_WITH_MOUSEDOWN) && !this.mouseDown)
            ) {
                return true;
            }

            var local = getLocalCoords(c, e);

            this.scratchPoint(local.x, local.y, false);
            
            this.render();

            if (e.cancelable) {
                e.preventDefault();
            } 
            return false;
        };

        function mouseup_handler(e) {
            if (
                this.completed ||
                ((this.mode === Scratch.MODE_WITH_MOUSEDOWN) && this.mouseDown)
            ) {
                this.mouseDown = false;
                if (e.cancelable) {
                    e.preventDefault();
                } 
                return false;
            }

            return true;
        };

        c.addEventListener('mousedown', mousedown_handler.bind(this), false);
        c.addEventListener('touchstart', mousedown_handler.bind(this), false);

        c.addEventListener('mousemove', mousemove_handler.bind(this), false);
        c.addEventListener('touchmove', mousemove_handler.bind(this), false);

        window.addEventListener('mouseup', mouseup_handler.bind(this), false);
        window.addEventListener('touchend', mouseup_handler.bind(this), false);

        if(this.onInit) {
            this.onInit();
        }
    };

    Scratch.prototype.render = function() {
        var ctx = this.maincanvas.getContext('2d');
        ctx.clearRect(0, 0, this.maincanvas.width, this.maincanvas.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(this.image, 0, 0);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.drawImage(this.drawcanvas, 0, 0);
    };

    Scratch.prototype.scratchPoint = function(x, y, fresh) {
        var ctx = this.drawcanvas.getContext('2d');
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000';
        if (fresh) {
            ctx.beginPath();
            // this +0.01 hackishly causes Linux Chrome to draw a
            // "zero"-length line (a single point), otherwise it doesn't
            // draw when the mouse is clicked but not moved:
            ctx.moveTo(x+0.01, y);
        }
        ctx.lineTo(x, y);
        ctx.stroke();

        var percent = this.getPercent();

        if(this.onScratch) {
            this.onScratch({
                x: x,
                y: y,
                percent: percent
            });
        }

        if(percent >= 100) {
            this.completed = true;

            if(this.onComplete) {
                this.onComplete();
            }
        }
    };

    Scratch.prototype.getPercent = function() {
        var hits = 0;
        var imageData;
        var totalPixels = this.maincanvas.width * this.maincanvas.height;

        imageData = this.maincanvas.getContext('2d').getImageData(
            0,
            0,
            this.maincanvas.width,
            this.maincanvas.height
        );
      
        for (var i = 0, ii = imageData.data.length; i < ii; i = i + 4) {
            if (
                imageData.data[i]   === 0 &&
                imageData.data[i+1] === 0 &&
                imageData.data[i+2] === 0 &&
                imageData.data[i+3] === 0
            ) {
                hits++;
            }
        }
      
        return (hits / totalPixels) * 100;
    };

    return Scratch;

}());