# Test all the things!

# Idea
Idea of this package is to get all-in-one package ready to easily setup functional and integration testing.

This package consists of two main parts:
* browser launcher (Google Chrome)
* proxy programmable via Sinon.JS stubs

# Install
```
npm link tatt
```
Note: you should have Google Chrome and Node.js with support of ES6 (at least v6.0)

# Getting started
Here is the sample script you can use to test browser commands:
```javascript
const tatt = require('tatt');

tatt.start().then(Tab => {
    return Tab.create('https://avito.ru/moskva').then((tab) => {
        return tab.typeText('#search', 'lala')
            .then(() => tab.click('.search.button'))
            .then(() => tab.waitFor('.item'))
            .then(() => tab.getAttr('.item a', 'href'))
            .then(href => console.log(href))
            .then(() => tab.close())
            .catch((err) => {
                console.log(err);
                tab.close();
            });
    });
}, err => {
    console.log(err);
})
.then(() => tatt.stop());
```

# Docs

## tatt.start()
`tatt.start` starts stubs proxy server and browser. It returns promise which will be resolved with `Tab` class used for monitoring.

Note: for now system designed in the way that permits running only one instance of `tatt`. So you should not try to run `tatt.start()` several times.

## tatt.stop()
`tatt.start` stops stubs proxy server and browser. It returns promise which will be resolved when everything was stopped.

## tatt.stubs
`tatt.stubs` contains Sinon.JS stubs used for programming proxy server behavior. It contains `http` and `https` stubs used in this way:
```javascript
stub.https.withArgs(
    sinon.match.has('url', sinon.match('/rest/text/terms/'))
).returns(
    ({ proxyToClientResponse: res }) => {
        res.setHeader('Content-Type', 'text/html');
        res.end(htmlText);
    }
);
```

Stub argument used for getting result function - is an incoming `ClientRequest` (see Node.js documentation). The result function will with [http-mitm-proxy Context object](https://github.com/joeferner/node-http-mitm-proxy/blob/master/README.md#context)

There is also `stubs.reset()` synchronous method which resets stubs to their default behavior (i.e. just proxying).

Note: you should not store `stubs.https` and `stubs.http` to variables because otherwise everything will be broken after `stubs.reset()`

## Tab methods

### Tab.load(url[, pageObject])
`Tab.load` - is an asynchronous `Factory Method`. It returns instance of `Tab` class.

It requires `url` for opening tab. But if the second param was specified it will also extend newly created tab with page object properties. For example the code below does the same thing as the code from "Getting started" section

```javascript
const tatt = require('tatt');

tatt.start().then(Tab => {
    return Tab.create('https://avito.ru/moskva', {
        button: '.search.button',
        item: '.item'
    }).then((tab) => {
        return tab.typeText('#search', 'lala')
            .then(() => tab.button.click())
            .then(() => tab.item.waitFor())
            .then(() => tab.getAttr('.item a', 'href'))
            .then(href => console.log(href))
            .then(() => tab.close())
            .catch((err) => {
                console.log(err);
                tab.close();
            });
    });
}, err => {
    console.log(err);
})
.then(() => tatt.stop());
```

### tab.waitFor(selector)
`tab.waitFor(selector)` returns promise to be resolved when element appeares on the page.

Note: element may be hidden via `display: none;`, but in this case the promise will be resolved anyway. If you want to handle such cases use `tab.waitForVisible(selector)` instead

### tab.waitForVisible(selector)
`tab.waitFor(selector)` returns promise to be resolved when element becomes visible on the page.
### tab.typeText(selector, text)
`tab.typeText(selector, text)` types `text` into node with `selector` selector. In the end it resolves the promise.
### tab.click(selector)
`tab.click(selector)` clicks on node with `selector`selector. In the end it resolves the promise.
### tab.countItems(selector)
`tab.countItems(selector)` returns promise to be resolved with number of element with `selector` selector presented on the page.
### tab.isVisible(selector, className)
`tab.isVisible(selector, className)`  returns promise to be resolved with `true` if element is visible on the page and `false` otherwise
### tab.getStyle(selector, propName)
`tab.getStyle(selector, propName)` returns promise to be resolved with computed `propName` style of element with `selector`.
### tab.getAttr(selector, attrName)
`tab.getAttr(selector, attrName)` returns promise to be resolved with `attrName` attribute of element with `selector` selector.
### tab.getText(selector)
`tab.getText(selector)` returns promise to be resolved with text content of element with `selector` selector
### tab.hasClass(selector, className)
`tab.hasClass(selector, className)` returns promise to be resolved with `true` if element has `className` class and `false` otherwise
### tab.reload()
`tab.reload()` reloads tab.
### tab.navigate(url)
`tab.navigate(url)` changes tab url.
### tab.close()
`tab.close()` closes tab.

## License

MIT
