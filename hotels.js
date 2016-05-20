//IDs
// 108086881826934773478
// 103846222472267112072

// fa5a4cb3fe80ddef979dcfb33da57d07570ade5c

hotels = null;
markers = [];
collections = [];
users = [];

$(document).ready(function(){
	$("#mainTabs a").click(function(e){
		e.preventDefault();
		$(this).tab("show");
	});
	$("#getHotels").click(function(){
		$("#hotelsList").html("");
		$(".activateInfo").hide();
		getHotels();
		$("#collections, #addUser").show();
		$(this).children().html("Recargar Hoteles");
		setActiveCss();
	});
	setupMap();
	$("#saveInfo").click(showSaveInfoDialog);
	$("#loadInfo").click(showLoadInfoDialog);
	$("#createCollection").submit(createCollection);
	$("#addUser").submit(addUser);
	$("#saveDialog, #loadDialog, #getHotelsWarning").dialog({
		autoOpen: false,
		show: {
        	effect: "blind",
        	duration: 1000
      	}
	});
	$("#saveDataForm").submit(saveData);
	$("#loadDataForm").submit(loadData);
	$("#getHotels a, #saveInfo a, #loadInfo a").click(function(e){
		e.preventDefault();
	});
	$("#mainTabs a").click(function(){
		var link = $(this).attr("href")
		if (Modernizr.history){
			history.pushState(null, null, link);
		}
	});
	setHistoryAPI();
	setFB();
});

function setFB(){
	$.ajaxSetup({ cache: true });
  	$.getScript('//connect.facebook.net/en_US/sdk.js', function(){
    	FB.init({
      		appId : '1144028915653488',
      		xfbml : true,
      		version : 'v2.6',
    	});
    	FB.getLoginStatus(function(response) {
		    statusChangeCallback(response);
		});
		$("#fbLog").click(faceBookLog)
	});
}

function faceBookLog(){
	var status = $("#fbLog").children().html();
	if (status == "Login With FB"){
		FB.login(function(){
			checkLoginState();
		}, {scope: 'public_profile,email'});
	}else if( status == "Logout"){
		FB.logout(function(response) {
   			checkLoginState();
		});
	}
}

function checkLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

function statusChangeCallback(response) {
    if (response.status === 'connected') {
      	$("#fbLog").children().html("Logout");
      	showLogInfo();
    } else if (response.status === 'not_authorized') {
        $("#fbLog").children().html("No Authorized");
    } else {
      	$("#fbLog").children().html("Login With FB");
      	$("#logginInfo").html("");
      	$("#hideLogInf").hide();
    }
  }

function showLogInfo(){
	FB.api('/me', function(response) {
      	var html = 'Bienvenido de nuevo, ' + response.name + '!';
      	$("#logginInfo").html(html);
		$("#hideLogInf").show();
    });
}

function setHistoryAPI(){
	$(window).on("popstate", function(){
		var splited = location.href.split('/');
			
		var id = splited[splited.length-1]
		if (id == ""){
			id = "#principal";
		}
		$("#mainTabs a[href='" + id + "']").tab("show");
		$(id).tab('show')
	});
}

function setActiveCss(){
	$("#hotelsList, #collectionSelected, #draggableHotelsList")
	.css("background-color", "#547D95");
}

function getPreviousData(){
	if (Modernizr.localstorage){
		var hotel = localStorage["hotelSelected"];
	
		if (hotel != undefined){
			selectHotel(hotel);
		}
	}
}

function dataToJSON(){
	var data = {
		collections: collections,
		users: users
	}
	var textData = JSON.stringify(data);
	return textData;
}

function saveData(e){
	e.preventDefault()
	var token = $("#saveToken").val();
	var user = $("#saveUser").val();
	var repoName = $("#saveRepoName").val();
	var fileName = $("#saveFileName").val();

	var github = new Github({
		token: token,
		auth: "oauth"
	});
	var repo = github.getRepo(user, repoName);
	var data = dataToJSON();
	repo.write('master', fileName, data, "saving data",
		function(err){
			if (err){
				alert(err);
			}else{
				console.log("GUARDADO!");
			}
			$("#saveDialog").dialog("close");
		});
}

function loadData(e){
	e.preventDefault()
	var token = $("#loadToken").val();
	var user = $("#loadUser").val();
	var repoName = $("#loadRepoName").val();
	var fileName = $("#loadFileName").val();

	var github = new Github({
		token: token,
		auth: "oauth"
	});
	var repo = github.getRepo(user, repoName);
	repo.read('master', fileName, function(err, textData){
		if (err){
			alert(err);
		}else{
			var data = JSON.parse(textData);
			collections = data.collections;
			users = data.users;
			resetCollectionsList();
			$("#users").html("");
		}
		$("#loadDialog").dialog("close");
	});
}

