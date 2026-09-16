import crypto from "node:crypto"
import {
  AbstractPaymentProvider,
  MedusaError,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"
import { MercadoPagoConfig, Payment, PaymentRefund } from "mercadopago"

type Options = {
  accessToken: string
}

type InjectedDependencies = {
  logger: Logger
}

// Formato guardado no `data` da payment session — parte vem de nós
// (session_id/amount), parte vem do Brick no storefront (token,
// payment_method_id...) depois que o comprador preenche o cartão, e parte
// vem do próprio Mercado Pago depois que o pagamento é criado (mp_payment_id
// pra frente). Nada aqui é sensível (o token do Brick já é de uso único).
type MercadoPagoSessionData = {
  session_id: string
  amount?: number
  currency_code?: string
  token?: string
  payment_method_id?: string
  installments?: number
  issuer_id?: number
  payer_email?: string
  mp_payment_id?: number
  mp_status?: string
  mp_status_detail?: string
  mp_error?: string
}

function mapStatus(mpStatus?: string): PaymentSessionStatus {
  switch (mpStatus) {
    case "approved":
      // Não usamos pré-autorização/captura manual — cartão aprovado já é
      // capturado direto.
      return PaymentSessionStatus.CAPTURED
    case "authorized":
      return PaymentSessionStatus.AUTHORIZED
    case "in_process":
    case "pending":
      return PaymentSessionStatus.PENDING_AUTHORIZATION
    case "rejected":
      return PaymentSessionStatus.ERROR
    case "cancelled":
    case "refunded":
    case "charged_back":
      return PaymentSessionStatus.CANCELED
    default:
      return PaymentSessionStatus.PENDING
  }
}

class MercadoPagoProviderService extends AbstractPaymentProvider<Options> {
  static identifier = "mercadopago"

  protected logger_: Logger
  protected options_: Options
  protected paymentClient_: Payment
  protected refundClient_: PaymentRefund

  static validateOptions(options: Record<string, unknown>) {
    if (!options.accessToken) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "É necessário informar `accessToken` nas opções do provider Mercado Pago."
      )
    }
  }

  constructor(cradle: InjectedDependencies, options: Options) {
    super(cradle, options)
    this.logger_ = cradle.logger
    this.options_ = options
    const client = new MercadoPagoConfig({ accessToken: options.accessToken })
    this.paymentClient_ = new Payment(client)
    this.refundClient_ = new PaymentRefund(client)
  }

  // Nenhum token de cartão existe ainda nesse ponto (o Brick só roda depois,
  // no navegador) — só reserva o valor/moeda e um id de correlação.
  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const sessionId = crypto.randomUUID()
    const data: MercadoPagoSessionData = {
      session_id: sessionId,
      amount: Number(input.amount),
      currency_code: input.currency_code,
    }
    return { id: sessionId, status: PaymentSessionStatus.PENDING, data: data as unknown as Record<string, unknown> }
  }

  // O storefront chama isso duas vezes: uma quando o total do carrinho muda,
  // e outra (com os dados do Brick) assim que o comprador confirma o cartão.
  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const existing = (input.data ?? {}) as MercadoPagoSessionData
    const merged: MercadoPagoSessionData = {
      ...existing,
      ...(input.data ?? {}),
      amount: Number(input.amount),
      currency_code: input.currency_code,
    }
    return { data: merged as unknown as Record<string, unknown> }
  }

  // Chamado no fechamento do carrinho (`cart.complete()`). É aqui que a
  // cobrança de verdade acontece no Mercado Pago, usando o token que o
  // Brick gerou no navegador do comprador.
  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const data = (input.data ?? {}) as MercadoPagoSessionData

    if (data.mp_payment_id) {
      // Pagamento já foi criado antes (ex: uma segunda tentativa de
      // finalizar o carrinho) — só confere o status, não cobra de novo.
      const result = await this.paymentClient_.get({ id: data.mp_payment_id })
      return {
        status: mapStatus(result.status),
        data: { ...data, mp_status: result.status, mp_status_detail: result.status_detail } as unknown as Record<
          string,
          unknown
        >,
      }
    }

    if (!data.token || !data.payment_method_id) {
      // O Brick ainda não rodou / o front ainda não mandou os dados do
      // cartão — não tem como autorizar ainda.
      return { status: PaymentSessionStatus.PENDING, data: data as unknown as Record<string, unknown> }
    }

    try {
      const result = await this.paymentClient_.create({
        body: {
          transaction_amount: data.amount,
          token: data.token,
          description: "Pedido PIQUE",
          installments: data.installments ?? 1,
          payment_method_id: data.payment_method_id,
          issuer_id: data.issuer_id,
          payer: { email: data.payer_email },
          external_reference: data.session_id,
        },
        requestOptions: { idempotencyKey: data.session_id },
      })

      const newData: MercadoPagoSessionData = {
        ...data,
        mp_payment_id: result.id,
        mp_status: result.status,
        mp_status_detail: result.status_detail,
      }
      return { status: mapStatus(result.status), data: newData as unknown as Record<string, unknown> }
    } catch (error: any) {
      this.logger_.error(`Mercado Pago: erro ao autorizar pagamento (session ${data.session_id}): ${error.message}`)
      return {
        status: PaymentSessionStatus.ERROR,
        data: { ...data, mp_error: error.message } as unknown as Record<string, unknown>,
      }
    }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const data = (input.data ?? {}) as MercadoPagoSessionData
    if (!data.mp_payment_id) {
      return { status: PaymentSessionStatus.PENDING }
    }
    const result = await this.paymentClient_.get({ id: data.mp_payment_id })
    return {
      status: mapStatus(result.status),
      data: { ...data, mp_status: result.status } as unknown as Record<string, unknown>,
    }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const data = (input.data ?? {}) as MercadoPagoSessionData
    if (!data.mp_payment_id) return { data: data as unknown as Record<string, unknown> }
    const result = await this.paymentClient_.get({ id: data.mp_payment_id })
    return { data: { ...data, mp_status: result.status } as unknown as Record<string, unknown> }
  }

  // Cartão já sai capturado direto em `authorizePayment` (não usamos
  // pré-autorização) — esse método só existe pra satisfazer a interface.
  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return { data: input.data }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const data = (input.data ?? {}) as MercadoPagoSessionData
    if (!data.mp_payment_id) return { data: data as unknown as Record<string, unknown> }
    try {
      const result = await this.paymentClient_.cancel({ id: String(data.mp_payment_id) })
      return { data: { ...data, mp_status: result.status } as unknown as Record<string, unknown> }
    } catch (error: any) {
      // Um pagamento já aprovado não pode ser "cancelado" (só reembolsado)
      // — nesse caso não é um erro real, só devolve o estado atual.
      this.logger_.warn(`Mercado Pago: não deu pra cancelar o pagamento ${data.mp_payment_id}: ${error.message}`)
      return { data: data as unknown as Record<string, unknown> }
    }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return this.cancelPayment(input)
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const data = (input.data ?? {}) as MercadoPagoSessionData
    if (!data.mp_payment_id) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Não há pagamento do Mercado Pago pra reembolsar.")
    }
    await this.refundClient_.create({
      payment_id: data.mp_payment_id,
      body: { amount: Number(input.amount) },
    })
    return { data: { ...data, mp_status: "refunded" } as unknown as Record<string, unknown> }
  }

  // O Mercado Pago manda só `{type: "payment", data: {id}}` no webhook — o
  // status de verdade a gente sempre busca de volta na API deles (com
  // nosso próprio access token), nunca confia no corpo do webhook em si.
  async getWebhookActionAndData(payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    const body = payload.data as { type?: string; action?: string; data?: { id?: string } }

    if (body?.type !== "payment" || !body.data?.id) {
      return { action: PaymentActions.NOT_SUPPORTED }
    }

    try {
      const result = await this.paymentClient_.get({ id: body.data.id })
      const sessionId = result.external_reference
      if (!sessionId) {
        return { action: PaymentActions.NOT_SUPPORTED }
      }
      const amount = result.transaction_amount ?? 0

      switch (result.status) {
        case "approved":
          return { action: PaymentActions.SUCCESSFUL, data: { session_id: sessionId, amount } }
        case "authorized":
          return { action: PaymentActions.AUTHORIZED, data: { session_id: sessionId, amount } }
        case "in_process":
        case "pending":
          return { action: PaymentActions.PENDING, data: { session_id: sessionId, amount } }
        case "rejected":
          return { action: PaymentActions.FAILED, data: { session_id: sessionId, amount } }
        case "cancelled":
          return { action: PaymentActions.CANCELED, data: { session_id: sessionId, amount } }
        default:
          return { action: PaymentActions.NOT_SUPPORTED }
      }
    } catch (error: any) {
      this.logger_.error(`Mercado Pago: erro processando webhook: ${error.message}`)
      return { action: PaymentActions.NOT_SUPPORTED }
    }
  }
}

export default MercadoPagoProviderService
