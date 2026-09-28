/**
 * Validações de formulário que o navegador não faz sozinho.
 *
 * O `required` do HTML só garante que o campo não está vazio. Campo
 * preenchido errado passa batido e o problema só aparece depois — na hora de
 * emitir a nota, de cobrar ou de entregar —, quando já é tarde e caro.
 */

/**
 * CPF: confere os dois dígitos verificadores.
 *
 * Só contar 11 números não serve: 111.111.111-11 tem 11 números e não existe.
 * A conta abaixo é a da Receita — é ela que separa um CPF de verdade de uma
 * sequência qualquer.
 */
export function cpfValido(valor: string): boolean {
  const n = valor.replace(/\D/g, "");
  if (n.length !== 11) return false;

  // Todos os dígitos iguais passam na conta dos verificadores, mas nenhum
  // desses CPFs é válido — daí a checagem à parte.
  if (/^(\d)\1{10}$/.test(n)) return false;

  const digito = (ateOndeConta: number): number => {
    let soma = 0;
    for (let i = 0; i < ateOndeConta; i++) {
      soma += Number(n[i]) * (ateOndeConta + 1 - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return digito(9) === Number(n[9]) && digito(10) === Number(n[10]);
}

/** Data de nascimento plausível: no passado e de gente viva. */
export function nascimentoValido(iso: string): boolean {
  if (!iso) return false;
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return false;

  const hoje = new Date();
  if (data > hoje) return false;

  const anos = (hoje.getTime() - data.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return anos >= 12 && anos <= 120;
}

export function cepCompleto(valor: string): boolean {
  return valor.replace(/\D/g, "").length === 8;
}
