import React from 'react'
import { useRef, useState, useEffect } from 'react'
import { nanoid } from 'nanoid'


function Card(props) {

    // get keys from localStorage (comment id's)
    var arrayOfKeysParent = Object.keys(localStorage);
    // console.log(arrayOfKeysParent)

    let text = useRef()

    let commentsNotNull = props.comments.filter((comment) => comment.comment !== null)

    let commentsVoted = commentsNotNull.map(comment => {
        return arrayOfKeysParent.includes(comment.comment_id) ? {...comment, upvoted:true} : comment
        });
    
    const [comments, setComments] = useState(commentsVoted)

    const [activity, setActivity] = useState(props.activity)

    const submitComment = e => {
        e.preventDefault()
        const data = new FormData(text.current)

        // validate for empty string on submit
        let x = Array.from(data.values())

        if (x[0] !== '') {
            fetch('/api/comment', { method: 'POST', body: data })
            // .then(res => res.json())
            // .then(json => console.log(json))

              // clear the text field useRef
              text.current.reset();

              // show comment without db query/response, and temp location
              setComments(prev => [...prev, {'comment_id': x[2], 'comment': x[0], 'submitted_by': '...', 'upvoted': true} ] )

        setActivity((prev) => prev + 2)

        // track if user upvoted
        localStorage.setItem(x[2], 'voted')
        }
      }

    const vote = function(id) {

        let vote;

        setComments(prevComments => prevComments.map((comment) => {
            return comment.comment_id === id ? {...comment, upvoted: !comment.upvoted} : comment
            }))

        // get keys from localStorage
        var arrayOfKeys = Object.keys(localStorage);

        if (arrayOfKeys.includes(id)) {
        // decrement vote and delete key/value
            setActivity((prev) => prev - 1)
            localStorage.removeItem(id)
            vote = 'down'
        } else {
        // increment vote, and add key/value
            setActivity((prev) => prev + 1)
            localStorage.setItem(id, 'voted')
            vote = 'up'
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'id': id, 'vote': vote })
        };

        fetch('/api/vote', requestOptions)
        // .then(res => res.json())
        // .then(json => console.log(json))
      } 
    

    return(

        <div className="card fade-in">

            {/*show counter if activity*/}
            {activity ? <div className="counter">{activity}</div> : null }
            
            {/*image*/}
            <img onClick={()=>props.onCardClick(props.id, text.current)} src={props.imgsrc} alt="my img"/>

            <div className={props.state ? "tray tray-shown" : "tray"}>
                {/*list of comments*/}

                {comments.map((comment)=><div className="comment-container" key={comment.comment_id}>

                    <div><img className="clickable" src={comment.upvoted ? "./images/plus-col.png" : "./images/plus.png"} width="14px" onClick={()=>vote(comment.comment_id)}/></div>
                    <div><p className="comment">{comment.comment}</p></div>
                    <div className="place">{comment.submitted_by}</div>

                    </div>)}

                {/* input:
                type=hidden field is to pass prop along with form data, as well as comment id--now creating on front end;
                [optional? peventDefault not working though...] type=text, but with class/display hidden, is to disable submit on enter, with single text field (adding 2nd text field fixes this);
                */}
                <form ref={text} className="input2" required>
                  <input autoComplete="off" type="text" name="comment" placeholder="add a comment :)"/>
                  <img className = 'clickable' src='./images/arrow.png' width='22px' onClick={submitComment}/>
                  <input type="hidden" name="img_id" value={props.id} />
                  <input type="hidden" name="comment_id" value={nanoid()} />
                  <input type="text" className="hidden"/> 
                </form>

            </div>
        </div>


        
    )
}           

export default Card;