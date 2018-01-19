//Use Ajax to fetch data in text, XML and JSON formats and displays the weather 
//of the particular city on the page
(function(){
	"use strict";

	var node;
	var temperature;

	//calls the desired function when an event takes place 
	window.onload = function(){
		requestCities();
		document.getElementById("search").onclick=requestCityData;
		document.getElementById("precip").onclick=precipitation;
		document.getElementById("temp").onclick=temp;
	};

	//throws an ajax request for the cities name
	function requestCities(){
		document.getElementById("citiesinput").disabled = true;
		
		var ajax = new XMLHttpRequest();
		ajax.onload = displayCities;
		ajax.open("GET", "https://webster.cs.washington.edu/cse154/weather.php?mode=cities",
			true);
		ajax.send();
	}

	//create a datalist with the name of the cities
	function displayCities(){
		if(this.status == 200){
			hide("loadingnames");
			
			var citiesName = this.responseText;
			citiesName = citiesName.split("\n");
			for(var i = 0; i < citiesName.length; i++){
				var option = document.createElement("option");
				option.innerHTML = citiesName[i];
				document.getElementById("cities").appendChild(option);
			}
			document.getElementById("citiesinput").disabled = false;
		}
		else{
			errorMessage(this);
		}
	}

	//throws an ajax request for city data
	function requestCityData(){
		var resultArea=document.getElementById("resultsarea");
		resultArea.style.display = "";
		clearData();
		requestForecast();
		display("loadinglocation");
		display("loadinggraph");
			

		var city = getCity();
		var ajax = new XMLHttpRequest();
		ajax.onload = displayCityData;
		ajax.open("GET", "https://webster.cs.washington.edu/cse154/weather.php?mode=oneday&city="+
			city, true);
		ajax.send();
	}

	//displays the city data on the web page
	function displayCityData(){
		if(this.status == 200){
			hide("loadinglocation");
			hide("loadinggraph");
		    node = this.responseXML;
		    temp();
			
			var city = document.createElement("p");
			city.innerHTML = node.querySelector("name").textContent;
			city.className = "title";
			document.getElementById("location").appendChild(city);
			
			var date = document.createElement("p");
			var dateDetails = new Date();
			var hours = Math.floor((dateDetails.getHours())/3);
			date.innerHTML = dateDetails;
			document.getElementById("location").appendChild(date);
			
			var weatherDescription = document.createElement("p");
			var symbolAll = node.querySelectorAll("symbol");
			weatherDescription.innerHTML = symbolAll[hours].getAttribute("description");
			document.getElementById("location").appendChild(weatherDescription);
		}
		else if(this.status == 410){
			nodata();
		}
		else{
			document.getElementById("resultsarea").style.display = "none";
			errorMessage(this);
		}
	}

	//displays the temperature
	function temp(){
		hide("graph");
		display("slider");
		
		temperature = node.querySelectorAll("temperature");
		var slider = document.getElementById("slider");
		slider.value = 0;
		document.getElementById("currentTemp").innerHTML = Math.round(temperature[0].textContent)+
			"&#8457;";
		slider.onchange = tempChange;
	}

	//changes temperature on the page with the change in the slider
	function tempChange(){
		document.getElementById("currentTemp").innerHTML=
			Math.round(temperature[Math.floor(this.value/3)].textContent)+"&#8457;";
	}

	//creates a table to show the graph of precipitation on the page
	function precipitation(){
		display("graph");
		hide("slider");
		
		var graph=document.getElementById("graph");
		graph.innerHTML = "";
		var chance = node.querySelectorAll("clouds");
		var tr = document.createElement("tr");
		for(var i = 0; i < chance.length; i++){
			var td = document.createElement("td");
			var div = document.createElement("div");
			var percentage = chance[i].getAttribute("chance");
			div.innerHTML = percentage+"%";
			div.style.height = percentage+"px";
			td.appendChild(div);
			tr.appendChild(td);
		}
		graph.appendChild(tr);
	}

	//throws an ajax request for the temperature of the week
	function requestForecast(){
		display("loadingforecast");
		
		var city=getCity();
		var ajax = new XMLHttpRequest();
		ajax.onload = displayForecast;
		ajax.open("GET", "https://webster.cs.washington.edu/cse154/weather.php?mode=week&city="+
			city, true);
		ajax.send();
	}

	//creates a table and displays the forecast on the page 
	function displayForecast(){
		if(this.status == 200){
			hide("loadingforecast");

			var data = JSON.parse(this.responseText);
			var length = data.weather.length;
			var tr1 = document.createElement("tr");
			for(var i = 0; i < length; i++){
				var td = document.createElement("td");
				var img = document.createElement("img");
				var icon = data.weather[i].icon;
				img.src = "https://openweathermap.org/img/w/"+icon+".png";
				img.alt = "icon";
				td.appendChild(img);
				tr1.appendChild(td);
			}
			document.getElementById("forecast").appendChild(tr1);
			
			var tr2 = document.createElement("tr");
			for(var i = 0; i < length; i++){
				var td = document.createElement("td");
				var temperature = Math.round(data.weather[i].temperature);
				td.innerHTML = temperature+"&#176;";
				tr2.appendChild(td);
			}
			document.getElementById("forecast").appendChild(tr2);
		}
		else if(this.status == 410){
			nodata();
		}
		else{
			document.getElementById("resultsarea").style.display = "none";
			errorMessage(this);
		}
	}

	//returns the name of the chosen city
	function getCity(){
		var citiesInput = document.getElementById("citiesinput");
		var city = citiesInput.value;
		return city;
	}

	//clears the previous data
	function clearData(){
		document.getElementById("location").innerHTML = "";
		document.getElementById("currentTemp").innerHTML = "";
		document.getElementById("forecast").innerHTML = "";
		document.getElementById("errors").innerHTML = "";
		document.getElementById("nodata").style.display = "none";
	}

	//displays the passed id on the page
	function display(id){
		document.getElementById(id).style.display = "";
	}

	//hides the passed id on the page
	function hide(id){
		document.getElementById(id).style.display = "none";
	}

	//displays a message when nodata is available for a particular city
	function nodata(){
		removeAllLoading();
		document.getElementById("nodata").style.display = "";
	}

	//displays an error message if there is an error other than 410
	function errorMessage(current){
		removeAllLoading();
		var error = document.getElementById("errors");
		error.style.display = "";
		error.innerHTML = "Error making Ajax request:  Server status:"+current.status+" "+
			current.statusText+" Server response text: "+current.responseText;
	}

	//removes all loading from the page
	function removeAllLoading(){
		var loadingAll = document.querySelectorAll(".loading");
		for(var i = 0; i < loadingAll.length; i++){
			loadingAll[i].style.display = "none";
		}
	}
})();



