const form = document.querySelector('form')
const emailError = document.querySelector('.emailError')
const passwordError = document.querySelector('.passwordError')
const otpError = document.querySelector('.otpError')
let product_selected = ''
let menu_selected = 'home'
let category_selected = '*'
let brand_selected = ''
let thisPage = 1;
let limit = 12;
var list;


// header
document.addEventListener("DOMContentLoaded", function() {
    const currentPath = window.location.pathname;
    const url_ = currentPath.split('/')
    menu_selected = url_[url_.length-1]
    menu_bar = [...document.getElementsByClassName('menu_toggler')]
    menu_bar.forEach(bar=>{
        if (bar.dataset.filter == menu_selected) bar.classList.add('active')
        else  bar.classList.remove('active')
    })
});

if(window.location.href==`http://localhost:5000/shop`) {
    async function displayAllProducts() {
        try {
            var res = await fetch(`/products/sort/1`)
            const products = await res.json()
            displayProducts(products)
            list = [...document.getElementsByClassName('category_products')]
            loadItem()
        } catch (error) {
            console.log(error)
        }
    }
    displayAllProducts()
}



// login page
const loginForm = [... document.getElementsByClassName('loginForm')]
if (loginForm.length) {
    loginForm[0].addEventListener('submit', async (e) => {
        e.preventDefault()
        emailError.textContent = ""
        passwordError.textContent = ""
        const email = form.email.value
        const password = form.password.value
        try {
            const res = await fetch('/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: { 'Content-type': 'application/json' }
            })
            const data = await res.json()
            if (data.error) {
                emailError.textContent = data.error.email
                passwordError.textContent = data.error.password
                console.log('In errors,', emailError.textContent, passwordError.textContent)
            }
            else if (data.vendor) location.assign('/vendor') 
            else if (data.employee) location.assign('/home')
        } catch (err) {
            console.log(err)
        }
})}

// forgot password page
const forgotForm = [...document.getElementsByClassName('forgotPasswordForm')]
if (forgotForm.length) {
    forgotForm[0].addEventListener('submit', async(e)=>{
        e.preventDefault()
        const email = form.email.value
        try {
            const res = await fetch('/forgotpassword', {
                method: 'POST',
                body: JSON.stringify({ email }),
                headers: { 'Content-type': 'application/json' }
            })
            const data = await res.json()
            if (data.error) emailError.textContent = data.error
            else location.assign('/verify')
        } catch(err) {
            console.log(err)
        }   
    })
}

// verify OTP page
const verifyForm = [...document.getElementsByClassName('verifyForm')]
if (verifyForm.length) {
    verifyForm[0].addEventListener('submit', async(e)=>{
        e.preventDefault()
        const otp = form.otp.value
        const password = form.password.value
        const password_ = form.password_.value
        otpError.textContent = ''
        passwordError.textContent = ''
        try {
            const res = await fetch('/verify', {
                method: 'POST',
                body: JSON.stringify({ otp, password, password_ }),
                headers: { 'Content-type': 'application/json' }
            })
            const data = await res.json()
            console.log(data)
            if(data.error == 'incorrect otp') otpError.textContent = 'Please enter the correct OTP'
            else if(data.error == 'incorrect passwords') passwordError.textContent = "Passwords didn't match. Try again."
            else if(data.success) location.assign('/login')
        } catch (error) {
            console.log(error)
        }
    })
}



// home page
const opts = Array.from(document.getElementsByClassName('product_toggler'));
opts.forEach(opt => {
    opt.addEventListener('click', () => {
        const datafilter = opt.getAttribute('data-filter');
        if (datafilter == '*') {
            $('._product_').show();
        }
        else {
            $('._product_').hide();
            $(`._product_[data-filter*="${datafilter}"]`).show();
        }
    });
})

// shop page
const Form = [...document.getElementsByClassName('searchForm')]
if(Form.length) {
    Form[0].addEventListener('submit', async(e)=>{
        const value = Form[0].search.value;
            e.preventDefault()
            const res = await fetch('/search', {
                method: 'POST',
                body: JSON.stringify({ search: value }),
                headers: { 'Content-type': 'application/json' }
            })
            const products = await res.json()
            if (products.length) displayProducts(products)
            else {
                let product_container = document.getElementsByClassName('product_container')[0]
                while(product_container.firstChild) {
                    product_container.removeChild(product_container.lastChild)
                }
                const p = document.createElement('h5')
                p.textContent = 'No Products Found'
                product_container.appendChild(p)
                document.querySelector('.product__pagination').innerHTML = '';
            }
    })
}


