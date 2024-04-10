const form = document.querySelector('form')
const titleError = document.querySelector('.titleError')
const shortdescriptionError = document.querySelector('.shortdescriptionError')
const brandError = document.querySelector('.brandError')
const stockError = document.querySelector('.stockError')
const noteError = document.querySelector('.noteError')
const productDescriptionError = document.querySelector('.productDescriptionError')
const priceError = document.querySelector('.priceError')
const categoryError = document.querySelector('.categoryError')
const minStockError = document.querySelector('.minStockError')
const outsideClick = document.querySelector('#outside-click')

// header
document.addEventListener("DOMContentLoaded", function () {
    const currentPath = window.location.pathname;
    const url_ = currentPath.split('/')
    menu_selected = url_[url_.length - 1]
    menu_bar = [...document.getElementsByClassName('menu_toggler')]
    menu_bar.forEach(bar => {
        if (bar.dataset.filter == menu_selected || currentPath.includes(bar.dataset.filter)) bar.classList.add('active')
        else bar.classList.remove('active')
        bar.addEventListener('click', async()=>{
            try {
                const res = await fetch(`/${bar.dataset.filter}`)
                if(!res.ok) location.assign('/pageNotFound')
                else this.location.assign(`/${bar.dataset.filter}`)
            } catch (error) {
                location.assign('/pageNotFound')
            }
        })
    })
});

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

// Add Product Page
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

const dropdownitems = [...document.getElementsByClassName('dropdown-item')]
if (dropdownitems.length) {
    dropdownitems.forEach(dropdownitem => {
        dropdownitem.addEventListener('click', () => {
            const target = dropdownitem.getAttribute('data-bs-target')
            const dropdown = dropdownitem.getAttribute('data-bs-filter')
            const dropdown_ = [...document.getElementsByClassName(dropdown)]
            const menu = document.getElementById(target)
            menu.classList.toggle('show')
            document.getElementsByName('category')[0].setAttribute('value', dropdownitem.textContent.trim())
            dropdown_[0].innerHTML = dropdownitem.textContent.trim()
        })
    })
}

function getBase64FromImage(imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

if (document.getElementsByClassName('thumbnail').length) {
    document.getElementsByClassName('thumbnail')[0].addEventListener('change', async function () {
        var file = this.files[0];
        var imageType = /image.*/;
        if (file.type.match(imageType)) {
            var img = document.getElementById('previewImage');
            img.src = await getBase64FromImage(file)
            img.style.display = 'block';
            // document.getElementById('filename').textContent = file.name;
        } else displayAlert('Error', `File ${file.name} is not a Valid Image.`, 'error')
    });
}

if (document.getElementById('uploads')) {
    document.getElementById('uploads').addEventListener('change', async function () {
        var files = this.files;
        var imageType = /image.*/;
        var imageContainer = document.getElementById('imageContainer');
        imageContainer.innerHTML = '';
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.type.match(imageType)) {
                var imgContainer = document.createElement('div');
                imgContainer.className = 'image-container';
                var img = document.createElement('img');
                img.src = await getBase64FromImage(file)
                img.style.maxWidth = '200px';
                img.style.maxHeight = '200px';
                // var fileName = document.createElement('p');
                // fileName.textContent = file.name;
                imgContainer.appendChild(img);
                // imgContainer.appendChild(fileName);
                imageContainer.appendChild(imgContainer);
            } else displayAlert('Error', `File ${file.name} is not a Valid Image.`, 'error')
        }
    });
}

if (document.getElementsByClassName('addProduct').length) {
    document.getElementsByClassName('addProduct')[0].addEventListener('submit', async (e) => {
        e.preventDefault()
        try {
            const names = ['title', 'shortdescription', 'brand', 'price', 'stock', 'productDescription', 'note', 'category', 'minStock']
            const errors = [titleError, shortdescriptionError, brandError, priceError, stockError, productDescriptionError, noteError, categoryError, minStockError]
            for (let i = 0; i < 7; i++) errors[i].textContent = ' '
            for (let i = 0; i < 7; i++) {
                if (!form[names[i]].value.trim()) {
                    errors[i].textContent = `${names[i]} cannot be empty.`
                    return
                }
            }
            const addProductForm = document.getElementsByClassName('addProduct')[0]
            const formData = new FormData(addProductForm)
            $.ajax({
                url: '/addProduct',
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    if (response.success) {
                        displayAlert('Product Added Successfully!', 'Your product has been added to the inventory.', 'success', ()=>location.reload())
                    }
                },
                error: function (xhr, status, error) {
                    if (xhr.status === 400) {
                        var response = JSON.parse(xhr.responseText);
                        displayAlert('Error', response.error, 'error')
                    } else displayAlert('Failed to Add Product', 'Your product has not been added to the inventory.', 'error')
                }
            });
        } catch (err) {
            displayAlert('Error', err, 'error')
        }
    })
}

