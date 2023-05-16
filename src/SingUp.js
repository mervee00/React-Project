import React, { useState } from "react";
import { Form, FormGroup, Input } from "reactstrap";
import { Stack } from "react-bootstrap";
//import { useNavigate, Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { GrMapLocation } from "react-icons/gr";
import "./style.css";
import db from "./firebase";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import { InfoWindow } from "@react-google-maps/api";
//import otopark from "./data/otopark.json";

function SingUp() {
  const [carpark, setCarpark] = useState({
    name: "",
    address: "",
    country: "",
    empty: "",
    latitude: "",
    longitude: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  //const navigate = useNavigate();

  const onSingUp = (e) => {
    if (
      carpark.name === "" ||
      carpark.address === "" ||
      carpark.country === "" ||
      carpark.empty === "" ||
      carpark.latitude === "" ||
      carpark.longitude === ""
    ) {
      setError("Lütfen tüm alanları doldurunuz!");
      return;
    } else {
      e.preventDefault();
      // GeoPoint örneği oluşturun
      const geoPoint = new firebase.firestore.GeoPoint(
        Number(carpark.latitude),
        Number(carpark.longitude)
      );
      db.collection("otopark")
        .add({
          name: carpark.name,
          address: carpark.address,
          country: carpark.country,
          empty: Number(carpark.empty),
          coordinates: geoPoint,
        })
        .then(() => {
          setMessage("Kayıt tamamlandı!");
          console.log("Veriler başarıyla Firestore'a kaydedildi.");
          carpark.name = "" 
          carpark.address = "" 
          carpark.country = "" 
          carpark.empty ="" 
          carpark.latitude = "" 
          carpark.longitude = ""
        })
        .catch((error) => {
          console.error("Veri kaydederken bir hata oluştu:", error);
        });
    }
  };

  /*Kayıt işlemi
  const onSingUp = (e) => {
    //Inputlar boş mu kontrol eder
    if (
      carpark.name === "" ||
      carpark.address === "" ||
      carpark.country === "" ||
      carpark.empty === "" ||
      carpark.latitude === "" ||
      carpark.longitude === ""
    ) {
      setError("Lütfen tüm alanları doldurunuz!");
      return;
    } else {
      e.preventDefault();
      console.log(carpark);
      const model = carpark;
      localStorage.setItem("name", carpark.name);
      localStorage.setItem("address", carpark.address);
      localStorage.setItem("country", carpark.country);
      localStorage.setItem("empty", carpark.empty);
      localStorage.setItem("latitude", carpark.latitude);
      localStorage.setItem("longitude", carpark.longitude);

      //Fetch ile kayıt yapılır
      fetch(otopark, {
        method: "POST",
        body: JSON.stringify(model),
        headers: { "Content-type": "application/json; charset=UTF-8" },
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.id != null) {
            alert("Kayıt Başarılı. Giriş sayfasına yönlendiriliyorsunuz.");
            navigate("/");
          } else {
            alert("Lütfen bilgileri kontrol edin!");
          }
        })
        .catch((err) => console.log(err));
    }
  };*/

  // sadece numara girilmesine izin verir
  const handleKeyDown = (event) => {
    const isNumber = /[0-9.]/.test(event.key);
    if (!isNumber) {
      event.preventDefault();
    }
  };

  return (
    <div className="container ">
      <div className="itemCenter fullScreen mx-auto">
        <div className="form col-md-3 mx-auto">
          <GrMapLocation className="formIcon mx-auto" />
          <Form className="bg-blue" onSubmit={onSingUp}>
            <FormGroup>
              <Input
                id="name"
                name="name"
                placeholder="Carpark Name"
                type="text"
                value={carpark.name}
                onChange={(e) =>
                  setCarpark({ ...carpark, name: e.target.value })
                }
              />
              <Input
                id="address"
                name="address"
                placeholder="Carpark Address"
                type="text"
                value={carpark.address}
                onChange={(e) =>
                  setCarpark({ ...carpark, address: e.target.value })
                }
              />
              <Input
                id="country"
                name="country"
                placeholder="Carpark Country"
                type="text"
                value={carpark.country}
                onChange={(e) =>
                  setCarpark({ ...carpark, country: e.target.value })
                }
              />
              <Input
                id="empty"
                name="empty"
                placeholder="Carpark Empty Space"
                type="number"
                value={carpark.empty}
                onChange={(e) =>
                  setCarpark({ ...carpark, empty: e.target.value })
                }
                onKeyDown={handleKeyDown}
              />
              <Input
                id="latitude"
                name="latitude"
                placeholder="Carpark Latitude"
                type="number"
                value={carpark.latitude}
                onChange={(e) =>
                  setCarpark({ ...carpark, latitude: e.target.value })
                }
                onKeyDown={handleKeyDown}
              />
              <Input
                id="longitude"
                name="longitude"
                placeholder="Carpark Longitude"
                type="number"
                value={carpark.longitude}
                onChange={(e) =>
                  setCarpark({ ...carpark, longitude: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup>
              <Stack className="flex-end" direction="horizontal" gap="3">
                <Button variant="light"></Button>
                <Button variant="success" onClick={onSingUp}>
                  Save
                </Button>
              </Stack>
            </FormGroup>
          </Form>
          {error !== "" ? <div className="text-danger">{error}</div> : ""}
          {message !== "" ? <div className="text">{message}</div> : ""}
        </div>
      </div>
    </div>
  );
}
export default SingUp;
