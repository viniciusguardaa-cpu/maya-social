'use client';

import { GeneratedOutput } from './types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, RefreshCw, Edit, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface PreviewPanelProps {
    output: GeneratedOutput;
    onRegenerate: () => void;
    onEdit: () => void;
}

export function PreviewPanel({ output, onRegenerate, onEdit }: PreviewPanelProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [selectedVariation, setSelectedVariation] = useState(0);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const currentCopy = selectedVariation === 0
        ? output.copy
        : output.copy.variations[selectedVariation - 1];

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Conteúdo Gerado ✨</h1>
                <p className="text-gray-600">Revise, edite ou baixe seu conteúdo</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Preview Visual</h2>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Baixar
                            </Button>
                        </div>

                        <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                            {output.imageUrl ? (
                                <img
                                    src={output.imageUrl}
                                    alt="Generated content"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center p-8">
                                    <div className="animate-pulse">
                                        <div className="w-16 h-16 bg-purple-300 rounded-full mx-auto mb-4"></div>
                                        <p className="text-sm text-gray-600">Gerando imagem...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-medium mb-2">Prompt de Imagem</h3>
                            <p className="text-xs text-gray-700 leading-relaxed">
                                {output.imagePrompt}
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2"
                                onClick={() => copyToClipboard(output.imagePrompt, 'prompt')}
                            >
                                {copiedField === 'prompt' ? (
                                    <Check className="w-3 h-3 mr-1" />
                                ) : (
                                    <Copy className="w-3 h-3 mr-1" />
                                )}
                                {copiedField === 'prompt' ? 'Copiado!' : 'Copiar prompt'}
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Design System</h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Estilo</h3>
                                <p className="text-sm bg-gray-50 p-3 rounded-lg">{output.design.style}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Paleta de Cores</h3>
                                <div className="flex gap-2">
                                    {output.design.colorPalette.map((color, index) => (
                                        <div key={index} className="flex flex-col items-center gap-1">
                                            <div
                                                className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                                                style={{ backgroundColor: color }}
                                            />
                                            <span className="text-xs font-mono text-gray-600">{color}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Tipografia</h3>
                                <p className="text-sm bg-gray-50 p-3 rounded-lg">{output.design.fontStyle}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Composição</h3>
                                <p className="text-sm bg-gray-50 p-3 rounded-lg leading-relaxed">
                                    {output.design.composition}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Copy</h2>
                            {output.copy.variations.length > 0 && (
                                <div className="flex gap-1">
                                    <Button
                                        variant={selectedVariation === 0 ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedVariation(0)}
                                        className={selectedVariation === 0 ? 'bg-purple-600' : ''}
                                    >
                                        Principal
                                    </Button>
                                    {output.copy.variations.map((_, index) => (
                                        <Button
                                            key={index}
                                            variant={selectedVariation === index + 1 ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setSelectedVariation(index + 1)}
                                            className={selectedVariation === index + 1 ? 'bg-purple-600' : ''}
                                        >
                                            V{index + 1}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-700">Headline</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(currentCopy.headline, 'headline')}
                                    >
                                        {copiedField === 'headline' ? (
                                            <Check className="w-3 h-3" />
                                        ) : (
                                            <Copy className="w-3 h-3" />
                                        )}
                                    </Button>
                                </div>
                                <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent p-3 bg-gray-50 rounded-lg">
                                    {currentCopy.headline}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-700">Subheadline</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(currentCopy.subheadline, 'subheadline')}
                                    >
                                        {copiedField === 'subheadline' ? (
                                            <Check className="w-3 h-3" />
                                        ) : (
                                            <Copy className="w-3 h-3" />
                                        )}
                                    </Button>
                                </div>
                                <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg leading-relaxed">
                                    {currentCopy.subheadline}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-700">CTA</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(currentCopy.cta, 'cta')}
                                    >
                                        {copiedField === 'cta' ? (
                                            <Check className="w-3 h-3" />
                                        ) : (
                                            <Copy className="w-3 h-3" />
                                        )}
                                    </Button>
                                </div>
                                <p className="text-sm font-semibold text-purple-700 p-3 bg-purple-50 rounded-lg">
                                    {currentCopy.cta}
                                </p>
                            </div>

                            <div className="pt-4 border-t">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        const fullCopy = `${currentCopy.headline}\n\n${currentCopy.subheadline}\n\n${currentCopy.cta}`;
                                        copyToClipboard(fullCopy, 'all');
                                    }}
                                >
                                    {copiedField === 'all' ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Copiado!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copiar Tudo
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Formatos de Export</h2>
                        <div className="space-y-2">
                            {output.export.variants.map((variant, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <span className="text-sm font-medium">{variant}</span>
                                    <Button variant="ghost" size="sm">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onEdit}
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar Briefing
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onRegenerate}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Novo Conteúdo
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
