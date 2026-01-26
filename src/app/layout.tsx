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
			<body className="antialiased">
				{children}
			</body>
		</html>
	);
}
