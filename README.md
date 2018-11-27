[First understand how push works](https://developers.google.com/web/fundamentals/push-notifications/how-push-works)

Tested on chrome

Then generate the keys with

yarn run genKeys

 Go to the Application panel, click the Service Workers tab and check the Update on Reload checkbox. When this checkbox is enabled the service worker is forcibly updated every time the page reloads.

https://codelabs.developers.google.com/codelabs/migrate-to-progressive-web-apps/index.html?index=..%2F..%2Findex#0


A 144px square PNG icon, which will represent your app at Homescreen, is required

create manifest.json
```json
{
  "name": "ChessPlaces",
  "short_name": "♞♘♞♘♞♘♞♘",
  "display": "minimal-ui",
  "start_url": "/",
  "theme_color": "#673ab6",
  "background_color": "#111111",
  "icons": [
    {
      "src": "images/icon-144.png",
      "sizes": "144x144",
      "type": "image/png"
    }
  ]
}
```

create sw.js

```javascript
/** An empty service worker! */
self.addEventListener('fetch', function(event) {
  /** An empty fetch handler! */
});
```

add this code at the start of your js file

```javascript
navigator.serviceWorker && navigator.serviceWorker.register('./sw.js').then(function(registration) {
  console.log('Excellent, registered with scope: ', registration.scope);
});
```
Now ou can add to home screen 
https://developers.google.com/web/fundamentals/app-install-banners/?hl=en

index.js

visit chrome://apps/

### Subscribe to push
We need public/private keys :

head to Push Companion : https://web-push-codelab.glitch.me/

we have to include function :

```javascript
function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
```

index.js

```javascript
    let publicKey = "BC-eIJ7oNtJMnXkC3sh-LVvq65r5yYjL7aw0-AwsU2dZx6HHPIyg8jw07Jpaie-vLyyne1wP1j3aGZDqdV32iBo"

    navigator.serviceWorker && navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
      serviceWorkerRegistration.pushManager.getSubscription()
        .then(function (subscription) {
          if (subscription) {
            console.info('Got existing', subscription);
            window.subscription = subscription;
            return;  // got one, yay
          }

          const applicationServerKey = urlBase64ToUint8Array(publicKey);
          serviceWorkerRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          })
            .then(function (subscription) {
              console.info('Newly subscribed to push!', subscription);
              window.subscription = subscription;
            });
        });
    });
```
