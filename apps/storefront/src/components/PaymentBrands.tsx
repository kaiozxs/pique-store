// Bandeiras aceitas no checkout, desenhadas aqui em monocromático sobre o
// preto do rodapé.
//
// São representações próprias, não os arquivos de marca oficiais: o losango do
// Pix e os círculos da Mastercard são fiéis à forma, mas Visa, Elo e Amex usam
// tipografia exclusiva delas, então aqui são aproximações. Pra ficar idêntico
// basta trocar cada <svg> pelo arquivo oficial da bandeira — o layout não muda.
//
// Todos partem do mesmo viewBox e da mesma altura para terem peso visual
// parecido: sem isso, uma marca de três letras some ao lado de uma de quatro.
//
// ATENÇÃO: o Pix aparece aqui por decisão da marca, mas o checkout AINDA NÃO
// aceita Pix — hoje só cartão de crédito e débito via Mercado Pago. Enquanto o
// meio não for habilitado na conta do Mercado Pago, o rodapé promete um
// pagamento que a pessoa não encontra na hora de fechar a compra. Assim que o
// Pix estiver ligado de verdade, este comentário sai. Boleto continua de fora
// pelo mesmo motivo.

const FONT = "Poppins, Helvetica, Arial, sans-serif";
const CLASSE = "h-[26px] w-auto text-paper/85 transition-colors";

function Pix() {
  return (
    <svg viewBox="0 0 46 26" className={CLASSE} role="img" aria-label="Pix">
      {/* Losango partido em quatro por um corte em cruz. Cada parte é o
          quarto exato do losango encolhido em torno do próprio centroide, que
          é o que deixa o respiro igual nos quatro lados — na tentativa
          anterior as pontas não fechavam e virava uma estrela vazada. */}
      <g fill="currentColor">
        <path d="M23.36 4.72L31.28 12.64L23.36 12.64Z" />
        <path d="M31.28 13.36L23.36 21.28L23.36 13.36Z" />
        <path d="M22.64 21.28L14.72 13.36L22.64 13.36Z" />
        <path d="M14.72 12.64L22.64 4.72L22.64 12.64Z" />
      </g>
    </svg>
  );
}

function Visa() {
  return (
    <svg viewBox="0 0 46 26" className={CLASSE} role="img" aria-label="Visa">
      <text
        x="23"
        y="18.5"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="15.5"
        fontWeight="700"
        fontStyle="italic"
        letterSpacing="0.2"
        fill="currentColor"
      >
        VISA
      </text>
    </svg>
  );
}

function Mastercard() {
  return (
    <svg viewBox="0 0 46 26" className={CLASSE} role="img" aria-label="Mastercard">
      {/* Sem as cores, o que identifica a marca é a lente do meio ter um tom
          diferente dos dois círculos. Sobrepor duas metades translúcidas da
          MESMA cor não bastava: a área comum ficava idêntica ao resto e o
          desenho virava um oito deitado. Aqui os dois círculos são
          translúcidos e a interseção é pintada por cima, recortada por um
          deles, em cor cheia. */}
      <defs>
        <clipPath id="pique-mc-esq">
          <circle cx="18.5" cy="13" r="7.4" />
        </clipPath>
      </defs>
      <circle cx="18.5" cy="13" r="7.4" fill="currentColor" fillOpacity="0.55" />
      <circle cx="27.5" cy="13" r="7.4" fill="currentColor" fillOpacity="0.55" />
      <circle cx="27.5" cy="13" r="7.4" fill="currentColor" clipPath="url(#pique-mc-esq)" />
    </svg>
  );
}

function Elo() {
  return (
    <svg viewBox="0 0 46 26" className={CLASSE} role="img" aria-label="Elo">
      <text
        x="23"
        y="19"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="17"
        fontWeight="700"
        letterSpacing="-0.3"
        fill="currentColor"
      >
        elo
      </text>
    </svg>
  );
}

function Amex() {
  return (
    <svg viewBox="0 0 46 26" className={CLASSE} role="img" aria-label="American Express">
      <text
        x="23"
        y="17.5"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="11"
        fontWeight="700"
        letterSpacing="0.2"
        fill="currentColor"
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
