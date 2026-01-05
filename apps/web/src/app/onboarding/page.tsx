"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Building, Globe, Instagram, Loader2, Check, ArrowRight } from "lucide-react"
import { useAuthStore } from "@/lib/store"
import { api } from "@/lib/api"

const steps = [
    { id: 1, title: "Sua Empresa", description: "Informações básicas" },
    { id: 2, title: "Sua Marca", description: "Configure sua primeira marca" },
    { id: 3, title: "Redes Sociais", description: "Conecte suas contas" },
]

export default function OnboardingPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const plan = searchParams.get("plan") || "starter"

    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const { user, currentOrg, setCurrentOrg, setCurrentBrand, fetchMe } = useAuthStore()

    const [formData, setFormData] = useState({
        companyName: "",
        website: "",
        brandName: "",
        instagram: "",
        industry: "",
    })

    const handleNext = async () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1)
        } else {
            setIsLoading(true)

            try {
                // User already has an organization from registration
                // Just need to create the brand
                if (currentOrg) {
                    const brandName = formData.brandName || formData.companyName || "Minha Marca"
                    const brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

                    const brandResponse = await api.post(`/organizations/${currentOrg.id}/brands`, {
                        name: brandName,
                        slug: brandSlug + '-' + Date.now().toString(36),
                    })

                    setCurrentBrand(brandResponse.data)
                }

                // Refresh user data
                await fetchMe()

                router.push("/dashboard?welcome=true")
            } catch (error) {
                console.error("Onboarding error:", error)
                // Still redirect to dashboard
                router.push("/dashboard")
            } finally {
                setIsLoading(false)
            }
        }
    }

    const planNames: Record<string, string> = {
        starter: "Starter",
        pro: "Pro",
        enterprise: "Enterprise",
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
            <div className="max-w-2xl mx-auto pt-8">
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
                        <Sparkles className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold">Bem-vindo ao Maya!</h1>
                    <p className="text-muted-foreground">
                        Plano selecionado: <span className="font-medium text-primary">{planNames[plan]}</span>
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className={`
                                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                                ${currentStep > step.id
                                    ? 'bg-primary border-primary text-primary-foreground'
                                    : currentStep === step.id
                                        ? 'border-primary text-primary'
                                        : 'border-muted text-muted-foreground'
                                }
                            `}>
                                {currentStep > step.id ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    step.id
                                )}
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`w-16 h-0.5 mx-2 ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <Card>
                    <CardHeader>
                        <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                        <CardDescription>{steps[currentStep - 1].description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {currentStep === 1 && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Nome da Empresa</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="companyName"
                                            placeholder="Ex: Maya Agency"
                                            className="pl-9"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website (opcional)</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="website"
                                            placeholder="https://seusite.com"
                                            className="pl-9"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="industry">Segmento</Label>
                                    <select
                                        id="industry"
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                        value={formData.industry}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="agency">Agência de Marketing</option>
                                        <option value="ecommerce">E-commerce</option>
                                        <option value="saas">SaaS / Tecnologia</option>
                                        <option value="restaurant">Restaurante / Food</option>
                                        <option value="fitness">Fitness / Saúde</option>
                                        <option value="education">Educação</option>
                                        <option value="consulting">Consultoria</option>
                                        <option value="other">Outro</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {currentStep === 2 && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="brandName">Nome da Marca</Label>
                                    <Input
                                        id="brandName"
                                        placeholder="Ex: Maya Social"
                                        value={formData.brandName}
                                        onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Você pode gerenciar múltiplas marcas depois
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <h4 className="font-medium mb-2">💡 Dica</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Uma marca representa um perfil de rede social ou cliente.
                                        Se você é uma agência, cada cliente será uma marca separada.
                                    </p>
                                </div>
                            </>
                        )}

                        {currentStep === 3 && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="instagram">Instagram (opcional)</Label>
                                    <div className="relative">
                                        <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="instagram"
                                            placeholder="@seuinstagram"
                                            className="pl-9"
                                            value={formData.instagram}
                                            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <Button variant="outline" className="h-auto py-4" disabled>
                                        <div className="flex flex-col items-center gap-2">
                                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                            </svg>
                                            <span className="text-xs">Facebook</span>
                                            <span className="text-xs text-muted-foreground">Em breve</span>
                                        </div>
                                    </Button>
                                    <Button variant="outline" className="h-auto py-4" disabled>
                                        <div className="flex flex-col items-center gap-2">
                                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                            </svg>
                                            <span className="text-xs">TikTok</span>
                                            <span className="text-xs text-muted-foreground">Em breve</span>
                                        </div>
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground text-center mt-4">
                                    Você pode conectar suas redes sociais depois nas configurações
                                </p>
                            </>
                        )}

                        <div className="flex gap-3 pt-4">
                            {currentStep > 1 && (
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    disabled={isLoading}
                                >
                                    Voltar
                                </Button>
                            )}
                            <Button
                                className="flex-1"
                                onClick={handleNext}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : currentStep === 3 ? (
                                    <>
                                        Começar a usar
                                        <Sparkles className="ml-2 h-4 w-4" />
                                    </>
                                ) : (
                                    <>
                                        Próximo
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
