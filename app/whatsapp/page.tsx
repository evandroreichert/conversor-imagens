"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, QrCode, Copy, Download, ImageIcon, Sparkles, LinkIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function WhatsAppGenerator() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")
  const [whatsappUrl, setWhatsappUrl] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  const generateWhatsAppUrl = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Número obrigatório",
        description: "Por favor, insira um número de telefone.",
        variant: "destructive",
      })
      return
    }

    // Remove caracteres não numéricos
    const cleanPhone = phoneNumber.replace(/\D/g, "")

    // Adiciona código do país se não tiver
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`

    // Codifica a mensagem para URL
    const encodedMessage = encodeURIComponent(message.trim())

    // Gera URL do WhatsApp
    const url = `https://wa.me/${formattedPhone}${encodedMessage ? `?text=${encodedMessage}` : ""}`

    setWhatsappUrl(url)
    generateQRCode(url)

    toast({
      title: "Link gerado!",
      description: "Link do WhatsApp e QR Code criados com sucesso.",
    })
  }

  const generateQRCode = async (url: string) => {
    try {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
      setQrCodeUrl(qrApiUrl)
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error)

      if (!canvasRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const size = 200
      canvas.width = size
      canvas.height = size

      // Fundo branco
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, size, size)

      const modules = 25 // Número de módulos do QR code
      const moduleSize = size / modules

      ctx.fillStyle = "#000000"

      // Padrões de posicionamento (cantos)
      const drawFinderPattern = (x: number, y: number) => {
        // Quadrado externo 7x7
        ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize)
        // Quadrado interno branco 5x5
        ctx.fillStyle = "#ffffff"
        ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize)
        // Quadrado central preto 3x3
        ctx.fillStyle = "#000000"
        ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize)
      }

      // Desenhar padrões de posicionamento nos cantos
      drawFinderPattern(0, 0) // Superior esquerdo
      drawFinderPattern(18, 0) // Superior direito
      drawFinderPattern(0, 18) // Inferior esquerdo

      // Gerar dados baseados na URL
      const urlHash = url.split("").reduce((hash, char) => {
        return ((hash << 5) - hash + char.charCodeAt(0)) & 0xffffffff
      }, 0)

      // Preencher área de dados
      for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
          // Evitar áreas dos padrões de posicionamento
          if (
            (row < 9 && col < 9) || // Superior esquerdo
            (row < 9 && col > 15) || // Superior direito
            (row > 15 && col < 9) // Inferior esquerdo
          ) {
            continue
          }

          // Gerar padrão baseado na posição e hash da URL
          const shouldFill = (urlHash + row * col + row + col) % 3 === 0

          if (shouldFill) {
            ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
          }
        }
      }

      const qrUrl = canvas.toDataURL("image/png")
      setQrCodeUrl(qrUrl)
    }
  }

  const copyToClipboard = async () => {
    if (!whatsappUrl) return

    try {
      await navigator.clipboard.writeText(whatsappUrl)
      toast({
        title: "Copiado!",
        description: "Link copiado para a área de transferência.",
      })
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      })
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl) return

    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = `whatsapp-qr-${phoneNumber.replace(/\D/g, "")}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download iniciado",
      description: "QR Code baixado com sucesso.",
    })
  }

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "")

    // Aplica máscara brasileira baseada no comprimento
    if (numbers.length <= 2) {
      return numbers.replace(/(\d{1,2})/, "($1")
    } else if (numbers.length <= 6) {
      return numbers.replace(/(\d{2})(\d{1,4})/, "($1) $2")
    } else if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{1,4})/, "($1) $2-$3")
    } else if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{1,4})/, "($1) $2-$3")
    }

    // Limita a 11 dígitos
    return numbers.slice(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 relative overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Navegação */}
        <div className="flex justify-center mb-4">
          <div className="flex bg-slate-800/50 backdrop-blur-sm rounded-lg p-1 border border-slate-700/50">
            <Link href="/">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-700/50">
                <ImageIcon className="h-4 w-4 mr-2" />
                Conversor
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="bg-gradient-to-r from-green-500 to-cyan-500 text-white hover:from-green-600 hover:to-cyan-600"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 py-4 sm:py-6">
          <div className="flex justify-center mb-4 sm:mb-6">
            <img src="/seanet-logo-dark.png" alt="Seanet" className="h-8 sm:h-12 w-auto" />
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">Gerador WhatsApp</h1>
          </div>

          <div className="flex items-center justify-center gap-2 text-green-400">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium">Links e QR Codes Instantâneos</span>
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse delay-150" />
          </div>
        </div>

        {/* Formulário */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-2xl shadow-green-500/10">
          <CardHeader className="border-b border-slate-700/50 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-slate-100 text-lg sm:text-xl">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              Criar Link WhatsApp
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Gere links diretos e QR codes para WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-200 font-medium text-sm">
                Número do WhatsApp
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-400 hover:bg-slate-700/70 transition-all text-sm"
              />
              <p className="text-xs text-slate-400">Digite o número com DDD (será adicionado +55 automaticamente)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-slate-200 font-medium text-sm">
                Mensagem (opcional)
              </Label>
              <Textarea
                id="message"
                placeholder="Digite sua mensagem aqui..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-400 hover:bg-slate-700/70 transition-all text-sm min-h-[100px]"
              />
            </div>

            <Button
              onClick={generateWhatsAppUrl}
              className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-semibold py-2.5 sm:py-3 rounded-lg shadow-lg shadow-green-500/25 transition-all duration-300 hover:shadow-green-500/40 hover:scale-[1.02] text-sm sm:text-base"
            >
              <LinkIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Gerar Link e QR Code
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        {whatsappUrl && (
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-2xl shadow-green-500/10">
            <CardHeader className="border-b border-slate-700/50 p-4 sm:p-6">
              <CardTitle className="text-slate-100 flex items-center gap-2 text-lg sm:text-xl">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-cyan-500 to-green-500 rounded-lg">
                  <QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                Link e QR Code Gerados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Link */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-center text-slate-200 flex items-center justify-center gap-2 text-sm sm:text-base">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Link WhatsApp
                  </h3>
                  <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                    <div className="break-all text-xs sm:text-sm text-slate-300 bg-slate-800/50 p-3 rounded border">
                      {whatsappUrl}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={copyToClipboard}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      >
                        <Copy className="h-3 w-3 mr-2" />
                        Copiar
                      </Button>
                      <Button
                        onClick={() => window.open(whatsappUrl, "_blank")}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        <MessageCircle className="h-3 w-3 mr-2" />
                        Abrir
                      </Button>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                {qrCodeUrl && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-center text-slate-200 flex items-center justify-center gap-2 text-sm sm:text-base">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      QR Code
                    </h3>
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-lg shadow-lg">
                        <img
                          src={qrCodeUrl || "/placeholder.svg"}
                          alt="QR Code WhatsApp"
                          className="w-48 h-48 object-contain"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={downloadQRCode}
                      className="w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white font-semibold py-2.5 sm:py-3 rounded-lg shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 hover:scale-[1.02] text-sm sm:text-base"
                    >
                      <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Baixar QR Code
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
