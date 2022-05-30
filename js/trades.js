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
                }
            }

            count += 1;
        }
    }

    // end
    output = `${output}]}}}`;
    document.getElementById('cont').innerHTML = `${output}`;
}