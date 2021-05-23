import React from 'react'

import { useState } from "react"
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai'

const Web3Connect = () => {
    const [isConnected, connect] = useState(false);

    const handleClick = () => {
        connect(!isConnected)
        console.log(isConnected)
    }
    return (
        <div style={{display: "inherit", alignItems: "center"}}>
            <button onClick={handleClick} className="nav-link" style={{ border: "none", backgroundColor: "inherit" }}>
                Connect to Web3
            </button>
            {isConnected ? 
                <AiOutlineCheckCircle style={{ color: "green", height: "1.5rem", width: "1.5rem"}}/> : 
                <AiOutlineCloseCircle style={{ color: "red", height: "1.5rem", width: "1.5rem" }}/>}
        </div>
    )
}

export default Web3Connect
