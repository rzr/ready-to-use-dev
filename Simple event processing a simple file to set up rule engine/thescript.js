/**
 * @Author: Moustapha KEBE <kebson>
 * @Date:   2018-03-23T15:56:37+01:00
 * @Email:  mktapha@gmail.com
 * @Last modified by:   kebson
 * @Last modified time: 2018-03-28T00:04:50+02:00
 */



 var firing_rule_id = "";
 var kAPI = "";
 var matching_id = "";
 var request = new XMLHttpRequest();
 function submit_api() {
    kAPI = document.forms["formAPI"]["inputApi"].value;
    var roles =[];
    const request_api_key = new XMLHttpRequest();
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
    } else {
        console.log("Status de la réponse: %d (%s)", request_api_key.status, request_api_key.statusText);
    }

 }

 function getDevices(){
  console.log("getting devices ...");
  var url_data = 'https://liveobjects.orange-business.com/api/v0/data/streams/';
  var request_data = new XMLHttpRequest();
  request.open('GET', 'https://liveobjects.orange-business.com/api/v0/assets?size=20&page=0', false);
  request.setRequestHeader('Accept', 'application/json');
  request.setRequestHeader('Content-type', 'application/json');
  request.setRequestHeader('X-API-KEY', kAPI);
  request.send(null);
  var url_device =[];
    if (request.status >= 200 && request.status < 400) {
      var valu = JSON.parse(request.response);
      var options=""
         for (var i = 0; i < valu.data.length; i++) {
             var mydev = valu.data[i].name;
             var namespace = valu.data[i].namespace;
             var idd = valu.data[i].id;
             url_device.push(url_data+namespace+idd);
             options+="<option value=\""+mydev+"\">"+mydev+"</option>";
             document.getElementById('id_devices').innerHTML=options;
         }
         for (var j = 0; j < url_device.length; j++) {
           request_data.open('GET', url_device[j], false);
           request_data.setRequestHeader('Accept', 'application/json')
           request_data.setRequestHeader('Content-type', 'application/json')
           request_data.setRequestHeader('X-API-KEY', kAPI)
           request_data.onload = function () { //function pour les data des devices
           var valu_d = JSON.parse(this.response);
             if (request_data.status == 200) {
                  for (var variable in valu_d[j].value) {
                    var myVal = variable;
                    var opt = document.createElement("option");
                    opt.value= myVal;
                    opt.innerHTML = myVal;
                    document.getElementById('id_conditions').appendChild(opt);
                  }
                  // break; //Ce break là, faut penser à l'enlever
             }else {
               console.log("Ce device n'a envoyé aucune donnée pour l'instant. ");
             }
           }
           request_data.send();
         }
     }else{
       console.log('error getting device');
     }
 }
 function validation(){
   var e = document.getElementById("id_devices");
   dev = e.options[e.selectedIndex].value; // get the device from the devices list
   var f = document.getElementById("id_conditions");
   sensor = f.options[f.selectedIndex].value; // get the sensor from the sensors list

   var g = document.getElementById("condi");
   cond = g.options[g.selectedIndex].value; // get the condition from the conditions list
   var inputs = document.querySelectorAll('input[type=radio]:checked'); // get the radio button
   inputsLength = inputs.length;
   for (var i = 0; i < inputsLength; i++) {
     firingType = inputs[i].value;

   }
   nameE = document.getElementById("inputName3").value; //get the alert name
   email = document.getElementById("hisMail").value;
   newVal = document.getElementById("inputNVal").value; // get the seuil
   return true;
 }

 function matching_rule(type,name,cond,val){
     var req_match = new XMLHttpRequest();
     var url_matching = 'https://liveobjects.orange-business.com/api/v0/eventprocessing/matching-rule';
     var req = '{"dataPredicate":{"'+cond+'": [ {"var": "value.'+type+'"},'+val+']  },"enabled": true,"name": "'+name+'"}';
     req_match.open('POST', url_matching, true);
     req_match.setRequestHeader('Accept', 'application/json');
     req_match.setRequestHeader('Content-type', 'application/json');
     req_match.setRequestHeader('X-API-KEY', kAPI);
     req_match.send(req);
     req_match.onreadystatechange = function(){
      if (req_match.status >= 200 && req_match.readyState == 4) {
        var json_reponse = JSON.parse(req_match.response);
        console.log("Matching Rule cree avec succes");
        matching_id = json_reponse.id;
         firing_rule(firingType, matching_id,nameE);
       }
    }
 }
 function firing_rule(firingType,matching_idd, name){
   var req_firing = new XMLHttpRequest();
   var url_firing = 'https://liveobjects.orange-business.com/api/v0/eventprocessing/firing-rule';
   var reqq ='{"aggregationKeys": ["metadata.source"],"enabled": true,"firingType": "'+firingType+'","matchingRuleIds": ["'+matching_idd+'"],"name": "'+name+'"}';
   // var reqq ='{"aggregationKeys": ["metadata.source"],"enabled":true,"firingType":"'+firingType+'","matchingRuleIds":["'+matching_idd+'"],"name": "'+name+'"}';
   req_firing.open('POST', url_firing, true);
   req_firing.setRequestHeader('Accept', 'application/json');
   req_firing.setRequestHeader('Content-type', 'application/json');
   req_firing.setRequestHeader('X-API-KEY', kAPI);
   req_firing.send(reqq);
   req_firing.onreadystatechange = function(){
     if (req_firing.status >= 200 && req_firing.readyState == 4) {
       var jsonf = JSON.parse(req_firing.responseText);
       console.log("Firing Rule cree avec succes");
           firing_rule_id = jsonf.id;console.log(firing_rule_id);
            action_policies(nameE, firing_rule_id, email);
     }
   }
  }
  function action_policies(name, eventRuleID){
    var req_actionp = new XMLHttpRequest();
    var url_action_policy = 'https://liveobjects.orange-business.com/api/v0/event2action/actionPolicies';
    var reqqq = '{"name": "'+name+'","enabled": true,    "triggers": { "eventRuleIds": ["'+eventRuleID+'"]},"actions": { "emails": [{"to": ["'+email+'"], "subjectTemplate": "State change for {{stateKey}}", "contentTemplate": "{{stateKey}} change from state {{previousState}} to state {{newState}} at {{timestamp}}"}] }}'
    req_actionp.open('POST', url_action_policy, true);
    req_actionp.setRequestHeader('Accept', 'application/json');
    req_actionp.setRequestHeader('Content-type', 'application/json');
    req_actionp.setRequestHeader('X-API-KEY', kAPI);
    req_actionp.send(reqqq);
    req_actionp.onreadystatechange = function(){
      if (req_actionp.status >= 200 && req_actionp.readyState == 4) {
        console.log("Action Policy cree avec succes");
      }
    }
  }


 function submit_by_id() {
   var nameE = document.getElementById("inputName3").value;
   var email = document.getElementById("hisMail").value;
   var formID =document.getElementById("form_id");
   if (validation()) // Calling validation function
     {
     matching_rule(sensor, nameE, cond, newVal);
     alert("Event created successfully.");
     document.getElementById("form1").submit(); //form submission

   }else{
     alert("not valid");
   }
 }

