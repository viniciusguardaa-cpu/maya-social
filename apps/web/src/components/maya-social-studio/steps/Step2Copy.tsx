'use client';

import { SocialStudioFormData } from '../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Phone } from 'lucide-react';

interface Step2CopyProps {
    data: SocialStudioFormData['step2'];
    onChange: (data: Partial<SocialStudioFormData['step2']>) => void;
}

export function Step2Copy({ data, onChange }: Step2CopyProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-1">Textos e Copy</h2>
                <p className="text-sm text-gray-600">Configure os textos do seu post</p>
            </div>

            <div className="space-y-5">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="headlineAuto" className="font-medium">
                            Headline (Título Principal)
                        </Label>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-gray-600">Auto</span>
                            <Switch
                                id="headlineAuto"
                                checked={data.headlineAuto}
                                onCheckedChange={(checked) => onChange({ headlineAuto: checked })}
                            />
                        </div>
                    </div>
                    {!data.headlineAuto && (
                        <div className="mt-3">
                            <Input
                                value={data.headline}
                                onChange={(e) => onChange({ headline: e.target.value })}
                                placeholder="Ex: NOVA COLEÇÃO VERÃO 2024"
                                maxLength={60}
                                className="bg-white"
                            />
                            <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-500">
                                    Título principal que aparece em destaque
                                </span>
                                <span className="text-xs text-gray-500">
                                    {data.headline.length}/60
                                </span>
                            </div>
                        </div>
                    )}
                    {data.headlineAuto && (
                        <p className="text-sm text-gray-600 mt-2">
                            A IA vai criar o headline perfeito baseado na sua ideia principal
                        </p>
                    )}
                </div>

                <div>
                    <Label htmlFor="subheadline" className="text-base font-medium mb-2 block">
                        Subheadline (Texto Secundário) <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="subheadline"
                        value={data.subheadline}
                        onChange={(e) => onChange({ subheadline: e.target.value })}
                        placeholder="Ex: Peças exclusivas com até 30% OFF. Aproveite enquanto durar o estoque!"
                        className="min-h-[100px] resize-none"
                        maxLength={150}
                    />
                    <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">
                            Texto complementar que explica a oferta/mensagem
                        </span>
                        <span className="text-xs text-gray-500">
                            {data.subheadline.length}/150
                        </span>
                    </div>
                </div>

                <div>
                    <Label htmlFor="cta" className="text-base font-medium mb-2 block">
                        CTA (Call to Action)
                    </Label>
                    <Input
                        id="cta"
                        value={data.cta}
                        onChange={(e) => onChange({ cta: e.target.value })}
                        placeholder="Ex: COMPRE AGORA, SAIBA MAIS, GARANTA O SEU"
                        maxLength={30}
                    />
                    <span className="text-xs text-gray-500 mt-1 block">
                        Botão ou frase de ação (opcional - a IA pode sugerir)
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="link" className="text-base font-medium mb-2 block">
                            Link
                        </Label>
                        <Input
                            id="link"
                            type="url"
                            value={data.link}
                            onChange={(e) => onChange({ link: e.target.value })}
                            placeholder="https://seusite.com.br/promo"
                        />
                        <span className="text-xs text-gray-500 mt-1 block">
                            URL para bio ou stories
                        </span>
                    </div>

                    <div>
                        <Label htmlFor="whatsapp" className="text-base font-medium mb-2 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            WhatsApp
                        </Label>
                        <Input
                            id="whatsapp"
                            type="tel"
                            value={data.whatsapp}
                            onChange={(e) => onChange({ whatsapp: e.target.value })}
                            placeholder="(11) 99999-9999"
                        />
                        <span className="text-xs text-gray-500 mt-1 block">
                            Número para contato direto
                        </span>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2 text-blue-900">💡 Dicas de Copy</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Use linguagem direta e objetiva</li>
                        <li>• Destaque benefícios, não apenas características</li>
                        <li>• Crie senso de urgência quando apropriado</li>
                        <li>• Seja autêntico e evite clichês genéricos</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
