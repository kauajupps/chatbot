function avisoMensal() { 
  const hoje = new Date();
  const diaDaSemana = hoje.getDay();
  const diaDoMes = hoje.getDate();
  const diaDaSemanaDoPrimeiroDia = new Date(hoje.getFullYear(), hoje.getUTCMonth(), 1).getDay();

  // Calcula o índice da semana no mês
  const semanaDoMes = Math.ceil((diaDoMes + diaDaSemanaDoPrimeiroDia) / 7);

  if(diaDaSemana==2 && semanaDoMes==2){
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
  else{return;};
}