function displayAlert(title) {
    Swal.fire({
        title: title,
        showClass: {
          popup: 'animate__animated animate__bounceIn'
        },
        allowOutsideClick: true,
        backdrop: true,
        confirmButtonClass: 'btn btn-primary',
        buttonsStyling: false
    })
}

function displayProducts(products) {   
    let product_container = document.getElementsByClassName('product_container')[0]
    while(product_container.firstChild) {
        product_container.removeChild(product_container.lastChild)
    }
    for(let i=0; i<products.length; i++) {
        
        const product_card = document.createElement('div');
        product_card.classList.add('product__card')
        product_card.classList.add('col-lg-3','col-md-6','col-sm-6','category_products')
        product_card.dataset.filter = `${products[i].brand} ${products[i].category}`;
        product_card.dataset.value = products[i].price
        product_card.setAttribute('value',products[i].price)
        product_card.setAttribute('id', products[i].id)
        const product_item = document.createElement('div');
        product_item.classList.add('product__item')
 
        const product_hover = document.createElement('ul')
        product_hover.classList.add('product__hover')
 
        const heart = document.createElement('li')
        heart.classList.add('wish')
        const heart_ = document.createElement('a')
        // heart_.href = '/wishlist';
        const heart_img = document.createElement('i')
        heart_img.classList.add('fa','fa-heart')
        // heart_img.src = 'img/icon/heart.png'

     
 
        heart_.appendChild(heart_img)
        heart.appendChild(heart_)
        product_hover.appendChild(heart)

        function updateHeartColor(isInWishlist) {
            if (isInWishlist) {
                heart_img.classList.add('text-danger');
            } else {
                heart_img.classList.remove('text-danger');
            }
        }
        const productId = products[i]._id;
const productName = products[i].title;
const productPrice = products[i].price;
const productImageUrl = products[i].thumbnail;


const data = {
    productId: productId,
    name: productName,
    price: productPrice,
    imageUrl: productImageUrl
};


checkProductInWishlist(productId).then(isInWishlist => {
    // Update the heart icon color based on whether the product exists in the wishlist
    updateHeartColor(isInWishlist);

    // Add click event listener to the heart icon
    heart_.addEventListener('click', function(event) {
        // Prevent default behavior of the link (i.e., prevent navigation)
        event.preventDefault();
        event.stopPropagation();

        // Toggle the heart icon color
        heart_img.classList.toggle('text-danger');

        // Update the isInWishlist state
        const isInWishlist = heart_img.classList.contains('text-danger');

        // Send an AJAX request to add/remove the product from the wishlist
        const endpoint = isInWishlist ? '/wishlistadd' : '/wishlistremove';
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update wishlist');
            }
            return response.json();
        })
        .then(data => {
            // alert(data.message);
                        displayAlert(data.message);
        })
   
         .catch(error => {
            console.error(error);
            displayAlert('Failed to update wishlist');
        });
    });
});



async function checkProductInWishlist(productId) {
    try {
        const response = await fetch(`/wishlist/check/${productId}`);
        const data = await response.json();
        return data.exists;
    } catch (error) {
        console.error(error);
        return false;
    }
}


 
        const add = document.createElement('a')
        add.href="#"
        add.dataset.id = products[i]._id
        add.dataset.name = products[i].title
        add.dataset.price = products[i].price
        add.dataset.image = products[i].thumbnail
        add.classList.add('add-cart')
        add.innerHTML = '+Add To Cart'
 
        const product_item_pic = document.createElement('div');
        product_item_pic.style.display = 'block';
        product_item_pic.classList.add('product__item__pic','set-bg')
        product_item_pic.style.backgroundImage = `url(${products[i].thumbnail})`
        console.log(`url(${products[i].thumbnail})`)
       
        product_item_pic.setAttribute('id', products[i].id)
 
     
        const product_item_text = document.createElement('div');
        product_item_text.classList.add('product__item__text')
        
        const title = document.createElement('h6')
        title.innerHTML = products[i].title
      
        const rating = document.createElement('div');
        rating.classList.add('rating')
        const rate = document.createElement('strong')
        rate.innerHTML = products[i].rating
        rating.appendChild(rate)
        for(let j=1; j<=5; j++) {
            const newElement = document.createElement('i');
            const space = document.createTextNode(' ');
            if(j<=Math.floor(products[i].rating)) newElement.className = 'fa fa-star text-warning';
            else if((j-products[i].rating)<=0.5) newElement.className = 'fa fa-star-half-alt text-warning';
            else newElement.className = 'fa fa-star-o';
            rating.appendChild(newElement)
            rating.appendChild(space)
        }
       
        const price = document.createElement('h5')  
        price.innerHTML = `${products[i].price} points`
 
        product_item_pic.appendChild(product_hover)
        product_item_text.appendChild(title)
        product_item_text.appendChild(rating)
        product_item_text.appendChild(add)
        product_item_text.appendChild(price)
        product_item.appendChild(product_item_pic)
        const id = product_item_pic.id
        product_item_pic.addEventListener('click',async() => {
            product_selected = id 
            try {
                const res = await fetch(`/products/${product_selected}`)
                location.assign(`/products/${product_selected}`)
            } catch(error) {
                console.log(error)
            }
        })
        product_item.appendChild(product_item_text)
        product_card.appendChild(product_item)
        product_container.appendChild(product_card)
    }
    list = [...document.getElementsByClassName('product__card')]
    loadItem()
}

