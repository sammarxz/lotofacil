const readline = require('readline');

/**
 * Busca resultados históricos da Lotofácil via API ou dados locais
 * @returns {Promise<Object[]>} Array de resultados
 */
async function fetchLotofacilResults() {
    try {
        const response = await fetch('https://loteriascaixa-api.herokuapp.com/api/lotofacil');
        return await response.json();
    } catch (error) {
        console.error('Erro na API:', error);
        return loadLocalData();
    }
}

/**
 * Carrega dados locais como fallback (implementação fictícia)
 * @returns {Object[]} Dados locais
 */
function loadLocalData() {
    return []; // Substituir por implementação real
}

/**
 * Analisa resultados históricos e retorna métricas estatísticas
 * @param {Object[]} results - Resultados dos sorteios
 * @returns {Object} Métricas calculadas
 */
function analyzeHistoricalResults(results) {
    const frequency = Object.fromEntries(Array.from({ length: 25 }, (_, i) => [i + 1, 0]));
    const lastDraw = Object.fromEntries(Array.from({ length: 25 }, (_, i) => [i + 1, null]));
    const sequenceFreq = new Map();
    const evenOddFreq = {};

    results.forEach((draw, index) => {
        const numbers = draw.dezenas.map(Number);

        numbers.forEach(num => {
            frequency[num]++;
            lastDraw[num] = index;
        });

        const evens = numbers.filter(n => n % 2 === 0).length;
        const odds = 15 - evens;
        evenOddFreq[`${evens}p-${odds}i`] = (evenOddFreq[`${evens}p-${odds}i`] || 0) + 1;

        for (let i = 0; i < numbers.length - 2; i++) {
            for (let j = i + 1; j < numbers.length - 1; j++) {
                for (let k = j + 1; k < numbers.length; k++) {
                    if (numbers[j] - numbers[i] === 1 && numbers[k] - numbers[j] === 1) {
                        const seq = [numbers[i], numbers[j], numbers[k]].join(',');
                        sequenceFreq.set(seq, (sequenceFreq.get(seq) || 0) + 1);
                    }
                }
            }
        }
    });

    const totalDraws = results.length;
    const delay = Object.fromEntries(
        Object.entries(lastDraw).map(([num, last]) => [
            num,
            last === null ? totalDraws : totalDraws - last - 1
        ])
    );

    const sequences = Array.from(sequenceFreq.entries())
        .map(([seq, freq]) => ({ sequence: seq.split(',').map(Number), frequency: freq }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10);

    const evenOddCombinations = Object.entries(evenOddFreq)
        .map(([key, freq]) => {
            const [evens, odds] = key.split('-').map(s => parseInt(s));
            return { evens, odds, frequency: freq };
        })
        .sort((a, b) => b.frequency - a.frequency);

    return { frequency, delay, sequences, evenOddCombinations };
}

/**
 * Calcula pontuação de um número com base em frequência e atraso
 * @param {number} number - Número a ser avaliado
 * @param {Object} frequency - Frequência histórica
 * @param {Object} delay - Atraso histórico
 * @returns {number} Pontuação normalizada
 */
function calculateNumberScore(number, frequency, delay) {
    const maxFreq = Math.max(...Object.values(frequency));
    const maxDelay = Math.max(...Object.values(delay));
    const freqNormalized = frequency[number] / maxFreq;
    const delayNormalized = delay[number] / maxDelay;
    return (freqNormalized * 0.6) + (delayNormalized * 0.4);
}

/**
 * Determina a faixa de um número
 * @param {number} num - Número
 * @returns {string} Faixa correspondente
 */
function getRange(num) {
    if (num <= 5) return "1-5";
    if (num <= 10) return "6-10";
    if (num <= 15) return "11-15";
    if (num <= 20) return "16-20";
    return "21-25";
}

/**
 * Gera um jogo otimizado com base em métricas estatísticas
 * @param {Object} metrics - Métricas históricas
 * @param {number} size - Número de dezenas desejadas (15 a 20)
 * @returns {number[]} Jogo gerado
 */
function generateOptimizedGame({ frequency, delay, sequences, evenOddCombinations }, size) {
    const availableNumbers = Array.from({ length: 25 }, (_, i) => i + 1);
    const scores = Object.fromEntries(availableNumbers.map(n => [n, calculateNumberScore(n, frequency, delay)]));
    const sortedNumbers = availableNumbers.sort((a, b) => scores[b] - scores[a]);
    const idealRatio = evenOddCombinations[0];

    let game = [];
    let evensCount = 0;
    let oddsCount = 0;
    const rangeCount = { "1-5": 0, "6-10": 0, "11-15": 0, "16-20": 0, "21-25": 0 };

    const topSequences = sequences.slice(0, 3);
    const chosenSequence = topSequences[Math.floor(Math.random() * topSequences.length)].sequence;
    game.push(...chosenSequence);
    chosenSequence.forEach(num => {
        num % 2 === 0 ? evensCount++ : oddsCount++;
        rangeCount[getRange(num)]++;
    });

    for (const num of sortedNumbers) {
        if (game.includes(num)) continue;
        if (num % 2 === 0 && evensCount >= Math.ceil(idealRatio.evens * (size / 15))) continue;
        if (num % 2 !== 0 && oddsCount >= Math.ceil(idealRatio.odds * (size / 15))) continue;
        const range = getRange(num);
        if (rangeCount[range] >= Math.ceil(size / 5)) continue;

        game.push(num);
        num % 2 === 0 ? evensCount++ : oddsCount++;
        rangeCount[range]++;
        if (game.length >= size) break;
    }

    while (game.length < size) {
        const nextNum = sortedNumbers.find(n => !game.includes(n));
        if (nextNum) game.push(nextNum);
    }

    return game.sort((a, b) => a - b);
}

/**
 * Analisa um jogo gerado e retorna estatísticas detalhadas
 * @param {number[]} game - Jogo a ser analisado
 * @param {Object} metrics - Métricas históricas
 * @returns {Object} Análise detalhada
 */
function analyzeGame(game, { frequency, delay, sequences }) {
    const evens = game.filter(n => n % 2 === 0).length;
    const odds = game.length - evens;
    const ranges = {
        "1-5": game.filter(n => n <= 5).length,
        "6-10": game.filter(n => n > 5 && n <= 10).length,
        "11-15": game.filter(n => n > 10 && n <= 15).length,
        "16-20": game.filter(n => n > 15 && n <= 20).length,
        "21-25": game.filter(n => n > 20).length
    };
    const presentSequences = sequences.filter(seq => seq.sequence.every(n => game.includes(n)));
    const avgScore = game.reduce((sum, n) => sum + calculateNumberScore(n, frequency, delay), 0) / game.length;
    const hotNumbers = game.filter(n => frequency[n] > 35).length;
    const coldNumbers = game.filter(n => delay[n] > 10).length;

    return {
        game,
        evens,
        odds,
        ranges,
        sequenceCount: presentSequences.length,
        avgScore,
        hotNumbers,
        coldNumbers
    };
}

/**
 * Solicita ao usuário o número de dezenas via CLI
 * @returns {Promise<number>} Número de dezenas escolhidas
 */
function askGameSize() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Quantas dezenas você quer no jogo? (15 a 20): ', (answer) => {
            const size = parseInt(answer);
            if (isNaN(size) || size < 15 || size > 20) {
                console.log('Por favor, insira um número válido entre 15 e 20.');
                rl.close();
                resolve(askGameSize()); // Recursão para nova tentativa
            } else {
                rl.close();
                resolve(size);
            }
        });
    });
}

/**
 * Executa o fluxo principal e exibe resultados
 */
async function main() {
    const results = await fetchLotofacilResults();
    const metrics = analyzeHistoricalResults(results);

    const gameSize = await askGameSize();
    const games = Array.from({ length: 10 }, () => generateOptimizedGame(metrics, gameSize));
    const analyzedGames = games.map(game => analyzeGame(game, metrics));
    const bestGame = analyzedGames.sort((a, b) => b.avgScore - a.avgScore)[0];

    console.log(`\nJOGO RECOMENDADO (${gameSize} DEZENAS):`);
    console.log(bestGame.game.join(', '));
    console.log("\nESTATÍSTICAS:");
    console.log(`- Pares: ${bestGame.evens}`);
    console.log(`- Ímpares: ${bestGame.odds}`);
    console.log("- Faixas:", bestGame.ranges);
    console.log(`- Sequências: ${bestGame.sequenceCount}`);
    console.log(`- Quentes: ${bestGame.hotNumbers}`);
    console.log(`- Frios: ${bestGame.coldNumbers}`);
    console.log(`- Pontuação média: ${bestGame.avgScore.toFixed(4)}`);
}

main().catch(console.error);