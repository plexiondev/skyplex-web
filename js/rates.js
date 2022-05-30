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
            if (type != 'trades') {
                create_type_category(type);
                for (let i in data[`${type}`]) {
                    let em_record = document.createElement('tr');
                    em_record.innerHTML = (`
                    <th class="icon"><div class="headline-icon min" style="padding: 0; height: auto; position: relative; top: 5px;"><img src="https://plexion.dev/img/item/${data[`${type}`][i].name}.png"</div></th>
                    <th class="name">${data[`${type}`][i].name}</th>
                    <th class="values"><code class="on no-icon">+${data[`${type}`][i].level}</code></th>
                    <th class="values"><code class="no-icon">$${data[`${type}`][i].sell}</code> <code>x${data[`${type}`][i].quantity}</code></th>
                    `);

                    // append
                    document.getElementById(`category.${type}.table`).appendChild(em_record);
                }
            }
        }
    });
}

// create category panel
function create_type_category(type) {
    let em_panel = document.createElement('section');
    em_panel.classList.add('left','header','sep','no-align');
    em_panel.style = 'top: 0;';
    em_panel.id = `category.${type}`;
    em_panel.innerHTML = (`
    <h4>${types[type]}</h4>
    <div class="customising-cont">
        <table class="customising">
            <tbody id="category.${type}.table">
                <tr>
                    <th class="icon">Icon</th>
                    <th class="name">Name</th>
                    <th class="values">Level</th>
                    <th class="values">Sell</th>
                </tr>
            </tbody>
        </table>
    </div>
    `);

    // append
    document.getElementById('rates_append').appendChild(em_panel);
}