const categories = Array.from(document.getElementsByClassName('category_toggler'));
categories.forEach(category=>{
    category.addEventListener('click',async()=>{
        try {
            const option = document.getElementById("sort").value
            const category_name = category.getAttribute('data-filter')
            brand_selected = ''
            category_selected = category_name
            if(category_name == '*') {
                var res = await fetch(`/products/sort/${option}`)
                $('.brand_toggler').show()
            }
            else {
                var res = await fetch(`/products/category/${category_name}/sort/${option}`)
                $('.brand_toggler').hide()
                $(`.brand_toggler[data-filter*="${category_name}"]`).show()
            }
            const products_ = await res.json()
            thisPage=1
            displayProducts(products_)
            list = [...document.getElementsByClassName('category_products')]
            loadItem()
        } 
        catch (error) {
            console.log(error)
        }

    })
})

const brands = Array.from(document.getElementsByClassName('brand_toggler'));
brands.forEach(brand=>{
    brand.addEventListener('click',async()=>{
        try {
            const option = document.getElementById("sort").value
            const brand_name = brand.textContent.trim()
            brand_selected = brand_name
            if(category_selected == '*') {var res = await fetch(`/products/brand/${brand_name}/sort/${option}`)}
            else {var res = await fetch(`/products/category/${category_selected}/brand/${brand_name}/sort/${option}`)}
            const products = await res.json()
            thisPage=1
            displayProducts(products)
            list = [...document.getElementsByClassName('category_products')]
            loadItem()
        } 
        catch (error) {
            console.log(error)
        }
    })
})

const tags = Array.from(document.getElementsByClassName('tags_toggler'))
tags.forEach(tag=>{
    tag.addEventListener('click',async()=>{
        const option = document.getElementById("sort").value
        const tag_name = tag.innerHTML.trim()
        var res = await fetch(`/products/tag/${tag_name}/sort/${option}`)
        const products = await res.json()
        thisPage=1
        displayProducts(products)
    })
})


async function sort() {
    const option = document.getElementById("sort").value
    if (category_selected == '*') {
        if (brand_selected !== '') { var res = await fetch(`/products/brand/${brand_selected}/sort/${option}`)}
        else { var res = await fetch(`/products/sort/${option}`)}
       } else {
        if (brand_selected !== '') { var res = await fetch(`/products/category/${category_selected}/brand/${brand_selected}/sort/${option}`)}
        else { var res = await fetch(`/products/category/${category_selected}/sort/${option}`) }
       }
    const products = await res.json()
    displayProducts(products)
}

function loadItem(){
    let beginGet = limit*(thisPage-1);
    let endGet = limit*thisPage-1;
    const results = document.getElementsByClassName('shop__product__option__left')[0]
    while(results.firstChild) { results.removeChild(results.lastChild) }
    const display = document.createElement('p')
    display.innerHTML = `Showing ${beginGet+1}–${endGet>list.length?list.length:endGet} of ${list.length} results`
    results.appendChild(display)
    list.forEach((item, key)=>{
        if (key >= beginGet && key <= endGet) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    })
    listPage();
}

