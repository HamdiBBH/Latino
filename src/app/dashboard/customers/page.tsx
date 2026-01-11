"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Crown, Star, Award, Users, ArrowLeft, TrendingUp, Gift, Search } from "lucide-react";
import { getTopCustomers, getLoyaltyStats, type Customer } from "@/app/actions/loyalty";
import { getLoyaltyTier } from "@/lib/loyalty-utils";
import { CustomerProfile, LoyaltyBadge } from "@/components/admin/CustomerProfile";

const tierColors = {
    bronze: { bg: "#FED7AA", text: "#9A3412" },
    silver: { bg: "#E5E7EB", text: "#374151" },
    gold: { bg: "#FEF3C7", text: "#92400E" },
    platinum: { bg: "#E0E7FF", text: "#3730A3" },
};

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [stats, setStats] = useState<{
        totalCustomers: number;
        repeatCustomers: number;
        repeatRate: number;
        tierCounts: { bronze: number; silver: number; gold: number; platinum: number };
        totalPoints: number;
        totalSpent: number;
    } | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [customersData, statsData] = await Promise.all([
            getTopCustomers(50),
            getLoyaltyStats()
        ]);
        setCustomers(customersData);
        setStats(statsData);
        setLoading(false);
    };

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ display: "flex", gap: "2rem" }}>
            {/* Main content */}
            <div style={{ flex: 1 }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.5rem" }}>
                            <Crown style={{ width: 32, height: 32, color: "#F59E0B" }} />
                            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#222" }}>
                                Programme Fidélité
                            </h1>
                        </div>
                        <p style={{ color: "#7A7A7A" }}>
                            Gérez vos clients fidèles et leurs avantages
                        </p>
                    </div>
                    <Link
                        href="/dashboard/reservations"
                        style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "10px 20px", backgroundColor: "#F3F4F6",
                            borderRadius: "100px", color: "#222", textDecoration: "none",
                            fontWeight: 500
                        }}
                    >
                        <ArrowLeft style={{ width: 18, height: 18 }} />
                        Réservations
                    </Link>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                        <div style={{ backgroundColor: "#FFF", padding: "1.5rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
                                <Users style={{ width: 20, height: 20, color: "#E8A87C" }} />
                                <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>Clients</span>
                            </div>
                            <p style={{ fontSize: "2rem", fontWeight: 700, color: "#222" }}>{stats.totalCustomers}</p>
                        </div>
                        <div style={{ backgroundColor: "#FFF", padding: "1.5rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
                                <TrendingUp style={{ width: 20, height: 20, color: "#22C55E" }} />
                                <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>Taux fidélité</span>
                            </div>
                            <p style={{ fontSize: "2rem", fontWeight: 700, color: "#22C55E" }}>{stats.repeatRate}%</p>
                        </div>
                        <div style={{ backgroundColor: "#FFF", padding: "1.5rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
                                <Gift style={{ width: 20, height: 20, color: "#6366F1" }} />
                                <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>Points distribués</span>
                            </div>
                            <p style={{ fontSize: "2rem", fontWeight: 700, color: "#6366F1" }}>{stats.totalPoints}</p>
                        </div>
                        <div style={{ backgroundColor: "#FFF", padding: "1.5rem", borderRadius: "16px", border: "1px solid #E5E7EB" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
                                <Star style={{ width: 20, height: 20, color: "#F59E0B" }} />
                                <span style={{ fontSize: "0.875rem", color: "#7A7A7A" }}>CA Total</span>
                            </div>
                            <p style={{ fontSize: "2rem", fontWeight: 700, color: "#222" }}>{stats.totalSpent} <span style={{ fontSize: "1rem" }}>DT</span></p>
                        </div>
                    </div>
                )}

                {/* Tier breakdown */}
                {stats && (
                    <div style={{ display: "flex", gap: "8px", marginBottom: "2rem" }}>
                        {Object.entries(stats.tierCounts).map(([tier, count]) => (
                            <div key={tier} style={{
                                flex: 1, padding: "0.75rem 1rem", borderRadius: "12px",
                                backgroundColor: tierColors[tier as keyof typeof tierColors].bg,
                                textAlign: "center"
                            }}>
                                <p style={{ fontSize: "1.25rem", fontWeight: 700, color: tierColors[tier as keyof typeof tierColors].text }}>
                                    {count}
                                </p>
                                <p style={{ fontSize: "0.75rem", color: tierColors[tier as keyof typeof tierColors].text, textTransform: "capitalize" }}>
                                    {tier}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Search */}
                <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                    <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: "#9CA3AF" }} />
                    <input
                        type="text"
                        placeholder="Rechercher un client..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: "100%", padding: "12px 12px 12px 44px",
                            border: "1px solid #E5E7EB", borderRadius: "12px",
                            fontSize: "0.875rem"
                        }}
                    />
                </div>

                {/* Customer list */}
                <div style={{ backgroundColor: "#FFF", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
                    {loading ? (
                        <div style={{ padding: "2rem", textAlign: "center" }}>
                            <p style={{ color: "#7A7A7A" }}>Chargement...</p>
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div style={{ padding: "2rem", textAlign: "center" }}>
                            <Users style={{ width: 48, height: 48, color: "#E5E7EB", margin: "0 auto 1rem" }} />
                            <p style={{ color: "#7A7A7A" }}>Aucun client trouvé</p>
                        </div>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", color: "#7A7A7A", fontWeight: 500 }}>Client</th>
                                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "0.75rem", color: "#7A7A7A", fontWeight: 500 }}>Niveau</th>
                                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "0.75rem", color: "#7A7A7A", fontWeight: 500 }}>Visites</th>
                                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "0.75rem", color: "#7A7A7A", fontWeight: 500 }}>Points</th>
                                    <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.75rem", color: "#7A7A7A", fontWeight: 500 }}>Total dépensé</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((customer) => {
                                    const tier = getLoyaltyTier(customer.visit_count);
                                    return (
                                        <tr
                                            key={customer.id}
                                            onClick={() => setSelectedCustomer(customer)}
                                            style={{
                                                borderBottom: "1px solid #F3F4F6",
                                                cursor: "pointer",
                                                backgroundColor: selectedCustomer?.id === customer.id ? "#F9F5F0" : "transparent"
                                            }}
                                        >
                                            <td style={{ padding: "12px 16px" }}>
                                                <p style={{ fontWeight: 500, color: "#222" }}>{customer.name || "—"}</p>
                                                <p style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>{customer.email}</p>
                                            </td>
                                            <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                                <span style={{
                                                    display: "inline-block", padding: "4px 12px", borderRadius: "100px",
                                                    backgroundColor: tierColors[tier].bg, color: tierColors[tier].text,
                                                    fontSize: "0.75rem", fontWeight: 500, textTransform: "capitalize"
                                                }}>
                                                    {tier}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 500 }}>
                                                {customer.visit_count}
                                            </td>
                                            <td style={{ padding: "12px 16px", textAlign: "center", color: "#E8A87C", fontWeight: 500 }}>
                                                {customer.loyalty_points}
                                            </td>
                                            <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600 }}>
                                                {customer.total_spent} DT
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Right sidebar - Customer detail */}
            <div style={{ width: 360, flexShrink: 0 }}>
                {selectedCustomer ? (
                    <div style={{ position: "sticky", top: 20 }}>
                        <CustomerProfile
                            email={selectedCustomer.email}
                            onClose={() => setSelectedCustomer(null)}
                        />
                    </div>
                ) : (
                    <div style={{
                        padding: "3rem 2rem", backgroundColor: "#FFF", borderRadius: "16px",
                        border: "1px solid #E5E7EB", textAlign: "center"
                    }}>
                        <Users style={{ width: 48, height: 48, color: "#E5E7EB", margin: "0 auto 1rem" }} />
                        <p style={{ color: "#7A7A7A", marginBottom: "0.5rem" }}>Sélectionnez un client</p>
                        <p style={{ fontSize: "0.875rem", color: "#9CA3AF" }}>
                            pour voir son profil fidélité
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
