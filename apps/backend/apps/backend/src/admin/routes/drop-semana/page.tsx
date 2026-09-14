import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Tag } from "@medusajs/icons"
import { Button, Container, Heading, Input, Label, Select, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../../lib/sdk"

type DropStatus = "draft" | "published"
type DropItem = { product_id: string; position: number; product: { id: string; title: string } | null }
type DropWeekResponse = { drop_week: { title: string | null; status: DropStatus } | null; items: DropItem[] }

type ProductOption = { id: string; title: string }

const DROP_QUERY_KEY = ["drop-semana"]

const DropSemanaPage = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: DROP_QUERY_KEY,
    queryFn: () => sdk.client.fetch<DropWeekResponse>("/admin/drop-semana"),
  })

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products-for-drop"],
    queryFn: () => sdk.admin.product.list({ limit: 100, fields: "id,title" }),
  })

  const [title, setTitle] = useState("")
  const [status, setStatus] = useState<DropStatus>("draft")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [addProductId, setAddProductId] = useState("")

  useEffect(() => {
    if (!data) return
    setTitle(data.drop_week?.title ?? "")
    setStatus(data.drop_week?.status ?? "draft")
    setSelectedIds(data.items.map((i) => i.product_id))
  }, [data])

  const products = (productsData?.products ?? []) as ProductOption[]
  const productTitleById = new Map(products.map((p) => [p.id, p.title]))
  const availableToAdd = products.filter((p) => !selectedIds.includes(p.id))

  const save = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/drop-semana", {
        method: "POST",
        body: { title: title || null, status, product_ids: selectedIds },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DROP_QUERY_KEY })
      toast.success("Drop da Semana atualizado")
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Falha ao salvar"
      toast.error(message)
    },
  })

  const moveItem = (index: number, direction: -1 | 1) => {
    setSelectedIds((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const removeItem = (id: string) => {
    setSelectedIds((prev) => prev.filter((p) => p !== id))
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
          <Heading level="h2">Drop da Semana</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Escolha produtos já cadastrados, ordene e publique.
          </Text>
        </div>
        <Button size="small" isLoading={save.isPending} onClick={() => save.mutate()}>
          Salvar
        </Button>
      </div>

      <div className="flex flex-col gap-y-6 border-t px-6 py-6">
        <div className="flex flex-wrap gap-x-6 gap-y-4">
          <div className="flex flex-col gap-y-2">
            <Label size="small">Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Drop da Semana #12"
              className="w-64"
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label size="small">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as DropStatus)}>
              <Select.Trigger className="w-40">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="draft">Rascunho</Select.Item>
                <Select.Item value="published">Publicado</Select.Item>
              </Select.Content>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-y-2">
          <Label size="small">Produtos selecionados</Label>
          {selectedIds.length === 0 && (
            <Text size="small" className="text-ui-fg-subtle">
              Nenhum produto selecionado ainda.
            </Text>
          )}
          {selectedIds.map((id, index) => (
            <div
              key={id}
              className="flex items-center justify-between gap-x-3 border-b border-ui-border-base py-2"
            >
              <Text size="small">{productTitleById.get(id) ?? id}</Text>
              <div className="flex items-center gap-x-1">
                <Button size="small" variant="secondary" disabled={index === 0} onClick={() => moveItem(index, -1)}>
                  ↑
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={index === selectedIds.length - 1}
                  onClick={() => moveItem(index, 1)}
                >
                  ↓
                </Button>
                <Button size="small" variant="danger" onClick={() => removeItem(id)}>
                  Remover
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-end gap-x-3">
          <div className="flex flex-col gap-y-2">
            <Label size="small">Adicionar produto</Label>
            <Select value={addProductId} onValueChange={setAddProductId} disabled={isLoadingProducts}>
              <Select.Trigger className="w-64">
                <Select.Value placeholder="Selecione um produto" />
              </Select.Trigger>
              <Select.Content>
                {availableToAdd.map((p) => (
                  <Select.Item key={p.id} value={p.id}>
                    {p.title}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <Button
            size="small"
            variant="secondary"
            disabled={!addProductId}
            onClick={() => {
              setSelectedIds((prev) => [...prev, addProductId])
              setAddProductId("")
            }}
          >
            Adicionar
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Drop da Semana",
  icon: Tag,
})

export default DropSemanaPage
