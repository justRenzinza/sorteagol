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
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR" className={pressStart.variable}>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
			</head>
			<body className="antialiased">
				{children}
			</body>
		</html>
	);
}
