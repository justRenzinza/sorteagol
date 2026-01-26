// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Sorteagol - Sorteio de Equipes",
	description: "Sistema de sorteio de equipes balanceadas para futebol",
	viewport: {
		width: 'device-width',
		initialScale: 1,
		maximumScale: 1,
		userScalable: false,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
			</head>
			<body className="antialiased">
				{children}
			</body>
		</html>
	);
}
