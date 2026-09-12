import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a1628] px-4 text-center">
      <div className="text-7xl font-bold text-[#850b0b] dark:text-[#D4A843] font-['Montserrat'] mb-4">404</div>
      <h1 className="text-2xl font-bold text-[#850b0b] dark:text-white font-['Montserrat'] mb-3">Página não encontrada</h1>
      <p className="text-gray-500 dark:text-white/60 max-w-md mb-8">
        O endereço acessado não existe ou o conteúdo foi movido.
      </p>
      <Link href="/pt" className="px-6 py-3 bg-[#E8821A] hover:bg-[#c96d10] text-white font-semibold rounded-xl transition-colors">
        Voltar ao Início
      </Link>
    </div>
  );
}
