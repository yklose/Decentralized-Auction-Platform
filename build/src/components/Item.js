import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { run as runHolder } from 'holderjs/holder';
import { Link } from 'react-router-dom';

// Component which displays one single items - to be expanded
const Item = ({ identifier, item, description, img }) => {

  useEffect(() => {
    runHolder("item-holder-image")
  })

  return (
    <div className="custom-card" style={{backgroundImage:`url(${img})`}}>
      <div className="custom-card-content"> 
        <h3 className="custom-card-title">
          {item}
        </h3>
        <p className="custom-card-body">
          {description}
        </p>
        <Link to={"/auctions/"+identifier} className="custom-card-link">
          Details
        </Link>
      </div>
    </div>
  )
}

Item.propTypes = {
  identifier: PropTypes.number,
  item: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  img: PropTypes.string,
}

export default Item
