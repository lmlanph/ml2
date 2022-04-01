import React from 'react';
import { Link } from 'react-router-dom';

function Modal(props) {
    return(
        <div className={ props.state  ? 'modal modal-show' : 'modal'}>
            <ul>
                <li onClick={props.modalClick}>
                <Link to='/'>top</Link>
                </li>
                <li onClick={props.modalClick}>
                <Link to='/all'>all</Link>
                </li>
                <li onClick={props.modalClick}>
                <Link to='/about'>about</Link>
                </li>
                <span className='clickable' onClick={props.modalClick}>X</span>
            </ul>
            
        </div>
    )
}


export default Modal;