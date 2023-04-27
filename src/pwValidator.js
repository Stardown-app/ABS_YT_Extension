var lengthReq = false;
var upperReq = false;
var numberReq = false;
var startReq = false;
var validEmail = false;
const emailRegex = /\S+@\S+\.\S+/;

function checkStrength(button) {
    let password = $('#password').val();
    let message = "";
    
    if(password.length > 0) {
        startReq = !(/^\d/.test(password));
        upperReq = /[A-Z]/.test(password);
        numberReq = /\d/.test(password);
        lengthReq = password.length >= 8;

        if(!lengthReq) message += "Length >= 8<br>";
        if(!upperReq) message += "Has Uppercase<br>";
        if(!numberReq) message += "Contains a number";
        if(!startReq) message += "Cannot start with a number";
    }

    if(message.length > 0) $('#system').html(`<div>Password requirements:</div>${message}`); 
    else $('#system').html('');

    if (upperReq && numberReq && startReq && lengthReq && validEmail) {
        $('#password').removeClass('is-invalid');
        $('#confirm-password').prop('disabled', false);
        if(($('#confirm-password').val()).length) validatePassword(button);
    } else {
        button.prop('disabled', true);
    }
}

function validatePassword(button) {
    let password = $('#password').val();
    let confirmPassword = $('#confirm-password').val();
    if (password !== confirmPassword) {
        $('#system').html('passwords do not match');
        $('#confirm-password').addClass('is-invalid');
        button.prop('disabled', true);
    } else {
        $('#system').html('');
        $('#confirm-password').removeClass('is-invalid');
        button.prop('disabled', false);
    }
}

function validateEmail(button) {
    let email = $('#email').val();
    if(emailRegex.test(email)) {
        button.prop('disabled', false);
        validEmail = true;
    } else {
        button.prop('disabled', true);
        validEmail = false;
    }
}