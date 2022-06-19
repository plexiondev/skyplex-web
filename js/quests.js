// quests generate


let data;
select();
let ItemDB;
LoadItems();

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


function LoadItems() {
    // loads in a (legacy) minecraft item db
    $.get('/js/items_by_name.json',function(response) {
        ItemDB = response;
    });
}


// generate
function generate(quest) {
    document.getElementById('output').innerHTML = '';
    document.getElementById('table-body').innerHTML = '';

    let VillagerName;
    for (let i in data.quests) if (data.quests[i].id == quest) VillagerName = data.quests[i].name;

    let QuestGeneric = '';
    let QuestLoad = '';
    let QuestAdvancement = '';
    let QuestStart = '';
    let QuestEndCheck = '';
    let QuestEnd = '';

    document.getElementById('attr.name').textContent = `${VillagerName}`;

    // assemble json
    var object = {display:{},EntityTag:{}};

    // spawn egg display (name)
    object.display = {Lore:[`{"text":"Name: ${VillagerName}","color":"gray","italic":false}`]};
    
    // active effects
    //object.EntityTag = {ActiveEffects:[]}
    //for (let i in active_effects) {
    //    object.EntityTag.ActiveEffects.push({Id:active_effects[i],Amplifier:255,Duration:99999,ShowParticles:0});
    //}

    // entity data
    object.EntityTag.CustomName = `{"text":"${VillagerName}"}`;
    object.EntityTag.NoAI = 1;
    object.EntityTag.Offers = {Recipes:[]};


    // loop through quests
    for (let n in data) {
        if (n != 'quests') {
            // not quests array

            for (let i in data[n]) {
                // valid quest?
                let match = false;
                for (let t in data[n][i].quests) if (data[n][i].quests[t] == quest) match = true;
                if (match == true) {
                    // if valid

                    // buy
                    let BuyItemName = data[n][i].buy.id;
                    let BuyItemDescription = '';
                    let BuyItemModel = '';
                    let BuyItemQuestID = 0;
                    let BuyItemEnchants= [];
                    // sell
                    let SellItemName = data[n][i].sell.id;
                    let SellItemDescription = '';
                    let SellItemModel = '';
                    let SellItemQuestID = 0;
                    let SellItemEnchants = [];

                    // advanced nbt
                    try {
                        // parse nbt
                        let TempBuyData = ParseNBT('buy',{},n,i);
                        let TempSellData = ParseNBT('sell',{},n,i);

                        // save nbt for buy & sell
                        // (taken from response)
                        BuyItemNBT = TempBuyData[0]
                        SellItemNBT = TempSellData[0]

                        // extract buy item data
                        if (TempBuyData[1] != '') BuyItemName = TempBuyData[1];
                        if (TempBuyData[2] != '') BuyItemDescription = TempBuyData[2];
                        if (TempBuyData[3] != '') BuyItemModel = TempBuyData[3];
                        if (TempBuyData[4] != '') {
                            BuyItemQuestID = TempBuyData[4];
                            let TempBuyDataAdvancement = CreateAdvancement(data[n][i].buy.nbt.criteria,TempBuyData[4],QuestAdvancement,QuestEndCheck,QuestEnd,data[n][i].buy);

                            QuestAdvancement = TempBuyDataAdvancement[0];
                            QuestEndCheck = TempBuyDataAdvancement[1];
                            QuestEnd = TempBuyDataAdvancement[2];
                        }
                        if (TempBuyData[5] != '') BuyItemEnchants = TempBuyData[5];
                        if (TempBuyData[6] != '') QuestGeneric = `${QuestGeneric}<br>${TempBuyData[6]}`;
                        if (TempBuyData[7] != '') QuestLoad = `${QuestLoad}<br>${TempBuyData[7]}`;
                        if (TempBuyData[8] != '') QuestStart = `${QuestStart}<br>${TempBuyData[8]}`;

                        // extract sell item data
                        if (TempSellData[1] != '') SellItemName = TempSellData[1];
                        if (TempSellData[2] != '') SellItemDescription = TempSellData[2];
                        if (TempSellData[3] != '') SellItemModel = TempSellData[3];
                        if (TempSellData[4] != '') {
                            SellItemQuestID = TempSellData[4];
                            let TempSellDataAdvancement = CreateAdvancement(data[n][i].sell.nbt.criteria,TempSellData[4],QuestAdvancement,QuestEndCheck,QuestEnd,data[n][i].sell);

                            QuestAdvancement = TempSellDataAdvancement[0];
                            QuestEndCheck = TempSellDataAdvancement[1];
                            QuestEnd = TempSellDataAdvancement[2];
                        }
                        if (TempSellData[5] != '') SellItemEnchants = TempSellData[5];
                        if (TempSellData[6] != '') QuestGeneric = `${QuestGeneric}<br>${TempSellData[6]}`;
                        if (TempSellData[7] != '') QuestLoad = `${QuestLoad}<br>${TempSellData[7]}`;
                        if (TempSellData[8] != '') QuestStart = `${QuestStart}<br>${TempSellData[8]}`;
                    } catch(error) {}

                    // buy & sell data
                    let items = {};

                    // buy item
                    items.buy = {id:`${data[n][i].buy.id}`,Count:data[n][i].buy.count};
                    if (typeof BuyItemNBT != 'undefined') { items.buy.tag = BuyItemNBT; }

                    // sell item
                    items.sell = {id:`${data[n][i].sell.id}`,Count:data[n][i].sell.count};
                    if (typeof SellItemNBT != 'undefined') { items.sell.tag = SellItemNBT; }

                    // ensure trades cannot be locked
                    items.priceMultipler = 0.0; // ensure price does not change
                    items.maxUses = 2147483647; // set max amount of trade uses
                    items.demand = 0; // set demand of item to 0
                    items.specialPrice = 0; // set discount(?) price to +0

                    // append to offers
                    object.EntityTag.Offers.Recipes.push(items);


                    // visually display enchant in preview
                    let BuyItemIsEnchanted = '';
                    let SellItemIsEnchanted = '';
                    // check for enchants
                    // will append the class `enchant` if present
                    if (BuyItemEnchants.length > 0) BuyItemIsEnchanted = ' enchant';
                    if (SellItemEnchants.length > 0) SellItemIsEnchanted = ' enchant';

                    // format enchants
                    let FormatBuyItemEnchants = '';
                    let FormatSellItemEnchants = '';
                    for (let e in BuyItemEnchants) FormatBuyItemEnchants = `${FormatBuyItemEnchants}${BuyItemEnchants[e].id} ${BuyItemEnchants[e].lvl} `;
                    for (let e in SellItemEnchants) FormatSellItemEnchants = `${FormatSellItemEnchants}${SellItemEnchants[e].id} ${SellItemEnchants[e].lvl} `;

                    // record
                    let HTMLRecord = document.createElement('tr');
                    HTMLRecord.innerHTML = (`
                    <th class="icon${BuyItemIsEnchanted}"><div class="headline-icon min" style="padding: 0; height: auto; position: relative; top: 10px;"><img src="https://plexion.dev/img/item/${data[n][i].buy.id}.png"</div></th>
                    <th class="name ${BuyItemIsEnchanted}" title="${BuyItemDescription} ${FormatBuyItemEnchants}">${BuyItemName}<label class="count">${data[n][i].buy.count}</label> <label class="count">Q${BuyItemQuestID}</label></th>
                    <th class="arrow-get"><i class="icon w-24" data-feather="arrow-right"></i></th>
                    <th class="icon${SellItemIsEnchanted}"><div class="headline-icon min" style="padding: 0; height: auto; position: relative; top: 10px;"><img src="https://plexion.dev/img/item/${data[n][i].sell.id}.png"</div></th>
                    <th class="name ${SellItemIsEnchanted}" title="${SellItemDescription} ${FormatSellItemEnchants}">${SellItemName}<label class="count">${data[n][i].sell.count}</label> <label class="count">Q${SellItemQuestID}</label></th>
                    `);


                    // append
                    document.getElementById('table-body').appendChild(HTMLRecord);
                }
                feather.replace();
            }
        }
    }

    // display output
    let output = `give @p villager_spawn_egg${JSON.stringify(object)}`;
    document.getElementById('output').innerHTML = `${output}`;
    document.getElementById('output_generic').innerHTML = `${QuestGeneric}`;
    document.getElementById('output_load').innerHTML = `${QuestLoad}`;
    document.getElementById('output_advancement').innerHTML = `${QuestAdvancement}`;
    document.getElementById('output_start').innerHTML = `${QuestStart}`;
    document.getElementById('output_end_check').innerHTML = `${QuestEndCheck}`;
    document.getElementById('output_end').innerHTML = `${QuestEnd}`;
}

