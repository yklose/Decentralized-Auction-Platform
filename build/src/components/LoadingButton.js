import { useState, useEffect } from "react"
import React from "react"
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap';

// Button which changes itself to be disabled whilst the onClick function is called
const LoadingButton = ({ variant, style, text, onClick, disabled, size }) => {
    // variant, style, text, disabled, size - Styling attributes for the Button
    // onClick - async function to call on click

    const [isLoading, setLoading] = useState(false);

    // Sets itself to loading when isLoading is set
    useEffect(() => {
        const connect = async () => {
            onClick().then(() => setLoading(false))
        }
        if (isLoading) {
            connect()
        }
    }, [isLoading, onClick])

    const handleClick = () => setLoading(true)

    return (
        <Button
            size={size} 
            variant={variant}
            disabled={isLoading || disabled}
            onClick={!isLoading ? handleClick : null}
            style={style}>
                {isLoading ? "Loading....." : text}
        </Button>
    )
}

LoadingButton.propTypes = {
    variant: PropTypes.string,
    style: PropTypes.object,
    text: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    size: PropTypes.string,
};

export default LoadingButton
