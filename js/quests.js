// quests generate


let data;
select();

// fill up select
function select() {
    $.get('/generate/quests.json',function(response) {
        data = response;

        for (let i in data.quests) {
            let em_option = document.createElement('option');
            em_option.value = `${data.quests[i].id}`;
            em_option.innerHTML = `${data.quests[i].name} (${data.quests[i].id})`;

            // append
            document.getElementById('trade').appendChild(em_option);
        }
    });
}

function call_gen() {
    generate(document.getElementById('trade').value);
}


// generate
function generate(quest) {
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

    let name;

    for (let i in data.quests) {
        if (data.quests[i].id == quest) {
            name = data.quests[i].name;
        }
    }

    let quest_generic = '';
    let quest_load = '';
    let quest_advancement = '';
    let quest_start = '';
    let quest_end_check = '';
    let quest_end = '';

    document.getElementById('attr.name').textContent = `${name}`;

    // assemble json
    var object = {display:{},EntityTag:{}};

    // spawn egg display (name)
    object.display = {Lore:[`{"text":"Name: ${name}","color":"gray","italic":false}`]};
    
    // active effects
    //object.EntityTag = {ActiveEffects:[]}
    //for (let i in active_effects) {
    //    object.EntityTag.ActiveEffects.push({Id:active_effects[i],Amplifier:255,Duration:99999,ShowParticles:0});
    //}

    // entity data
    object.EntityTag.CustomName = `{"text":"${name}"}`;
    object.EntityTag.NoAI = 1;
    object.EntityTag.Offers = {Recipes:[]};


    // loop through quests
    for (let n in data) {
        if (n != 'quests') {
            // not quests array

            for (let i in data[n]) {
                // valid quest?
                let match = false;
                for (let t in data[n][i].quests) {
                    if (data[n][i].quests[t] == quest) { match = true }
                }
                if (match == true) {
                    // if valid

                    // buy
                    var buy_name = data[n][i].buy.id;
                    var buy_description = '';
                    var buy_model = '';
                    var buy_quest = 0;
                    var buy_enchants= [];
                    // sell
                    var sell_name = data[n][i].sell.id;
                    var sell_description = '';
                    var sell_model = '';
                    var sell_quest = 0;
                    var sell_enchants = [];

                    // advanced nbt
                    try {
                        var buy_data = nbt('buy',{},n,i);
                        var sell_data = nbt('sell',{},n,i);

                        buy_nbt = buy_data[0]
                        sell_nbt = sell_data[0]

                        if (buy_data[1] != '') { buy_name = buy_data[1] }
                        if (buy_data[2] != '') { buy_description = buy_data[2] }
                        if (buy_data[3] != '') { buy_model = buy_data[3] }
                        if (buy_data[4] != '') {
                            buy_quest = buy_data[4];
                            let buy_advancement_temp = parse_advancement(data[n][i].buy.nbt.criteria,buy_data[4],quest_advancement,quest_end_check,quest_end,data[n][i].buy);

                            quest_advancement = buy_advancement_temp[0];
                            quest_end_check = buy_advancement_temp[1];
                            quest_end = buy_advancement_temp[2];
                        }
                        if (buy_data[5] != '') { buy_enchants = buy_data[5] }
                        if (buy_data[6] != '') { quest_generic = `${quest_generic}<br>${buy_data[6]}` }
                        if (buy_data[7] != '') { quest_load = `${quest_load}<br>${buy_data[7]}` }
                        if (buy_data[8] != '') { quest_start = `${quest_start}<br>${buy_data[8]}` }

                        if (sell_data[1] != '') { sell_name = sell_data[1] }
                        if (sell_data[2] != '') { sell_description = sell_data[2] }
                        if (sell_data[3] != '') { sell_model = sell_data[3] }
                        if (sell_data[4] != '') {
                            sell_quest = sell_data[4];
                            let sell_advancement_temp = parse_advancement(data[n][i].sell.nbt.criteria,sell_data[4],quest_advancement,quest_end_check,quest_end,data[n][i].sell);

                            quest_advancement = sell_advancement_temp[0];
                            quest_end_check = sell_advancement_temp[1];
                            quest_end = sell_advancement_temp[2];
                        }
                        if (sell_data[5] != '') { sell_enchants = sell_data[5] }
                        if (sell_data[6] != '') { quest_generic = `${quest_generic}<br>${sell_data[6]}` }
                        if (sell_data[7] != '') { quest_load = `${quest_load}<br>${sell_data[7]}` }
                        if (sell_data[8] != '') { quest_start = `${quest_start}<br>${sell_data[8]}` }
                    } catch(error) {}

                    // buy & sell data
                    var items = {};

                    // buy item
                    items.buy = {id:`${data[n][i].buy.id}`,Count:data[n][i].buy.count};
                    if (typeof buy_nbt != 'undefined') { items.buy.tag = buy_nbt; }

                    // sell item
                    items.sell = {id:`${data[n][i].sell.id}`,Count:data[n][i].sell.count};
                    if (typeof sell_nbt != 'undefined') { items.sell.tag = sell_nbt; }

                    // disable locking trades
                    items.priceMultipler = 0.0;
                    items.maxUses = 2147483647;
                    items.demand = 0;
                    items.specialPrice = 0;

                    // append to offers
                    object.EntityTag.Offers.Recipes.push(items);


                    // visually display enchant in preview
                    let buy_enchant = '';
                    let sell_enchant = '';
                    // check for enchants
                    if (buy_enchants.length > 0) { buy_enchant = ' enchant'; }
                    if (sell_enchants.length > 0) { sell_enchant = ' enchant'; }

                    // format enchants
                    let format_buy_enchants = '';
                    let format_sell_enchants = '';
                    for (let e in buy_enchants) { format_buy_enchants = `${format_buy_enchants}${buy_enchants[e].id} ${buy_enchants[e].lvl} `; }
                    for (let e in sell_enchants) { format_sell_enchants = `${format_sell_enchants}${sell_enchants[e].id} ${sell_enchants[e].lvl} `; }

                    // record
                    let em_record = document.createElement('tr');
                    em_record.innerHTML = (`
                    <th class="icon${buy_enchant}"><div class="headline-icon min" style="padding: 0; height: auto; position: relative; top: 10px;"><img src="https://plexion.dev/img/item/${data[n][i].buy.id}.png"</div></th>
                    <th class="name has-tooltip${buy_enchant}" title="${buy_description} ${format_buy_enchants}">${buy_name}<label class="count">${data[n][i].buy.count}</label> <label class="count">Q${buy_quest}</label></th>
                    <th class="arrow-get"><i class="icon w-24" data-feather="arrow-right"></i></th>
                    <th class="icon${sell_enchant}"><div class="headline-icon min" style="padding: 0; height: auto; position: relative; top: 10px;"><img src="https://plexion.dev/img/item/${data[n][i].sell.id}.png"</div></th>
                    <th class="name has-tooltip${sell_enchant}" title="${sell_description} ${format_sell_enchants}">${sell_name}<label class="count">${data[n][i].sell.count}</label> <label class="count">Q${sell_quest}</label></th>
                    `);


                    // append
                    document.getElementById(`table-body`).appendChild(em_record);
                }
                feather.replace();
            }
        }
    }

    // display output
    let output = `give @p villager_spawn_egg${JSON.stringify(object)}`;
    document.getElementById('output').innerHTML = `${output}`;
    document.getElementById('output_generic').innerHTML = `${quest_generic}`;
    document.getElementById('output_load').innerHTML = `${quest_load}`;
    document.getElementById('output_advancement').innerHTML = `${quest_advancement}`;
    document.getElementById('output_start').innerHTML = `${quest_start}`;
    document.getElementById('output_end_check').innerHTML = `${quest_end_check}`;
    document.getElementById('output_end').innerHTML = `${quest_end}`;
}

