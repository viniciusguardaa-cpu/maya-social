'use client';

import { useState } from 'react';
import { SocialStudioFormData } from '../types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Palette, Type, Sparkles, Plus, X } from 'lucide-react';

interface Step3VisualProps {
    data: SocialStudioFormData['step3'];
    onChange: (data: Partial<SocialStudioFormData['step3']>) => void;
}

const VISUAL_STYLES = [
    { value: 'auto', label: 'Auto (IA Decide)', description: 'Deixe a IA escolher o melhor estilo' },
    { value: 'premium', label: 'Premium', description: 'Elegante, sofisticado, minimalista' },
    { value: 'clean', label: 'Clean', description: 'Limpo, moderno, espaços brancos' },
    { value: 'food', label: 'Food', description: 'Apetitoso, vibrante, close-up' },
    { value: 'luxury', label: 'Luxury', description: 'Luxuoso, dourado, exclusivo' },
    { value: 'young', label: 'Young', description: 'Jovem, colorido, dinâmico' },
] as const;

const TONE_STYLES = [
    { value: 'auto', label: 'Auto (IA Decide)', description: undefined },
    { value: 'aggressive', label: 'Agressivo', description: 'Urgente, impactante' },
    { value: 'elegant', label: 'Elegante', description: 'Refinado, sutil' },
    { value: 'informative', label: 'Informativo', description: 'Educativo, claro' },
    { value: 'playful', label: 'Divertido', description: 'Leve, descontraído' },
] as const;

const FONT_STYLES = [
    { value: 'auto', label: 'Auto (IA Decide)', description: undefined },
    { value: 'modern', label: 'Moderna', description: 'Sans-serif, clean' },
    { value: 'serif', label: 'Serif', description: 'Clássica, elegante' },
    { value: 'bold', label: 'Bold', description: 'Forte, impactante' },
    { value: 'handwritten', label: 'Manuscrita', description: 'Pessoal, autêntica' },
] as const;

export function Step3Visual({ data, onChange }: Step3VisualProps) {
    const [newColor, setNewColor] = useState('');

    const addColor = () => {
        if (newColor && /^#[0-9A-F]{6}$/i.test(newColor)) {
            onChange({ colors: [...data.colors, newColor] });
            setNewColor('');
        }
    };

    const removeColor = (index: number) => {
        onChange({ colors: data.colors.filter((_, i) => i !== index) });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-1">Identidade Visual</h2>
                <p className="text-sm text-gray-600">Defina o estilo visual do seu post</p>
            </div>

            <div className="space-y-5">
                <div>
                    <Label className="text-base font-medium mb-3 block flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Estilo Visual
                    </Label>
                    <RadioGroup
                        value={data.style}
                        onValueChange={(value) => onChange({ style: value as any })}
                        className="grid grid-cols-2 gap-3"
                    >
                        {VISUAL_STYLES.map((style) => (
                            <label
                                key={style.value}
                                className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${data.style === style.value
                                    ? 'border-purple-600 bg-purple-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <RadioGroupItem value={style.value} className="mt-1" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {style.value === 'auto' && <Sparkles className="w-3 h-3 text-purple-600" />}
                                        <span className="font-medium text-sm">{style.label}</span>
                                    </div>
                                    <span className="text-xs text-gray-600">{style.description}</span>
                                </div>
                            </label>
                        ))}
                    </RadioGroup>
                </div>

                <div>
                    <Label className="text-base font-medium mb-3 block">Tom de Comunicação</Label>
                    <RadioGroup
                        value={data.tone}
                        onValueChange={(value) => onChange({ tone: value as any })}
                        className="grid grid-cols-2 gap-3"
                    >
                        {TONE_STYLES.map((tone) => (
                            <label
                                key={tone.value}
                                className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${data.tone === tone.value
                                    ? 'border-purple-600 bg-purple-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <RadioGroupItem value={tone.value} className="mt-1" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {tone.value === 'auto' && <Sparkles className="w-3 h-3 text-purple-600" />}
                                        <span className="font-medium text-sm">{tone.label}</span>
                                    </div>
                                    {tone.description && (
                                        <span className="text-xs text-gray-600">{tone.description}</span>
                                    )}
                                </div>
                            </label>
                        ))}
                    </RadioGroup>
                </div>

                <div>
                    <Label className="text-base font-medium mb-3 block flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Paleta de Cores
                    </Label>

                    <div className="flex items-center gap-2 mb-3">
                        <Button
                            type="button"
                            variant={data.colorMode === 'auto' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onChange({ colorMode: 'auto', colors: [] })}
                            className={data.colorMode === 'auto' ? 'bg-purple-600' : ''}
                        >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Auto
                        </Button>
                        <Button
                            type="button"
                            variant={data.colorMode === 'manual' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onChange({ colorMode: 'manual' })}
                            className={data.colorMode === 'manual' ? 'bg-purple-600' : ''}
                        >
                            Manual
                        </Button>
                    </div>

                    {data.colorMode === 'manual' && (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={newColor}
                                    onChange={(e) => setNewColor(e.target.value.toUpperCase())}
                                    placeholder="#FF5733"
                                    maxLength={7}
                                    className="flex-1"
                                />
                                <Button type="button" onClick={addColor} size="sm">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            {data.colors.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {data.colors.map((color, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
                                        >
                                            <div
                                                className="w-6 h-6 rounded border border-gray-300"
                                                style={{ backgroundColor: color }}
                                            />
                                            <span className="text-sm font-mono">{color}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeColor(index)}
                                                className="text-gray-500 hover:text-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-xs text-gray-500">
                                Adicione até 5 cores em formato HEX (ex: #FF5733)
                            </p>
                        </div>
                    )}

                    {data.colorMode === 'auto' && (
                        <p className="text-sm text-gray-600 bg-purple-50 border border-purple-200 rounded-lg p-3">
                            A IA vai escolher cores que combinam com o estilo e objetivo do post
                        </p>
                    )}
                </div>

                <div>
                    <Label className="text-base font-medium mb-3 block flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Tipografia
                    </Label>
                    <RadioGroup
                        value={data.fontStyle}
                        onValueChange={(value) => onChange({ fontStyle: value as any })}
                        className="grid grid-cols-2 gap-3"
                    >
                        {FONT_STYLES.map((font) => (
                            <label
                                key={font.value}
                                className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${data.fontStyle === font.value
                                    ? 'border-purple-600 bg-purple-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <RadioGroupItem value={font.value} className="mt-1" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {font.value === 'auto' && <Sparkles className="w-3 h-3 text-purple-600" />}
                                        <span className="font-medium text-sm">{font.label}</span>
                                    </div>
                                    {font.description && (
                                        <span className="text-xs text-gray-600">{font.description}</span>
                                    )}
                                </div>
                            </label>
                        ))}
                    </RadioGroup>
                </div>
            </div>
        </div>
    );
}
