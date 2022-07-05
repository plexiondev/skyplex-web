// level-calc generator


// the amount of lines to create
const max = 300;

// nth term
const nth = 100;
// base number
const base = 400;

generate_levels('levels');

/**
 * level-calc generator
 * @param {string} append element ID to append data to
 */
function generate_levels(append) {
    let text_level = '';
    for (let i = 1; i <= max; i++) {
        let value = (nth * i) + base;

        text_level = `${text_level}scoreboard players set generic.${i} lvl.goal ${value}<br>`;
    }

    document.getElementById('head').innerHTML = `${nth}n + ${base}`;
    document.getElementById(append).innerHTML = text_level;
}