function listPage() {
    let count = Math.ceil(list.length/limit);
    document.querySelector('.product__pagination').innerHTML = '';

    if(thisPage != 1) {
        let prev = document.createElement('a');
        prev.innerHTML = '<-'
        prev.setAttribute('onclick', "changePage(" + (thisPage-1) + ")");
        document.querySelector('.product__pagination').appendChild(prev);
    }

    for(i = 1; i <= count; i++) {
        let newPage = document.createElement('a');
        newPage.innerText = i;
        if(i == thisPage){
            newPage.classList.add('active');
        }
        newPage.setAttribute('onclick', "changePage(" + i + ")");
        document.querySelector('.product__pagination').appendChild(newPage);
    }

    if (thisPage != count) {
        let next = document.createElement('a');
        next.innerHTML = '->'
        next.setAttribute('onclick', "changePage(" + (thisPage+1) + ")");
        document.querySelector('.product__pagination').appendChild(next);
    }
}

function changePage(i) {
    thisPage = i;
    loadItem();
}

// product page
const pics = [...document.getElementsByClassName('tabs_toggler')]
pics.forEach(pic=>{
    pic.addEventListener('click',()=>{
        const tab_content = document.getElementsByClassName('tab-content')[0]
        while(tab_content.firstChild) { tab_content.removeChild(tab_content.lastChild) }
        const tab = pic.id
        const tab_pane = document.createElement('div')
        tab_pane.className = 'tab-pane'
        tab_pane.id = `tabs-${tab}`
        tab_pane.role = "tabpanel"
        const product_details = document.createElement('div')
        product_details.className = "product__details__pic__item"
        const img = document.createElement('img')
        img.src = `${pic.dataset.filter}`
        console.log(pic.dataset.filter)
        product_details.appendChild(img)
        tab_pane.appendChild(product_details)
        tab_content.appendChild(tab_pane)
    })
})

function display(title,icon) {
    Swal.fire({
       title: title,
       icon: icon,
       allowOutsideClick: true,
       backdrop: true,
       confirmButtonClass: 'btn btn-primary',
       buttonsStyling: false,
       customClass: {
           container: 'custom-container',
           backdrop: 'custom-backdrop'
       }
   })
}

//wishlist page 
$(document).on('click', '.far.fa-times-circle', function(event) {
    event.preventDefault();
    const productId = $(this).closest('.product__card').data('product-id');
    // AJAX request to remove the product from the wishlist
    $.ajax({
        url: '/wishlistremove', // Replace this with your server route
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ productId: productId }),
        success: function(response) {
            // Handle success response
            display(response.message,'error');
            // Optionally, remove the product from the UI
            // $(this).closest('.product__card').remove(); 
           document.getElementById(productId).style.display = "none";
        },
        error: function(xhr, status, error) {
            // Handle error response
            console.error(error);
            display('Failed to remove product from wishlist','warning');
        }
    });
});

// cart page
    $(document).on('click', '.add-cart',  function(event) { 
    
        event.preventDefault();
        event.stopPropagation();
        const productId = $(this).data('id');
        const productName = $(this).data('name');
        const productPrice = $(this).data('price');
        const productImageUrl = $(this).data('image');
        var proQty = $('.pro-qty');
        var productQuantity = parseFloat(proQty.parent().find('input').val())
        if (isNaN(productQuantity)) {
            productQuantity = 1;
        }
        console.log(productId)
        $.ajax({
            url: '/checkQuantity',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ productId: productId }),
            success: function(response) {
                if (response.quantity === response.cartQuantity) {
                     display('Product is out of stock!','warning');
                }
                else if (productQuantity <= response.quantity) {
                    $.ajax({
                        url: '/cart',
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            productId: productId,
                            name: productName,
                            price: productPrice,
                            imageUrl: productImageUrl,
                            quantity: productQuantity
                        }),
                        success: function(response) {    display('Item added to cart!','success'); },
                        error: function(xhr, status, error) { console.error('Error adding product to cart:', error);}
                    });
                } else display('Product is out of stock!','warning');
            },
            error: function(xhr, status, error) { console.error('Error checking product quantity:', error);}
        });
    });

$('.cart__close').click(function(event) {
    event.preventDefault();
    event.stopPropagation();
    const productId = $(this).find('i').data('product-id');
    const price= parseInt($(this).data('price'))
    $.ajax({
        url: '/removeCartProduct',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ productId: productId }),
        success: function(response) {
            display('Product removed from cart!','error');
            document.getElementById(productId).style.display = "none";
            let points = parseInt(document.getElementById('productPrice').innerHTML)
            points = points - price
            document.getElementById('productPrice').innerHTML = `${points} points`
            document.getElementsByClassName(productId)[0].remove()
        
            // location.reload();
        },
        error: function(xhr, status, error) { console.error('Error removing product from cart:', error);}
    });
});

