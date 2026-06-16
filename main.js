function verificarVencimentos() { 
  var dataAtual = new Date(); 
   dataAtual.setHours(0,0,0,0);
  var horaAtual = new Date();
  var hora = horaAtual.getHours(); 

  // Condição: Se for dia de semana (1 a 5) E a hora estiver entre 7h e 24h 
  if ((hora >= 7 && hora <=8) || (hora >= 13 && hora <= 14) || (hora >= 15 && hora <= 16 )) { 

    var urlWebhook = PropertiesService.getScriptProperties().getProperty('webhook'); 
    if (!urlWebhook) { 
      Logger.log("Erro: A propriedade 'webhook' não foi configurada."); 
      return; 
    } 

    var folha = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); 
    var ultimaLinha = folha.getLastRow(); 
    
    if (ultimaLinha < 2) {
      Logger.log("Planilha vazia.");
      return; 
    }

    var dados = folha.getRange(2, 1, ultimaLinha - 1, 12).getValues(); 
    var listaItens = []; 

    // Larguras mínimas das colunas para alinhar o cabeçalho inicial
    var maxTipo = 6, maxIpn = 5, maxId = 4, maxPos = 7, maxData=10, maxhora= 5;

    // 1º Passo: Filtrar itens e descobrir a largura máxima de cada coluna para alinhar
    for (var i = 0; i < dados.length; i++) { 
      var dataSaidaRaw = dados[i][11]; // Coluna L
      if (!dataSaidaRaw) continue; 

      var dataSaida = new Date(dataSaidaRaw); 
      var dataSaidaChat = new Date(dataSaidaRaw); 
      
      dataSaida.setHours(0,0,0,0);

      if (!isNaN(dataSaida.getTime()) && dataSaida.getTime() === dataAtual.getTime()) { 
        var ipn = dados[i][1] ? String(dados[i][1]).trim() : "N/A";     // Coluna B
        var id = dados[i][2] ? String(dados[i][2]).trim() : "N/A";      // Coluna C
        var posicao = dados[i][4] ? String(dados[i][4]).trim() : "N/A"; // Coluna E
        var tipo = dados[i][5] ? String(dados[i][5]).trim() : "N/A";    // Coluna F
        var data = Utilities.formatDate(dataSaidaChat, Session.getScriptTimeZone(), "dd/MM/yyyy");
        var hora = Utilities.formatDate(dataSaidaChat, Session.getScriptTimeZone(), "HH:mm");

        // Atualiza as larguras máximas dinamicamente
        if (tipo.length > maxTipo) maxTipo = tipo.length;
        if (ipn.length > maxIpn) maxIpn = ipn.length;
        if (id.length > maxId) maxId = id.length;
        if (posicao.length > maxPos) maxPos = posicao.length;
        if (posicao.length > maxData) maxData = data.length;
        if (posicao.length > maxhora) maxhora = hora.length;

        listaItens.push({ tipo: tipo, ipn: ipn, id: id, pos: posicao, data: data, hora: hora });
      } 
    } 

    // 2º Passo: Montar a tabela alinhada se houver itens vencidos
    if (listaItens.length > 0) { 
      
      // Função interna para preencher espaços em branco e alinhar as colunas
      var pad = function(txt, maxLen) {
        return txt + " ".repeat(Math.max(0, maxLen - txt.length));
      };

      // Desenha o Cabeçalho da Tabela
      var cabecalho = pad("DATA", maxData) + " | " + 
                      pad("HORA", maxhora) + " | " + 
                      pad("TIPO", maxTipo) + " | " + 
                      pad("IPN", maxIpn)   + " | " + 
                      pad("ID", maxId)     + " | " + 
                      pad("POSIÇÃO", maxPos) + "\n";
      
      // Desenha a linha divisória separando o cabeçalho dos dados
      var divisoria = "-".repeat(cabecalho.length) + "\n";
      
      var linhasTabela = "";
      for (var j = 0; j < listaItens.length; j++) {
        var item = listaItens[j];
        linhasTabela += pad(item.data, maxData) + " | " + 
                        pad(item.hora, maxhora) + " | " + 
                        pad(item.tipo, maxTipo) + " | " + 
                        pad(item.ipn, maxIpn)   + " | " + 
                        pad(item.id, maxId)     + " | " + 
                        pad(item.pos, maxPos)   + "\n";
      }

      // Monta o corpo completo dentro do bloco de código monoespaçado ()
      var corpoMensagem = "🚨 ALERTA DE VENCIMENTO (" + listaItens.length + " ITENS) 🚨\n" +
                          "```"+ "\n" + 
                          cabecalho + 
                          divisoria + 
                          linhasTabela + 
                          "```";
      
      var options = { 
        "method": "post", 
        "contentType": "application/json", 
        "payload": JSON.stringify({ "text": corpoMensagem }) 
      }; 
      
      UrlFetchApp.fetch(urlWebhook, options); 
      Logger.log("Tabela alinhada enviada com sucesso.");
    } else {
      Logger.log("Nenhum item vencido.");
    }
  } else { 
    Logger.log("Fora do horário comercial."); 
  } 
}
