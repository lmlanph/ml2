import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import Modal from '../components/Modal';


function Layout(props) {

    const [showModal, setShowModal] = useState(false)

    function modalHandler() {
        setShowModal(prevState => !prevState)
    }

    return(

        

        <>
            <Modal state={showModal} modalClick={modalHandler} />

            <nav className='header'>
                <Link to='/'>
                    <span>mac</span> <span className="grey2">lanphere</span> <span className="grey3">com</span>
                </Link>
                <div className='clickable hamburger' onClick={modalHandler}>
                    <i className="fas fa-bars"></i>
                </div>
            </nav>

            <div>
                {props.children}
            </div>

            <div className="footer">
                <img src='./images/insta-logo.png' />
            </div>
        </>




    )
}


export default Layout;