$('#proceed-to-checkout-btn').click(async function(event) {
    event.preventDefault();

    try {
        const response = await fetch('/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({}) // No need to send any data for this request
        });

        const data = await response.json();

        if (response.status === 200) {
            // Cart is not empty, proceed to checkout
            window.location.href = '/checkout';
        } else {
            // Cart is empty, display an alert
            display(data.error,'warning');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});


// checkout page

function retrieveCartItems() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: '/cartProducts', 
            success: function(response) { resolve(response.cartItems); },
            error: function(error) { reject(error); }
        });
    });
}   

$('.place_order').on('click', async function(event) {
    event.preventDefault(); 
    const productId = $(this).data('id');
    const productName = $(this).data('name');
    const productPrice = $(this).data('price');
    const productImageUrl = $(this).data('image');
    var proQty = $('.pro-qty');
    var productQuantity = parseFloat(proQty.parent().find('input').val())
    try {
        const cartItems = await retrieveCartItems();
        const formData = {
            firstName: $('input[name=firstName]').val().trim(),
            lastName: $('input[name=lastName]').val().trim(),
            streetAddress: $('input[name=streetAddress]').val().trim(),
            city: $('input[name=city]').val().trim(),
            state: $('input[name=state]').val().trim(),
            country: $('input[name=country]').val().trim(),
            postcode: $('input[name=postcode]').val().trim(),
            phone: $('input[name=phone]').val().trim(),
            email: $('input[name=email]').val().trim(),
            cartItems: JSON.stringify(cartItems) 
        };
        for (const prop in formData) {
            if (!formData[prop]) {
                display('Please fill in all required fields!','warning');
                return;
            }
        }
        if (formData.cartItems === '[]'|| formData.cartItems.trim() === '' ) {
            console.log(formData.cartItems)
            display('Cart is empty. Please add items to your cart before placing an order.','warning');
            return;
        }
       
        $.ajax({
            url: '/check',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(response) {
                response.stockStatus.forEach(item => {
                    if (item.status === 'insufficient') {
                        if (item.stock === 0) {
                            display(`${item.productName} is out of stock.`,'warning');
                            for (const prop in formData) {
                                formData[prop] = null;
                            }
                            // Reset form input values
                            $('input[name=firstName]').val('');
                            $('input[name=lastName]').val('');
                            $('input[name=streetAddress]').val('');
                            $('input[name=city]').val('');
                            $('input[name=state]').val('');
                            $('input[name=country]').val('');
                            $('input[name=postcode]').val('');
                            $('input[name=phone]').val('');
                            $('input[name=email]').val('');
                        } else {
                            display(`Stock for ${item.productName} is ${item.stock}. You have ${item.cartQuantity} in your cart.`,'warning');
                            for (const prop in formData) {
                                formData[prop] = null;
                            }
                            // Reset form input values
                            $('input[name=firstName]').val('');
                            $('input[name=lastName]').val('');
                            $('input[name=streetAddress]').val('');
                            $('input[name=city]').val('');
                            $('input[name=state]').val('');
                            $('input[name=country]').val('');
                            $('input[name=postcode]').val('');
                            $('input[name=phone]').val('');
                            $('input[name=email]').val('');
                        }
                    }
                });

                const allProductsSufficient = response.stockStatus.every(item => item.status === 'sufficient');
                if (allProductsSufficient) {
                    // Proceed with sending mail
                    $.ajax({
                        type: 'POST',
                        url: '/mail',
                        contentType: 'application/json',
                        data: JSON.stringify(formData),
                        success: function(response) {
                            if (response.success) {
                                display('Order placed successfully.','success');
                                for (const prop in formData) {
                                    formData[prop] = null;
                                }
                                // Reset form input values
                                $('input[name=firstName]').val('');
                                $('input[name=lastName]').val('');
                                $('input[name=streetAddress]').val('');
                                $('input[name=city]').val('');
                                $('input[name=state]').val('');
                                $('input[name=country]').val('');
                                $('input[name=postcode]').val('');
                                $('input[name=phone]').val('');
                                $('input[name=email]').val('');
                                
                                // window.location.href = '/home';
                                document.getElementById('productprice').innerHTML = '0 points'
                                document.getElementById('empty').innerHTML = ''
                            } else {
                                display('Failed to place order. Please try again later.','warning');
                                for (const prop in formData) {
                                    formData[prop] = null;
                                }
                                // Reset form input values
                                $('input[name=firstName]').val('');
                                $('input[name=lastName]').val('');
                                $('input[name=streetAddress]').val('');
                                $('input[name=city]').val('');
                                $('input[name=state]').val('');
                                $('input[name=country]').val('');
                                $('input[name=postcode]').val('');
                                $('input[name=phone]').val('');
                                $('input[name=email]').val('');
                            }
                        },
                        error: function(xhr, status, error) {
                            if (xhr.status === 400) {
                                var response = JSON.parse(xhr.responseText);
                                display(response.error,'error');
                                for (const prop in formData) {
                                    formData[prop] = null;
                                }
                                // Reset form input values
                                $('input[name=firstName]').val('');
                                $('input[name=lastName]').val('');
                                $('input[name=streetAddress]').val('');
                                $('input[name=city]').val('');
                                $('input[name=state]').val('');
                                $('input[name=country]').val('');
                                $('input[name=postcode]').val('');
                                $('input[name=phone]').val('');
                                $('input[name=email]').val('');
                            } else {
                                display('Failed to place order. Please try again later.','warning');
                                for (const prop in formData) {
                                    formData[prop] = null;
                                }
                                // Reset form input values
                                $('input[name=firstName]').val('');
                                $('input[name=lastName]').val('');
                                $('input[name=streetAddress]').val('');
                                $('input[name=city]').val('');
                                $('input[name=state]').val('');
                                $('input[name=country]').val('');
                                $('input[name=postcode]').val('');
                                $('input[name=phone]').val('');
                                $('input[name=email]').val('');
                            }
                        }
                    });
                }
            },
            error: function(xhr, status, error) {
                console.error('Error checking product quantity:', error);
                display('Failed to check product quantity. Please try again later.','warning');
                for (const prop in formData) {
                    formData[prop] = null;
                }
                // Reset form input values
                $('input[name=firstName]').val('');
                $('input[name=lastName]').val('');
                $('input[name=streetAddress]').val('');
                $('input[name=city]').val('');
                $('input[name=state]').val('');
                $('input[name=country]').val('');
                $('input[name=postcode]').val('');
                $('input[name=phone]').val('');
                $('input[name=email]').val('');
            }
        });
        
    } catch (error) { display('Failed to retrieve cart items. Please try again later.','warning');}
});