function resetCollectionsList(){
	$("#collectionsList").html("");
	for (var i = 0; i < collections.length; i++){
		addToColList(collections[i].name, i);
	}
	$("#currentCollection, #collectionSelected").html("");
}

function checkHotelsLoad(){
	if ($("#getHotels").children().html() == "Cargar Hoteles"){
		$("#getHotelsWarning").dialog("open");
		return false;
	}
	return true
}

function showSaveInfoDialog(e){
	e.preventDefault();
	if (!checkHotelsLoad()){
		return
	}
	var loadDialog = $("#loadDialog");
	if (loadDialog.dialog("isOpen")){
		loadDialog.dialog("close");
	}

	$("#saveDialog").dialog("open");
	$("#saveInfo").removeClass("active");
}

function showLoadInfoDialog(e){
	e.preventDefault();
	if (!checkHotelsLoad()){
		return
	}
	var saveDialog = $("#saveDialog");
	if (saveDialog.dialog("isOpen")){
		saveDialog.dialog("close");
	}

	$("#loadDialog").dialog("open");
	$("#loadInfo").removeClass("active");
}

function showMoreInfo(){
	var children = $(this).parent().children();
	for (var i = 0; i < children.length; i++){
		if (children[i].className.split(" ")[0] == "moreInfo"){
			$(children[i]).show("blind", {}, 1000);
			break;
		}
	}
}

function collapseInfo(){
	$(this).parent().hide("blind", {}, 1000);
}

function showUsers(usersList){
	var html = "";

	if (usersList){
		html = "<h2 class='usersTitle'>Personas de Google+ asignadas a este hotel: " + usersList.length + ".</h2>";
	}else{
		html = "<p>Todavía no se ha asignado a ningún usuario a este hotel.</p>";
		$("#users").html(html);
		return;
	}

	var user = null;
	for (var i = 0; i < usersList.length; i++){
		user = usersList[i];
		html += "<div class='userElement col-xs-12'><div class='userHeader col-xs-12'>";
		html += "<img src='" + user.img + "' class='img-circle col-xs-2'>";
		html += "<h4 class='col-xs-10'>" + user.name + "</h4></div><div class='moreInfo col-xs-12' hidden>";
		if (user.aboutMe){
			html += "<p>" + user.aboutMe + "</p><p>Visítame en: "
		}else{
			html += "<p>No hay más informacion sobre este usuario.</p> <p>Pero puedes visitarme en:"
		}
		html +="<p><a href='" + user.url + "'>" + user.url + "</a></p></p>";
		html += "<input type='button' class='collapseInfo btn-info' value='Ocultar'></div></div>";
	}

	$("#users").html(html);
	$("#users .userHeader").click(showMoreInfo);
	$("#users .collapseInfo").click(collapseInfo);
}

function getUserData(userId, userList){
	gapi.client.load("plus", "v1", function(){
		var request = gapi.client.plus.people.get({
			'userId': userId
		});
		request.execute(function(resp){
			myresp = resp
			var user = {};
			user.img = resp.image.url;
			user.name = resp.displayName;
			user.id = userId;
			user.aboutMe = resp.aboutMe;
			user.url = resp.url

			userList.push(user);
			showUsers(userList);
		});
	});
}

function addUser(e){
	e.preventDefault();
	var indexHotel = $("#hotelDescription").attr("no");
	if(indexHotel){
		var idInput = $("#userId");

		if (!users[indexHotel]){
			users[indexHotel] = [];	
		}
		var userList = users[indexHotel];
		
		var userId = idInput.val();
		for (var i = 0; i < userList.length; i++){
			if (userList[i].id == userId){
				idInput.val("");
				return;
			}
		}
		getUserData(userId, userList);
		idInput.val("");
		 
	}else{
		alert("Debes seleccionar un hotel para poder añadirle usuarios.");
	}
}

function removeFromCollection(){
	var element = $(this).parent();
	var coll = $("#currentCollection").attr("no"); 
	var index = collections[coll].hotels.indexOf($(this).attr("no"));
	console.log(index)
	$(element).hide("drop", {}, 1000, function(){
		$(this).remove();
		if (collections[coll].hotels.length != 1){
			collections[coll].hotels.splice(index, index);
		}else{
			collections[coll].hotels = [];
		}
		showCollection(collections[coll], index);
	});	
}

