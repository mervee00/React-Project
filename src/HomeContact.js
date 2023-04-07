import "./style.css";
//import { Form, FormGroup, Input, Button, ButtonGroup, Label } from "reactstrap";
//import { Stack } from "react-bootstrap";
import React, { useState, useMemo } from "react";
//import { FaLocationArrow, FaTimes } from "react-icons/fa";
//import {Route, NavLink, HashRouter from "react-router-dom";, useEffect
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  InfoWindow,
  //Autocomplete,
} from "react-google-maps";
import * as otoparkData from "./data/otopark.json";

function Map() {
  //seçilen parkı görebilmek için useState ile bos veri tanımladık
  const [selectedPark, setSelectedPark] = useState(null);
  const center = useMemo(() => ({ lat: 39.896519, lng: 32.861969 }), []);
  return (
    /*MAP fonksiyonunda googlemap ı hangi konumda ve ne kadar yakın açacagımızı belirttik */
    <GoogleMap
      zoom={10}
      center={center}
      //options={{style:"map-container"}}
    >
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
            setSelectedPark(park);
          }}
        />
      ))}

      {/* bir park seçilince infowindow yani bilgi kutusu açılacak */}
      {selectedPark && (
        <InfoWindow
          position={{
            lat: selectedPark.geometry.coordinates[1],
            lng: selectedPark.geometry.coordinates[0],
          }}
          onCloseClick={() => {
            setSelectedPark(null);
          }}
        >
          <div>
            <h2>{selectedPark.properties.name}</h2>
            {/*<p>{selectedPark.properties.DESCRIPTIO}</p>*/}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

const MapWrapped = withScriptjs(withGoogleMap(Map));

export default function HomeContact() {
  return (
    <div style={{ width: "69vw", height: "100vh" }}>
     {/* <Form className="form  mx-auto">
        <FormGroup>
          <Autocomplete>
            <Input
              id="origin"
              name="origin"
              type="text"
              placeholder="Origin" /*ref={originRef}
            />
          </Autocomplete>
        </FormGroup>
        <FormGroup>
          <Autocomplete>
            <Input
              id="destination"
              name="destination"
              type="text"
              placeholder="Destination" /*ref={destiantionRef}
            />
          </Autocomplete>
        </FormGroup>
        <FormGroup>
          <ButtonGroup>
            <Button
              colorScheme="pink"
              type="submit" /*onClick={calculateRoute}
            >
              Calculate Route
            </Button>
            <Button /*onClick={clearRoute}>
              <FaTimes aria-label="center back" />
            </Button>
          </ButtonGroup>
          <Stack className="end" direction="horizontal" gap="3">
            <Label>Distance: </Label>
            {/*{distance}}
            <Label>Duration: </Label>
            {/*{duration}}
            <Button
              onClick={() => {
                //map.panTo(center);
                //map.setZoom(15);
              }}
            >
              <FaLocationArrow aria-label="center back" isRound />
            </Button>
          </Stack>
        </FormGroup>
      </Form>
            */}
      {/* burada url imizi kullanarak google mapin ana sayfada yüklenmesini saglıyoruz */}
      <MapWrapped
        googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${process.env.REACT_APP_GOOGLE_KEY}`}
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `100%` }} />}
        mapElement={<div style={{ height: `90%` }} />}
      />
    </div>
  );
}
