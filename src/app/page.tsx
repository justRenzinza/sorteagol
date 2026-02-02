// src/app/page.tsx - HTML-TO-IMAGE COM FONTE E LAYOUT DESKTOP
"use client";

import { useState, useEffect, useRef } from "react";
import { sortearEquipes, type ResultadoSorteio } from "@/lib/sorteio";
import { toPng } from 'html-to-image';

export default function Sorteagol() {
	const [nomes, setNomes] = useState("");
	const [conflitos, setConflitos] = useState("");
	const [equipes, setEquipes] = useState(2);
	const [porTime, setPorTime] = useState("");
	const [duplicados, setDuplicados] = useState<string[]>([]);
	const [resultado, setResultado] = useState<ResultadoSorteio | null>(null);
	const [copiado, setCopiado] = useState(false);
	const [mostrarAjuda, setMostrarAjuda] = useState(false);
	const [gerando, setGerando] = useState(false);
	
	const resultadoRef = useRef<HTMLDivElement>(null);

	const nomesCount = nomes.split('\n').filter(nome => nome.trim()).length;
	const conflitosCount = conflitos.split('\n').filter(conflito => conflito.trim()).length;

	useEffect(() => {
		const nomesLimpos = nomes.split('\n')
			.map(nome => nome.trim().toLowerCase())
			.filter(nome => nome);
		
		const countMap = new Map();
		const duplicadosList: string[] = [];

		nomesLimpos.forEach(nome => {
			countMap.set(nome, (countMap.get(nome) || 0) + 1);
		});

		countMap.forEach((count, nome) => {
			if (count > 1) {
				duplicadosList.push(nome);
			}
		});

		setDuplicados(duplicadosList);
	}, [nomes]);

	const handleSortear = () => {
		if (duplicados.length > 0) {
			alert(`⚠️ ${duplicados.length} nome${duplicados.length > 1 ? 's' : ''} duplicado${duplicados.length > 1 ? 's' : ''}! Remova antes de sortear.`);
			return;
		}

		const numPorTime = porTime ? Number(porTime) : undefined;
		const result = sortearEquipes(nomes, conflitos, equipes, numPorTime);
		
		if (result.sucesso) {
			setResultado(result);
		} else {
			alert(`Erro: ${result.erros.join(', ')}`);
		}
	};

	const handleLimpar = () => {
		setNomes("");
		setConflitos("");
		setEquipes(2);
		setPorTime("");
		setResultado(null);
		setDuplicados([]);
	};

	const handleCopiarTexto = () => {
		if (!resultado) return;

		let texto = "⚽ SORTEAGOL - Equipes Sorteadas ⚽\n\n";
		
		resultado.equipes.forEach((equipe, idx) => {
			texto += `${equipe.nome.toUpperCase()}\n`;
			equipe.jogadores.forEach(jogador => {
				const emoji = jogador.isCapitao ? "👑 " : "⚪ ";
				texto += `${emoji}${jogador.original}\n`;
			});
			texto += `Total: ${equipe.jogadores.length} jogadores\n\n`;
		});

		texto += "🎲 Sorteio feito em sorteagol.com";

		navigator.clipboard.writeText(texto).then(() => {
			setCopiado(true);
			setTimeout(() => setCopiado(false), 2000);
		});
	};

	// 🔥 FUNÇÃO COM FONTE PIXEL E LAYOUT DESKTOP
	const handleCompartilharImagem = async () => {
		if (!resultado || !resultadoRef.current) return;

		setGerando(true);

		try {
			// Detecta mobile
			const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
			
			// 🔥 AGUARDA FONTES CARREGAREM
			await document.fonts.ready;
			await new Promise(resolve => setTimeout(resolve, 800));
			
			// 🔥 Gera imagem COM FONTES (remove skipFonts)
			const dataUrl = await toPng(resultadoRef.current, {
				quality: 1,
				pixelRatio: isMobile ? 3 : 2,
				backgroundColor: '#000000',
				cacheBust: true,
			});

			// Converte para blob
			const response = await fetch(dataUrl);
			const blob = await response.blob();

			// MOBILE: Usa Web Share API
			if (isMobile && navigator.share) {
				try {
					const file = new File([blob], 'sorteagol-equipes.png', { type: 'image/png' });
					await navigator.share({
						title: 'Sorteagol - Equipes',
						text: 'Equipes sorteadas!',
						files: [file],
					});
				} catch (shareError) {
					console.log('Compartilhamento cancelado');
				}
			} 
			// DESKTOP: Copia direto pro clipboard
			else {
				try {
					const item = new ClipboardItem({ 'image/png': blob });
					await navigator.clipboard.write([item]);
					
					// Feedback visual
					setCopiado(true);
					setTimeout(() => setCopiado(false), 2000);
				} catch (clipboardError) {
					// Fallback: Download
					const link = document.createElement('a');
					link.download = 'sorteagol-equipes.png';
					link.href = dataUrl;
					link.click();
				}
			}
			
		} catch (error) {
			console.error('Erro ao gerar imagem:', error);
			alert('Erro ao gerar imagem. Tente novamente.');
		} finally {
			setGerando(false);
		}
	};

	const coresEquipes = [
		'from-blue-500 to-blue-700',
		'from-red-500 to-red-700',
		'from-green-500 to-green-700',
		'from-yellow-500 to-yellow-700',
	];

	return (
		<main className="w-full p-4 md:p-6 font-pixel">
			<div className="max-w-6xl mx-auto space-y-6">
				{/* Header COMPACTO */}
				<div className="text-center border-b-4 border-white pb-4">
					<h1 className="text-2xl md:text-3xl font-bold text-blue-400 mb-2 font-pixel">
						SORTEAGOL
					</h1>
					<p className="text-sm text-white">Crie equipes BALANCEADAS!</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* 1. Jogadores */}
					<div className="space-y-3">
						<label className="block text-base font-bold text-white mb-3 flex items-center font-pixel">
							<span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs mr-2 font-pixel text-white">1</span>
							Jogadores
						</label>
						<textarea
							value={nomes}
							onChange={(e) => setNomes(e.target.value)}
							rows={14}
							className="w-full p-3 bg-white/10 backdrop-blur-sm border-2 border-white/50 rounded-xl focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all resize-vertical text-white placeholder-gray-400 leading-relaxed text-sm"
							placeholder="Um nome por linha...
CAPITÃES EM MAIÚSCULO."
						/>
						<div className="text-right space-y-1">
							<span className="text-xs text-blue-300 font-mono font-pixel block">
								{nomesCount} jogador{nomesCount !== 1 ? 'es' : ''}
							</span>
							{duplicados.length > 0 && (
								<span className="text-xs text-orange-400 font-mono font-pixel block">
									⚠️ {duplicados.length} duplicado{duplicados.length > 1 ? 's' : ''}
								</span>
							)}
						</div>
					</div>

					{/* 2. Balanceamento COM BOTÃO AJUDA */}
					<div className="space-y-3">
						<label className="block text-base font-bold text-white mb-3 flex items-center font-pixel">
							<span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs mr-2 font-pixel text-white">2</span>
							Balanceamento
							{/* BOTÃO AJUDA */}
							<button
								onClick={() => setMostrarAjuda(true)}
								className="ml-2 w-5 h-5 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all"
								title="Como funciona?"
							>
								?
							</button>
						</label>
						<textarea
							value={conflitos}
							onChange={(e) => setConflitos(e.target.value)}
							rows={14}
							className="w-full p-3 bg-white/10 backdrop-blur-sm border-2 border-white/50 rounded-xl focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all resize-vertical text-white placeholder-gray-400 leading-relaxed text-sm"
							placeholder="Digite nomes em pares (2 linhas = 1 regra)

Ex: Renzo e Vitão não podem jogar juntos"
						/>
						<div className="text-right">
							<span className="text-xs text-blue-300 font-mono font-pixel">
								{conflitosCount} conflit{conflitosCount !== 1 ? 'os' : 'o'}
							</span>
						</div>
					</div>

					{/* 3. Config */}
					<div className="space-y-4">
						<div className="flex items-center mb-4 font-pixel">
							<span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
								<span className="text-xs font-pixel leading-none tracking-tight text-white">3</span>
							</span>
							<span className="text-base font-bold text-white font-pixel">Configuração</span>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-xs font-bold text-white mb-2 font-pixel">
									Equipes
								</label>
								<div className="grid grid-cols-3 gap-2">
									{[2,3,4].map(n => (
										<button
											key={n}
											onClick={() => setEquipes(n)}
											className={`p-2 border-2 rounded-xl font-bold text-xs transition-all h-12 flex items-center justify-center font-pixel ${
												equipes === n
													? 'bg-blue-500 border-blue-500 text-white shadow-lg'
													: 'bg-white/10 border-white/50 text-white hover:bg-white/20 hover:border-blue-400/50'
											}`}
										>
											{n}
										</button>
									))}
								</div>
							</div>

							<div>
								<label className="block text-xs font-bold text-white mb-2 font-pixel">
									Jogadores por equipe
								</label>
								<input
									type="number"
									value={porTime}
									onChange={(e) => setPorTime(e.target.value)}
									min={1}
									max={20}
									placeholder="6"
									className="w-full p-3 bg-white/10 backdrop-blur-sm border-2 border-white/50 rounded-xl focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-white font-pixel font-bold text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-number-spin-box]:appearance-none [-moz-appearance:textfield]"
								/>
							</div>



							<button 
								onClick={handleSortear}
								className="w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold py-5 px-6 rounded-2xl border-2 border-blue-500/50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-xs uppercase tracking-wider font-pixel disabled:opacity-50 disabled:cursor-not-allowed"
								disabled={!nomes.trim()}
							>
								Sortear
							</button>

							{resultado && (
								<button 
									onClick={handleLimpar}
									className="w-full bg-white/10 hover:bg-white/20 border-2 border-white/50 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 text-xs uppercase tracking-wider font-pixel"
								>
									Limpar
								</button>
							)}
						</div>
					</div>
				</div>

				{/* RESULTADO DO SORTEIO COM BOTÕES */}
				{resultado && resultado.sucesso && (
					<div className="mt-8 space-y-6">
						<div className="text-center border-t-4 border-white pt-6">
							{/* TÍTULO CENTRALIZADO */}
							<h2 className="text-xl md:text-2xl font-bold text-blue-400 font-pixel mb-3">
								Equipes Sorteadas
							</h2>
							
							{/* BOTÕES CENTRALIZADOS */}
							<div className="flex items-center justify-center gap-2 mb-3">
								<button
									onClick={handleCopiarTexto}
									className="bg-white/10 hover:bg-white/20 border-2 border-white/50 text-white font-bold py-2 px-4 rounded-lg transition-all text-xs font-pixel flex items-center gap-2"
									title="Copiar texto"
								>
									{copiado ? '✓ Copiado!' : '📋 Copiar'}
								</button>
								
								<button
									onClick={handleCompartilharImagem}
									disabled={gerando}
									className="bg-green-600 hover:bg-green-700 border-2 border-green-500 text-white font-bold py-2 px-4 rounded-lg transition-all text-xs font-pixel flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
									title="Compartilhar imagem (copia pro Ctrl+V)"
								>
									{gerando ? '⏳ Gerando...' : copiado ? '✓ Copiado!' : '📤 Compartilhar'}
								</button>
							</div>

							<p className="text-sm text-white/70">Resultado do sorteio ⚽</p>
						</div>

						{/* DIV CAPTURÁVEL - 🔥 LAYOUT DESKTOP FIXO */}
						<div ref={resultadoRef} className="grid grid-cols-2 gap-4 p-6 bg-black rounded-2xl font-pixel">
							{/* Marca d'água no canto */}
							<div className="col-span-full text-center mb-4">
								<h3 className="text-2xl font-bold text-blue-400 font-pixel">⚽ SORTEAGOL</h3>
								<p className="text-xs text-white/50">sorteagol.com</p>
							</div>

							{resultado.equipes.map((equipe, idx) => (
								<div
									key={equipe.id}
									className={`bg-gradient-to-br ${coresEquipes[idx % coresEquipes.length]} p-5 rounded-2xl border-2 border-white/30 shadow-2xl`}
								>
									<h3 className="text-lg font-bold text-white mb-4 text-center font-pixel">
										{equipe.nome}
									</h3>
									
									<div className="space-y-2">
										{equipe.jogadores.map((jogador, jIdx) => (
											<div
												key={jIdx}
												className={`p-2 rounded-lg text-white text-sm ${
													jogador.isCapitao
														? 'bg-white/30 font-bold border-2 border-white/50'
														: 'bg-white/10'
												}`}
											>
												{jogador.isCapitao && <span className="mr-1">👑</span>}
												{jogador.original}
											</div>
										))}
									</div>

									<div className="mt-4 pt-3 border-t border-white/30 text-center text-xs text-white/80">
										{equipe.jogadores.length} jogador{equipe.jogadores.length !== 1 ? 'es' : ''}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* MODAL AJUDA BALANCEAMENTO */}
			{mostrarAjuda && (
				<div 
					className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
					onClick={() => setMostrarAjuda(false)}
				>
					<div 
						className="bg-gradient-to-br from-slate-900 to-blue-950 border-4 border-blue-500 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-bold text-blue-400 font-pixel">
								Como funciona?
							</h3>
							<button
								onClick={() => setMostrarAjuda(false)}
								className="text-white hover:text-blue-400 text-2xl font-bold"
							>
								×
							</button>
						</div>

						<div className="space-y-4 text-white text-sm leading-relaxed">
							<p>
								O <span className="text-blue-400 font-bold">Balanceamento</span> permite definir jogadores que <span className="text-red-500 font-bold">NÃO PODEM</span> ficar na mesma equipe.
								Lembre-se que a cada 2 nomes (2 linhas) você cria 1 regra de balanceamento.
								
							</p>

							<div className="bg-white/10 p-4 rounded-lg border-2 border-white/30">
								<p className="font-bold text-blue-300 mb-2">📝 Como usar:</p>
								<p className="mb-2">Digite <span className="text-yellow-400 font-bold">2 nomes consecutivos</span> (um por linha):</p>
								<div className="bg-black/40 p-3 rounded font-mono text-xs">
									Renzo<br/>
									Vitão<br/>
									Igor<br/>
									Daniel
								</div>
							</div>

							<div className="bg-blue-500/20 p-4 rounded-lg border-2 border-blue-500/50">
								<p className="font-bold text-blue-300 mb-2">✅ Resultado:</p>
								<ul className="space-y-1 text-sm">
									<li>• Renzo e Vitão: <span className="text-green-400">Equipes diferentes</span></li>
									<li>• Igor e Daniel: <span className="text-green-400">Equipes diferentes</span></li>
								</ul>
							</div>

							<p className="text-xs text-white/70">
								💡 <span className="font-bold">Dica:</span> Nesse caso acima, Renzo poderá jogar com Daniel e Igor, mas não poderá jogar com Vitão,
								por sua vez, Vitão também poderá jogar com Igor e Daniel mas não poderá jogar com o Renzo. E o mesmo serve para a regra de baixo.
							</p>
						</div>

						<button
							onClick={() => setMostrarAjuda(false)}
							className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all font-pixel text-sm"
						>
							Entendi!
						</button>
					</div>
				</div>
			)}
		</main>
	);
}
