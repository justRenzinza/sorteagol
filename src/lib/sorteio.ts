// src/lib/sorteio.ts - DISTRIBUIÇÃO BALANCEADA GARANTIDA
export interface Jogador {
    nome: string;
    original: string;
    isCapitao: boolean;
}

export interface Conflito {
    jogador1: string;
    jogador2: string;
}

export interface Equipe {
    id: number;
    nome: string;
    jogadores: Jogador[];
    capitao?: Jogador;
}

export interface ResultadoSorteio {
    equipes: Equipe[];
    erros: string[];
    sucesso: boolean;
}

// Shuffle Fisher-Yates
function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Parseia jogadores (detecta MAIÚSCULO = capitão)
function parseJogadores(nomesTexto: string): Jogador[] {
    return nomesTexto
        .split('\n')
        .map(linha => linha.trim())
        .filter(linha => linha)
        .map(original => {
            const isCapitao = original === original.toUpperCase() && /[A-Z]/.test(original);
            return {
                nome: original.toLowerCase(),
                original,
                isCapitao
            };
        });
}

// 🔥 NOVO parseConflitos: GRUPOS separados por linha em branco
// Dentro de cada grupo, gera TODOS os pares de conflito
function parseConflitos(conflitosTexto: string): Conflito[] {
    const conflitos: Conflito[] = [];

    // Divide por linhas em branco → cada bloco é um grupo
    const grupos = conflitosTexto
        .split(/\n\s*\n/)
        .map(grupo => grupo.trim())
        .filter(grupo => grupo);

    grupos.forEach(grupo => {
        const nomes: string[] = [];

        grupo.split('\n').forEach(linha => {
            const limpinha = linha.trim();
            if (!limpinha) return;

            // Suporta vírgula também: "renzo, vitão"
            if (limpinha.includes(',')) {
                limpinha.split(',')
                    .map(n => n.trim().toLowerCase())
                    .filter(n => n)
                    .forEach(n => nomes.push(n));
            } else {
                nomes.push(limpinha.toLowerCase());
            }
        });

        // Gera TODOS os pares dentro do grupo (combinações)
        for (let i = 0; i < nomes.length; i++) {
            for (let j = i + 1; j < nomes.length; j++) {
                conflitos.push({ jogador1: nomes[i], jogador2: nomes[j] });
            }
        }
    });

    return conflitos;
}

// Verifica se dois jogadores têm conflito
function temConflito(j1: string, j2: string, conflitos: Conflito[]): boolean {
    return conflitos.some(c =>
        (c.jogador1 === j1 && c.jogador2 === j2) ||
        (c.jogador1 === j2 && c.jogador2 === j1)
    );
}

// NOVA FUNÇÃO: Distribui ROUND-ROBIN balanceado
function distribuirJogadores(
    jogadores: Jogador[],
    numEquipes: number,
    conflitos: Conflito[]
): Jogador[][] {
    const equipes: Jogador[][] = Array.from({ length: numEquipes }, () => []);
    const jogadoresPorEquipe = Math.floor(jogadores.length / numEquipes);
    const sobra = jogadores.length % numEquipes;

    const tamanhosTarget = Array.from({ length: numEquipes }, (_, i) =>
        i < sobra ? jogadoresPorEquipe + 1 : jogadoresPorEquipe
    );

    console.log('🎯 Tamanhos target:', tamanhosTarget);

    const capitaes = shuffle(jogadores.filter(j => j.isCapitao));
    const normais = shuffle(jogadores.filter(j => !j.isCapitao));

    // 1. Distribui capitães primeiro (1 por equipe se possível)
    capitaes.forEach((capitao, i) => {
        if (i < numEquipes) {
            equipes[i].push(capitao);
        }
    });

    // 2. Capitães extras vão pros normais
    const capitaesExtras = capitaes.slice(numEquipes);
    const todosNormais = [...normais, ...capitaesExtras];

    // 3. DISTRIBUIÇÃO ROUND-ROBIN RESPEITANDO CONFLITOS
    let equipeAtual = 0;
    const jogadoresNaoAlocados: Jogador[] = [];

    for (const jogador of todosNormais) {
        let tentativas = 0;
        let alocado = false;

        while (tentativas < numEquipes && !alocado) {
            const idx = (equipeAtual + tentativas) % numEquipes;
            const equipe = equipes[idx];
            const tamanhoTarget = tamanhosTarget[idx];

            if (equipe.length >= tamanhoTarget) {
                tentativas++;
                continue;
            }

            const possuiConflito = equipe.some(j => temConflito(jogador.nome, j.nome, conflitos));

            if (!possuiConflito) {
                equipes[idx].push(jogador);
                alocado = true;
                equipeAtual = (idx + 1) % numEquipes;
            } else {
                tentativas++;
            }
        }

        if (!alocado) {
            jogadoresNaoAlocados.push(jogador);
        }
    }

    // 4. SEGUNDA PASSAGEM: Aloca jogadores não alocados
    for (const jogador of jogadoresNaoAlocados) {
        const equipeMenor = equipes
            .map((eq, idx) => ({ eq, idx, tamanho: eq.length, target: tamanhosTarget[idx] }))
            .filter(e => e.tamanho < e.target)
            .sort((a, b) => a.tamanho - b.tamanho)[0];

        if (equipeMenor) {
            equipes[equipeMenor.idx].push(jogador);
            console.warn(`⚠️ Conflito inevitável: ${jogador.original} em Equipe ${equipeMenor.idx + 1}`);
        } else {
            const menorAbsoluta = equipes
                .map((eq, idx) => ({ eq, idx, tamanho: eq.length }))
                .sort((a, b) => a.tamanho - b.tamanho)[0];
            equipes[menorAbsoluta.idx].push(jogador);
        }
    }

    equipes.forEach((eq, idx) => {
        console.log(`✅ Equipe ${idx + 1}: ${eq.length} jogadores (target: ${tamanhosTarget[idx]})`);
    });

    return equipes;
}

// Função principal
export function sortearEquipes(
    nomesTexto: string,
    conflitosTexto: string,
    numEquipes: number,
    jogadoresPorEquipe?: number
): ResultadoSorteio {
    const erros: string[] = [];

    if (!nomesTexto.trim()) {
        return { equipes: [], erros: ['Nenhum jogador informado'], sucesso: false };
    }

    if (numEquipes < 2 || numEquipes > 10) {
        return { equipes: [], erros: ['Número de equipes deve estar entre 2 e 10'], sucesso: false };
    }

    const jogadores = parseJogadores(nomesTexto);
    const conflitos = parseConflitos(conflitosTexto);

    console.log('🔍 Conflitos detectados:', conflitos);

    if (jogadores.length < numEquipes) {
        return {
            equipes: [],
            erros: [`Mínimo ${numEquipes} jogadores para ${numEquipes} equipes`],
            sucesso: false
        };
    }

    const equipesArray = distribuirJogadores(jogadores, numEquipes, conflitos);

    const nomesCores = ['Caça', 'Cão', 'Roca', 'Gay'];

    const equipes: Equipe[] = equipesArray.map((jogadores, idx) => {
        const capitao = jogadores.find(j => j.isCapitao);
        return {
            id: idx + 1,
            nome: `Equipe ${nomesCores[idx] || idx + 1}`,
            jogadores,
            capitao
        };
    });

    return { equipes, erros, sucesso: true };
}
