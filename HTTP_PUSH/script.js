var kAPI = "",
    selectVar= "",
    request = new XMLHttpRequest(),
    inputVar = document.createElement("input"),
    valu_d,
    opt,
    url_push =  'https://liveobjects.orange-business.com/api/v0/event2action/actionPolicies';
    url_mail =  'https://liveobjects.orange-business.com/api/v0/contact';
function submit_api() {
   kAPI = document.forms["formAPI"]["inputApi"].value;
   var roles =[];
   const request_api_key = new  XMLHttpRequest();
   request_api_key.open('GET', 'https://liveobjects.orange-business.com/api/v0/apiKeys/current_key', false);
   request_api_key.setRequestHeader('Accept', 'application/json');
   request_api_key.setRequestHeader('Content-type', 'application/json');
   request_api_key.setRequestHeader('X-API-KEY', kAPI);
   request_api_key.send(null);
   if (request_api_key.status === 200) {
       var result = JSON.parse(request_api_key.response);
       roles = result.roles;
        getDevices();
        gestion();
   }
}

var valu_d = [],
    url_device =[],
    contentHead = {},
    val;
function getDevices(){ /* FUNCTION to get the devices from the API_KEY */
 var url_data = 'https://liveobjects.orange-business.com/api/v0/data/streams/',
     request_data = new XMLHttpRequest();
 request.open('GET', 'https://liveobjects.orange-business.com/api/v0/assets?size=20&page=0', false);
 request.setRequestHeader('Accept', 'application/json');
 request.setRequestHeader('Content-type', 'application/json');
 request.setRequestHeader('X-API-KEY', kAPI);
 request.send(null);
   if (request.status >= 200 && request.status < 400) {
      valu = JSON.parse(request.response);
     var options=""
        for (var i = 0; i < valu.data.length; i++) {
            var mydev = valu.data[i].name;
            var namespace = valu.data[i].namespace;
            var idd = valu.data[i].id;
            url_device.push(url_data+namespace+idd);
        }
        for (var j = 0; j < url_device.length; j++) {
          request_data.open('GET', url_device[j], false);
          request_data.setRequestHeader('Accept', 'application/json')
          request_data.setRequestHeader('Content-type', 'application/json')
          request_data.setRequestHeader('X-API-KEY', kAPI)
          request_data.onload = function () { //function pour les data des devices
           valu_d = JSON.parse(this.response);
        }
          request_data.send();
        }
    }else{
      console.log('error getting device');
    }
}

/* FUNCTION to create the acction policies --> HTTP PUSH */

function push_http(name,url,head1,headValue,jsonp){
    var last_char = url.slice(-1);
    if (last_char === '/') { // verify if the last character of the url is an '/'
      url = url;
    }else {
      url = url+'/';
    }
    var sizeHeader = Object.keys(contentHead).length;
    var req_http = new XMLHttpRequest();
    for (var i = 0; i < sizeHeader; i++){
    var req =   '{"name": "'+name+'","enabled": true,"triggers": { "messageSelector": {"origin": "data_new"} }, "actions": { "httpPush": [{"webhookUrl": "'+url+'","retryOnFailure": true,"headers": {"'+contentHead[i].headT+'": ["'+contentHead[i].headV+'"]},"jsonPath": "'+jsonp+'"}]}}';
    req_http.open('POST', url_push, false);
    var req_test = 'req_http'
    req_http.setRequestHeader('X-API-KEY', kAPI);
    req_http.setRequestHeader('Accept', 'application/json');
    req_http.setRequestHeader('Content-type', 'application/json');
    req_http.send(req);
    req_http.onreadystatechange = function(){
     if (req_http.status >= 200 && req_http.readyState == 4) {
       var json_reponse = JSON.parse(req_http.response);
       console.log("HTTP Push cree avec succes");
       console.log(json_reponse);
      }
   }
 }//fin for
}

/* FUNCTIONS to send notifications in email */




