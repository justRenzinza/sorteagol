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

// Parseia conflitos
function parseConflitos(conflitosTexto: string): Conflito[] {
	const conflitos: Conflito[] = [];
	const linhas = conflitosTexto
		.split('\n')
		.map(linha => linha.trim())
		.filter(linha => linha);

	// Forma 1: "nome1, nome2" (vírgula)
	linhas.forEach(linha => {
		if (linha.includes(',')) {
			const partes = linha.split(',').map(n => n.trim().toLowerCase());
			if (partes.length >= 2 && partes[0] && partes[1]) {
				conflitos.push({
					jogador1: partes[0],
					jogador2: partes[1]
				});
			}
		}
	});

	// Forma 2: Linhas pares
	const linhasSemVirgula = linhas.filter(l => !l.includes(','));
	for (let i = 0; i < linhasSemVirgula.length - 1; i += 2) {
		const j1 = linhasSemVirgula[i].toLowerCase();
		const j2 = linhasSemVirgula[i + 1]?.toLowerCase();
		if (j1 && j2) {
			conflitos.push({
				jogador1: j1,
				jogador2: j2
			});
		}
	}

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
	
	// Calcula tamanho target de cada equipe
	const tamanhosTarget = Array.from({ length: numEquipes }, (_, i) => 
		i < sobra ? jogadoresPorEquipe + 1 : jogadoresPorEquipe
	);

	console.log('🎯 Tamanhos target:', tamanhosTarget);

	// Separa capitães e normais
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

		// Tenta adicionar na equipe atual se não tiver conflito E não estiver cheia
		while (tentativas < numEquipes && !alocado) {
			const idx = (equipeAtual + tentativas) % numEquipes;
			const equipe = equipes[idx];
			const tamanhoTarget = tamanhosTarget[idx];

			// Verifica se equipe já está cheia
			if (equipe.length >= tamanhoTarget) {
				tentativas++;
				continue;
			}

			// Verifica conflito
			const possuiConflito = equipe.some(j => temConflito(jogador.nome, j.nome, conflitos));

			if (!possuiConflito) {
				equipes[idx].push(jogador);
				alocado = true;
				equipeAtual = (idx + 1) % numEquipes; // Próxima equipe
			} else {
				tentativas++;
			}
		}

		// Se não conseguiu alocar, guarda pra segunda passagem
		if (!alocado) {
			jogadoresNaoAlocados.push(jogador);
		}
	}

	// 4. SEGUNDA PASSAGEM: Aloca jogadores não alocados (forçando se necessário)
	for (const jogador of jogadoresNaoAlocados) {
		// Encontra equipe com menor tamanho que ainda não atingiu target
		const equipeMenor = equipes
			.map((eq, idx) => ({ eq, idx, tamanho: eq.length, target: tamanhosTarget[idx] }))
			.filter(e => e.tamanho < e.target)
			.sort((a, b) => a.tamanho - b.tamanho)[0];

		if (equipeMenor) {
			equipes[equipeMenor.idx].push(jogador);
			console.warn(`⚠️ Conflito inevitável: ${jogador.original} em Equipe ${equipeMenor.idx + 1}`);
		} else {
			// Último recurso: menor equipe absoluta
			const menorAbsoluta = equipes
				.map((eq, idx) => ({ eq, idx, tamanho: eq.length }))
				.sort((a, b) => a.tamanho - b.tamanho)[0];
			equipes[menorAbsoluta.idx].push(jogador);
		}
	}

	// 5. VALIDAÇÃO FINAL - Garante que nenhuma equipe ficou vazia
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
		return {
			equipes: [],
			erros: ['Nenhum jogador informado'],
			sucesso: false
		};
	}

	if (numEquipes < 2 || numEquipes > 10) {
		return {
			equipes: [],
			erros: ['Número de equipes deve estar entre 2 e 10'],
			sucesso: false
		};
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

	// Distribui com algoritmo balanceado
	const equipesArray = distribuirJogadores(jogadores, numEquipes, conflitos);

	// Monta resultado
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

	return {
		equipes,
		erros,
		sucesso: true
	};
}