// parse nbt
function nbt(type,nbt,n,i) {
    let custom_name = '';
    let custom_description = '';
    let custom_model = '';
    let quest = 0;
    let rewards;
    let custom_enchants = [];
    let quest_generic = '';
    let quest_load = '';
    let quest_start = '';

    for (let x in data[n][i][`${type}`].nbt) {
        if (x == 'name') {
            if (typeof nbt.display == 'undefined') { nbt.display = {} }
            custom_name = data[n][i][`${type}`].nbt.name;
            nbt.display.Name = `{"text":"${data[n][i][`${type}`].nbt.name}","italic":false}`;
        } else if (x == 'description') {
            if (typeof nbt.display == 'undefined') { nbt.display = {} }
            custom_description = data[n][i][`${type}`].nbt.description;
            nbt.display.Lore = [];

            for (let c in data[n][i][`${type}`].nbt.description) {
                nbt.display.Lore.push(`${JSON.stringify(data[n][i][`${type}`].nbt.description[c])}`);
            }
        } else if (x == 'rewards') {
            if (typeof nbt.display == 'undefined') { nbt.display = {} }
            if (typeof nbt.display.Lore == 'undefined') { nbt.display.Lore = [] }
            rewards = data[n][i][`${type}`].nbt.rewards;

            // header
            nbt.display.Lore.push(`${JSON.stringify({"text":"Rewards:","color":"gold","italic":false})}`);

            for (let c in data[n][i][`${type}`].nbt.rewards) {
                nbt.display.Lore.push(`${JSON.stringify({"text":`${data[n][i][`${type}`].nbt.rewards[c].count} ${data[n][i][`${type}`].nbt.rewards[c].id}`,"color":"yellow","italic":false})}`);
            }
        } else if (x == 'model') {
            custom_model = data[n][i][`${type}`].nbt.model;
            nbt.CustomModelData = data[n][i][`${type}`].nbt.model;
        } else if (x == 'quest_id') {
            quest = data[n][i][`${type}`].nbt.quest_id;
            nbt.QuestID = data[n][i][`${type}`].nbt.quest_id;
            // generic quest list
            quest_generic = `## quest ${data[n][i][`${type}`].nbt.quest_id}<br># start<br>execute if score @s quest.holding matches 1.. if score @s quest.holding_id matches ${data[n][i][`${type}`].nbt.quest_id} run scoreboard players set @s quest_${data[n][i][`${type}`].nbt.quest_id} 1<br>execute if score @s quest.holding matches 1.. if score @s quest.holding_id matches ${data[n][i][`${type}`].nbt.quest_id} unless score @s quest_${data[n][i][`${type}`].nbt.quest_id}.seen matches 1.. run function sp:system/quest/${data[n][i][`${type}`].nbt.quest_id}/start<br>execute if score @s quest.holding matches 1.. if score @s quest.holding_id matches ${data[n][i][`${type}`].nbt.quest_id} run scoreboard players set @s quest_${data[n][i][`${type}`].nbt.quest_id}.seen 1<br>execute if score @s quest.holding matches 1.. if score @s quest.holding_id matches ${data[n][i][`${type}`].nbt.quest_id} run clear @s ${data[n][i][`${type}`].id}{QuestID:${data[n][i][`${type}`].nbt.quest_id}} 1`;
            quest_start = `## quest ${data[n][i][`${type}`].nbt.quest_id}<br># start<br>tellraw @s ["",{"text":"[","color":"dark_gray"},{"text":"♦","color":"gold"},{"text":"] ","color":"dark_gray"},{"text":"Quest started! ","color":"gold"},{"text":"${data[n][i][`${type}`].nbt.name}\n","color":"yellow"}]`;
            quest_load = `## quest ${data[n][i][`${type}`].nbt.quest_id}<br>scoreboard objectives add quest_${data[n][i][`${type}`].nbt.quest_id} dummy<br>scoreboard objectives add quest_${data[n][i][`${type}`].nbt.quest_id}.seen dummy`;
        } else if (x == 'enchants') {
            if (typeof nbt.Enchantments == 'undefined') { nbt.Enchantments = [] }
            custom_enchants = data[n][i][`${type}`].nbt.enchants;
            for (let e in data[n][i][`${type}`].nbt.enchants) {
                nbt.Enchantments.push({id:`minecraft:${data[n][i][`${type}`].nbt.enchants[e].id}`,lvl:data[n][i][`${type}`].nbt.enchants[e].lvl});
            }
        }
    }

    return [nbt,custom_name,custom_description,custom_model,quest,custom_enchants,quest_generic,quest_load,quest_start];
}

