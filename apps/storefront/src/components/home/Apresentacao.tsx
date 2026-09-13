export function Apresentacao() {
  return (
    <section id="apresentacao" className="bg-paper text-ink">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-24 sm:px-8 sm:py-32 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
        <div>
          <div className="mb-6 font-accent text-xl italic text-accent">o propósito</div>
          <h2 className="font-display text-3xl leading-[1.08] tracking-tight sm:text-5xl">
            A COMPARAÇÃO É IRRELEVANTE.
            <br />
            O PADRÃO, INEGOCIÁVEL.
          </h2>
        </div>
        <div className="pt-2">
          <p className="mb-8 text-base leading-relaxed text-ink/70">
            PIQUE nasce da fricção entre a elegância do alfaiate e a energia bruta da rua. Não
            seguimos o que já existe — impomos o que vem a seguir. Cada peça é pensada para durar
            além da estação, além da tendência, além da comparação.
          </p>
          <div className="border-l-2 border-accent pl-5">
            <p className="font-accent text-xl italic leading-snug">
              &ldquo;Não vestimos tendência. Vestimos padrão.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
