"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ShoppingBag, Clock, Check, ChefHat, AlertTriangle, Filter, RefreshCw, Wifi, WifiOff, Zap, CheckCheck, History, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateOrderStatus } from "@/app/actions/admin";

interface OrderItem {
    name: string;
    qty: number;
    price?: number;
}

// Order types for beach club
type OrderType = "extras" | "dejeuner" | "fruits" | "boissons";

interface Order {
    id: string;
    table_number: string; // Zone ID (C1, VIP2, M3, etc.)
    status: "new" | "preparing" | "ready" | "served" | "paid" | "cancelled";
    items: OrderItem[];
    created_at: string;
    total_amount?: number;
    notes?: string;
    orderType: OrderType; // Type of order
    guestName?: string; // Guest name for the zone
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    new: { bg: "#FEE2E2", text: "#B91C1C", label: "Nouvelle" },
    preparing: { bg: "#FEF3C7", text: "#92400E", label: "En préparation" },
    ready: { bg: "#DCFCE7", text: "#166534", label: "Prête" },
    served: { bg: "#E0E7FF", text: "#3730A3", label: "Servie" },
    paid: { bg: "#F3F4F6", text: "#374151", label: "Payée" },
    cancelled: { bg: "#FEE2E2", text: "#B91C1C", label: "Annulée" },
};

const filterTabs = [
    { key: "all", label: "Toutes" },
    { key: "new", label: "Nouvelles" },
    { key: "preparing", label: "En préparation" },
    { key: "ready", label: "Prêtes" },
    { key: "served", label: "Servies" },
];

const orderTypeConfig: Record<OrderType, { bg: string; text: string; label: string; emoji: string }> = {
    extras: { bg: "#E0E7FF", text: "#3730A3", label: "Extra", emoji: "🍔" },
    dejeuner: { bg: "#FEF3C7", text: "#92400E", label: "Déjeuner", emoji: "🍽️" },
    fruits: { bg: "#DCFCE7", text: "#166534", label: "Fruits", emoji: "🍉" },
    boissons: { bg: "#DBEAFE", text: "#1E40AF", label: "Boissons", emoji: "🍹" },
};

// Check if it's lunch rush time (12h30 - 14h30)
const isLunchRushTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const time = hours * 60 + minutes;
    return time >= 12 * 60 + 30 && time <= 14 * 60 + 30;
};

