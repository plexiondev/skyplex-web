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
    document.getElementById('output').innerHTML = '';
    document.getElementById('table-body').innerHTML = (`
    <tr>
        <th>Icon</th>
        <th>Name</th>
        <th>Cost</th>
        <th>ID</th>
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

    document.getElementById('attr.name').textContent = `${name}`;
    document.getElementById('attr.profession').textContent = `${profession}`;

    let output = `give @p villager_spawn_egg{display:{Name:'{"text":"${name} Villager Spawn Egg","italic":false}'},EntityTag:{ActiveEffects:[{Id:10b,Amplifier:255b,Duration:99999,ShowParticles:0b},{Id:11b,Amplifier:2555b,Duration:99999,ShowParticles:0b},{Id:12b,Amplifier:2555b,Duration:99999,ShowParticles:0b}],CustomName:'{"text":"${name}","italic":false}',VillagerData:{profession:"minecraft:${profession}"},NoAI:1b,Offers:{Recipes:[`;

    let count = 0;
    for (let n in data) {
        if (n != 'trades') {
            // not trades
            for (let i in data[n]) {
                let match = false;
                for (let t in data[n][i].trades) {
                    if (data[n][i].trades[t] == trade) { match = true }
                }
            }

            for (let i in data[n]) {
                let match = false;
                for (let t in data[n][i].trades) {
                    if (data[n][i].trades[t] == trade) { match = true }
                }
                if (match == true) {
                    // add comma if in list
                    let comma = '';
                    if (i >= 1) { comma = ',' } // not first item

                    // advanced nbt
                    let nbt = '';
                    let nbt_tag = ',tag:{';
                    // nbt comma
                    let nbt_count = 0; // count to add commas
                    let nbt_comma = '';
                    for (let x in data[n][i].item) {
                        // comma
                        if (nbt_count >= 1) { nbt_comma = ','; } // not first item

                        if (x == 'custom_name') {
                            // custom name
                            nbt_tag = `${nbt_tag}display:{Name:'{"text":"${data[n][i].item.custom_name}","italic":false}'}`;
                        } else if (x == 'skyplex_id') {
                            // skyplex id
                            nbt_tag = `${nbt_tag}${nbt_comma}CustomModelData:${data[n][i].item.skyplex_id}`;
                        }

                        nbt_count += 1;
                    }
                    // write to nbt var
                    nbt_tag = `${nbt_tag}}`;
                    nbt = `${nbt_tag}`;

                    // check for skyplex id
                    let skyplex_id = '';
                    try {
                        skyplex_id = data[n][i].item.skyplex_id;
                    } catch(error) {}

                    // check for cost item
                    let cost_item = 'gold_nugget';
                    try {
                        cost_item = data[n][i].cost_item;
                    } catch(error) {}

                    let values = '';
                    if (data[n][i].type == 'sell') {
                        // sell
                        output = `${output}${comma}{buy:{id:"minecraft:${data[n][i].name}",Count:${data[n][i].quantity}b${nbt}},sell:{id:"minecraft:${cost_item}",Count:${data[n][i].sell}b},priceMultiplier:0.0f,maxUses:2147483647,rewardExp:0b,demand:0,specialPrice:0}`;
                        values = `<th class="values"><code class="no-icon">$${data[n][i].sell}</code> <code>x${data[n][i].quantity}</code></th>`;
                    } else {
                        // buy
                        output = `${output}${comma}{buy:{id:"minecraft:${cost_item}",Count:${data[n][i].cost}b},sell:{id:"minecraft:${data[n][i].name}",Count:1b${nbt},priceMultiplier:0.0f,maxUses:2147483647,rewardExp:0b,demand:0,specialPrice:0}}`;
                        values = `<th class="values"><code class="no-icon">$${data[n][i].cost}</code></th>`;
                    }

                    // record
                    let em_record = document.createElement('tr');
                    em_record.innerHTML = (`
                    <th class="icon"><div class="headline-icon min" style="padding: 0; height: auto; position: relative; top: 5px;"><img src="https://plexion.dev/img/item/${data[n][i].name}.png"</div></th>
                    <th class="name">${data[n][i].name}</th>
                    ${values}
                    <th>${skyplex_id}</th>
                    `);

                    // append
                    document.getElementById(`table-body`).appendChild(em_record);
                }
            }

            count += 1;
        }
    }

    // display output
    output = `${output}]}}}`;
    document.getElementById('output').innerHTML = `${output}`;
}

// copy
function copy() {
    var selector = document.getElementById('output');

    // write to clipboard
    navigator.clipboard.writeText(selector.textContent);
}