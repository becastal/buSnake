const MAX_ALTURA = 10;
const MAX_LARGURA = 10;
const MAX_PESSOAS = 5;
const MAX_GASOLINAS = 1;
const MAX_COMBUSTIVEL = 80;
const VELOCIDADE = 200;
const canvas = document.querySelector("#jogo canvas");
const ctx = canvas.getContext("2d");
let direcoes = [[-1, 0], [1, 0], [0, 1], [0, -1]];
let mapa = [];
let cabeca = [];
let corpo = [];
let pessoas = [];
let gasolinas = [];
let direcao = [];
let filaPessoas = 0;
let combustivel = 0;

document.addEventListener("keydown", logKey);

function logKey(e) {
    if (["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", "KeyW", "KeyS", "KeyD", "KeyA"].includes(e.code))
    {
        direcaoAntiga = direcao;
        if (e.code == "ArrowUp" || e.code == "KeyW") direcao = [-1, 0];
        if (e.code == "ArrowDown" || e.code == "KeyS") direcao = [1, 0];
        if (e.code == "ArrowRight" || e.code == "KeyD") direcao = [0, 1];
        if (e.code == "ArrowLeft" || e.code == "KeyA") direcao = [0, -1];
        if (-direcaoAntiga[0] == direcao[0] && -direcaoAntiga[1] == direcao[1]) direcao = direcaoAntiga;
    }
}

preProcesso();
function preProcesso() 
{
    // void
    // constroe mapa e inicia valores fundamentais.

    for (let i = 0; i < MAX_ALTURA; i++) // eu odeio muito js olha que imbecilidade pra gerar uma matriz de tamanho [i][j]
    {
        mapa[i] = [];
        for (let j = 0; j < MAX_LARGURA; j++)
            mapa[i][j];
    }
    direcao = [-1, 0];
    combustivel = MAX_COMBUSTIVEL;
    cabeca = [MAX_ALTURA / 2, MAX_LARGURA / 2];
    corpo = [ [MAX_ALTURA / 2 + 1, MAX_LARGURA / 2] ];
    
    pessoas = [];
    for (let i = 0; i < MAX_PESSOAS; i++)
        pessoas.push(novoRandom());
    
    gasolinas = [];
    for (let i = 0; i < MAX_GASOLINAS; i++)
        gasolinas.push(novoRandom());

    atualizaMapa();
    printaMapa();
    rodar();
}

function rodar() {
    // void
    // funcao recursiva que permite o jogo ir se atualizando.

    setTimeout(function () 
    {
        atualiza();
        if (!acabouJogo()) 
            rodar();
        else
            fimDeJogo();
    }, VELOCIDADE);
}

function atualiza() 
{
    // void
    // funcao que atualiza tudo que acontece em um so frame do jogo;

    cabeca[0] += direcao[0], cabeca[1] += direcao[1];                   // atualiza a posicao da cabeca
    let posAnterior = [cabeca[0] - direcao[0], cabeca[1] - direcao[1]]; // guarda a posicao anterior da cabeca
    if (acabouJogo()) return;
    
    combustivel--;
    if (filaPessoas > 0) 
    {
        filaPessoas--;              // aqui a cobra precisa crescer;
        corpo.unshift(posAnterior); // cria uma nova parte do corpo no inicio da array. importante usar unshift (incluir no inicio) pra manter a ordem da array
    }                               // sendo corpo[0], portanto, sempre a parte mais proxima da cabeca e corpo[tamanho_corpo] sempre a bunda;
    else
    {
        for (let i = corpo.length - 1; i > 0; i--) // aqui a cobra precisa seguir adiante;
            corpo[i] = corpo[i - 1];               // comecando pela bunda, cada parte do corpo assume a posicao da parte que antecede ele na array e portanto
        corpo[0] = posAnterior;                    // sucede ele na estrutura da cobra. no fim, a parte mais proxima da cabeca (corpo[0]) assume a posicao da 
    }                                              // ultima posicao da cabeca;
    
    checaPessoa();   // checa e consome pessoas. 
    checaGasolina(); // checa e consome gasolina.
    atualizaMapa();  // atualiza valores do mapa (para visualizacao em texto)
    printaMapa();    // imprime o mapa (para visualizacao em texto)
    atualizaCanvas();
}

function acabouJogo() 
{
    // bool
    // retorna se o jogo acabou, ou por falta de gasolina ou por colisao da cabeca;

    return combustivel < 0 || !posicaoValida();
}

