import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ShieldCheck } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { sdk } from "../../lib/sdk"

type PieceUnit = {
  id: string
  unique_code: string
  product_variant_id: string
  status: "nao_registrado" | "registrado" | "revogado"
  current_owner_customer_id: string | null
  created_at: string
}

type ProductWithVariants = {
  id: string
  title: string
  variants?: { id: string; title: string }[]
}

const STATUS_LABEL: Record<PieceUnit["status"], string> = {
  nao_registrado: "Não registrado",
  registrado: "Registrado",
  revogado: "Revogado",
}

const PIECES_QUERY_KEY = ["piece-units"]

const PecasPage = () => {
  const queryClient = useQueryClient()

  const { data: piecesData, isLoading: isLoadingPieces } = useQuery({
    queryKey: PIECES_QUERY_KEY,
    queryFn: () => sdk.client.fetch<{ piece_units: PieceUnit[]; count: number }>("/admin/pecas"),
  })

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products-for-pecas"],
    queryFn: () =>
      sdk.admin.product.list({
        limit: 100,
        fields: "id,title,*variants",
      }),
  })

  const [productId, setProductId] = useState("")
  const [variantId, setVariantId] = useState("")
  const [quantity, setQuantity] = useState("1")

  const products = (productsData?.products ?? []) as ProductWithVariants[]
  const variants = useMemo(
    () => products.find((p) => p.id === productId)?.variants ?? [],
    [products, productId]
  )

  const create = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/pecas", {
        method: "POST",
        body: { product_variant_id: variantId, quantity: Number(quantity) },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PIECES_QUERY_KEY })
      toast.success("Peças geradas com sucesso")
      setQuantity("1")
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Falha ao gerar peças"
      toast.error(message)
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => sdk.client.fetch(`/admin/pecas/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PIECES_QUERY_KEY })
      toast.success("Peça removida")
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Falha ao remover peça"
      toast.error(message)
    },
  })

  return (
    <Container>
      <div className="px-6 py-4">
        <Heading level="h2">Verifique seu PIQUE</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Gere identificadores únicos por unidade física e acompanhe titularidade.
        </Text>
      </div>

      <div className="flex flex-wrap items-end gap-x-3 gap-y-4 border-t px-6 py-6">
        <div className="flex flex-col gap-y-2">
          <Label size="small">Produto</Label>
          <Select
            value={productId}
            onValueChange={(value) => {
              setProductId(value)
              setVariantId("")
            }}
            disabled={isLoadingProducts}
          >
            <Select.Trigger className="w-64">
              <Select.Value placeholder="Selecione o produto" />
            </Select.Trigger>
            <Select.Content>
              {products.map((p) => (
                <Select.Item key={p.id} value={p.id}>
                  {p.title}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>

        <div className="flex flex-col gap-y-2">
          <Label size="small">Variante</Label>
          <Select value={variantId} onValueChange={setVariantId} disabled={!productId}>
            <Select.Trigger className="w-48">
              <Select.Value placeholder="Selecione a variante" />
            </Select.Trigger>
            <Select.Content>
              {variants.map((v) => (
                <Select.Item key={v.id} value={v.id}>
                  {v.title}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>

        <div className="flex flex-col gap-y-2">
          <Label size="small">Quantidade</Label>
          <Input
            type="number"
            min={1}
            max={500}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-24"
          />
        </div>

        <Button
          size="small"
          disabled={!variantId || create.isPending}
          isLoading={create.isPending}
          onClick={() => create.mutate()}
        >
          Gerar peças
        </Button>
      </div>

      <div className="border-t">
        {isLoadingPieces ? (
          <div className="px-6 py-8">
            <Text size="small" className="text-ui-fg-subtle">
              Carregando...
            </Text>
          </div>
        ) : (piecesData?.piece_units.length ?? 0) === 0 ? (
          <div className="px-6 py-8">
            <Text size="small" className="text-ui-fg-subtle">
              Nenhuma peça gerada ainda.
            </Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Código</Table.HeaderCell>
                <Table.HeaderCell>Variante</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Titular</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {piecesData?.piece_units.map((piece) => (
                <Table.Row key={piece.id}>
                  <Table.Cell className="font-mono">{piece.unique_code}</Table.Cell>
                  <Table.Cell className="font-mono text-ui-fg-subtle">
                    {piece.product_variant_id}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={
                        piece.status === "registrado"
                          ? "green"
                          : piece.status === "revogado"
                            ? "red"
                            : "grey"
                      }
                    >
                      {STATUS_LABEL[piece.status]}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="font-mono text-ui-fg-subtle">
                    {piece.current_owner_customer_id ?? "—"}
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      size="small"
                      variant="danger"
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(piece.id)}
                    >
                      Remover
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Verifique seu PIQUE",
  icon: ShieldCheck,
})

export default PecasPage