// copy
function copy() {
    var selector = document.getElementById('output');

    // write to clipboard
    navigator.clipboard.writeText(selector.textContent);
}

// generate advancement files
function parse_advancement(criteria,quest_id,quest_advancement,quest_end_check,quest_end,item) {
    let advancement = {display:{},criteria:{},rewards:{}};

    advancement.display.title = {"text": `${item.nbt.name} (quest)`};
    advancement.display.description = {"text": `Quest ${quest_id}`};
    advancement.display.icon = {"item": `minecraft:${item.id}`};

    advancement.display.show_toast = false;
    advancement.display.announce_to_chat = false;
    advancement.display.hidden = true;

    advancement.criteria = criteria;
    advancement.rewards.function = `sp:system/quest/${quest_id}/end_check`;

    quest_advancement = `${quest_advancement}quest ${quest_id}<br>${JSON.stringify(advancement)}<br><br>`;
    quest_end_check = `${quest_end_check}## quest ${quest_id}<br>execute if score @s quest_${quest_id} matches 1.. run function sp:system/quest/${quest_id}/end<br>execute unless score @s quest_${quest_id} matches 1.. run advancement revoke @s only sp:quest_${quest_id}<br><br>`;
    
    quest_end = `${quest_end}## quest ${quest_id}<br>tellraw @s ["",{"text":"[","color":"dark_gray"},{"text":"♦","color":"gold"},{"text":"] ","color":"dark_gray"},{"text":"Quest finished! ","color":"gold"},{"text":"${item.nbt.name}","color":"yellow"}]`;
    for (let i in item.nbt.rewards) {
        quest_end = `${quest_end}<br>give @s minecraft:${item.nbt.rewards[i].id} ${item.nbt.rewards[i].count}`;
        quest_end = `${quest_end}<br>tellraw @s [" "," "," ",{"text":" + ","color":"dark_gray"},{"text":" ${item.nbt.rewards[i].count}x ${item.nbt.rewards[i].id}"}]`;
    }
    quest_end = `${quest_end}<br>tellraw @s ""<br><br>`;

    return [quest_advancement,quest_end_check,quest_end];
}