/* FUNCTIONS to verify data validation */

var val1 = [], free = [], sensor = [];
var heade = [], valueHeader = [];
function validation(){
   url = document.getElementById("url").value;
   var rowCount = document.getElementsByClassName('rangee')
   var rowHeader = document.getElementsByClassName('rangeeHeader')
   for (var i = 0; i < rowHeader.length; i++) {
     heade.push(document.getElementsByClassName("heade")[i].value);
     valueHeader.push(document.getElementsByClassName("headValue")[i].value);
   }

  var headerParams = {heade,valueHeader}
  var parameter = {val1, free,sensor}
  reason = "";
  reason += validateEmpty(document.getElementById('pushName'));
  reason += validateUrl(document.getElementById('url'));
  reason += validateHeader(headerParams);
    if (reason.length > 0) {
        return false;
    }else {
      return true;
    }
}
function validateEmpty(name) {
  var error = "";
  if (name.value.length == 0) {
      document.getElementById('name-error').className = 'col-md-4 alert alert-danger';
      document.getElementById('name-error').innerHTML = "This field is required";
      var error = "1";
  }
  return error;
}
function validateUrl(url) {
  var error = "";
  if (url.value.length <=3) {
      document.getElementById('url-error').className += 'col-md-4 alert alert-danger';
      document.getElementById('url-error').innerHTML = "Url is required";
      var error = "1";
  }
  return error;
}
var headParams = {heade,valueHeader}
function validateHeader(headParams) {
  var rowHeader = document.getElementsByClassName('rangeeHeader')
    var error = "";
    for (var i = 0; i < rowHeader.length; i++) {
      if (headParams.heade =="" || headParams.valueHeader=="") {
          document.getElementById('header-error').className += 'col-md-2 alert alert-danger';
          document.getElementById('header-error').innerHTML = "Header is required <br/>";
          var error = "1";
      }else {
        var headT = rowHeader[i].childNodes[1].value;//inputVal
        var headV =rowHeader[i].childNodes[3].value;//condi
        contentHead[i] = {headT,headV};
        console.log(contentHead);
      }
    }
    return error;
}

/* FUNCTION to submit the form if all values are correct  */

function submit_by_id() {
  var url = document.getElementById("url").value;
  var radios = document.getElementsByName('jsonPath');
  var nameE = document.getElementById("pushName").value;
  var h1 = document.getElementById("head1").value;//header type
  var h1v = document.getElementById("head2").value; //value of the header
  for (var i = 0,length = radios.length; i < length; i++) {
    if (radios[i].checked) {
       val1 = radios[i].value;
    }
  }
  if (validation()) // Calling validation function
    {
    push_http(nameE,url,h1,h1v,val1);
    alert("HTTP Push created successfully");
    document.getElementById("form1").submit(); //form submission
   }
}

/* FUNCTION to manage actions policies --> delete them */

function gestion(){
 request.open('GET', url_push, false);
 request.setRequestHeader('Accept', 'application/json')
 request.setRequestHeader('Content-type', 'application/json')
 request.setRequestHeader('X-API-KEY', kAPI)
 request.onload = function () {
   var valu = JSON.parse(request.response);
   if (request.status >= 200 && request.status < 400) {
        for (var i = 0; i < valu.data.length; i++) {
          alertes = valu.data[i].name;
          alerteId = valu.data[i].id;
          var tr = document.createElement("tr");
          var td = document.createElement('td');
          var tdDelete = document.createElement("td");
          var colId = '<td align="center"><span class="idToDelete" id="'+alerteId+'"><button title="Delete" type="button" class="btn btn-danger remove show_tip" data-original-title="Delete"><i class="fa fa-trash-o"></i></button></span></td>';
          td.innerHTML = alertes;
          tdDelete.innerHTML = colId;
          tr.appendChild(td);
          tr.appendChild(tdDelete);
          document.getElementById('bod').appendChild(tr);
        }
      }
    }
    request.send();
}
