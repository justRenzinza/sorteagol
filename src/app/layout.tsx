// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Footer from "./components/Footer";

export const metadata: Metadata = {
	title: "Sorteagol",
	description: "Sorteio de equipes balanceadas para futebol",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="pt-BR">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P:wght@400&display=swap" rel="stylesheet" />
			</head>
			<body className="font-pixel bg-black text-white min-h-screen antialiased flex flex-col overflow-x-hidden">
				<div className="flex-1 flex items-center justify-center">
					{children}
				</div>
				<Footer />
			</body>
		</html>
	);
}
