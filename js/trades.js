// trades generate


const active_effects = {
    0: 10,
    1: 11,
    2: 12
}

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

    // assemble json
    var object = {display:{},EntityTag:{}};

    // spawn egg display (name)
    object.display = {Name:`{"text":"${name} Villager Spawn Egg","italic":false}`,Lore:[`{"text":"Profession: ${profession}","color":"gray","italic":false}`]};
    
    // active effects
    object.EntityTag = {ActiveEffects:[]}
    for (let i in active_effects) {
        object.EntityTag.ActiveEffects.push({Id:active_effects[i],Amplifier:255,Duration:99999,ShowParticles:0});
    }

    // entity name
    object.EntityTag.CustomName = {"text":`${name}`};
    
    // villager data
    object.EntityTag.VillagerData = {profession:`minecraft:${profession}`};

    // remove ai
    object.EntityTag.NoAI = 1;

    // offers
    object.EntityTag.Offers = {Recipes:[]};


    // loop through rates
    for (let n in data) {
        if (n != 'trades') {
            // not trades array

            for (let i in data[n]) {
                // valid trade?
                let match = false;
                for (let t in data[n][i].trades) {
                    if (data[n][i].trades[t] == trade) { match = true }
                }
                if (match == true) {
                    // if valid

                    // advanced nbt
                    var nbt = {};
                    for (let x in data[n][i].item) {
                        if (x == 'custom_name') {
                            if (typeof nbt.display == 'undefined') { nbt.display = {} }
                            nbt.display.Name = `{"text":"${data[n][i].item.custom_name}","italic":false}`;
                        } else if (x == 'description') {
                            if (typeof nbt.display == 'undefined') { nbt.display = {} }
                            nbt.display.Lore = [`{"text":"${data[n][i].item.description}","italic":false,"color":"gray"}`];
                        } else if (x == 'skyplex_id') {
                            nbt.CustomModelData = data[n][i].item.skyplex_id;
                        }
                    }

                    // check for skyplex id
                    let skyplex_id = '';
                    try {
                        skyplex_id = data[n][i].item.skyplex_id;
                    } catch(error) {}

                    // check for cost item
                    let cost_item = 'gold_nugget';
                    if (data[n][i].cost_item != undefined) {
                        cost_item = data[n][i].cost_item;
                    }


                    // buy & sell data
                    let values = '';
                    var items = {};
                    if (data[n][i].type == 'sell') {
                        // sell

                        items.buy = {id:`minecraft:${data[n][i].name}`,Count:data[n][i].quantity};
                        if (Object.keys(nbt).length > 0) { items.buy.tag = nbt; }

                        items.sell = {id:`minecraft:${cost_item}`,Count:data[n][i].sell}

                        // disable locking trades
                        items.priceMultipler = 0.0;
                        items.maxUses = 2147483647;
                        items.rewardExp = 0;
                        items.demand = 0;
                        items.specialPrice = 0;

                        values = `<th class="values"><code class="no-icon">$${data[n][i].sell}</code> <code>x${data[n][i].quantity}</code></th>`;
                    } else {
                        // buy

                        items.sell = {id:`minecraft:${data[n][i].name}`,Count:1};
                        if (Object.keys(nbt).length > 0) { items.sell.tag = nbt; }

                        items.buy = {id:`minecraft:gold_nugget`,Count:data[n][i].cost}

                        // disable locking trades
                        items.priceMultipler = 0.0;
                        items.maxUses = 2147483647;
                        items.rewardExp = 0;
                        items.demand = 0;
                        items.specialPrice = 0;

                        values = `<th class="values"><code class="no-icon">$${data[n][i].cost}</code></th>`;
                    }

                    // append to offers
                    object.EntityTag.Offers.Recipes.push(items);


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
        }
    }

    // display output
    let output = `give @p villager_spawn_egg${JSON.stringify(object)}`;
    document.getElementById('output').innerHTML = `${output}`;
}

// copy
function copy() {
    var selector = document.getElementById('output');

    // write to clipboard
    navigator.clipboard.writeText(selector.textContent);
}