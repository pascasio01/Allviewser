"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  Business,
  MoneyBreakdown,
  Order,
  OrderStatus,
  Product,
  StaffUser,
} from "@/lib/commerce/types";
import {
  MEDIA_KIND_LABELS,
  ORDER_STATUS_LABELS,
  formatMoney,
} from "@/lib/commerce/types";

type CartPreview = {
  cart: {
    id: string;
    items: Array<{
      id: string;
      productId: string;
      name: string;
      quantity: number;
      optionLabels: string[];
    }>;
  };
  business: Business;
  breakdown: MoneyBreakdown;
};

const STATUS_FLOW: OrderStatus[] = [
  "pendiente_aceptacion",
  "aceptado",
  "preparando",
  "listo_para_recoger",
  "en_reparto",
  "entregado",
];

async function apiGet(action: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ action, ...params });
  const res = await fetch(`/api/commerce?${qs}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Error de API");
  return json;
}

async function apiPost(body: Record<string, unknown>) {
  const res = await fetch("/api/commerce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Error de API");
  return json;
}

export default function ComercioPage() {
  const [tab, setTab] = useState<"cliente" | "negocio" | "seguimiento">("cliente");
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [preview, setPreview] = useState<CartPreview | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [actorId, setActorId] = useState("staff-admin");
  const [address, setAddress] = useState("Calle Demo 100, Ciudad Ejemplo");
  const [optionSelections, setOptionSelections] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState("…");

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [info, biz, prods, st, cart, ords] = await Promise.all([
        apiGet("info"),
        apiGet("business"),
        apiGet("products"),
        apiGet("staff"),
        apiGet("cart"),
        apiGet("orders"),
      ]);
      setPhase(String(info.module?.phase ?? "roadmap-commerce-v1"));
      setBusiness(biz.business);
      setProducts(prods.products);
      setStaff(st.staff);
      setPreview(cart);
      setOrders(ords.orders);
      setSelectedOrderId((prev) => prev ?? ords.orders[0]?.id ?? null);
      const admin = (st.staff as StaffUser[]).find((s) => s.role === "administrador");
      if (admin) setActorId(admin.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function run(okMsg: string, fn: () => Promise<void>) {
    setError(null);
    setMessage(null);
    try {
      await fn();
      setMessage(okMsg);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="stack">
      <header className="panel stack">
        <p className="badge">Módulo aparte del núcleo del agente · fase {phase}</p>
        <h1>Comercio inmersivo (demo)</h1>
        <p className="muted">
          Experiencia accesible y ligera. El 3D es opcional y está desactivado. No hay cobros ni
          repartos reales.
        </p>
        {business && (
          <div className="callout" role="note">
            <strong>{business.fictionalBanner}</strong>
            <div className="muted" style={{ marginTop: "0.35rem" }}>
              {business.name} · {business.address}
            </div>
          </div>
        )}
        <div className="row">
          {(
            [
              ["cliente", "Cliente"],
              ["negocio", "Negocio"],
              ["seguimiento", "Seguimiento"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? "btn" : "btn secondary"}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            className="btn secondary"
            onClick={() =>
              void run("Demo reiniciada", async () => {
                await apiPost({ action: "reset_demo" });
              })
            }
          >
            Reiniciar demo
          </button>
        </div>
        {message && <div className="panel">{message}</div>}
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        {loading && <div className="loading">Cargando…</div>}
      </header>

      {tab === "cliente" && preview && (
        <section className="stack">
          <div className="panel stack">
            <h2>Menú</h2>
            <div className="commerce-grid">
              {products.map((p) => {
                const media = p.media[0];
                return (
                  <article key={p.id} className="commerce-card">
                    {media && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={media.url} alt={media.caption} className="commerce-media" />
                    )}
                    <div className="badge">{media ? MEDIA_KIND_LABELS[media.kind] : "sin medio"}</div>
                    <h3>{p.name}</h3>
                    <p className="muted">{p.description}</p>
                    <p>
                      <strong>{formatMoney(p.priceCents)}</strong>
                      {!p.available && <span className="badge"> Agotado</span>}
                    </p>
                    <details>
                      <summary>Ingredientes y alérgenos</summary>
                      <p>{p.ingredients.join(", ")}</p>
                      {p.allergenNotesFromBusiness && <p>{p.allergenNotesFromBusiness}</p>}
                      <p className="muted">{p.allergenDisclaimer}</p>
                    </details>
                    {p.options.length > 0 && (
                      <div className="stack">
                        {p.options.map((o) => (
                          <label key={o.id} className="row">
                            <input
                              type="checkbox"
                              disabled={!o.available || !p.available}
                              checked={(optionSelections[p.id] ?? []).includes(o.id)}
                              onChange={(e) => {
                                setOptionSelections((prev) => {
                                  const cur = new Set(prev[p.id] ?? []);
                                  if (e.target.checked) cur.add(o.id);
                                  else cur.delete(o.id);
                                  return { ...prev, [p.id]: [...cur] };
                                });
                              }}
                            />
                            {o.label}
                            {o.priceDeltaCents ? ` (${formatMoney(o.priceDeltaCents)})` : ""}
                          </label>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      className="btn"
                      disabled={!p.available}
                      onClick={() =>
                        void run("Añadido al carrito", async () => {
                          await apiPost({
                            action: "add_to_cart",
                            productId: p.id,
                            quantity: 1,
                            optionIds: optionSelections[p.id] ?? [],
                          });
                        })
                      }
                    >
                      Añadir
                    </button>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="panel stack">
            <h2>Carrito</h2>
            {!preview.cart.items.length && <div className="empty">Carrito vacío.</div>}
            <ul className="stack">
              {preview.cart.items.map((item) => (
                <li key={item.id} className="row">
                  <span>
                    {item.quantity}× {item.name}
                    {item.optionLabels.length ? ` (${item.optionLabels.join(", ")})` : ""}
                  </span>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() =>
                      void run("Cantidad actualizada", async () => {
                        await apiPost({
                          action: "update_cart_item",
                          cartId: preview.cart.id,
                          itemId: item.id,
                          quantity: item.quantity - 1,
                        });
                      })
                    }
                  >
                    −
                  </button>
                </li>
              ))}
            </ul>
            <div>
              <div>Subtotal: {formatMoney(preview.breakdown.subtotalCents)}</div>
              <div>Entrega: {formatMoney(preview.breakdown.deliveryFeeCents)}</div>
              <div>Impuestos: {formatMoney(preview.breakdown.taxCents)}</div>
              <strong>Total: {formatMoney(preview.breakdown.totalCents)}</strong>
            </div>
            <label>
              Dirección
              <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
            </label>
            <p className="muted">
              Condiciones e importe completo visibles antes de confirmar. Pago simulado (sandbox).
            </p>
            <button
              type="button"
              className="btn"
              disabled={!preview.cart.items.length}
              onClick={() =>
                void run("Pedido creado (sandbox)", async () => {
                  const { order } = await apiPost({
                    action: "place_order",
                    deliveryAddress: address,
                    idempotencyKey: crypto.randomUUID(),
                  });
                  setSelectedOrderId(order.id);
                  setTab("seguimiento");
                })
              }
            >
              Confirmar pedido de prueba
            </button>
          </div>
        </section>
      )}

      {tab === "negocio" && (
        <section className="panel stack">
          <h2>Panel del negocio</h2>
          <label>
            Actuar como
            <select className="select" value={actorId} onChange={(e) => setActorId(e.target.value)}>
              {staff
                .filter((s) => s.role !== "cliente")
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
            </select>
          </label>
          <h3>Catálogo</h3>
          <ul className="stack">
            {products.map((p) => (
              <li key={p.id} className="row">
                <span>
                  {p.name} · {formatMoney(p.priceCents)} · {p.available ? "disponible" : "agotado"}
                </span>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() =>
                    void run("Disponibilidad actualizada", async () => {
                      await apiPost({
                        action: "set_availability",
                        productId: p.id,
                        available: !p.available,
                        actorId,
                      });
                    })
                  }
                >
                  {p.available ? "Marcar agotado" : "Reactivar"}
                </button>
              </li>
            ))}
          </ul>
          <h3>Pedidos</h3>
          {!orders.length && <div className="empty">Sin pedidos.</div>}
          {orders.map((o) => (
            <article key={o.id} className="panel stack">
              <div className="row">
                <strong>{o.id.slice(0, 8)}</strong>
                <span className="badge">{ORDER_STATUS_LABELS[o.status]}</span>
              </div>
              <div className="row">
                {STATUS_FLOW.filter((s) => s !== o.status)
                  .slice(0, 3)
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="btn secondary"
                      onClick={() =>
                        void run(`Estado → ${s}`, async () => {
                          await apiPost({
                            action: "update_status",
                            orderId: o.id,
                            status: s,
                            actorId,
                            message: `Actualizado a ${ORDER_STATUS_LABELS[s]}`,
                          });
                        })
                      }
                    >
                      {ORDER_STATUS_LABELS[s]}
                    </button>
                  ))}
              </div>
              {o.items[0] && (
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() =>
                    void run("Sustitución propuesta", async () => {
                      const other = products.find((p) => p.id !== o.items[0].productId);
                      if (!other) throw new Error("No hay producto alternativo");
                      await apiPost({
                        action: "propose_substitution",
                        orderId: o.id,
                        orderItemId: o.items[0].id,
                        proposedProductId: other.id,
                        actorId,
                      });
                    })
                  }
                >
                  Proponer sustitución
                </button>
              )}
            </article>
          ))}
        </section>
      )}

      {tab === "seguimiento" && (
        <section className="panel stack">
          <h2>Seguimiento visual</h2>
          <p className="muted">
            Las animaciones representan estados del sistema; no son imágenes reales de la cocina. Las
            estimaciones se etiquetan como tales.
          </p>
          <label>
            Pedido
            <select
              className="select"
              value={selectedOrderId ?? ""}
              onChange={(e) => setSelectedOrderId(e.target.value || null)}
            >
              <option value="">—</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id.slice(0, 8)} · {ORDER_STATUS_LABELS[o.status]}
                </option>
              ))}
            </select>
          </label>
          {!selectedOrder && <div className="empty">Selecciona un pedido.</div>}
          {selectedOrder && (
            <>
              {selectedOrder.connectionLost && (
                <div className="callout" role="status">
                  Conexión perdida. Último estado conocido:{" "}
                  {new Date(selectedOrder.lastKnownStatusAt).toLocaleString("es")}.
                </div>
              )}
              <div className="status-track">
                {STATUS_FLOW.map((s) => {
                  const idx = STATUS_FLOW.indexOf(s);
                  const cur = STATUS_FLOW.indexOf(selectedOrder.status);
                  const reached = cur >= 0 && idx <= cur;
                  return (
                    <div
                      key={s}
                      className={`status-node ${selectedOrder.status === s ? "current" : ""} ${reached ? "reached" : ""}`}
                    >
                      <span className="status-dot" aria-hidden />
                      <span>{ORDER_STATUS_LABELS[s]}</span>
                    </div>
                  );
                })}
              </div>
              <p>
                Estado: <strong>{ORDER_STATUS_LABELS[selectedOrder.status]}</strong> · Pago:{" "}
                {selectedOrder.paymentStatus} · Total {formatMoney(selectedOrder.breakdown.totalCents)}
              </p>
              <p className="muted">{selectedOrder.deliveryTerms}</p>
              <h3>Línea de tiempo</h3>
              <ol>
                {selectedOrder.timeline.map((ev) => (
                  <li key={ev.id}>
                    <time dateTime={ev.at}>{new Date(ev.at).toLocaleString("es")}</time>
                    {" · "}
                    {ORDER_STATUS_LABELS[ev.status]}
                    {ev.isEstimate ? " · estimación" : ""} — {ev.message}
                  </li>
                ))}
              </ol>
              {selectedOrder.substitutions.map((s) => (
                <div key={s.id} className="panel stack">
                  <strong>Sustitución: {s.proposedName}</strong>
                  <span className="badge">{s.status}</span>
                  {s.status === "pendiente_cliente" && (
                    <div className="row">
                      <button
                        type="button"
                        className="btn"
                        onClick={() =>
                          void run("Sustitución aceptada", async () => {
                            await apiPost({
                              action: "resolve_substitution",
                              orderId: selectedOrder.id,
                              substitutionId: s.id,
                              accept: true,
                            });
                          })
                        }
                      >
                        Aceptar
                      </button>
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() =>
                          void run("Sustitución rechazada", async () => {
                            await apiPost({
                              action: "resolve_substitution",
                              orderId: selectedOrder.id,
                              substitutionId: s.id,
                              accept: false,
                            });
                          })
                        }
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <div className="row">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() =>
                    void run(
                      selectedOrder.connectionLost ? "Conexión restaurada" : "Desconexión simulada",
                      async () => {
                        await apiPost({
                          action: "set_connection_lost",
                          orderId: selectedOrder.id,
                          lost: !selectedOrder.connectionLost,
                        });
                      },
                    )
                  }
                >
                  {selectedOrder.connectionLost ? "Restaurar conexión" : "Simular pérdida de conexión"}
                </button>
              </div>
              <p className="muted">
                Ubicación del repartidor desactivada en demo (requiere permiso y servicio activo).
              </p>
            </>
          )}
        </section>
      )}
    </div>
  );
}
