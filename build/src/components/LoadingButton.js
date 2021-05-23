import { useState, useEffect } from "react"
import React from "react"
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap';

// const wait = async () => {
//     return new Promise(resolve => setTimeout(resolve, 2000))
// }

const LoadingButton = ({ variant, style, text, onClick }) => {
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        if (isLoading) {
            onClick().then(() => {
                setLoading(false);
            })
        }
    }, [isLoading, onClick])

    const handleClick = () => setLoading(true)

    return (
        <Button 
            variant={variant}
            disabled={isLoading}
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
};

export default LoadingButton
