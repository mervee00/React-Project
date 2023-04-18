import React, { useState } from "react";
import { Form, FormGroup, Input } from "reactstrap";
import { Stack } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { GrMapLocation } from "react-icons/gr";
import "./style.css";
import otopark from './data/otopark.json';

function SingUp() {
  const [carpark, setCarpark] = useState({
    name: "",
    address: "",
    country: "",
    empty: "",
    latitude:"",
    longitude: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  //Kayıt işlemi
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
                onChange={(e) => setCarpark({ ...carpark, name: e.target.value })}
              />
              <Input
                id="address"
                name="address"
                placeholder="Carpark Address"
                type="text"
                value={carpark.address}
                onChange={(e) => setCarpark({ ...carpark, address: e.target.value })}
              />
               <Input
                id="country"
                name="country"
                placeholder="Carpark Country"
                type="text"
                value={carpark.country}
                onChange={(e) => setCarpark({ ...carpark, country: e.target.value })}
              />
              <Input
                id="empty"
                name="empty"
                placeholder="Carpark Empty Space"
                type="text"
                value={carpark.empty}
                onChange={(e) => setCarpark({ ...carpark, empty: e.target.value })}
              />
              {/*<Input
                id="latitude"
                name="latitude"
                placeholder="Carpark Latitude"
                type="text"
                value={carpark.latitude}
                onChange={(e) => setCarpark({ ...carpark, latitude: e.target.value })}
              />
              <Input
                id="longitude"
                name="longitude"
                placeholder="Carpark Longitude"
                type="text"
                value={carpark.longitude}
                onChange={(e) => setCarpark({ ...carpark, longitude: e.target.value })}
  />*/}
            </FormGroup>
            <FormGroup>
              <Stack className="flex-end" direction="horizontal" gap="3">
                <Button variant="light">
                  <Link to="/">Back</Link>
                </Button>
                <Button variant="success" onClick={onSingUp}>
                  Save
                </Button>
              </Stack>
            </FormGroup>
          </Form>
          {error !== "" ? <div className="text-danger">{error}</div> : ""}
        </div>
      </div>
    </div>
  );
}
export default SingUp;
