/**
 * Injected by the extension, acts aas a middle man
 */
let namespace = 'js-screenshot';

// --------------------------------------------------------------------------

(function() {
    //  Let the inline JS know the extension exists
    document
        .dispatchEvent(
            new Event(namespace + ':extension-exists')
        );
    document
        .documentElement
        .setAttribute('data-' + namespace + '-extension', true);

    //  Bind events for taking and receiving screenshots
    document
        .addEventListener(namespace + ':take', function(e) {
            takeScreenShot(
                e.detail.id,
                e.detail.x,
                e.detail.y,
                e.detail.w,
                e.detail.h
            );
        });

    chrome.runtime.onMessage
        .addListener(function(msg) {
            if (msg.action === namespace + ':receive') {
                receiveScreenShotFromExtension(msg.data.id, msg.data.image);
            }
        });
})();

// --------------------------------------------------------------------------

function takeScreenShot(id, x, y, w, h) {
    chrome.runtime
        .sendMessage({
            'action': namespace + ':take',
            'data': {
                'id': id,
                'x': x,
                'y': y,
                'w': w,
                'h': h
            }
        });
}

// --------------------------------------------------------------------------

function receiveScreenShotFromExtension(id, image) {
    document
        .dispatchEvent(
            new CustomEvent(
                namespace + ':receive',
                {
                    'detail': {
                        'id': id,
                        'image': image
                    }
                }
            )
        );
}
