import React from 'react';
import { useEffect, useState } from 'react';
import Card from '../components/Card'

function All() {

    const [images, setImages] = useState([])

    useEffect(() => {
        fetch('/api/data')
        .then((response) => response.json())
        .then((data) => setImages(data));

    }, []);

    // console.log(images)

    function handleCardClick(id, ref) {

        // check for support of smooth scroll
        var isSmoothScrollSupported = 'scrollBehavior' in document.documentElement.style;
        if(isSmoothScrollSupported) {
            ref.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});    
        }
        
        setImages(prevData => prevData.map(image => {
            return image.id === id ? {...image, commentShown: !image.commentShown} : image

        }))


    };

    return(
        <div className="feed">
            {images.map((image) => <Card key={image.id} imgsrc={image.img} state={image.commentShown} comments={image.comments} id={image.id} activity={image.activity} onCardClick={handleCardClick} />)}
        </div>
        )
    };


export default All;