function showCollection(collection, index, effect=false){
	if (!collection){
		$("#currentCollection, #collectionSelected").html("");
		return;
	}

	var html = "<h2 class='colTitle'>" + collection.name + "</h2>";

	if (collection.hotels.length == 0){
		html += "<p>Aún no has añadido ningún hotel a esta colección</p>";
		html += "<p>Arrastra los hoteles que te interesen a la colección para añadirlos!</p>";
	}else{
		html += "<h4>Esta colección tiene " + collection.hotels.length + " hoteles.</h4>"; 
	}

	var hotelIndex = null; 
	html += "<lu>";
	for (var i = 0; i < collection.hotels.length; i++){
		if (!collection.hotels[i]){
			continue;
		}
		hotelIndex = collection.hotels[i];
		html += "<li class='hotelElement col-xs-12' no='" + hotelIndex + "''><span class='col-xs-11'>"
		html += hotels[collection.hotels[i]].basicData.title + "</span><span no='"
		html += hotelIndex + "' class='col-xs-1 glyphicon glyphicon-trash' aria-hidden='true'></span></li>";
	}

	html += "</ul>"
	
	if(effect){
		$("#currentCollection, #collectionSelected").hide("puff", {}, 1000, function(){
			$("#currentCollection, #collectionSelected").html(html)
			.attr("no", collections.indexOf(collection)).show("puff", {}, 1000);
		});
	}else{
		$("#currentCollection, #collectionSelected").html(html)
		.attr("no", collections.indexOf(collection)).show();
	}
	
	/*$("#currentCollection").droppable({
		drop: addHotelToCollection,
		hoverClass: "dropHover"
	});*/
	$("#currentCollection .glyphicon-trash").click(removeFromCollection);
	$("#collectionSelected .glyphicon-trash").remove();
	$("#currentCollection li, #collectionSelected li").click(selectHotelJQuery)
}

function addHotelToCollection(event, ui){
	var index = $(this).attr("no");
	var hotelIndex = ui.draggable.attr("no");
	if (collections[index].hotels.indexOf(hotelIndex) < 0){
		collections[index].hotels.push(hotelIndex);
	}
	showCollection(collections[index], hotelIndex);
}

function selectCollection(){
	var collection = collections[$(this).attr("no")];
	showCollection(collection);
}

function removeCollection(){
	var collection = $(this).attr("no");
	//collections.splice(collection, collection);
	collections[collection] = null;

	$("#collectionsList li[no=" + collection + "]").hide("drop", {}, 1000, function(){
		$(this).remove();
		$("#currentCollection, #collectionSelected").html("");
	});
}

function addToColList(name, number){
	var newColl = "<li class='collElement col-xs-12' no='" + number + "' hidden>";
	newColl += "<span class='col-xs-11'>" + name + '</span><span no="' + number;
	newColl += '" class=" col-xs-1 glyphicon glyphicon-trash" aria-hidden="true"></span></li>';
	var list = $("#collectionsList");

	list.append(newColl);
	$("li[no=" + number + "]").droppable({
		drop: addHotelToCollection,
		hoverClass: "dropHover"
	}).click(selectCollection).show("drop", {}, 1000);
	$("#collectionsList span[no=" + number + "]").click(removeCollection);
}

function createCollection(e){
	e.preventDefault();
	var name = $("#collectionName").val()
	var list = $("#collectionsList");
	var number = list.children().length
	
	addToColList(name, number);
	
	$("#collectionName").val("")

	var collection = {
		"name": name,
		"hotels": []
	}
	collections[number] = collection;
	showCollection(collection);
}

function addCarousel(imgs){
	var html = '<div id="hotelImgsCarousel" class="carousel slide col-xs-12 col-md-5" data-ride="carousel">';
	var indicators = '<ol class="carousel-indicators">';
	var slides = '<div class="carousel-inner" role="listbox">';

	for (var i = 0; i < imgs.length; i++){
		indicators += '<li data-target="#hotelImgsCarousel" data-slide-to="' + i + '"';
	
		if (i == 0){
			indicators += ' class="active"';
			slides += '<div class="item active">';
		}else{
			slides += '<div class="item">';
		}
		slides += '<img src="' + imgs[i].url + '"></div>';
		indicators += '></li>';
	}

	indicators += "</ol>";
	slides += "</div>";
	var controls = '<a class="left carousel-control" href="#hotelImgsCarousel" role="button" data-slide="prev">';
	controls += '<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>';
	controls += '<span class="sr-only">Anterior</span></a>';
	controls += '<a class="right carousel-control" href="#hotelImgsCarousel" role="button" data-slide="next">';
	controls += '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>';
	controls += '<span class="sr-only">Next</span></a>';

	html += indicators + slides + controls + '</div>';

	return html;
}

