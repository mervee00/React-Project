import React, { useContext }from "react";
import { Link } from "react-router-dom";
import { ListGroup, ListGroupItem } from "reactstrap";
import { GlobalContext } from "./GlobalState";
import "./style.css";

function CategoryList() {
  const {setSvalue}=useContext(GlobalContext);
  return (
    <div className="category-list">
      <h2 className="itemCenter">
        <br />
        Menu
      </h2>
      <ListGroup>
        <ListGroupItem>
          <Link to="SingUp" onClick={()=>{setSvalue(false);}} >
            Otopark Kaydet
          </Link>
        </ListGroupItem>
        <ListGroupItem>
          <Link to="Contact">İletişim</Link>
        </ListGroupItem>
      </ListGroup>
    </div>
  );
}
export default CategoryList;
