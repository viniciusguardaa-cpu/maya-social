"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
    Check,
    Sparkles,
    Zap,
    Building2,
    ArrowRight,
    Star
} from "lucide-react"
import { toast } from "sonner"

interface PlanFeature {
    text: string
    included: boolean
}

interface Plan {
    id: string
    name: string
    description: string
    priceMonthly: number
    priceYearly: number
    popular?: boolean
    features: PlanFeature[]
    cta: string
    icon: React.ReactNode
}

const plans: Plan[] = [
    {
        id: "starter",
        name: "Starter",
        description: "Para freelancers e pequenas agências",
        priceMonthly: 49,
        priceYearly: 39,
        icon: <Zap className="h-6 w-6" />,
        features: [
            { text: "1 marca", included: true },
            { text: "2 usuários", included: true },
            { text: "Calendário editorial", included: true },
            { text: "Kanban de produção", included: true },
            { text: "50 posts/mês", included: true },
            { text: "Analytics básico", included: true },
            { text: "Suporte por email", included: true },
            { text: "Geração de caption IA", included: false },
            { text: "Aprovação em lote", included: false },
            { text: "Webhooks", included: false },
            { text: "API access", included: false },
        ],
        cta: "Começar Grátis"
    },
    {
        id: "pro",
        name: "Pro",
        description: "Para agências em crescimento",
        priceMonthly: 149,
        priceYearly: 119,
        popular: true,
        icon: <Sparkles className="h-6 w-6" />,
        features: [
            { text: "5 marcas", included: true },
            { text: "10 usuários", included: true },
            { text: "Calendário editorial", included: true },
            { text: "Kanban de produção", included: true },
            { text: "Posts ilimitados", included: true },
            { text: "Analytics avançado", included: true },
            { text: "Suporte prioritário", included: true },
            { text: "Geração de caption IA", included: true },
            { text: "Aprovação em lote", included: true },
            { text: "Webhooks", included: true },
            { text: "API access", included: false },
        ],
        cta: "Assinar Pro"
    },
    {
        id: "enterprise",
        name: "Enterprise",
        description: "Para grandes agências e empresas",
        priceMonthly: 399,
        priceYearly: 319,
        icon: <Building2 className="h-6 w-6" />,
        features: [
            { text: "Marcas ilimitadas", included: true },
            { text: "Usuários ilimitados", included: true },
            { text: "Calendário editorial", included: true },
            { text: "Kanban de produção", included: true },
            { text: "Posts ilimitados", included: true },
            { text: "Analytics avançado", included: true },
            { text: "Suporte dedicado 24/7", included: true },
            { text: "Geração de caption IA", included: true },
            { text: "Aprovação em lote", included: true },
            { text: "Webhooks", included: true },
            { text: "API access", included: true },
        ],
        cta: "Falar com Vendas"
    },
]

export default function PricingPage() {
    const router = useRouter()
    const [isYearly, setIsYearly] = useState(false)

    const handleSubscribe = (plan: Plan) => {
        if (plan.id === "enterprise") {
            toast.info("Redirecionando para contato...")
            return
        }
        toast.success(`Iniciando checkout do plano ${plan.name}...`)
        // Aqui integraria com Stripe
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Header */}
            <div className="border-b bg-card/50 backdrop-blur">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-xl">Maya</span>
                    </div>
                    <Button variant="outline" onClick={() => router.push("/login")}>
                        Entrar
                    </Button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-16">
                {/* Hero */}
                <div className="text-center mb-12">
                    <Badge className="mb-4">🎉 14 dias grátis em todos os planos</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Planos para cada tamanho de agência
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Comece grátis, escale quando precisar. Cancele a qualquer momento.
                    </p>

                    {/* Toggle Anual/Mensal */}
                    <div className="flex items-center justify-center gap-3 mt-8">
                        <span className={!isYearly ? "font-medium" : "text-muted-foreground"}>
                            Mensal
                        </span>
                        <Switch checked={isYearly} onCheckedChange={setIsYearly} />
                        <span className={isYearly ? "font-medium" : "text-muted-foreground"}>
                            Anual
                        </span>
                        {isYearly && (
                            <Badge variant="secondary" className="ml-2">
                                Economize 20%
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-primary">
                                        <Star className="h-3 w-3 mr-1 fill-current" />
                                        Mais Popular
                                    </Badge>
                                </div>
                            )}
                            <CardHeader className="text-center pb-2">
                                <div className={`h-12 w-12 rounded-xl mx-auto mb-4 flex items-center justify-center ${plan.popular ? "bg-primary text-primary-foreground" : "bg-muted"
                                    }`}>
                                    {plan.icon}
                                </div>
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">
                                        R$ {isYearly ? plan.priceYearly : plan.priceMonthly}
                                    </span>
                                    <span className="text-muted-foreground">/mês</span>
                                    {isYearly && (
                                        <p className="text-sm text-muted-foreground">
                                            Cobrado anualmente (R$ {plan.priceYearly * 12}/ano)
                                        </p>
                                    )}
                                </div>

                                <ul className="space-y-3 text-left">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <Check className={`h-4 w-4 ${feature.included ? "text-green-500" : "text-muted-foreground/30"
                                                }`} />
                                            <span className={feature.included ? "" : "text-muted-foreground/50 line-through"}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={plan.popular ? "default" : "outline"}
                                    onClick={() => handleSubscribe(plan)}
                                >
                                    {plan.cta}
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* FAQ */}
                <div className="mt-20 text-center">
                    <h2 className="text-2xl font-bold mb-8">Perguntas Frequentes</h2>
                    <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
                        <div className="p-6 rounded-lg bg-card border">
                            <h3 className="font-medium mb-2">Posso cancelar a qualquer momento?</h3>
                            <p className="text-sm text-muted-foreground">
                                Sim! Sem multas ou taxas. Cancele quando quiser pelo painel.
                            </p>
                        </div>
                        <div className="p-6 rounded-lg bg-card border">
                            <h3 className="font-medium mb-2">O trial precisa de cartão?</h3>
                            <p className="text-sm text-muted-foreground">
                                Não! 14 dias grátis sem pedir cartão de crédito.
                            </p>
                        </div>
                        <div className="p-6 rounded-lg bg-card border">
                            <h3 className="font-medium mb-2">Posso mudar de plano depois?</h3>
                            <p className="text-sm text-muted-foreground">
                                Sim! Upgrade ou downgrade a qualquer momento, com ajuste proporcional.
                            </p>
                        </div>
                        <div className="p-6 rounded-lg bg-card border">
                            <h3 className="font-medium mb-2">Tem desconto para agências?</h3>
                            <p className="text-sm text-muted-foreground">
                                Sim! Fale com nosso time comercial para condições especiais.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Final */}
                <div className="mt-20 text-center p-12 rounded-2xl bg-gradient-to-r from-primary/10 to-purple-500/10 border">
                    <h2 className="text-3xl font-bold mb-4">
                        Pronto para escalar sua agência?
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                        Junte-se a mais de 500 agências que já usam Maya para gerenciar suas redes sociais.
                    </p>
                    <Button size="lg" onClick={() => router.push("/login")}>
                        Começar Grátis
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
