import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { run as runHolder } from 'holderjs/holder';
import { Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom';

// Component which displays one single items - to be expanded
const Item = ({ identifier, item, description, img }) => {

  useEffect(() => {
    runHolder("item-holder-image")
  })

  return (
    <Card border="secondary" style={{height: "100%"}}>
      <Card.Img variant="top" src={img} className="item-holder-img"/>
      <Card.Body className="text-center">
        <h4>{item}</h4>
        <h5>{description}</h5>
        <Link to={"/auctions/"+identifier}>
          <Button variant="outline-secondary">Details</Button>
        </Link>
      </Card.Body>
    </Card>

  )
}

Item.propTypes = {
  identifier: PropTypes.number,
  item: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  img: PropTypes.string,
}

export default Item
