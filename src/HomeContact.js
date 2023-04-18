import React from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import * as otoparkData from "./data/otopark.json";

//search işlemiiçin importlar yapıldı
/*import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";*/

//haritaın kaplayacagı alanı ve sürekli kendini centera göre güncellememisi için places dışarı yazdık
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

//harita ilk açıldıgında bulunacagıkordinatlar
const center = {
  lat: 39.896519,
  lng: 32.861969,
};

export default function HomeContact() {
  //harita yükleme
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_KEY,
    libraries,
  });

  const [markers, setMarkers] = React.useState([]);
  const [selected, setSelected] = React.useState(null);

  //haritada bir noktaya tıklandıgında o kordinatları kaydeder
  const onMapClick = React.useCallback((e) => {
    setMarkers((current) => [
      ...current,
      {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        time: new Date(),
      },
    ]);
  }, []);

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  if (loadError) return "Error";
  if (!isLoaded) return "Loading...";

  return (
    <div>
      {/*<Search  />panTo={panTo}*/}
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
            key={`${marker.lat}-${marker.lng}`}
            position={{ lat: marker.lat, lng: marker.lng }}
            //onClick={() => { setSelected(marker);}}
          />
        ))}

        {/*json dosyasındaki verileri kullanarak parkların yerini marker ile belirttik */}
        {otoparkData.features.map((park) => (
          <Marker
            key={park.properties.carId}
            position={{
              lat: park.geometry.coordinates[0],
              lng: park.geometry.coordinates[1],
            }}
            //listelenen parka tıklandıgında küçük bir bilgi göstermesi için
            onClick={() => {
              setSelected(park);
            }}
          />
        ))}
        {/* bir park seçilince infowindow yani bilgi kutusu açılacak */}
        {selected && (
          <InfoWindow
            position={{
              lat: selected.geometry.coordinates[0],
              lng: selected.geometry.coordinates[1],
            }}
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div>
              <h2>{selected.properties.name}</h2>
              {/*<p>{selectedPark.properties.DESCRIPTIO}</p>*/}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
/*
function Search() {//{ panTo }
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => 39.896519, lng: () => 32.861969 },
      radius: 100 * 1000,
    },
  });

  const handleInput = (e) => {
    setValue(e.target.value);
  };

  return (
    <div style="search">
      <Combobox
        onSelect={(address) => {
          console.log(address);
        }}
      >
        <ComboboxInput
          value={value}
          onChange={handleInput}
          disabled={!ready}
          placeholder="Search your location"
        />
        <ComboboxPopover>
          <ComboboxList>
            {/*{status === "OK" &&
              data.map(({ id, description }) => (
                <ComboboxOption key={id} value={description} />
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}*/
