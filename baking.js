function verificarVencimentos() { 
// carrega para variavel "dataAtual" o objeto date que contem todas  infomacoes temporais
  var dataAtual = new Date(); 
//set hora de "dataAtual" pra zero
  dataAtual.setHours(0,0,0,0);
// carrega para variavel "horaAtual" o objeto date que contem todas  infomacoes temporais
  var horaAtual = new Date();
// retona a hora de "horaAtual" para hora em numeral
  var hora = horaAtual.getHours(); 
// Condição: Se for uma de essas horas ".getHours() retorna apenas as horas" - 7 ou 13 ou 15, executa
  if (hora == 7 || hora == 13 || hora == 15) { 
// procura e copia o valor que esta na propriedade de script de "webhook" e carrega para "urlWebhook" 
    var urlWebhook = PropertiesService.getScriptProperties().getProperty('webhook'); 
// verifica se há algo em urlwebhook se não executa, enviando uma emnsagem de erro e encerra
    if (!urlWebhook) { 
      Logger.log("Erro: A propriedade 'webhook' não foi configurada."); 
      return; 
    } 
// Armazena essa aba na variável "folha"
    var folha = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Baking"); // ALTERAÇÃO - coloquei para que obtenha os dados se baseando na aba com o nome "Baking" não a aba aberta por ultimo
// obtem qual a ultima linha preenchida
    var ultimaLinha = folha.getLastRow(); 
// se a planilha tiver menos que 2 linhas preenchidas ou seja tem apenas o cabeçalho, printa e termina a execução
    if (ultimaLinha < 2) {
      Logger.log("Planilha vazia.");
      return; 
    }
// lê a tabela inteira, guarda e informações na variável "dados" como uma matriz 
    var dados = folha.getRange(2, 1, ultimaLinha - 1, 13).getValues(); 
// cria uma variavel qual vai guardar os itensa serem retirados
    var listaItens = []; 
// Larguras mínimas das colunas para alinhar o cabeçalho inicial
    var maxTipo = 6, maxIpn = 5, maxId = 4, maxPos = 7, maxData=10, maxhora= 5;
// 1º Passo: Filtrar itens e descobrir a largura máxima de cada coluna para alinhar
    for (var i = 0; i < dados.length; i++) { 
// guarda em "dataSaidaRaw" o dado da linha i e da coluna L 
      var dataSaidaRaw = dados[i][11]; // Coluna L
// interronpe o codigo todo abaixo apos a linha do if se a "dataSaidaRaw" estiver vazia
      if (!dataSaidaRaw) continue; 
// cria duas copias do objeto date de "dataSaidaRaw"
      var dataSaida = new Date(dataSaidaRaw); 
      var dataSaidaChat = new Date(dataSaidaRaw); 
// seta datasaida para zero
      dataSaida.setHours(0,0,0,0);
// garante que a data seja uma data valida, depois compara as data de saida e a data atual.
//as duas quais estao com as horas setasdas para 0 comparando apenas o dia
      if (!isNaN(dataSaida.getTime()) && dataSaida.getTime() === dataAtual.getTime()) { 

        if (dados[i][12] === true) continue; 
				
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
        if (data.length > maxData) maxData = data.length;
        if (hora.length > maxhora) maxhora = hora.length;
        
//cria um objeto organizado com os dados extraiu da linha atual e o guarda dentro de "listaItens"
        
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
// envia por webhook para o chat google, usando o link "urlWebhook", e a configuraçao do objeto "options"
      UrlFetchApp.fetch(urlWebhook, options); 
      Logger.log("Tabela alinhada enviada com sucesso.");
// não executa se não ter nenhum item na lista e printa a mensagem "Nenhum item vencido."
    } else {
      Logger.log("Nenhum item vencido.");
    }
// não executa se não estiver no horario e printa a mensagem "Fora do horário comercial."
  } else { 
    Logger.log("Fora do horário comercial."); 
  } 
}
