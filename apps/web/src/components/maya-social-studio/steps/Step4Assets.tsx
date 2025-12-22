'use client';

import { useRef } from 'react';
import { SocialStudioFormData } from '../types';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, Image, X, FileImage } from 'lucide-react';

interface Step4AssetsProps {
    data: SocialStudioFormData['step4'];
    onChange: (data: Partial<SocialStudioFormData['step4']>) => void;
}

export function Step4Assets({ data, onChange }: Step4AssetsProps) {
    const logoInputRef = useRef<HTMLInputElement>(null);
    const imagesInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange({ logo: file });
        }
    };

    const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            onChange({ images: [...data.images, ...files].slice(0, 5) });
        }
    };

    const removeLogo = () => {
        onChange({ logo: null });
        if (logoInputRef.current) {
            logoInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        onChange({ images: data.images.filter((_, i) => i !== index) });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-1">Assets e Restrições</h2>
                <p className="text-sm text-gray-600">Adicione elementos visuais e defina restrições</p>
            </div>

            <div className="space-y-5">
                <div>
                    <Label className="text-base font-medium mb-3 block flex items-center gap-2">
                        <FileImage className="w-4 h-4" />
                        Logo da Marca
                    </Label>

                    {!data.logo ? (
                        <div
                            onClick={() => logoInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                        >
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm font-medium text-gray-700">
                                Clique para fazer upload do logo
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG ou SVG até 5MB
                            </p>
                        </div>
                    ) : (
                        <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileImage className="w-8 h-8 text-purple-600" />
                                    <div>
                                        <p className="font-medium text-sm">{data.logo.name}</p>
                                        <p className="text-xs text-gray-600">
                                            {(data.logo.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={removeLogo}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                    />

                    <p className="text-xs text-gray-500 mt-2">
                        Opcional - A IA pode integrar seu logo no design final
                    </p>
                </div>

                <div>
                    <Label className="text-base font-medium mb-3 block flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Imagens de Referência
                    </Label>

                    <div
                        onClick={() => imagesInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                    >
                        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm font-medium text-gray-700">
                            Adicionar imagens de referência
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Até 5 imagens - PNG ou JPG
                        </p>
                    </div>

                    <input
                        ref={imagesInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesUpload}
                        className="hidden"
                    />

                    {data.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mt-3">
                            {data.images.map((image, index) => (
                                <div
                                    key={index}
                                    className="relative border-2 border-gray-200 rounded-lg p-3 bg-gray-50"
                                >
                                    <div className="flex items-center gap-2">
                                        <Image className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{image.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {(image.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                        Opcional - Use para inspirar o estilo visual ou incluir produtos específicos
                    </p>
                </div>

                <div>
                    <Label htmlFor="restrictions" className="text-base font-medium mb-2 block">
                        Restrições e Observações
                    </Label>
                    <Textarea
                        id="restrictions"
                        value={data.restrictions}
                        onChange={(e) => onChange({ restrictions: e.target.value })}
                        placeholder="Ex: Não usar emojis, evitar cores vermelhas, incluir selo de garantia, texto deve ser legível em mobile..."
                        className="min-h-[120px] resize-none"
                        maxLength={500}
                    />
                    <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">
                            Qualquer restrição ou requisito especial
                        </span>
                        <span className="text-xs text-gray-500">
                            {data.restrictions.length}/500
                        </span>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2 text-amber-900">⚡ Dicas de Assets</h4>
                    <ul className="text-xs text-amber-800 space-y-1">
                        <li>• Logo em alta resolução garante melhor integração</li>
                        <li>• Imagens de referência ajudam a IA entender seu estilo</li>
                        <li>• Seja específico nas restrições para evitar retrabalho</li>
                        <li>• A IA nunca adiciona texto dentro da imagem gerada</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
