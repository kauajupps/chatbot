function avisoMensal() { 

  // Lista com as URLs dos webhooks de cada espaço individual
  var webhooks = [
     PropertiesService.getScriptProperties().getProperty('adicione o nome da propriedade'),
  ];

  webhooks.forEach(function(url) {
    var payload = JSON.stringify({ "text": "(adicione seu texto)" });
    var options = { "method": "post", "contentType": "application/json", "payload": payload };
    UrlFetchApp.fetch(url, options);
  });
}

