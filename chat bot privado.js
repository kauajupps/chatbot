function avisoMensal() { 
 
  // Lista com as URLs dos webhooks de cada espaço individual
  var put = PropertiesService.getScriptProperties().getProperty('teste');
  user = put.split(",");

  for(let i=0;i<(user.length);i++) {
    var payload = JSON.stringify({ "text": "Olá! favor atualizar os indicadores na pasta "+user[i] });
    i++;
    var options = { "method": "post", "contentType": "application/json", "payload": payload };
    UrlFetchApp.fetch(user[i], options);
  };
  
}
