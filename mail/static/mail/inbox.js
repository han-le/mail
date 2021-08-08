// ------*****------- CALL functions here ------*****-------

document.addEventListener('DOMContentLoaded', function () {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    // Replaced by modal
    document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');
});


// ------*****------- Write logic of the functions here ------*****-------

// Replaced by modal
function compose_email() {
    clearAll();
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
                        console.log('Mails are loaded successfully')
                    } else {
                        // When the data is empty
                        document.querySelector('#emails-view').innerHTML = `<h3>Just an empty box</h3>`
                    }
                    console.log('End of load', mailbox, 'function')
                });
            }
        )
        .catch(function (err) {
            console.log('Fetch Error', err);
        });

    // Show the name of mailbox
    document.getElementById('view-name').innerHTML = `<div><h5>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h5></div>`;
    // Show the mailbox and hide other views
    showThisView('emails-view');
}

const showEmails = (mailbox, email_list) => {

    let emailListWrapper = document.createElement('div')
    if (mailbox === 'sent') {
        // Add archive btn
        email_list.forEach((email) => {
            // Body preview
            if (email.body.length > 100) {
                email.body = email.body.substring(0, 100) + '...';
            }

            let emailListContainer = document.createElement('div');
            emailListContainer.innerHTML = `
                <div class="mail-wrapper list-group-item list-group-item-action py-3 d-flex justify-content-between">
                    <div class="preview-wrap d-flex">
                        <img class="avatar" src='https://image.flaticon.com/icons/png/512/3940/3940403.png' alt="avatar"/>
                        <div class="mail-preview ms-3">
                            <div class="mb-1">To: <strong class="black-text">${email.recipients}</strong></div>
                            <div style="color: #8c9ab0;">
                                <span class="mail-subject">${email.subject}</span>
                                <span class="mail-content ms-2">- ${email.body}</span>
                            </div>
                        </div>
                    </div>
                    <div class="timestamp">${email.timestamp}</div>
                </div>
        `;
            // Add event show Email to email div
            emailListContainer.addEventListener('click', () => {
                showEmail(`${email.id}`, mailbox)
            });

            emailListWrapper.append(emailListContainer);
        });
    } else {


        email_list.forEach((email) => {
            let avatar = randomAvatar();
            // Body preview
            if (email.body.length > 100) {
                email.body = email.body.substring(0, 100) + '...';
            }

            let emailListContainer = document.createElement('div');
            emailListContainer.innerHTML = `
                <div class="mail-wrapper list-group-item list-group-item-action py-3 d-flex justify-content-between">
                    <div class="preview-wrap d-flex">
                        <img class="avatar" src=${avatar} alt="avatar"/>
                        <div class="mail-preview ms-3">
                            <strong class="mb-1 black-text">${email.sender}</strong>
                            <div style="color: #8c9ab0;">
                                <span class="mail-subject">${email.subject}</span>
                                <span class="mail-content ms-2">- ${email.body}</span>
                            </div>
                        </div>
                    </div>
                    <div class="timestamp">${email.timestamp}</div>
                </div>
        `;
            // Add event show Email to email div
            emailListContainer.addEventListener('click', () => {
                showEmail(`${email.id}`, mailbox)
            });

            // Add the new content
            emailListWrapper.append(emailListContainer);
        });
    }

    // Clear email view and override content
    // document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    document.querySelector('#emails-view').innerHTML = '';
    document.querySelector('#emails-view').append(emailListWrapper);
}


// When a user click on the email preview
const showEmail = (email_id, mailbox) => {
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
                    renderEmailView(emailObj, mailbox);
                    // Mark the email as read/seen
                    if (emailObj.read === false) {
                        markAsRead(emailObj);
                    }
                });
            }
        ).catch((err) => {
        console.log('Fetch Error :-S', err);
    });
    showThisView('email-content-view')
}

