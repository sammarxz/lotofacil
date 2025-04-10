# Gerador de Jogos Otimizados para Lotofácil

Este projeto é um gerador de jogos otimizados para a Lotofácil, uma das loterias mais populares do Brasil. Ele utiliza análise estatística de resultados históricos para criar jogos com base em métricas como frequência de números, atraso (tempo desde o último sorteio), sequências frequentes e proporções de pares e ímpares.

## Funcionalidades

- **Busca de Dados**: Obtém resultados históricos da Lotofácil via API pública ou dados locais como fallback.
- **Análise Estatística**: Calcula métricas como frequência de números, atraso, sequências mais comuns e proporções de pares/ímpares.
- **Geração de Jogos**: Cria jogos otimizados com base nas métricas calculadas, priorizando números com maior pontuação estatística.
- **Avaliação**: Analisa os jogos gerados, fornecendo estatísticas detalhadas como distribuição por faixas, quantidade de números "quentes" (frequentes) e "frios" (atrasados).

## Pré-requisitos

- **Node.js**: Versão 14 ou superior.
- **Conexão com a Internet**: Para buscar dados da API (opcional, caso use dados locais).

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/lotofacil-optimizer.git
   cd lotofacil-optimizer
   ```
2. Execute o Script:
    ```bash
    node index.js
    ```

## Uso
O script principal (`index.js`) executa o fluxo completo:

Busca os resultados históricos da Lotofácil.
Analisa os dados e extrai métricas.
Gera 10 jogos otimizados e seleciona o melhor com base em uma pontuação estatística.
Exibe o jogo recomendado com suas estatísticas detalhadas.
Exemplo de saída:

```text
JOGO RECOMENDADO:
1, 2, 3, 5, 7, 8, 10, 11, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25

ESTATÍSTICAS:
- Pares: 10
- Ímpares: 10
- Faixas: { '1-5': 4, '6-10': 4, '11-15': 4, '16-20': 4, '21-25': 4 }
- Sequências: 1
- Quentes: 8
- Frios: 3
```

## Estrutura do Código

* `fetchLotofacilResults`: Busca resultados históricos via API ou localmente.
* `analyzeHistoricalResults`: Processa os dados e retorna métricas estatísticas.
* `generateOptimizedGame`: Gera um jogo com base nas métricas.
* `analyzeGame`: Avalia um jogo gerado e retorna estatísticas.
* `main`: Função principal que coordena o fluxo.

## Configuração

* **API:** O projeto usa a API pública https://loteriascaixa-api.herokuapp.com/api/lotofacil. Certifique-se de que ela esteja acessível ou ajuste para outra fonte de dados.
* **Dados Locais:** Implemente a função loadLocalData() caso deseje usar um arquivo local como fallback.

## Contribuição
Contribuições são bem-vindas! Siga os passos abaixo:

1. Faça um fork do repositório.
2. Crie uma branch para sua feature:
    ```bash
    git checkout -b minha-feature
    ```
3. Commit suas mudanças:
    ```bash
    git commit -m "Adiciona minha feature"
    ```
4. Envie para o repositório remoto:
    ```bash
    git push origin minha-feature
    ```
5. Abra um Pull Request.

## Limitações
* A API utilizada pode ter limites de requisições ou ficar indisponível.
( O algoritmo é baseado em estatísticas passadas, o que não garante resultados futuros, já que loterias são jogos de azar.
* A função de dados locais (`loadLocalData`) precisa ser implementada conforme a necessidade.

## Licença
Este projeto está licenciado sob a [GNU GPLv3](https://github.com/sammarxz/lotofacil/blob/main/LICENSE).

## Agradecimentos
À comunidade open-source por APIs e ferramentas úteis.

---
⭐ Se achou útil, deixe uma estrela no repositório!
