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
import { Button, ButtonGroup, Form } from "reactstrap";
import { FaLocationArrow, FaTimes } from "react-icons/fa";

//haritanın kaplayacagı alanı ve sürekli kendini centera göre güncellememisi için places dışarı yazdık
const libraries = ["places"];
const mapContainerStyle = {
  width: "69vw",
  height: "100vh",
};

//haritanın üzerinde rahat gezinebilmek için özellikleri ayarladık
const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

//harita ilk açıldıgında bulunacagı kordinatlar
const center = {
  lat: 39.896519,
  lng: 32.861969,
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

  //haritada bir noktaya tıklandıgında o kordinatları kaydeder
  const onMapClick = useCallback((e) => {
    setMarkers((current) => [
      ...current,
      {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        time: new Date(),
      },
    ]);
  }, []);

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
    }
  };

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
    originRef.current.value = "";
    destiantionRef.current.value = "";
  }

  return (
    <div>
      <Form className="text-center">
        <StandaloneSearchBox
          onLoad={(ref) => (originRef.current = ref)}
          onPlacesChanged={() => handlePlacesChanged(originRef)}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Enter Origin"
            ref={originRef}
          />
        </StandaloneSearchBox>

        <StandaloneSearchBox
          onLoad={(ref) => (destiantionRef.current = ref)}
          onPlacesChanged={() => handlePlacesChanged(destiantionRef)}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Enter Destiantion"
            ref={destiantionRef}
          />
        </StandaloneSearchBox>

        {/* Diğer form alanları */}

        <div className="d-flex justify-content-end mt-1">
          <div>
            <ButtonGroup>
              <Button type="button" onClick={calculateRoute}>
                Calculate Route
              </Button>
              <div style={{ width: "30px" }}></div> {/* Boşluk */}
              <Button onClick={clearRoute}>
                <FaTimes />
              </Button>
            </ButtonGroup>
          </div>
        </div>
        <div className="d-flex justify-content-end mt-1">
          <div>
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
        </div>
      </Form>

      <GoogleMap
        id="map"
        mapContainerStyle={mapContainerStyle}
        zoom={8}
        center={center}
        options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}
      >
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

        {directionsResponse && (
          <DirectionsRenderer directions={directionsResponse} />
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
              {/*<p>{selectedPark.properties.DESCRIPTIO}</p>*/}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

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
