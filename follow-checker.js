(async function(){

const username = window.location.pathname.split("/")[1];

if(!username){
alert("Open a Letterboxd profile.");
return;
}

const panel = document.createElement("div");
panel.style = `
position:fixed;
top:20px;
right:20px;
width:340px;
max-height:80vh;
overflow:auto;
background:#1c2228;
color:white;
padding:20px;
border-radius:12px;
z-index:9999;
box-shadow:0 10px 30px rgba(0,0,0,0.6);
font-family:Arial;
border:1px solid #2a2f36;
`;

panel.innerHTML = `
<div style="position:relative;text-align:center;">
  <h2 style="margin:0;">Follow Checker</h2>

  <button id="closeBtn" style="
    position:absolute;
    top:0;
    right:0;
    background:none;
    border:none;
    color:white;
    font-size:18px;
    cursor:pointer;
  ">✕</button>
</div>

<p id="status" style="text-align:center;font-size:14px;color:#9ab;margin-top:10px;">
Loading...
</p>

<p style="margin:8px 0 4px;font-size:12px;color:#9ab;">Sort</p>

<div style="display:flex;gap:6px;">
<button id="sortAZ" disabled style="flex:1;padding:6px;border:none;border-radius:6px;background:#2a2f36;color:white;cursor:pointer;">A-Z</button>
<button id="sortZA" disabled style="flex:1;padding:6px;border:none;border-radius:6px;background:#2a2f36;color:white;cursor:pointer;">Z-A</button>
<button id="sortDefault" disabled style="flex:1;padding:6px;border:none;border-radius:6px;background:#2a2f36;color:white;cursor:pointer;">Original</button>
</div>

<ul id="results" style="list-style:none;padding:0;margin-top:10px;"></ul>
`;
document.body.appendChild(panel);
document.getElementById("closeBtn").onclick = () => panel.remove();
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function getUsers(type){

let page = 1;
let users = [];
let hasMore = true;

while(hasMore){

statusEl.textContent = `Checking ${type} (page ${page})...`;

const res = await fetch(`/${username}/${type}/page/${page}/`);
const html = await res.text();

const doc = new DOMParser().parseFromString(html, "text/html");

const found = [...doc.querySelectorAll("a.name")]
.map(a => a.getAttribute("href"))
.filter(Boolean)
.map(href => href.replaceAll("/",""));

users = users.concat(found);

hasMore = found.length > 0;
page++;
await sleep(250);
}
return users;
}

statusEl.textContent = "Checking followers...";
const followers = await getUsers("followers");

statusEl.textContent = "Checking following...";
const following = await getUsers("following");

let baseList = following.filter(u => u && !followers.includes(u));
let currentList = [...baseList];

function render(list){

resultsEl.innerHTML = "";

list.forEach(user => {

if(!user) return;

const li = document.createElement("li");

li.style = `
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:8px;
padding:6px;
border-radius:6px;
background:#14181c;
`;

const name = document.createElement("span");
name.textContent = user;

const btn = document.createElement("a");

btn.href = `https://letterboxd.com/${user}`;
btn.target = "_blank";
btn.textContent = "View";
btn.style = `
background:#00e054;
color:black;
padding:4px 8px;
border-radius:6px;
font-size:12px;
text-decoration:none;
`;

li.appendChild(name);
li.appendChild(btn);

resultsEl.appendChild(li);
});
statusEl.textContent = `People who don't follow back: ${list.length}`;
}

document.getElementById("sortAZ").onclick = () => {
currentList = [...currentList].sort();
render(currentList);
};
document.getElementById("sortZA").onclick = () => {
currentList = [...currentList].sort().reverse();
render(currentList);
};
document.getElementById("sortDefault").onclick = () => {
currentList = [...baseList];
render(currentList);
};

render(baseList);
document.getElementById("sortAZ").disabled = false;
document.getElementById("sortZA").disabled = false;
document.getElementById("sortDefault").disabled = false;
statusEl.textContent = `People who don't follow back: ${baseList.length}`;
})();
