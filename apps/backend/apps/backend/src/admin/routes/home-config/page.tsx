import { defineRouteConfig } from "@medusajs/admin-sdk"
import { SquaresPlus } from "@medusajs/icons"
import { Button, Container, Heading, Input, Label, Switch, Text, Textarea, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../../lib/sdk"

type SectionType = "hero" | "drop_destaque" | "wab_teaser" | "dicas_destaque" | "apresentacao"

type Section = {
  type: SectionType
  label: string
  position: number
  visible: boolean
  config: Record<string, string> | null
}

type HomeConfigResponse = { sections: Section[] }

const HOME_CONFIG_QUERY_KEY = ["home-config"]

const HERO_FIELDS: { key: string; label: string; multiline?: boolean }[] = [
  { key: "headline_line1", label: "Título — linha 1" },
  { key: "headline_highlight", label: "Título — linha 2 (destaque)" },
  { key: "subtext", label: "Texto de apoio", multiline: true },
  { key: "button_label", label: "Texto do botão" },
  { key: "button_href", label: "Link do botão" },
]

const APRESENTACAO_FIELDS: { key: string; label: string; multiline?: boolean }[] = [
  { key: "kicker", label: "Chamada pequena" },
  { key: "headline_line1", label: "Título — linha 1" },
  { key: "headline_line2", label: "Título — linha 2" },
  { key: "body", label: "Texto principal", multiline: true },
  { key: "quote", label: "Citação em destaque", multiline: true },
]

const CONFIG_FIELDS: Partial<Record<SectionType, typeof HERO_FIELDS>> = {
  hero: HERO_FIELDS,
  apresentacao: APRESENTACAO_FIELDS,
}

const HomeConfigPage = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: HOME_CONFIG_QUERY_KEY,
    queryFn: () => sdk.client.fetch<HomeConfigResponse>("/admin/home-config"),
  })

  const [sections, setSections] = useState<Section[]>([])

  useEffect(() => {
    if (data) setSections(data.sections)
  }, [data])

  const save = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/home-config", {
        method: "POST",
        body: {
          sections: sections.map((s, index) => ({
            type: s.type,
            position: index,
            visible: s.visible,
            config: s.config,
          })),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOME_CONFIG_QUERY_KEY })
      toast.success("Home atualizada")
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Falha ao salvar"
      toast.error(message)
    },
  })

  const moveSection = (index: number, direction: -1 | 1) => {
    setSections((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const toggleVisible = (type: SectionType) => {
    setSections((prev) => prev.map((s) => (s.type === type ? { ...s, visible: !s.visible } : s)))
  }

  const updateConfigField = (type: SectionType, key: string, value: string) => {
    setSections((prev) =>
      prev.map((s) => (s.type === type ? { ...s, config: { ...(s.config ?? {}), [key]: value } } : s))
    )
  }

  if (isLoading) {
    return (
      <Container className="px-6 py-8">
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
          <Heading level="h2">Home</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Ordem, visibilidade e textos das seções da página inicial.
          </Text>
        </div>
        <Button size="small" isLoading={save.isPending} onClick={() => save.mutate()}>
          Salvar
        </Button>
      </div>

      <div className="flex flex-col gap-y-4 border-t px-6 py-6">
        {sections.map((section, index) => {
          const fields = CONFIG_FIELDS[section.type]
          return (
            <div key={section.type} className="border border-ui-border-base p-4">
              <div className="flex items-center justify-between">
                <Text weight="plus">{section.label}</Text>
                <div className="flex items-center gap-x-3">
                  <div className="flex items-center gap-x-2">
                    <Switch checked={section.visible} onCheckedChange={() => toggleVisible(section.type)} />
                    <Text size="small" className="text-ui-fg-subtle">
                      Visível
                    </Text>
                  </div>
                  <Button size="small" variant="secondary" disabled={index === 0} onClick={() => moveSection(index, -1)}>
                    ↑
                  </Button>
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={index === sections.length - 1}
                    onClick={() => moveSection(index, 1)}
                  >
                    ↓
                  </Button>
                </div>
              </div>

              {fields && (
                <div className="mt-4 flex flex-col gap-y-3 border-t border-ui-border-base pt-4">
                  {fields.map((field) => (
                    <div key={field.key} className="flex flex-col gap-y-1">
                      <Label size="small">{field.label}</Label>
                      {field.multiline ? (
                        <Textarea
                          value={section.config?.[field.key] ?? ""}
                          onChange={(e) => updateConfigField(section.type, field.key, e.target.value)}
                          rows={3}
                        />
                      ) : (
                        <Input
                          value={section.config?.[field.key] ?? ""}
                          onChange={(e) => updateConfigField(section.type, field.key, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Home",
  icon: SquaresPlus,
})

export default HomeConfigPage
