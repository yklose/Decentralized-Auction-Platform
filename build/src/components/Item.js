import React from 'react';
import PropTypes from 'prop-types';

import images from './images';
import { Link } from 'react-router-dom';

// Component which displays one single items - to be expanded
const Item = ({ identifier, item, description, img }) => {

  const getImage = () => {
		const imag = images.filter((e) => e.id === img)
		if(imag.length === 0) {
			return `url('')`
		}
		return `url('${imag[0].img}')`
	}

  return (
    <div className="custom-card" style={{backgroundImage: getImage()}}>
      <div className="custom-card-content"> 
        <h3 className="custom-card-title">
          {item}
        </h3>
        <p className="custom-card-body">
          {description} 
        </p>
        <p className="custom-card-body">
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
