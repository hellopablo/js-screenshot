let namespace = 'js-screenshot';

// --------------------------------------------------------------------------

chrome.runtime.onMessage
    .addListener(function(msg) {
        if (msg.action === namespace + ':take') {
            console.log(msg);
            takeScreenShot(
                msg.data.id,
                msg.data.x,
                msg.data.y,
                msg.data.w,
                msg.data.h
            );
        }
    });

// --------------------------------------------------------------------------

function takeScreenShot(id, x, y, w, h) {
    chrome.tabs
        .captureVisibleTab(
            null,
            {},
            function(image) {
                cropScreenShot(image, id, x, y, w, h)
                    .then(
                        (result) => {
                            sendScreenShotToTab(result.id, result.image);
                        },
                        (error) => {
                            console.log('error', error);
                        }
                    )
                ;
            }
        );
}

// --------------------------------------------------------------------------

function cropScreenShot(image, id, x, y, w, h) {
    return new Promise(function(resolve, reject) {

        try {

            let loadTimer;
            let imgObject = new Image();

            imgObject.src = image;
            imgObject.onLoad = onImgLoaded();

            function onImgLoaded() {
                if (loadTimer != null) {
                    clearTimeout(loadTimer);
                }
                if (!imgObject.complete) {
                    loadTimer = setTimeout(function() {
                        onImgLoaded();
                    }, 3);
                } else {
                    onPreloadComplete();
                }
            }

            function onPreloadComplete() {
                resolve(
                    {
                        'id': id,
                        'image': getImagePortion(imgObject, x, y, w, h)
                    }
                );
            }

            function getImagePortion(imgObj, x, y, w, h) {

                x = x || 0;
                y = y || 0;
                w = w || imgObj.width;
                h = h || imgObj.height;

                let ratio = 2;

                //  New Image
                let tnCanvas = document.createElement('canvas');
                let tnCanvasContext = tnCanvas.getContext('2d');
                tnCanvas.width = w * ratio;
                tnCanvas.height = h * ratio;

                //  Existing image
                let bufferCanvas = document.createElement('canvas');
                let bufferContext = bufferCanvas.getContext('2d');
                bufferCanvas.width = imgObject.width * ratio;
                bufferCanvas.height = imgObject.height * ratio;

                bufferContext.drawImage(imgObject, 0, 0);

                //  Draw portion of existing image onto new image
                tnCanvasContext.drawImage(bufferCanvas, x, y, w * ratio, h * ratio, 0, 0, w * ratio, h * ratio);

                return tnCanvas.toDataURL();
            }

        } catch (e) {
            reject('Failed to crop image: ' + e.message);
        }
    });
}

// --------------------------------------------------------------------------

function sendScreenShotToTab(id, image) {
    chrome.tabs
        .query(
            {
                'active': true,
                'currentWindow': true
            },
            function(tabs) {
                chrome.tabs
                    .sendMessage(
                        tabs[0].id,
                        {
                            'action': namespace + ':receive',
                            'data': {
                                'id': id,
                                'image': image
                            }
                        }
                    );
            }
        );
}
