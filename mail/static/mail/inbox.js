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
    console.log('1. This loads when sendEmail is called')
    const composeForm = document.getElementById('compose-form');
    composeForm.onsubmit = function () {

        console.log('2. This loads when compose form is submitted ');
        let messageDiv = document.getElementById('message');
        messageDiv.innerHTML = ''; // Clear the message
        messageDiv.style.opacity = '1';

        // Get the data input from user:
        let recipients = document.getElementById('compose-recipients').value;
        let subject = document.getElementById('compose-subject').value;
        let body = document.getElementById('compose-body').value;

        // Check if subject or body is empty:
        // if (subject === '' || body === '') {
        //     let sendConfirmation = confirm('Your mail has empty subject and/or body. Still want to send?');
        //     if (sendConfirmation) {
        //         // Send the email
        //     } else {
        //         // Stay on the compose page
        //     }
        // }

        // Send email
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: recipients,
                subject: subject,
                body: body
            })
        })
            .then(response => {
                if (response.status === 201) {
                    // Mail was sent successfully -> Load Sent box
                    response.json().then(data => {
                        console.log(data.message);
                        messageDiv.innerHTML = `
                            <div class="alert alert-success alert-dismissible fade show" role="alert">
                                ${data.message}
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>`;
                    })
                        .then(() => {
                            load_mailbox('sent');
                            fadeOut(messageDiv);
                        })
                } else if (response.status === 400) {
                    // Mail was FAILED to sent -> Stay on compose page
                    response.json().then(data => {
                        console.log(data.error);
                        messageDiv.innerHTML = `
                            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                                ${data.error}
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>`;
                    })
                        .then(() => {
                            let emailContent = {
                                'recipients': recipients,
                                'subject': subject,
                                'body': body
                            }
                            reComposeEmail(emailContent);
                            fadeOut(messageDiv);
                        })
                    return false;
                }
            })

        return false;
    }
}

// When a user click on the email preview
const showEmail = (email_id, inSent) => {
    console.log('You click this email');
    // Get the data for this email
    let url = `/emails/${email_id}`;
    fetch(url)
        .then((response) => {
                console.log('Single mail was opened successfully')
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
                <button id="replyButton">Reply</button>
            </div>`;

        // Add archive event to btn:
        document.getElementById('archiveButton').addEventListener('click', (event) => {
            archiveEmail(email.id, email.archived, event)
        });

        // Add reply event to btn:
        document.getElementById('replyButton').addEventListener('click', () => {
            reply(email)
        })
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

const reply = (email) => {

    showComposeView()

    // Pre-fill recipient, subject and body
    if (email.subject.substring(0, 3).toLowerCase() !== 're:') {
        // Add Re: to subject
        email.subject = 'Re: ' + email.subject;
    }

    email.body = '\n-----------------------\n' + `On ${email.timestamp} ${email.sender} wrote:` + '\n' + email.body;

    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value = email.subject;
    document.querySelector('#compose-body').value = email.body;

    console.log('This loads when you click on REPLY button');

    sendEmail();
}

// Show compose view and hide other views
const showComposeView = () => {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#email-content-view').style.display = 'none';
}
const test = (emailID, status) => {
    console.log(emailID, status)
}

// Remove the message after 1.5s
const fadeOut = (div) => {
    window.setTimeout(() => {
        div.style.opacity = '0';
    }, 4000)
}

const reComposeEmail = (email) => {
    console.log('This loads when calling re compose email')
    // Prefill with old data
    document.querySelector('#compose-recipients').value = email.recipients;
    document.querySelector('#compose-subject').value = email.subject;
    document.querySelector('#compose-body').value = email.body;

    console.log('This loads when email has error');

    sendEmail();
}