// contact page
let formSubmitted = false;

const contactForm = [...document.getElementsByClassName('contactForm')]
if(contactForm.length) {
    contactForm[0].addEventListener('submit', function (event) {
        event.preventDefault();
        var nameInput = document.getElementById('nameInput');
        var emailInput = document.getElementById('emailInput');
        var messageInput = document.getElementById('messageInput');
        const contactNameError = document.querySelector('.contactNameError')
        const contactEmailError = document.querySelector('.contactEmailError')
        const contactMessageError = document.querySelector('.contactMessageError')
        var isValid = true;
        contactEmailError.textContent = ''
        contactMessageError.textContent = ''
        contactNameError.textContent = ''
    
        if (!nameInput.value.trim()) {
            isValid = false;
            contactNameError.textContent = 'Please enter your name.'
        }
    
        if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) {
            isValid = false;
            contactEmailError.textContent = 'Please enter a valid email address.'
        }
    
        if (!messageInput.value.trim()) {
            isValid = false;
            contactMessageError.textContent = 'Please enter your message.'
        }
    
        if (isValid && !formSubmitted) {
            (function () {
                emailjs.init("L1CnO7lzHJSjnsLNq");
            })();
            emailSend();
            formSubmitted = true;
        }
    });
    
    function isValidEmail(email) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function emailSend() {
        let parms = {
            from: document.getElementById('nameInput').value,
            fromail: document.getElementById("emailInput").value,
            message: document.getElementById("messageInput").value
        };
    
        emailjs.send("service_pdf1eel", "template_dwgd35r", parms)
            .then(res => {
                displayAlert("Message sent!");
                document.getElementById('nameInput').value = '',
                document.getElementById("emailInput").value= '',
                document.getElementById("messageInput").value = ''
                // window.location.reload();
            })
            .catch(error => {
                console.error("Error sending email:", error);
                displayAlert("An error occurred while sending the message. Please try again later.");
            });
    }
}




