// Bandeiras aceitas no checkout, desenhadas aqui em monocromático branco sobre
// o preto do rodapé.
//
// São representações próprias, não os arquivos de marca oficiais: o símbolo da
// Mastercard (os dois círculos) é fiel, mas Visa, Elo e Amex usam tipografia
// exclusiva delas, então aqui são aproximações. Pra ficar idêntico ao logo
// real basta trocar cada <svg> abaixo pelo arquivo oficial da bandeira — o
// resto do layout não muda.
//
// Só as bandeiras que o checkout realmente aceita hoje (cartão de crédito e
// débito via Mercado Pago). Pix e boleto ficam de fora de propósito: ainda não
// estão habilitados, e exibir o selo seria prometer o que a loja não faz. No
// dia em que forem ligados, acrescentar os dois aqui é o único passo.

const FONT = "Archivo, Helvetica, Arial, sans-serif";
const CLASSE = "h-6 w-auto text-paper/85 transition-colors";

function Visa() {
  return (
    <svg viewBox="0 0 46 24" className={CLASSE} role="img" aria-label="Visa">
      <text
        x="23" y="17" textAnchor="middle" fontFamily={FONT} fontSize="15"
        fontWeight="700" fontStyle="italic" letterSpacing="0.6" fill="currentColor"
      >
        VISA
      </text>
    </svg>
  );
}

function Mastercard() {
  return (
    <svg viewBox="0 0 46 24" className={CLASSE} role="img" aria-label="Mastercard">
      {/* Os dois círculos que se cruzam. Em monocromático o da direita fica
          translúcido, então a interseção aparece mais clara — é o que faz a
          marca ser reconhecida sem as cores. */}
      <circle cx="19" cy="12" r="9" fill="currentColor" />
      <circle cx="27" cy="12" r="9" fill="currentColor" fillOpacity="0.55" />
    </svg>
  );
}

function Elo() {
  return (
    <svg viewBox="0 0 46 24" className={CLASSE} role="img" aria-label="Elo">
      <text
        x="23" y="18" textAnchor="middle" fontFamily={FONT} fontSize="17"
        fontWeight="700" letterSpacing="-0.4" fill="currentColor"
      >
        elo
      </text>
    </svg>
  );
}

function Amex() {
  return (
    <svg viewBox="0 0 46 24" className={CLASSE} role="img" aria-label="American Express">
      <text
        x="23" y="16" textAnchor="middle" fontFamily={FONT} fontSize="11"
        fontWeight="700" letterSpacing="0.5" fill="currentColor"
      >
        AMEX
      </text>
    </svg>
  );
}

export function PaymentBrands() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
      <Visa />
      <Mastercard />
      <Elo />
      <Amex />
    </div>
  );
}
