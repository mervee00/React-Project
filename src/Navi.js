import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { GlobalContext } from "./GlobalState";

function Navi() {
  const navigate = useNavigate();
  const { setSvalue } = useContext(GlobalContext);

  //Çıkış yap
  const logOut = () => {
    localStorage.setItem("name", "");
    localStorage.setItem("username", "");
    navigate("/");
  };

  //navbar style
  const navStyle = {
    backgroundColor: "rgba(33, 150, 243, 0.8)", // mavi tonlarında arka plan rengi
  };
  //<HiUserGroup size="70" color="rgb(221 85 37)" /> icon kullanımı
  
  return (
    <Navbar style={navStyle} variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/home">
          &nbsp;&nbsp;Otopark Öneri Sistemi
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto navEnd fullWith">
            <div>
              <Nav.Link
                href="/"
                onClick={() => {
                  setSvalue(true);
                }}
              >
                Ana Sayfa
              </Nav.Link>
            </div>
            <div className="navEnd">
              <NavDropdown title="User" id="basic-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Sing Up</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">
                  Another action
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4" onClick={logOut}>
                  Log Out
                </NavDropdown.Item>
              </NavDropdown>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
export default Navi;
