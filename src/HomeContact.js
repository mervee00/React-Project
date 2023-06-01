import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  StandaloneSearchBox,
  DirectionsRenderer,
} from "@react-google-maps/api";
import db from "./firebase";
import { Button, Input, Form } from "reactstrap";
import { FaLocationArrow, FaTimes } from "react-icons/fa";
import "./style.css";

//haritanın kaplayacagı alanı ve sürekli kendini centera göre güncellememisi için places dışarı yazdık
const libraries = ["places", "directions"];
//const libraries = ["places"];
const mapContainerStyle = {
  width: "81vw",
  height: "100vh",
};

//haritanın üzerinde rahat gezinebilmek için özellikleri ayarladık
const options = {
  disableDefaultUI: true,
};

//harita ilk açıldıgında bulunacagı kordinatlar
const center = {
  lat: 39.933365,
  lng: 32.859741,
};

export default function HomeContact() {
  const [map, setMap] = useState(/** @type google.maps.Map */ null);
  const originRef = useRef(null);
  const destiantionRef = useRef(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [value, setValue] = useState(null);
  const mapRef = useRef();

  //harita yükleme
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_KEY,
    libraries,
  });
  /*const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_KEY,
    libraries,
  });*/

  //haritada bir noktaya tıklandıgında o kordinatları kaydeder. önceki markerlar kaybolur
  const onMapClick = useCallback((e) => {
    const newMarker = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
      time: new Date(),
    };
    setMarkers([newMarker]);
  }, []);
  /*//önceki markerlar durur.
 const onMapClick = useCallback((e) => {
    setMarkers((current) => [
      ...current,
      {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        time: new Date(),
      },
    ]);
  }, []);*/

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    setMap(map);
    setIsMapLoaded(true);
  }, []);

  //Firebase verilerini listelemek
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from Firestore database
        db.collection("otopark")
          .get()
          .then((querySnapshot) => {
            const data = querySnapshot.docs.map((doc) => {
              const { coordinates, ...rest } = doc.data();
              return {
                id: doc.id,
                coordinates: {
                  lat: coordinates.latitude,
                  lng: coordinates.longitude,
                },
                ...rest,
              };
            });
            setMarkers(data);
          });
      } catch (error) {
        console.log("error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (value) {
      setSelected(value);
    }
  }, [value]);

  //haritada arama yapmak için
  const handlePlacesChanged = (ref) => {
    const places = ref.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const { geometry } = place;

      // Yeni değeri ref'e atayın
      ref.current.value = place.formatted_address;

      // Yeni bir marker oluşturun
      const newMarker = {
        lat: geometry.location.lat(),
        lng: geometry.location.lng(),
      };

      // Oluşturulan markerı state içindeki markers listesine ekleyin
      setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

      console.log(place.formatted_address);
      console.log(place.geometry.location.lat());
      console.log(place.geometry.location.lng());
      console.log(place);
      //setHedef(place);
    }
  };

  //harita yüklenirken
  if (loadError) return "Error";
  if (!isLoaded) return "Loading...";

  /* const { google } = window;
  async function calculateRoute() {
    if (
      !originRef.current ||
      !originRef.current.value ||
      !destiantionRef.current ||
      !destiantionRef.current.value
    ) {
      return;
    }
  
    const directionsService = new google.maps.DirectionsService();
  
    const trafficOptions = {
      departure_time: new Date().getTime(), // Geçerli zaman için trafik verisini kullanacak
      trafficModel: google.maps.TrafficModel.BEST_GUESS,
    };
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destiantionRef.current.value,
      travelMode: google.maps.TravelMode.DRIVING,
      ...trafficOptions,
    });
  
    setDirectionsResponse(results);
    setDistance(results.routes[0].legs[0].distance.text);
    setDuration(results.routes[0].legs[0].duration.text);
  }
  */

  //route yapmak için
  async function calculateRoute() {
    if (
      !originRef.current ||
      !originRef.current.value ||
      !destiantionRef.current ||
      !destiantionRef.current.value
    ) {
      return;
    }
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destiantionRef.current.value,

      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    });
    setDirectionsResponse(results);
    setDistance(results.routes[0].legs[0].distance.text);
    setDuration(results.routes[0].legs[0].duration.text);
  }

  //degişkenlerin içini bosaltır
  function clearRoute() {
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");
    originRef.current.value = ""; // Origin inputunu boşaltın
    destiantionRef.current.value = "";
    //inputları temizlemediği için sayfayı refresh yaptırdık
    window.location.reload();
  }

  //en yakın otoparkı bulan fonksiyon
  async function findNearestParking() {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const currentLocation = { lat: latitude, lng: longitude };

      const nearestParking = await calculateNearestParking(currentLocation);
      console.log("En yakın otopark:", nearestParking);
      calculateRoute();
    }, handleLocationError);
  }
  function calculateNearestParking(currentLocation) {
    let nearestParking = null;
    let nearestDistance = Infinity;

    markers.forEach((marker) => {
      const coordinates = marker.coordinates || marker;
      const distance = calculateDistance(currentLocation, coordinates);

      if (distance < nearestDistance) {
        nearestParking = marker;
        nearestDistance = distance;
      }
    });

    return nearestParking;
  }
  function calculateDistance(location1, location2) {
    const lat1 = location1.lat;
    const lng1 = location1.lng;
    const lat2 = location2.lat;
    const lng2 = location2.lng;

    const R = 6371; // Dünya'nın yarıçapı (km)
    const dLat = degToRad(lat2 - lat1);
    const dLng = degToRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(degToRad(lat1)) *
        Math.cos(degToRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  function degToRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  function handleLocationError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        console.log("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        console.log("An unknown error occurred.");
        break;
      default:
        console.log("An unknown error occurred.");
        break;
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-center align-items-center mt-3 form-container form">
        <Form className="w-52 ">
          <div className="d-flex justify-content-between mb-3">
            <StandaloneSearchBox
              onLoad={(ref) => (originRef.current = ref)}
              onPlacesChanged={() => handlePlacesChanged(originRef)}
            >
              <Input
                type="text"
                className="form-control"
                placeholder="Enter Origin"
                ref={originRef}
              />
            </StandaloneSearchBox>
            <div style={{ width: "5px" }}></div>
            <StandaloneSearchBox
              onLoad={(ref) => (destiantionRef.current = ref)}
              onPlacesChanged={() => handlePlacesChanged(destiantionRef)}
            >
              <Input
                type="text"
                className="form-control"
                placeholder="Enter Destination"
                ref={destiantionRef}
              />
            </StandaloneSearchBox>
            <div style={{ width: "5px" }}></div>
            <Button type="button" onClick={calculateRoute}>
              Calculate Route
            </Button>
            <div style={{ width: "5px" }}></div>
            <Button type="button" onClick={clearRoute}>
              <FaTimes />
            </Button>
          </div>
          <div className="d-flex justify-content-between">
            <span>Distance: {distance}</span>
            <span style={{ marginLeft: "100px" }}>Duration: {duration}</span>
            <span style={{ marginLeft: "100px" }}>
              <Button
                disabled={!isMapLoaded} // Harita yüklenmediyse buton devre dışı bırakılır
                onClick={() => {
                  map.panTo(center);
                  map.setZoom(15);
                }}
              >
                <FaLocationArrow />
              </Button>
            </span>
          </div>
        </Form>
      </div>
      {/*harita görüntüleme*/}
      <GoogleMap
        id="map"
        mapContainerStyle={mapContainerStyle}
        zoom={13}
        center={center}
        options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}
      >
        {/*markerlar haritada cordinatlara göre konumlara işaret bırakır*/}
        {markers.map((marker, index) => (
          <Marker
            key={marker.id || index}
            position={
              marker.coordinates || { lat: marker.lat, lng: marker.lng }
            }
            onClick={() => {
              setSelected(marker);
            }}
          />
        ))}
        {/*yol tarifini görsel olarak gösteriyor*/}
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              suppressMarkers: true, // Yol üzerindeki varsayılan işaretleri gizler
              preserveViewport: true, // Haritanın görüntülemesini korur
              polylineOptions: {
                strokeColor: "blue", // Yol çizgisi rengi
                strokeOpacity: 0.6, // Yol çizgisi opaklığı
                strokeWeight: 5, // Yol çizgisi kalınlığı
              },
            }}
          />
        )}
        {/*directionsResponse && (
          <DirectionsRenderer directions={directionsResponse} />
        )*/}
        {/* bir park seçilince infowindow yani bilgi kutusu açılacak */}
        {selected && (
          <InfoWindow
            position={
              selected.coordinates /*|| { lat: selected.lat, lng: selected.lng }*/
            }
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div>
              {/*infowindowda yazacak bilgiler*/}
              <h2>{selected.name}</h2>
              <p>Address: {selected.address}</p>
              <p>Empty: {selected.empty}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      <Button onClick={findNearestParking}>En Yakın Otoparkı Bul</Button>
    </div>
  );
}

