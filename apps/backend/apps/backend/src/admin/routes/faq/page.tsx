import { defineRouteConfig } from "@medusajs/admin-sdk"
import { PencilSquare, QuestionMarkCircle } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Drawer,
  FocusModal,
  Heading,
  Input,
  Label,
  Switch,
  Table,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../../lib/sdk"

type FaqItem = {
  id: string
  category: string
  question: string
  answer: string
  position: number
  published: boolean
}

type FormState = { category: string; question: string; answer: string; published: boolean }
const EMPTY_FORM: FormState = { category: "", question: "", answer: "", published: true }

const FAQ_QUERY_KEY = ["faq-items"]

const FaqPage = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: FAQ_QUERY_KEY,
    queryFn: () => sdk.client.fetch<{ faq_items: FaqItem[] }>("/admin/faq"),
  })

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);

  const create = useMutation({
    mutationFn: () => sdk.client.fetch("/admin/faq", { method: "POST", body: createForm }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAQ_QUERY_KEY });
      toast.success("Pergunta criada");
      setCreateOpen(false);
      setCreateForm(EMPTY_FORM);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Falha ao criar");
    },
  });

  const update = useMutation({
    mutationFn: () => sdk.client.fetch(`/admin/faq/${editing?.id}`, { method: "POST", body: editForm }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAQ_QUERY_KEY });
      toast.success("Pergunta atualizada");
      setEditing(null);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar");
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => sdk.client.fetch(`/admin/faq/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAQ_QUERY_KEY });
      toast.success("Pergunta removida");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Falha ao remover");
    },
  });

  const openEdit = (item: FaqItem) => {
    setEditing(item);
    setEditForm({ category: item.category, question: item.question, answer: item.answer, published: item.published });
  };

  return (
    <Container>
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Ajuda / FAQ</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Perguntas e respostas exibidas na página de Ajuda.
          </Text>
        </div>
        <Button size="small" onClick={() => setCreateOpen(true)}>
          Criar pergunta
        </Button>
      </div>

      <div className="border-t">
        {isLoading ? (
          <div className="px-6 py-8">
            <Text size="small" className="text-ui-fg-subtle">Carregando...</Text>
          </div>
        ) : (data?.faq_items.length ?? 0) === 0 ? (
          <div className="px-6 py-8">
            <Text size="small" className="text-ui-fg-subtle">Nenhuma pergunta criada ainda.</Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Categoria</Table.HeaderCell>
                <Table.HeaderCell>Pergunta</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data?.faq_items.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>{item.category}</Table.Cell>
                  <Table.Cell>{item.question}</Table.Cell>
                  <Table.Cell>
                    <Badge color={item.published ? "green" : "grey"}>
                      {item.published ? "Publicado" : "Oculto"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex justify-end gap-x-2">
                      <Button size="small" variant="secondary" onClick={() => openEdit(item)}>
                        <PencilSquare />
                      </Button>
                      <Button size="small" variant="danger" disabled={remove.isPending} onClick={() => remove.mutate(item.id)}>
                        Remover
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>

      <FocusModal open={createOpen} onOpenChange={setCreateOpen}>
        <FocusModal.Content>
          <div className="flex h-full flex-col overflow-hidden">
            <FocusModal.Header>
              <div className="flex items-center justify-end gap-x-2">
                <FocusModal.Close asChild>
                  <Button size="small" variant="secondary" disabled={create.isPending}>Cancelar</Button>
                </FocusModal.Close>
                <Button size="small" isLoading={create.isPending} onClick={() => create.mutate()}>Criar</Button>
              </div>
            </FocusModal.Header>
            <FocusModal.Body className="flex-1 overflow-auto p-6">
              <div className="mx-auto flex max-w-lg flex-col gap-y-4">
                <div className="flex flex-col gap-y-2">
                  <Label size="small">Categoria</Label>
                  <Input
                    value={createForm.category}
                    placeholder="Ex: Tamanhos e medidas"
                    onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label size="small">Pergunta</Label>
                  <Input
                    value={createForm.question}
                    onChange={(e) => setCreateForm((f) => ({ ...f, question: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label size="small">Resposta</Label>
                  <Textarea
                    rows={5}
                    value={createForm.answer}
                    onChange={(e) => setCreateForm((f) => ({ ...f, answer: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-x-2">
                  <Switch
                    checked={createForm.published}
                    onCheckedChange={(v) => setCreateForm((f) => ({ ...f, published: v }))}
                  />
                  <Text size="small" className="text-ui-fg-subtle">Publicado</Text>
                </div>
              </div>
            </FocusModal.Body>
          </div>
        </FocusModal.Content>
      </FocusModal>

      <Drawer open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Editar pergunta</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex-1 overflow-auto p-4">
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-2">
                <Label size="small">Categoria</Label>
                <Input
                  value={editForm.category}
                  onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label size="small">Pergunta</Label>
                <Input
                  value={editForm.question}
                  onChange={(e) => setEditForm((f) => ({ ...f, question: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label size="small">Resposta</Label>
                <Textarea
                  rows={5}
                  value={editForm.answer}
                  onChange={(e) => setEditForm((f) => ({ ...f, answer: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-x-2">
                <Switch
                  checked={editForm.published}
                  onCheckedChange={(v) => setEditForm((f) => ({ ...f, published: v }))}
                />
                <Text size="small" className="text-ui-fg-subtle">Publicado</Text>
              </div>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Drawer.Close asChild>
                <Button size="small" variant="secondary" disabled={update.isPending}>Cancelar</Button>
              </Drawer.Close>
              <Button size="small" isLoading={update.isPending} onClick={() => update.mutate()}>Salvar</Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Ajuda / FAQ",
  icon: QuestionMarkCircle,
})

export default FaqPage
