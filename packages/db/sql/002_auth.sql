-- PIQUE — cria o cliente quando alguém se cadastra (e-mail ou Google).
--
-- Só faz algo no Supabase, onde existe o esquema `auth`. Sem isso, o primeiro
-- login com Google deixaria a pessoa autenticada mas sem cadastro na loja.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  completo text := coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '');
  nome text;
  sobrenome text;
begin
  nome := coalesce(
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'given_name',
    nullif(split_part(completo, ' ', 1), '')
  );
  sobrenome := coalesce(
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'family_name',
    nullif(regexp_replace(completo, '^\S+\s*', ''), '')
  );

  insert into customers (id, email, first_name, last_name)
  values (new.id, new.email, nome, sobrenome)
  on conflict (id) do nothing;

  return new;
end;
$$;

do $$
begin
  if to_regclass('auth.users') is not null then
    drop trigger if exists on_auth_user_created on auth.users;
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_auth_user();
  end if;
end $$;
