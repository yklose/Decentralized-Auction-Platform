import React from 'react'
import PropTypes from 'prop-types'

import { Col, Row } from 'react-bootstrap' 

import Item from './Item'

// Component holding a list of items
const Items = ({ items }) => {
    // items - Array with all the items to display

    return (
        <Row style={{marginTop: "1.5rem"}}>
            {items.map((auction, index) => (
                <Col xs={3} key={index} style={{marginBottom: "1.5rem"}}>
                    <Item {...auction}/>
                </Col>
            ))}
        </Row>
    )
}

Items.propTypes = {
    items: PropTypes.array.isRequired
};

export default Items
