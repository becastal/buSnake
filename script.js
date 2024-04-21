const MAX_ALTURA = 16;
const MAX_LARGURA = 16;
const MAX_PESSOAS = 3;
const MAX_GASOLINAS = 1;
const MAX_COMBUSTIVEL = 80;
const VELOCIDADE = 200;
const canvas = document.querySelector("canvas#jogo");
const ctx = canvas.getContext("2d");
let direcoes = [[-1, 0], [1, 0], [0, 1], [0, -1]];
let compasso = { "-1,0":"[↑] norte", "1,0":"[↓] sul", "0,1":"[→] leste", "0,-1":"[←] oeste" };
let mapa = [];
let cabeca = [];
let corpo = [];
let pessoas = [];
let gasolinas = [];
let direcao = [];
let filaPessoas = 0;
let combustivel = 0;
let relogio = 0;
let abastecimentos = 0;
let skin = "metro";
// TODO: trocar alguns desses valores iniciais a partir de um menu inicial!

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
    else if (e.code = "KeyR")
        if (acabouJogo()) inicioDeJogo();

}

inicioDeJogo();
function inicioDeJogo() 
{
    // void
    // constroe mapa e inicia valores fundamentais.

    document.querySelector("#fimDeJogo").style.visibility = "hidden";
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
    relogio = 0;
    abastecimentos = 0;
    
    for (imagem of document.querySelectorAll("#skinCobra img"))
        imagem.src = `./images/${skin}/${imagem.id}.png`;

    pessoas = [];
    for (let i = 0; i < MAX_PESSOAS; i++)
        pessoas.push(novoRandom()), pessoas[i].push(Math.floor(Math.random() * 10));
    
    gasolinas = [];
    for (let i = 0; i < MAX_GASOLINAS; i++)
        gasolinas.push(novoRandom());

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
    atualizaCanvas();
    relogio++;
}

function acabouJogo() 
{
    // bool
    // retorna se o jogo acabou, ou por falta de gasolina ou por colisao da cabeca;

    return combustivel <= 0 || !posicaoValida();
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
            pessoas[pessoas.length - 1].push(Math.floor(Math.random() * 10));
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
            abastecimentos++;
        }
}

let desenhos = {
    celulaAltura: canvas.height / MAX_ALTURA,
    celulaLargura: canvas.width / MAX_LARGURA,
    
    desenhaInformacoes: function () {
        let medidor = document.querySelector("#medidor");
        let medicao = (MAX_COMBUSTIVEL - combustivel) * (canvas.height / MAX_COMBUSTIVEL);
        medidor.style.top = `${medicao}px`;
        medidor.style.height = `${800 - medicao}px`;
        medidor.innerHTML = `${combustivel}/${MAX_COMBUSTIVEL}`
        document.querySelector("#tamanho").innerHTML = `tamanho: ${corpo.length + 1} pessoas.`;
        document.querySelector("#relogio").innerHTML = `tempo de jogo: ${(relogio * VELOCIDADE / 1000).toFixed(2)} s.`;
        document.querySelector("#abastecimentos").innerHTML = `abastecimentos: ${abastecimentos}.`;
        let estadoTanque, corEstado;
        if (combustivel >= 3/4*(MAX_COMBUSTIVEL))
            estadoTanque = "otimo", corEstado = "darkgreen";
        else if (combustivel >= 1/4*(MAX_COMBUSTIVEL))
            estadoTanque = "decente", corEstado = "yellow";
        else
            estadoTanque = "ruim", corEstado = "red";
        
        document.querySelector("#estadoTanque span").innerHTML = estadoTanque;
        document.querySelector("#estadoTanque span").style.color = corEstado;
        document.querySelector("#medidor").style.backgroundColor = corEstado;
        document.querySelector("#direcao").innerHTML = `direcao: ${compasso[direcao.toString()]}`;

    },
    
    desenhaFundo: function (i, j) {
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.fillRect(j * this.celulaLargura, i * this.celulaAltura, this.celulaLargura, this.celulaAltura);
        ctx.lineWidth = 0.25;
        ctx.strokeStyle = "black";
        ctx.strokeRect(j * this.celulaLargura, i * this.celulaAltura, this.celulaLargura, this.celulaAltura);
        ctx.closePath();
    },

    desenhaPessoa: function (i, j, r) {
        let img = document.querySelector(`#imagens #pessoas${r}`);
        ctx.drawImage(img, j * this.celulaLargura, i * this.celulaAltura, this.celulaLargura, this.celulaAltura);
    },

    desenhaGasolina: function (i, j) {
        let img = document.querySelector("#imagens #gasolina");
        ctx.drawImage(img, j * this.celulaLargura, i * this.celulaAltura, this.celulaLargura, this.celulaAltura);
    },

    desenhaCabeca: function () {
        let bunda = corpo[corpo.length - 1];
        let anterior = [0, 0];
        if (corpo.length == 1) 
            anterior = cabeca;
        else
            anterior = corpo[corpo.length - 2];
        
        dir = [ bunda[0] - anterior[0] , bunda[1] - anterior[1] ]
        let img = document.querySelector(`#imagens #cabeca${anguloPelaDirecao(dir)}`);
        ctx.drawImage(img, bunda[1] * this.celulaLargura, bunda[0] * this.celulaAltura, this.celulaLargura, this.celulaAltura)
    },

    desenhaCorpo: function (i, j, idx) {
        if (idx == corpo.length - 1) return;

        let anterior = [0, 0];
        if (idx == 0)
            anterior = cabeca;
        else
            anterior = corpo[idx - 1];
            
        let posterior = corpo[idx + 1];

        if (posterior[0] - anterior[0] == 0 || posterior[1] - anterior[1] == 0)
        {
            dir = [i - anterior[0] , j - anterior[1]]
            let img = document.querySelector(`#imagens #corpo${anguloPelaDirecao(dir)}`);
            ctx.drawImage(img, j * this.celulaLargura, i * this.celulaAltura, this.celulaLargura, this.celulaAltura)
        }
        else
        {
            pos = [posterior[0] - i, posterior[1] - j];
            ant = [anterior[0] - i, anterior[1] - j];
            let angulo = 0;
            if (estaContida([0, 1], [pos, ant]))
                if (estaContida([1, 0], [pos, ant]))
                    angulo = 270;
                else
                    angulo = 180;
            else
                if (estaContida([1, 0], [pos, ant]))
                    angulo = 0;
                else
                    angulo = 90;

            let img = document.querySelector(`#imagens #dobra${angulo}`);
            ctx.drawImage(img, j * this.celulaLargura, i * this.celulaAltura, this.celulaLargura, this.celulaAltura)            
        }
    },

    desenhaBunda: function () {
        let img = document.querySelector(`#imagens #cabeca${anguloPelaDirecao(direcao)}`);
        ctx.drawImage(img, cabeca[1] * this.celulaLargura, cabeca[0] * this.celulaAltura, this.celulaLargura, this.celulaAltura)
    }
}