// parse nbt
function ParseNBT(type,nbt,n,i) {
    let ItemName = '';
    let ItemDescription = '';
    let ItemModel = '';
    let Quest = 0;
    let Enchantments = [];
    let QuestGeneric = '';
    let QuestLoad = '';
    let QuestStart = '';

    for (let Property in data[n][i][`${type}`].nbt) {
        if (Property == 'name') {
            if (typeof nbt.display == 'undefined') nbt.display = {};
            ItemName = data[n][i][`${type}`].nbt.name;
            nbt.display.Name = `{"text":"${data[n][i][`${type}`].nbt.name}","color":"yellow","italic":false}`;
        } else if (Property == 'description') {
            if (typeof nbt.display == 'undefined') nbt.display = {};
            ItemDescription = data[n][i][`${type}`].nbt.description;
            nbt.display.Lore = [];

            for (let c in data[n][i][`${type}`].nbt.description)
                nbt.display.Lore.push(`${JSON.stringify(data[n][i][`${type}`].nbt.description[c])}`);
        } else if (Property == 'criteria') {
            if (typeof nbt.display == 'undefined') nbt.display = {};
            if (typeof nbt.display.Lore == 'undefined') nbt.display.Lore = [];

            // header
            nbt.display.Lore.push(`${JSON.stringify({"text":""})}`);
            nbt.display.Lore.push(`${JSON.stringify({"text":"Criteria:","color":"gold","italic":false})}`);

            for (let c in data[n][i][`${type}`].nbt.criteria) {
                nbt.display.Lore.push(`${JSON.stringify({"text":`${data[n][i][`${type}`].nbt.criteria[c].description}`,"color":"white","italic":false})}`);
            }

            // footer
            nbt.display.Lore.push(`${JSON.stringify({"text":""})}`);
        } else if (Property == 'rewards') {
            if (typeof nbt.display == 'undefined') nbt.display = {};
            if (typeof nbt.display.Lore == 'undefined') nbt.display.Lore = [];

            // header
            nbt.display.Lore.push(`${JSON.stringify({"text":"Rewards:","color":"gold","italic":false})}`);

            for (let c in data[n][i][`${type}`].nbt.rewards) {
                let ItemID = data[n][i][`${type}`].nbt.rewards[c].id;
                nbt.display.Lore.push(`${JSON.stringify({"text":`${data[n][i][`${type}`].nbt.rewards[c].count}x ${ItemDB[`${ItemID.replaceAll('_',' ')}`].name}`,"color":"yellow","italic":false})}`);
            }
        } else if (Property == 'model') {
            ItemModel = data[n][i][`${type}`].nbt.model;
            nbt.ItemModelData = data[n][i][`${type}`].nbt.model;
        } else if (Property == 'quest_id') {
            Quest = data[n][i][`${type}`].nbt.quest_id;
            nbt.QuestID = data[n][i][`${type}`].nbt.quest_id;
            // generic quest list
            QuestGeneric = `## quest ${data[n][i][`${type}`].nbt.quest_id}
            <br>execute if score @s quest.holding matches 1.. if score @s quest.holding_id matches ${data[n][i][`${type}`].nbt.quest_id} unless score @s quest_${data[n][i][`${type}`].nbt.quest_id}.seen matches 1.. run scoreboard players set @s quest_${data[n][i][`${type}`].nbt.quest_id} 1
            <br>execute if score @s quest.holding matches 1.. if score @s quest.holding_id matches ${data[n][i][`${type}`].nbt.quest_id} unless score @s quest_${data[n][i][`${type}`].nbt.quest_id}.seen matches 1.. run function sp:system/quest/${data[n][i][`${type}`].nbt.quest_id}/start`;
            
            // start
            QuestStart = `## quest ${data[n][i][`${type}`].nbt.quest_id}
            <br># stats
            <br>clear @s ${data[n][i][`${type}`].id}{QuestID:${data[n][i][`${type}`].nbt.quest_id}} 1
            <br>scoreboard players set @s quest_${data[n][i][`${type}`].nbt.quest_id}.seen 1
            <br># sfx
            <br>playsound minecraft:entity.experience_orb.pickup player @s
            <br># display
            <br>tellraw @s ["",{"text":"[","color":"dark_gray"},{"text":"♦","color":"gold"},{"text":"] ","color":"dark_gray"},{"text":"Quest started! ","color":"gold"},{"text":"${data[n][i][`${type}`].nbt.name}","color":"yellow"},{"text":"\\n\\nCriteria:","color":"gold"}]`;
            
            // criteria
            for (let c in data[n][i][`${type}`].nbt.criteria) {
                QuestStart = `${QuestStart}<br>tellraw @s {"text":"${data[n][i][`${type}`].nbt.criteria[c].description}","color":"white"}`;
            }

            // end
            QuestStart = `${QuestStart}<br>tellraw @s ""<br>`;

            QuestLoad = `## quest ${data[n][i][`${type}`].nbt.quest_id}<br>scoreboard objectives add quest_${data[n][i][`${type}`].nbt.quest_id} dummy<br>scoreboard objectives add quest_${data[n][i][`${type}`].nbt.quest_id}.seen dummy`;
        } else if (Property == 'enchants') {
            if (typeof nbt.Enchantments == 'undefined') nbt.Enchantments = [];
            Enchantments = data[n][i][`${type}`].nbt.enchants;
            for (let e in data[n][i][`${type}`].nbt.enchants)
                nbt.Enchantments.push({id:`minecraft:${data[n][i][`${type}`].nbt.enchants[e].id}`,lvl:data[n][i][`${type}`].nbt.enchants[e].lvl});
        }
    }

    return [nbt,ItemName,ItemDescription,ItemModel,Quest,Enchantments,QuestGeneric,QuestLoad,QuestStart];
}