const sendEmail = () => {
    console.log('1. This loads when sendEmail is called')
    const composeForm = document.getElementById('compose-form');
    console.log(composeForm)

    composeForm.onsubmit = function () {

        console.log('2. This loads when compose form is submitted ');
        let messageDiv = document.getElementById('message');
        messageDiv.innerHTML = ''; // Clear the message
        messageDiv.style.display = 'block';

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
                                Failed to send: ${data.error}
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>`;
                    })
                        .then(() => {
                            load_mailbox('sent');
                            fadeOut(messageDiv);
                            // let emailContent = {
                            //     'recipients': recipients,
                            //     'subject': subject,
                            //     'body': body
                            // }
                            // reComposeEmail(emailContent);
                            // fadeOut(messageDiv);
                        })
                    return false;
                }
            })
        return false;
    }
}


const renderEmailView = (email, mailbox) => {

    let archivedBtnContent = 'Archive';
    if (email.archived === true) {
        archivedBtnContent = 'Unarchive'
    }

    if (email.subject.length < 1) {
        email.subject = '(no subject)';
    }
    let avatar = randomAvatar();

    let emailView = document.querySelector('#email-content-view');
    emailView.innerHTML = `
        <div>
            <div class="subject d-flex justify-content-between">
                <h4 class="mb-4">${email.subject}</h4>
                <div id="archive-container">
                    <button type="button" class="btn btn-outline-secondary" style="font-size: 13px" id="archiveButton">
                        <i class="fas fa-archive me-2" ></i>${archivedBtnContent}
                    </button>
                </div>
            </div>
            <div class="sender-info mt-4">
                <div class="d-flex justify-content-between">
                    <div class="sender-info-left d-flex">
                        <div>
                            <img class="avatar" src=${avatar} alt="avatar"/>
                        </div>
                        <div class="info">
                            <div>
                                <strong>${email.sender}</strong>
                            </div>
                            <div>To: <span class="light-gray-text">${email.recipients}</span></div>
                        </div>
                    </div>
                    <div class="sender-info-right">
                        <div class="timestamp light-gray-text">
                            ${email.timestamp}
                        </div>
                    </div>
                </div>
            </div>
            <div class="mail-content mt-3">
                <div class="mail-body gray-text">
                    ${email.body}    
                </div>
                <div class="mail-footer mt-5">
                    <!-- Button trigger modal -->
                    <button type="button" class="btn theme-color text-white" data-bs-toggle="modal"
                            data-bs-target="#mailModal" id="replyButton">Reply
                        <i class="ms-1 fas fa-reply"></i>
                    </button>
                </div>
            </div>
        </div>`;
    if (mailbox === 'sent') {
        // Remove archive btn in sent box
        document.getElementById('archive-container').innerHTML = '';
    } else {
        // Add archive event to btn:
        document.getElementById('archiveButton').addEventListener('click', (event) => {
            archiveEmail(email)
        });
    }

    // Add reply event to btn:
    document.getElementById('replyButton').addEventListener('click', () => {
        reply(email)
    })
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

const archiveEmail = (email) => {
    console.log('Archive email was clicked, archived status:', email.archived);
    let url = 'emails/' + email.id;
    fetch(url, {
        method: 'PUT',
        body: JSON.stringify({
            archived: email.archived !== true
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
    // Pre-fill recipient, subject and body
    let subject = email.subject;
    // Add Re: to subject
    if (email.subject.substring(0, 3).toLowerCase() !== 're:') {
        subject = 'Re: ' + email.subject;
    }

    let originalMessage = '\n-----------------------\n' + `On ${email.timestamp} ${email.sender} wrote:` + '\n' + email.body;

    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value = subject;
    document.querySelector('#compose-body').value = originalMessage;

    console.log('This loads when you click on REPLY button');
    sendEmail();
}

// Show compose view and hide other views
const showThisView = (divToShow) => {
    const views = ['emails-view', 'email-content-view'];
    views.forEach((div) => {
        if (div === divToShow) {
            document.getElementById(div).style.display = 'block';
        } else {
            document.getElementById(div).style.display = 'none';
        }
    })
    // document.querySelector('#emails-view').style.display = 'none';
    // document.querySelector('#compose-view').style.display = 'block';
    // document.querySelector('#email-content-view').style.display = 'none';
}
const test = () => {
    console.log('test function works');
    load_mailbox('sent');
}

// Remove the message after 1.5s
const fadeOut = (div) => {
    window.setTimeout(() => {
        div.style.display = 'none';
    }, 4000)
}

// Clear the form
const clearAll = () => {
    console.log('Form was cleared');
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}


const randomAvatar = () => {
    const avatars = [
        'https://image.flaticon.com/icons/png/512/3940/3940407.png',
        'https://image.flaticon.com/icons/png/512/3940/3940405.png',
        'https://image.flaticon.com/icons/png/512/3940/3940400.png',
        'https://image.flaticon.com/icons/png/512/3940/3940404.png',
        'https://image.flaticon.com/icons/png/512/3940/3940402.png',
        'https://image.flaticon.com/icons/png/512/3940/3940401.png',
        'https://image.flaticon.com/icons/png/512/3940/3940408.png'
    ]
    const randomIndex = Math.floor(Math.random() * avatars.length);
    return avatars[randomIndex];
}