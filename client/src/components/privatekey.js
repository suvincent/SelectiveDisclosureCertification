import React, { Component , useState, useEffect } from "react";

function PrivateKeyForm(props){
    const [type,settype] = useState('input')

    function showHide(e){
        e.preventDefault();
        e.stopPropagation();
        if(type === 'input'){
            settype('password')
        }
        else{
            settype('input')
        }
    }
    
    function OnchangeInput(e){
        props.setprivatekey(e.target.value)
        // console.log(props.privatekey)
    }
    
    return(
        <>
        <form className="littleform">
        <label className="password">Private Key
        <input type={type} className="password__input" onChange={OnchangeInput} />
        <span className="password__show" onClick={showHide}>{type === 'input' ? 'Hide' : 'Show'}</span>
        </label>
        </form>
        </>
    )
}

export default PrivateKeyForm