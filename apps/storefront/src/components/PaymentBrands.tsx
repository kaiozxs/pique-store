// Bandeiras aceitas no checkout, desenhadas aqui em monocromático branco sobre
// o preto do rodapé.
//
// São representações próprias, não os arquivos de marca oficiais: o símbolo da
// Mastercard (os dois círculos) é fiel, mas Visa, Elo e Amex usam tipografia
// exclusiva delas, então aqui são aproximações. Pra ficar idêntico ao logo
// real basta trocar cada <svg> abaixo pelo arquivo oficial da bandeira — o
// resto do layout não muda.
//
// ATENÇÃO: o Pix aparece aqui por decisão da marca, mas o checkout AINDA NÃO
// aceita Pix — hoje só cartão de crédito e débito via Mercado Pago. Enquanto o
// meio não for habilitado na conta do Mercado Pago, o rodapé promete um
// pagamento que a pessoa não encontra na hora de fechar a compra. Assim que o
// Pix estiver ligado de verdade, este comentário sai. Boleto continua de fora
// pelo mesmo motivo.

const FONT = "Archivo, Helvetica, Arial, sans-serif";
const CLASSE = "h-6 w-auto text-paper/85 transition-colors";

function Pix() {
  return (
    <svg viewBox="0 0 46 24" className={CLASSE} role="img" aria-label="Pix">
      {/* Quatro pontas em losango, com o miolo vazado — a forma do símbolo. */}
      <path
        fill="currentColor"
        d="M23 3.2l4.6 4.6h-9.2L23 3.2Z
           M31.8 12l-4.6 4.6v-9.2L31.8 12Z
           M23 20.8l-4.6-4.6h9.2L23 20.8Z
           M14.2 12l4.6-4.6v9.2L14.2 12Z"
      />
    </svg>
  );
}

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
      <circle cx="18" cy="12" r="8" fill="currentColor" />
      <circle cx="28" cy="12" r="8" fill="currentColor" fillOpacity="0.5" />
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
      <Pix />
      <Visa />
      <Mastercard />
      <Elo />
      <Amex />
    </div>
  );
}
