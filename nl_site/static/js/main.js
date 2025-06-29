
// Leaflet Construction
var map = L.map('map', {
    attributionControl: false,
	minZoom: 2,
	maxZoom: 7,
}).setView([0, 90], 2);

// Mapbox
function mapbox_access_token() {
	return fetch("./static/config.json")
		.then(response => {
			var t = response.json();
			return t;
		})
}

// Mapbox Tilelayer
function mapbox_tile_layer() {
	var M_TILE_URL = "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token="
	var mapboxTiles = L.tileLayer(M_TILE_URL + appConfig.MAPBOX_TOKEN, {
		   attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		   tileSize: 512,
		   zoomOffset: -1
	}).addTo(map);	
}

// Load Tilelayer after access token retrieval
async function create_Tile_layer() {
	var t = await mapbox_access_token();
	mapbox_tile_layer(t);
}
create_Tile_layer();


// Custom Marker Icon
var custom_icon = L.Icon.extend({
	options: {
		iconSize: [40, 40],
		iconAnchor: [20, 40],
		popupAnchor: [0, -38]
	}
})
var newsicon = new custom_icon({
	iconUrl: "static/img/newsicon.svg",
});

// Info Button
var info = L.control.custom({
	position: 'topright',
	content: '<i class="material-icons">help</i>',
	classes: 'ctl info',
	style: {
		'border': '2px solid rgba(0,0,0,0.2)',
		'background-clip': 'padding-box',
		'font-size': '28px',
		"color": 'rgba(100,100,100,1)'
	},
	events: {
		click: () => openMenu('infomenu')
	}
}).addTo(map);

// Time Filter Control
var time_filter = L.control.custom({
	position: 'topright',
	content: '<i class="material-icons">query_builder</i>',
	classes: 'ctl info',
	style: {
		'border': '2px solid rgba(0,0,0,0.2)',
		'background-clip': 'padding-box',
		'font-size': '28px',
		"color": 'rgba(100,100,100,1)',
	},
	events: {
		click: () => openMenu('filtermenu')
	}
}).addTo(map);

// Article List Control
var article_list = L.control.custom({
	position: 'topright',
	content: '<i class="material-icons">view_list</i>',
	classes: 'ctl article_list',
	style: {
		'border': '2px solid rgba(0,0,0,0.2)',
		'background-clip': 'padding-box',
		'font-size': '28px',
		"color": 'rgba(100,100,100,1)',
	},
	events: {
		click: () => openMenu('articlemenu')
	}
}).addTo(map);

// Attribution
L.control.attribution({
    position: "bottomleft"
}).addTo(map);

// Repository Link Control
var repo = L.control.custom({
	position: 'bottomleft',
	content: '<a href="https://github.com/ryepenchi/newslocator" target="_blank"><img src="./static/img/github_small.svg" /></a>',
	classes: 'ctl repo-link',
	style: {
		'border': '2px solid rgba(0,0,0,0.2)',
		'background-clip': 'padding-box',
		'font-size': '28px',
		"color": 'rgba(100,100,100,1)'
	}
}).addTo(map);

// Control Logic

// Initial Date Setting and Today Button
function setToToday() {
	var today = new Date();
	dates["from"] = new Date(today.getFullYear(), today.getMonth(), today.getDate(),0,0);
	dates["to"] = new Date(today.getFullYear(), today.getMonth(), today.getDate(),23,59);
    // filter menu text
	if (dates.from.toLocaleDateString() == dates.to.toLocaleDateString()) {
		document.getElementById("dates").innerHTML = dates.from.toLocaleDateString() + "<br><br><br>";
	} else {
		document.getElementById("dates").innerHTML = "<div>" + dates.from.toLocaleDateString() + "<br> - <br>" + dates.to.toLocaleDateString() + "</div>";
	}

}

// Date Buttons
function modDates(f1,t1,f2,t2) {
    // global dates variable
	if (dates.from.toLocaleDateString() == dates.to.toLocaleDateString()) {
		dates.from.setDate(dates.from.getDate()+f1);
		dates.to.setDate(dates.to.getDate()+t1);
	} else {
		dates.from.setDate(dates.from.getDate()+f2);
		dates.to.setDate(dates.to.getDate()+t2);
	}
    // filter menu text
	if (dates.from.toLocaleDateString() == dates.to.toLocaleDateString()) {
		document.getElementById("dates").innerHTML = dates.from.toLocaleDateString() + "<br><br><br>";
	} else {
		document.getElementById("dates").innerHTML = "<div>" + dates.from.toLocaleDateString() + "<br> - <br>" + dates.to.toLocaleDateString() + "</div>";
	}
    // Markers and Cards
	LoadAndCreate();
}