/*en yakın otoparkı geolib fonsiyonu ile bulmak
 async function calculateNearestParking(currentLocation) {
    const distances = markers.map((marker) => {
      const coordinates = marker.coordinates || marker;
      const distance = geolib.getDistance(currentLocation, coordinates);
      return { id: marker.id, distance };
    });

    const nearestParkingId = distances.reduce(
      (min, marker) => (marker.distance < min.distance ? marker : min),
      distances[0]
    ).id;

    const nearestParking = markers.find(
      (marker) => marker.id === nearestParkingId
    );

    return nearestParking;
  }*/
/*hedef && (
  <>
    <Marker
      position={{
        lat: hedef.geometry.location.lat(),
        lng: hedef.geometry.location.lng(),
      }}
    />
    <GoogleMap.Circle center={hedef.geometry.location} radius={150} />
    <GoogleMap.Circle center={hedef.geometry.location} radius={300} />
    <GoogleMap.Circle center={hedef.geometry.location} radius={450} />
  </>
    )*/
/*  const defaultOptions = {
      strokeOpacity: 0.5,
      strokeWeight: 2,
      clickable: false,
      draggable: false,
      editable: false,
      visible: true,
    };
    const closeOptions = {
      ...defaultOptions,
      zIndex: 3,
      fillOpacity: 0.05,
      strokeColor: "#8BC34A",
      fillColor: "#8BC34A",
    };
    const middleOptions = {
      ...defaultOptions,
      zIndex: 2,
      fillOpacity: 0.05,
      strokeColor: "#FBC02D",
      fillColor: "#FBC02D",
    };
    const farOptions = {
      ...defaultOptions,
      zIndex: 1,
      fillOpacity: 0.05,
      strokeColor: "#FF5252",
      fillColor: "#FF5252",
    };*/
/*
  useEffect(() => {
    const fetchData = (async) => {
      try {
        // Fetch data from Firestore database
        db.collection("otopark")
          .get()
          .then((querySnapshot) => {
            const data = querySnapshot.docs.map((doc) => ({
              id: doc.id, // Firestore doküman kimliği
              ...doc.data(),
            }));
            setMarkers(data);
          });
      } catch (error) {
        console.log("error fetching data:", error);
      }
    };
    fetchData();
  }, []);
*/

/*window.addEventListener("load", () => {
    Fetchdata();
  });

  // Fetch the required data using the get() method
  const Fetchdata = () => {
    db.collection("otopark")
      .get()
      .then((querySnapshot) => {
        // Loop through the data and store
        // it in array to display
        querySnapshot.forEach((element) => {
        const  otopark = element.otopark();
          setInfo((arr) => [...arr, otopark]);
        });
      });
  };
*/
