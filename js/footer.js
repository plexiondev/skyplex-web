
// load footer


document.getElementById('footer').innerHTML =
(`
<div class="footer-inner">
<span class="main" id="footer.main">
    <p>plexion 2022.</p>
</span>
<span class="links" id="footer.links">
    <a href="/">Home</a>
    <a href="https://github.com/plexiondev/skyplex">View Source</a>
</span>
</div>
`);


// local debug?
if (location.hostname == 'localhost' || location.hostname == '127.0.0.1') {
    console.log('--> Running local debug');
    document.body.classList.add('local_debug');

    let local_debug = document.createElement('p');
    local_debug.classList.add('debug');
    local_debug.innerHTML = 'local debug';

    document.getElementById('footer.main').appendChild(local_debug);
}