function loadData(dates) {
    console.log("Loading articles");
    var fromrq = "from_date=" + dates.from.toLocaleString();
    var torq = "to_date=" + dates.to.toLocaleString();
    return fetch("/points?" + fromrq + "&" + torq)
        .then(response => {
            if (response.headers.get('content-type') != "application/json") {
                throw new TypeError();
            }
            var j = response.json();
            return j;
        })
}

function createMarkers(data) {
    var markers = data.points.map(arr => {
        const popUpText = document.createElement("div");
        const popUpTitle = document.createElement("h6");
        popUpTitle.innerHTML = arr.word;
        const articleList = document.createElement("ul");
        for (let id of arr.aids) {
            let article = document.createElement("li");
            let link = document.createElement("a");
			try {
				link.href = data.articles[id]["link"];
				link.target = "_blank";
				link.innerHTML = "> " + data.articles[id]["title"];
			} catch (TypeError) {
				console.log(id, " for ", arr.word, " not in data?");
			} finally {
				article.appendChild(link);
				articleList.appendChild(article)	
			}
        }
        popUpText.appendChild(popUpTitle);
        popUpText.appendChild(articleList);
        return L.marker([arr.lat, arr.lon], {icon: newsicon}).bindPopup(popUpText);
    })
    map.removeLayer(markerLayer);
    markerLayer = L.markerClusterGroup({
		showCoverageOnHover: false,

		iconCreateFunction: function(cluster) {
			return L.divIcon({
				html: "<img src='static/img/multiicon.svg' ><p>" + cluster.getChildCount() + "</p>",
			});
		}
	});
	for (let marker of markers) {
		markerLayer.addLayer(marker);
	}
    map.addLayer(markerLayer);
}

function createCards(data) {
    var myNode = document.getElementById("card-collection");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
    Object.keys(data.articles).map(function (arr) {
		arr = data.articles[arr];
        const span = document.createElement("span");
        span.className = "card-title";
        span.innerText = arr.title;
        const para = document.createElement("span");
        para.className = "card-places truncate";
        para.innerHTML = arr.words;
        const cardcontent = document.createElement("div");
        cardcontent.className = "card-content card-body white-text";
        cardcontent.appendChild(span);
        cardcontent.appendChild(para);
        const diva = document.createElement("div");
        const cardheader = document.createElement("div");
        cardheader.className = "card-content card-header orange-text text-lighten-1";
        const carddate = document.createElement("span");
        carddate.innerText = arr.pubdate;
        cardheader.appendChild(carddate);
        const l = document.createElement("a");
        l.href = arr.link;
        l.innerHTML = '<span><i class="material-icons">open_in_new</i></span>';
        l.target = "_blank";
        cardheader.appendChild(l);
        const card = document.createElement("div");
        card.id = arr.id;
        card.className = "card blue-grey lighten-1 collection-item";
        card.appendChild(cardheader);
        card.appendChild(cardcontent);
        card.appendChild(diva);
        document.getElementById("card-collection").appendChild(card);
    });
}

async function LoadAndCreate() {
    var data = await loadData(dates);
    createMarkers(data);
    createCards(data);
}

// Setup
var data;
var markerLayer = L.markerClusterGroup();
var dates = {};
setToToday();
window.onload = () => LoadAndCreate(dates);

document.getElementById("today").onclick = () => {
	setToToday();
    LoadAndCreate(dates);
};
document.getElementById("m1d").onclick = () => modDates(-1, -1, -1, -8);
document.getElementById("p1d").onclick = () => modDates(1, 1, 8, 1);
document.getElementById("m1w").onclick = () => modDates(-7, 0, -7, -7);
document.getElementById("p1w").onclick = () => modDates(0, 7, 7, 7);

// Menu Functions
function openMenu (menu) {
	document.getElementById(menu).classList.remove("collapsed");
	document.getElementById(menu).classList.add("expanded");
}

function closeMenu (menu) {
	document.getElementById(menu).classList.add("collapsed");
	document.getElementById(menu).classList.remove("expanded");
}