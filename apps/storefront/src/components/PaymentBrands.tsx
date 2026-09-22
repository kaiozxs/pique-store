// Selos das bandeiras aceitas no checkout, desenhados aqui em preto e branco.
//
// São representações próprias, não os arquivos de marca oficiais: o símbolo da
// Mastercard (os dois círculos) é fiel, mas Visa, Elo e Amex usam tipografia
// exclusiva delas, então aqui são aproximações. Pra ficar idêntico ao logo
// real basta trocar cada <svg> abaixo pelo arquivo oficial da bandeira — o
// resto do layout não muda.
//
// Só as bandeiras que o checkout realmente aceita hoje (cartão via Mercado
// Pago). Pix e boleto ficam de fora de propósito: ainda não estão habilitados
// no Brick, e exibir o selo seria prometer o que a loja não faz.

const SEAL = "h-7 w-11 rounded-[3px] bg-paper";
const FONT = "Archivo, Helvetica, Arial, sans-serif";

function Visa() {
  return (
    <svg viewBox="0 0 44 28" className={SEAL} role="img" aria-label="Visa">
      <text
        x="22"
        y="19"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="12"
        fontWeight="700"
        fontStyle="italic"
        letterSpacing="0.5"
        fill="#0b0b0c"
      >
        VISA
      </text>
    </svg>
  );
}

function Mastercard() {
  return (
    <svg viewBox="0 0 44 28" className={SEAL} role="img" aria-label="Mastercard">
      {/* Os dois círculos que se cruzam. Em preto e branco o da direita fica
          translúcido, então a interseção aparece mais escura — é o que faz a
          marca ser reconhecida sem as cores. */}
      <circle cx="18" cy="14" r="8" fill="#0b0b0c" />
      <circle cx="26" cy="14" r="8" fill="#0b0b0c" fillOpacity="0.45" />
    </svg>
  );
}

function Elo() {
  return (
    <svg viewBox="0 0 44 28" className={SEAL} role="img" aria-label="Elo">
      <text
        x="22"
        y="19"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="13"
        fontWeight="700"
        letterSpacing="-0.2"
        fill="#0b0b0c"
      >
        elo
      </text>
    </svg>
  );
}

function Amex() {
  return (
    <svg viewBox="0 0 44 28" className={SEAL} role="img" aria-label="American Express">
      <text
        x="22"
        y="18"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="9"
        fontWeight="700"
        letterSpacing="0.4"
        fill="#0b0b0c"
      >
        AMEX
      </text>
    </svg>
  );
}

export function PaymentBrands() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Visa />
      <Mastercard />
      <Elo />
      <Amex />
    </div>
  );
}
