const MAX_ALTURA = 16;
const MAX_LARGURA = 16;
const MAX_PESSOAS = 3;
const MAX_GASOLINAS = 1;
const MAX_COMBUSTIVEL = 80;
const VELOCIDADE = 200;
const canvas = document.querySelector("canvas#jogo");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
let direcoes = [[-1, 0], [1, 0], [0, 1], [0, -1]];
let compasso = { "-1,0":"[↑] Norte", "1,0":"[↓] Sul", "0,1":"[→] Leste", "0,-1":"[←] Oeste" };
let podeMudarDirecao = true;
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

document.addEventListener("keydown", logKey);
document.querySelector("#fecha").addEventListener("click", function() { inicioDeJogo() });
document.querySelector("#reiniciar").addEventListener("click", function() { inicioDeJogo() });
document.querySelector("#voltarMenu").addEventListener("click", function() { window.location.href = "../Home/index.html" });

function logKey(e) {
    if (["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", "KeyW", "KeyS", "KeyD", "KeyA"].includes(e.code))
    {
        e.preventDefault();
        if (!podeMudarDirecao) return;
        let direcaoAntiga = direcao;
        if (e.code == "ArrowUp" || e.code == "KeyW") direcao = [-1, 0];
        if (e.code == "ArrowDown" || e.code == "KeyS") direcao = [1, 0];
        if (e.code == "ArrowRight" || e.code == "KeyD") direcao = [0, 1];
        if (e.code == "ArrowLeft" || e.code == "KeyA") direcao = [0, -1];
        if (-direcaoAntiga[0] == direcao[0] && -direcaoAntiga[1] == direcao[1]) direcao = direcaoAntiga;
        podeMudarDirecao = false;
    }
}

inicioDeJogo();
function inicioDeJogo() 
{
    // void
    // constroe mapa e inicia valores fundamentais.

    document.querySelector("#fimDeJogo").style.visibility = "hidden";
    for (let i = 0; i < MAX_ALTURA; i++)  
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
    // funcao recursiva que permite o Jogo ir se atualizando.

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
    // funcao que atualiza tudo que acontece em um so frame do Jogo;
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
    podeMudarDirecao = true;
}

function acabouJogo() 
{
    // bool
    // retorna se o Jogo acabou, ou por falta de gasolina ou por colisao da cabeca;

    return combustivel <= 0 || !posicaoValida();
}

function novoRandom() 
{
    // array (par de posicao [x, y])
    // funcao para gerar uma nova posicao aleatoria que nao esta ocupada
    //   o outro jeito eh ter uma array de todas as posicoes possiveis e pegar uma posicao aleatoria dentro dessa array. mas isso eh O(max_altura * max_largura)
    //   pra gerar essa array e testar dentro dela necessariamente. desse jeito aqui agora eh O(sorte) o que eh BEM mais daora;
    // mas vale dizer que tambem existe um mundo em que eh impossivel sair dessa funcao. podemos estar vivendo nele ou nao. nao sei;
    
    let redondezas = [cabeca];
    for (mov of direcoes)
        redondezas.push([cabeca[0] + mov[0], cabeca[1] + mov[1]]);

    do {
        var novaPos = [Math.floor((Math.random() * (MAX_ALTURA - 1))), Math.floor((Math.random() * (MAX_LARGURA - 1)))];
    } while (estaContida(novaPos, pessoas) || estaContida(novaPos, gasolinas) || estaContida(novaPos, corpo) || estaContida(novaPos, redondezas));
    
    return(novaPos);
}

function posicaoValida()
{
    // bool
    // retorna se a posicao da cabeca esta dentro do Jogo, se nao acabou de atroplar as pessoas e se nao acabou de passar por dentro do proprio corpo;

    let x = cabeca[0]; 
    let y = cabeca[1];
    return(x >= 0 && y >= 0 && x < MAX_ALTURA && y < MAX_LARGURA && !estaContida([x, y], pessoas) && !estaContida(cabeca, corpo));
}

function estaContida(oque, onde) {
    // bool
    // o .includes() normal do js nao consegue checar se uma array ta contida em outra array, ele sempre retorna falso;
    // como eu regularmente preciso testar isso com as arrays de posicao (pares), essa funcao testa so pra pares de valores.
    // nao sei fazer isso no js com complexidade melhor que O(n);

    for (par of onde)
        if (par[0] == oque[0] && par[1] == oque[1]) return true;

    return false;
}

