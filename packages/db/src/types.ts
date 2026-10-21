export type Variant = {
  id: string;
  title: string;
  sku: string | null;
  options: Record<string, string>;
  price: number;
  stock: number;
  allow_backorder: boolean;
  position: number;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  status: "draft" | "published";
  option_order: string[];
  is_presale: boolean;
  presale_message: string | null;
  estimated_ship_date: string | null;
  images: { url: string; position: number }[];
  categories: { id: string; handle: string; name: string }[];
  variants: Variant[];
};

export type NavCategory = {
  id: string;
  name: string;
  handle: string;
  product_count: number;
  available: boolean;
};

export type Address = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address_1: string;
  address_2: string | null;
  city: string;
  province: string | null;
  postal_code: string;
  country_code: string;
  is_default: boolean;
};

export type AddressInput = {
  first_name: string;
  last_name: string;
  phone?: string | null;
  address_1: string;
  address_2?: string | null;
  city: string;
  province?: string | null;
  postal_code: string;
  country_code?: string;
};

export type Customer = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  cpf: string | null;
  birth_date: string | null;
  photo: string | null;
  addresses: Address[];
};

export type ShippingOption = { id: string; name: string; price: number; estimate: string | null };

export type CartItem = {
  id: string;
  variant_id: string;
  product_id: string;
  handle: string;
  product_title: string;
  variant_title: string;
  thumbnail: string | null;
  options: Record<string, string>;
  quantity: number;
  unit_price: number;
  total: number;
  stock: number;
  allow_backorder: boolean;
};

export type Cart = {
  id: string;
  customer_id: string | null;
  email: string | null;
  shipping_address: AddressInput | null;
  document: { cpf: string; birth_date: string } | null;
  shipping_option: ShippingOption | null;
  coupon: { code: string; kind: "percent" | "fixed"; amount: number } | null;
  items: CartItem[];
  item_count: number;
  subtotal: number;
  shipping_total: number;
  discount_total: number;
  total: number;
  currency_code: string;
};

export type OrderItem = {
  id: string;
  variant_id: string | null;
  product_title: string;
  variant_title: string | null;
  thumbnail: string | null;
  quantity: number;
  unit_price: number;
  total: number;
};

export type Order = {
  id: string;
  display_id: number;
  customer_id: string | null;
  email: string;
  shipping_address: AddressInput;
  document: { cpf: string; birth_date: string } | null;
  subtotal: number;
  shipping_total: number;
  discount_total: number;
  total: number;
  currency_code: string;
  coupon_code: string | null;
  shipping_option_name: string | null;
  status: "pending" | "completed" | "canceled";
  payment_status: "awaiting" | "captured" | "canceled" | "refunded";
  fulfillment_status: "not_fulfilled" | "fulfilled" | "shipped" | "delivered" | "canceled";
  tracking_code: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  paid_at: string | null;
  items: OrderItem[];
};

export type Piece = {
  id: string;
  code: string;
  variant_id: string | null;
  status: "nao_registrado" | "registrado" | "revogado";
  owner_id: string | null;
  order_id: string | null;
  serial_number: string | null;
  invoice_reference: string | null;
  created_at: string;
};
