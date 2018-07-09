// var url = 'https://liveobjects.orange-business.com/api/v0/event2action/actionPolicies?size=20&page=0'
var url = 'server.html'
// var request = new XMLHttpRequest();
// var kAPI = '81b6f448add842a29d5a476d4fa112a8'
// var contenu, from
// request.open('GET', url, false);
// request.setRequestHeader('Accept', 'application/json');
// request.setRequestHeader('Content-type', 'application/json');
// request.setRequestHeader('X-API-KEY', kAPI);
// request.send(null);
// if (request.status === 200) {
//   var result = JSON.parse(request.response);
//   for ( i = 0; i < result.data.length; i++) {
//     // console.log(result.data[i].actions.httpPush[0].content);
//
//       from = result.data[i].name
//       contenu = result.data[i].actions.httpPush[0].content
//       // console.log(result.data[i].actions.httpPush);
//       var tr = document.createElement("tr");
//       var tdFrom = document.createElement('td');
//       var tdContent = document.createElement("td");
//       tdFrom.innerHTML = from;
//       tdContent.innerHTML = contenu;
//       tr.appendChild(tdFrom);
//       tr.appendChild(tdContent);
//       document.getElementById('tab').appendChild(tr)
//      }
// } else {
//     console.log("Status de la réponse: %d (%s)", request.status, request.statusText);
// }

function httpPush(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    var cont = document.getElementById('contenu')
    cont.innerHTML = xmlHttp.responseText;
    return xmlHttp.responseText;
}
httpPush(url)