function removeDe(oque, onde) {
    // array (array de par de posicao [x, y])
    // ter que fazer uma funcao pra isso tem a mesma razao do porque da funcao estaContida(). nao sei como passar parametro por referencia em js entao acho que isso

    let resp = [];
    for (par of onde)
        if (!(par[0] == oque[0] && par[1] == oque[1])) resp.push(par);

    return resp
}

function checaPessoa() {
    // void
    // testa se nas duas casas nas laterais da cabeca tem pessoas;
    // adiciona um no contador de pessoas (a variavel global filaPessoas). o contador eh lidado na funcao de atualiza no proximo frame;
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
            pessoas[pessoas.length - 1].push(Math.floor(Math.random() * 6));
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
    // classe pras interacoes de desenho com o canvas.
    // as atualizacoes dos valores em volta do canvas tambem estao majoritariamente aqui (o resto ta em fimDeJogo)

    celulaAltura: canvas.height / MAX_ALTURA,
    celulaLargura: canvas.width / MAX_LARGURA,
    
    desenhaInformacoes: function () {
        // atualiza valores em volta do canvas;
        let medidor = document.querySelector("#medidor");
        let medicao = (MAX_COMBUSTIVEL - combustivel) * (canvas.height / MAX_COMBUSTIVEL);
        medidor.style.top = `${medicao}px`;
        medidor.style.height = `${800 - medicao}px`;
        medidor.innerHTML = `${combustivel}/${MAX_COMBUSTIVEL}`
        document.querySelector("#tamanho").innerHTML = `Tamanho: ${corpo.length + 1} pessoas`;
        document.querySelector("#relogio").innerHTML = `Tempo de jogo: ${(relogio * VELOCIDADE / 1000).toFixed(1)} s`;
        document.querySelector("#abastecimentos").innerHTML = `Abastecimentos: ${abastecimentos}`;
        let estadoTanque, corEstado;
        if (combustivel >= 3/4*(MAX_COMBUSTIVEL))
            estadoTanque = "Cheio", corEstado = "green";
        else if (combustivel >= 1/4*(MAX_COMBUSTIVEL))
            estadoTanque = "Metade", corEstado = "yellow";
        else
            estadoTanque = "Baixo", corEstado = "red";
        
        document.querySelector("#estadoTanque span").innerHTML = estadoTanque;
        document.querySelector("#estadoTanque span").style.color = corEstado;
        document.querySelector("#medidor").style.backgroundColor = corEstado;
        document.querySelector("#direcao").innerHTML = `Direção: ${compasso[direcao.toString()]}`;

    },
    
    desenhaFundo: function (i, j) {
        // pinta todo o fundo de branco com quadrados.
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.fillRect(j * this.celulaLargura, i * this.celulaAltura, this.celulaLargura, this.celulaAltura);
        ctx.lineWidth = 0.25;
        ctx.strokeStyle = "black";
        ctx.strokeRect(j * this.celulaLargura, i * this.celulaAltura, this.celulaLargura, this.celulaAltura);
        ctx.closePath();
    },

    desenhaPessoa: function (i, j, r) {
        // desenha uma pessoa. r eh o valor gerado aleatoriamente quando a pessoa foi criada que indica qual imagem vai ser atribuida aquela pessoa.
        let img = document.querySelector(`#imagens #pessoas${r}`);
        ctx.drawImage(img, j * this.celulaLargura, i * this.celulaAltura, this.celulaLargura, this.celulaAltura);
    },

    desenhaGasolina: function (i, j) {
        let img = document.querySelector("#imagens #gasolina");
        ctx.drawImage(img, j * this.celulaLargura, i * this.celulaAltura, this.celulaLargura, this.celulaAltura);
    },

    desenhaBunda: function () {
        // desenha a ultima parte do corpo com a orientacao necessaria.
        // nao tao trivial saber a direcao da bunda, ja que ela segue a penultima parte do corpo (que pode ser a cabeca)
        let bunda = corpo[corpo.length - 1];
        let anterior = [0, 0];
        if (corpo.length == 1) 
            anterior = cabeca;
        else
            anterior = corpo[corpo.length - 2];
        
        let dir = [ bunda[0] - anterior[0] , bunda[1] - anterior[1] ]
        let img = document.querySelector(`#imagens #cabeca${anguloPelaDirecao(dir)}`);
        ctx.drawImage(img, bunda[1] * this.celulaLargura, bunda[0] * this.celulaAltura, this.celulaLargura, this.celulaAltura)
    },

    desenhaCorpo: function (i, j, idx) {
        // desenha cada celula do corpo a partir da orientacao necessaria. eh preciso do idx aqui pra saber qual a posicao do corpo que antecede a atual e a que sucede.
        if (idx == corpo.length - 1) return; // caso em que a unica parte do corpo eh a bunda (resolvido no desenhaBunda)

        let anterior = [0, 0];
        if (idx == 0)
            anterior = cabeca;
        else
            anterior = corpo[idx - 1];
            
        let posterior = corpo[idx + 1];

        if (posterior[0] - anterior[0] == 0 || posterior[1] - anterior[1] == 0)
        {
            // aqui lida com os casos em que o corpo tem que ser mostrado na horizontal ou vertical (se o anterior e o posterior tem a mesma linha ou mesma coluna)
            let dir = [i - anterior[0] , j - anterior[1]]
            let img = document.querySelector(`#imagens #corpo${anguloPelaDirecao(dir)}`);
            ctx.drawImage(img, j * this.celulaLargura, i * this.celulaAltura, this.celulaLargura, this.celulaAltura)
        }
        else
        {
            // aqui lida com os casos em que deve ser mostrada uma dobra. 
            let pos = [posterior[0] - i, posterior[1] - j];
            let ant = [anterior[0] - i, anterior[1] - j];
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

    desenhaCabeca: function () {
        // mais trivial dos desenhos. a cabeca segue sempre a direcao.
        let img = document.querySelector(`#imagens #cabeca${anguloPelaDirecao(direcao)}`);
        ctx.drawImage(img, cabeca[1] * this.celulaLargura, cabeca[0] * this.celulaAltura, this.celulaLargura, this.celulaAltura)
    }
}

function anguloPelaDirecao(dir) {
    // int
    // nao da pra fazer um dicionario de array -> int (como map<pair<int, int>, int> no c++) entao essa aqui eh uma solucao.

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
    // void
    // funcao que anima o final do Jogo;

    let mensagem = "", imgFim = "";
    if (estaContida(cabeca, corpo))
        mensagem = "Você bateu em si mesmo!";
    else if (estaContida(cabeca, pessoas))
        mensagem = "Você atropelou uma pessoa!";
    else if (combustivel <= 0)
        mensagem = "Seu combustível se esgotou!";
    else
        mensagem = "Você saiu da cidade!";

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    
    // um pouco de magia rgb pra deixar tudo em preto e branco
    for (var i = 0; i < data.length; i += 4) {
        var grayscale = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    
        data[i] = grayscale;         // vermelho
        data[i + 1] = grayscale;     // verde
        data[i + 2] = grayscale;     // azul
    }
    ctx.putImageData(imageData, 0, 0);
    document.querySelector("#medidor").style.backgroundColor = "grey";

    let fim = document.querySelector("#fimDeJogo");
    fim.style.visibility = "visible";
    fim.querySelector(".mensagem").textContent = mensagem;
    fim.querySelector("#imgFim").src = "./images/fim/fim.png";
    fim.querySelector(".tamanho").innerHTML = `Tamanho: ${corpo.length + 1} pessoas.`;
    fim.querySelector(".relogio").innerHTML = `Tempo de jogo: ${(relogio * VELOCIDADE / 1000).toFixed(2)} s.`;
    fim.querySelector(".abastecimentos").innerHTML = `Abastecimentos: ${abastecimentos}.`;

    let tituloLucro = "", mensagemLucro = "", conteudoLucro = "", imgLucro = "";
    if (abastecimentos == 0 || (corpo.length + 1) / abastecimentos >= 5)
    {
        tituloLucro = "Você lucrou!";
        mensagemLucro = "Seu emprego foi mantido!";
        conteudoLucro = "você foi eficiente com o combustíel!\n A sua contratante ainda quer os seus serviços!.";
        imgLucro = "./images/fim/lucrou.png";
    }
    else
    {
        tituloLucro = "Você NÃO lucrou!";
        mensagemLucro = "Você foi despedido!";
        conteudoLucro = "você não foi eficiente com o combustíel, gerando alta despesa!\n A sua contratante não precisa mais de você.";
        imgLucro = "./images/fim/faliu.png";
    }

    fim.querySelector("#lucro .titulo").textContent = tituloLucro;
    fim.querySelector("#lucro .mensagem").textContent = mensagemLucro;
    fim.querySelector("#lucro .conteudo").textContent = conteudoLucro;
    fim.querySelector("#lucro #imgLucro").src = imgLucro;
}