function showHotelInfo(hotel){
	var name = hotel.basicData.title;
	var cat = hotel.extradata.categorias.categoria.item[1]["#text"];
	if (cat == "Hoteles"){
		cat = cat.substring(0,5);
	}
	var subCat = hotel.extradata.categorias.categoria.subcategorias.subcategoria.item[1]["#text"]
	var description = hotel.basicData.body;
	var web = hotel.basicData.web;
	var phone = hotel.basicData.phone;
	var email = hotel.basicData.email;
	var imgs = hotel.multimedia.media;
	var addr = hotel.geoData.address;
	var zipcode = hotel.geoData.zipcode;
	var area = hotel.geoData.subAdministrativeArea;
	var country = hotel.geoData.country;

	html = "<h2 class='hotelTitle'>" + name + "</h2>"
	html += "<h4 class='hotelCat'>" + cat + " " + subCat + "</h4>";
	if(imgs.length > 0){
		html += addCarousel(imgs);
	}
	html += "<div class='hotelDescription'><p>" + description + "</p></div>";

	html += "<br/><p>El alojamiento se encentra situado en " + area + ", en la calle " + addr + ".</p>"
	html += "<p>Código postal: " + zipcode + "</p>";
	html += "<p>Para más información, por favor visite nuestra página: <a href='" + web + "'>" + web + "</a>";
	html += "<p>Si tiene alguna duda, puede contactar con nosotros:<lu>";
	html += "<li>Teléfono: " + phone + "</li>";

	if (email){
		html += "<li>Email: " + email + "</li>";
	}
	html += "</lu></p>";

	var number = hotels.indexOf(hotel); 
	$("#hotelSelected").html(html)
	.attr("no", number);
	html = html.split("col-md-5");
	var htmlDesc = html[0].concat(html[1]);
	$("#hotelDescription").html(htmlDesc)
	.attr("no", number);
}

function selectHotel(number){
	var hotel = hotels[number];
	var lon = hotel.geoData.longitude;
	var lat = hotel.geoData.latitude;
	var url = hotel.basicData.web;
  	var name = hotel.basicData.name;

	showHotelInfo(hotel);
	showUsers(users[number]); 
	
	map.setView([lat, lon], 14);

	if (!markers[number]){
		var opts = {
			"title": name,
			"riseOnHover": true
		}
		var marker = L.marker([lat, lon], opts);
		markers[number] = marker;
		marker.on("click", selectHotelMarker);
	}else{
		var marker = markers[number];
	}

	if (marker.getPopup()){
		marker.unbindPopup();
	}
	var html = '<a href="' + url + '">' + name + '</a><br/>'
	html += "<input type='button' value='Eliminar Marcador' no='" + number + "''>";
	marker.addTo(map).bindPopup(html).openPopup();

	if (Modernizr.localstorage){
		localStorage["hotelSelected"] = number;	
	}
}

function selectHotelMarker(e){
	event = e;
	var marker = e.target;
	var number = markers.indexOf(marker);
	selectHotel(number);
}

function selectHotelJQuery(){
	var number = $(this).attr('no');
	selectHotel(number);
}

function prepareHotelsView(){
	var html = "<h2 class='hotelsFound'>Hemos encontrado "+ hotels.length + ":</h2><ul>";

	for (var i = 0; i < hotels.length; i++) {
		var title = hotels[i].basicData.title;
		html += '<li class="hotelElement" no=' + i + '>' + title + '</li>';
	}

	html += '</ul>';
	$('#hotelsList, #draggableHotelsList').html(html);
	$('#hotelsList li').click(selectHotelJQuery);
	$('#draggableHotelsList li').draggable({
		revert: true,
		helper: "clone",
		appendTo: "body"
	});
	getPreviousData();
}

function getHotels(){
	if (gapi.client){
		var apiKey = "AIzaSyAKg0vtCZDoEE7zahL0oGEZD7JDp2XK1xg";
		gapi.client.setApiKey(apiKey);
	}
	
	var hotelsURL = "hotels.json";

	$.getJSON(hotelsURL).done(function(data) {
		hotels = data.serviceList.service
		prepareHotelsView();
	}).fail(function( jqxhr, textStatus, error ) {
	   	var err = textStatus + ", " + error;
	   	alert( "Request Failed: " + err );
	});
};

function onLocationFound(e){
	L.marker(e.latlng).addTo(map)
	.bindPopup("You're here").openPopup();
}

function onPopupOpen(e) {
	var marker = e.popup._source;
	var index = markers.indexOf(marker)
	
	if(index >= 0){
		$("input[no=" + index + "]").click(function(){
			map.removeLayer(marker);
			markers[index] = null;
		});
	}
}

function setupMap(){
	map = L.map("hotelsMap");
	L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
	attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">'
    }).addTo(map);

	map.on("locationfound", onLocationFound);
	map.on("locationerror", function(e){
		alert(e.nessage);
	});
	map.locate({setView: true, maxZoom: 18});
	map.on('popupopen', onPopupOpen);
}