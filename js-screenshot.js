class JSScreenshot {

    /**
     * Construct JSScreenshot
     */
    constructor() {
        this.isReady = false;
        this.onReady = false;
        this.onLoad = null;
        this.onReceive = null;
        this.id = 'js-screenshot-' + this.generateId();
        this.extension = {
            'installed': false
        };

        //  Detect extension
        document
            .addEventListener('js-screenshot:extension-exists', () => {
                this.extension.installed = true;
                this.ready();
            });

        if (document.documentElement.dataset['js-screenshot-extension']) {
            this.extension.installed = true;
            this.ready();
        }

        //  Listen for screenshots
        document
            .addEventListener('js-screenshot:receive', (e) => {
                if (e.detail.id === this.id && this.onReceive) {
                    this.onReceive.call(null, e.detail.image);
                }
            });
    }

    // --------------------------------------------------------------------------

    /**
     * Generate a random ID so multiple instances can co-exist
     * @returns {String}
     */
    generateId() {
        return this.randomString() +
            this.randomString() +
            this.randomString();
    }

    // --------------------------------------------------------------------------

    /**
     * Generate a random string
     * @returns {string}
     */
    randomString() {
        return Math.random().toString(36).replace(/[^a-z]+/g, '');
    }

    // --------------------------------------------------------------------------

    /**
     * Set a callable to execute when the extension is ready
     * @param {function} callable A function to call
     * @returns {JSScreenshot}
     */
    loaded(callable) {
        this.onLoad = callable;
        if (this.isReady) {
            this.ready();
        }

        return this;
    }

    // --------------------------------------------------------------------------

    /**
     * Marks the extension as ready and calls any loaded callables
     */
    ready() {
        this.isReady = true;
        if (this.onLoad) {
            this.onLoad.call();
        }
    }

    // --------------------------------------------------------------------------

    /**
     * Sets a callable to execute when a screenshot is received
     * @param {function} callable A function to call
     * @returns {JSScreenshot}
     */
    receive(callable) {
        this.onReceive = callable;
        return this;
    }

    // --------------------------------------------------------------------------

    /**
     * Returns whether the extension is installed or not
     * @returns {boolean}
     */
    isExtensionInstalled() {
        return this.extension.installed;
    }

    // --------------------------------------------------------------------------

    /**
     * Prompts the user to install the extension
     */
    installExtension(success, failure) {

        //  Ensure link exists in <head>
        let link = document.createElement('link');
        link.rel = 'chrome-webstore-item';
        link.href = 'https://chrome.google.com/webstore/detail/jhabnfakkhdeonggiocgbghgdnpjdocg';
        document.head.appendChild(link);

        chrome.webstore.install(link.href, success, failure);
    }

    // --------------------------------------------------------------------------

    /**
     * Takes a screenshot
     * @param {Number} x If cropping, the crop's upper left X co-ordinate
     * @param {Number} y If cropping, the crop's upper left Y co-ordinate
     * @param {Number} w If cropping, the width of the crop in pixels
     * @param {Number} h If cropping, the height of the crop in pixels
     */
    take(x, y, w, h) {
        document
            .dispatchEvent(
                new CustomEvent(
                    'js-screenshot:take',
                    {
                        'detail': {
                            'id': this.id,
                            'x': x,
                            'y': y,
                            'w': w,
                            'h': h
                        }
                    }
                )
            );
    }
}

export default JSScreenshot;
