import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { Button, Container, Heading, Input, Label, Switch, Text, Textarea, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../lib/sdk"

const PresaleWidget = ({ data: product }: DetailWidgetProps<AdminProduct>) => {
  const queryClient = useQueryClient()
  const metadata = (product.metadata ?? {}) as Record<string, unknown>

  const [isPresale, setIsPresale] = useState(Boolean(metadata.is_presale))
  const [message, setMessage] = useState(typeof metadata.presale_message === "string" ? metadata.presale_message : "")
  const [shipDate, setShipDate] = useState(
    typeof metadata.estimated_ship_date === "string" ? metadata.estimated_ship_date : ""
  )

  const save = useMutation({
    mutationFn: () =>
      sdk.admin.product.update(product.id, {
        metadata: {
          ...product.metadata,
          is_presale: isPresale,
          presale_message: message || null,
          estimated_ship_date: shipDate || null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["product", product.id] })
      toast.success("Pré-venda atualizada")
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar")
    },
  })

  return (
    <Container>
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Pré-venda</Heading>
        <Button size="small" isLoading={save.isPending} onClick={() => save.mutate()}>
          Salvar
        </Button>
      </div>

      <div className="flex flex-col gap-y-4 border-t px-6 py-4">
        <div className="flex items-center gap-x-2">
          <Switch checked={isPresale} onCheckedChange={setIsPresale} />
          <Text size="small">Este produto é pré-venda</Text>
        </div>

        {isPresale && (
          <>
            <div className="flex flex-col gap-y-2">
              <Label size="small">Mensagem exibida ao cliente</Label>
              <Textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Peça de pré-venda — produção sob demanda."
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label size="small">Prazo estimado de envio</Label>
              <Input type="date" value={shipDate} onChange={(e) => setShipDate(e.target.value)} />
            </div>
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details",
})

export default PresaleWidget
