import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  StandaloneSearchBox,
  DirectionsRenderer,
  TrafficLayer,
} from "@react-google-maps/api";
import db from "./firebase";
import { Button, Input, Form } from "reactstrap";
import { FaLocationArrow, FaTimes } from "react-icons/fa";
import "./style.css";

//haritanın kaplayacagı alanı ve sürekli kendini centera göre güncellememisi için places dışarı yazdık
const libraries = ["places", "directions"];

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
  const [parkingData, setParkingData] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [sortedParkingData, setSortedParkingData] = useState([]);

  //harita yükleme
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_KEY,
    libraries,
  });

  //haritada bir noktaya tıklandıgında o kordinatları kaydeder. önceki markerlar kaybolur
  const onMapClick = useCallback((e) => {
    const newMarker = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
      time: new Date(),
    };
    setMarkers([newMarker]);
  }, []);

  //haritaya tıklanınca
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    setMap(map);
    setIsMapLoaded(true);
  }, []);

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
      console.log(geometry.location.lat());
      console.log(geometry.location.lng());
      // Oluşturulan markerı state içindeki markers listesine ekleyin
      setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

      console.log(place.formatted_address);
      console.log(place.geometry.location.lat());
      console.log(place.geometry.location.lng());
      console.log(place);

      // Yeni değeri destiantionRef veya originRef'e atayın
      console.log("destiantionBefore:", destiantionRef);
      destiantionRef.current.lat = geometry.location.lat();
      destiantionRef.current.lng = geometry.location.lng();
    }
  };

  //firebase
  useEffect(() => {
    const fetchData = async () => {
      const collectionRef = db.collection("otopark");
      const snapshot = await collectionRef.get();
      const parkingDataArray = [];

      snapshot.forEach((doc) => {
        const parking = {
          id: doc.id,
          ...doc.data(),
        };
        parkingDataArray.push(parking);
      });

      setParkingData(parkingDataArray);
    };

    fetchData();
  }, []);

  useEffect(() => {
    findNearestParking();
  }, [parkingData]);

  const findNearestParking = () => {
    if (
      destiantionRef.current &&
      destiantionRef.current.lat !== 0 &&
      destiantionRef.current.lng !== 0 &&
      parkingData.length > 0
    ) {
      const sortedData = [...parkingData];

      sortedData.sort((a, b) => {
        const distanceA = calculateDistance(
          destiantionRef.current.lat,
          destiantionRef.current.lng,
          a.coordinates._lat,
          a.coordinates._long
        );

        const distanceB = calculateDistance(
          destiantionRef.current.lat,
          destiantionRef.current.lng,
          b.coordinates._lat,
          b.coordinates._long
        );

        return distanceA - distanceB;
      });

      console.log("En Yakın Otopark:", sortedData[0]);
      console.log("En Uzak Otopark:", sortedData[sortedData.length - 1]);

      console.log("Sıralı Otoparklar:");
      sortedData.forEach((parking) => {
        const distance = calculateDistance(
          destiantionRef.current.lat,
          destiantionRef.current.lng,
          parking.coordinates._lat,
          parking.coordinates._long
        );
        console.log(`Otopark ID: ${parking.id}, Mesafe: ${distance} km`);
      });

      setSortedParkingData(sortedData);
     
      setShowForm(!showForm);
      if(!showForm){const nearestParkingMarkers = sortedData.slice(0, 3).map((parking) => ({
      id: parking.id,
      coordinates: {
        lat: parking.coordinates._lat,
        lng: parking.coordinates._long,
      },
    }));
    setMarkers(nearestParkingMarkers);
    
    }}
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    console.log("lat1 ve lng1 degeri: ", lat1, lng1);
    console.log("lat2 ve lng2 degeri: ", lat2, lng2);
    // İki nokta arasındaki mesafeyi hesaplayan fonksiyon
    // Burada haversine formülü kullanılıyor, gerçek kullanımınıza uygun şekilde güncellemelisiniz.
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  useEffect(() => {
    if (value) {
      setSelected(value);
    }
  }, [value]);

  //harita yüklenirken
  if (loadError) return "Error";
  if (!isLoaded) return "Loading...";

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
            <Button onClick={findNearestParking}>Nearlest Parking</Button>
            <div style={{ width: "5px" }}></div>
            <Button type="button" onClick={clearRoute}>
              <FaTimes />
            </Button>
          </div>
          <div>
            <span>Distance: {distance}</span>
            <span style={{ marginLeft: "100px" }}>Duration: {duration}</span>
            <span style={{ marginLeft: "100px" }}>
              <Button
                disabled={!isMapLoaded} // Harita yüklenmediyse buton devre dışı bırakılır
                onClick={() => {
                  map.panTo(center);
                  map.setZoom(13,5);
                }}
              >
                <FaLocationArrow />
              </Button>
            </span>
          </div>
        </Form>
      </div>

      {/*En yakın otoparklardan ilk 3 tanesi form ile sol alt kösede listelendi*/}
      {showForm && sortedParkingData.length > 0 && (
        <div className="form-otoparklist">
         <h4 style={{ fontWeight: "bold",textAlign: 'center',  marginTop: "0px"}}>En Yakın Otoparklar</h4>
          <hr style={{  marginTop: "0px"}}/> {/* Çizgi eklendi */}
          {sortedParkingData.slice(0, 3).map((parking, index) => {
            
            const distance = calculateDistance(
              destiantionRef.current.lat,
              destiantionRef.current.lng,
              parking.coordinates._lat,
              parking.coordinates._long
            );
            const formattedDistance = distance.toFixed(2);

            return (
              <div key={parking.id}>
                <p style={{ fontWeight: "bold", marginBottom: "2px" }}>
                  {parking.name}
                </p>
                <p
                  style={{
                    marginLeft: "20px",
                    fontSize: "smaller",
                    marginTop: "0px",
                  }}
                >
                  {parking.address}
                  <br />
                  Empty: {parking.empty} 
                  <br />
                  Mesafe: {formattedDistance} km
                </p>
              </div>
            );
          })}
        </div>
      )}
      {/*harita görüntüleme*/}
      <GoogleMap
        id="map"
        mapContainerStyle={mapContainerStyle}
        zoom={13}
        center={center}
        options={options}
        //onClick={onMapClick}
        onLoad={onMapLoad}
      >
        <TrafficLayer autoUpdate />
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
    </div>
  );
}

//Firebase verilerini listelemek
/* useEffect(() => {
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
  }, []);*/

/* async function findNearestParking() {
  const destination = destiantionRef.current.value;
  if (!destination) {
    console.log("Destination is required.");
    return;
  }

  const parsedDestination = await geocodeDestination(destination);

  const nearestParking = calculateNearestParking(parsedDestination);
  console.log("En yakın otopark:", nearestParking);
  calculateRoute();
}

function calculateNearestParking(destination) {
  let nearestParking = null;
  let nearestDistance = Infinity;

  markers.forEach((marker) => {
    const coordinates = marker.coordinates || marker;
    const distance = calculateDistance(destination, coordinates);

    if (distance < nearestDistance) {
      nearestParking = marker;
      nearestDistance = distance;
    }
  });

  return nearestParking;
}

async function geocodeDestination(destination) {
  const geocoder = new window.google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address: destination }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK) {
        const location = results[0].geometry.location;
        resolve({ lat: location.lat(), lng: location.lng() });
      } else {
        reject(new Error("Hedef konumu ayrıştırılamadı."));
      }
    });
  });
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
*/

//en yakın otoparkı bulan fonksiyon
/*async function findNearestParking() {
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
*/

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