function gestion(){
 var url_firing = 'https://liveobjects.orange-business.com/api/v0/eventprocessing/firing-rule';
 request.open('GET', url_firing, false);
 request.setRequestHeader('Accept', 'application/json')
 request.setRequestHeader('Content-type', 'application/json')
 request.setRequestHeader('X-API-KEY', kAPI)
 request.onload = function () {
   var valu = JSON.parse(request.response);
   if (request.status >= 200 && request.status < 400) {
        for (var i = 0; i < valu.length; i++) {
          alertes = valu[i].name;
          alerteId = valu[i].id;
          var tr = document.createElement("tr");
          var td = document.createElement('td');
          var tdDelete = document.createElement("td");
          var tdAction = document.createElement("td");
          var col = '<td><button title="" type="button" class="btn btn-danger remove show_tip" data-original-title="Supprimer"><i class="fa fa-trash-o"></i></button></td>';
          var colId = '<input id="idToDelete"'+i+' type="hidden" value="'+alerteId+'">';
          td.innerHTML = alertes;
          tdAction.innerHTML = col;
          tdDelete.innerHTML = colId;
          tr.appendChild(td);
          tr.appendChild(tdAction);
          tr.appendChild(tdDelete);
          document.getElementById('bod').appendChild(tr);
        }
      }
    }
    request.send();
}
