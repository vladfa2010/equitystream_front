import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpRight, ArrowDownRight, ShoppingCart, Tag,
  X, Loader2, Trash2, Pencil, BarChart3,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { dealsApi, clientsApi, authApi } from '@/api';
import type { DealResponse, Order, ClientResponse } from '@/api';


const easeExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

// Colors for order book
const ASK_BG = 'rgba(239,68,68,0.08)';
const BID_BG = 'rgba(16,185,129,0.08)';

export default function DealTrading() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<DealResponse | null>(null);
  const [client, setClient] = useState<ClientResponse | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [myPosition, setMyPosition] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Order form state
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderQty, setOrderQty] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Edit modal
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editQty, setEditQty] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [dealData, user, allOrders] = await Promise.all([
        dealsApi.getById(id),
        authApi.me(),
        dealsApi.getDealOrders(id),
      ]);
      setDeal(dealData);
      setOrders(allOrders.filter(o => o.status === 'pending'));

      if (user) {
        const clientsEnvelope = await clientsApi.getAll();
        const allClients = clientsEnvelope.data || [];
        const me = allClients.find(c => c.email === user.email) || allClients.find(c => c.id === user.id);
        setClient(me || null);

        if (me) {
          const clientOrders = await dealsApi.getClientOrders(me.id);
          setMyOrders(clientOrders.filter(o => o.dealId === id));
          // Find my position in this deal — try multiple sources
          const meAny = me as any;
          let inv = dealData?.investments?.find((i: any) => i.userId === me.id);
          if (!inv && meAny.investments) {
            inv = meAny.investments.find((i: any) => i.dealId === id);
          }
          if (!inv && meAny.positions) {
            inv = meAny.positions.find((p: any) => p.dealId === id);
          }
          setMyPosition(inv || null);
        }
      }
    } catch {}
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Build order book from orders — each order shown individually (Level 2)
  const { bids, asks, bestBid, bestAsk, lastPrice } = useMemo(() => {
    const buyOrders = orders
      .filter(o => o.side === 'buy' && o.status === 'pending' && o.type === 'limit' && o.price)
      .sort((a, b) => b.price! - a.price!);
    const sellOrders = orders
      .filter(o => o.side === 'sell' && o.status === 'pending' && o.type === 'limit' && o.price)
      .sort((a, b) => a.price! - b.price!);

    const bb = buyOrders.length > 0 ? buyOrders[0].price! : (deal?.currentPrice || 0);
    const ba = sellOrders.length > 0 ? sellOrders[0].price! : (deal?.currentPrice || 0);
    const lp = deal?.currentPrice || deal?.entryPrice || 0;

    return { bids: buyOrders, asks: sellOrders, bestBid: bb, bestAsk: ba, lastPrice: lp };
  }, [orders, deal]);

  const spread = bestAsk - bestBid;
  const spreadPercent = bestBid > 0 ? (spread / bestBid) * 100 : 0;

  const canSell = !!myPosition;
  const maxSellShares = myPosition ? myPosition.shareCount || 0 : 0;

  const handleSubmitOrder = async () => {
    if (!deal || !client) return;
    const qty = parseFloat(orderQty);
    if (isNaN(qty) || qty <= 0) return;

    const price = orderType === 'limit' ? parseFloat(orderPrice) : null;
    if (orderType === 'limit' && (price === null || isNaN(price) || price <= 0)) return;

    // For sell: check position
    if (orderSide === 'sell' && (!myPosition || qty > maxSellShares)) {
      setToast({ message: `Insufficient shares. Max: ${maxSellShares.toFixed(2)}`, type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      await dealsApi.createOrder({
        dealId: deal.id,
        dealName: deal.companyName,
        dealTicker: deal.ticker,
        clientId: client.id,
        clientName: client.name || 'Unknown',
        type: orderType,
        side: orderSide,
        price,
        quantity: qty,
      });
      setSubmitting(false);
      setOrderQty('');
      setOrderPrice('');
      setToast({ message: `${orderSide === 'buy' ? 'Buy' : 'Sell'} ${orderType} order placed`, type: 'success' });
      load();
    } catch (err: any) {
      setSubmitting(false);
      setToast({ message: err.message || 'Order failed', type: 'error' });
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      await dealsApi.cancelOrder(orderId);
      setToast({ message: 'Order cancelled', type: 'success' });
      load();
    } catch {
      setToast({ message: 'Failed to cancel', type: 'error' });
    }
  };

  const handleEdit = async () => {
    if (!editingOrder) return;
    const price = editPrice ? parseFloat(editPrice) : null;
    const qty = editQty ? parseFloat(editQty) : null;
    if (!price || !qty) return;
    try {
      await dealsApi.updateOrder(editingOrder.id, { price, quantity: qty });
      setEditingOrder(null);
      setToast({ message: 'Order updated', type: 'success' });
      load();
    } catch {
      setToast({ message: 'Failed to update', type: 'error' });
    }
  };

  const maxBidQty = bids.length > 0 ? Math.max(...bids.map(b => b.quantity)) : 0;
  const maxAskQty = asks.length > 0 ? Math.max(...asks.map(a => a.quantity)) : 0;

  if (loading) {
    return (
      <Layout role="user" showFooter>
        <div className="flex items-center justify-center py-20">
          <p style={{ color: '#8A8A93' }}>Loading trading...</p>
        </div>
      </Layout>
    );
  }

  if (!deal) {
    return (
      <Layout role="user" showFooter>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-body" style={{ color: '#8A8A93' }}>Deal not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="user" showFooter>
      <div className="max-w-[1440px] mx-auto">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: easeExpo }}
          onClick={() => navigate('/market')}
          className="flex items-center gap-2 text-[14px] mb-6 transition-colors hover:text-[#B8A14E]"
          style={{ color: '#8A8A93' }}
        >
          <ArrowLeft size={16} />
          Back to Market
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeExpo }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-h1" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>
              {deal.companyName}
            </h1>
            <span className="px-2.5 py-1 rounded-md text-[12px] font-bold bg-white/5 text-[#F5F5F0]">
              {deal.ticker}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[13px]">
            <span style={{ color: '#F5F5F0', fontFamily: "'JetBrains Mono', monospace" }}>
              ${lastPrice.toFixed(2)}
            </span>
            <span style={{ color: '#8A8A93' }}>Entry: ${deal.entryPrice?.toFixed(2)}</span>
            {myPosition && (
              <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                {maxSellShares.toFixed(2)} shares
              </span>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Order Book */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: easeExpo }}
            className="lg:col-span-2"
          >
            <div className="glass-panel p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} style={{ color: '#B8A14E' }} />
                  <h2 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: '#B8A14E' }}>Order Book</h2>
                </div>
                {myPosition && (
                  <div className="flex items-center gap-2 text-[11px] px-2.5 py-1 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)' }}>
                    <span style={{ color: '#55555E' }}>My Position:</span>
                    <span style={{ color: '#10B981', fontFamily: "'JetBrains Mono', monospace" }}>{maxSellShares.toFixed(2)} shares</span>
                  </div>
                )}
              </div>

              {/* Column headers */}
              <div className="flex items-center px-0 py-1 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="text-[10px] uppercase w-20 text-right pr-3" style={{ color: '#55555E' }}>Price</span>
                <span className="text-[10px] uppercase w-20 text-right pr-3" style={{ color: '#55555E' }}>Size</span>
                <span className="text-[10px] uppercase flex-1" style={{ color: '#55555E' }}>Trader</span>
              </div>

              {/* Spread */}
              <div className="flex items-center justify-between mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="text-center">
                  <p className="text-[10px] uppercase" style={{ color: '#55555E' }}>Best Bid</p>
                  <p className="text-[14px] font-semibold" style={{ color: '#10B981', fontFamily: "'JetBrains Mono', monospace" }}>
                    ${bestBid.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase" style={{ color: '#55555E' }}>Spread</p>
                  <p className="text-[14px] font-semibold" style={{ color: '#F5F5F0', fontFamily: "'JetBrains Mono', monospace" }}>
                    {spread.toFixed(2)} ({spreadPercent.toFixed(2)}%)
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase" style={{ color: '#55555E' }}>Best Ask</p>
                  <p className="text-[14px] font-semibold" style={{ color: '#EF4444', fontFamily: "'JetBrains Mono', monospace" }}>
                    ${bestAsk.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Asks (sells) — each order individually, red, sorted ascending by price */}
              <div className="mb-1">
                {asks.length === 0 && <p className="text-[12px] text-center py-4" style={{ color: '#55555E' }}>No sell orders</p>}
                {asks.map((ask) => {
                  const width = maxAskQty > 0 ? (ask.quantity / maxAskQty) * 100 : 0;
                  return (
                    <div key={ask.id} className="flex items-center py-0.5 rounded"
                      style={{ background: `linear-gradient(to left, ${ASK_BG} ${Math.min(100, width)}%, transparent ${Math.min(100, width)}%)` }}
                      title={`${ask.clientName} — ${new Date(ask.createdAt).toLocaleString()}`}>
                      <span className="text-[12px] w-20 text-right pr-3" style={{ color: '#EF4444', fontFamily: "'JetBrains Mono', monospace" }}>
                        ${ask.price!.toFixed(2)}
                      </span>
                      <span className="text-[12px] w-20 text-right pr-3" style={{ color: '#F5F5F0', fontFamily: "'JetBrains Mono', monospace" }}>
                        {ask.quantity.toFixed(2)}
                      </span>
                      <span className="text-[11px] flex-1 truncate" style={{ color: '#55555E' }}>
                        {ask.clientName}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Divider with last price */}
              <div className="flex items-center gap-2 my-2 py-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-[11px] uppercase" style={{ color: '#55555E' }}>Last</span>
                <span className="text-[13px] font-semibold" style={{ color: '#B8A14E', fontFamily: "'JetBrains Mono', monospace" }}>
                  ${lastPrice.toFixed(2)}
                </span>
              </div>

              {/* Bids (buys) — each order individually, green, sorted descending by price */}
              <div className="mt-1">
                {bids.length === 0 && <p className="text-[12px] text-center py-4" style={{ color: '#55555E' }}>No buy orders</p>}
                {bids.map((bid) => {
                  const width = maxBidQty > 0 ? (bid.quantity / maxBidQty) * 100 : 0;
                  return (
                    <div key={bid.id} className="flex items-center py-0.5 rounded"
                      style={{ background: `linear-gradient(to left, ${BID_BG} ${Math.min(100, width)}%, transparent ${Math.min(100, width)}%)` }}
                      title={`${bid.clientName} — ${new Date(bid.createdAt).toLocaleString()}`}>
                      <span className="text-[12px] w-20 text-right pr-3" style={{ color: '#10B981', fontFamily: "'JetBrains Mono', monospace" }}>
                        ${bid.price!.toFixed(2)}
                      </span>
                      <span className="text-[12px] w-20 text-right pr-3" style={{ color: '#F5F5F0', fontFamily: "'JetBrains Mono', monospace" }}>
                        {bid.quantity.toFixed(2)}
                      </span>
                      <span className="text-[11px] flex-1 truncate" style={{ color: '#55555E' }}>
                        {bid.clientName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* My Orders */}
            {myOrders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="glass-panel p-5 mt-6"
              >
                <h2 className="text-[13px] font-bold uppercase tracking-wider mb-4" style={{ color: '#B8A14E' }}>My Orders</h2>
                <div className="flex flex-col gap-2">
                  {myOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${order.side === 'buy' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}
                          style={{ background: order.side === 'buy' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}>
                          {order.side}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase" style={{ background: 'rgba(184,161,78,0.1)', color: '#B8A14E' }}>
                          {order.type}
                        </span>
                        <div>
                          <p className="text-[13px]" style={{ color: '#F5F5F0' }}>
                            {order.quantity.toFixed(2)} @ {order.price ? `$${order.price.toFixed(2)}` : 'market'}
                          </p>
                          <p className="text-[11px]" style={{ color: '#55555E' }}>
                            {order.status} — {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => { setEditingOrder(order); setEditPrice(order.price ? String(order.price) : ''); setEditQty(String(order.quantity)); }}
                              className="p-2 rounded-lg hover:bg-white/5"
                              style={{ color: '#8A8A93' }}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleCancel(order.id)}
                              className="p-2 rounded-lg hover:bg-white/5"
                              style={{ color: '#EF4444' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right: Order Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: easeExpo }}
          >
            <div className="glass-panel p-5">
              <h2 className="text-[13px] font-bold uppercase tracking-wider mb-4" style={{ color: '#B8A14E' }}>Place Order</h2>

              {/* Type toggle */}
              <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <button
                  onClick={() => setOrderType('limit')}
                  className="flex-1 py-2 rounded-lg text-[12px] font-medium transition-all"
                  style={{
                    background: orderType === 'limit' ? 'rgba(184,161,78,0.15)' : 'transparent',
                    color: orderType === 'limit' ? '#B8A14E' : '#8A8A93',
                  }}
                >
                  <Tag size={12} className="inline mr-1" /> Limit
                </button>
                <button
                  onClick={() => setOrderType('market')}
                  className="flex-1 py-2 rounded-lg text-[12px] font-medium transition-all"
                  style={{
                    background: orderType === 'market' ? 'rgba(184,161,78,0.15)' : 'transparent',
                    color: orderType === 'market' ? '#B8A14E' : '#8A8A93',
                  }}
                >
                  <ShoppingCart size={12} className="inline mr-1" /> Market
                </button>
              </div>

              {/* Side toggle */}
              <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <button
                  onClick={() => setOrderSide('buy')}
                  className="flex-1 py-2 rounded-lg text-[12px] font-bold transition-all"
                  style={{
                    background: orderSide === 'buy' ? 'rgba(16,185,129,0.15)' : 'transparent',
                    color: orderSide === 'buy' ? '#10B981' : '#8A8A93',
                  }}
                >
                  <ArrowUpRight size={12} className="inline mr-1" /> Buy
                </button>
                <button
                  onClick={() => setOrderSide('sell')}
                  disabled={!canSell && orderSide === 'sell'}
                  className="flex-1 py-2 rounded-lg text-[12px] font-bold transition-all disabled:opacity-30"
                  style={{
                    background: orderSide === 'sell' ? 'rgba(239,68,68,0.15)' : 'transparent',
                    color: orderSide === 'sell' ? '#EF4444' : '#8A8A93',
                  }}
                >
                  <ArrowDownRight size={12} className="inline mr-1" /> Sell
                </button>
              </div>

              {!canSell && orderSide === 'sell' && (
                <p className="text-[11px] mb-3" style={{ color: '#EF4444' }}>
                  No position to sell. Buy shares first.
                </p>
              )}

              {/* Price (limit only) */}
              {orderType === 'limit' && (
                <div className="mb-3">
                  <label className="text-[11px] mb-1 block" style={{ color: '#8A8A93' }}>Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={orderPrice}
                    onChange={e => setOrderPrice(e.target.value)}
                    placeholder={bestBid > 0 ? `${bestBid.toFixed(2)}` : deal.entryPrice?.toFixed(2)}
                    className="w-full text-[14px] px-4 py-3 outline-none rounded-xl transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F0' }}
                    onFocus={e => { e.target.style.borderColor = '#B8A14E'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  />
                </div>
              )}

              {/* Quantity */}
              <div className="mb-4">
                <label className="text-[11px] mb-1 block" style={{ color: '#8A8A93' }}>
                  Quantity (shares)
                  {orderSide === 'sell' && canSell && <span style={{ color: '#55555E' }}> — Max: {maxSellShares.toFixed(2)}</span>}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={orderQty}
                  onChange={e => setOrderQty(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-[14px] px-4 py-3 outline-none rounded-xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F0' }}
                  onFocus={e => { e.target.style.borderColor = '#B8A14E'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                />
              </div>

              {/* Summary */}
              {orderQty && parseFloat(orderQty) > 0 && (
                <div className="p-3 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span style={{ color: '#55555E' }}>Quantity</span>
                    <span style={{ color: '#F5F5F0' }}>{parseFloat(orderQty).toFixed(2)} shares</span>
                  </div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span style={{ color: '#55555E' }}>Price</span>
                    <span style={{ color: '#F5F5F0' }}>
                      {orderType === 'limit' && orderPrice ? `$${parseFloat(orderPrice).toFixed(2)}` : `~$${lastPrice.toFixed(2)} (market)`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span style={{ color: '#55555E' }}>Total</span>
                    <span style={{ color: '#B8A14E', fontFamily: "'JetBrains Mono', monospace" }}>
                      ${orderType === 'limit' && orderPrice
                        ? (parseFloat(orderQty) * parseFloat(orderPrice)).toFixed(2)
                        : (parseFloat(orderQty) * lastPrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmitOrder}
                disabled={!orderQty || parseFloat(orderQty) <= 0 || submitting || (orderSide === 'sell' && !canSell) || (orderType === 'limit' && !orderPrice)}
                className="w-full py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                style={{
                  background: orderSide === 'buy' ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
                  color: '#fff',
                }}
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                {orderSide === 'buy' ? 'Buy' : 'Sell'} {orderType === 'market' ? 'Market' : 'Limit'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingOrder && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setEditingOrder(null)} />
            <motion.div className="relative w-full max-w-sm p-6 rounded-2xl" style={{ background: '#14141C', border: '1px solid rgba(255,255,255,0.08)' }} initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <button onClick={() => setEditingOrder(null)} className="absolute top-4 right-4 p-2" style={{ color: '#8A8A93' }}><X size={18} /></button>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#F5F5F0' }}>Edit Order</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[11px] mb-1 block" style={{ color: '#8A8A93' }}>Price ($)</label>
                  <input type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-full px-4 py-3 rounded-xl text-[14px]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F0' }} />
                </div>
                <div>
                  <label className="text-[11px] mb-1 block" style={{ color: '#8A8A93' }}>Quantity</label>
                  <input type="number" step="0.01" value={editQty} onChange={e => setEditQty(e.target.value)} className="w-full px-4 py-3 rounded-xl text-[14px]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F0' }} />
                </div>
                <button onClick={handleEdit} className="w-full py-2.5 rounded-xl text-[13px] font-semibold mt-2" style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }}>
                  Update Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div className="fixed bottom-6 left-1/2 z-[70] px-5 py-3 rounded-xl text-[13px] font-medium"
            style={{ background: toast.type === 'success' ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)', color: '#fff' }}
            initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