// copy
function copy() {
    // write to clipboard
    navigator.clipboard.writeText(document.getElementById('output').textContent);
}

// generate advancement files
function CreateAdvancement(criteria,QuestID,QuestAdvancement,QuestEndCheck,QuestEnd,item) {
    let advancement = {display:{},criteria:{},rewards:{}};

    advancement.display.title = {"text": `${item.nbt.name} (quest)`};
    advancement.display.description = {"text": `Quest ${QuestID}`};
    advancement.display.icon = {"item": `minecraft:${item.id}`};

    advancement.display.show_toast = false;
    advancement.display.announce_to_chat = false;
    advancement.display.hidden = true;

    advancement.criteria = criteria;
    advancement.rewards.function = `sp:system/quest/${QuestID}/end_check`;

    QuestAdvancement = `${QuestAdvancement}quest ${QuestID}<br>${JSON.stringify(advancement)}<br><br>`;
    QuestEndCheck = `${QuestEndCheck}## quest ${QuestID}<br>execute if score @s quest_${QuestID} matches 1.. run function sp:system/quest/${QuestID}/end<br>execute unless score @s quest_${QuestID} matches 1.. run advancement revoke @s only sp:quest_${QuestID}<br><br>`;
    
    // start
    QuestEnd = `${QuestEnd}## quest ${QuestID}
    <br>tellraw @s ["",{"text":"[","color":"dark_gray"},{"text":"♦","color":"gold"},{"text":"] ","color":"dark_gray"},{"text":"Quest finished! ","color":"gold"},{"text":"${item.nbt.name}","color":"yellow"},{"text":"\\n\\nRewards:","color":"gold"}]`;

    // rewards
    for (let i in item.nbt.rewards) {
        QuestEnd = `${QuestEnd}<br>give @s minecraft:${item.nbt.rewards[i].id} ${item.nbt.rewards[i].count}`;
        let ItemID = item.nbt.rewards[i].id;
        QuestEnd = `${QuestEnd}<br>tellraw @s {"text":"${item.nbt.rewards[i].count}x ${ItemDB[`${ItemID.replaceAll('_',' ')}`].name}","color":"yellow"}`;
    }

    // sfx
    QuestEnd = `${QuestEnd}<br>playsound minecraft:entity.player.levelup player @s`;

    // end
    QuestEnd = `${QuestEnd}<br>tellraw @s ""<br><br>`;

    return [QuestAdvancement,QuestEndCheck,QuestEnd];
}