function anguloPelaDirecao(dir) {
    if (dir[0] == 0)
        if (dir[1] == 1) return 90; else return 270;
    else
        if (dir[0] == 1) return 180; else return 0;
}  

function atualizaCanvas() {
    // void
    // atualiza o canvas a partir dos valores das variaveis globais.
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < MAX_ALTURA; i++)
        for (let j = 0; j < MAX_LARGURA; j++)
            desenhos.desenhaFundo(i, j)

    for (p of pessoas)
        desenhos.desenhaPessoa(p[0], p[1], p[2]); // o teceiro parametro (p[2]) eh a "skin" aleatoria da pessoa que foi gerada assim que o endereco da pessoa foi.

    for (g of gasolinas)    
        desenhos.desenhaGasolina(g[0], g[1]);

    for (let i = 0; i < corpo.length; i++)
        desenhos.desenhaCorpo(corpo[i][0], corpo[i][1], i);

    desenhos.desenhaInformacoes();
    desenhos.desenhaBunda();
    desenhos.desenhaCabeca();
}

function fimDeJogo() 
{
    let mensagem = "", fimId = 0;
    if (estaContida(cabeca, corpo)) 
        mensagem = "voce nao pode se acertar!", fimId = 0;
    else if (estaContida(cabeca, pessoas)) 
        mensagem = "voce nao pode atropelar ninguem!", fimId = 1;
    else if (combustivel <= 0) 
        mensagem = "voce nao pode deixar o seu tanque acabar!", fimId = 2;
    else
        mensagem = "se mantenha dentro da cidade!", fimId = 3;

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    
    // um pouco de magia rgb pra deixar tudo em preto e branco
    for (var i = 0; i < data.length; i += 4) {
        var grayscale = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]; // sinceramente sei la que numeros sao esses valeu GPT
    
        data[i] = grayscale;         // vermelho
        data[i + 1] = grayscale;     // verde
        data[i + 2] = grayscale;     // azul
    }
    ctx.putImageData(imageData, 0, 0);
    document.querySelector("#medidor").style.backgroundColor = "grey";

    fim = document.querySelector("#fimDeJogo");
    fim.style.visibility = "visible";
    fim.querySelector(".mensagem").textContent = mensagem;
    fim.querySelector("#imgFim").src = `./images/fim/${fimId}.png`;
    fim.querySelector(".tamanho").innerHTML = `tamanho: ${corpo.length + 1} pessoas.`;
    fim.querySelector(".relogio").innerHTML = `tempo de jogo: ${(relogio * VELOCIDADE / 1000).toFixed(2)} s.`;
    fim.querySelector(".abastecimentos").innerHTML = `abastecimentos: ${abastecimentos}.`;
    console.log(`VOCE PERDEU: ${mensagem}`);
}