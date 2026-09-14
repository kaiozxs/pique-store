import { defineRouteConfig } from "@medusajs/admin-sdk"
import { PencilSquare, Newspaper } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Drawer,
  FocusModal,
  Heading,
  Input,
  Label,
  Select,
  Table,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../../lib/sdk"

type TipStatus = "draft" | "published"
type TipPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body: string
  cover_image: string | null
  status: TipStatus
  published_at: string | null
}

type FormState = {
  title: string
  slug: string
  excerpt: string
  body: string
  cover_image: string
  status: TipStatus
}

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  cover_image: "",
  status: "draft",
}

const TIPS_QUERY_KEY = ["tip-posts"]

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const DicasPage = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: TIPS_QUERY_KEY,
    queryFn: () => sdk.client.fetch<{ tip_posts: TipPost[]; count: number }>("/admin/dicas"),
  })

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);

  const [editing, setEditing] = useState<TipPost | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);

  const create = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/dicas", {
        method: "POST",
        body: {
          ...createForm,
          excerpt: createForm.excerpt || null,
          cover_image: createForm.cover_image || null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIPS_QUERY_KEY });
      toast.success("Dica criada");
      setCreateOpen(false);
      setCreateForm(EMPTY_FORM);
      setSlugTouched(false);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Falha ao criar";
      toast.error(message);
    },
  });

  const update = useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/dicas/${editing?.id}`, {
        method: "POST",
        body: {
          ...editForm,
          excerpt: editForm.excerpt || null,
          cover_image: editForm.cover_image || null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIPS_QUERY_KEY });
      toast.success("Dica atualizada");
      setEditing(null);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Falha ao salvar";
      toast.error(message);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => sdk.client.fetch(`/admin/dicas/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIPS_QUERY_KEY });
      toast.success("Dica removida");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Falha ao remover";
      toast.error(message);
    },
  });

  const openEdit = (post: TipPost) => {
    setEditing(post);
    setEditForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      body: post.body,
      cover_image: post.cover_image ?? "",
      status: post.status,
    });
  };

  return (
    <Container>
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Dicas</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Conteúdos publicados no site (texto, capa, status).
          </Text>
        </div>
        <Button size="small" onClick={() => setCreateOpen(true)}>
          Criar dica
        </Button>
      </div>

      <div className="border-t">
        {isLoading ? (
          <div className="px-6 py-8">
            <Text size="small" className="text-ui-fg-subtle">
              Carregando...
            </Text>
          </div>
        ) : (data?.tip_posts.length ?? 0) === 0 ? (
          <div className="px-6 py-8">
            <Text size="small" className="text-ui-fg-subtle">
              Nenhuma dica criada ainda.
            </Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Título</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data?.tip_posts.map((post) => (
                <Table.Row key={post.id}>
                  <Table.Cell>{post.title}</Table.Cell>
                  <Table.Cell>
                    <Badge color={post.status === "published" ? "green" : "grey"}>
                      {post.status === "published" ? "Publicado" : "Rascunho"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex justify-end gap-x-2">
                      <Button size="small" variant="secondary" onClick={() => openEdit(post)}>
                        <PencilSquare />
                      </Button>
                      <Button
                        size="small"
                        variant="danger"
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(post.id)}
                      >
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

      {/* Criar */}
      <FocusModal open={createOpen} onOpenChange={setCreateOpen}>
        <FocusModal.Content>
          <div className="flex h-full flex-col overflow-hidden">
            <FocusModal.Header>
              <div className="flex items-center justify-end gap-x-2">
                <FocusModal.Close asChild>
                  <Button size="small" variant="secondary" disabled={create.isPending}>
                    Cancelar
                  </Button>
                </FocusModal.Close>
                <Button size="small" isLoading={create.isPending} onClick={() => create.mutate()}>
                  Criar
                </Button>
              </div>
            </FocusModal.Header>
            <FocusModal.Body className="flex-1 overflow-auto p-6">
              <div className="mx-auto flex max-w-lg flex-col gap-y-4">
                <div className="flex flex-col gap-y-2">
                  <Label size="small">Título</Label>
                  <Input
                    value={createForm.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setCreateForm((f) => ({
                        ...f,
                        title,
                        slug: slugTouched ? f.slug : slugify(title),
                      }));
                    }}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label size="small">Slug (URL)</Label>
                  <Input
                    value={createForm.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setCreateForm((f) => ({ ...f, slug: e.target.value }));
                    }}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label size="small">Resumo</Label>
                  <Input
                    value={createForm.excerpt}
                    onChange={(e) => setCreateForm((f) => ({ ...f, excerpt: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label size="small">Texto</Label>
                  <Textarea
                    rows={8}
                    value={createForm.body}
                    onChange={(e) => setCreateForm((f) => ({ ...f, body: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label size="small">Imagem de capa (URL)</Label>
                  <Input
                    value={createForm.cover_image}
                    onChange={(e) => setCreateForm((f) => ({ ...f, cover_image: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label size="small">Status</Label>
                  <Select
                    value={createForm.status}
                    onValueChange={(value) => setCreateForm((f) => ({ ...f, status: value as TipStatus }))}
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="draft">Rascunho</Select.Item>
                      <Select.Item value="published">Publicado</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
              </div>
            </FocusModal.Body>
          </div>
        </FocusModal.Content>
      </FocusModal>

      {/* Editar */}
      <Drawer open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Editar dica</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex-1 overflow-auto p-4">
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-2">
                <Label size="small">Título</Label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label size="small">Slug (URL)</Label>
                <Input
                  value={editForm.slug}
                  onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label size="small">Resumo</Label>
                <Input
                  value={editForm.excerpt}
                  onChange={(e) => setEditForm((f) => ({ ...f, excerpt: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label size="small">Texto</Label>
                <Textarea
                  rows={8}
                  value={editForm.body}
                  onChange={(e) => setEditForm((f) => ({ ...f, body: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label size="small">Imagem de capa (URL)</Label>
                <Input
                  value={editForm.cover_image}
                  onChange={(e) => setEditForm((f) => ({ ...f, cover_image: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label size="small">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm((f) => ({ ...f, status: value as TipStatus }))}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="draft">Rascunho</Select.Item>
                    <Select.Item value="published">Publicado</Select.Item>
                  </Select.Content>
                </Select>
              </div>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Drawer.Close asChild>
                <Button size="small" variant="secondary" disabled={update.isPending}>
                  Cancelar
                </Button>
              </Drawer.Close>
              <Button size="small" isLoading={update.isPending} onClick={() => update.mutate()}>
                Salvar
              </Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Dicas",
  icon: Newspaper,
})

export default DicasPage