// editProduct page
$('#productid').change(function () {
    const productid = $(this).val()
    if (productid) {
        $.ajax({
            type: 'GET',
            url: `/editProduct/products/${productid}`,
            success: async function (response) {
                document.getElementById('title').setAttribute('value', response[0].title)
                document.getElementById('shortdescription').setAttribute('value', response[0].description)
                document.getElementById('note').value = response[0].note
                document.getElementById('brand').setAttribute('value', response[0].brand)
                document.getElementById('price').setAttribute('value', response[0].price)
                document.getElementById('stock').setAttribute('value', response[0].stock)
                document.getElementById('minStock').setAttribute('value', response[0].minStock)
                document.getElementById('productDescription').value = response[0].productDescription

                var img = document.getElementById('previewImage');
                img.src = response[0].thumbnail
                img.style.display = 'block';
                img.classList.add('mb-2')

                var imageContainer = document.getElementById('imageContainer');
                imageContainer.innerHTML = '';

                for (var i = 0; i < response[0].images.length; i++) {
                    var file = response[0].images[i];
                    var imgContainer = document.createElement('div');
                    imgContainer.className = 'image-container';
                    var img = document.createElement('img');
                    img.src = file
                    img.style.maxWidth = '200px';
                    img.style.maxHeight = '200px';
                    // var fileName = document.createElement('p');
                    // fileName.textContent = file.name;
                    imgContainer.appendChild(img);
                    // imgContainer.appendChild(fileName);
                    imageContainer.appendChild(imgContainer);
                }
                imageContainer.style.display = 'flex'
                imageContainer.style.justifyContent = 'space-evenly'
                imageContainer.classList.add('mb-4')

                var category = document.getElementById('category')
                category.disabled = false
                category.value = response[0].category
                category.disabled = true

            },
            error: function (xhr, status, error) {
                if (xhr.status === 400) {
                    var response = JSON.parse(xhr.responseText);
                    displayAlert('Error', response.error, 'error')
                }
            }
        })
    }
    else {
        document.getElementById('title').setAttribute('value', '')
        document.getElementById('shortdescription').setAttribute('value', '')
        document.getElementById('note').value = ''
        document.getElementById('brand').setAttribute('value', '')
        document.getElementById('price').setAttribute('value', '')
        document.getElementById('stock').setAttribute('value', '')
        document.getElementById('minStock').setAttribute('value', '')
        document.getElementById('productDescription').value = ''

        var imageContainer = document.getElementById('imageContainer');
        imageContainer.innerHTML = '';
        var img = document.getElementById('previewImage');
        img.src = ''
    }
})

$('#editProductForm').submit(function (e) {
    e.preventDefault()
    const productid = $('#productid').val()
    if (productid) {
        try {
            const names = ['shortdescription', 'stock', 'productDescription', 'note', 'minStock']
            const errors = [shortdescriptionError, stockError, productDescriptionError, noteError, minStockError]
            for (let i = 0; i < 5; i++) errors[i].textContent = ' '
            for (let i = 0; i < 5; i++) {
                if (!form[names[i]].value.trim()) {
                    errors[i].textContent = `${names[i]} cannot be empty.`
                    return
                }
            }
            const formData = new FormData(form)
            for (let [key, value] of formData.entries())
                console.log(key, value);
            $.ajax({
                url: `/editProduct/products/${productid}`,
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    if (response.success) {
                        displayAlert('Success','Changes Added to the Product Successfully.', 'success', ()=>{
                            location.reload()
                        })
                    }
                },
                error: function (xhr, status, error) {
                    if (xhr.status === 400) {
                        var response = JSON.parse(xhr.responseText);
                        displayAlert('Error', response.error, 'error')
                    } else displayAlert('Failed to Edit Product ', 'Please try again it later.', 'error')
                }
            });
        } catch (err) {
            displayAlert('Error', err, 'error')
        }
    }
    else displayAlert('Failed to Edit Product!','Product Not Selected','error')
})

