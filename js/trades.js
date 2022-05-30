// trades generate


let data;
select();

// fill up select
function select() {
    $.get('/generate/rates.json',function(response) {
        data = response;

        for (let i in data.trades) {
            let em_option = document.createElement('option');
            em_option.value = `${data.trades[i].namespace}`;
            em_option.innerHTML = `${data.trades[i].name} (${data.trades[i].namespace})`;

            // append
            document.getElementById('trade').appendChild(em_option);
        }
    });
}


// generate
function generate() {
    document.getElementById('cont').innerHTML = '';
    document.getElementById('table-body').innerHTML = (`
    <tr>
        <th>Icon</th>
        <th>Name</th>
        <th>Sell</th>
    </tr>
    `);

    let trade = document.getElementById('trade').value;
    let profession;
    let name;

    for (let i in data.trades) {
        if (data.trades[i].namespace == trade) {
            profession = data.trades[i].profession;
            name = data.trades[i].name;
        }
    }

    let output = `give @p villager_spawn_egg{display:{Name:'{"text":"${name} Villager Spawn Egg","italic":false}'},EntityTag:{VillagerData:{profession:"minecraft:${profession}"},NoAI:1b,Offers:{Recipes:[`;

    let count = 0;
    for (let n in data) {
        if (n != 'trades') {
            // not trades
            for (let i in data[n]) {
                let match = false;
                for (let t in data[n][i].trades) {
                    if (data[n][i].trades[t] == trade) { match = true }
                }
                if (match == true) {
                    let comma0 = '';
                    if (count != 0) { comma0 = ',' }
                    output = `${output}${comma0}`;
                }
            }

            for (let i in data[n]) {
                let match = false;
                for (let t in data[n][i].trades) {
                    if (data[n][i].trades[t] == trade) { match = true }
                }
                if (match == true) {
                    let comma = '';
                    if (i != 0) { comma = ',' }
                    output = `${output}${comma}{buy:{id:"minecraft:${data[n][i].name}",Count:${data[n][i].quantity}b},sell:{id:"minecraft:gold_nugget",Count:${data[n][i].sell}b}}`;

                    // record
                    let em_record = document.createElement('tr');
                    em_record.innerHTML = (`
                    <th class="icon"><div class="headline-icon min" style="padding: 0; height: auto; position: relative; top: 5px;"><img src="https://plexion.dev/img/item/${data[n][i].name}.png"</div></th>
                    <th class="name">${data[n][i].name}</th>
                    <th class="values"><code class="no-icon">$${data[n][i].sell}</code> <code>x${data[n][i].quantity}</code></th>
                    `);

                    // append
                    document.getElementById(`table-body`).appendChild(em_record);
                }
            }

            count += 1;
        }
    }

    // end
    output = `${output}]}}}`;
    document.getElementById('cont').innerHTML = `${output}`;
}

// copy
function copy() {
    var selector = document.getElementById('cont');

    navigator.clipboard.writeText(selector.textContent);
}