function fimDeJogo() 
{
    let mensagem = "";
    if (estaContida(cabeca, corpo)) 
        mensagem = "voce nao pode se acertar!";

    else if (estaContida(cabeca, pessoas)) 
        mensagem = "voce nao pode atropelar ninguem!";

    else if (combustivel < 0) 
        mensagem = "voce nao pode deixar o seu tanque acabar!";

    else
        mensagem = "se mantenha dentro da cidade!"

    console.log(`VOCE PERDEU: ${mensagem}`);
}

function novoRandom() 
{
    // array (par de posicao [x, y])
    // funcao meio burra pra gerar uma posicao aleatoria nao ocupada;
    //   o outro jeito eh ter uma array de todas as posicoes possiveis e pegar uma posicao aleatoria dentro dessa array. mas isso eh O(max_altura * max_largura)
    //   pra gerar essa array e testar dentro dela necessariamente. desse jeito aqui agora eh O(sorte) o que eh BEM mais daora;
    // mas vale dizer que tambem existe um mundo em que eh impossivel sair dessa funcao. podemos estar vivendo nele ou nao. nao sei;
    
    let redondezas = [cabeca];
    for (mov of direcoes)
        redondezas.push([cabeca[0] + mov[0], cabeca[1] + mov[1]]);

    do {
        novaPos = [Math.floor((Math.random() * (MAX_ALTURA - 1))), Math.floor((Math.random() * (MAX_LARGURA - 1)))];
    } while (estaContida(novaPos, pessoas) || estaContida(novaPos, gasolinas) || estaContida(novaPos, corpo) || estaContida(novaPos, redondezas));
    
    return(novaPos);
}

function posicaoValida()
{
    // bool
    // retorna se a posicao da cabeca esta dentro do jogo, se nao acabou de atroplar um pessoas e se nao acabou de passar por dentro do proprio corpo;

    let x = cabeca[0]; 
    let y = cabeca[1];
    return(x >= 0 && y >= 0 && x < MAX_ALTURA && y < MAX_LARGURA && !estaContida([x, y], pessoas) && !estaContida(cabeca, corpo));
}

function estaContida(oque, onde) {
    // bool
    // o .includes() normal do js nao consegue checar se uma array ta contida em outra array, ele sempre retorna falso;
    // como eu regularmente preciso testar isso com as arrays de posicao (pares), essa funcao testa so pra pares de valores.
    // nao sei fazer isso no js com complexidade melhor que O(n) entao fodase;

    for (par of onde)
        if (par[0] == oque[0] && par[1] == oque[1]) return true;

    return false;
}

function removeDe(oque, onde) {
    // array (array de par de posicao [x, y])
    // ter que fazer uma funcao pra isso tem a mesma razao do porque da funcao estaContida(). nao sei como passar parametro por referencia em js entao acho que isso
    // aqui ta meio burro mas fodase. 

    resp = [];
    for (par of onde)
        if (!(par[0] == oque[0] && par[1] == oque[1])) resp.push(par);

    console.log(resp);
    return resp
}

function checaPessoa() {
    // void
    // testa se nas duas casas nas laterais da cabeca tem pessoas;
    // adiciona um no contador de pessoas (a variavel global filaPessoas). o contador eh lidado na funcao de atualizar no proximo frame;
    // gera novas pessoas;

    let vizinhos = [];
    if (direcao[0] == 0) vizinhos = [[-1, 0], [1, 0]];
    else if (direcao[1] == 0) vizinhos = [[0, 1], [0, -1]];

    for (mov of vizinhos)
    {
        let viz = [cabeca[0] + mov[0], cabeca[1] + mov[1]];
        if (viz[0] < 0 || viz[1] < 0 || viz[0] >= MAX_ALTURA || viz[1] >= MAX_LARGURA) continue;
        if (estaContida([viz[0], viz[1]], pessoas))
        {
            filaPessoas += 1;
            pessoas = removeDe(viz, pessoas)
            pessoas.push(novoRandom());
        }
    }
}

function checaGasolina() {
    // void
    // checa se uma gasolinas foi consumida (a nova posicao da cabeca contem) e resolve caso sim.

    for (g of gasolinas)
        if (g[0] == cabeca[0] && g[1] == cabeca[1])
        {
            combustivel = MAX_COMBUSTIVEL;
            gasolinas = removeDe(g, gasolinas);
            gasolinas.push(novoRandom());
        }
}

