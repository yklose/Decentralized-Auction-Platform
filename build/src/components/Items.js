import React from 'react'
import PropTypes from 'prop-types'

import { Col, Row } from 'react-bootstrap' 

import Item from './Item'

const Items = ({ items }) => {
    return (
        <Row>
            {items.map((task, index) => (
                <Col xs={3} key={index}>
                    <Item />
                </Col>
            ))}
        </Row>
    )
}

Items.propTypes = {
    items: PropTypes.array.isRequired
};

export default Items
