import Link from "next/link";
import { Calendar, FileText, Image, CheckCircle, BarChart3, MessageSquare } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">M</span>
                        </div>
                        <span className="font-semibold text-xl">Mídia</span>
                    </div>
                    <nav className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Entrar
                        </Link>
                        <Link
                            href="/login"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Começar Agora
                        </Link>
                    </nav>
                </div>
            </header>

            <main>
                <section className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Seu Funcionário Digital de{" "}
                        <span className="text-indigo-600">Marketing</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                        Planejamento, produção, operação e analytics integrados.
                        Automatize seu workflow de social media com governança e controle total.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/login"
                            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-lg font-medium"
                        >
                            Começar Gratuitamente
                        </Link>
                        <Link
                            href="#features"
                            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors text-lg font-medium"
                        >
                            Ver Funcionalidades
                        </Link>
                    </div>
                </section>

                <section id="features" className="container mx-auto px-4 py-20">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Tudo que você precisa para gerenciar suas redes sociais
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Calendar className="w-6 h-6" />}
                            title="Calendário Editorial"
                            description="Planejamento mensal automatizado com templates configuráveis por segmento."
                        />
                        <FeatureCard
                            icon={<FileText className="w-6 h-6" />}
                            title="Briefs & Roteiros"
                            description="Geração automática de briefs com ganchos, CTAs e diretrizes de produção."
                        />
                        <FeatureCard
                            icon={<Image className="w-6 h-6" />}
                            title="Gestão de Assets"
                            description="Integração com Drive, validação automática e sistema de CÓDIGO por peça."
                        />
                        <FeatureCard
                            icon={<CheckCircle className="w-6 h-6" />}
                            title="Aprovações"
                            description="Workflow de aprovação com governança, logs e auditoria completa."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="w-6 h-6" />}
                            title="Analytics"
                            description="Métricas por peça, relatórios diários e recomendações automáticas."
                        />
                        <FeatureCard
                            icon={<MessageSquare className="w-6 h-6" />}
                            title="Atendimento"
                            description="Inbox integrado com triagem, macros e handoff para humano."
                        />
                    </div>
                </section>

                <section className="bg-indigo-600 py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">
                            Pronto para automatizar seu marketing?
                        </h2>
                        <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
                            Comece agora e veja como o sistema de CÓDIGO + Drive pode transformar sua operação.
                        </p>
                        <Link
                            href="/login"
                            className="bg-white text-indigo-600 px-8 py-3 rounded-lg hover:bg-indigo-50 transition-colors text-lg font-medium inline-block"
                        >
                            Criar Conta Gratuita
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t bg-white py-8">
                <div className="container mx-auto px-4 text-center text-gray-500">
                    <p>© 2024 Mídia. Funcionário Digital de Marketing.</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
}