// Get current service period
const getCurrentPeriod = () => {
    const now = new Date();
    const hours = now.getHours();
    if (hours < 9) return "before_opening";
    if (hours < 12) return "morning";
    if (hours < 15) return "lunch";
    if (hours < 19) return "afternoon";
    return "closed";
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeFilter, setActiveFilter] = useState("all");
    const [, setTick] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [rushMode, setRushMode] = useState(false);
    const [incidents, setIncidents] = useState<{ id: string; time: Date; message: string; type: "warning" | "error" | "info" }[]>([]);
    const [showIncidentLog, setShowIncidentLog] = useState(false);

    // Fetch orders from Supabase
    const fetchOrders = useCallback(async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) {
            console.error("Error fetching orders:", error);
            return;
        }

        setOrders(data || []);
        setLastUpdate(new Date());
        setIsLoading(false);
    }, []);

    // Initial fetch and real-time subscription
    useEffect(() => {
        fetchOrders();

        const supabase = createClient();

        // Subscribe to real-time changes
        const channel = supabase
            .channel("orders-realtime")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "orders",
                },
                (payload) => {
                    console.log("Real-time update:", payload);
                    setLastUpdate(new Date());

                    if (payload.eventType === "INSERT") {
                        setOrders((prev) => [payload.new as Order, ...prev]);
                    } else if (payload.eventType === "UPDATE") {
                        setOrders((prev) =>
                            prev.map((order) =>
                                order.id === payload.new.id ? (payload.new as Order) : order
                            )
                        );
                    } else if (payload.eventType === "DELETE") {
                        setOrders((prev) => prev.filter((order) => order.id !== payload.old.id));
                    }
                }
            )
            .subscribe((status) => {
                console.log("Subscription status:", status);
                setIsConnected(status === "SUBSCRIBED");
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchOrders]);

    // Timer tick every 30 seconds for elapsed time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setTick((t) => t + 1);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    // Calculate elapsed time in minutes
    const getElapsedMinutes = (createdAt: string) => {
        return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    };

    // Get time color based on elapsed minutes
    const getTimeColor = (minutes: number, status: string) => {
        if (status === "served" || status === "paid" || status === "cancelled") return "#9CA3AF";
        if (minutes >= 20) return "#EF4444";
        if (minutes >= 10) return "#F59E0B";
        return "#22C55E";
    };

    // Check if order is urgent
    const isUrgent = (order: Order) => {
        const minutes = getElapsedMinutes(order.created_at);
        return minutes >= 15 && (order.status === "new" || order.status === "preparing");
    };

    // Update order status via server action
    const handleAdvanceStatus = async (orderId: string, currentStatus: string) => {
        const nextStatus: Record<string, Order["status"]> = {
            new: "preparing",
            preparing: "ready",
            ready: "served",
        };

        const newStatus = nextStatus[currentStatus];
        if (!newStatus) return;

        // Optimistic update
        setOrders((prev) =>
            prev.map((order) =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );

        const result = await updateOrderStatus(orderId, newStatus);
        if (!result.success) {
            // Revert on error and log incident
            fetchOrders();
            addIncident(`Erreur mise à jour commande #${orderId.slice(0, 8)}`, "error");
        }
    };

    // Add incident to log
    const addIncident = (message: string, type: "warning" | "error" | "info" = "info") => {
        setIncidents(prev => [{ id: Date.now().toString(), time: new Date(), message, type }, ...prev.slice(0, 49)]);
    };

    // Serve all ready orders for a specific table
    const handleServeAllReady = async () => {
        const readyOrders = orders.filter(o => o.status === "ready");
        if (readyOrders.length === 0) return;

        // Optimistic update all
        setOrders(prev =>
            prev.map(order =>
                order.status === "ready" ? { ...order, status: "served" as Order["status"] } : order
            )
        );

        // Update all in parallel
        const results = await Promise.all(
            readyOrders.map(order => updateOrderStatus(order.id, "served"))
        );

        const failures = results.filter(r => !r.success).length;
        if (failures > 0) {
            fetchOrders();
            addIncident(`${failures} commande(s) non servie(s)`, "warning");
        } else {
            addIncident(`${readyOrders.length} commande(s) servie(s)`, "info");
        }
    };

    // Filter orders
    const filteredOrders = useMemo(() => {
        return orders.filter((o) =>
            activeFilter === "all" ? o.status !== "cancelled" : o.status === activeFilter
        );
    }, [orders, activeFilter]);

    // Separate urgent orders
    const urgentOrders = filteredOrders.filter(isUrgent);
    const normalOrders = filteredOrders.filter((o) => !isUrgent(o));

    // KPIs
    const kpis = useMemo(() => ({
        total: orders.filter((o) => !["served", "paid", "cancelled"].includes(o.status)).length,
        new: orders.filter((o) => o.status === "new").length,
        preparing: orders.filter((o) => o.status === "preparing").length,
        ready: orders.filter((o) => o.status === "ready").length,
        urgent: orders.filter(isUrgent).length,
    }), [orders]);

    const renderOrder = (order: Order) => {
        const status = statusConfig[order.status] || statusConfig.new;
        const elapsed = getElapsedMinutes(order.created_at);
        const timeColor = getTimeColor(elapsed, order.status);
        const urgent = isUrgent(order);
        const items = Array.isArray(order.items) ? order.items : [];

        return (
            <div
                key={order.id}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1.25rem 1.5rem",
                    backgroundColor: urgent ? "#FEF2F2" : "#FFF",
                    borderLeft: urgent ? "4px solid #EF4444" : "none",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            backgroundColor: urgent ? "#FEE2E2" : "#F3F4F6",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                        }}
                    >
                        <ChefHat style={{ width: 24, height: 24, color: urgent ? "#EF4444" : "#6B7280" }} />
                        {urgent && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "-4px",
                                    right: "-4px",
                                    width: "16px",
                                    height: "16px",
                                    backgroundColor: "#EF4444",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    animation: "pulse 1s infinite",
                                }}
                            >
                                <AlertTriangle style={{ width: 10, height: 10, color: "#FFF" }} />
                            </div>
                        )}
                    </div>
                    <div>
                        <p style={{ fontWeight: 600, color: "#222222" }}>
                            Commande #{order.id.slice(0, 8)}
                        </p>
                        <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>
                            Table {order.table_number || "?"} • {items.length} article{items.length > 1 ? "s" : ""}
                            {order.total_amount && ` • ${order.total_amount} DT`}
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {/* Elapsed Time Badge */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 10px",
                            backgroundColor: `${timeColor}20`,
                            borderRadius: "100px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: timeColor,
                        }}
                    >
                        <Clock style={{ width: 14, height: 14 }} />
                        {elapsed} min
                    </div>

                    {/* Status Badge */}
                    <span
                        style={{
                            padding: "6px 12px",
                            backgroundColor: status.bg,
                            color: status.text,
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            borderRadius: "100px",
                        }}
                    >
                        {status.label}
                    </span>

                    {/* Action Button */}
                    {!["served", "paid", "cancelled"].includes(order.status) && (
                        <button
                            onClick={() => handleAdvanceStatus(order.id, order.status)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 16px",
                                backgroundColor: "#222222",
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: "100px",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            <Check style={{ width: 16, height: 16 }} />
                            {order.status === "new" ? "Préparer" : order.status === "preparing" ? "Terminé" : "Servir"}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* Header with KPIs */}
            <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <ShoppingBag style={{ width: 32, height: 32, color: "#E8A87C" }} />
                        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                            Commandes
                        </h1>
                        {/* Real-time indicator */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "4px 12px",
                                backgroundColor: isConnected ? "#DCFCE7" : "#FEE2E2",
                                borderRadius: "100px",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                color: isConnected ? "#166534" : "#B91C1C",
                            }}
                        >
                            {isConnected ? (
                                <>
                                    <Wifi style={{ width: 12, height: 12 }} />
                                    Temps réel
                                </>
                            ) : (
                                <>
                                    <WifiOff style={{ width: 12, height: 12 }} />
                                    Hors ligne
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {/* Mode Rush Toggle */}
                        <button
                            onClick={() => {
                                setRushMode(!rushMode);
                                addIncident(rushMode ? "Mode Rush désactivé" : "Mode Rush activé", "info");
                            }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 16px",
                                backgroundColor: rushMode ? "#EF4444" : "#F3F4F6",
                                color: rushMode ? "#FFF" : "#6B7280",
                                border: "none",
                                borderRadius: "100px",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            <Zap style={{ width: 16, height: 16 }} />
                            {rushMode ? "Mode Rush ON" : "Mode Rush"}
                        </button>

                        {/* Serve All Ready */}
                        {kpis.ready > 0 && (
                            <button
                                onClick={handleServeAllReady}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "8px 16px",
                                    backgroundColor: "#22C55E",
                                    color: "#FFF",
                                    border: "none",
                                    borderRadius: "100px",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                <CheckCheck style={{ width: 16, height: 16 }} />
                                Servir tout ({kpis.ready})
                            </button>
                        )}

                        {/* Incident Log Toggle */}
                        <button
                            onClick={() => setShowIncidentLog(!showIncidentLog)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 16px",
                                backgroundColor: showIncidentLog ? "#222222" : "#F3F4F6",
                                color: showIncidentLog ? "#FFF" : "#6B7280",
                                border: "none",
                                borderRadius: "100px",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                position: "relative" as const,
                            }}
                        >
                            <History style={{ width: 16, height: 16 }} />
                            Journal
                            {incidents.length > 0 && (
                                <span
                                    style={{
                                        position: "absolute",
                                        top: "-4px",
                                        right: "-4px",
                                        width: "18px",
                                        height: "18px",
                                        backgroundColor: "#EF4444",
                                        color: "#FFF",
                                        borderRadius: "50%",
                                        fontSize: "0.65rem",
                                        fontWeight: 600,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {incidents.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <p style={{ color: "#7A7A7A" }}>
                        Gérez les commandes en cours
                    </p>
                    {lastUpdate && (
                        <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                            Mis à jour : {lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                    )}
                    <button
                        onClick={fetchOrders}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 8px",
                            backgroundColor: "transparent",
                            border: "1px solid #E5E7EB",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            color: "#6B7280",
                        }}
                    >
                        <RefreshCw style={{ width: 12, height: 12 }} />
                        Actualiser
                    </button>
                </div>
            </div>

            {/* Rush Mode Indicator */}
            {rushMode && (
                <div
                    style={{
                        marginBottom: "1rem",
                        padding: "0.75rem 1rem",
                        backgroundColor: "#FEE2E2",
                        borderRadius: "12px",
                        border: "2px solid #EF4444",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <Zap style={{ width: 18, height: 18, color: "#EF4444" }} />
                    <span style={{ fontWeight: 600, color: "#B91C1C", fontSize: "0.875rem" }}>
                        🔥 MODE RUSH ACTIF - Affichage simplifié, focus sur l&apos;essentiel
                    </span>
                </div>
            )}

            {/* Incident Log Panel */}
            {showIncidentLog && (
                <div
                    style={{
                        marginBottom: "1.5rem",
                        backgroundColor: "#FFF",
                        borderRadius: "12px",
                        border: "1px solid #E5E7EB",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            padding: "0.75rem 1rem",
                            backgroundColor: "#F9FAFB",
                            borderBottom: "1px solid #E5E7EB",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <History style={{ width: 16, height: 16, color: "#6B7280" }} />
                            <span style={{ fontWeight: 600, color: "#222", fontSize: "0.875rem" }}>Journal d&apos;incidents</span>
                        </div>
                        <button
                            onClick={() => setIncidents([])}
                            style={{
                                padding: "4px 8px",
                                backgroundColor: "transparent",
                                border: "1px solid #E5E7EB",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                color: "#6B7280",
                                cursor: "pointer",
                            }}
                        >
                            Vider
                        </button>
                    </div>
                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {incidents.length === 0 ? (
                            <div style={{ padding: "1.5rem", textAlign: "center", color: "#9CA3AF", fontSize: "0.875rem" }}>
                                Aucun incident enregistré
                            </div>
                        ) : (
                            incidents.map((incident) => (
                                <div
                                    key={incident.id}
                                    style={{
                                        padding: "0.75rem 1rem",
                                        borderBottom: "1px solid #F3F4F6",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        backgroundColor: incident.type === "error" ? "#FEF2F2" : incident.type === "warning" ? "#FFFBEB" : "transparent",
                                    }}
                                >
                                    <span
                                        style={{
                                            width: "8px",
                                            height: "8px",
                                            borderRadius: "50%",
                                            backgroundColor: incident.type === "error" ? "#EF4444" : incident.type === "warning" ? "#F59E0B" : "#22C55E",
                                        }}
                                    />
                                    <span style={{ fontSize: "0.75rem", color: "#9CA3AF", minWidth: "50px" }}>
                                        {incident.time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                    <span style={{ fontSize: "0.875rem", color: "#374151", flex: 1 }}>
                                        {incident.message}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Mini KPI Bar */}
            <div
                style={{
                    display: "flex",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                    padding: "1rem 1.5rem",
                    backgroundColor: "#FFF",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    flexWrap: "wrap",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#222" }}>{kpis.total}</span>
                    <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>en cours</span>
                </div>
                <div style={{ width: "1px", backgroundColor: "#E5E7EB" }} />
                {kpis.urgent > 0 && (
                    <>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <AlertTriangle style={{ width: 18, height: 18, color: "#EF4444" }} />
                            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#EF4444" }}>{kpis.urgent}</span>
                            <span style={{ fontSize: "0.875rem", color: "#EF4444" }}>urgentes</span>
                        </div>
                        <div style={{ width: "1px", backgroundColor: "#E5E7EB" }} />
                    </>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#FEE2E2" }} />
                    <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>{kpis.new} nouvelles</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#FEF3C7" }} />
                    <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>{kpis.preparing} en préparation</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#DCFCE7" }} />
                    <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>{kpis.ready} prêtes</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div
                style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                    overflowX: "auto",
                    paddingBottom: "4px",
                }}
            >
                {filterTabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveFilter(tab.key)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 16px",
                            backgroundColor: activeFilter === tab.key ? "#222222" : "#F3F4F6",
                            color: activeFilter === tab.key ? "#FFFFFF" : "#6B7280",
                            border: "none",
                            borderRadius: "100px",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {tab.key === "all" && <Filter style={{ width: 14, height: 14 }} />}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "#7A7A7A" }}>
                    Chargement des commandes...
                </div>
            ) : (
                <>
                    {/* Urgent Orders Section */}
                    {urgentOrders.length > 0 && (
                        <div
                            style={{
                                marginBottom: "1.5rem",
                                backgroundColor: "#FEF2F2",
                                borderRadius: "16px",
                                border: "2px solid #FECACA",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    padding: "0.75rem 1.5rem",
                                    backgroundColor: "#FEE2E2",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <AlertTriangle style={{ width: 18, height: 18, color: "#EF4444" }} />
                                <span style={{ fontWeight: 600, color: "#B91C1C", fontSize: "0.875rem" }}>
                                    🔥 Urgences ({urgentOrders.length}) - Plus de 15 min d&apos;attente
                                </span>
                            </div>
                            <div style={{ borderTop: "1px solid #FECACA" }}>
                                {urgentOrders.map((order, index) => (
                                    <div
                                        key={order.id}
                                        style={{ borderBottom: index < urgentOrders.length - 1 ? "1px solid #FECACA" : "none" }}
                                    >
                                        {renderOrder(order)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Normal Orders List */}
                    <div
                        style={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: "16px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                            border: "1px solid #E5E7EB",
                            overflow: "hidden",
                        }}
                    >
                        {normalOrders.map((order, index) => (
                            <div
                                key={order.id}
                                style={{ borderBottom: index < normalOrders.length - 1 ? "1px solid #E5E7EB" : "none" }}
                            >
                                {renderOrder(order)}
                            </div>
                        ))}

                        {filteredOrders.length === 0 && (
                            <div style={{ padding: "3rem", textAlign: "center", color: "#7A7A7A" }}>
                                Aucune commande {activeFilter !== "all" ? "avec ce statut" : "en cours"}
                            </div>
                        )}
                    </div>
                </>
            )}

            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
