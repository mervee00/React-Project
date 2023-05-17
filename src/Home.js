import React, { useContext } from "react";
import CategoryList from "./CategoryList";
import Navi from "./Navi";
import { Col, Row } from "reactstrap";
import { Outlet } from "react-router-dom";
import HomeContact from "./HomeContact";
import { GlobalContext } from "./GlobalState";

function Home() {
  const { svalue } = useContext(GlobalContext);
  return (
    <div>
      {/*Reactstrap install ile indirilip import ile entegre edilir*/}
      <Navi />
      <Row>
        <Col xs="2">
          <CategoryList />
        </Col>
        <Col xs="9">
          {svalue === true ? <HomeContact /> : <Outlet />}
          {/* <HomeContact />
            <Outlet /> */}
        </Col>
      </Row>
    </div>
  );
}
export default Home;
