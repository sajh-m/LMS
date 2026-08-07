

function Contact (){
return(

    <>
    <h3 className="Page-title">Leave details for any query</h3>
    <div className="Page-content">
    <form>
    <input type="text" id='contactName' placeholder="Name"/><br /><br />
    <input type="text" id='contactNumber'placeholder="Number"/><br /><br />
    <input type="email" id='contactMail'placeholder="Email"/><br /><br />
    <label>Comment:</label><br />
    <textarea id="contactComment" placeholder="Your questions or queries or both "></textarea>

    </form>
    </div>
    </>

)
}

export default Contact