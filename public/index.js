const publicVapidKey = ''
var { LMap, LTileLayer, LMarker, LPopup } = Vue2Leaflet;

let app = new Vue({
  el: '#app',
  components: { LMap, LTileLayer, LMarker, LPopup },
  data () {
    return {
      title: 'Chess Places in Athens',
      zoom: 18,
      url: 'https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiY2hyaXNoaGFtIiwiYSI6ImNqbm41YmFuazBhbGczcG1tdzJ2N2lxODIifQ.1zqJ_8uo97jWynz_iqVefQ',
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      userMarker: {
        icon: L.icon({
          iconUrl: 'images/greenMarker.png',
          iconSize: [38, 95]
        })
      },
      activeMarkerIndex: 0,
      userHasLocation: false,
      center: L.latLng(37.98508044703298, 23.725662231445312),
      newMarkerLatLng: L.latLng(37.98508044703298, 23.725662231445312),
      showModal: false,
      markers: [
        {
          title: 'Καφενείο Απολλώνιον',
          lat: 37.91508044703298,
          lng: 23.725662231445312,
          img: 'images/img4.jpg',
          address: 'Θεμιστοκλέους 6 Αθήνα, ΤΚ:13688',
          description: 'Το πιο ήσυχο μέρος για σκάκι!'
        },
        {
          title: 'Σκακιστικός σύλλογος "Μουριά"',
          lat: 37.94508044703298,
          lng: 23.725662231445312,
          img: 'images/img1.jpg',
          address: 'Θεμιστοκλέους 6 Αθήνα, ΤΚ:13688',
          description: 'Πολύ καλοί οι αντίπαλοι!'
        },
        {
          title: 'Το κόκκινο καφενείο',
          lat: 37.93508044703298,
          lng: 23.725662231445312,
          img: 'images/img2.jpg',
          address: 'Θεμιστοκλέους 6 Αθήνα, ΤΚ:13688',
          description: 'Σε αυτές τις σκακιέρες έπαιξε ο Kasparov! Και ο Kramnik και ο Anand!'
        },
        {
          title: 'Τα μαύρα καλάθια',
          lat: 37.92508044703298,
          lng: 23.725662231445312,
          img: 'images/img3.jpg',
          address: 'Θεμιστοκλέους 6 Αθήνα, ΤΚ:13688',
          description: 'Απολαύστε την παρτίδα σας παρέα με τον πιο νόστιμο καφέ της πόλης!'
        }
      ],
      newMarkerMode: false,
      map: null,
      newMarker: null,
      markerToEdit: {
        title: 'Καφενείο Απολλώνιον',
        lat: 37.91508044703298,
        lng: 23.725662231445312,
        img: 'https://dummyimage.com/300',
        address: 'Θεμιστοκλέους 6 Αθήνα, ΤΚ:13688',
        description: 'Το πιο ήσυχο μέρος για σκάκι!'
      }
    }
  },
  mounted () {
    let publicKey = 'BHU2T6aEJ7wtyjVYWSAcWj0XmHYxyFU0EYAriuWdROjk6KekylcK5Bx0LQxtiGF8sxN98rKxRl1D9N5BSdY0Lxw'
    navigator.serviceWorker && navigator.serviceWorker.register('./sw.js').then(function (registration) {
      console.log('Excellent, registered with scope: ', registration.scope);
    });
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
              console.log('Sending push');
              return fetch('/subscribe', {
                method: 'POST',
                body: JSON.stringify(subscription),
                headers: {
                  'content-type': 'application/json'
                }
              });
            })
            .then(() => console.log('Sent push'))
            .catch(error => console.log(error))
        })
    });
    this.$nextTick(() => { this.map = this.$refs.map.mapObject })
    this.$nextTick(() => { this.newMarker = this.$refs.newMarker.mapObject })
    this.$nextTick(() => { this.setActiveMarker() })
    getPosition()
      .then(location => {
        console.log("calculate user position")
        this.userHasLocation = true;
        this.userMarker.latLng = L.latLng(location.coords.latitude, location.coords.longitude)
        // this.center = Object.assign({}, this.userMarker.latLng)
        this.markers = this.markers.map(el => Object.assign({}, el, { distance: calcDistance(location.coords.latitude, location.coords.longitude, el.lat, el.lng) }))
        this.markers.sort((a, b) => a.distance - b.distance)
      })
      .catch(err => {
        console.error(err.message);
        alert("Σφάλμα στον καθορισμό της θέσης σας.");
      })
  },
  methods: {
    markerClicked (marker) {
      this.activeMarkerIndex =  this.markers.findIndex(el => el === marker)
      this.center = this.latLng(this.markers[this.activeMarkerIndex].lat, this.markers[this.activeMarkerIndex].lng)
    },
    nextPrevMarker (action, marker) {
      if (action === 'previous') this.activeMarkerIndex--
      else this.activeMarkerIndex++
      this.setActiveMarker()
    },
    setActiveMarker () {
      this.center = this.latLng(this.markers[this.activeMarkerIndex].lat, this.markers[this.activeMarkerIndex].lng)
      this.zoom = 18
      this.$refs.marker[this.activeMarkerIndex].mapObject.openPopup()
    },
    showNewMarker () {
      this.newMarkerMode = true
      this.newMarker.setOpacity(1)
      let center = this.$refs.map.mapObject.getCenter()
      console.log(center)
      this.newMarker.setLatLng(center)
    },
    hideNewMarker () {
      this.newMarkerMode = false
      this.newMarker.setOpacity(0)
    },
    latLng (lat, lng) {
      return L.latLng(lat, lng)
    },
    insertNewMarker () {
      this.markerToEdit.lat = this.newMarkerLatLng.lat
      this.markerToEdit.lng = this.newMarkerLatLng.lng
      this.markers.push(this.markerToEdit)
      this.hideNewMarker()
      this.showModal = false
      console.log(this.markerToEdit)
    }
  }
});