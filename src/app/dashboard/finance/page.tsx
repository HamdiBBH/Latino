import { TrendingUp, DollarSign, Receipt, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const kpiCards = [
    {
        label: "Chiffre d'Affaires",
        value: "12,450",
        unit: "DT",
        trend: "+12.5%",
        trendUp: true,
        icon: DollarSign,
        color: "#22C55E",
    },
    {
        label: "Ticket Moyen",
        value: "78",
        unit: "DT",
        trend: "+5.2%",
        trendUp: true,
        icon: Receipt,
        color: "#3B82F6",
    },
    {
        label: "Commandes",
        value: "156",
        unit: "",
        trend: "+8.1%",
        trendUp: true,
        icon: TrendingUp,
        color: "#E8A87C",
    },
    {
        label: "Taux Occupation",
        value: "87",
        unit: "%",
        trend: "-2.3%",
        trendUp: false,
        icon: PieChart,
        color: "#A855F7",
    },
];

const salesByCategory = [
    { category: "Restaurant", amount: 5200, percentage: 42 },
    { category: "Bar & Mocktails", amount: 3100, percentage: 25 },
    { category: "Plage & Transats", amount: 2500, percentage: 20 },
    { category: "Événements", amount: 1650, percentage: 13 },
];

const recentTransactions = [
    { id: "TRX001", table: "Table 12", amount: 245, time: "14:32", status: "paid" },
    { id: "TRX002", table: "Transat A5", amount: 120, time: "14:15", status: "paid" },
    { id: "TRX003", table: "Table 3", amount: 189, time: "13:48", status: "pending" },
    { id: "TRX004", table: "Bar", amount: 56, time: "13:22", status: "paid" },
    { id: "TRX005", table: "Table 8", amount: 312, time: "12:55", status: "paid" },
];

export default async function FinancePage() {
    const supabase = await createClient();

    // In production, fetch real data from orders table
    const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "paid")
        .order("created_at", { ascending: false })
        .limit(10);

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
                    <DollarSign style={{ width: 32, height: 32, color: "#E8A87C" }} />
                    <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222222" }}>
                        Dashboard Financier
                    </h1>
                </div>
                <p style={{ color: "#7A7A7A" }}>
                    Vue d&apos;ensemble de vos performances commerciales
                </p>
            </div>

            {/* Period Selector */}
            <div style={{ marginBottom: "2rem", display: "flex", gap: "0.5rem" }}>
                {["Aujourd'hui", "Cette semaine", "Ce mois", "Cette année"].map((period, i) => (
                    <button
                        key={period}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "100px",
                            border: "none",
                            backgroundColor: i === 0 ? "#222222" : "#F3F4F6",
                            color: i === 0 ? "#FFFFFF" : "#6B7280",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        {period}
                    </button>
                ))}
            </div>

            {/* KPI Cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "1.5rem",
                    marginBottom: "2rem",
                }}
            >
                {kpiCards.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <div
                            key={kpi.label}
                            style={{
                                backgroundColor: "#FFFFFF",
                                padding: "1.5rem",
                                borderRadius: "16px",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                                border: "1px solid #E5E7EB",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: "1rem",
                                }}
                            >
                                <div
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        backgroundColor: `${kpi.color}20`,
                                        borderRadius: "12px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Icon style={{ width: 24, height: 24, color: kpi.color }} />
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        color: kpi.trendUp ? "#22C55E" : "#EF4444",
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                    }}
                                >
                                    {kpi.trendUp ? (
                                        <ArrowUpRight style={{ width: 16, height: 16 }} />
                                    ) : (
                                        <ArrowDownRight style={{ width: 16, height: 16 }} />
                                    )}
                                    {kpi.trend}
                                </div>
                            </div>
                            <p style={{ fontSize: "2rem", fontWeight: 700, color: "#222222" }}>
                                {kpi.value}
                                <span style={{ fontSize: "1rem", fontWeight: 400, color: "#7A7A7A", marginLeft: "4px" }}>
                                    {kpi.unit}
                                </span>
                            </p>
                            <p style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>{kpi.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Sales by Category & Recent Transactions */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                    gap: "1.5rem",
                }}
            >
                {/* Sales by Category */}
                <div
                    style={{
                        backgroundColor: "#FFFFFF",
                        padding: "1.5rem",
                        borderRadius: "16px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        border: "1px solid #E5E7EB",
                    }}
                >
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#222222", marginBottom: "1.5rem" }}>
                        Ventes par catégorie
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {salesByCategory.map((item) => (
                            <div key={item.category}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span style={{ color: "#374151", fontWeight: 500 }}>{item.category}</span>
                                    <span style={{ color: "#222222", fontWeight: 600 }}>{item.amount} DT</span>
                                </div>
                                <div
                                    style={{
                                        height: "8px",
                                        backgroundColor: "#F3F4F6",
                                        borderRadius: "100px",
                                        overflow: "hidden",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${item.percentage}%`,
                                            height: "100%",
                                            backgroundColor: "#E8A87C",
                                            borderRadius: "100px",
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div
                    style={{
                        backgroundColor: "#FFFFFF",
                        padding: "1.5rem",
                        borderRadius: "16px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        border: "1px solid #E5E7EB",
                    }}
                >
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#222222", marginBottom: "1.5rem" }}>
                        Transactions récentes
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {recentTransactions.map((tx) => (
                            <div
                                key={tx.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "0.75rem",
                                    backgroundColor: "#F9FAFB",
                                    borderRadius: "12px",
                                }}
                            >
                                <div>
                                    <p style={{ fontWeight: 500, color: "#222222" }}>{tx.table}</p>
                                    <p style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>{tx.time}</p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <span
                                        style={{
                                            padding: "4px 8px",
                                            borderRadius: "100px",
                                            fontSize: "0.75rem",
                                            fontWeight: 500,
                                            backgroundColor: tx.status === "paid" ? "#DCFCE7" : "#FEF3C7",
                                            color: tx.status === "paid" ? "#166534" : "#92400E",
                                        }}
                                    >
                                        {tx.status === "paid" ? "Payé" : "En attente"}
                                    </span>
                                    <span style={{ fontWeight: 600, color: "#222222" }}>{tx.amount} DT</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
