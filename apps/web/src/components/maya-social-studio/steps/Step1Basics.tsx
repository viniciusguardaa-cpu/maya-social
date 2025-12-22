'use client';

import { SocialStudioFormData } from '../types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Image, Video, Layers, Target, TrendingUp, Calendar, Users, Award } from 'lucide-react';

interface Step1BasicsProps {
    data: SocialStudioFormData['step1'];
    onChange: (data: Partial<SocialStudioFormData['step1']>) => void;
}

const POST_TYPES = [
    { value: 'story', label: 'Story', icon: Image, description: '1080x1920 - Vertical' },
    { value: 'feed', label: 'Feed', icon: Layers, description: '1080x1080 - Quadrado' },
    { value: 'carousel', label: 'Carrossel', icon: Layers, description: 'Múltiplas imagens' },
    { value: 'reel_cover', label: 'Capa de Reels', icon: Video, description: '1080x1920 - Vertical' },
] as const;

const OBJECTIVES = [
    { value: 'sell', label: 'Vender', icon: TrendingUp, description: 'Produto ou serviço' },
    { value: 'event', label: 'Evento', icon: Calendar, description: 'Divulgar evento' },
    { value: 'engagement', label: 'Engajamento', icon: Users, description: 'Interação e alcance' },
    { value: 'authority', label: 'Autoridade', icon: Award, description: 'Educar e posicionar' },
] as const;

export function Step1Basics({ data, onChange }: Step1BasicsProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-1">Informações Básicas</h2>
                <p className="text-sm text-gray-600">Defina o tipo e objetivo do seu post</p>
            </div>

            <div className="space-y-4">
                <div>
                    <Label className="text-base font-medium mb-3 block">Tipo de Post</Label>
                    <RadioGroup
                        value={data.postType}
                        onValueChange={(value) => onChange({ postType: value as any })}
                        className="grid grid-cols-2 gap-3"
                    >
                        {POST_TYPES.map((type) => {
                            const Icon = type.icon;
                            return (
                                <label
                                    key={type.value}
                                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${data.postType === type.value
                                            ? 'border-purple-600 bg-purple-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <RadioGroupItem value={type.value} className="mt-1" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon className="w-4 h-4" />
                                            <span className="font-medium">{type.label}</span>
                                        </div>
                                        <span className="text-xs text-gray-600">{type.description}</span>
                                    </div>
                                </label>
                            );
                        })}
                    </RadioGroup>
                </div>

                <div>
                    <Label className="text-base font-medium mb-3 block">Objetivo do Post</Label>
                    <RadioGroup
                        value={data.objective}
                        onValueChange={(value) => onChange({ objective: value as any })}
                        className="grid grid-cols-2 gap-3"
                    >
                        {OBJECTIVES.map((objective) => {
                            const Icon = objective.icon;
                            return (
                                <label
                                    key={objective.value}
                                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${data.objective === objective.value
                                            ? 'border-purple-600 bg-purple-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <RadioGroupItem value={objective.value} className="mt-1" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon className="w-4 h-4" />
                                            <span className="font-medium">{objective.label}</span>
                                        </div>
                                        <span className="text-xs text-gray-600">{objective.description}</span>
                                    </div>
                                </label>
                            );
                        })}
                    </RadioGroup>
                </div>

                <div>
                    <Label htmlFor="mainIdea" className="text-base font-medium mb-2 block">
                        Ideia Principal <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="mainIdea"
                        value={data.mainIdea}
                        onChange={(e) => onChange({ mainIdea: e.target.value })}
                        placeholder="Ex: Lançamento da nova coleção de verão com 30% de desconto para os primeiros 100 clientes"
                        className="min-h-[120px] resize-none"
                        maxLength={300}
                    />
                    <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">
                            Descreva em uma frase o que você quer comunicar
                        </span>
                        <span className="text-xs text-gray-500">
                            {data.mainIdea.length}/300
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
