import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import db from "./firebase";

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
  //haritada arama yapmak için
  const inputRef = useRef();
  const handlePlacesChanged = () => {
    const [place] = inputRef.current.getPlaces();
    if (place) {
      console.log(place.formatted_address);
      console.log(place.geometry.location.lat());
      console.log(place.geometry.location.lng());
    }
  };

  //harita yükleme
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_KEY,
    libraries,
  });

  const [markers, setMarkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [value, setValue] = useState(null);

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

  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (value) {
      setSelected(value);
    }
  }, [value]);

  if (loadError) return "Error";
  if (!isLoaded) return "Loading...";

  return (
    <div>
      <StandaloneSearchBox
        onLoad={(ref) => (inputRef.current = ref)}
        onPlacesChanged={handlePlacesChanged}
      >
        <input type="text" className="form-control" placeholder="Enter" />
      </StandaloneSearchBox>

      <GoogleMap
        id="map"
        mapContainerStyle={mapContainerStyle}
        zoom={8}
        center={center}
        options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id} // Firestore doküman kimliği kullanılıyor
            position={{
              lat: marker.coordinates[0],
              lng: marker.coordinates[1],
            }}
            onClick={() => {
              setSelected(marker);
            }}
          />
        ))}

        {/* bir park seçilince infowindow yani bilgi kutusu açılacak */}
        {selected && (
          <InfoWindow
            position={{
              lat: selected.coordinates[0],
              lng: selected.coordinates[1],
              //lat: selected.geometry.coordinates[0],
              //lng: selected.geometry.coordinates[1],
            }}
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div>
              <h2>{selected.name}</h2>
              <p>Empty: {selected.empty}</p>
              {/*<p>{selectedPark.properties.DESCRIPTIO}</p>*/}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

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
