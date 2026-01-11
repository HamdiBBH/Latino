"use client";

import { useState, useEffect } from "react";
import { ChefHat, Clock, CheckCircle, XCircle, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface OrderItem {
    name: string;
    quantity: number;
    notes?: string;
}

interface Order {
    id: string;
    tableNumber: string;
    items: OrderItem[];
    status: "new" | "preparing" | "ready";
    createdAt: Date;
}

// Mock orders - will be replaced with Supabase Realtime
const mockOrders: Order[] = [
    {
        id: "1",
        tableNumber: "5",
        items: [
            { name: "Salade Niçoise", quantity: 2 },
            { name: "Poisson Grillé", quantity: 1, notes: "Sans sauce" },
            { name: "Mocktail Maison", quantity: 3 },
        ],
        status: "new",
        createdAt: new Date(Date.now() - 5 * 60000),
    },
    {
        id: "2",
        tableNumber: "12",
        items: [
            { name: "Plateau Fruits de Mer", quantity: 1 },
            { name: "Jus Premium", quantity: 1 },
        ],
        status: "preparing",
        createdAt: new Date(Date.now() - 15 * 60000),
    },
    {
        id: "3",
        tableNumber: "3",
        items: [
            { name: "Menu Enfant", quantity: 2 },
            { name: "Jus d'orange", quantity: 2 },
        ],
        status: "new",
        createdAt: new Date(Date.now() - 2 * 60000),
    },
];

const statusColors = {
    new: "bg-red-500",
    preparing: "bg-orange-500",
    ready: "bg-green-500",
};

const statusLabels = {
    new: "Nouvelle",
    preparing: "En préparation",
    ready: "Prête",
};

export default function KitchenPage() {
    const [orders, setOrders] = useState<Order[]>(mockOrders);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Simulate realtime updates
    useEffect(() => {
        // TODO: Replace with Supabase Realtime subscription
        // const channel = supabase
        //   .channel('orders')
        //   .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, handleOrderChange)
        //   .subscribe();

        // Simulate new order every 30s
        const interval = setInterval(() => {
            const newOrder: Order = {
                id: String(Date.now()),
                tableNumber: String(Math.floor(Math.random() * 20) + 1),
                items: [
                    { name: "Nouveau plat", quantity: 1 },
                ],
                status: "new",
                createdAt: new Date(),
            };
            setOrders((prev) => [newOrder, ...prev]);
            if (soundEnabled) {
                // Play notification sound
                // new Audio('/notification.mp3').play();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [soundEnabled]);

    const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
        setOrders((prev) =>
            prev.map((order) =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
    };

    const removeOrder = (orderId: string) => {
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
    };

    const getTimeAgo = (date: Date) => {
        const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
        if (minutes < 1) return "À l'instant";
        if (minutes === 1) return "Il y a 1 min";
        return `Il y a ${minutes} min`;
    };

    const newOrders = orders.filter((o) => o.status === "new");
    const preparingOrders = orders.filter((o) => o.status === "preparing");
    const readyOrders = orders.filter((o) => o.status === "ready");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
                        <ChefHat className="w-7 h-7 text-accent" />
                        Vue Cuisine
                    </h1>
                    <p className="text-text mt-1">
                        Commandes en temps réel • {orders.length} active(s)
                    </p>
                </div>

                <Button
                    variant={soundEnabled ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                >
                    <Volume2 className="w-4 h-4" />
                    Son {soundEnabled ? "activé" : "désactivé"}
                </Button>
            </div>

            {/* Order Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* New Orders */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className={cn("w-3 h-3 rounded-full", statusColors.new)} />
                        <h2 className="font-semibold text-lg">Nouvelles ({newOrders.length})</h2>
                    </div>
                    <div className="space-y-4">
                        {newOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onUpdateStatus={updateOrderStatus}
                                onRemove={removeOrder}
                                getTimeAgo={getTimeAgo}
                            />
                        ))}
                    </div>
                </div>

                {/* Preparing */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className={cn("w-3 h-3 rounded-full", statusColors.preparing)} />
                        <h2 className="font-semibold text-lg">En préparation ({preparingOrders.length})</h2>
                    </div>
                    <div className="space-y-4">
                        {preparingOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onUpdateStatus={updateOrderStatus}
                                onRemove={removeOrder}
                                getTimeAgo={getTimeAgo}
                            />
                        ))}
                    </div>
                </div>

                {/* Ready */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className={cn("w-3 h-3 rounded-full", statusColors.ready)} />
                        <h2 className="font-semibold text-lg">Prêtes ({readyOrders.length})</h2>
                    </div>
                    <div className="space-y-4">
                        {readyOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onUpdateStatus={updateOrderStatus}
                                onRemove={removeOrder}
                                getTimeAgo={getTimeAgo}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function OrderCard({
    order,
    onUpdateStatus,
    onRemove,
    getTimeAgo,
}: {
    order: Order;
    onUpdateStatus: (id: string, status: Order["status"]) => void;
    onRemove: (id: string) => void;
    getTimeAgo: (date: Date) => string;
}) {
    return (
        <div
            className={cn(
                "bg-white rounded-xl shadow-sm border-l-4 p-4",
                order.status === "new" && "border-l-red-500 animate-pulse",
                order.status === "preparing" && "border-l-orange-500",
                order.status === "ready" && "border-l-green-500"
            )}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className="text-2xl font-bold text-primary">
                        Table {order.tableNumber}
                    </span>
                    <div className="flex items-center gap-2 mt-1 text-sm text-text">
                        <Clock className="w-4 h-4" />
                        {getTimeAgo(order.createdAt)}
                    </div>
                </div>
                <span
                    className={cn(
                        "px-2 py-1 rounded text-xs font-medium text-white",
                        statusColors[order.status]
                    )}
                >
                    {statusLabels[order.status]}
                </span>
            </div>

            {/* Items */}
            <ul className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                        <span className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-sm font-medium">
                            {item.quantity}
                        </span>
                        <div>
                            <span className="font-medium">{item.name}</span>
                            {item.notes && (
                                <span className="block text-sm text-orange-600">⚠ {item.notes}</span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            {/* Actions */}
            <div className="flex gap-2">
                {order.status === "new" && (
                    <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => onUpdateStatus(order.id, "preparing")}
                    >
                        Commencer
                    </Button>
                )}
                {order.status === "preparing" && (
                    <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 !bg-green-500 hover:!bg-green-600"
                        onClick={() => onUpdateStatus(order.id, "ready")}
                    >
                        <CheckCircle className="w-4 h-4" />
                        Prête
                    </Button>
                )}
                {order.status === "ready" && (
                    <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => onRemove(order.id)}
                    >
                        Servie
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(order.id)}
                >
                    <XCircle className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
