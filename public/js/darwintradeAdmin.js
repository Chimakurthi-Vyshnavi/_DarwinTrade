const form = document.querySelector('form')
const emailError = document.querySelector('.emailError')
const firstNameError = document.querySelector('.firstNameError')
const lastNameError = document.querySelector('.lastNameError')
const pinError = document.querySelector('.pinError')
const zipError = document.querySelector('.zipError')
const addressError = document.querySelector('.addressError')
const cityError = document.querySelector('.cityError')
const stateError = document.querySelector('.stateError')
const phoneError = document.querySelector('.phoneError')
const dobError = document.querySelector('.dobError')

// header
document.addEventListener("DOMContentLoaded", function () {
    const currentPath = window.location.pathname;
    const url_ = currentPath.split('/')
    menu_selected = url_[url_.length - 1]
    menu_bar = [...document.getElementsByClassName('menu_toggler')]
    menu_bar.forEach(bar => {
        if (bar.dataset.filter == menu_selected) bar.classList.add('active')
        else bar.classList.remove('active')
    })
});

// Add Vendor Page
function displayAlert(title, text, icon, callback) {
    Swal.fire({
        title: title,
        text: text,
        icon: icon,
        allowOutsideClick: true,
        backdrop: true,
        customClass: {
            confirmButton: 'btn btn-primary'
        },
        buttonsStyling: false
    }).then((result) => {
        if (result.isConfirmed && callback) {
            callback();
        }
    });
}
const dropdowns = [...document.getElementsByClassName('dropdown-toggle')]
if (dropdowns.length) {
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', () => {
            const target = dropdown.getAttribute('data-bs-target')
            const menu = document.getElementById(target)
            if (menu) menu.classList.toggle('show')
        })
    })
}

const vendorForm = [...document.getElementsByClassName('addVendorForm')]
if (vendorForm.length) {
    vendorForm[0].addEventListener('submit', async (e) => {
        e.preventDefault()
        const email = form.email.value.trim()
        const firstName = form.firstName.value.trim()
        const lastName = form.lastName.value.trim()
        const address = form.address.value.trim()
        const state = form.state.value.trim()
        const zip = form.zip.value.trim()
        const city = form.city.value.trim()
        const phone = form.phone.value.trim()
        const country = form.country.value.trim()
        const frequency = form.frequency.value.trim()
        const delay = form.delay.value.trim()
        const pin = form.pin.value.trim()
        const commission = form.Commission.value.trim()
        const dob = form.dob.value.trim()
        const recurringCommission = form.recurringCommission.value.trim()
        const today = new Date()
        const date = new Date(dob)
        if (date.getTime() >= today.getTime()) {
            dobError.textContent = 'Please fill the valid date-of-birth'
            return
        }
        const regex = /^[+]{1}(?:[0-9\-\\(\\)\\/.]\s?){6,15}[0-9]{1}$/
        const phoneValidation = regex.test(phone)
        const names = [firstName, lastName, email, phone, address, city, state, zip, pin]
        const errors = [firstNameError, lastNameError, emailError, phoneError, addressError, cityError, stateError, zipError, pinError]
        for (let i = 0; i < 7; i++) errors[i].textContent = ' '
        for (let i = 0; i < 7; i++) {
            if (!names[i]) {
                errors[i].textContent = `${names[i]} cannot be empty.`
                return
            }
        }
        if (!phoneValidation) {
            phoneError.textContent = 'Please enter the valid phone number.'
            return
        }
        try {
            const res = await fetch('/addVendor', {
                method: 'POST',
                body: JSON.stringify({
                    email, firstName, lastName, state, address, zip, city, dob, country,
                    phone, frequency, delay, pin, commission, recurringCommission
                }),
                headers: { 'Content-type': 'application/json' }
            })
            const data = await res.json()
            if (data.error) {
                displayAlert('Error', data.error, 'error',()=>location.reload())
            }
            else {
                $.ajax({
                    type: 'POST',
                    url: '/vendorMail',
                    contentType: 'application/json',
                    data: JSON.stringify(data),
                    success: function (response) {
                        displayAlert(response.message, 'Vendor has been added to the database', 'success', ()=>{ location.reload() })
                    },
                    error: function (xhr, status, error) {
                        if (xhr.status === 400) {
                            var response = JSON.parse(xhr.responseText);
                            displayAlert(response.error, 'Failed to Add Vendor.', 'error', ()=>{})
                        }
                    }
                })
            }
        } catch (err) {
            displayAlert('Failed to Add Vendor.', 'Please try again later.', 'warning', ()=>{})
        }
    })
   
}

