'use client';

import { useState } from 'react';
import { SocialStudioFormData, GeneratedOutput } from './types';
import { Step1Basics } from './steps/Step1Basics';
import { Step2Copy } from './steps/Step2Copy';
import { Step3Visual } from './steps/Step3Visual';
import { Step4Assets } from './steps/Step4Assets';
import { PreviewPanel } from './PreviewPanel';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles } from 'lucide-react';

const INITIAL_FORM_DATA: SocialStudioFormData = {
    step1: {
        postType: 'feed',
        objective: 'engagement',
        mainIdea: '',
    },
    step2: {
        headline: '',
        headlineAuto: true,
        subheadline: '',
        cta: '',
        link: '',
        whatsapp: '',
    },
    step3: {
        style: 'auto',
        tone: 'auto',
        colors: [],
        colorMode: 'auto',
        fontStyle: 'auto',
    },
    step4: {
        logo: null,
        images: [],
        restrictions: '',
    },
};

export function SocialStudioForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<SocialStudioFormData>(INITIAL_FORM_DATA);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedOutput, setGeneratedOutput] = useState<GeneratedOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const totalSteps = 4;
    const progress = (currentStep / totalSteps) * 100;

    const updateFormData = <K extends keyof SocialStudioFormData>(
        step: K,
        data: Partial<SocialStudioFormData[K]>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [step]: { ...prev[step], ...data },
        }));
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return formData.step1.mainIdea.trim().length >= 10;
            case 2:
                return formData.step2.subheadline.trim().length >= 5;
            case 3:
                return true;
            case 4:
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (!validateStep(currentStep)) {
            setError('Por favor, preencha os campos obrigatórios');
            return;
        }
        setError(null);
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    };

    const handleBack = () => {
        setError(null);
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleGenerate = async () => {
        if (!validateStep(currentStep)) {
            setError('Por favor, preencha os campos obrigatórios');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('data', JSON.stringify({
                postType: formData.step1.postType,
                objective: formData.step1.objective,
                mainIdea: formData.step1.mainIdea,
                headline: formData.step2.headlineAuto ? null : formData.step2.headline,
                subheadline: formData.step2.subheadline,
                cta: formData.step2.cta,
                link: formData.step2.link,
                whatsapp: formData.step2.whatsapp,
                style: formData.step3.style,
                tone: formData.step3.tone,
                colors: formData.step3.colorMode === 'manual' ? formData.step3.colors : null,
                fontStyle: formData.step3.fontStyle,
                restrictions: formData.step4.restrictions,
            }));

            if (formData.step4.logo) {
                formDataToSend.append('logo', formData.step4.logo);
            }

            formData.step4.images.forEach((image, index) => {
                formDataToSend.append(`image_${index}`, image);
            });

            const response = await fetch('/api/maya/social/generate', {
                method: 'POST',
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao gerar conteúdo');
            }

            const result: GeneratedOutput = await response.json();
            setGeneratedOutput(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRegenerate = () => {
        setGeneratedOutput(null);
        setCurrentStep(1);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1Basics
                        data={formData.step1}
                        onChange={(data) => updateFormData('step1', data)}
                    />
                );
            case 2:
                return (
                    <Step2Copy
                        data={formData.step2}
                        onChange={(data) => updateFormData('step2', data)}
                    />
                );
            case 3:
                return (
                    <Step3Visual
                        data={formData.step3}
                        onChange={(data) => updateFormData('step3', data)}
                    />
                );
            case 4:
                return (
                    <Step4Assets
                        data={formData.step4}
                        onChange={(data) => updateFormData('step4', data)}
                    />
                );
            default:
                return null;
        }
    };

    if (generatedOutput) {
        return (
            <PreviewPanel
                output={generatedOutput}
                onRegenerate={handleRegenerate}
                onEdit={() => setCurrentStep(2)}
            />
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                    <h1 className="text-3xl font-bold">MAYA Social Studio</h1>
                </div>
                <p className="text-gray-600">
                    Crie conteúdo profissional para Instagram em minutos com IA
                </p>
            </div>

            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                        Etapa {currentStep} de {totalSteps}
                    </span>
                    <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        {renderStep()}

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        <div className="flex justify-between mt-6 pt-6 border-t">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 1 || isGenerating}
                            >
                                Voltar
                            </Button>

                            {currentStep < totalSteps ? (
                                <Button onClick={handleNext} disabled={isGenerating}>
                                    Próximo
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Gerando...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Gerar Conteúdo
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border p-6 sticky top-6">
                        <h3 className="font-semibold mb-3">Resumo do Briefing</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-gray-600">Tipo:</span>
                                <p className="font-medium capitalize">{formData.step1.postType.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <span className="text-gray-600">Objetivo:</span>
                                <p className="font-medium capitalize">{formData.step1.objective}</p>
                            </div>
                            {formData.step1.mainIdea && (
                                <div>
                                    <span className="text-gray-600">Ideia:</span>
                                    <p className="font-medium line-clamp-3">{formData.step1.mainIdea}</p>
                                </div>
                            )}
                            {formData.step3.style !== 'auto' && (
                                <div>
                                    <span className="text-gray-600">Estilo:</span>
                                    <p className="font-medium capitalize">{formData.step3.style}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
