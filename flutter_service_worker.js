'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "5f4803f7166a4f2e9433c57344310bd7",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/images/boy.png": "7085d436b2d0d50dc1f5a9af6a8d702c",
"assets/images/boy1.png": "d7fd9e0b952d5f9b9adff6ec29a8b20d",
"assets/images/boy2.png": "427b9fe13ffc57b7eb352c239ae8112a",
"assets/images/boy3.png": "efdfb26c1a51883cf7c16666ef355386",
"assets/images/facebook.png": "8f5ce27564945d2c9a10ef827549a78c",
"assets/images/female.png": "f98cfaf71d47e48de3ac0e7b8897242a",
"assets/images/gamer.png": "a1654c4cb205df7bf1e3892df0fc2201",
"assets/images/github.png": "1b9b9f71269e504156ce9d89a00f2551",
"assets/images/instagram.png": "5c570427ee23f69853d28aec805eee79",
"assets/images/linkedin.png": "30c453b7f5fbdb09ea0cb42a5dc7a6e5",
"assets/images/logo.png": "c5ddd170b1c4d2745c321a38c6f7f2bb",
"assets/images/maasai.png": "e177fa2b00dd35857ce6f9abaa090bdc",
"assets/images/man.png": "bd80794fddbffb4031fab537cc898680",
"assets/images/man1.png": "6f2bab193b29900a280514754925b38e",
"assets/images/man2.png": "579b1824fa469e13ecd891769e9f3eaf",
"assets/images/man3.png": "071227c3e15939d2b282f0c89b015a0b",
"assets/images/man4.png": "47305402a5e102588c9946a65939438a",
"assets/images/profile.png": "ecb3320a4cb66ecdd9dd903f1fd6a5d8",
"assets/images/programmer.png": "afadaa94f21d3a10f26fcd1c1ed43217",
"assets/images/soccerplayer.png": "fab980b20d0053f7d413069ff1154dd4",
"assets/images/spanish.png": "df6448e3b06e28bacc75262617cb82b2",
"assets/images/teenager.png": "b7ed42119f5337de92f0e7a3e2e74d8d",
"assets/images/twitter.png": "8f35a40403a84631c4125c4f1859c7a6",
"assets/images/user.png": "3e4af0acbc1aabaf026aa2cf9fb8c123",
"assets/images/woman.png": "b8bdbf6da2cd74d3be174f93b90c55db",
"assets/images/woman1.png": "2db113dd0f1492d7f98521db924f9479",
"assets/images/woman2.png": "2f070cc508eddbccef17435b2df5f9a9",
"assets/images/woman3.png": "bad45a40fa6e153ef8d1599ba875102c",
"assets/images/youngman.png": "53c06a17b0bac31dc345705c1429b1d1",
"assets/NOTICES": "2c496db24ef21a4306ece1cbee4903c3",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "2fa7bff45b400df6f576a51ccf9c62b6",
"/": "2fa7bff45b400df6f576a51ccf9c62b6",
"main.dart.js": "056cb796ccf3078c2975dcda755dee95",
"manifest.json": "fcb93ade9211b7b4fb164f7cc217fc1b",
"version.json": "111adebc93e9b7fca8508702eb9e22a4"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
