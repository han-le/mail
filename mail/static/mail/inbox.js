// ------*****------- CALL functions here ------*****-------

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

});


// ------*****------- Write logic of the functions here ------*****-------

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#email-content-view').style.display = 'none';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    console.log('This loads when you click on compose button');

    sendEmail();
}

function load_mailbox(mailbox) {

  let API_url = `emails/${mailbox}`
  fetch(API_url)
  .then(
    function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }

      // Examine the text in the response
      response.json().then(data => {
          // When the data is NOT empty
          if (data.length > 0) {
            showEmails(mailbox, data)
          } else {
            // When the data is empty
            document.querySelector('#emails-view').innerHTML = `<h3>This is empty</h3>`
          }
          console.log(mailbox, 'are loaded')
      });
    }
  )
  .catch(function(err) {
    console.log('Fetch Error :-S', err);
  });
  
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-content-view').style.display = 'none';
}

const showEmails = (mailbox, email_list) => {

    let emailWrapper = document.createElement('div')
    // Add content to element:
    email_list.forEach((email) => {
        let emailContainer = document.createElement('div');
        emailContainer.innerHTML = `
            <div class="" style="background: lightyellow">
                <li>Email id: ${email.id}</li>
                <li>Read?: ${email.read}</li>
                <li>From: ${email.sender}</li>
                <li>To: ${email.recipients}</li>
                <li>Subject: ${email.subject}</li>
                <li>${email.timestamp}</li>                
            </div>
            <button onclick="archive(${email})">Archive</button>
            <hr>
        `;
        // Add event show Email to email div
        emailContainer.addEventListener('click', () => {showEmail(`${email.id}`)});

        // Add event archive to archive btn
        emailWrapper.append(emailContainer);
    });

    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    document.querySelector('#emails-view').append(emailWrapper);
}

const sendEmail = () => {
    console.log('This loads when sendEmail is called')
    const composeForm = document.getElementById('compose-form');
    composeForm.onsubmit = function (event) {
        console.log('This loads when form is submitted ');
        console.log(event);

        // Get the data input from user:
        let recipients = document.getElementById('compose-recipients').value;
        let subject = document.getElementById('compose-subject').value;
        let body = document.getElementById('compose-body').value;
        console.log('Value of the input')
        console.log(recipients);
        console.log(subject);
        console.log(body);
        fetch('/emails', {
            method: "POST",
            body: JSON.stringify({
                recipients: recipients,
                subject: subject,
                body: body
            })
        })
            .then(response => response.json())
            .then(result => {
                console.log('This loads after response is converted to json')
                console.log(result)
            });
        load_mailbox('inbox');
        // return false;
    }
}

// When a user click on the email preview
const showEmail = (email_id) => {
    console.log('You click this email');
    console.log(email_id);
    // Get the data for this email
    let url = `/emails/${email_id}`;
    fetch(url)
        .then((response) => {
			if (response.status !== 200) {
            console.log('Status code: ' + response.status);
            return;
            }
            // Success
            response.json().then((emailObj) => {
                console.log(emailObj);
                // Render the full email
                renderEmailView(emailObj);
                // Mark the email as read/seen
                if (emailObj.read === false) {
                    markAsRead(emailObj);
                }
            });
        }
    ).catch((err) => {
        console.log('Fetch Error :-S', err);
    });
}

const renderEmailView = (email) => {
    let emailView = document.querySelector('#email-content-view');
    emailView.innerHTML= `<div class="">
        <div>email id: ${email.id}</div>
        <div>From: ${email.sender}</div>
        <div>To: ${email.recipients}</div>
        <div>Subject: ${email.subject}</div>
        <div>${email.timestamp}</div>
        <div>${email.body}</div>
    </div>`;
    // Change the display status
    emailView.style.display = 'block';
}

const markAsRead = (email) => {
    let url = `emails/${email.id}`;
    fetch(url, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    }).then((response) => {
        response.json()
            .then(result => {
                console.log(result)})
    }).catch((err) => {
        console.log(err)
    })
    console.log('Mark this email as read');
}

const archive = (email) => {
    console.log(email)
    // let url = `emails/${email.id}`;
    // fetch(url, {
    //     method: 'PUT',
    //     body: JSON.stringify({
    //         archived: email.archived !== true
    //     })
    // }).then(r => r.json()).then(result => {
    //     console.log(result)}).catch(err => {
    //     console.log(err)})
    // console.log('Mark archived as:' + email.archived)
}
//
// const test = (event, id) => {
//     console.log(event.target)
//     let btn = event.target;
//     btn.style.background = 'blue';
//     // Stop calling the event above it
//     event.stopPropagation();
//     console.log('Test function works', id)
// }

const test = (email) => {
    console.log(email)
}