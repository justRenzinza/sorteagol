// src/app/layout.tsx
import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pressStart = Press_Start_2P({
	weight: "400",
	subsets: ["latin"],
	variable: "--font-pixel",
});

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
		<html lang="pt-BR" className={pressStart.variable}>
			<body className="antialiased">
				{children}
			</body>
		</html>
	);
}
