// load header


let page = document.body.getAttribute('page-location');
let marker = document.body.getAttribute('page-marker');
read_header(page,marker);

function read_header(page = 'main', marker = 0) {
    $.get('/js/header.json', function(data) {
        load_header(data,page,marker);
    });
}

function load_header(data,page,marker) {
    let em_brand = document.createElement('a');
        em_brand.classList.add('brand');
        em_brand.href = '/';
        em_brand.innerHTML = '<h1 translate="no">plexion</h1>';
    
    let em_links = document.createElement('span');
        em_links.classList.add('links');
    
    let em_menu = document.createElement('span');
        em_menu.classList.add('menu');
        em_menu.innerHTML = '<span class="dropdown-wrap"><a href="/settings" aria-label="Settings" class="option-open"><i class="icon w-28" data-feather="more-horizontal"></i></a></span>';

    for (let i in data[page]) {
        let em_link = document.createElement('a');
        em_link.href = data[page][i].link;

        // browser on THIS page?
        if (marker == i) em_link.classList.add('focus');

        if (data[page][i].type == 'icon') {
            em_link.classList.add('icon');
            em_link.innerHTML = `<i class="text"><i class="icon w-20" stroke-width="2.5" data-feather="${data[page][i].icon}"></i></i>`;
        } else {
            em_link.innerHTML = `<i class="icon w-20" stroke-width="2.5" data-feather="${data[page][i].icon}"></i><i class="text">${data[page][i].text}<span class="bar"></span></i>`;
        }

        // append
        em_links.appendChild(em_link);
    }

    // append
    document.getElementById('header').appendChild(em_brand);
    document.getElementById('header').appendChild(em_links);
    document.getElementById('header').appendChild(em_menu);

    feather.replace();
}