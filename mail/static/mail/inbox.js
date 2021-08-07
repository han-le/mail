// ------*****------- CALL functions here ------*****-------

document.addEventListener('DOMContentLoaded', function () {

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
            function (response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                    return;
                }

                // Examine the text in the response
                response.json().then(data => {
                    // When the data is NOT empty
                    if (data.length > 0) {
                        showEmails(mailbox, data);
                        console.log(data)
                    } else {
                        // When the data is empty
                        document.querySelector('#emails-view').innerHTML = `<h3>This is empty</h3>`
                    }
                    console.log(mailbox, 'are loaded')
                });
            }
        )
        .catch(function (err) {
            console.log('Fetch Error :-S', err);
        });

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-content-view').style.display = 'none';
}

const showEmails = (mailbox, email_list) => {

    let emailWrapper = document.createElement('div')
    if (mailbox === 'sent') {
        // Do not add archive btn
        email_list.forEach((email) => {
            let emailContainer = document.createElement('div');
            emailContainer.innerHTML = `
            <div class="" style="background: lightyellow">
                <h5>Email id: ${email.id}</h5>
                <li>Read status: ${email.read}</li>
                <li>Archived status: ${email.archived}</li>
                <li>From: ${email.sender}</li>
                <li>To: ${email.recipients}</li>
                <li>Subject: ${email.subject}</li>
                <li>${email.timestamp}</li>                
            </div>
            <hr>
        `;
            // Add event show Email to email div
            emailContainer.addEventListener('click', () => {
                showEmail(`${email.id}`, inSent = 'true')
            });

            // Add event archive to archive btn
            emailWrapper.append(emailContainer);
        });
    } else {
        // Add archive btn
        email_list.forEach((email) => {
            let emailContainer = document.createElement('div');
            emailContainer.innerHTML = `
            <div class="" style="background: lightyellow">
                <h5>Email id: ${email.id}</h5>
                <li><strong>Read status: ${email.read}</strong></li>
                <li><strong>Archived status: ${email.archived}</strong></li>
                <li>From: ${email.sender}</li>
                <li>To: ${email.recipients}</li>
                <li>Subject: ${email.subject}</li>
                <li>${email.timestamp}</li>                
            </div>
            <button onclick="archiveEmail(${email.id}, ${email.archived}, event)">Archive</button>
            <hr>
        `;
            // Add event show Email to email div
            emailContainer.addEventListener('click', () => {
                showEmail(`${email.id}`, inSent = 'false')
            });

            // Add event archive to archive btn
            emailWrapper.append(emailContainer);
        });
    }

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
const showEmail = (email_id, inSent) => {
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
                    renderEmailView(emailObj, inSent);
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

const renderEmailView = (email, inSent) => {
    let emailView = document.querySelector('#email-content-view');
    if (inSent === true) {
        emailView.innerHTML = `<div class="">
                <div>email id: ${email.id}</div>
                <div>From: ${email.sender}</div>
                <div>To: ${email.recipients}</div>
                <div>Subject: ${email.subject}</div>
                <div>${email.timestamp}</div>
                <div>${email.body}</div>
            </div>`;
    } else {
        emailView.innerHTML = `<div class="">
                <div>email id: ${email.id}</div>
                <div>From: ${email.sender}</div>
                <div>To: ${email.recipients}</div>
                <div>Subject: ${email.subject}</div>
                <div>${email.timestamp}</div>
                <div>${email.body}</div>
                <button id="archiveButton">Archive</button>
            </div>`;

        // Add archive event to btn:
        document.getElementById('archiveButton').addEventListener('click', (event) => {
            archiveEmail(email.id, email.archived, event)
        });
    }

    // Change the display status
    emailView.style.display = 'block';
}

const markAsRead = (email) => {
    let url = `emails/${email.id}`;

    fetch(url, {
        body: JSON.stringify({
            read: true
        }),
    })
        .then(data => {
            console.log('Success: Marked as read', data);
        })
        .catch((error) => {
            console.log('Error:', error);
        });
}

const archiveEmail = (email_id, archived_status, event) => {
    // Stop calling the event above it
    event.stopPropagation();

    let url = 'emails/' + email_id;
    fetch(url, {
        method: 'PUT',
        body: JSON.stringify({
            archived: archived_status !== true
        })
    })
        .then(response => {
            console.log('Marked/Unmarked as archived Success:', response);
        })
        .then(() => {
            load_mailbox('inbox');
        })
        .catch((error) => {
            console.error('Error:', error);
        })
}

const test = (emailID, status) => {
    console.log(emailID, status)
}