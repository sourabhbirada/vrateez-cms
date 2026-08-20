"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Package, Truck, MapPin, Clock, CheckCircle, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

type OrderAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
};

type TrackingEvent = {
  message: string;
  status: string;
  statusLabel: string;
  datetime: string;
  source: string;
  location: {
    city: string;
    state: string;
    country: string;
    zip: string;
  };
};

type TrackingData = {
  trackingNumber: string;
  trackingProvider: string;
  orderId: string;
  status: string;
  statusLabel: string;
  estimatedDelivery: string | null;
  lastEventTime: string;
  destinationCity: string | null;
  destinationState: string | null;
  events: TrackingEvent[];
};

type Order = {
  _id: string;
  orderId?: string;
  trackingNumber?: string;
  courierPartner?: string;
  user?: { name?: string; email?: string; phone?: string } | null;
  guestInfo?: { name?: string; email?: string; phone?: string } | null;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  shippingCharge: number;
  discountAmount: number;
  totalAmount: number;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { 
    day: "2-digit", 
    month: "short", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { 
    style: "currency", 
    currency: "INR", 
    maximumFractionDigits: 0 
  }).format(amount);
}

const statusColors: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const trackingStatusColors: Record<string, string> = {
  pre_transit: "bg-blue-100 text-blue-700",
  in_transit: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  failure: "bg-red-100 text-red-700",
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const data = await apiFetch<{ order: Order }>(`/orders/${orderId}`);
        setOrder(data.order);

        // If order has tracking number, fetch tracking details
        if (data.order.trackingNumber) {
          setTrackingLoading(true);
          try {
            const trackingData = await apiFetch<{ hasTracking: boolean; tracking: TrackingData }>(
              `/orders/${orderId}/tracking`
            );
            if (trackingData.hasTracking) {
              setTracking(trackingData.tracking);
            }
          } catch (error) {
            console.error("Failed to load tracking:", error);
          } finally {
            setTrackingLoading(false);
          }
        }
      } catch (error) {
        console.error("Failed to load order:", error);
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      void loadOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Order not found</p>
      </div>
    );
  }

  const customerName = order.user?.name || order.guestInfo?.name || "Guest";
  const customerEmail = order.user?.email || order.guestInfo?.email || "";
  const customerPhone = order.contactPhone || order.user?.phone || order.guestInfo?.phone || "";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-surface rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Order Details
            {order.orderId && ` #${order.orderId}`}
          </h1>
          <p className="text-sm text-muted mt-1">
            DB ID: {order._id} • Created: {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking Section */}
          {order.trackingNumber && (
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Truck size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">Tracking Information</h2>
                  <p className="text-sm text-muted">Live shipment tracking</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted mb-1">Tracking Number</p>
                    <p className="font-mono font-semibold text-stone-900">{order.trackingNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted mb-1">Courier Partner</p>
                    <p className="font-semibold text-stone-900 capitalize">
                      {order.courierPartner || "Shadowfax"}
                    </p>
                  </div>
                </div>

                {trackingLoading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted mt-2">Loading tracking details...</p>
                  </div>
                ) : tracking ? (
                  <div className="space-y-4">
                    {/* Current Status */}
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            trackingStatusColors[tracking.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {tracking.statusLabel}
                        </span>
                        {tracking.lastEventTime && (
                          <span className="text-xs text-muted flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(tracking.lastEventTime)}
                          </span>
                        )}
                      </div>
                      {tracking.destinationCity && (
                        <p className="text-sm text-stone-700">
                          <MapPin size={14} className="inline mr-1" />
                          Destination: {tracking.destinationCity}
                          {tracking.destinationState && `, ${tracking.destinationState}`}
                        </p>
                      )}
                      {tracking.estimatedDelivery && (
                        <p className="text-sm text-stone-700 mt-1">
                          Estimated Delivery: {formatDate(tracking.estimatedDelivery)}
                        </p>
                      )}
                    </div>

                    {/* Tracking Timeline */}
                    {tracking.events && tracking.events.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-stone-900 mb-3">Tracking Timeline</h3>
                        <div className="space-y-3">
                          {tracking.events.map((event, index) => (
                            <div key={index} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    index === 0 ? "bg-primary" : "bg-surface border-2 border-border"
                                  }`}
                                />
                                {index < tracking.events.length - 1 && (
                                  <div className="w-0.5 h-full bg-border mt-1" />
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <div className="flex items-start justify-between mb-1">
                                  <p className="text-sm font-medium text-stone-900">{event.message}</p>
                                  <span className="text-xs text-muted whitespace-nowrap ml-2">
                                    {formatDate(event.datetime)}
                                  </span>
                                </div>
                                {(event.location.city || event.source) && (
                                  <p className="text-xs text-muted">
                                    {event.location.city && `${event.location.city}, `}
                                    {event.location.state && `${event.location.state} • `}
                                    {event.source}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted text-sm">
                    <p>Tracking information not available yet</p>
                    <p className="text-xs mt-1">Please check back in a few moments</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-stone-900">Order Items</h2>
                <p className="text-sm text-muted">{order.items.length} items</p>
              </div>
            </div>

            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-surface/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-stone-900">{item.name}</p>
                    <p className="text-sm text-muted">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-stone-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="text-stone-900">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Discount</span>
                  <span className="text-green-600">-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted">Shipping</span>
                <span className="text-stone-900">
                  {order.shippingCharge === 0 ? "FREE" : formatCurrency(order.shippingCharge)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer & Status */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-stone-900 mb-3">Order Status</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted mb-1">Order Status</p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[order.orderStatus] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.orderStatus.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Payment Status</p>
                <div className="flex items-center gap-2">
                  {order.paymentStatus === "paid" ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <XCircle size={16} className="text-red-600" />
                  )}
                  <span className="text-sm font-medium capitalize">{order.paymentStatus}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Payment Method</p>
                <span className="text-sm font-medium capitalize">{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-stone-900 mb-3">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted mb-1">Name</p>
                <p className="text-sm font-medium text-stone-900">{customerName}</p>
              </div>
              {customerEmail && (
                <div>
                  <p className="text-xs text-muted mb-1">Email</p>
                  <p className="text-sm text-stone-700">{customerEmail}</p>
                </div>
              )}
              {customerPhone && (
                <div>
                  <p className="text-xs text-muted mb-1">Phone</p>
                  <p className="text-sm text-stone-700">{customerPhone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-stone-900 mb-3">Shipping Address</h3>
            <div className="text-sm text-stone-700 space-y-1">
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
              <p>{order.shippingAddress.pincode}</p>
              {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
