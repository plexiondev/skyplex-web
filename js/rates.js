// display rates


get_rates();

const types = {
    'mine': 'Mining',
    'fish': 'Fishing',
    'farm': 'Farming'
};

function get_rates() {
    $.get('/generate/rates.json',function(data) {
        for (let type in data) {
            create_type_category(type);
            for (let i in data[`${type}`]) {
                console.log(type,i,data[`${type}`][i])
            }
        }
    });
}

// create category panel
function create_type_category(type) {
    let em_panel = document.createElement('div');
    em_panel.classList.add('left','header','sep','no-align');
    em_panel.style = 'top: 0;';

    em_panel.id = `category.${type}`;

    // append
    document.getElementById('rates_append').appendChild(em_panel);
}