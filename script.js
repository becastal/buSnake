const MAX_ALTURA = 10;
const MAX_LARGURA = 10;
const MAX_COMBUSTIVEL = 30;
const VELOCIDADE = 500;
let mapa = [];
let cabeca = [];
let corpo = [];
let pessoa = [];
let gasolina = [];
let direcao = [];
let filaPessoas = 0;
let combustivel = 0;

preProcesso();
function preProcesso() 
{
    for (let i = 0; i < MAX_ALTURA; i++)
    {
        mapa[i] = [];
        for (let j = 0; j < MAX_LARGURA; j++)
        {
            mapa[i][j] = ".";
        }
    }
    direcao = [-1, 0];
    combustivel = MAX_COMBUSTIVEL;
    cabeca = [MAX_ALTURA / 2, MAX_LARGURA / 2];
    corpo = [ [MAX_ALTURA / 2 + 1, MAX_LARGURA / 2] ];
    pessoa = novoRandom();
    gasolina = novoRandom();

    atualizaMapa();
    printaMapa();
    inicio();
}

function inicio() {
    setTimeout(function () 
    {
        atualiza();
        if (posicaoValida(cabeca)) 
        {
            inicio();
        } 
        else
        {
            fimDeJogo();
        }
    }, VELOCIDADE);
}

function fimDeJogo() {
    window.alert("VOCE PERDEU")
}

function atualiza() 
{
    cabeca[0] += direcao[0], cabeca[1] += direcao[1];
    let posAnterior = [cabeca[0] - direcao[0], cabeca[1] - direcao[1]];
    
    combustivel--;
    if (filaPessoas > 0)
    {
        filaPessoas--;
        corpo.unshift(posAnterior);
    } 
    else
    {
        for (let i = corpo.length - 1; i > 0; i--)
        corpo[i] = corpo[i - 1];
        corpo[0] = posAnterior;
    }
    checaPessoa();
    checaGasolina();

    atualizaMapa();
    printaMapa();
}

function novoRandom() 
{
    // funcao burra pra gerar uma posicao aleatoria nao ocupada
    let novaX = Math.floor((Math.random() * (MAX_ALTURA - 1)));
    let novaY = Math.floor((Math.random() * (MAX_LARGURA - 1)));

    while (mapa[novaX][novaY] != ".")
    {
        novaX = Math.floor((Math.random() * (MAX_ALTURA - 1)));
        novaY = Math.floor((Math.random() * (MAX_LARGURA - 1)));    
    }
    
    return([novaX, novaY]);
}

function posicaoValida()
{
    let x = cabeca[0]; let y = cabeca[1];
    return(x >= 0 && y >= 0 && x < MAX_ALTURA && y < MAX_LARGURA && mapa[x][y] != "p" && !corpo.includes(cabeca));
}

function checaPessoa() {
    // checa se tem pessoas as duas posicoes laterais da cabeca do busao e resolve caso sim.
    let vizinhos = [];
    if (direcao[0] == 0) vizinhos = [[-1, 0], [1, 0]];
    else if (direcao[1] == 0) vizinhos = [[0, 1], [0, -1]];

    for (mov of vizinhos)
    {
        let viz = [cabeca[0] + mov[0], cabeca[1] + mov[1]];
        if (viz[0] < 0 || viz[1] < 0 || viz[0] >= MAX_ALTURA || viz[1] >= MAX_LARGURA) continue;
        if (mapa[viz[0]][viz[1]] == "p")
        {
            filaPessoas += 1;
            pessoa = novoRandom();
        }
    }
}

function checaGasolina() {
    // checa se uma gasolina foi consumida e resolve caso sim.
    if (gasolina[0] == cabeca[0] && gasolina[1] == cabeca[1])
    {
        combustivel = MAX_COMBUSTIVEL;
        gasolina = novoRandom();
    }
}

function figuraCorpo(i) {
    
    if (i == corpo.length - 1) return "b";
    return("#");
}

function atualizaMapa()
{
    // atualiza dados do mapa.
    for (let i = 0; i < MAX_ALTURA; i++)
        for (let j = 0; j < MAX_LARGURA; j++)
            mapa[i][j] = ".";

    for (let i = 0; i < corpo.length; i++)
        mapa[corpo[i][0]][corpo[i][1]] = figuraCorpo(i);

    mapa[cabeca[0]][cabeca[1]] = "c";
    mapa[pessoa[0]][pessoa[1]] = "p";
    mapa[gasolina[0]][gasolina[1]] = "g";
}

function printaMapa()
{
    // atualiza visualizacao do mapa no console e na div.
    let resp = "";
    for (let i = 0; i < MAX_ALTURA; i++)
    {
        for (let j = 0; j < MAX_LARGURA; j++)
            resp += mapa[i][j];
        resp += "\n";
    }    
    document.querySelector("#mapa").textContent = resp;
    document.querySelector("#tanque").textContent = `tanque: ${combustivel}`;
    document.querySelector("#tamanho").textContent = `tamanho: ${corpo.length}`;
}

document.addEventListener("keydown", logKey);

function logKey(e) {
    if (e.code == "ArrowUp" || e.code == "KeyW") direcao = [-1, 0];
    if (e.code == "ArrowDown" || e.code == "KeyS") direcao = [1, 0];
    if (e.code == "ArrowRight" || e.code == "KeyD") direcao = [0, 1];
    if (e.code == "ArrowLeft" || e.code == "KeyA") direcao = [0, -1];
}