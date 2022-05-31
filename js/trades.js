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
    $.get('/generate/trades.json',function(response) {
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
        <th></th>
        <th>Name</th>
        <th class="arrow-get"></th>
        <th></th>
        <th>Name</th>
        <th></th>
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
    //object.EntityTag = {ActiveEffects:[]}
    //for (let i in active_effects) {
    //    object.EntityTag.ActiveEffects.push({Id:active_effects[i],Amplifier:255,Duration:99999,ShowParticles:0});
    //}

    // entity data
    object.EntityTag.CustomName = {"text":`${name}`,"italic":false};
    object.EntityTag.VillagerData = {profession:`minecraft:${profession}`};
    object.EntityTag.NoAI = 1;
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

                    let custom_name = data[n][i].name;
                    let custom_description = '';

                    // advanced nbt
                    var nbt = {};
                    for (let x in data[n][i].item) {
                        if (x == 'custom_name') {
                            if (typeof nbt.display == 'undefined') { nbt.display = {} }
                            custom_name = data[n][i].item.custom_name;
                            nbt.display.Name = `{"text":"${data[n][i].item.custom_name}","italic":false}`;
                        } else if (x == 'description') {
                            if (typeof nbt.display == 'undefined') { nbt.display = {} }
                            custom_description = data[n][i].item.description;
                            nbt.display.Lore = [`{"text":"${data[n][i].item.description}","italic":false,"color":"gray"}`];
                        } else if (x == 'skyplex_id') {
                            nbt.CustomModelData = data[n][i].item.skyplex_id;
                        }
                    }

                    // check for skyplex id
                    let skyplex_id = '';
                    try {
                        skyplex_id = `#${data[n][i].item.skyplex_id}`;
                    } catch(error) {}

                    // check for cost item
                    let cost_item = 'gold_nugget';
                    if (data[n][i].cost_item != undefined) {
                        cost_item = data[n][i].cost_item;
                    }

                    // check for quantity
                    let quantity = 1;
                    if (data[n][i].quantity != undefined) {
                        quantity = data[n][i].quantity;
                    }


                    // record
                    let em_record = document.createElement('tr');


                    // buy & sell data
                    var items = {};
                    if (data[n][i].type == 'sell') {
                        // sell

                        items.buy = {id:`minecraft:${data[n][i].name}`,Count:data[n][i].quantity};
                        if (Object.keys(nbt).length > 0) { items.buy.tag = nbt; }

                        items.sell = {id:`minecraft:${cost_item}`,Count:data[n][i].cost}

                        // disable locking trades
                        items.priceMultipler = 0.0;
                        items.maxUses = 2147483647;
                        items.demand = 0;
                        items.specialPrice = 0;

                        em_record.innerHTML = (`
                        <th class="icon"><div class="headline-icon min" style="padding: 0; height: auto; position: relative; top: 10px;"><img src="https://plexion.dev/img/item/${data[n][i].name}.png"</div></th>
                        <th class="name" title="${custom_description}">${custom_name}<label class="count">${quantity}</label></th>
                        <th class="arrow-get"><i class="icon w-24" data-feather="arrow-right"></i></th>
                        <th class="icon"><div class="headline-icon min" style="padding: 0; height: auto; position: relative; top: 10px;"><img src="https://plexion.dev/img/item/${cost_item}.png"</div></th>
                        <th class="name">${cost_item}<label class="count">${data[n][i].cost}</label></th>
                        <th><label class="over">${skyplex_id}</label></th>
                        `);
                    } else {
                        // buy

                        items.sell = {id:`minecraft:${data[n][i].name}`,Count:1};
                        if (Object.keys(nbt).length > 0) { items.sell.tag = nbt; }

                        items.buy = {id:`minecraft:${cost_item}`,Count:data[n][i].cost}

                        // disable locking trades
                        items.priceMultipler = 0.0;
                        items.maxUses = 2147483647;
                        items.demand = 0;
                        items.specialPrice = 0;

                        em_record.innerHTML = (`
                        <th class="icon"><div class="headline-icon min" style="padding: 0; height: auto; position: relative; top: 10px;"><img src="https://plexion.dev/img/item/${cost_item}.png"</div></th>
                        <th class="name">${cost_item}<label class="count">${data[n][i].cost}</label></th>
                        <th class="arrow-get"><i class="icon w-24" data-feather="arrow-right"></i></th>
                        <th class="icon"><div class="headline-icon min" style="padding: 0; height: auto; position: relative; top: 10px;"><img src="https://plexion.dev/img/item/${data[n][i].name}.png"</div></th>
                        <th class="name" title="${custom_description}">${custom_name}<label class="count">${quantity}</label></th>
                        <th><label class="over">${skyplex_id}</label></th>
                        `);
                    }

                    // append to offers
                    object.EntityTag.Offers.Recipes.push(items);


                    // append
                    document.getElementById(`table-body`).appendChild(em_record);
                }
                feather.replace();
            }
        }
    }

    // display output
    let output = `give @p villager_spawn_egg${JSON.stringify(object).replaceAll('\\','')}`;
    document.getElementById('output').innerHTML = `${output}`;
}

// copy
function copy() {
    var selector = document.getElementById('output');

    // write to clipboard
    navigator.clipboard.writeText(selector.textContent);
}