// as tres funcoes daqui pra baixo servem pra ver o jogo em texto. so elas vao ter que ser alteradas pra funcionar em canvas ou divs.
function figuraCorpo(i) {
    
    if (i == corpo.length - 1) return "b";
    return("#");
}

function atualizaMapa()
{
    for (let i = 0; i < MAX_ALTURA; i++)
        for (let j = 0; j < MAX_LARGURA; j++)
            mapa[i][j] = ".";

    for (let i = 0; i < corpo.length; i++)
        mapa[corpo[i][0]][corpo[i][1]] = figuraCorpo(i);

    for (p of pessoas)
        mapa[p[0]][p[1]] = "p";

    for (g of gasolinas)
        mapa[g[0]][g[1]] = "g";
    
    mapa[cabeca[0]][cabeca[1]] = "@";
}

function printaMapa()
{
    let resp = "";
    for (let i = 0; i < MAX_ALTURA; i++)
    {
        for (let j = 0; j < MAX_LARGURA; j++)
            resp += mapa[i][j];
        resp += "\n";
    }

    console.log(resp);
    document.querySelector("#mapa").textContent = resp;
    document.querySelector("#tanque").textContent = `tanque: ${combustivel}`;
    document.querySelector("#tamanho").textContent = `tamanho: ${corpo.length}`;
}

let desenhos = {
    celulaAltura: canvas.height / MAX_ALTURA,
    celulaLargura: canvas.width / MAX_LARGURA,
    
    desenhaFundo: function (i, j) {
        // TODO: definir se so isso ta ok ou criar um cenario.
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.fillRect(j * this.celulaLargura, i * this.celulaAltura, this.celulaLargura, this.celulaAltura);
        ctx.lineWidth = 0.25;
        ctx.strokeStyle = "black";
        ctx.strokeRect(j * this.celulaLargura, i * this.celulaAltura, this.celulaLargura, this.celulaAltura);
        ctx.closePath();
    },

    anguloPelaDirecao: function (dir) {
        if (dir[0] == 0)
            if (dir[1] == 1) return 90; else return 270;
        else
            if (dir[0] == 1) return 180; else return 0;
    },

    desenhaPessoa: function (i, j) {
        // TODO: randomizar a imagem das pessoas. acho que ter umas 10 possiveis configuracoes em imagens.
        let img = document.querySelector("#imagens #pessoas");
        ctx.drawImage(img, j * this.celulaLargura, i * this.celulaAltura, this.celulaLargura, this.celulaAltura);
    },

    desenhaGasolina: function (i, j) {
        let img = document.querySelector("#imagens #gasolina");
        ctx.drawImage(img, j * this.celulaLargura, i * this.celulaAltura, this.celulaLargura, this.celulaAltura);
    },

    desenhaCorpo: function (i, j) {
        // TODO: obviamente usar img definir a orientacao do corpo e usar css transform pra orientar a imagem. 
        ctx.beginPath();
        ctx.fillStyle = "gray";
        ctx.fillRect(j * this.celulaLargura, i * this.celulaAltura, this.celulaLargura, this.celulaAltura);
        ctx.closePath();
    },

    desenhaCabeca: function () {
        // TODO: canvas nao funciona com esse rotate do css. 
        // TODO: acho que a resposta ta aqui https://www.dynamsoft.com/codepool/how-to-rotate-image-with-javascript.html mas quero dormir.
        let img = document.querySelector("#imagens #cabeca");
        img.style.transform = 'rotate(' + this.anguloPelaDirecao(direcao) + 'deg)'
        let ni = document.querySelector("#imagens #cabeca");
        ctx.drawImage(ni, cabeca[1] * this.celulaLargura, cabeca[0] * this.celulaAltura, this.celulaLargura, this.celulaAltura);
    }
}

function atualizaCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < MAX_ALTURA; i++)
        for (let j = 0; j < MAX_LARGURA; j++)
            desenhos.desenhaFundo(i, j)

    for (p of pessoas)
        desenhos.desenhaPessoa(p[0], p[1]);

    for (g of gasolinas)    
        desenhos.desenhaGasolina(g[0], g[1]);

    for (c of corpo)
        desenhos.desenhaCorpo(c[0], c[1]);

    desenhos.desenhaCabeca();
    // TODO: alguma coisa pra manter controle do combustivel. seria legal uma barra na direia que diminui com o tempo.
}