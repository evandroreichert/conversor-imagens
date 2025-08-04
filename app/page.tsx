"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Upload, Download, ImageIcon, Loader2, Zap} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
// Removido: import Image from "next/image"

export default function ImageConverter() {
  const [inputFile, setInputFile] = useState<File | null>(null)
  const [outputFormat, setOutputFormat] = useState<string>("png")
  const [quality, setQuality] = useState<number[]>([80])
  const [converting, setConverting] = useState(false)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [inputPreview, setInputPreview] = useState<string | null>(null)
  const [outputSize, setOutputSize] = useState<number | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo de imagem.",
          variant: "destructive",
        })
        return
      }

      setInputFile(file)
      setOutputUrl(null)
      setOutputSize(null)

      const reader = new FileReader()
      reader.onload = (e) => {
        setInputPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const convertImage = async () => {
    if (!inputFile || !canvasRef.current) return

    setConverting(true)

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Não foi possível obter contexto do canvas")

      const img = new window.Image() // Mantido para garantir o uso do construtor nativo
      img.crossOrigin = "anonymous"

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          resolve()
        }
        img.onerror = () => reject(new Error("Erro ao carregar imagem"))
        img.src = URL.createObjectURL(inputFile)
      })

      let mimeType: string
      let qualityValue: number | undefined

      switch (outputFormat) {
        case "jpeg":
          mimeType = "image/jpeg"
          qualityValue = quality[0] / 100
          break
        case "webp":
          mimeType = "image/webp"
          qualityValue = quality[0] / 100
          break
        case "png":
        default:
          mimeType = "image/png"
          qualityValue = undefined
          break
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Erro ao converter imagem"))
            }
          },
          mimeType,
          qualityValue,
        )
      })

      const url = URL.createObjectURL(blob)
      setOutputUrl(url)
      setOutputSize(blob.size)

      toast({
        title: "Conversão concluída!",
        description: `Imagem convertida para ${outputFormat.toUpperCase()} com sucesso.`,
      })
    } catch (error) {
      console.error("Erro na conversão:", error)
      toast({
        title: "Erro na conversão",
        description: "Falha ao converter a imagem. Verifique o formato e tente novamente.",
        variant: "destructive",
      })
    } finally {
      setConverting(false)
    }
  }

  const downloadImage = () => {
    if (!outputUrl || !inputFile) return

    const link = document.createElement("a")
    link.href = outputUrl
    const originalName = inputFile.name.split(".")[0]
    link.download = `${originalName}_converted.${outputFormat}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download iniciado",
      description: "Sua imagem convertida está sendo baixada.",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getCompressionRatio = () => {
    if (!inputFile || !outputSize) return null
    const ratio = ((inputFile.size - outputSize) / inputFile.size) * 100
    return ratio > 0 ? ratio.toFixed(1) : "0"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 relative overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Header with Seanet Logo */}
        <div className="text-center space-y-3 sm:space-y-4 py-4 sm:py-6">
          <div className="flex justify-center mb-4 sm:mb-6">
            {/* Alterado para tag <img> HTML padrão */}
            <img src="/seanet-logo-dark.png" alt="Seanet" className="h-8 sm:h-12 w-auto" />
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            {/* Título "Conversor de Imagens" agora é branco */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Conversor de Imagens
            </h1>
          </div>

          <div className="flex items-center justify-center gap-2 text-blue-400">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium">Powered for Seanet Telecom</span>
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse delay-150" />
          </div>
        </div>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-2xl shadow-blue-500/10">
          <CardHeader className="border-b border-slate-700/50 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-slate-100 text-lg sm:text-xl">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              Upload da Imagem
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Selecione uma imagem para conversão instantânea
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="space-y-2">
              <Label htmlFor="file-input" className="text-slate-200 font-medium text-sm">
                Arquivo de Imagem
              </Label>
              <Input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer bg-slate-700/50 border-slate-600 text-slate-200 file:bg-gradient-to-r file:from-blue-500 file:to-cyan-500 file:text-white file:border-0 file:rounded-md hover:bg-slate-700/70 transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="format-select" className="text-slate-200 font-medium text-sm">
                  Formato de Saída
                </Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-700/70">
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="png" className="text-slate-200 focus:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        PNG (sem perdas)
                      </div>
                    </SelectItem>
                    <SelectItem value="jpeg" className="text-slate-200 focus:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        JPEG (comprimido)
                      </div>
                    </SelectItem>
                    <SelectItem value="webp" className="text-slate-200 focus:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        WebP (moderno)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(outputFormat === "jpeg" || outputFormat === "webp") && (
                <div className="space-y-3">
                  <Label className="text-slate-200 font-medium flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-blue-400" />
                    Qualidade: {quality[0]}%
                  </Label>
                  <Slider value={quality} onValueChange={setQuality} max={100} min={1} step={1} className="w-full" />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Menor tamanho</span>
                    <span>Melhor qualidade</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={convertImage}
              disabled={!inputFile || converting}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2.5 sm:py-3 rounded-lg shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.02] text-sm sm:text-base"
            >
              {converting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  Convertendo...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Converter Imagem
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {(inputPreview || outputUrl) && (
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-2xl shadow-blue-500/10">
            <CardHeader className="border-b border-slate-700/50 p-4 sm:p-6">
              <CardTitle className="text-slate-100 flex items-center gap-2 text-lg sm:text-xl">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                  <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                Preview das Imagens
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                Compare o antes e depois da conversão
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {inputPreview && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-center text-slate-200 flex items-center justify-center gap-2 text-sm sm:text-base">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      Original
                    </h3>
                    <div className="border border-slate-600 rounded-xl overflow-hidden bg-slate-900/50 shadow-lg">
                      <img
                        src={inputPreview || "/placeholder.svg"}
                        alt="Imagem original"
                        className="w-full h-48 sm:h-64 object-contain"
                      />
                    </div>
                    {inputFile && (
                      <div className="text-sm text-slate-400 text-center space-y-1 bg-slate-700/30 rounded-lg p-3">
                        <p className="font-medium text-slate-300 text-xs sm:text-sm truncate">{inputFile.name}</p>
                        <p className="text-blue-400 text-xs sm:text-sm">{formatFileSize(inputFile.size)}</p>
                      </div>
                    )}
                  </div>
                )}

                {outputUrl && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-center text-slate-200 flex items-center justify-center gap-2 text-sm sm:text-base">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      Convertida ({outputFormat.toUpperCase()})
                    </h3>
                    <div className="border border-slate-600 rounded-xl overflow-hidden bg-slate-900/50 shadow-lg">
                      <img
                        src={outputUrl || "/placeholder.svg"}
                        alt="Imagem convertida"
                        className="w-full h-48 sm:h-64 object-contain"
                      />
                    </div>
                    {outputSize && (
                      <div className="text-sm text-slate-400 text-center space-y-2 bg-slate-700/30 rounded-lg p-3">
                        <p className="text-cyan-400 font-medium text-xs sm:text-sm">{formatFileSize(outputSize)}</p>
                        {getCompressionRatio() && (
                          <p className="text-green-400 font-semibold flex items-center justify-center gap-1 text-xs sm:text-sm">
                            <Zap className="h-3 w-3" />
                            Redução: {getCompressionRatio()}%
                          </p>
                        )}
                      </div>
                    )}
                    <Button
                      onClick={downloadImage}
                      className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-semibold py-2.5 sm:py-3 rounded-lg shadow-lg shadow-green-500/25 transition-all duration-300 hover:shadow-green-500/40 hover:scale-[1.02] text-sm sm:text-base"
                    >
                      <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Baixar Imagem
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  )
}
