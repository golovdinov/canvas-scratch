# canvas-scratch
JavaScript plugin for scratch effect.

![Demo](/demo.gif)

## Usage

### Install:

    bower install canvas-scratch

...or manual.

### Example:

```javascript
scratch({
    wrapper: document.getElementById('scratch'),
    imageUrl: 'scratch.jpg',
    lineWidth: 60,
    mode: scratch.MODE_WITHOUT_MOUSEDOWN,
    onInit: function() { ... },
    onComplete: function() { ... },
    onScratch: function(e) {
        // e.percent
    }
});
```

### Including:
* As AMD or CommonJS module.
* Traditional <code>&lt;script src="..."&gt;</code> including makes <var>scratch</var> golobal.

## Configuration

<i>DOMElement</i> <b>wrapper</b> (required) - a DOM element where the canvas will be placed.

<i>string</i> <b>imageUrl</b> (required) - path to an image that will be scratched. Canvas will be resized to the image width & height.

<i>int</i> <b>lineWidth</b> (required)

<b>mode</b> (required):
* scratch.MODE_WITH_MOUSEDOWN
* scratch.MODE_WITHOUT_MOUSEDOWN

<i>function</i> <b>onInit</b> (optional) - called when the image is loaded and canvas created.

<i>function</i> <b>onComplete</b> (optional) - called when user scratched the hole image.

<i>function</i> <b>onScratch(event)</b> (optional) - called every scratch movement. <var>event</var> object contains <var>x</var>, <var>y</var> and <var>percent</var> properties.


## Browser requirements

* [Canvas support](http://caniuse.com/#feat=canvas)

## Run an example

You can faced with Cross-Origin issue while running a demo on your local machine.
So you have to run a demo on any web server.

For example, you can run simple [Node.js HTTP Server](https://www.npmjs.com/package/http-server):

    npm install http-server -g

    http-server

## License

MIT