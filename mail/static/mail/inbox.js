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

// Using Modal
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
    document.getElementById('view-name').innerHTML =
        `<div class="d-flex">
            <button type="button" class="btn btn-light" onclick="load_mailbox('${mailbox}')">
                <i class="fas fa-chevron-left"></i>
            </button>            
            <h5>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h5>
        </div>`;
    // Show the mailbox and hide other views
    showThisView('emails-view');
}

const showEmails = (mailbox, email_list) => {

    let emailListWrapper = document.createElement('div')
    let sendTo = mailbox === 'sent' ? 'Sent to: ' : '';
    let avatar = '';
    let emailBody = '';
    let address = '';
    let isRead = '';
    let unreadMark = '';

    email_list.forEach((email) => {

        // Email preview
        avatar = mailbox === 'sent' ? 'https://image.flaticon.com/icons/png/512/3940/3940403.png' : randomAvatar();
        address = mailbox === 'sent' ? email.recipients : email.sender;
        emailBody = email.body;
        if (email.body.length > 70) {
            emailBody = emailBody.substring(0, 100) + '...';
        }

        // Add signs for unread mails
        isRead = email.read === true ? '' : 'unread';
        unreadMark = email.read === true ? '' : '<i class="fas fa-circle"></i>';

        // Render email
        let emailListContainer = document.createElement('div');
        emailListContainer.innerHTML = `
                <div class="${isRead} mail-wrapper list-group-item list-group-item-action py-3">
                    <div class="row">
                        <div class="preview-wrap d-flex col-10">
                            <img class="avatar" src=${avatar} alt="avatar"/>
                            <div class="mail-preview ms-3">
                                <div class="mb-1">${sendTo}<strong class="black-text">${address}</strong></div>
                                <div style="color: #8c9ab0;">
                                    <span class="mail-subject">${email.subject}</span>
                                    <span class="mail-content ms-2">- ${emailBody}</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-2 text-end">
                            <div class="timestamp">${email.timestamp}</div>
                            <div class="unread-mark">${unreadMark}</div>
                        </div>
                    </div>                    
                </div>
        `;
        // Add event show Email to email div
        emailListContainer.addEventListener('click', () => {
            showEmail(`${email.id}`, mailbox)
        });

        emailListWrapper.append(emailListContainer);
    });


    // Clear email view and override content
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
                // Success: get the email object
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
    const composeForm = document.getElementById('compose-form');

    composeForm.onsubmit = function () {

        let messageDiv = document.getElementById('message');
        messageDiv.innerHTML = ''; // Clear the message
        messageDiv.style.display = 'block';

        // Get the data input from user:
        let recipients = document.getElementById('compose-recipients').value;
        let subject = document.getElementById('compose-subject').value;
        let body = document.getElementById('compose-body').value;

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
    let formattedBody = email.body;
    formattedBody = formattedBody.replaceAll('\n', '<br>')

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
                    ${formattedBody}
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
        method: 'PUT',
        body: JSON.stringify({
            read: true
        }),
    })
        .then(() => {
            console.log('Success: Marked as read');
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
}

const test = () => {
    console.log('test function works');
    load_mailbox('sent');
}

// Remove the message after awhile
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

// Generate a random avatar
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