// remove vendor page
$('#vendorid').change(function () {
    const vendor = $(this).val()
    if (vendor) {
        $.ajax({
            type: 'POST',
            url: '/getVendor',
            contentType: 'application/json',
            data: JSON.stringify({ vendor: vendor }),
            success: function (response) {
                document.getElementById('firstName').setAttribute('value', response.firstName)
                document.getElementById('lastName').setAttribute('value', response.lastName)
                document.getElementById('email').setAttribute('value', response.email)
                document.getElementById('phoneNumber').setAttribute('value', response.phone)
                document.getElementById('address').setAttribute('value', response.address)
                document.getElementById('city').setAttribute('value', response.city)
                document.getElementById('state').setAttribute('value', response.state)
                document.getElementById('delay').setAttribute('value', response.delay)
                document.getElementById('pin').setAttribute('value', response.personalIdentificationNumber)
                document.getElementById('zipCode').setAttribute('value', response.zip)
                document.getElementById('Commission').setAttribute('value', response.vendorAgreement.commissionPercent)
                var country = document.getElementById('country')
                country.disabled = false
                country.value = response[0].country
                var rec = document.getElementById('recurringCommission')
                rec.disabled = false
                rec.value = response[0].vendorAgreement.recurringCommission
            },
            error: function (xhr, status, error) {
                if (xhr.status === 400) {
                    var response = JSON.parse(xhr.responseText);
                    displayAlert(response.error, 'Failed to Retrieve Vendor', 'error', ()=>{})
                }
            }
        })
    }
    else {
        document.getElementById('firstName').setAttribute('value', '')
        document.getElementById('lastName').setAttribute('value', '')
        document.getElementById('email').setAttribute('value', '')
        document.getElementById('phoneNumber').setAttribute('value', '')
        document.getElementById('address').setAttribute('value', '')
        document.getElementById('city').setAttribute('value', '')
        document.getElementById('state').setAttribute('value', '')
        document.getElementById('delay').setAttribute('value', '')
        document.getElementById('pin').setAttribute('value', '')
        document.getElementById('zipCode').setAttribute('value', '')
        document.getElementById('Commission').setAttribute('value', '')
    }
})

$('#removeVendorForm').submit(function (e) {
    e.preventDefault()
    const vendor = $('#vendorid').val()
    try {
        if (vendor) {
            $.ajax({
                type: 'POST',
                url: '/deleteVendor',
                contentType: 'application/json',
                data: JSON.stringify({ vendor }),
                success: function (response) {
                    console.log(response)
                    displayAlert(response.message, 'Vendor has been removed from the database', 'success', ()=>{ location.reload() })
                },
                error: function (xhr, status, error) {
                    if (xhr.status === 400) {
                        var response = JSON.parse(xhr.responseText);
                        displayAlert(response.error, 'Failed to Remove Vendor.', 'error', ()=>{})
                    }
                }
            })
        }
        else displayAlert('Vendor Not Selected!', '', 'warning', ()=>{ location. reload() })
    
    } catch (error) {
        displayAlert('Failed to Remove Vendor.', 'Please try again later.', 'warning', ()=>{})
    }
})



// Account page
if (document.getElementsByClassName('profilePic').length) {
    document.getElementsByClassName('profilePic')[0].addEventListener('change', () => {
        let accountUserImage = document.getElementById('uploadedAvatar');
        const fileInput = document.querySelector('.account-file-input'),
            resetFileInput = document.querySelector('.account-image-reset');
        if (accountUserImage) {
            const resetImage = accountUserImage.src;
            if (fileInput.files[0]) accountUserImage.src = window.URL.createObjectURL(fileInput.files[0]);
            resetFileInput.onclick = () => {
                fileInput.value = '';
                accountUserImage.src = resetImage;
            };
        }
    })
}

$("#adminAccountForm").submit(function(e) {
    e.preventDefault()
    try {
        const formData = new FormData(form)
        for (let [key, value] of formData.entries())
            console.log(key, value);
        $.ajax({
            url: `/adminAccount`,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
               
                    displayAlert('Success','Account Updated Successfully.', 'success', ()=>{
                        location.reload()
                    })
            
            },
            error: function (xhr, status, error) {
                if (xhr.status === 400) {
                    var response = JSON.parse(xhr.responseText);
                    displayAlert('Error', response.error, 'error',()=>location.reload())
                } else displayAlert('Failed to Edit Account ', 'Please try again it later.', 'error',()=>location.reload())
            }
        });
    } catch (err) {
        displayAlert('Error', err, 'error',()=>location.reload())
    }
})