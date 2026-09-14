import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Sparkles } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../../lib/sdk"

type WabMedia = { url: string; type: "image" | "video" }
type WabStatus = "em_construcao" | "revelado" | "oculto"
type WabContent = {
  status: WabStatus
  title: string | null
  body: string | null
  media: { items: WabMedia[] } | null
}

const STATUS_OPTIONS: { value: WabStatus; label: string }[] = [
  { value: "em_construcao", label: "Em construção" },
  { value: "revelado", label: "Revelado" },
  { value: "oculto", label: "Oculto" },
]

const WAB_QUERY_KEY = ["wab-content"]

const WabPage = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: WAB_QUERY_KEY,
    queryFn: () => sdk.client.fetch<{ wab_content: WabContent }>("/admin/wab"),
  })

  const [status, setStatus] = useState<WabStatus>("em_construcao")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [media, setMedia] = useState<WabMedia[]>([])

  useEffect(() => {
    if (!data) return
    setStatus(data.wab_content.status)
    setTitle(data.wab_content.title ?? "")
    setBody(data.wab_content.body ?? "")
    setMedia(data.wab_content.media?.items ?? [])
  }, [data])

  const save = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/wab", {
        method: "POST",
        body: {
          status,
          title: title || null,
          body: body || null,
          media: media.length > 0 ? { items: media } : null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WAB_QUERY_KEY })
      toast.success("WAB atualizado")
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Falha ao salvar o WAB"
      toast.error(message)
    },
  })

  const updateMediaItem = (index: number, patch: Partial<WabMedia>) => {
    setMedia((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const removeMediaItem = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index))
  }

  if (isLoading) {
    return (
      <Container className="flex items-center justify-center py-16">
        <Text size="small" className="text-ui-fg-subtle">
          Carregando...
        </Text>
      </Container>
    )
  }

  return (
    <Container>
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">WAB</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Área de mistério do site — texto, mídia e estado de publicação.
          </Text>
        </div>
        <Button size="small" isLoading={save.isPending} onClick={() => save.mutate()}>
          Salvar
        </Button>
      </div>

      <div className="flex flex-col gap-y-6 border-t px-6 py-6">
        <div className="flex flex-col gap-y-2">
          <Label size="small">Estado de publicação</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as WabStatus)}>
            <Select.Trigger>
              <Select.Value placeholder="Selecione o estado" />
            </Select.Trigger>
            <Select.Content>
              {STATUS_OPTIONS.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Text size="small" className="text-ui-fg-subtle">
            Só é exibido ao público quando estiver "Revelado". Nos outros estados, o site mostra
            um teaser genérico de "em construção".
          </Text>
        </div>

        <div className="flex flex-col gap-y-2">
          <Label size="small">Título</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Opcional" />
        </div>

        <div className="flex flex-col gap-y-2">
          <Label size="small">Texto</Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Opcional"
            rows={5}
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <div className="flex items-center justify-between">
            <Label size="small">Mídia</Label>
            <Button
              size="small"
              variant="secondary"
              onClick={() => setMedia((prev) => [...prev, { url: "", type: "image" }])}
            >
              Adicionar
            </Button>
          </div>
          {media.length === 0 && (
            <Text size="small" className="text-ui-fg-subtle">
              Nenhuma imagem ou vídeo adicionado.
            </Text>
          )}
          {media.map((item, index) => (
            <div key={index} className="flex items-center gap-x-2">
              <Input
                value={item.url}
                onChange={(e) => updateMediaItem(index, { url: e.target.value })}
                placeholder="https://..."
                className="flex-1"
              />
              <Select
                value={item.type}
                onValueChange={(value) => updateMediaItem(index, { type: value as WabMedia["type"] })}
              >
                <Select.Trigger className="w-32">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="image">Imagem</Select.Item>
                  <Select.Item value="video">Vídeo</Select.Item>
                </Select.Content>
              </Select>
              <Button size="small" variant="danger" onClick={() => removeMediaItem(index)}>
                Remover
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "WAB",
  icon: Sparkles,
})

export default WabPage