// productAnalytics page
const analytics = [...document.getElementsByClassName('product')]
if (analytics.length) {
    analytics.forEach(analytic => {
        analytic.addEventListener('click', async () => {
            const id = analytic.dataset.filter
            try {
                const res= await fetch(`/productAnalytics/product/${id}`)
                if(!res.ok) location.assign('/pageNotFound')
                else location.assign(`/productAnalytics/product/${id}`)
            }
            catch(error) {
                location.assign('/pageNotFound')
            }   
        })
    })
}

function displayProducts(products) {
    document.addEventListener('DOMContentLoaded', function() {}) 
    let product_container = document.getElementsByClassName('product_container')[0]
    while(product_container.firstChild) {
        product_container.removeChild(product_container.lastChild)
    }
    for(let i=0; i<products.length; i++) {
        const product_card = document.createElement('div');
        product_card.className = 'col product'
        product_card.dataset.filter = `${products[i].id}`;

        const card = document.createElement('div')
        card.className = 'card h-100'

        const img = document.createElement('img')
        img.className = 'card-img-top'
        img.src = `${products[i].thumbnail}`
        img.setAttribute('width', '100px')
        img.setAttribute('height', '400px')

        const body = document.createElement('div')
        body.className = 'card-body'

        const title = document.createElement('h5')
        title.className = 'card-title'
        title.innerHTML = products[i].title

        const note = document.createElement('p')
        note.className = 'card-text'
        note.innerHTML = products[i].note

        body.appendChild(title)
        body.appendChild(note)
        card.appendChild(img)
        card.appendChild(body)
        product_card.appendChild(card)
        product_container.appendChild(product_card)

        product_card.addEventListener('click', async () => {
            const id = product_card.dataset.filter
            try {
                const res= await fetch(`/productAnalytics/product/${id}`)
                if(!res.ok) location.assign('/pageNotFound')
                else location.assign(`/productAnalytics/product/${id}`)
            }
            catch(error) {
                location.assign('/pageNotFound')
            }   
        })
    }
}

$('#productSearch').on('input', async function(e) {
    const value = $(this).val();
    e.preventDefault()
    if(!value.trim()) return
    const res = await fetch('/search', {
        method: 'POST',
        body: JSON.stringify({ search: value }),
        headers: { 'Content-type': 'application/json' }
    })
    const products = await res.json()
    if (products.error) displayAlert(products.error, 'Failed to Search Product.', 'error', ()=>{ location.reload() })
    else if (products.length) displayProducts(products)
    else {
        let product_container = document.getElementsByClassName('product_container')[0]
        while(product_container.firstChild) {
            product_container.removeChild(product_container.lastChild)
        }
        const p = document.createElement('h5')
        p.textContent = 'No Products Found'
        product_container.appendChild(p)
    }
})


// account page
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

$("#accountForm").submit(function(e) {
    e.preventDefault()
    try {
        const formData = new FormData(form)
        for (let [key, value] of formData.entries())
            console.log(key, value);
        $.ajax({
            url: `/account`,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.success) {
                    displayAlert('Success','Account Updated Successfully.', 'success', ()=>{
                        location.reload()
                    })
                }
            },
            error: function (xhr, status, error) {
                if (xhr.status === 400) {
                    var response = JSON.parse(xhr.responseText);
                    displayAlert(response.error, 'Failed to Edit Account.','error', ()=>{})
                } 
            }
        });
    } catch (err) {
        displayAlert('Failed to Edit Account.', 'Please try again it later.', 'warning', ()=>{})
    }
})


// Change password 
const verifyForm = document.getElementById('formVerification');
if (verifyForm) {
    verifyForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const currentPassword = document.getElementById('op').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        try {
            const res = await fetch('/vendorCP', {
                method: 'POST',
                body: JSON.stringify({ email, currentPassword, newPassword, confirmPassword }),
                headers: { 'Content-type': 'application/json' }
            });
            const data = await res.json();
            if (data.success) {
                displayAlert('Success!', 'Your password has been changed.', 'success', () => {
                    location.assign('/vendor');
                });
            } else {
                console.error(data.error || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
}

